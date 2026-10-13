import React, { useEffect } from 'react'
import { X, Download, TrendingUp } from 'lucide-react'

export function ChartModal({ open, onClose, title, data, colors, chartType, onDownload, children }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (!open) return null

  const total = data?.reduce((acc, item) => acc + (item.value || item.aberto || item.resolvido || 0), 0) || 0
  const avg = data?.length ? (total / data.length).toFixed(1) : 0
  const max = data?.reduce((acc, item) => Math.max(acc, item.value || item.aberto || item.resolvido || 0), 0) || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-60 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-4 sm:p-6">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900 sm:text-xl">{title}</h3>
            {chartType && (
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Tipo de visualização: <span className="font-medium">{chartType}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Summary */}
        {data && (
          <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-slate-200 bg-slate-50 p-3 sm:gap-4 sm:p-6">
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">Total</p>
              <p className="mt-1 text-lg font-bold text-slate-900 sm:text-2xl">{total}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">Média</p>
              <p className="mt-1 text-lg font-bold text-blue-600 sm:text-2xl">{avg}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">Máximo</p>
              <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">{max}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {children || (
            data && (
              <div className="space-y-2">
                {data.map((item, index) => {
                  const value = item.value ?? item.aberto ?? item.resolvido ?? 0
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                  const color = colors?.[index % colors.length] || '#3b82f6'

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-slate-900">
                          {item.name || item.date}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-slate-500">{percentage}%</span>
                        <span className="flex items-center space-x-1 text-lg font-semibold text-slate-900">
                          <TrendingUp size={16} className="text-blue-600" />
                          <span>{value}</span>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:p-6">
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Download size={16} />
              <span>Baixar Gráfico SVG</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}