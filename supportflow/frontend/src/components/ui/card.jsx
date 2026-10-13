/**
 * card.jsx — Componentes reutilizáveis de Card (cartão).
 * Exporta: Card, CardContent, CardHeader, CardTitle.
 * Usado em dashboards para exibir estatísticas e conteúdo agrupado.
 */
import React from "react"
import { cn } from "../../lib/utils"

const sizeClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const shadowClasses = {
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

export function Card({ className, size = 'md', shadow = 'md', ...props }) {
  return (
    <div
      className={cn(
        "bg-white text-slate-900 flex flex-col rounded-xl border border-slate-200 transition-shadow",
        sizeClasses[size],
        shadowClasses[shadow],
        className,
      )}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={cn("[&:last-child]:pb-6", className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("pt-6", className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }) {
  return (
    <h4
      className={cn("leading-none font-semibold text-lg text-slate-900", className)}
      {...props}
    />
  )
}
