/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { toast } from 'sonner'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied')
  const [toggledOff, setToggledOff] = useState(() => localStorage.getItem('sf_notifications_disabled') === 'true')

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      toast.error('Este navegador não suporta notificações push.')
      return 'denied'
    }

    if (permission === 'granted' && !toggledOff) {
      setToggledOff(true)
      localStorage.setItem('sf_notifications_disabled', 'true')
      toast.info('Notificações pausadas.')
      return permission
    }

    if (toggledOff) {
      setToggledOff(false)
      localStorage.setItem('sf_notifications_disabled', 'false')
      if (permission === 'granted') {
        toast.success('Notificações reativadas.')
        return permission
      }
    }

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      toast.success('Notificações ativadas com sucesso.')
    } else {
      toast.warning('Notificações não foram permitidas.')
    }

    return result
  }, [permission, toggledOff])

  const isEnabled = permission === 'granted' && !toggledOff

  const notify = useCallback(({ title, body, tag }) => {
    if (typeof Notification === 'undefined') return
    if (!isEnabled) return

    const n = new Notification(title, {
      body,
      tag,
      icon: '/favicon.ico',
    })

    setTimeout(() => n.close(), 6000)
  }, [isEnabled])

  const value = useMemo(() => ({
    permission,
    isEnabled,
    requestPermission,
    notify,
  }), [permission, isEnabled, requestPermission, notify])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider')
  }
  return context
}
