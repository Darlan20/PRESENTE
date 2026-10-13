import { useEffect, useRef, useState } from 'react'

function buildWsUrl() {
  const explicit = import.meta.env.VITE_WS_URL
  if (explicit) {
    const value = String(explicit)
    // Evita placeholder em produção (causa erro no console)
    if (value.includes('seu-backend.onrender.com')) return null
    return value
  }

  // Sem VITE_WS_URL explícito, não tentamos WebSocket.
  // O backend usa SockJS/STOMP em `/ws`, não WebSocket "cru".
  return null
}

export function useRealtimeTickets({
  fetchFn,
  onNewTicket,
  pollingMs = 10000,
}) {
  const [connectionType, setConnectionType] = useState('polling')
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const knownIdsRef = useRef(new Set())
  const fetchFnRef = useRef(fetchFn)
  const onNewTicketRef = useRef(onNewTicket)

  useEffect(() => {
    fetchFnRef.current = fetchFn
  }, [fetchFn])

  useEffect(() => {
    onNewTicketRef.current = onNewTicket
  }, [onNewTicket])

  useEffect(() => {
    let intervalId
    let socket

    const hydrateKnownIds = async () => {
      const result = await fetchFnRef.current({ silent: false })
      const ids = (result || []).map((t) => t.id)
      knownIdsRef.current = new Set(ids)
    }

    const poll = async (isSilent = true) => {
      const result = await fetchFnRef.current({ silent: isSilent })
      const current = result || []

      const newTickets = current.filter((ticket) => !knownIdsRef.current.has(ticket.id))
      newTickets.forEach((ticket) => onNewTicketRef.current?.(ticket))

      knownIdsRef.current = new Set(current.map((t) => t.id))
    }

    const startPolling = () => {
      setConnectionType('polling')
      setIsRealtimeConnected(false)
      intervalId = setInterval(() => poll(true), pollingMs)
    }

    const startRealtime = async () => {
      await hydrateKnownIds()

      const wsUrl = buildWsUrl()
      if (!wsUrl) {
        startPolling()
        return
      }

      socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        setConnectionType('websocket')
        setIsRealtimeConnected(true)
      }

      socket.onmessage = async () => {
        await poll(true)
      }

      socket.onerror = () => {
        if (socket) socket.close()
      }

      socket.onclose = () => {
        setIsRealtimeConnected(false)
        startPolling()
      }
    }

    startRealtime().catch(() => startPolling())

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (socket) socket.close()
    }
  }, [pollingMs])

  return {
    connectionType,
    isRealtimeConnected,
  }
}
