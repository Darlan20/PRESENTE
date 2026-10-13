/**
 * ManagerStats.jsx — Cards de estatísticas do painel do Gestor.
 * Mostra: Abertos, Em Andamento, Resolvidos, Com Atraso, Membros da Equipe e Taxa de Resolução.
 */
import { AlertTriangle, CheckCircle2, Clock, AlertCircle, Users, TrendingUp } from "lucide-react"

export function ManagerStats({ tickets, delayedTickets, teamMembersCount = 0 }) {
  const openTickets = tickets.filter((t) => t.status === "aberto").length
  const inProgressTickets = tickets.filter((t) => t.status === "em-andamento").length
  const resolvedTickets = tickets.filter((t) => t.status === "resolvido").length
  const delayedCount = delayedTickets.length
  const totalMembers = teamMembersCount

  const resolutionRate = tickets.length > 0
    ? Math.round((resolvedTickets / tickets.length) * 100)
    : 0

  const stats = [
    {
      label: "Abertos",
      value: openTickets,
      icon: AlertCircle,
      bgColor: "bg-white",
      iconColor: "text-red-600",
      textColor: "text-slate-900",
      accent: "from-red-100/40 to-red-100/10",
    },
    {
      label: "Em Andamento",
      value: inProgressTickets,
      icon: Clock,
      bgColor: "bg-white",
      iconColor: "text-blue-600",
      textColor: "text-slate-900",
      accent: "from-blue-100/40 to-blue-100/10",
    },
    {
      label: "Resolvidos",
      value: resolvedTickets,
      icon: CheckCircle2,
      bgColor: "bg-white",
      iconColor: "text-green-600",
      textColor: "text-slate-900",
      accent: "from-green-100/40 to-green-100/10",
    },
    {
      label: "Com Atraso",
      value: delayedCount,
      icon: AlertTriangle,
      bgColor: "bg-white",
      iconColor: "text-orange-600",
      textColor: "text-slate-900",
      accent: "from-orange-100/40 to-orange-100/10",
    },
    {
      label: "Membros da Equipe",
      value: totalMembers,
      icon: Users,
      bgColor: "bg-white",
      iconColor: "text-blue-600",
      textColor: "text-slate-900",
      accent: "from-blue-100/40 to-blue-100/10",
    },
    {
      label: "Taxa de Resolução",
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      bgColor: "bg-white",
      iconColor: "text-green-600",
      textColor: "text-slate-900",
      accent: "from-green-100/40 to-green-100/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 shrink-0 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
      <div
        key={stat.label}
        className={`${stat.bgColor} relative overflow-hidden rounded-xl border border-slate-200 p-3`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} />
        <div className="flex items-center justify-between">
          <div className="relative">
            <p className="mb-0.5 text-xs text-slate-500">{stat.label}</p>
            <p className={`${stat.textColor} text-xl font-semibold`}>{stat.value}</p>
          </div>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
            <stat.icon className={stat.iconColor} size={20} />
          </div>
        </div>
      </div>
      ))}
    </div>
  )
}
