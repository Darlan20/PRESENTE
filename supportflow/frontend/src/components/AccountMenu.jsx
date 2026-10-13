import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Home, LogOut, ShieldCheck, User, UserCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'

function getRoleLabel(tipo) {
  if (tipo === 'GESTOR') return 'Gestor'
  if (tipo === 'TECNICO') return 'Técnico'
  if (tipo === 'USUARIO') return 'Usuário'
  return 'Usuário'
}

function getInitials(nome) {
  if (!nome) return 'U'
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

export function AccountMenu({ user, onLogout, homePath = '/' }) {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const { isEnabled, permission, requestPermission } = useNotification()

  const roleLabel = useMemo(() => getRoleLabel(user?.tipo), [user?.tipo])
  const avatarSrc = user?.fotoUrl && !avatarError ? user.fotoUrl : null
  const initials = getInitials(user?.nome)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) {
        return
      }
      setOpen(false)
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const goTo = (path) => {
    setOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setOpen(false)
    onLogout()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-1.5 py-1 text-left text-white transition hover:bg-white/20"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu da conta"
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/15">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`Foto de ${user?.nome || 'usuário'}`}
              className="h-full w-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="text-xs font-semibold tracking-wide text-white">{initials}</span>
          )}
        </span>
        <ChevronDown size={16} className="hidden sm:block text-blue-100" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-120 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/98 text-slate-100 shadow-[0_24px_56px_rgba(2,6,23,0.45)]"
          style={{ maxWidth: 'calc(100vw - 24px)' }}
        >
          <div className="border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={`Foto de ${user?.nome || 'usuario'}`}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <User className="text-slate-300" size={18} />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.nome || 'Usuário sem nome'}</p>
                <p className="truncate text-xs text-slate-400">{user?.email || 'Sem e-mail'}</p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                  <ShieldCheck size={12} />
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              onClick={() => goTo(homePath)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              <Home size={15} />
              Início
            </button>
            <button
              type="button"
              onClick={() => goTo('/perfil')}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              <UserCircle2 size={15} />
              Perfil e Configurações
            </button>
          </div>

          <div className="border-t border-slate-800 px-3 py-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Notificações Push</span>
              <button
                type="button"
                onClick={requestPermission}
                className="rounded-md border border-slate-700 px-2 py-0.5 hover:bg-slate-800"
              >
                {isEnabled ? 'ON' : permission === 'granted' ? 'OFF' : 'ATIVAR'}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
            >
              <LogOut size={15} />
              Deslogar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
