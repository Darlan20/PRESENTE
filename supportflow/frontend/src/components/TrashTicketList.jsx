import React from 'react'
import { Trash2, RotateCw, Trash } from 'lucide-react'
import { toast } from 'sonner'

export default function TrashTicketList({ tickets = [], onRecoverTicket, onDeletePermanent, onViewTicket }) {
  const handleRecover = async (t) => {
    try {
      await onRecoverTicket?.(t._id || t.id)
      toast.success('Chamado restaurado com sucesso')
    } catch {
      toast.error('Falha ao restaurar chamado')
    }
  }

  const handlePermanent = async (t) => {
    if (!window.confirm('Excluir definitivamente este chamado? A ação é irreversível.')) return
    try {
      await onDeletePermanent?.(t._id || t.id)
      toast.success('Chamado excluído permanentemente')
    } catch {
      toast.error('Falha ao excluir chamado')
    }
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">Nenhum chamado na lixeira.</div>
    )
  }

  return (
    <div className="overflow-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full min-w-[640px]">
        <thead className="border-b bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Título</th>
            <th className="px-4 py-2 text-left">Solicitante</th>
            <th className="px-4 py-2 text-left">Excluído em</th>
            <th className="px-4 py-2 text-left">Por</th>
            <th className="px-4 py-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tickets.map(t => (
            <tr key={t._id || t.id}>
              <td className="px-4 py-3 font-mono text-sm text-blue-600">{t.id || t._id}</td>
              <td className="px-4 py-3 max-w-[220px] truncate">{t.title || t.titulo}</td>
              <td className="px-4 py-3 max-w-[180px] truncate">{t.requester || t.solicitante}</td>
              <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{t.deletedAt ? new Date(t.deletedAt).toLocaleString() : '-'}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{t.deletedBy || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button title="Restaurar" onClick={() => handleRecover(t)} className="rounded-lg p-2 text-green-600 hover:bg-green-50">
                    <RotateCw size={16} />
                  </button>
                  <button title="Excluir permanentemente" onClick={() => handlePermanent(t)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                    <Trash size={16} />
                  </button>
                  {onViewTicket && (
                    <button title="Ver detalhes" onClick={() => onViewTicket(t._id || t.id)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
