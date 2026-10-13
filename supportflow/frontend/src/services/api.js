/**
 * api.js — Configuração do cliente HTTP (Axios).ssss
 * Define a base URL, interceptors de JWT para autenticação automática,
 * e exporta os métodos de autenticação (login, register, test),
 * gerenciamento de chamados e perfil do usuário.
 */
import axios from 'axios'
import { toast } from 'sonner'

// Em produção, defina VITE_API_URL no painel do Vercel/Netlify
const normalizeApiBaseUrl = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''

  // Permitir base relativa (ex.: "/api") sem mexer
  if (raw.startsWith('/')) {
    return raw.replace(/\/+$/, '')
  }

  // Se já termina com /api (com ou sem barra), manter
  if (/\/api\/?$/i.test(raw)) {
    return raw.replace(/\/+$/, '')
  }

  // Caso comum: usuário define só o host do backend
  return raw.replace(/\/+$/, '') + '/api'
}

const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
const fallbackApiBaseUrl = isLocalHost ? 'http://localhost:8080/api' : ''

const envUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)
export const API_BASE_URL = envUrl || fallbackApiBaseUrl

// ⚠️ Aviso se em produção sem VITE_API_URL configurado
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !envUrl) {
  console.error(
    '⚠️ VITE_API_URL não configurado em produção! ' +
    `Nenhuma API será chamada até VITE_API_URL ser configurada. ` +
    'Configure VITE_API_URL no Vercel com a URL pública do backend desta implantação, terminada em /api.'
  )
}

let networkToastAt = 0
// Note: verbose debug output disabled to avoid leaking tokens in console

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const JWT_REFRESH_SKEW_MS = 2 * 60 * 1000

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export const isAccessTokenExpiringSoon = (token, skewMs = JWT_REFRESH_SKEW_MS) => {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false

  const expiresAtMs = payload.exp * 1000
  return expiresAtMs - Date.now() <= skewMs
}

