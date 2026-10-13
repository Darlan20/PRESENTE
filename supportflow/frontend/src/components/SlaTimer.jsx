import React, { useEffect, useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'

export function SlaTimer({ ticket, detailed = false, showIcon = true }) {
  const [timeLeftStr, setTimeLeftStr] = useState('')
  const [statusStyle, setStatusStyle] = useState({ cls: '', text: '', type: '' })

  const { createdAt, updatedAt, status, slaHoras } = ticket

  useEffect(() => {
    if (!slaHoras || !createdAt) {
      setTimeLeftStr('-')
      setStatusStyle({ cls: 'text-slate-400 dark:text-slate-600', text: 'Sem SLA', type: 'none' })
      return
    }

    const createdTime = new Date(createdAt).getTime()
    const targetTime = createdTime + (slaHoras * 60 * 60 * 1000)
    const tickInterval = detailed ? 1000 : 30000 // 1s in modal, 30s in lists

    // Helper to format duration
    const formatDuration = (ms) => {
      const absMs = Math.abs(ms)
      const totalSeconds = Math.floor(absMs / 1000)
      const days = Math.floor(totalSeconds / (3600 * 24))
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      const pad = (num) => String(num).padStart(2, '0')

      if (days > 0) {
        if (detailed) {
          return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
        }
        return `${days}d ${pad(hours)}h ${pad(minutes)}m`
      }

      if (detailed) {
        return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
      }
      return `${pad(hours)}h ${pad(minutes)}m`
    }

    if (status === 'resolvido') {
      const resolvedTime = new Date(updatedAt || Date.now()).getTime()
      const diffMs = resolvedTime - createdTime
      const inSla = diffMs <= (slaHoras * 60 * 60 * 1000)

      if (inSla) {
        setTimeLeftStr(formatDuration(diffMs))
        setStatusStyle({
          cls: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30',
          text: 'No prazo',
          type: 'success'
        })
      } else {
        const exceededMs = diffMs - (slaHoras * 60 * 60 * 1000)
        setTimeLeftStr(`+${formatDuration(exceededMs)}`)
        setStatusStyle({
          cls: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40',
          text: 'Estourado',
          type: 'danger'
        })
      }
      return
    }

    // Unresolved: active countdown
    const updateTimer = () => {
      const now = Date.now()
      const diffMs = targetTime - now

      if (diffMs > 0) {
        setTimeLeftStr(formatDuration(diffMs))
        const twoHours = 2 * 60 * 60 * 1000
        if (diffMs < twoHours) {
          // Pulse yellow/orange warning
          setStatusStyle({
            cls: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50 animate-pulse-warning border shadow-[0_0_8px_rgba(245,158,11,0.15)]',
            text: 'Crítico',
            type: 'warning'
          })
        } else {
          setStatusStyle({
            cls: 'bg-blue-50 dark:bg-blue-950/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
            text: 'No prazo',
            type: 'active'
          })
        }
      } else {
        // Exceeded / Breached
        setTimeLeftStr(`-${formatDuration(diffMs)}`)
        setStatusStyle({
          cls: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800/50 animate-pulse-danger border shadow-[0_0_8px_rgba(239,68,68,0.25)] font-bold',
          text: 'Estourado',
          type: 'breached'
        })
      }
    }

    updateTimer() // run immediately
    const interval = setInterval(updateTimer, tickInterval)
    return () => clearInterval(interval)
  }, [createdAt, updatedAt, status, slaHoras, detailed])

  if (!slaHoras) {
    return <span className="text-xs text-slate-400 dark:text-slate-600">-</span>
  }

  const getIcon = () => {
    if (!showIcon) return null
    if (status === 'resolvido') {
      return statusStyle.type === 'success' ? (
        <CheckCircle size={12} className="text-green-500 shrink-0" />
      ) : (
        <ShieldAlert size={12} className="text-red-500 shrink-0" />
      )
    }
    if (statusStyle.type === 'warning') {
      return <AlertTriangle size={12} className="text-amber-500 shrink-0" />
    }
    if (statusStyle.type === 'breached') {
      return <ShieldAlert size={12} className="text-red-500 shrink-0" />
    }
    return <Clock size={12} className="text-blue-500 shrink-0" />
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {/* Dynamic Keyframes for pulsing warning and danger states */}
      <style>{`
        @keyframes pulseWarning {
          0%, 100% {
            border-color: rgba(245, 158, 11, 0.4);
            box-shadow: 0 0 4px rgba(245, 158, 11, 0.15);
          }
          50% {
            border-color: rgba(217, 119, 6, 0.8);
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
          }
        }
        @keyframes pulseDanger {
          0%, 100% {
            border-color: rgba(239, 68, 68, 0.4);
            box-shadow: 0 0 4px rgba(239, 68, 68, 0.2);
            background-color: rgba(239, 68, 68, 0.04);
          }
          50% {
            border-color: rgba(185, 28, 28, 0.8);
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
            background-color: rgba(239, 68, 68, 0.12);
          }
        }
        .animate-pulse-warning {
          animation: pulseWarning 2s infinite ease-in-out;
        }
        .animate-pulse-danger {
          animation: pulseDanger 1.5s infinite ease-in-out;
        }
      `}</style>
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle.cls}`}>
        {getIcon()}
        <span className="font-mono">{timeLeftStr}</span>
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
        {statusStyle.text} ({slaHoras}h total)
      </span>
    </div>
  )
}
