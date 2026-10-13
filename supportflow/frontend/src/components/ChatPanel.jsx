import React, { useEffect, useState, useRef, useCallback } from 'react'
import { MessageSquare, Send, Plus, X, Loader2, Download, ZoomIn } from 'lucide-react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import api, { API_BASE_URL, getApiErrorMessage } from '../services/api'
import { toast } from 'sonner'

// Origem do backend (sem o sufixo /api), usada para montar URLs absolutas
// de recursos que o backend devolve como caminho relativo (ex.: anexos).
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

// O backend retorna Attachment.url como caminho relativo (ex.: "/api/chats/uploads/x.png").
// Um <a href> com esse valor resolve contra a origem do FRONTEND (Vercel), não do backend
// (Render), então o link quebra (ou, com o SPA fallback, recarrega o próprio app).
// Aqui montamos a URL absoluta apontando para o backend correto.
const resolveAttachmentUrl = (url) => {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|svg)$/i
const isImageAttachment = (a) => IMAGE_EXT_RE.test(a?.filename || a?.url || '')
const isImageFile = (file) => file?.type?.startsWith('image/')

// Baixa o blob e dispara o "Salvar como" nativo do navegador — funciona mesmo
// com o arquivo vindo de outra origem (Render), porque o <a download> só é
// respeitado pelo navegador quando aponta para um blob same-origin.
const triggerBlobDownload = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename || 'arquivo'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

// Anexo de mensagem: imagens carregam uma prévia (autenticada) e podem ser
// abertas em tela cheia; qualquer outro tipo vira um botão de download direto.
// O endpoint de upload do chat exige JWT — por isso não dá pra usar <a href>
// puro (o navegador não manda o token numa navegação normal).
function ChatAttachment({ attachment, own, onPreview }) {
  const url = resolveAttachmentUrl(attachment.url)
  const isImage = isImageAttachment(attachment)
  const [blobUrl, setBlobUrl] = useState(null)
  const [status, setStatus] = useState(isImage ? 'loading' : 'idle')

  useEffect(() => {
    if (!isImage) return
    let cancelled = false
    let localObjectUrl = null
    setStatus('loading')
    api.get(url, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return
        localObjectUrl = URL.createObjectURL(res.data)
        setBlobUrl(localObjectUrl)
        setStatus('ready')
      })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => {
      cancelled = true
      if (localObjectUrl) URL.revokeObjectURL(localObjectUrl)
    }
  }, [url, isImage])

  const handleDownload = async (e) => {
    e.stopPropagation()
    try {
      // Reaproveita o blob da prévia já carregada em vez de baixar de novo.
      const blob = blobUrl ? await (await fetch(blobUrl)).blob() : (await api.get(url, { responseType: 'blob' })).data
      triggerBlobDownload(blob, attachment.filename)
    } catch {
      toast.error('Não foi possível baixar o arquivo.')
    }
  }

  if (!isImage) {
    return (
      <button
        type="button"
        onClick={handleDownload}
        className={`flex items-center gap-1 text-xs underline ${own ? 'text-blue-100' : 'text-blue-600'}`}
      >
        📎 {attachment.filename}
      </button>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex h-24 w-28 items-center justify-center rounded-lg bg-black/5">
        <Loader2 size={16} className="animate-spin text-slate-400" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        className={`flex items-center gap-1 text-xs underline ${own ? 'text-blue-100' : 'text-blue-600'}`}
      >
        📎 {attachment.filename} (baixar)
      </button>
    )
  }

  return (
    <div className="group relative inline-block">
      <img
        src={blobUrl}
        alt={attachment.filename}
        onClick={() => onPreview({ url: blobUrl, filename: attachment.filename })}
        className="max-h-40 max-w-[200px] cursor-zoom-in rounded-lg border border-black/10 object-cover"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors group-hover:bg-black/20">
        <ZoomIn size={18} className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <button
        type="button"
        onClick={handleDownload}
        title="Baixar imagem"
        className="pointer-events-auto absolute bottom-1 right-1 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
      >
        <Download size={13} />
      </button>
    </div>
  )
}