export const refreshAccessToken = async () => {
  const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken')
  if (!refreshToken) {
    return null
  }

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh-token`,
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` } }
  )

  const newAccessToken = response.data.accessToken || response.data.token
  if (!newAccessToken) {
    throw new Error('Refresh retornou sem access token')
  }

  sessionStorage.setItem('authToken', newAccessToken)
  localStorage.setItem('token', newAccessToken)
  api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`

  return newAccessToken
}

const applyAuthorizationHeader = (config, token) => {
  if (!config || !token) return
  if (!config.headers) {
    config.headers = {}
  }

  // Axios v1 pode usar AxiosHeaders; set() mantém compatibilidade.
  if (typeof config.headers.set === 'function') {
    config.headers.set('Authorization', `Bearer ${token}`)
  } else {
    config.headers.Authorization = `Bearer ${token}`
  }
}

const maybeShowNetworkToast = (message) => {
  const now = Date.now()
  if (now - networkToastAt < 4000) {
    return
  }
  networkToastAt = now
  toast.error(message)
}

export const getApiErrorMessage = (error, fallback = 'Falha na requisição.') => {
  if (!error.response) {
    try {
      const isBrowser = typeof window !== 'undefined'
      const hostname = isBrowser ? window.location.hostname : ''
      const isProdHost = isBrowser && hostname && hostname !== 'localhost'
      const base = String(API_BASE_URL || '')

      if (isProdHost && (base.includes('localhost:8080') || base.includes('127.0.0.1'))) {
        return '❌ VITE_API_URL não configurado no Vercel! No painel do Vercel, defina VITE_API_URL com a URL pública do seu backend em Render (ex: https://your-backend.onrender.com/api) e redeploy o frontend.'
      }

      if (base.includes('seu-backend.onrender.com')) {
        return 'Backend está com URL placeholder. Ajuste VITE_API_URL no Vercel para a URL real do seu backend no Render (com ou sem /api) e faça redeploy.'
      }
    } catch {
      // ignora
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'Sem conexão com a internet. Verifique sua rede e tente novamente.'
    }
    return 'Não foi possível conectar ao servidor. Verifique se o backend está no ar e se FRONTEND_URL (Render) e VITE_API_URL (Vercel) estão configurados.'
  }

  const status = error.response.status
  const dataMessage = typeof error.response.data === 'string' ? error.response.data : null
  if (dataMessage) {
    return dataMessage
  }

  if (status >= 500) return 'Servidor indisponível no momento. Tente novamente em instantes.'
  if (status === 403) return 'Você não tem permissão para realizar esta ação.'
  if (status === 404) return 'Recurso não encontrado.'
  if (status === 400) return 'Dados inválidos. Revise os campos e tente novamente.'

  return fallback
}

// ✅ Interceptor de request: SEMPRE lê o token mais recente do sessionStorage.
// Isso garante que após o refresh, o retry use o novo access token automaticamente.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('token')
    if (token) {
      applyAuthorizationHeader(config, token)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Interceptor de response: renova access token automaticamente quando expira
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    // minimal logging; avoid printing headers or tokens

    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh-token')
    const suppressNetworkToast = originalRequest?.suppressNetworkToast

    // Se não for 401 ou já tentou refresh, rejeitar normalmente
    if (error.response?.status !== 401 || originalRequest?._retry || isRefreshEndpoint) {
      if (!error.response && !suppressNetworkToast) {
        const message = getApiErrorMessage(error)
        maybeShowNetworkToast(message)
      }
      return Promise.reject(error)
    }

    // Token expirado — tentar renovar com refresh token
    const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken')

    // do not log refresh token presence

    if (!refreshToken) {
      // no refresh token -> force logout
      // Sem refresh token, deslogar
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('authUser')
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
      return Promise.reject(error)
    }

    // Se já está renovando, adicionar à fila e aguardar
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((queuedToken) => {
          if (queuedToken) {
            applyAuthorizationHeader(originalRequest, queuedToken)
          }
          return api(originalRequest)
        })
        .catch(err => Promise.reject(err))
    }

    // Iniciar renovação
    isRefreshing = true
    originalRequest._retry = true

    try {
      // attempt refresh
      const newAccessToken = await refreshAccessToken()

      // Liberar fila de requests que estavam aguardando
      processQueue(null, newAccessToken)

      // ✅ Retentar request original — o interceptor de request vai adicionar o token novo
      applyAuthorizationHeader(originalRequest, newAccessToken)
      return api(originalRequest)
    } catch (err) {
      // Refresh falhou — deslogar completamente
      processQueue(err, null)

      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('refreshToken')
      sessionStorage.removeItem('authUser')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('usuario')

      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export const authAPI = {
  login: (credentials, config = {}) => api.post('/auth/login', credentials, config),
  test: () => api.get('/auth/teste'),
  recuperarSenha: (email) => api.post('/auth/recuperar-senha', { email }),
  resetarSenha: (token, novaSenha) => api.post('/auth/resetar-senha', { token, novaSenha }),
  enviarEmail: (emailData) => api.post('/auth/send-email', emailData),
  refreshToken: () => {
    const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken')
    return axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    )
  },
}

// Gerenciamento de usuários — apenas GESTOR
export const usuarioAPI = {
  criar: (userData) => api.post('/auth/registrar', userData),
  listar: () => api.get('/usuarios'),
  deletar: (id) => api.delete(`/usuarios/${id}`),
}

// Perfil do usuário logado
export const perfilAPI = {
  buscar: () => api.get('/perfil'),
  atualizar: (nome, fotoUrl, setorAtendimento) => api.put('/perfil', { nome, fotoUrl, setorAtendimento }),
  trocarSenha: (senhaAtual, novaSenha) => api.post('/perfil/trocar-senha', { senhaAtual, novaSenha }),
  buscarPreferencias: () => api.get('/perfil/preferencias'),
  atualizarPreferencias: (prefs) => api.put('/perfil/preferencias', prefs),
  logoutAll: () => api.post('/perfil/logout-all'),
  deletarConta: () => api.delete('/perfil'),
}

// Chamados (tickets) — sincronizados com o banco via backend
export const chamadoAPI = {
  listarTodos: (config = {}) => api.get('/chamados', config),
  listarTodosPaginado: (page = 0, size = 10) => api.get('/chamados', { params: { page, size } }),
  listarMeus: (config = {}) => api.get('/chamados/meus', config),
  criar: (chamado) => api.post('/chamados', chamado),
  atualizar: (id, chamado) => api.put(`/chamados/${id}`, chamado),
  deletar: (id) => api.delete(`/chamados/${id}`),
  getChatByChamado: (chamadoId) => api.get(`/chats/by-chamado/${chamadoId}`),
}

// Lixeira / histórico de chamados
chamadoAPI.listarLixeira = (page = 0, size = 20) => api.get('/chamados/trash', { params: { page, size } })
chamadoAPI.recuperar = (id) => api.put(`/chamados/${id}/recover`)
chamadoAPI.deletarPermanentemente = (id) => api.delete(`/chamados/${id}/permanent`)

export const localizacaoAPI = {
  listar: () => api.get('/localizacoes'),
  criar: (localizacao) => api.post('/localizacoes', localizacao),
  atualizar: (id, localizacao) => api.put(`/localizacoes/${id}`, localizacao),
  deletar: (id) => api.delete(`/localizacoes/${id}`),
  renomearSetor: (setorAtual, localizacao) => api.put(`/localizacoes/setor/${encodeURIComponent(setorAtual)}`, localizacao),
  deletarSetor: (setor) => api.delete(`/localizacoes/setor/${encodeURIComponent(setor)}`),
}

export default api