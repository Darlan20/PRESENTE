/**
 * TecnicoPage — Painel do Técnico
 * v2: responsividade mobile aprimorada
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TechnicianTicketList } from '../../components/TechnicianTicketList'
import { UserTicketForm } from '../../components/UserTicketForm'
import { ChatPanel } from '../../components/ChatPanel'
import { EmailDialog } from '../../components/EmailDialog'
import { TicketDetailsDialog } from '../../components/TicketDetailsDialog'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { chamadoAPI, getApiErrorMessage } from '../../services/api'
import { mapChamado } from '../../lib/mapChamado'
import { useRealtimeTickets } from '../../lib/realtime'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { usuarioStyles as tecnicoStyles } from '../UsuarioPage/UsuarioStyles'
import { AccountMenu } from '../../components/AccountMenu'

// ─── Mobile overrides ─────────────────────────────────────────────────────────
const mobileOverrides = `
  /* ── Header mobile ── */
  @media (max-width: 640px) {
    .up-header {
      padding: 0 12px !important;
      height: 52px !important;
    }
    .up-brand-name {
      display: none !important;
    }
    .up-header-section {
      font-size: 12px !important;
    }
    .up-header-divider {
      display: none !important;
    }
    .up-online-badge {
      display: none !important;
    }
    .up-user-name {
      display: none !important;
    }
    .up-logout-label {
      display: none !important;
    }
    .up-new-chamado-btn {
      display: none !important;
    }
    .up-user-chip {
      gap: 0 !important;
    }
  }

  /* ── Stats bar: scroll horizontal no mobile ── */
  .up-stats-bar {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    flex-wrap: nowrap !important;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
    gap: 8px !important;
    padding: 8px 12px !important;
  }
  .up-stats-bar::-webkit-scrollbar { display: none; }

  .up-stat-card {
    scroll-snap-align: start;
    flex-shrink: 0 !important;
  }

  @media (max-width: 640px) {
    .up-stat-card {
      min-width: 130px !important;
      padding: 10px 12px !important;
    }
    .up-stat-num {
      font-size: 1.3rem !important;
    }
    .up-stat-lbl {
      font-size: 10px !important;
    }
    .up-stat-icon {
      width: 32px !important;
      height: 32px !important;
    }
  }

  /* ── Main / content area ── */
  @media (max-width: 640px) {
    .up-main {
      padding: 8px !important;
    }
    .up-content {
      border-radius: 12px !important;
    }
    .up-list-area {
      padding: 0 !important;
    }
  }

  /* ── Drawer full-screen no mobile ── */
  @media (max-width: 640px) {
    .up-drawer {
      width: 100% !important;
      border-radius: 0 !important;
    }
  }

  /* ── FAB: novo chamado mobile ── */
  .tp-fab {
    display: none;
    position: fixed;
    bottom: 20px;
    right: 16px;
    z-index: 50;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2b6cff, #1a44cc);
    color: #fff;
    border: none;
    box-shadow: 0 4px 16px rgba(43,108,255,0.45);
    cursor: pointer;
    align-items: center;
    justify-content: center;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .tp-fab:active {
    transform: scale(0.93);
    box-shadow: 0 2px 8px rgba(43,108,255,0.3);
  }
  @media (max-width: 640px) {
    .tp-fab { display: flex; }
  }
`

const normalizeChamadoList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BrandMark = () => (
  <img className="up-brand-img" src="/brand/sf-logo.png" alt="SupportFlow" />
)

const IcTicket = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
  </svg>
)
const IcClock = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IcCheck = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IcAlert = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IcFlame = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
)

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCounter(target, dur = 800) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    if (target === prev.current) return
    const diff = target - prev.current
    const steps = 30; const step = diff / steps; const ms = dur / steps
    let cur = prev.current
    const iv = setInterval(() => {
      cur += step
      const done = step > 0 ? cur >= target : cur <= target
      if (done) { cur = target; clearInterval(iv) }
      setVal(Math.round(cur))
    }, ms)
    prev.current = target
    return () => clearInterval(iv)
  }, [target, dur])
  return val
}

const StatCard = ({ icon, colorClass, count, label, delay = 0 }) => {
  const animated = useCounter(count)
  return (
    <div className="up-stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className={`up-stat-icon ${colorClass}`}>{icon}</div>
      <div>
        <div className="up-stat-num">{animated}</div>
        <div className="up-stat-lbl">{label}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
const TecnicoPage = () => {
  const navigate = useNavigate()
  const { user: usuario, logout } = useAuth()
  const { notify } = useNotification()

  const [tickets,       setTickets]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [refreshing,    setRefreshing]    = useState(false)
  const [isDrawerOpen,  setIsDrawerOpen]  = useState(false)
  const [hideResolved,  setHideResolved]  = useState(false)

  const [emailDialog,   setEmailDialog]   = useState({ isOpen: false, ticket: null })
  const [detailsDialog, setDetailsDialog] = useState({ isOpen: false, ticket: null })
  const [chatDialog,    setChatDialog]    = useState({ isOpen: false, ticketId: null, chatId: null })

  const delayedTickets = useMemo(() => {
    const nowMs = Date.now()

    const getReferenceDate = (ticket) => {
      if (ticket.status === 'em-andamento') {
        return new Date(ticket.updatedAt || ticket.createdAt)
      }
      return new Date(ticket.createdAt || ticket.updatedAt)
    }

    return tickets.filter((ticket) => {
      if (ticket.status === 'resolvido') return false
      if (ticket.status !== 'aberto' && ticket.status !== 'em-andamento') return false

      const refDate = getReferenceDate(ticket)
      if (Number.isNaN(refDate.getTime())) return false

      const defaultSlaHoras = ticket.status === 'aberto' ? 24 : 48
      const slaHoras = Number.isFinite(Number(ticket.slaHoras)) && Number(ticket.slaHoras) > 0
        ? Number(ticket.slaHoras)
        : defaultSlaHoras

      const deadlineMs = refDate.getTime() + slaHoras * 60 * 60 * 1000
      return nowMs > deadlineMs
    })
  }, [tickets])

  const triagemCount = tickets.filter((t) => t.status === 'aberto').length
  const emAtendimentoCount = tickets.filter((t) => t.status === 'em-andamento').length
  const concluidosCount = tickets.filter((t) => t.status === 'resolvido').length

  const statsData = {
    total: tickets.length,
    abertos: triagemCount,
    emAndamento: emAtendimentoCount,
    resolvidos: concluidosCount,
    atrasados: delayedTickets.length,
  }

  const fetchTickets = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setRefreshing(true)
      const response = await chamadoAPI.listarTodos({ suppressNetworkToast: silent })
      const next = normalizeChamadoList(response.data).map(mapChamado)
      setTickets(next)
      return next
    } catch (error) {
      if (!silent && loading) toast.error(getApiErrorMessage(error, 'Erro ao carregar chamados.'))
      return []
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [loading])

  useEffect(() => { fetchTickets() }, []) // eslint-disable-line

  useRealtimeTickets({
    fetchFn: fetchTickets,
    onNewTicket: (ticket) => notify({
      title: 'Novo chamado para triagem',
      body: `${ticket.title} (${ticket.id})`,
      tag: `tech-ticket-${ticket.id}`,
    }),
    pollingMs: 10000,
  })

  const handleLogout = () => { logout(); navigate('/') }
  const handleUpdateTicket = async (updatedTicket) => {
    try {
      await chamadoAPI.atualizar(updatedTicket._id, { status: updatedTicket.status, prioridade: updatedTicket.priority })
      await fetchTickets({ silent: true })
      toast.success(`Chamado #${updatedTicket.id} atualizado.`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar chamado.'))
    }
  }
  const handleSendEmail  = (ticketId) => { const t = tickets.find(t => t.id === ticketId); if (t) setEmailDialog({ isOpen: true, ticket: t }) }
  const handleViewTicket = (ticketId) => { const t = tickets.find(t => t.id === ticketId); if (t) setDetailsDialog({ isOpen: true, ticket: t }) }
  const handleOpenChat   = async (ticketId) => { if (tickets.find(t => t.id === ticketId)) setChatDialog({ isOpen: true, ticketId, chatId: null }) }

  const handleCreateTicket = async (formData) => {
    try {
      await chamadoAPI.criar({
        titulo: formData.title, descricao: formData.description,
        solicitante: usuario.nome || 'Técnico',
        setor: formData.setor, bloco: formData.bloco, sala: formData.sala,
        templateId: formData.templateId, templateIndex: formData.templateIndex,
        attachmentBase64: formData.attachmentBase64,
        attachmentName: formData.attachmentName,
        attachmentContentType: formData.attachmentContentType,
      })
      await fetchTickets()
      toast.success('Chamado criado com sucesso!')
      setIsDrawerOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao criar chamado.'))
    }
  }

  return (
    <div className="up-root">
      <style>{tecnicoStyles}</style>
      <style>{mobileOverrides}</style>

      {/* ══════ HEADER ══════ */}
      <header className="up-header">
        <div className="up-header-left">
          <div className="up-brand">
            <div className="up-brand-icon"><BrandMark /></div>
            <span className="up-brand-name">SupportFlow</span>
          </div>
          <div className="up-header-divider" />
          <span className="up-header-section">Painel do Técnico</span>
        </div>

        <div className="up-header-right">
          <div className="up-online-badge">
            <span className="up-online-dot" />
            <span className="up-online-label">Sistema Ativo</span>
          </div>
          <AccountMenu
            user={usuario}
            onLogout={handleLogout}
            homePath="/tecnico"
          />
        </div>
      </header>

      {/* ══════ STATS BAR (scroll horizontal no mobile) ══════ */}
      <div className="up-stats-bar">
        <StatCard icon={<IcTicket color="#7eb8ff" />} colorClass="up-stat-icon-blue"  count={statsData.total}       label="Chamados"       delay={0}   />
        <StatCard icon={<IcAlert  color="#fcd34d" />} colorClass="up-stat-icon-amber" count={statsData.abertos}     label="Para Triagem"   delay={80}  />
        <StatCard icon={<IcClock  color="#67e8f9" />} colorClass="up-stat-icon-cyan"  count={statsData.emAndamento} label="Em Atendimento" delay={160} />
        <StatCard icon={<IcCheck  color="#6ee7b7" />} colorClass="up-stat-icon-green" count={statsData.resolvidos}  label="Concluídos"     delay={240} />
        <StatCard icon={<IcFlame  color="#fca5a5" />} colorClass="up-stat-icon-red"   count={statsData.atrasados}   label="SLA Atrasado"   delay={320} />
      </div>

      {/* ══════ MAIN ══════ */}
      <main className="up-main">
        <section className="up-content">
          <div className="up-content-header filters-open">
            <div className="up-filters" />
          </div>
          <div className="up-list-area" style={{ padding: 0 }}>
            <TechnicianTicketList
              tickets={tickets}
              onUpdateTicket={handleUpdateTicket}
              onViewTicket={handleViewTicket}
              onSendEmail={handleSendEmail}
              onOpenChat={handleOpenChat}
              delayedTickets={delayedTickets}
              onCreateTicket={() => setIsDrawerOpen(true)}
              hideResolved={hideResolved}
              onToggleHideResolved={setHideResolved}
              onRefresh={() => fetchTickets()}
              refreshing={refreshing}
            />
          </div>
        </section>
      </main>

      {/* ══════ FAB mobile (Novo Chamado) ══════ */}
      <button className="tp-fab" onClick={() => setIsDrawerOpen(true)} aria-label="Novo Chamado">
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* ══════ DRAWER ══════ */}
      <div className={`up-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
      <div className={`up-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="up-drawer-header">
          <div className="up-drawer-title">
            <Plus size={16} style={{ color: 'var(--accent)' }} /> Abrir novo chamado
          </div>
          <button className="up-drawer-close" onClick={() => setIsDrawerOpen(false)}><X size={18} /></button>
        </div>
        <div className="up-drawer-body">
          <UserTicketForm
            onSubmit={handleCreateTicket}
            userEmail={usuario?.email || ''}
            userName={usuario?.nome || ''}
          />
        </div>
      </div>

      {/* ══════ DIALOGS ══════ */}
      <EmailDialog
        isOpen={emailDialog.isOpen}
        ticket={emailDialog.ticket}
        onClose={() => setEmailDialog({ isOpen: false, ticket: null })}
      />
      <TicketDetailsDialog
        isOpen={detailsDialog.isOpen}
        ticket={detailsDialog.ticket}
        onClose={() => setDetailsDialog({ isOpen: false, ticket: null })}
      />
      <ChatPanel
        open={chatDialog.isOpen}
        onClose={() => setChatDialog({ isOpen: false, ticketId: null, chatId: null })}
        chamadoId={chatDialog.ticketId}
        chatId={chatDialog.chatId}
        user={usuario}
      />
    </div>
  )
}

export default TecnicoPage