export function ChatPanel({ open, onClose, chamadoId, chatId, user }) {
  const [messages, setMessages]     = useState([])
  const [text, setText]             = useState('')
  // Cada item: { file, previewUrl } — previewUrl é um object URL local (não
  // sobe pro backend) usado só pra mostrar a miniatura antes de enviar.
  const [files, setFiles]           = useState([])
  const [chatInfo, setChatInfo]     = useState(null)
  const [activeChatId, setActiveChatId] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [loadError, setLoadError]   = useState('')
  const [lightbox, setLightbox]     = useState(null) // { url, filename }
  const stompRef     = useRef(null)
  const messagesEnd  = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => { scrollToBottom() }, [messages])

  // Libera os object URLs das prévias locais ao desmontar (evita vazar memória).
  useEffect(() => () => {
    files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl) })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na desmontagem
  }, [])

  const addFiles = (fileList) => {
    const next = Array.from(fileList).map((file) => ({
      file,
      previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
    }))
    setFiles(prev => [...prev, ...next])
  }

  const removeFile = (index) => {
    setFiles(prev => {
      const removed = prev[index]
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((_, idx) => idx !== index)
    })
  }

  // Reset + load ao abrir
  useEffect(() => {
    if (!open) {
      setMessages([]); setChatInfo(null); setActiveChatId(null); setLoadError('')
      return
    }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLoadError('')
      try {
        let id = chatId
        if (chamadoId) {
          const res = await api.get(`/chats/by-chamado/${chamadoId}`)
          if (cancelled) return
          setChatInfo(res.data)
          id = res.data.id ?? id
        }
        if (id) {
          setActiveChatId(id)
          const res = await api.get(`/chats/${id}/messages`)
          if (!cancelled) setMessages(res.data || [])
        }
      } catch (e) {
        toast.error(getApiErrorMessage(e, 'Não foi possível carregar o chat.'))
        if (cancelled) return

        const base = String(API_BASE_URL || '')
        const isPlaceholder = base.includes('seu-backend.onrender.com')
        const isLocalhost = base.includes('localhost')
        const isProdHost = typeof window !== 'undefined' && window.location?.hostname && window.location.hostname !== 'localhost'

        if (isPlaceholder || (isProdHost && isLocalhost)) {
          setLoadError('Backend não configurado. Ajuste VITE_API_URL no Vercel para a URL do seu backend no Render (com ou sem /api) e faça redeploy.')
        } else if (e?.response?.status === 401) {
          setLoadError('Sua sessão expirou. Faça login novamente e tente abrir o chat.')
        } else if (e?.response?.status === 403) {
          setLoadError('Acesso negado (403). Verifique se você está logado e se o backend está aceitando o domínio do Vercel (FRONTEND_URL no Render).')
        } else {
          setLoadError(getApiErrorMessage(e, 'Não foi possível carregar o chat. Verifique a conexão com o servidor.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [open, chatId, chamadoId])

  // STOMP
  useEffect(() => {
    if (!open || !activeChatId) return
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_ORIGIN}/ws`),
      reconnectDelay: 3000,
    })
    client.onConnect = () => {
      client.subscribe(`/topic/chats/${activeChatId}`, (msg) => {
        try {
          const body = JSON.parse(msg.body)
          setMessages(prev => {
            if (prev.some(m => m.id === body.id)) return prev

            // Se a mensagem chegou via STOMP e existe uma otimista equivalente,
            // troca a otimista pela salva (evita duplicar e "sumir")
            const tempIndex = prev.findIndex(m =>
              typeof m?.id === 'string' &&
              m.id.startsWith('temp-') &&
              String(m.senderId) === String(body.senderId) &&
              String(m.content ?? '') === String(body.content ?? '')
            )
            if (tempIndex >= 0) {
              const next = [...prev]
              next[tempIndex] = body
              return next
            }

            return [...prev, body]
          })
        } catch { toast.error('Erro ao processar mensagem recebida pelo chat.') }
      })
    }
    client.activate()
    stompRef.current = client
    return () => {
      try { client.deactivate() } catch { /* já desconectado */ }
    }
  }, [open, activeChatId])

  const handleSend = useCallback(async () => {
    if (chatInfo?.closed || (!text.trim() && files.length === 0)) return
    const id = activeChatId || chatId
    if (!id) return

    // Envio otimista
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId,
      senderId: String(user?.id || 'system'),
      senderName: user?.nome || user?.name || 'Você',
      content: text,
      createdAt: new Date().toISOString(),
      attachments: [],
    }
    const sentText  = text
    const sentFiles = files
    setMessages(prev => [...prev, optimistic])
    setText(''); setFiles([])
    // As prévias locais já foram enviadas (ou descartadas) — libera a memória.
    sentFiles.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl) })
    if (fileInputRef.current) fileInputRef.current.value = ''

    try {
      const form = new FormData()
      const senderId = String(user?.id || user?.usuarioId || 'system').trim()
      const senderName = String(user?.nome || user?.name || 'Usuário').trim()

      form.append('senderId',   senderId)
      form.append('senderName', senderName)
      form.append('content', sentText)
      sentFiles.forEach(f => form.append('files', f.file))
      
      // envio efetuado (silencioso)
      
      const res = await api.post(`/chats/${id}/messages`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const saved = res?.data
      if (saved?.id) {
        setMessages(prev => {
          const replaced = prev.map(m => (m.id === tempId ? saved : m))
          const seen = new Set()
          return replaced.filter(m => {
            const key = String(m?.id)
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
        })
      }
    } catch {
      toast.error('Falha ao enviar mensagem. Verifique sua conexão e tente novamente.')
      // Não remove a mensagem otimista para não "sumir" depois de enviar.
      // (Se a requisição falhar, o STOMP também não vai confirmar, mas o usuário
      // não perde o conteúdo digitado no histórico.)
    }
  }, [chatInfo, text, files, activeChatId, chatId, user])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const isOwn = (msg) => String(msg.senderId) === String(user?.id)

  if (!open) return null

  return (
    <>
    <div
      className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 w-[92vw] sm:w-95 bg-white rounded-2xl shadow-xl flex flex-col border border-slate-200"
      style={{ height: '60vh', maxHeight: 520 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-800">
            Chat — Chamado #{chamadoId || activeChatId}
          </h3>
          {chatInfo?.closed && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium">
              Encerrado
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-2.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <X size={18} />
        </button>
      </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : loadError ? (
            <div className="flex items-center justify-center h-full text-center text-sm text-slate-500 px-6">
              {loadError}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Nenhuma mensagem ainda. Inicie a conversa!
            </div>
          ) : (
            messages.map((m) => {
              const own = isOwn(m)
              return (
                <div key={m.id} className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}>
                  {!own && (
                    <span className="text-xs text-slate-500 mb-1 ml-1">{m.senderName}</span>
                  )}
                  <div className={`max-w-xs sm:max-w-md px-3 py-2 rounded-2xl text-sm shadow-sm ${
                    own
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                  }`}>
                    {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                    {m.attachments?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {m.attachments.map((a) => (
                          <ChatAttachment key={a.id} attachment={a} own={own} onPreview={setLightbox} />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 mx-1">
                    {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t bg-white shrink-0">
          {chatInfo?.closed ? (
            <p className="text-center text-sm text-slate-500 py-1">
              🔒 Chat encerrado — somente leitura.
            </p>
          ) : (
            <div className="space-y-2">
              {files.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {files.map((f, i) => (
                    f.previewUrl ? (
                      <span key={i} className="group relative inline-block">
                        <img src={f.previewUrl} alt={f.file.name} className="h-14 w-14 rounded-lg border border-slate-200 object-cover" />
                        <button
                          onClick={() => removeFile(i)}
                          title="Remover"
                          className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-700 p-0.5 text-white shadow hover:bg-red-600"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ) : (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 rounded-full px-2 py-0.5">
                        📎 {f.file.name}
                        <button onClick={() => removeFile(i)}>
                          <X size={10} className="text-slate-400 hover:text-red-500" />
                        </button>
                      </span>
                    )
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escreva uma mensagem... (Enter para enviar)"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <label className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer shrink-0 transition-colors">
                  <Plus size={18} className="text-slate-600" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleSend}
                  disabled={!text.trim() && files.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </div>
            </div>
          )}
        </div>

    </div>

    {lightbox && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
        onClick={() => setLightbox(null)}
      >
        <button
          onClick={() => setLightbox(null)}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <X size={20} />
        </button>
        <img
          src={lightbox.url}
          alt={lightbox.filename}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        />
        <button
          onClick={async (e) => {
            e.stopPropagation()
            try {
              const res = await fetch(lightbox.url)
              const blob = await res.blob()
              triggerBlobDownload(blob, lightbox.filename)
            } catch {
              toast.error('Não foi possível baixar o arquivo.')
            }
          }}
          className="absolute bottom-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-lg hover:bg-slate-100"
        >
          <Download size={15} /> Baixar imagem
        </button>
      </div>
    )}
  </>
  )
}
