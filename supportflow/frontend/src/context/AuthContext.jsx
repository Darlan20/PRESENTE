/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { authAPI, perfilAPI } from '../services/api'
import { toast } from 'sonner'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const clearAuthStorage = useCallback(() => {
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('authUser')
    sessionStorage.removeItem('refreshToken')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('usuario')
  }, [])

  const restoreAuth = useCallback(async () => {
    const savedToken = sessionStorage.getItem('authToken') || localStorage.getItem('token')
    const savedUser = sessionStorage.getItem('authUser') || localStorage.getItem('usuario')

    if (!savedToken || !savedUser) {
      setIsCheckingAuth(false)
      return
    }

    try {
      const parsedUser = JSON.parse(savedUser)
      setToken(savedToken)
      setUser(parsedUser)

      // Valida o token antes de considerar a sessão realmente ativa.
      await perfilAPI.buscar()
    } catch {
      clearAuthStorage()
      setToken(null)
      setUser(null)

      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/'
      }
    } finally {
      setIsCheckingAuth(false)
    }
  }, [clearAuthStorage])

  // Carregar autenticação salva ao iniciar
  useEffect(() => {
    restoreAuth()
  }, [restoreAuth])

  // Sincronizar entre abas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        if (!e.newValue) {
          setToken(null)
          setUser(null)
        } else {
          setToken(e.newValue)
        }
      }

      if (e.key === 'authUser') {
        if (!e.newValue) {
          setUser(null)
        } else {
          try {
            setUser(JSON.parse(e.newValue))
          } catch {
            toast.error('Erro ao sincronizar usuário.')
          }
        }
      }

      // ✅ Sincronizar refresh token também
      if (e.key === 'refreshToken') {
        // Só sincronizar, não atualizar estado (refresh token não afeta renderização)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const isTransientLoginError = (error) => {
    if (!error.response) {
      return true
    }

    return error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK'
  }

  const login = async (email, senha) => {
    setIsLoading(true)
    try {
      const performLogin = () => authAPI.login({ email, senha }, { suppressNetworkToast: true })

      let response
      try {
        response = await performLogin()
      } catch (error) {
        if (!isTransientLoginError(error)) {
          throw error
        }

        await wait(1200)
        response = await performLogin()
      }

      const { token: newToken, accessToken, refreshToken, usuario } = response.data

      // ✅ Guardar access token (compatível com código antigo como 'token')
      const finalAccessToken = accessToken || newToken
      sessionStorage.setItem('authToken', finalAccessToken)
      localStorage.setItem('token', finalAccessToken)
      
      // ✅ Guardar refresh token (novo sistema)
      if (refreshToken) {
        sessionStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('refreshToken', refreshToken)
      }
      
      sessionStorage.setItem('authUser', JSON.stringify(usuario))
      localStorage.setItem('usuario', JSON.stringify(usuario))

      // Atualizar estado
      setToken(finalAccessToken)
      setUser(usuario)

      return { success: true, usuario }
    } catch (error) {
      toast.error('Falha ao fazer login. Verifique suas credenciais e tente novamente.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAuthStorage()
    setToken(null)
    setUser(null)
  }

  // ✨ NOVO: Atualizar user localmente (sem fazer request)
  const updateUserLocal = (updatedUser) => {
    const newUser = { ...user, ...updatedUser }
    sessionStorage.setItem('authUser', JSON.stringify(newUser))
    localStorage.setItem('usuario', JSON.stringify(newUser))
    setUser(newUser)
  }

  const value = {
    user,
    token,
    isLoading,
    isCheckingAuth,
    login,
    logout,
    updateUserLocal,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}