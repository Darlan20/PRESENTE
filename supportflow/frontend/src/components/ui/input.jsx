import React from 'react'
import { cn } from '../../lib/utils'

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-base',
}

export function Input({
  className,
  label,
  error,
  size = 'md',
  required = false,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="text-sm font-medium text-slate-900">
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </label>
      ) : null}
      <input
        className={cn(
          'w-full rounded-lg border-2 border-slate-200 bg-white text-slate-900 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50',
          sizes[size],
          error ? 'border-red-500 focus:border-red-600 focus:ring-red-100' : '',
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
