/**
 * ReportsSection.jsx (VERSÃO OTIMIZADA)
 * Melhorias: handlers unificados, modal rico, filtros limpos, UX aprimorada
 */
import { useState, useRef } from "react"
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  Loader2,
  X,
  Clock,
  ShieldCheck,
  Calendar,
  Maximize2
} from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { useExport } from '../hooks/useExport'
import { FORMATTERS } from '../lib/ExportConfig'
import { ChartModal } from './ChartModal'

// Custom Tooltip component for recharts to ensure modern UI
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
        <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((p, i) => (
            <div key={i} className="flex items-center gap-4 justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || p.payload.color || '#3b82f6' }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{p.name || p.dataKey}:</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-50">
                {p.value} {p.name === "TMA" ? "h" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function ReportsSection({ tickets }) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [quickFilter, setQuickFilter] = useState("all")
  
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalChildren, setModalChildren] = useState(null)
  const [modalInfo, setModalInfo] = useState(null)

  const chartRef = useRef(null)
  const { exportCsv, exportPdf, exportDocx, exportExcel, isLoading, progress } = useExport('professional')

  const EXPORT_COLUMNS = [
    { key: 'id', label: 'ID', formatter: FORMATTERS.text, width: 60 },
    { key: 'titulo', label: 'Título', formatter: FORMATTERS.text, width: 100 },
    { key: 'status', label: 'Status', formatter: FORMATTERS.status, width: 80 },
    { key: 'prioridade', label: 'Prioridade', formatter: FORMATTERS.priority, width: 80 },
    { key: 'categoria', label: 'Categoria', formatter: FORMATTERS.text, width: 80 },
    { key: 'setor', label: 'Setor', formatter: FORMATTERS.text, width: 80 },
    { key: 'bloco', label: 'Bloco', formatter: FORMATTERS.text, width: 70 },
    { key: 'sala', label: 'Sala', formatter: FORMATTERS.text, width: 60 },
    { key: 'sla', label: 'SLA', formatter: FORMATTERS.text, width: 60 },
    { key: 'criado', label: 'Criado em', formatter: FORMATTERS.date, width: 80 },
  ]

  // Filter handlers
  const getFilteredTickets = () => {
    return tickets.filter((ticket) => {
      const ticketDate = new Date(ticket.createdAt)
      const matchesDateRange =
        (!startDate || ticketDate >= new Date(startDate + 'T00:00:00')) &&
        (!endDate || ticketDate <= new Date(endDate + 'T23:59:59'))
      const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter

      return matchesDateRange && matchesStatus
    })
  }

  const filteredTickets = getFilteredTickets()

  const getExportRows = () => {
    return filteredTickets.map((ticket) => ({
      id: ticket.id,
      titulo: ticket.title,
      status: ticket.status,
      prioridade: ticket.priority,
      categoria: ticket.category,
      setor: ticket.setor || "-",
      bloco: ticket.bloco || ticket.andar || "-",
      sala: ticket.sala || "-",
      sla: ticket.slaHoras ? `${ticket.slaHoras}h` : "-",
      criado: ticket.createdAt,
    }))
  }

  const handleExport = async (type) => {
    const rows = getExportRows()
    if (rows.length === 0) return

    const filename = `relatorio-chamados-${new Date().toISOString().split('T')[0]}`
    const options = {
      title: 'SupportFlow - Relatório de Chamados',
      subtitle: (count) => `Resumo de ${count} chamado(s)`,
      includeDate: true,
      includeFooter: true,
    }

    const exportMap = {
      csv: () => exportCsv(`${filename}.csv`, EXPORT_COLUMNS, rows),
      pdf: () => exportPdf(`${filename}.pdf`, EXPORT_COLUMNS, rows, options),
      docx: () => exportDocx(`${filename}.docx`, EXPORT_COLUMNS, rows, options),
      excel: () => exportExcel(`${filename}.xlsx`, EXPORT_COLUMNS, rows, {
        sheetName: 'Chamados',
        freezePane: true,
        autoFilter: true,
      }),
    }

    await exportMap[type]?.()
  }

  const handleQuickFilter = (period) => {
    setQuickFilter(period)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    let start = new Date()

    if (period === "7") {
      start.setDate(today.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      setStartDate(start.toISOString().split("T")[0])
      setEndDate(today.toISOString().split("T")[0])
    } else if (period === "30") {
      start.setDate(today.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      setStartDate(start.toISOString().split("T")[0])
      setEndDate(today.toISOString().split("T")[0])
    } else if (period === "year") {
      start = new Date(today.getFullYear(), 0, 1)
      setStartDate(start.toISOString().split("T")[0])
      setEndDate(today.toISOString().split("T")[0])
    } else {
      setStartDate("")
      setEndDate("")
    }
  }

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value)
    setQuickFilter("custom")
  }

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value)
    setQuickFilter("custom")
  }

  const clearFilters = () => {
    setStartDate("")
    setEndDate("")
    setStatusFilter("todos")
    setQuickFilter("all")
  }

  // BI Metric Calculations
  const getTMAMs = () => {
    const resolved = filteredTickets.filter((t) => t.status === "resolvido" && t.createdAt && t.updatedAt)
    if (resolved.length === 0) return 0
    const totalMs = resolved.reduce((acc, t) => {
      const start = t.createdAt.getTime()
      const end = t.updatedAt.getTime()
      return acc + (end - start)
    }, 0)
    return totalMs / resolved.length
  }

  const getTMAString = () => {
    const ms = getTMAMs()
    if (!ms || isNaN(ms)) return "N/A"
    const hours = ms / (1000 * 60 * 60)
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`
    } else {
      const days = Math.floor(hours / 24)
      const remHours = Math.round(hours % 24)
      return `${days}d ${remHours}h`
    }
  }

  const getSlaCompliance = () => {
    const resolvedWithSLA = filteredTickets.filter((t) => t.status === "resolvido" && t.slaHoras && t.createdAt && t.updatedAt)
    if (resolvedWithSLA.length === 0) return null
    const compliant = resolvedWithSLA.filter((t) => {
      const durationHours = (t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60)
      return durationHours <= t.slaHoras
    })
    return Math.round((compliant.length / resolvedWithSLA.length) * 100)
  }

  const getResolutionRate = () => {
    if (filteredTickets.length === 0) return 0
    const resolved = filteredTickets.filter((t) => t.status === "resolvido").length
    return Math.round((resolved / filteredTickets.length) * 100)
  }

  // Data Preparation for Charts
  const getTimelineData = () => {
    let daysToGen = 7
    if (quickFilter === "30") daysToGen = 30
    else if (quickFilter === "all" || quickFilter === "year" || !startDate) {
      daysToGen = 30 // Fallback to 30 days to avoid cluttering X axis
    } else {
      const start = new Date(startDate + 'T00:00:00')
      const end = endDate ? new Date(endDate + 'T23:59:59') : new Date()
      const diffTime = Math.abs(end - start)
      daysToGen = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 90)
    }

    const days = Array.from({ length: daysToGen }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (daysToGen - 1 - i))
      return d.toISOString().split("T")[0]
    })

    return days.map((dateStr) => {
      const dayLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      const createdCount = tickets.filter((t) => {
        const tDate = new Date(t.createdAt).toISOString().split("T")[0]
        return tDate === dateStr
      }).length
      const resolvedCount = tickets.filter((t) => {
        const tDate = new Date(t.updatedAt).toISOString().split("T")[0]
        return tDate === dateStr && t.status === "resolvido"
      }).length
      return { date: dayLabel, dateKey: dateStr, Aberto: createdCount, Resolvido: resolvedCount }
    })
  }

  const getTMATimelineData = (timelineDays) => {
    return timelineDays.map(item => {
      const dateStr = item.dateKey
      const resolvedOnDay = tickets.filter(t => {
        const tDate = new Date(t.updatedAt).toISOString().split("T")[0]
        return tDate === dateStr && t.status === 'resolvido' && t.createdAt && t.updatedAt
      })
      
      let tmaHours = 0
      if (resolvedOnDay.length > 0) {
        const totalMs = resolvedOnDay.reduce((acc, t) => acc + (t.updatedAt.getTime() - t.createdAt.getTime()), 0)
        tmaHours = totalMs / resolvedOnDay.length / (1000 * 60 * 60)
      }
      return {
        date: item.date,
        TMA: parseFloat(tmaHours.toFixed(1))
      }
    })
  }

  const getPriorityData = () => {
    const priorities = ["baixa", "média", "alta", "urgente"]
    const colors = {
      baixa: "#10b981",
      "média": "#eab308",
      alta: "#f97316",
      urgente: "#ef4444"
    }
    const labels = {
      baixa: "Baixa",
      "média": "Média",
      alta: "Alta",
      urgente: "Urgente"
    }
    return priorities.map((p) => ({
      name: labels[p],
      value: filteredTickets.filter((t) => t.priority === p).length,
      color: colors[p]
    }))
  }

  const getStatusData = () => {
    return [
      { name: "Aberto", value: filteredTickets.filter((t) => t.status === "aberto").length, color: "#3b82f6" },
      { name: "Em Andamento", value: filteredTickets.filter((t) => t.status === "em-andamento").length, color: "#06b6d4" },
      { name: "Resolvido", value: filteredTickets.filter((t) => t.status === "resolvido").length, color: "#10b981" },
    ]
  }

  const getSectorData = () => {
    const sectorsMap = {}
    filteredTickets.forEach(t => {
      const s = t.setor || "Não Informado"
      sectorsMap[s] = (sectorsMap[s] || 0) + 1
    })
    return Object.keys(sectorsMap)
      .map(name => ({ name, value: sectorsMap[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }

  const getCategoryData = () => {
    const catMap = {}
    filteredTickets.forEach(t => {
      const c = t.category || "Geral"
      catMap[c] = (catMap[c] || 0) + 1
    })
    return Object.keys(catMap)
      .map(name => ({ name, value: catMap[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }

  // Precomputed chart data
  const timelineData = getTimelineData()
  const tmaTimelineData = getTMATimelineData(timelineData)
  const priorityData = getPriorityData()
  const statusData = getStatusData()
  const sectorData = getSectorData()
  const categoryData = getCategoryData()
  const slaValue = getSlaCompliance()

  const openChartDetails = (title, chartComponent, chartData, colors) => {
    setModalTitle(title)
    setModalChildren(chartComponent)
    setModalInfo({ data: chartData, colors: colors || ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"] })
    setModalOpen(true)
  }

  return (
    <div className="flex h-full flex-col space-y-5">
      {/* Filters & Export Header */}
      <div className="shrink-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={20} />
              Dashboard Executivo & BI
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Indicadores de desempenho, TMA, cumprimento de metas e distribuição de chamados.
            </p>
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Período:</span>
            {[
              { id: "7", label: "7 Dias" },
              { id: "30", label: "30 Dias" },
              { id: "year", label: "Este Ano" },
              { id: "all", label: "Tudo" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleQuickFilter(p.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  quickFilter === p.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Datepicker Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Data Início</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Data Fim</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="todos">Todos os Status</option>
              <option value="aberto">Abertos</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="resolvido">Resolvidos</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {(startDate || endDate || statusFilter !== "todos" || quickFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
                title="Limpar Filtros"
              >
                <X size={15} />
              </button>
            )}

            {/* Export Dropdown / Buttons */}
            <div className="flex-1 flex flex-wrap gap-1 justify-end min-w-[180px]">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isLoading || filteredTickets.length === 0}
                className="flex-1 min-w-[70px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-white py-2 text-xs font-semibold transition-all hover:bg-blue-700 disabled:opacity-40"
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={isLoading || filteredTickets.length === 0}
                className="flex-1 min-w-[70px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white py-2 text-xs font-semibold transition-all hover:bg-emerald-700 disabled:opacity-40"
              >
                <Download size={13} />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExport('docx')}
                disabled={isLoading || filteredTickets.length === 0}
                className="flex-1 min-w-[70px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 text-white py-2 text-xs font-semibold transition-all hover:bg-slate-900 disabled:opacity-40"
              >
                <Download size={13} />
                <span>Word</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading progress bar */}
        {isLoading && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gerando Relatório...</span>
              <span className="text-xs font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300 pointer-events-none">
            <FileText size={100} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume de Chamados</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{filteredTickets.length}</h3>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="font-semibold text-blue-500">{tickets.length}</span> totais cadastrados
          </p>
        </div>

        {/* Card 2: TMA */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300 pointer-events-none">
            <Clock size={100} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tempo Médio (TMA)</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{getTMAString()}</h3>
          <p className="text-[11px] text-slate-500 mt-2">
            Média de resolução dos chamados
          </p>
        </div>

        {/* Card 3: SLA */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300 pointer-events-none">
            <ShieldCheck size={100} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA Cumprido</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {slaValue !== null ? `${slaValue}%` : "100%"}
          </h3>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${slaValue !== null && slaValue < 80 ? 'bg-amber-500' : 'bg-green-500'}`} 
              style={{ width: `${slaValue !== null ? slaValue : 100}%` }} 
            />
          </div>
        </div>

        {/* Card 4: Taxa de Resolução */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300 pointer-events-none">
            <TrendingUp size={100} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Resolução</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{getResolutionRate()}%</h3>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${getResolutionRate()}%` }} />
          </div>
        </div>
      </div>

      {/* BI Grid of Charts */}
      {filteredTickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 min-h-80">
          <BarChart3 className="text-slate-300 dark:text-slate-700 mb-3" size={48} />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum chamado no período selecionado</h3>
          <p className="text-xs text-slate-500 mt-1">Experimente mudar o filtro de período ou remover os filtros de data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" ref={chartRef}>
          
          {/* Chart 1: Volumetria ao Longo do Tempo (Abertos vs Resolvidos) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col h-80">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Volumetria de Chamados</h4>
              <button
                onClick={() => openChartDetails(
                  "Histórico de Abertos vs Resolvidos",
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorAberto2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorResolvido2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="Aberto" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAberto2)" />
                      <Area type="monotone" dataKey="Resolvido" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolvido2)" />
                    </AreaChart>
                  </ResponsiveContainer>,
                  timelineData,
                  ["#3b82f6", "#10b981"]
                )}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Maximize2 size={13} />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorAberto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorResolvido" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.3)" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="Aberto" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAberto)" />
                  <Area type="monotone" dataKey="Resolvido" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolvido)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: TMA por Período */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col h-80">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Evolução do TMA</h4>
              <button
                onClick={() => openChartDetails(
                  "Histórico de Tempo de Resolução (TMA)",
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={tmaTimelineData}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="TMA" name="TMA (horas)" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>,
                  tmaTimelineData,
                  ["#f59e0b"]
                )}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Maximize2 size={13} />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tmaTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.3)" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis unit="h" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="TMA" name="TMA" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Distribuição por Status */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col h-80">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Chamados por Status</h4>
              <button
                onClick={() => openChartDetails(
                  "Distribuição por Status",
                  <ResponsiveContainer width="100%" height={350}>
                    <RePieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>,
                  statusData,
                  statusData.map(s => s.color)
                )}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Maximize2 size={13} />
              </button>
            </div>
            <div className="flex-1 flex min-h-0 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} chamados`, 'Total']} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Distribuição por Prioridade */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col h-80">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Chamados por Prioridade</h4>
              <button
                onClick={() => openChartDetails(
                  "Distribuição por Prioridade",
                  <ResponsiveContainer width="100%" height={350}>
                    <RePieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>,
                  priorityData,
                  priorityData.map(p => p.color)
                )}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Maximize2 size={13} />
              </button>
            </div>
            <div className="flex-1 flex min-h-0 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} chamados`, 'Total']} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Setores com Mais Demandas (Barras Horizontais) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col h-80">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Top Setores Críticos</h4>
              <button
                onClick={() => openChartDetails(
                  "Volume por Setores Físicos",
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart layout="vertical" data={sectorData} margin={{ left: 30, right: 30 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Chamados" fill="#3b82f6" radius={[0, 6, 6, 0]}>
                        {sectorData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx === 0 ? "#1e40af" : idx === 1 ? "#357edd" : "#60a5fa"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>,
                  sectorData,
                  ["#3b82f6"]
                )}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Maximize2 size={13} />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={sectorData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(226, 232, 240, 0.3)" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip formatter={(value) => [`${value} chamados`, 'Volume']} />
                  <Bar dataKey="value" name="Volume" radius={[0, 4, 4, 0]}>
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#1d4ed8" : index === 1 ? "#3b82f6" : "#60a5fa"} />
                    ))}
                    <LabelList dataKey="value" position="right" style={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Categorias Mais Comuns (Barras Verticais) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col h-80">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Top Categorias de Demandas</h4>
              <button
                onClick={() => openChartDetails(
                  "Distribuição por Categoria",
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={categoryData} margin={{ top: 20, bottom: 20 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Chamados" fill="#a855f7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>,
                  categoryData,
                  ["#a855f7"]
                )}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Maximize2 size={13} />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 15, bottom: 5, left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.3)" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} chamados`, 'Volume']} />
                  <Bar dataKey="value" name="Volume" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#7c3aed" : "#a855f7"} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Expanded Details Modal */}
      <ChartModal 
        open={modalOpen} 
        onClose={() => { setModalOpen(false); setModalChildren(null); setModalInfo(null); }} 
        title={modalTitle}
        data={modalInfo?.data}
        colors={modalInfo?.colors}
      >
        {modalChildren}
      </ChartModal>
    </div>
  )
}