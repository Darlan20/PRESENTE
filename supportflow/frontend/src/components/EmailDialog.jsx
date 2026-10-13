/**
 * EmailDialog.jsx — Modal de envio de e-mail.
 * Permite ao técnico/gestor enviar e-mail para o solicitante de um chamado.
 */
import { useState, useEffect } from "react"
import { X, Send, Mail } from "lucide-react"
import { toast } from "sonner"
import { authAPI, getApiErrorMessage } from "../services/api"

export function EmailDialog({ isOpen, ticket, onClose }) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (ticket) {
      setSubject(`Atualização do Chamado ${ticket.id}: ${ticket.title}`)
      setMessage(
        `Olá ${ticket.requester},\n\nEste é um email sobre o chamado ${ticket.id}.\n\nStatus atual: ${ticket.status}\nPrioridade: ${ticket.priority}\n\nAtenciosamente,\nEquipe de Suporte`
      )
    }
  }, [ticket])

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Assunto e mensagem são obrigatórios")
      return
    }

    setIsSending(true)
    try {
      await authAPI.enviarEmail({
        para: ticket?.email,
        assunto: subject,
        corpo: message,
      })
      toast.success("Email enviado com sucesso!", {
        description: `Enviado para ${ticket?.email}`,
      })
      setIsSending(false)
      setSubject("")
      setMessage("")
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao enviar email"))
      setIsSending(false)
    }
  }

  if (!isOpen || !ticket) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-white">
            <Mail size={24} />
            <div>
              <h2 className="text-white font-semibold">Enviar Email</h2>
              <p className="text-blue-100 text-sm">Chamado {ticket.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Recipient Info */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-slate-500 text-sm">Para:</p>
                <p className="text-slate-900 break-words">{ticket.requester}</p>
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-sm">Email:</p>
                <p className="text-slate-900 break-all">{ticket.email}</p>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-slate-900 font-medium">
              Assunto
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/30 bg-white text-slate-900 placeholder:text-slate-400"
              placeholder="Assunto do email"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="block text-slate-900 font-medium">
              Mensagem
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/30 resize-none bg-white text-slate-900 placeholder:text-slate-400"
              rows={10}
              placeholder="Digite sua mensagem..."
            />
          </div>

          {/* Ticket Details */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-slate-900 font-medium mb-2">Detalhes do Chamado</p>
            <div className="space-y-1 text-slate-600 text-sm">
              <p>ID: {ticket.id}</p>
              <p>Título: {ticket.title}</p>
              <p>Status: {ticket.status}</p>
              <p>Prioridade: {ticket.priority}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !subject || !message}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            <span>{isSending ? "Enviando..." : "Enviar Email"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
