import React, { useState } from 'react'
import api, { API_BASE_URL } from '../services/api'
import { toast } from 'sonner'

// Página de debug para testar refresh token / interceptor localmente (DEV only)
export default function DevAuthDebug() {
  const [status, setStatus] = useState('idle')

  const forceExpiredTokenAndRequest = async () => {
    try {
      setStatus('setting-expired')

      // If no refresh token present, instruct the user
      const refresh = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken')
      if (!refresh) {
        toast.error('Nenhum refresh token encontrado. Faça login primeiro.')
        setStatus('no-refresh')
        return
      }

      // Create a fake expired access token by decoding current and setting exp in the past
      const current = sessionStorage.getItem('authToken') || localStorage.getItem('token')
      if (!current) {
        toast.error('Nenhum access token encontrado. Faça login primeiro.')
        setStatus('no-access')
        return
      }

      // Build a minimal JWT with expired exp
      const parts = (current || '').split('.')
      let header = { alg: 'HS256', typ: 'JWT' }
      let payload = { exp: Math.floor(Date.now() / 1000) - 60 }
      try {
        if (parts.length === 3) {
          const raw = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
          const parsed = JSON.parse(raw)
          payload = { ...parsed, exp: Math.floor(Date.now() / 1000) - 60 }
        }
      } catch {
        // ignore parsing errors, use minimal payload
      }

      const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
      const fake = `${b64(header)}.${b64(payload)}.signature`
      sessionStorage.setItem('authToken', fake)
      localStorage.setItem('token', fake)

      toast.success('Access token marcado como expirado. Fazendo requisição protegida...')
      setStatus('requesting')

      // Trigger a protected request to force interceptor refresh
      try {
        const res = await api.get('/chamados/meus')
        toast.success('Requisição concluída com sucesso (status ' + (res.status || 'OK') + ')')
        setStatus('success')
      } catch (err) {
        const msg = err?.response?.status ? `Erro ${err.response.status}` : 'Falha na requisição'
        toast.error('Requisição falhou: ' + msg)
        setStatus('failed')
      }
    } catch (e) {
      toast.error('Erro no teste: ' + (e?.message || e))
      setStatus('error')
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Dev Auth Debug (apenas DEV)</h2>
      <p className="text-sm text-slate-600 mb-4">Marca o access token como expirado e faz uma requisição protegida para validar o fluxo de refresh.</p>
      <div className="space-x-2">
        <button onClick={forceExpiredTokenAndRequest} className="px-4 py-2 bg-blue-600 text-white rounded">Rodar teste de refresh</button>
      </div>
      <div className="mt-4 text-sm">Status: {status}</div>
      <div className="mt-6 text-xs text-slate-500">API base: {API_BASE_URL}</div>
    </div>
  )
}
