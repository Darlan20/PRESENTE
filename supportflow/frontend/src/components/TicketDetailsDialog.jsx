/**
 * TicketDetailsDialog.jsx — Modal de detalhes do chamado.
 * Exibe todas as informações do chamado e faz o download autenticado do anexo.
 */
import { useEffect, useState } from 'react'
import { X, Paperclip, Loader2, Download } from 'lucide-react'
import api from '../services/api'
import { SlaTimer } from './SlaTimer'

export function TicketDetailsDialog({ isOpen, ticket, onClose }) {
  const [attachmentUrl, setAttachmentUrl] = useState(null)
  const [attachmentType, setAttachmentType] = useState('')
  const [attachmentError, setAttachmentError] = useState('')
  const [loadingAttachment, setLoadingAttachment] = useState(false)
  const [attachmentChecked, setAttachmentChecked] = useState(false)

  const isImageAttachment = (name, type) => {
    const normalizedType = (type || '').toLowerCase()
    const normalizedName = (name || '').toLowerCase()

    if (normalizedType.startsWith('image/')) return true

    return [
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.webp',
      '.bmp',
      '.svg',
    ].some((extension) => normalizedName.endsWith(extension))
  }

  const resolveTicketId = (selectedTicket) => {
    if (!selectedTicket) return null
    if (selectedTicket._id !== undefined && selectedTicket._id !== null) {
      return selectedTicket._id
    }

    if (typeof selectedTicket.id === 'string' && selectedTicket.id.startsWith('TKT-')) {
      return selectedTicket.id.replace('TKT-', '')
    }

    return selectedTicket.id ?? null
  }

  useEffect(() => {
    let active = true
    let objectUrl = null

    const resetAttachmentState = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
      setAttachmentUrl(null)
      setAttachmentType('')
      setAttachmentError('')
      setLoadingAttachment(false)
      setAttachmentChecked(false)
    }

    if (!isOpen || !ticket) {
      resetAttachmentState()
      return undefined
    }

    const resolvedId = resolveTicketId(ticket)
    if (!resolvedId) {
      setAttachmentError('Não foi possível identificar o chamado para carregar o anexo.')
      setAttachmentChecked(true)
      return undefined
    }

    const loadAttachment = async () => {
      setLoadingAttachment(true)
      setAttachmentError('')

      try {
        const response = await api.get(`/chamados/${resolvedId}/anexo`, {
          responseType: 'blob',
        })

        if (!active) return

        objectUrl = URL.createObjectURL(response.data)
        setAttachmentUrl(objectUrl)
        setAttachmentType(response.data.type || ticket.attachmentContentType || '')
      } catch (error) {
        if (active) {
          const status = error?.response?.status
          if (status === 404) {
            setAttachmentError('O anexo não foi encontrado no servidor.')
          } else if (status === 403) {
            setAttachmentError('Você não tem permissão para visualizar este anexo.')
          } else {
            setAttachmentError('Não foi possível carregar o anexo deste chamado.')
          }
        }
      } finally {
        if (active) {
          setLoadingAttachment(false)
          setAttachmentChecked(true)
        }
      }
    }

    loadAttachment()

    return () => {
      active = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [isOpen, ticket])

  if (!isOpen || !ticket) return null

  const isImage = isImageAttachment(ticket.attachmentName, attachmentType || ticket.attachmentContentType)
  const hasAttachment = Boolean(ticket.attachmentName || attachmentUrl || ticket.attachmentContentType)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Detalhes do chamado</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{ticket.id}</h2>
            <p className="text-sm text-slate-500 line-clamp-2 break-words">{ticket.title}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
            aria-label="Fechar detalhes do chamado"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {ticket.status}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {ticket.priority}
                </span>
                {ticket.category && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    {ticket.category}
                  </span>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Solicitante</p>
                  <p className="text-sm text-slate-900">{ticket.requester}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Email</p>
                  <p className="text-sm text-slate-900">{ticket.email}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Criado em</p>
                  <p className="text-sm text-slate-900">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ticket.createdAt))}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Atualizado em</p>
                  <p className="text-sm text-slate-900">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ticket.updatedAt))}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Setor de atendimento</p>
                  <p className="text-sm text-slate-900">{ticket.setorAtendimento || '-'}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Técnico responsável</p>
                  <p className="text-sm text-slate-900">{ticket.tecnicoResponsavelNome || '-'}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">SLA</p>
                  <div className="text-sm text-slate-900 mt-1">
                    <SlaTimer ticket={ticket} detailed={true} />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-slate-900">Descrição do problema</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.description || '-'}</p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-slate-900">Justificativa da triagem</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.triagemJustificativa || '-'}</p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-slate-900">Localização</p>
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p><span className="text-slate-500">Setor:</span> {ticket.setor || '-'}</p>
                <p><span className="text-slate-500">Bloco:</span> {ticket.bloco || ticket.andar || '-'}</p>
                <p><span className="text-slate-500">Sala:</span> {ticket.sala || '-'}</p>
                <p><span className="text-slate-500">Unidade:</span> {ticket.unidade || '-'}</p>
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <Paperclip size={18} />
                <p className="text-sm font-semibold">Anexo</p>
              </div>

              {loadingAttachment && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando anexo...
                </div>
              )}

              {attachmentChecked && !hasAttachment && !attachmentError && !loadingAttachment && (
                <p className="text-sm text-slate-500">Este chamado não possui anexo.</p>
              )}

              {attachmentError && (
                <p className="text-sm text-red-600">{attachmentError}</p>
              )}

              {attachmentUrl && isImage && (
                <div className="space-y-3">
                  <img
                    src={attachmentUrl}
                    alt={ticket.attachmentName || `Anexo de ${ticket.id}`}
                    className="max-h-105 w-full rounded-xl border border-slate-200 object-contain bg-white"
                  />
                  <a
                    href={attachmentUrl}
                    download={ticket.attachmentName || `anexo-${ticket.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    <Download size={16} />
                    Baixar imagem
                  </a>
                </div>
              )}

              {attachmentUrl && !isImage && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">{ticket.attachmentName || `anexo-${ticket.id}`}</p>
                    <p className="mt-1 text-slate-500">O anexo foi carregado com sucesso e pode ser baixado.</p>
                  </div>
                  <a
                    href={attachmentUrl}
                    download={ticket.attachmentName || `anexo-${ticket.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    <Download size={16} />
                    Baixar anexo
                  </a>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-slate-900">Resumo</p>
              <div className="space-y-2 text-sm text-slate-700">
                <p><span className="text-slate-500">ID:</span> {ticket.id}</p>
                <p><span className="text-slate-500">Categoria:</span> {ticket.category || '-'}</p>
                <p><span className="text-slate-500">Status:</span> {ticket.status}</p>
                <p><span className="text-slate-500">Prioridade:</span> {ticket.priority}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}