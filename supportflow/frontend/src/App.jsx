/**
 * App.jsx — Componente raiz da aplicação.
 * ✅ Agora com AuthProvider para segurança centralizada
 * Define as rotas principais e renderiza o sistema de notificações (Toaster).
 */
import React, { Suspense, useEffect, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
const LoginPage = lazy(() => import('./pages/LoginPage'))
const UsuarioPage = lazy(() => import('./pages/UsuarioPage'))
const TecnicoPage = lazy(() => import('./pages/TecnicoPage'))
const GestorPage = lazy(() => import('./pages/GestorPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
import { Toaster } from './components/ui/Toaster'
import { toast } from 'sonner'
import './styles/global.css'

const DevAuthDebug = import.meta.env.DEV ? lazy(() => import('./pages/DevAuthDebug.jsx')) : null

const getRouteByRole = (tipo) => {
  if (tipo === 'USUARIO') return '/usuario'
  if (tipo === 'TECNICO') return '/tecnico'
  if (tipo === 'GESTOR') return '/gestor'
  return '/'
}

function PublicOnly({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAuth()
  
  if (isCheckingAuth) {
    return <div>Carregando...</div>
  }
  
  if (isAuthenticated) {
    const user = JSON.parse(sessionStorage.getItem('authUser') || '{}')
    return <Navigate to={getRouteByRole(user?.tipo)} replace />
  }
  
  return children
}

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, isCheckingAuth } = useAuth()

  if (isCheckingAuth) {
    return <div>Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (roles && !roles.includes(user?.tipo)) {
    return <Navigate to={getRouteByRole(user?.tipo)} replace />
  }

  return children
}

function AppContent() {
  useEffect(() => {
    const handleOffline = () => {
      toast.error('Você está offline. Algumas ações podem não funcionar até a conexão voltar.')
    }

    const handleOnline = () => {
      toast.success('Conexão restabelecida.')
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return (
    <Router>
      <Toaster />
      <Suspense fallback={<div className="sf-route-loading" role="status">Carregando tela…</div>}>
      <Routes>
        <Route path="/" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/planos" element={<PricingPage />} />
        <Route path="/usuario" element={<PrivateRoute roles={['USUARIO']}><UsuarioPage /></PrivateRoute>} />
        <Route path="/tecnico" element={<PrivateRoute roles={['TECNICO']}><TecnicoPage /></PrivateRoute>} />
        <Route path="/gestor" element={<PrivateRoute roles={['GESTOR']}><GestorPage /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        {import.meta.env.DEV && DevAuthDebug && (
          <Route
            path="/debug-auth"
            element={
              <Suspense fallback={<div>Carregando...</div>}>
                <DevAuthDebug />
              </Suspense>
            }
          />
        )}
      </Routes>
      </Suspense>
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App