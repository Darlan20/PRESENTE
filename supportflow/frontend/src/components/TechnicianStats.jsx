/**
 * TechnicianStats.jsx — Cards de estatísticas do painel do Técnico.
 * Mostra: Abertos, Em Andamento, Resolvidos e Com Atraso.
 */
import { AlertTriangle, CheckCircle2, Clock, AlertCircle } from "lucide-react"

export function TechnicianStats({ tickets, delayedTickets }) {
  const openTickets = tickets.filter((t) => t.status === "aberto").length
  const inProgressTickets = tickets.filter((t) => t.status === "em-andamento").length
  const resolvedTickets = tickets.filter((t) => t.status === "resolvido").length
  const delayedCount = delayedTickets.length

  const stats = [
    {
      label: "Abertos",
      value: openTickets,
      icon: AlertCircle,
      bgColor: "bg-slate-900",
      iconColor: "text-rose-300",
      textColor: "text-slate-100",
      accent: "from-rose-500/20 to-rose-500/5",
    },
    {
      label: "Em Andamento",
      value: inProgressTickets,
      icon: Clock,
      bgColor: "bg-slate-900",
      iconColor: "text-sky-300",
      textColor: "text-slate-100",
      accent: "from-sky-500/20 to-sky-500/5",
    },
    {
      label: "Resolvidos",
      value: resolvedTickets,
      icon: CheckCircle2,
      bgColor: "bg-slate-900",
      iconColor: "text-emerald-300",
      textColor: "text-slate-100",
      accent: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      label: "Com Atraso",
      value: delayedCount,
      icon: AlertTriangle,
      bgColor: "bg-slate-900",
      iconColor: "text-amber-300",
      textColor: "text-slate-100",
      accent: "from-amber-500/20 to-amber-500/5",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 shrink-0 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bgColor} relative overflow-hidden rounded-xl border border-slate-800 p-3`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} />
          <div className="flex items-center justify-between">
            <div className="relative">
              <p className="mb-0.5 text-xs text-slate-400">{stat.label}</p>
              <p className={`${stat.textColor} text-xl font-semibold`}>{stat.value}</p>
            </div>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/60">
              <stat.icon className={stat.iconColor} size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
