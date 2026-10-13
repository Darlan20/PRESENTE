/**
 * TechnicianTicketList.jsx (VERSÃO MELHORADA)
 * Agora com botão para ocultar chamados resolvidos
 */
import { useMemo, useState } from "react"
import {
  Search,
  Filter,
  Mail,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit2,
  Save,
  X,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { SlaTimer } from "./SlaTimer"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const getStatusBadge = (status) => {
  const map = {
    'aberto':        { icon: <AlertCircle size={13} />, label: 'Aberto',       cls: 'bg-blue-50 text-blue-700 border-blue-200'   },
    'em-andamento':  { icon: <PlayCircle  size={13} />, label: 'Em Andamento', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    'resolvido':     { icon: <CheckCircle2 size={13}/>, label: 'Resolvido',    cls: 'bg-green-50 text-green-700 border-green-200' },
  }
  const s = map[status] || { icon: null, label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  )
}

const getPriorityBadge = (priority) => {
  const map = {
    'baixa':   'bg-slate-100 text-slate-600 border-slate-200',
    'média':   'bg-yellow-50 text-yellow-700 border-yellow-200',
    'alta':    'bg-orange-50 text-orange-700 border-orange-200',
    'urgente': 'bg-red-50 text-red-700 border-red-200',
  }
  const cls = map[priority] || 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${cls}`}>
      {priority || '-'}
    </span>
  )
}

const getBorderColor = (ticket) => {
  if (ticket.status === 'resolvido' || !ticket.slaHoras || !ticket.createdAt) return 'border-l-transparent'
  const target = new Date(ticket.createdAt).getTime() + (ticket.slaHoras * 60 * 60 * 1000)
  const diff = target - Date.now()
  if (diff < 0) return 'border-l-red-500 bg-red-50/5 dark:bg-red-950/10'
  if (diff < 2 * 60 * 60 * 1000) return 'border-l-amber-500 bg-amber-50/5 dark:bg-amber-950/10'
  return 'border-l-transparent'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TechnicianTicketList({
  tickets,
  onUpdateTicket,
  onDeleteTicket,
  onViewTicket,
  onSendEmail,
  onOpenChat,
  onCreateTicket,
  delayedTickets,
  hideResolved: hideResolvedProp,
  onToggleHideResolved,
  onRefresh,
  refreshing,
}) {
  const [searchTerm,        setSearchTerm]        = useState("")
  const [filterStatus,      setFilterStatus]      = useState("todos")
  const [filterPriority,    setFilterPriority]    = useState("todos")
  const [filterSetor,       setFilterSetor]       = useState("todos")
  const [filterSala,        setFilterSala]        = useState("todos")
  const [filterBloco,       setFilterBloco]       = useState("todos")
  const [startDate,         setStartDate]         = useState("")
  const [endDate,           setEndDate]           = useState("")
  const [internalHideResolved, setInternalHideResolved] = useState(false)
  const [editingTicket,     setEditingTicket]     = useState(null)
  const [editForm,          setEditForm]          = useState({})
  const [filtersOpen,       setFiltersOpen]       = useState(false)

  const setorOptions = [...new Set(tickets.map((t) => t.setor).filter(Boolean))]
  const salaOptions  = [...new Set(tickets.map((t) => t.sala).filter(Boolean))]
  const blocoOptions = [...new Set(tickets.map((t) => t.bloco || t.andar).filter(Boolean))]

  const hideResolved  = typeof hideResolvedProp !== 'undefined' ? hideResolvedProp : internalHideResolved
  const setHideResolved = typeof onToggleHideResolved === 'function' ? onToggleHideResolved : setInternalHideResolved

  const delayedTicketIds = useMemo(() => {
    if (!Array.isArray(delayedTickets)) return new Set()
    return new Set(
      delayedTickets
        .map((ticketOrId) => {
          if (typeof ticketOrId === 'string') return ticketOrId
          if (ticketOrId && typeof ticketOrId === 'object') return ticketOrId.id
          return null
        })
        .filter(Boolean)
    )
  }, [delayedTickets])

  const isDelayed = (id) => delayedTicketIds.has(id)

  const startEditing = (ticket) => {
    setEditingTicket(ticket.id)
    setEditForm({ status: ticket.status, priority: ticket.priority })
  }

  const cancelEditing = () => {
    setEditingTicket(null)
    setEditForm({})
  }

  const saveEditing = async (ticket) => {
    try {
      await onUpdateTicket?.({ ...ticket, ...editForm })
      toast.success('Chamado atualizado com sucesso!')
    } catch {
      toast.error('Erro ao atualizar chamado.')
    } finally {
      cancelEditing()
    }
  }

  const handleNotifyDelay = (ticket) => {
    toast.warning(`Atraso notificado para o chamado ${ticket.id}`)
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (hideResolved && ticket.status === 'resolvido') return false

    const q = searchTerm.toLowerCase()
    const matchesSearch =
      (ticket.title             || '').toLowerCase().includes(q) ||
      (ticket.description       || '').toLowerCase().includes(q) ||
      (ticket.requester         || '').toLowerCase().includes(q) ||
      (ticket.setorAtendimento  || '').toLowerCase().includes(q) ||
      (ticket.triagemJustificativa || '').toLowerCase().includes(q) ||
      (ticket.setor             || '').toLowerCase().includes(q) ||
      (ticket.bloco || ticket.andar || '').toLowerCase().includes(q) ||
      (ticket.sala              || '').toLowerCase().includes(q) ||
      (ticket.unidade           || '').toLowerCase().includes(q) ||
      (ticket.id                || '').toLowerCase().includes(q)

    const matchesStatus   = filterStatus   === "todos" || ticket.status   === filterStatus
    const matchesPriority = filterPriority === "todos" || ticket.priority === filterPriority
    const matchesSetor    = filterSetor    === "todos" || ticket.setor    === filterSetor
    const matchesSala     = filterSala     === "todos" || ticket.sala     === filterSala
    const matchesBloco    = filterBloco    === "todos" || (ticket.bloco || ticket.andar) === filterBloco

    const matchesFromDate = !startDate || new Date(ticket.createdAt) >= new Date(startDate)
    const matchesToDate   = !endDate   || new Date(ticket.createdAt) <= new Date(`${endDate}T23:59:59`)

    return matchesSearch && matchesStatus && matchesPriority && matchesSetor && matchesSala && matchesBloco && matchesFromDate && matchesToDate
  })

  const clearFilters = () => {
    setFilterStatus('todos')
    setFilterPriority('todos')
    setFilterSetor('todos')
    setFilterSala('todos')
    setFilterBloco('todos')
    setStartDate('')
    setEndDate('')
  }

  const selectCls = "rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
  const selectClsFull = "w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(2,6,23,0.08)]">

      {/* ── Toolbar ── */}
      <div className="shrink-0 border-b border-slate-200 p-3 md:p-4">

        {/* Linha superior: search + botões de ação */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Buscar chamados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
          </div>

          {/* Ocultar resolvidos */}
          <button
            onClick={() => setHideResolved(!hideResolved)}
            title={hideResolved ? 'Mostrar resolvidos' : 'Ocultar resolvidos'}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              hideResolved
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {hideResolved ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">{hideResolved ? 'Resolvidos ocultos' : 'Ocultar resolvidos'}</span>
          </button>

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Atualizar"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          )}

          {/* Filtros mobile */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`md:hidden inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              filtersOpen
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={14} />
            Filtros
          </button>

          {/* Novo chamado */}
          {onCreateTicket && (
            <button
              onClick={onCreateTicket}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Novo</span>
            </button>
          )}
        </div>

        {/* Filtros — desktop */}
        <div className="hidden md:flex flex-wrap items-center gap-2 relative">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectCls}>
            <option value="todos">Todos Status</option>
            <option value="aberto">Abertos</option>
            <option value="em-andamento">Em Andamento</option>
            <option value="resolvido">Resolvidos</option>
          </select>

          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selectCls}>
            <option value="todos">Todas Prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="média">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>

          <select value={filterSetor} onChange={(e) => setFilterSetor(e.target.value)} className={selectCls}>
            <option value="todos">Todos Setores</option>
            {setorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filterSala} onChange={(e) => setFilterSala(e.target.value)} className={selectCls}>
            <option value="todos">Todas Salas</option>
            {salaOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filterBloco} onChange={(e) => setFilterBloco(e.target.value)} className={selectCls}>
            <option value="todos">Todos Blocos</option>
            {blocoOptions.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={selectCls} />
          <input type="date" value={endDate}   onChange={(e) => setEndDate(e.target.value)}   className={selectCls} />

          <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors">
            Limpar
          </button>
        </div>

        {/* Filtros — mobile dropdown */}
        {filtersOpen && (
          <div className="md:hidden mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClsFull}>
                <option value="todos">Todos Status</option>
                <option value="aberto">Abertos</option>
                <option value="em-andamento">Em Andamento</option>
                <option value="resolvido">Resolvidos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prioridade</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selectClsFull}>
                <option value="todos">Todas Prioridades</option>
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Setor</label>
              <select value={filterSetor} onChange={(e) => setFilterSetor(e.target.value)} className={selectClsFull}>
                <option value="todos">Todos Setores</option>
                {setorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sala</label>
              <select value={filterSala} onChange={(e) => setFilterSala(e.target.value)} className={selectClsFull}>
                <option value="todos">Todas Salas</option>
                {salaOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bloco</label>
              <select value={filterBloco} onChange={(e) => setFilterBloco(e.target.value)} className={selectClsFull}>
                <option value="todos">Todos Blocos</option>
                {blocoOptions.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">De</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={selectClsFull} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Até</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={selectClsFull} />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={clearFilters}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="hide-scrollbar flex-1 overflow-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-900">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-900">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-900">Título</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-900">Solicitante</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-900">Categoria</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-900">Localização</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-900">Prioridade</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-900">Criado em</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-slate-900">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  Nenhum chamado encontrado
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={`transition-colors hover:bg-slate-50 ${isDelayed(ticket.id) ? "bg-amber-50" : ""}`}
                >
                  <td className={`px-4 py-2 border-l-4 ${getBorderColor(ticket)}`}>
                    {editingTicket === ticket.id ? (
                      <select
                        value={editForm.status || ticket.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                      >
                        <option value="aberto">Aberto</option>
                        <option value="em-andamento">Em Andamento</option>
                        <option value="resolvido">Resolvido</option>
                      </select>
                    ) : (
                      getStatusBadge(ticket.status)
                    )}
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-blue-600">{ticket.id}</span>
                      {isDelayed(ticket.id) && (
                        <AlertTriangle className="text-orange-500" size={14} title="Chamado com atraso" />
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    <div>
                      <div className="text-sm text-slate-900">{ticket.title}</div>
                      <div className="max-w-xs truncate text-xs text-slate-500">{ticket.description}</div>
                      <div className="max-w-xs truncate text-[11px] text-slate-400">
                        Triagem: {ticket.triagemJustificativa || '-'}
                      </div>
                      {ticket.attachmentName && (
                        <div className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          Anexo disponível
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    <div>
                      <div className="text-sm text-slate-900">{ticket.requester}</div>
                      <div className="text-xs text-slate-500">{ticket.email}</div>
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    <div className="text-sm text-slate-600">{ticket.category}</div>
                    <div className="text-xs text-slate-500">{ticket.setorAtendimento || '-'}</div>
                  </td>

                  <td className="px-4 py-2">
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <div>{ticket.setor || '-'}</div>
                      <div>Bloco {ticket.bloco || ticket.andar || '-'} | Sala {ticket.sala || '-'}</div>
                      <div>Unidade {ticket.unidade || '-'}</div>
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    {editingTicket === ticket.id ? (
                      <select
                        value={editForm.priority || ticket.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="média">Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    ) : (
                      <div className="space-y-2">
                        {getPriorityBadge(ticket.priority)}
                        <SlaTimer ticket={ticket} detailed={false} />
                      </div>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-2 text-sm text-slate-500">
                    {formatDate(ticket.createdAt)}
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-1">
                      {editingTicket === ticket.id ? (
                        <>
                          <button
                            onClick={() => saveEditing(ticket)}
                            className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                            title="Salvar alterações"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onViewTicket(ticket.id)}
                            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                            title="Ver detalhes"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => startEditing(ticket)}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            title="Editar chamado"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onSendEmail(ticket.id)}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            title="Enviar email"
                          >
                            <Mail size={16} />
                          </button>
                          <button
                            onClick={() => onOpenChat?.(ticket.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-green-700 bg-green-50 border border-green-200 transition-colors hover:bg-green-100 text-xs font-medium"
                            title="Abrir chat"
                          >
                            <MessageSquare size={16} />
                            <span>Chat</span>
                          </button>
                          {isDelayed(ticket.id) && (
                            <button
                              onClick={() => handleNotifyDelay(ticket)}
                              className="rounded-lg p-2 text-orange-600 transition-colors hover:bg-orange-50"
                              title="Notificar atraso"
                            >
                              <Clock size={16} />
                            </button>
                          )}
                          {onDeleteTicket && (
                            <button
                              onClick={() => onDeleteTicket(ticket.id)}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                              title="Remover chamado"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}