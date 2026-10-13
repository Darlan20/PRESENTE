/**
 * UserTicketList.jsx — Lista de chamados do Usuário.
 * Exibe chamados com status, prioridade e opção de expandir detalhes.
 */
import { useState } from "react"
import { Badge } from "./ui/badge"
import { Card } from "./ui/card"
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  MessageSquare
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const statusConfig = {
  aberto: {
    label: "Aberto",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  "em-andamento": {
    label: "Em Andamento",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  resolvido: {
    label: "Resolvido",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
}

const priorityConfig = {
  baixa: { label: "Baixa", color: "bg-slate-100 text-slate-600" },
  média: { label: "Média", color: "bg-amber-100 text-amber-700" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700" },
  urgente: { label: "Urgente", color: "bg-red-100 text-red-700" },
}

export function UserTicketList({ tickets, onOpenChat }) {
  const [expandedTicket, setExpandedTicket] = useState(null)

  const toggleExpand = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId)
  }

  if (tickets.length === 0) {
    return (
      <Card className="flex h-full items-center justify-center border-slate-200 bg-white">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-slate-400" />
          <p className="text-slate-500">Você ainda não tem chamados abertos</p>
          <p className="mt-1 text-sm text-slate-400">
            Crie seu primeiro chamado usando o formulário ao lado
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col border-slate-200 bg-white shadow-[0_12px_32px_rgba(2,6,23,0.08)]">
      <div className="border-b border-slate-200 bg-slate-50 p-3">
        <h2 className="font-semibold text-slate-900">Histórico de Chamados</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-slate-200">
          {tickets.map((ticket) => {
            const StatusIcon = statusConfig[ticket.status]?.icon || AlertCircle
            const isExpanded = expandedTicket === ticket.id

            return (
              <div key={ticket.id} className="p-3 transition-colors hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 min-w-0 pr-3 cursor-pointer"
                    onClick={() => toggleExpand(ticket.id)}
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-blue-600">{ticket.id}</span>
                      <Badge className={`${statusConfig[ticket.status]?.color} text-xs px-1.5 py-0`}>
                        <StatusIcon size={12} className="mr-1" />
                        {statusConfig[ticket.status]?.label}
                      </Badge>
                      <Badge className={`${priorityConfig[ticket.priority]?.color} text-xs px-1.5 py-0`}>
                        {priorityConfig[ticket.priority]?.label}
                      </Badge>
                    </div>
                    <h3 className="mb-1 line-clamp-1 font-medium leading-tight text-slate-900">
                      {ticket.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {typeof onOpenChat === 'function' && (
                      <button
                        onClick={() => onOpenChat(ticket.id)}
                        className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors text-xs font-medium"
                        title="Abrir chat do chamado"
                      >
                        <MessageSquare size={16} />
                        <span>Chat</span>
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpand(ticket.id)}
                      className="rounded p-1 hover:bg-slate-100"
                    >
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-slate-500" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Descrição:</p>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                      <p><span className="text-xs text-slate-500">Setor de atendimento:</span> {ticket.setorAtendimento || '-'}</p>
                      <p><span className="text-xs text-slate-500">SLA:</span> {ticket.slaHoras ? `${ticket.slaHoras}h` : '-'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Justificativa da triagem:</p>
                      <p className="text-sm text-slate-600">{ticket.triagemJustificativa || '-'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Localização:</p>
                      <p className="text-sm text-slate-600">
                        {`${ticket.setor || '-'} | Bloco ${ticket.bloco || ticket.andar || '-'} | Sala ${ticket.sala || '-'} | Unidade ${ticket.unidade || '-'}`}
                      </p>
                    </div>
                    {ticket.attachmentName && (
                      <div>
                        <p className="mb-1 text-xs text-slate-500">Anexo:</p>
                        <span className="text-sm font-medium text-blue-600">Arquivo enviado</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Última atualização: {format(new Date(ticket.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <div>
                        {typeof onOpenChat === 'function' && (
                          <button
                            onClick={() => onOpenChat(ticket.id)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Abrir Chat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
