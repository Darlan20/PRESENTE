/**
 * UserStats.jsx — Cards de estatísticas do painel do Usuário.
 * Mostra totais de chamados: Total, Abertos, Em Andamento e Resolvidos.
 */
import { CheckCircle2, Clock, AlertCircle, Ticket as TicketIcon } from "lucide-react"
import { Card, CardContent } from "./ui/card"

export function UserStats({ tickets }) {
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "aberto").length,
    inProgress: tickets.filter((t) => t.status === "em-andamento").length,
    resolved: tickets.filter((t) => t.status === "resolvido").length,
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs leading-tight text-slate-500">Total</p>
              <p className="text-2xl font-semibold leading-none text-slate-900">{stats.total}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-blue-100">
              <TicketIcon className="text-blue-600" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs leading-tight text-slate-500">Abertos</p>
              <p className="text-2xl font-semibold leading-none text-slate-900">{stats.open}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-red-100">
              <AlertCircle className="text-red-600" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs leading-tight text-slate-500">Em Andamento</p>
              <p className="text-2xl font-semibold leading-none text-slate-900">{stats.inProgress}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-blue-100">
              <Clock className="text-blue-600" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs leading-tight text-slate-500">Resolvidos</p>
              <p className="text-2xl font-semibold leading-none text-slate-900">{stats.resolved}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-green-100">
              <CheckCircle2 className="text-green-600" size={20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
