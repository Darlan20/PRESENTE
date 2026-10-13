/**
 * badge.jsx — Componente de Badge (etiqueta).
 * Usado para exibir status (aberto, resolvido) e prioridade (alta, média, baixa) nos chamados.
 */
import React from "react"
import { cn } from "../../lib/utils"

const variants = {
  default: 'border-slate-200 bg-slate-100 text-slate-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
}

export function Badge({ className, children, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
