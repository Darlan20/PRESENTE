/**
 * UsuarioPage — Painel do Usuário
 * Redesign com identidade visual SupportFlow (dark corporate)
 * Mesma paleta, tipografia e sistema de animações da tela de Login.
 *
 * Imports dos sub-componentes mantidos intactos:
 *   UserTicketForm, UserTicketList → estilos sobrescritos via UsuarioStyles
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, X, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserTicketList }  from '../../components/UserTicketList'
import { ChatPanel } from '../../components/ChatPanel'
import { UserTicketForm }  from '../../components/UserTicketForm'
import { chamadoAPI, getApiErrorMessage } from '../../services/api'
import { mapChamado }      from '../../lib/mapChamado'
import { useAuth }         from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { useRealtimeTickets } from '../../lib/realtime'
import { toast }           from 'sonner'
import { usuarioStyles }   from './UsuarioStyles'
import { AccountMenu } from '../../components/AccountMenu'

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const BrandMark = () => (
  <img className="up-brand-img" src="/brand/sf-logo.png" alt="SupportFlow" />
)
const IcSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IcRefresh = ({ spinning }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       style={spinning ? { animation: 'upSpin .7s linear infinite' } : {}}>
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const IcEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IcEyeOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IcPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IcTicket = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
  </svg>
)
const IcClock = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IcCheck = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IcAlert = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IcInbox = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)

// ─── Animated stat counter ────────────────────────────────────────────────────
function useCounter(target, dur = 800) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    if (target === prev.current) return
    const diff  = target - prev.current
    const steps = 30
    const step  = diff / steps
    const ms    = dur / steps
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
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

// ─── Initials avatar ──────────────────────────────────────────────────────────
// ─── Route helper ─────────────────────────────────────────────────────────────
const normalizeChamadoList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

// ═══════════════════════════════════════════════════════════════════════════════
const UsuarioPage = () => {
  const navigate = useNavigate()
  const { user: usuario, logout } = useAuth()
  const { notify } = useNotification()

  const [tickets,          setTickets]          = useState([])
  const [filteredTickets,  setFilteredTickets]  = useState([])
  const [loading,          setLoading]          = useState(true)
  const [refreshing,       setRefreshing]       = useState(false)
  const [searchTerm,       setSearchTerm]       = useState('')
  const [filterStatus,     setFilterStatus]     = useState('todos')
  const [filterPriority,   setFilterPriority]   = useState('todos')
  const [filterCategory,   setFilterCategory]   = useState('todos')
  const [startDate,        setStartDate]        = useState('')
  const [endDate,          setEndDate]          = useState('')
  const [hideResolved,     setHideResolved]     = useState(false)
  const [isDrawerOpen,     setIsDrawerOpen]     = useState(false)
  const [filtersExpanded,  setFiltersExpanded]  = useState(false)
  const [chatDialog, setChatDialog] = useState({ isOpen: false, ticketId: null, chatId: null })

  // ── Derived stats ────────────────────────────────────────────────────────
  const statsData = {
    total:       tickets.length,
    abertos:     tickets.filter(t => t.status === 'aberto').length,
    emAndamento: tickets.filter(t => t.status === 'em-andamento').length,
    resolvidos:  tickets.filter(t => t.status === 'resolvido').length,
    urgentes:    tickets.filter(t => t.priority === 'urgente').length,
  }
  const categoryOptions = [...new Set(tickets.map(t => t.category).filter(Boolean))]

  // ── Filter logic ─────────────────────────────────────────────────────────
  const applyFilters = useCallback((list, opts) => {
    let r = list
    if (opts.hideResolved)         r = r.filter(t => t.status !== 'resolvido')
    if (opts.status !== 'todos')   r = r.filter(t => t.status === opts.status)
    if (opts.priority !== 'todos') r = r.filter(t => t.priority === opts.priority)
    if (opts.category !== 'todos') r = r.filter(t => t.category === opts.category)
    if (opts.startDate)            r = r.filter(t => new Date(t.createdAt) >= new Date(opts.startDate))
    if (opts.endDate) {
      const last = new Date(opts.endDate); last.setHours(23, 59, 59, 999)
      r = r.filter(t => new Date(t.createdAt) <= last)
    }
    if (opts.search.trim()) {
      const term = opts.search.toLowerCase()
      r = r.filter(t =>
        String(t.title || t.titulo || '').toLowerCase().includes(term) ||
        String(t.description || t.descricao || '').toLowerCase().includes(term) ||
        t.id.toString().includes(term)
      )
    }
    setFilteredTickets(r)
  }, [])

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setRefreshing(true)
      const response = await chamadoAPI.listarMeus({ suppressNetworkToast: silent })
      const records = normalizeChamadoList(response.data)
      const data = records.map(mapChamado)
      setTickets(data)
      applyFilters(data, {
        search: searchTerm, status: filterStatus, priority: filterPriority,
        category: filterCategory, startDate, endDate, hideResolved,
      })
      return data
    } catch (err) {
      if (err?.response?.status === 401) {
        logout()
        navigate('/')
        return []
      }

      if (!silent && loading) toast.error(getApiErrorMessage(err, 'Erro ao carregar chamados.'))
      return []
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [loading, searchTerm, filterStatus, filterPriority, filterCategory, startDate, endDate, hideResolved, applyFilters, logout, navigate])

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => { fetchTickets() }, []) // eslint-disable-line

  useEffect(() => {
    applyFilters(tickets, {
      search: searchTerm, status: filterStatus, priority: filterPriority,
      category: filterCategory, startDate, endDate, hideResolved,
    })
  }, [searchTerm, filterStatus, filterPriority, filterCategory, startDate, endDate, hideResolved, tickets, applyFilters])

  useRealtimeTickets({
    fetchFn: fetchTickets,
    onNewTicket: (ticket) => {
      notify({
        title: 'Novo chamado detectado',
        body: `${ticket.title} (${ticket.id})`,
        tag: `ticket-${ticket.id}`,
      })
    },
    pollingMs: 10000,
  })

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/') }

  const handleOpenChat = async (ticketId) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return
    setChatDialog({ isOpen: true, ticketId, chatId: null })
  }

  const handleCreateTicket = async (formData) => {
    try {
      await chamadoAPI.criar({
        titulo: formData.title, descricao: formData.description,
        solicitante: usuario.nome || 'Usuário',
        setor: formData.setor, bloco: formData.bloco, sala: formData.sala,
        templateId: formData.templateId,
        templateIndex: formData.templateIndex,
        attachmentBase64: formData.attachmentBase64,
        attachmentName: formData.attachmentName,
        attachmentContentType: formData.attachmentContentType,
      })
      await fetchTickets()
      setSearchTerm('')
      setFilterStatus('todos')
      setFilterPriority('todos')
      setFilterCategory('todos')
      setStartDate('')
      setEndDate('')
      setHideResolved(false)
      toast.success('Chamado criado com sucesso!', {
        description: 'Seu chamado foi registrado e será atendido em breve.',
      })
      setIsDrawerOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao criar chamado. Tente novamente.'))
    }
  }

  // ── Active filters count (for filter badge) ───────────────────────────────
  const activeFilterCount = [
    filterStatus !== 'todos', filterPriority !== 'todos',
    filterCategory !== 'todos', startDate, endDate, hideResolved,
  ].filter(Boolean).length

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="up-root">
      <style>{usuarioStyles}</style>

      {/* ══════ HEADER ══════ */}
      <header className="up-header">
        <div className="up-header-left">
          <div className="up-brand">
            <div className="up-brand-icon"><BrandMark /></div>
            <span className="up-brand-name">SupportFlow</span>
          </div>
          <div className="up-header-divider" />
          <span className="up-header-section">Painel do Usuário</span>
        </div>

        <div className="up-header-right">
          {/* Online indicator */}
          <div className="up-online-badge">
            <span className="up-online-dot" />
            <span className="up-online-label">Ao vivo</span>
          </div>

          <AccountMenu
            user={usuario}
            onLogout={handleLogout}
            homePath="/usuario"
          />
        </div>
      </header>

      {/* ══════ STATS BAR ══════ */}
      <div className="up-stats-bar">
        <StatCard icon={<IcTicket color="#7eb8ff" />}  colorClass="up-stat-icon-blue"  count={statsData.total}       label="Total"        delay={0}   />
        <StatCard icon={<IcAlert  color="#fcd34d" />}  colorClass="up-stat-icon-amber" count={statsData.abertos}     label="Abertos"      delay={80}  />
        <StatCard icon={<IcClock  color="#67e8f9" />}  colorClass="up-stat-icon-cyan"  count={statsData.emAndamento} label="Em andamento" delay={160} />
        <StatCard icon={<IcCheck  color="#6ee7b7" />}  colorClass="up-stat-icon-green" count={statsData.resolvidos}  label="Resolvidos"   delay={240} />
        <StatCard icon={<IcAlert  color="#fca5a5" />}  colorClass="up-stat-icon-red"   count={statsData.urgentes}   label="Urgentes"     delay={320} />
      </div>

      {/* ══════ MAIN ══════ */}
      <main className="up-main">

        {/* ── SIDEBAR: visible only on desktop ── */}
        <aside className="up-sidebar">
          <div className="up-sidebar-header">
            <span className="up-sidebar-title">Abrir novo chamado</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-soft)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'upBlink 2s infinite' }} />
              Online
            </div>
          </div>
          <div className="up-sidebar-body">
            <UserTicketForm
              onSubmit={handleCreateTicket}
              userEmail={usuario?.email || ''}
              userName={usuario?.nome || ''}
            />
          </div>
        </aside>

        {/* ── CONTENT: Ticket List ── */}
        <section className="up-content">

          {/* ── Mobile search row ── */}
          <div className="up-mobile-search-row">
            <div className="up-search-wrap" style={{ flex: 1 }}>
              <span className="up-search-icon"><IcSearch /></span>
              <input
                className="up-input"
                type="text"
                placeholder="Buscar chamados..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="up-mobile-only"
              style={{
                width: 38, height: 38, flex: '0 0 38px',
                borderRadius: 9, background: 'var(--accent)', color: '#fff',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onClick={() => setIsDrawerOpen(true)}
              title="Novo Chamado"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
            <button
              className={`up-filter-toggle-btn${filtersExpanded ? ' active' : ''}${activeFilterCount > 0 ? ' has-filters' : ''}`}
              onClick={() => setFiltersExpanded(v => !v)}
              title="Filtros"
            >
              <SlidersHorizontal size={15} />
              {activeFilterCount > 0 && (
                <span className="up-filter-badge">{activeFilterCount}</span>
              )}
            </button>
            <button
              className={`up-refresh-btn${refreshing ? ' spinning' : ''}`}
              onClick={() => fetchTickets()}
              title="Atualizar"
            >
              <IcRefresh spinning={refreshing} />
            </button>
          </div>

          {/* ── Filter toolbar (desktop always visible, mobile collapsible) ── */}
          <div className={`up-content-header${filtersExpanded ? ' filters-open' : ''}`}>
            {/* Desktop title */}
            <div className="up-content-title up-desktop-only">
              Meus chamados
              {activeFilterCount > 0 && (
                <span style={{
                  marginLeft: 10, fontSize: 11, fontWeight: 500,
                  background: 'rgba(43,108,255,.15)', color: '#7eb8ff',
                  border: '1px solid rgba(43,108,255,.25)',
                  borderRadius: 100, padding: '2px 10px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="up-filters">
              {/* Search — desktop only (mobile has its own row) */}
              <div className="up-search-wrap up-desktop-only">
                <span className="up-search-icon"><IcSearch /></span>
                <input
                  className="up-input"
                  type="text"
                  placeholder="Buscar por título, descrição ou ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Hide resolved toggle */}
              <button
                className={`up-icon-btn${hideResolved ? ' active' : ''}`}
                onClick={() => setHideResolved(v => !v)}
                title={hideResolved ? 'Mostrar resolvidos' : 'Ocultar resolvidos'}
              >
                {hideResolved ? <IcEyeOff /> : <IcEye />}
                <span className="up-btn-label">{hideResolved ? 'Mostrando ativos' : 'Ocultar resolvidos'}</span>
              </button>

              {/* Status */}
              <select className="up-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="todos">Status</option>
                <option value="aberto">Aberto</option>
                <option value="em-andamento">Em andamento</option>
                <option value="resolvido">Resolvido</option>
              </select>

              {/* Priority */}
              <select className="up-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="todos">Prioridade</option>
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>

              {/* Category */}
              <select className="up-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="todos">Categoria</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Date range */}
              <input className="up-date-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} title="Data inicial" />
              <input className="up-date-input" type="date" value={endDate}   onChange={e => setEndDate(e.target.value)}   title="Data final" />

              {/* Refresh — desktop only */}
              <button
                className={`up-refresh-btn up-desktop-only${refreshing ? ' spinning' : ''}`}
                onClick={() => fetchTickets()}
                title="Atualizar lista"
              >
                <IcRefresh spinning={refreshing} />
              </button>

              {/* Clear filters — mobile */}
              {activeFilterCount > 0 && (
                <button
                  className="up-clear-filters-btn"
                  onClick={() => {
                    setFilterStatus('todos'); setFilterPriority('todos')
                    setFilterCategory('todos'); setStartDate(''); setEndDate('')
                    setHideResolved(false)
                  }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* Result info */}
          <div className="up-result-bar">
            <span>
              Exibindo&nbsp;<strong>{filteredTickets.length}</strong>&nbsp;de&nbsp;
              <strong>{tickets.length}</strong>&nbsp;chamados
            </span>
            {hideResolved && (
              <span className="up-result-tag"><IcEyeOff /> Resolvidos ocultos</span>
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setFilterStatus('todos'); setFilterPriority('todos')
                  setFilterCategory('todos'); setStartDate(''); setEndDate('')
                  setHideResolved(false); setSearchTerm('')
                }}
                className="up-desktop-only"
                style={{
                  marginLeft: 'auto', fontSize: 11, color: 'var(--text-soft)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textDecoration: 'underline',
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* List */}
          <div className="up-list-area">
            {loading ? (
              <div className="up-skeleton">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="up-skeleton-item"
                       style={{ animationDelay: `${i * 80}ms`, opacity: 1 - i * 0.12 }} />
                ))}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="up-empty">
                <div className="up-empty-icon"><IcInbox /></div>
                <div className="up-empty-title">
                  {tickets.length === 0 ? 'Nenhum chamado ainda' : 'Nenhum resultado'}
                </div>
                <div className="up-empty-sub">
                  {tickets.length === 0
                    ? 'Toque em "+ Novo Chamado" para abrir seu primeiro chamado.'
                    : 'Tente ajustar os filtros ou limpar a busca.'}
                </div>
              </div>
            ) : (
              <UserTicketList tickets={filteredTickets} onOpenChat={handleOpenChat} />
            )}
          </div>
        </section>
      </main>

      {/* ══════ DRAWER (Novo Chamado) ══════ */}
      <div className={`up-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
      <div className={`up-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="up-drawer-header">
          <div className="up-drawer-title">
            <IcPlus /> Abrir novo chamado
          </div>
          <button className="up-drawer-close" onClick={() => setIsDrawerOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="up-drawer-body">
          <UserTicketForm
            onSubmit={handleCreateTicket}
            userEmail={usuario?.email || ''}
            userName={usuario?.nome || ''}
          />
        </div>
      </div>



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

export default UsuarioPage
