/**
 * GestorPage — Painel do Gestor.
 */
import { createElement, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TechnicianTicketList } from '../../components/TechnicianTicketList'
import { UserTicketForm } from '../../components/UserTicketForm'
import { ReportsSection } from '../../components/ReportsSection'
import { LocationManagement } from '../../components/LocationManagement'
import { EmailDialog } from '../../components/EmailDialog'
import { TicketDetailsDialog } from '../../components/TicketDetailsDialog'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { chamadoAPI, usuarioAPI, getApiErrorMessage } from '../../services/api'
import { mapChamado } from '../../lib/mapChamado'
import { useRealtimeTickets } from '../../lib/realtime'
import { BarChart3, Ticket as TicketIcon, UserPlus, Trash2, Settings, Plus, X } from 'lucide-react'
import TrashTicketList from '../../components/TrashTicketList'
import { ChatPanel } from '../../components/ChatPanel'
import { AccountMenu } from '../../components/AccountMenu'
import { toast } from 'sonner'
import { usuarioStyles as gestorBaseStyles } from '../UsuarioPage/UsuarioStyles'

const gestorTabStyles = `
  .up-stat-icon-purple { background: rgba(139,92,246,.12); }

  .up-tab-nav {
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    padding: 0 1.5rem;
    gap: 0;
    scrollbar-width: none;
    flex-shrink: 0;
  }
  .up-tab-nav::-webkit-scrollbar { display: none; }

  .up-tab-item {
    display: flex; align-items: center; gap: 7px;
    padding: 14px 16px;
    font-size: 12.5px; font-weight: 500;
    color: var(--text-soft);
    border: none; border-bottom: 2px solid transparent;
    margin-bottom: -1px; background: none;
    cursor: pointer; white-space: nowrap;
    transition: color .15s, border-color .15s, background .15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    flex-shrink: 0; letter-spacing: .01em;
  }
  .up-tab-item:hover { color: var(--text); background: rgba(255,255,255,0.04); }
  .up-tab-item.active { color: var(--accent); border-bottom-color: var(--accent); }
  .up-tab-item svg { opacity: .7; transition: opacity .15s; }
  .up-tab-item.active svg, .up-tab-item:hover svg { opacity: 1; }

  .up-tab-panel {
    flex: 1; overflow-y: auto;
    padding: 1.5rem; background: var(--bg); min-height: 0;
  }
  @media (max-width: 640px) {
    .up-tab-item span { display: none; }
    .up-tab-item { padding: 14px 13px; }
    .up-tab-panel { padding: 1rem; padding-bottom: 96px; }
  }

  .up-panel-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    margin-bottom: 1.5rem;
  }
  .up-panel-card:last-child { margin-bottom: 0; }
  .up-panel-card-header {
    display: flex; align-items: center; gap: 8px;
    padding: .875rem 1.5rem;
    border-bottom: 1px solid var(--border);
    font-size: 13.5px; font-weight: 600; color: var(--text);
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: rgba(255,255,255,0.02);
  }
  .up-panel-card-body { padding: 1.5rem; }

  .up-user-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem 1.25rem;
  }
  .up-user-form-grid .up-field-full { grid-column: 1 / -1; }
  .up-field label {
    display: block; font-size: 11.5px; font-weight: 600;
    color: var(--text-soft); text-transform: uppercase;
    letter-spacing: .06em; margin-bottom: 6px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .up-user-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .up-user-table thead tr { border-bottom: 1px solid var(--border); }
  .up-user-table th {
    padding: 10px 16px; text-align: left;
    font-size: 10.5px; font-weight: 700; color: var(--text-soft);
    text-transform: uppercase; letter-spacing: .07em;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: rgba(255,255,255,0.015);
  }
  .up-user-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background .12s;
  }
  .up-user-table tbody tr:last-child { border-bottom: none; }
  .up-user-table tbody tr:hover { background: rgba(255,255,255,0.03); }
  .up-user-table td {
    padding: 12px 16px; color: var(--text);
    font-family: 'Plus Jakarta Sans', sans-serif; vertical-align: middle;
  }
  .up-user-table td.muted { color: var(--text-soft); }

  .up-role-badge {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 100px;
    font-size: 10.5px; font-weight: 700; letter-spacing: .05em;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .up-role-badge.gestor  { background: rgba(139,92,246,.15); color: #c4b5fd; border: 1px solid rgba(139,92,246,.25); }
  .up-role-badge.tecnico { background: rgba(43,108,255,.15);  color: #7eb8ff; border: 1px solid rgba(43,108,255,.25); }
  .up-role-badge.usuario { background: rgba(255,255,255,.06); color: var(--text-soft); border: 1px solid var(--border); }

  .up-user-mobile-card {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .up-user-mobile-card:last-child { border-bottom: none; }
  .up-user-mobile-card .name  { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .up-user-mobile-card .email { font-size: 11.5px; color: var(--text-soft); margin-bottom: 6px; }

  .up-delete-btn {
    background: none; border: none; padding: 10px; border-radius: 8px;
    color: var(--text-soft); cursor: pointer;
    transition: color .15s, background .15s; flex-shrink: 0;
  }
  .up-delete-btn:hover { color: #f87171; background: rgba(239,68,68,.1); }

  .up-submit-btn {
    width: 100%;
    background: var(--accent); color: #fff;
    border: none; border-radius: 10px;
    padding: 11px 0; font-weight: 600; font-size: 13px;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: .01em;
    transition: background .2s, box-shadow .2s, transform .15s, opacity .15s;
  }
  .up-submit-btn:hover:not(:disabled) {
    background: #3a78ff;
    box-shadow: 0 6px 20px rgba(43,108,255,.35);
    transform: translateY(-1px);
  }
  .up-submit-btn:disabled { opacity: .6; cursor: not-allowed; }

  @media (max-width: 768px) {
    /* Gráficos permanecem visíveis no mobile, apenas com altura reduzida
       para caber melhor na tela e evitar overflow horizontal.
       Importante: o miolo do gráfico precisa de altura fixa em px (não %),
       senão o Recharts mede 0px no primeiro render mobile e o gráfico
       nunca aparece. */
    .up-reports-wrap [class*="h-80"] {
      height: 260px !important;
    }
    .up-reports-wrap [class*="h-80"] > div:last-child {
      flex: none !important;
      height: 200px !important;
      min-height: 200px !important;
    }
    .up-reports-wrap .recharts-responsive-container {
      min-height: 200px;
    }
    .up-reports-wrap .recharts-legend-wrapper {
      font-size: 10px;
    }
  }
  @media (max-width: 480px) {
    .up-reports-wrap [class*="h-80"] {
      height: 220px !important;
    }
    .up-reports-wrap [class*="h-80"] > div:last-child {
      height: 165px !important;
      min-height: 165px !important;
    }
    .up-reports-wrap .recharts-responsive-container {
      min-height: 165px;
    }
  }

  .up-location-wrap,
  .up-location-wrap > *,
  .up-location-wrap [class*="bg-white"],
  .up-location-wrap [class*="bg-slate-5"],
  .up-location-wrap [class*="bg-slate-1"],
  .up-location-wrap [class*="bg-gray-5"],
  .up-location-wrap [class*="bg-gray-1"] { background: transparent !important; }
  .up-location-wrap [class*="bg-slate-9"],
  .up-location-wrap [class*="bg-slate-8"] { background: var(--surface) !important; }

  .up-location-wrap [class*="rounded"][class*="border"],
  .up-location-wrap [class*="rounded-lg"],
  .up-location-wrap [class*="rounded-xl"],
  .up-location-wrap [class*="shadow"] {
    background: var(--surface) !important;
    border-color: var(--border) !important;
    box-shadow: none !important;
    border-radius: 16px !important;
  }
  .up-location-wrap [class*="rounded-lg"]:hover,
  .up-location-wrap [class*="rounded-xl"]:hover {
    background: var(--card-hover) !important;
    border-color: var(--border-mid) !important;
  }

  .up-location-wrap [class*="border-slate"],
  .up-location-wrap [class*="border-gray"],
  .up-location-wrap [class*="border-zinc"],
  .up-location-wrap [class*="divide-slate"] > * + *,
  .up-location-wrap [class*="divide-gray"] > * + * { border-color: var(--border) !important; }

  .up-location-wrap [class*="text-slate-9"],
  .up-location-wrap [class*="text-slate-8"],
  .up-location-wrap [class*="text-slate-7"],
  .up-location-wrap [class*="text-gray-9"],
  .up-location-wrap [class*="text-gray-8"],
  .up-location-wrap [class*="text-zinc-9"],
  .up-location-wrap h1, .up-location-wrap h2,
  .up-location-wrap h3, .up-location-wrap h4,
  .up-location-wrap label { color: var(--text) !important; font-family: 'Plus Jakarta Sans', sans-serif !important; }
  .up-location-wrap [class*="text-slate-5"],
  .up-location-wrap [class*="text-slate-6"],
  .up-location-wrap [class*="text-gray-5"],
  .up-location-wrap [class*="text-gray-6"],
  .up-location-wrap [class*="text-zinc-5"] { color: var(--text-muted) !important; }
  .up-location-wrap [class*="text-slate-4"],
  .up-location-wrap [class*="text-gray-4"],
  .up-location-wrap [class*="text-zinc-4"] { color: var(--text-soft) !important; }

  .up-location-wrap input,
  .up-location-wrap select,
  .up-location-wrap textarea {
    background: var(--card) !important;
    border: 1.5px solid var(--border) !important;
    border-radius: 9px !important;
    color: var(--text) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    outline: none !important;
    transition: border-color .2s, box-shadow .2s !important;
  }
  .up-location-wrap input::placeholder,
  .up-location-wrap textarea::placeholder { color: var(--text-soft) !important; }
  .up-location-wrap input:hover,
  .up-location-wrap select:hover,
  .up-location-wrap textarea:hover { border-color: var(--border-mid) !important; }
  .up-location-wrap input:focus,
  .up-location-wrap select:focus,
  .up-location-wrap textarea:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent-pulse) !important;
  }
  .up-location-wrap select { color-scheme: dark !important; }
  .up-location-wrap select option { background: #0f1e30 !important; color: var(--text) !important; }

  .up-location-wrap button[class*="bg-blue"],
  .up-location-wrap button[class*="bg-indigo"],
  .up-location-wrap [class*="bg-blue-6"],
  .up-location-wrap [class*="bg-blue-5"],
  .up-location-wrap button[type="submit"] {
    background: var(--accent) !important;
    border-color: var(--accent) !important;
    color: #fff !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    border-radius: 9px !important;
    font-weight: 600 !important;
    transition: background .2s, box-shadow .2s, transform .15s !important;
    border: none !important;
  }
  .up-location-wrap button[class*="bg-blue"]:hover,
  .up-location-wrap button[type="submit"]:hover {
    background: #3a78ff !important;
    box-shadow: 0 6px 20px rgba(43,108,255,.35) !important;
    transform: translateY(-1px) !important;
  }

  .up-location-wrap button[class*="bg-red"],
  .up-location-wrap button[class*="text-red"] {
    background: rgba(239,68,68,.1) !important;
    color: #f87171 !important;
    border: 1px solid rgba(239,68,68,.2) !important;
    border-radius: 8px !important;
    transition: background .15s !important;
  }
  .up-location-wrap button[class*="bg-red"]:hover,
  .up-location-wrap button[class*="text-red"]:hover {
    background: rgba(239,68,68,.2) !important;
    border-color: rgba(239,68,68,.35) !important;
  }

  .up-location-wrap button:not([class*="bg-blue"]):not([class*="bg-red"]):not([class*="bg-indigo"]):not([type="submit"]) {
    background: var(--card) !important;
    border: 1.5px solid var(--border) !important;
    color: var(--text-muted) !important;
    border-radius: 9px !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    transition: border-color .2s, background .2s, color .2s !important;
  }
  .up-location-wrap button:not([class*="bg-blue"]):not([class*="bg-red"]):not([class*="bg-indigo"]):not([type="submit"]):hover {
    border-color: var(--border-mid) !important;
    background: var(--card-hover) !important;
    color: var(--text) !important;
  }

  .up-location-wrap [class*="bg-green"] {
    background: rgba(16,185,129,.15) !important; color: #6ee7b7 !important;
    border: 1px solid rgba(16,185,129,.25) !important;
  }
  .up-location-wrap [class*="bg-yellow"],
  .up-location-wrap [class*="bg-amber"] {
    background: rgba(245,158,11,.15) !important; color: #fcd34d !important;
    border: 1px solid rgba(245,158,11,.25) !important;
  }
  .up-location-wrap [class*="bg-purple"] {
    background: rgba(124,58,237,.15) !important; color: #c4b5fd !important;
    border: 1px solid rgba(124,58,237,.25) !important;
  }

  .up-location-wrap table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .up-location-wrap thead tr { border-bottom: 1px solid var(--border) !important; }
  .up-location-wrap th {
    padding: 10px 16px !important;
    font-size: 10.5px !important; font-weight: 700 !important;
    color: var(--text-soft) !important; text-transform: uppercase !important;
    letter-spacing: .07em !important;
    background: rgba(255,255,255,0.015) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
  .up-location-wrap tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04) !important;
    transition: background .12s !important;
  }
  .up-location-wrap tbody tr:hover { background: rgba(255,255,255,0.03) !important; }
  .up-location-wrap td {
    padding: 12px 16px !important;
    color: var(--text) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  .up-location-wrap ::-webkit-scrollbar { width: 4px; height: 4px; }
  .up-location-wrap ::-webkit-scrollbar-track { background: transparent; }
  .up-location-wrap ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  .up-tickets-wrap,
  .up-reports-wrap {
    color: var(--text);
    display: flex;
    flex: 1;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
    min-height: 0;
    flex-direction: column;
  }

  .up-tickets-wrap > *,
  .up-reports-wrap > * {
    background: var(--surface) !important;
    border-color: var(--border) !important;
    color: var(--text) !important;
    box-shadow: none !important;
    flex: 1;
    min-height: 0;
  }

  .up-tickets-wrap [class*="bg-white"],
  .up-tickets-wrap [class*="bg-slate-50"],
  .up-tickets-wrap [class*="bg-slate-100"],
  .up-tickets-wrap [class*="bg-gray-50"],
  .up-reports-wrap [class*="bg-white"],
  .up-reports-wrap [class*="bg-slate-50"],
  .up-reports-wrap [class*="bg-slate-100"],
  .up-reports-wrap [class*="bg-gray-50"] {
    background: var(--card) !important;
  }

  .up-tickets-wrap [class*="border-slate"],
  .up-tickets-wrap [class*="border-gray"],
  .up-tickets-wrap [class*="border-zinc"],
  .up-reports-wrap [class*="border-slate"],
  .up-reports-wrap [class*="border-gray"],
  .up-reports-wrap [class*="border-zinc"] {
    border-color: var(--border) !important;
  }

  .up-tickets-wrap [class*="text-slate-9"],
  .up-tickets-wrap [class*="text-slate-8"],
  .up-tickets-wrap [class*="text-gray-9"],
  .up-tickets-wrap [class*="text-gray-8"],
  .up-tickets-wrap [class*="text-zinc-9"],
  .up-reports-wrap [class*="text-slate-9"],
  .up-reports-wrap [class*="text-slate-8"],
  .up-reports-wrap [class*="text-gray-9"],
  .up-reports-wrap [class*="text-gray-8"],
  .up-reports-wrap [class*="text-zinc-9"],
  .up-tickets-wrap h1, .up-tickets-wrap h2, .up-tickets-wrap h3, .up-tickets-wrap h4,
  .up-reports-wrap h1, .up-reports-wrap h2, .up-reports-wrap h3, .up-reports-wrap h4,
  .up-tickets-wrap label,
  .up-reports-wrap label {
    color: var(--text) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  .up-tickets-wrap [class*="text-slate-5"],
  .up-tickets-wrap [class*="text-slate-6"],
  .up-tickets-wrap [class*="text-gray-5"],
  .up-tickets-wrap [class*="text-gray-6"],
  .up-tickets-wrap [class*="text-zinc-5"],
  .up-reports-wrap [class*="text-slate-5"],
  .up-reports-wrap [class*="text-slate-6"],
  .up-reports-wrap [class*="text-gray-5"],
  .up-reports-wrap [class*="text-gray-6"],
  .up-reports-wrap [class*="text-zinc-5"] {
    color: var(--text-muted) !important;
  }

  .up-tickets-wrap input,
  .up-tickets-wrap select,
  .up-tickets-wrap textarea,
  .up-reports-wrap input,
  .up-reports-wrap select,
  .up-reports-wrap textarea {
    background: var(--card) !important;
    border: 1.5px solid var(--border) !important;
    color: var(--text) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  .up-tickets-wrap input::placeholder,
  .up-tickets-wrap textarea::placeholder,
  .up-reports-wrap input::placeholder,
  .up-reports-wrap textarea::placeholder {
    color: var(--text-soft) !important;
  }

  .up-tickets-wrap input:focus,
  .up-tickets-wrap select:focus,
  .up-tickets-wrap textarea:focus,
  .up-reports-wrap input:focus,
  .up-reports-wrap select:focus,
  .up-reports-wrap textarea:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent-pulse) !important;
  }

  .up-tickets-wrap button:not([class*="bg-blue"]):not([class*="bg-green"]):not([class*="bg-red"]):not([class*="bg-amber"]):not([class*="bg-yellow"]):not([class*="bg-orange"]):not([class*="bg-indigo"]):not([type="submit"]),
  .up-reports-wrap button:not([class*="bg-blue"]):not([class*="bg-green"]):not([class*="bg-red"]):not([class*="bg-amber"]):not([class*="bg-yellow"]):not([class*="bg-orange"]):not([class*="bg-indigo"]):not([type="submit"]) {
    background: var(--card) !important;
    border: 1.5px solid var(--border) !important;
    color: var(--text-muted) !important;
  }

  .up-tickets-wrap button:not([class*="bg-blue"]):not([class*="bg-green"]):not([class*="bg-red"]):not([class*="bg-amber"]):not([class*="bg-yellow"]):not([class*="bg-orange"]):not([class*="bg-indigo"]):not([type="submit"]):hover,
  .up-reports-wrap button:not([class*="bg-blue"]):not([class*="bg-green"]):not([class*="bg-red"]):not([class*="bg-amber"]):not([class*="bg-yellow"]):not([class*="bg-orange"]):not([class*="bg-indigo"]):not([type="submit"]):hover {
    background: var(--card-hover) !important;
    border-color: var(--border-mid) !important;
    color: var(--text) !important;
  }

  .up-tickets-wrap [class*="bg-blue-50"],
  .up-tickets-wrap [class*="bg-blue-100"] {
    background: rgba(43,108,255,.15) !important;
    border-color: rgba(43,108,255,.25) !important;
    color: #7eb8ff !important;
  }

  .up-tickets-wrap [class*="text-blue-700"] {
    color: #7eb8ff !important;
  }

  .up-tickets-wrap [class*="bg-blue-600"] {
    background: #2b6cff !important;
  }
`

const normalizeChamadoList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const SETORES_ATENDIMENTO = [
  'Infraestrutura', 'Identidade e Acessos', 'Sistemas',
  'Suporte Técnico', 'Service Desk',
]

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BrandMark = () => (
  <img className="up-brand-img" src="/brand/sf-logo.png" alt="SupportFlow" />
)
const IcLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IcTicketSvg = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
  </svg>
)
const IcClock = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 16 16 14"/>
  </svg>
)
const IcCheck = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IcUsers = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

// ─── Animated stat counter ────────────────────────────────────────────────────
function useCounter(target, dur = 800) {
  const [val, setVal] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    if (target === prev.current) return
    const diff  = target - prev.current
    const steps = 30
    const step  = diff / steps
    const ms    = dur / steps
    let cur = prev.current
    const iv = setInterval(() => {
      cur += step
      const done = step > 0 ? cur >= target : cur <= target
      if (done) { cur = target; clearInterval(iv) }
      setVal(Math.round(cur))
    }, ms)
    prev.current = target
    return () => clearInterval(iv)
  }, [target, dur])
  return val
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, colorClass, count, label, delay = 0 }) => {
  const animated = useCounter(count)
  return (
    <div className="up-stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className={`up-stat-icon ${colorClass}`}>{icon}</div>
      <div>
        <div className="up-stat-num">{animated}</div>
        <div className="up-stat-lbl">{label}</div>
      </div>
    </div>
  )
}

// ─── Initials avatar ──────────────────────────────────────────────────────────
// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'tickets',   label: 'Fila de Chamados',  Icon: TicketIcon },
  { id: 'trash',     label: 'Lixeira',           Icon: Trash2     },
  { id: 'reports',   label: 'Relatórios',        Icon: BarChart3  },
  { id: 'locations', label: 'Catálogo e Locais', Icon: Settings   },
  { id: 'usuarios',  label: 'Gestão de Acessos', Icon: UserPlus   },
]

// ═════════════════════════════════════════════════════════════════════════════
const GestorPage = () => {
  const navigate = useNavigate()
  const { user: usuario, logout } = useAuth()
  const { notify } = useNotification()

  const [activeTab,      setActiveTab]      = useState('tickets')
  const [isDrawerOpen,   setIsDrawerOpen]   = useState(false)
  const [tickets,        setTickets]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [usuarios,       setUsuarios]       = useState([])
  const [trashTickets,   setTrashTickets]    = useState([])
  const [criandoUsuario, setCriandoUsuario] = useState(false)
  const [novoUsuario,    setNovoUsuario]    = useState({
    nome: '', email: '', senha: '', tipo: 'USUARIO', setorAtendimento: '',
  })

  const [emailDialog,   setEmailDialog]   = useState({ isOpen: false, ticket: null })
  const [detailsDialog, setDetailsDialog] = useState({ isOpen: false, ticket: null })
  const [chatDialog,    setChatDialog]    = useState({ isOpen: false, ticketId: null, chatId: null })

  const delayedTickets = useMemo(() => {
    const nowMs = Date.now()

    const getReferenceDate = (ticket) => {
      if (ticket.status === 'em-andamento') {
        return new Date(ticket.updatedAt || ticket.createdAt)
      }
      return new Date(ticket.createdAt || ticket.updatedAt)
    }

    return tickets.filter((ticket) => {
      if (ticket.status === 'resolvido') return false
      if (ticket.status !== 'aberto' && ticket.status !== 'em-andamento') return false

      const refDate = getReferenceDate(ticket)
      if (Number.isNaN(refDate.getTime())) return false

      const defaultSlaHoras = ticket.status === 'aberto' ? 24 : 48
      const slaHoras = Number.isFinite(Number(ticket.slaHoras)) && Number(ticket.slaHoras) > 0
        ? Number(ticket.slaHoras)
        : defaultSlaHoras

      const deadlineMs = refDate.getTime() + slaHoras * 60 * 60 * 1000
      return nowMs > deadlineMs
    })
  }, [tickets])

  const teamMembersCount = useMemo(
    () => usuarios.filter(u => u.tipo === 'TECNICO').length,
    [usuarios]
  )

  const statsData = {
    total:       tickets.length,
    emAndamento: tickets.filter(t => t.status === 'em-andamento').length,
    resolvidos:  tickets.filter(t => t.status === 'resolvido').length,
  }

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async ({ silent = false } = {}) => {
    try {
      const response = await chamadoAPI.listarTodos({ suppressNetworkToast: silent })
      const nextTickets = normalizeChamadoList(response.data).map(mapChamado)
      setTickets(nextTickets)
      return nextTickets
    } catch (error) {
      if (!silent && loading) toast.error(getApiErrorMessage(error, 'Erro ao carregar chamados.'))
      return []
    } finally {
      setLoading(false)
    }
  }, [loading])

  const fetchUsuarios = async () => {
    try {
      const res = await usuarioAPI.listar()
      setUsuarios(res.data)
    } catch { /* silencioso */ }
  }

  useEffect(() => { fetchTickets(); fetchUsuarios() }, []) // eslint-disable-line

  useRealtimeTickets({
    fetchFn: fetchTickets,
    onNewTicket: (ticket) => {
      notify({
        title: 'Novo chamado no sistema',
        body: `${ticket.title} (${ticket.id})`,
        tag: `manager-ticket-${ticket.id}`,
      })
    },
    pollingMs: 10000,
  })

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/') }

  const handleUpdateTicket = async (updatedTicket) => {
    try {
      await chamadoAPI.atualizar(updatedTicket._id, {
        status: updatedTicket.status, prioridade: updatedTicket.priority,
      })
      await fetchTickets({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar chamado.'))
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId)
    if (!ticket) return
    try {
      await chamadoAPI.deletar(ticket._id)
      await fetchTickets({ silent: true })
      toast.success('Chamado removido (movido para a lixeira).')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao remover chamado.'))
    }
  }

  const fetchTrash = async () => {
    try {
      const res = await chamadoAPI.listarLixeira()
      const list = normalizeChamadoList(res.data).map(mapChamado)
      setTrashTickets(list)
      return list
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erro ao carregar lixeira.'))
      return []
    }
  }

  const handleRecoverTicket = async (id) => {
    try {
      await chamadoAPI.recuperar(id)
      await fetchTickets({ silent: true })
      await fetchTrash()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erro ao recuperar chamado.'))
    }
  }

  const handleDeletePermanent = async (id) => {
    try {
      await chamadoAPI.deletarPermanentemente(id)
      await fetchTrash()
      toast.success('Chamado excluído permanentemente')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erro ao excluir permanentemente.'))
    }
  }

  // Carregar lixeira ao abrir a aba
  useEffect(() => {
    if (activeTab === 'trash') {
      fetchTrash()
    }
  }, [activeTab])

  const handleSendEmail  = (id) => { const t = tickets.find(t => t.id === id); if (t) setEmailDialog({ isOpen: true, ticket: t }) }
  const handleViewTicket = (id) => { const t = tickets.find(t => t.id === id); if (t) setDetailsDialog({ isOpen: true, ticket: t }) }
  const handleOpenChat   = (id) => { if (tickets.find(t => t.id === id)) setChatDialog({ isOpen: true, ticketId: id, chatId: null }) }

  const handleCreateTicket = async (formData) => {
    try {
      await chamadoAPI.criar({
        titulo: formData.title, descricao: formData.description,
        solicitante: usuario.nome || 'Gestor',
        setor: formData.setor, bloco: formData.bloco, sala: formData.sala,
        templateId: formData.templateId,
        templateIndex: formData.templateIndex,
        attachmentBase64: formData.attachmentBase64,
        attachmentName: formData.attachmentName,
        attachmentContentType: formData.attachmentContentType,
      })
      await fetchTickets({ silent: true })
      toast.success('Chamado criado com sucesso!', {
        description: 'Seu chamado foi registrado e será atendido em breve.',
      })
      setIsDrawerOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao criar chamado. Tente novamente.'))
    }
  }

  const handleCriarUsuario = async (e) => {
    e.preventDefault()
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
      toast.error('Preencha todos os campos.')
      return
    }
    setCriandoUsuario(true)
    try {
      await usuarioAPI.criar(novoUsuario)
      toast.success(`Conta criada para ${novoUsuario.nome}!`)
      setNovoUsuario({ nome: '', email: '', senha: '', tipo: 'USUARIO', setorAtendimento: '' })
      fetchUsuarios()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Não foi possível criar a conta.'))
    } finally {
      setCriandoUsuario(false)
    }
  }

  const handleDeletarUsuario = async (id, nome) => {
    if (!window.confirm(`Remover a conta de "${nome}"?`)) return
    try {
      await usuarioAPI.deletar(id)
      toast.success('Conta removida.')
      fetchUsuarios()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao remover conta.'))
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="up-root">
      <style>{gestorBaseStyles}</style>
      <style>{gestorTabStyles}</style>

      {/* ══════ HEADER ══════ */}
      <header className="up-header">
        <div className="up-header-left">
          <div className="up-brand">
            <div className="up-brand-icon"><BrandMark /></div>
            <span className="up-brand-name">SupportFlow</span>
          </div>
          <div className="up-header-divider" />
          <span className="up-header-section">Painel de Gestão</span>
        </div>

        <div className="up-header-right">
          {activeTab === 'tickets' && (
            <button
              className="up-new-chamado-btn up-desktop-only"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Plus size={14} strokeWidth={2.5} /> Novo Chamado
            </button>
          )}

          <div className="up-online-badge">
            <span className="up-online-dot" />
            <span className="up-online-label">Supervisão Ativa</span>
          </div>

          <AccountMenu
            user={usuario}
            onLogout={handleLogout}
            homePath="/gestor"
          />
        </div>
      </header>

      {/* ══════ STATS BAR ══════ */}
      <div className="up-stats-bar">
        <StatCard icon={<IcTicketSvg color="#7eb8ff" />} colorClass="up-stat-icon-blue"   count={statsData.total}       label="Volume Total"    delay={0}   />
        <StatCard icon={<IcClock     color="#67e8f9" />} colorClass="up-stat-icon-cyan"   count={statsData.emAndamento} label="Em Produção"     delay={80}  />
        <StatCard icon={<IcCheck     color="#6ee7b7" />} colorClass="up-stat-icon-green"  count={statsData.resolvidos}  label="Solucionados"    delay={160} />
        <StatCard icon={<IcUsers     color="#c084fc" />} colorClass="up-stat-icon-purple" count={teamMembersCount}      label="Técnicos Ativos" delay={240} />
      </div>

      {/* ══════ MAIN (tab layout) ══════ */}
      <main className="up-main" style={{ flexDirection: 'column' }}>

        {/* ── Tab Nav ── */}
        <nav className="up-tab-nav" role="tablist">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id} role="tab"
              aria-selected={activeTab === id}
              className={`up-tab-item${activeTab === id ? ' active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {createElement(Icon, { size: 15, strokeWidth: 2.2 })}
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* ── Tab Content ── */}
        <div className="up-tab-panel">

          {activeTab === 'tickets' && (
            <div className="up-tickets-wrap">
              <TechnicianTicketList
                tickets={tickets}
                onUpdateTicket={handleUpdateTicket}
                onViewTicket={handleViewTicket}
                onDeleteTicket={handleDeleteTicket}
                onSendEmail={handleSendEmail}
                onOpenChat={handleOpenChat}
                delayedTickets={delayedTickets}
                onCreateTicket={() => setIsDrawerOpen(true)}
              />
            </div>
          )}

          {activeTab === 'trash' && (
            <div className="up-tickets-wrap">
              <TrashTicketList
                tickets={trashTickets}
                onRecoverTicket={handleRecoverTicket}
                onDeletePermanent={handleDeletePermanent}
                onViewTicket={handleViewTicket}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="up-reports-wrap">
              <ReportsSection tickets={tickets} />
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="up-location-wrap">
              <LocationManagement />
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div style={{ maxWidth: 900, margin: '0 auto' }}>

              <div className="up-panel-card">
                <div className="up-panel-card-header">
                  <UserPlus size={15} strokeWidth={2.2} style={{ color: 'var(--accent)' }} />
                  Registrar novo colaborador
                </div>
                <div className="up-panel-card-body">
                  <form onSubmit={handleCriarUsuario} className="up-user-form-grid">
                    <div className="up-field">
                      <label>Nome completo</label>
                      <input
                        className="up-input" style={{ width: '100%' }}
                        type="text" placeholder="Ex: João da Silva"
                        value={novoUsuario.nome}
                        onChange={e => setNovoUsuario(u => ({ ...u, nome: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="up-field">
                      <label>E-mail corporativo</label>
                      <input
                        className="up-input" style={{ width: '100%' }}
                        type="email" placeholder="joao@empresa.com.br"
                        value={novoUsuario.email}
                        onChange={e => setNovoUsuario(u => ({ ...u, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="up-field">
                      <label>Senha provisória</label>
                      <input
                        className="up-input" style={{ width: '100%' }}
                        type="text" placeholder="Senha de primeiro acesso"
                        value={novoUsuario.senha}
                        onChange={e => setNovoUsuario(u => ({ ...u, senha: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="up-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label>Perfil</label>
                        <select
                          className="up-select" style={{ width: '100%' }}
                          value={novoUsuario.tipo}
                          onChange={e => {
                            const tipo = e.target.value
                            setNovoUsuario(u => ({ ...u, tipo, setorAtendimento: tipo === 'TECNICO' ? u.setorAtendimento : '' }))
                          }}
                        >
                          <option value="USUARIO">Usuário</option>
                          <option value="TECNICO">Técnico</option>
                          <option value="GESTOR">Gestor</option>
                        </select>
                      </div>
                      <div>
                        <label>Setor</label>
                        <select
                          className="up-select"
                          style={{ width: '100%', opacity: novoUsuario.tipo !== 'TECNICO' ? .4 : 1 }}
                          value={novoUsuario.setorAtendimento}
                          onChange={e => setNovoUsuario(u => ({ ...u, setorAtendimento: e.target.value }))}
                          disabled={novoUsuario.tipo !== 'TECNICO'}
                        >
                          <option value="">Selecione</option>
                          {SETORES_ATENDIMENTO.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="up-field-full" style={{ paddingTop: 4 }}>
                      <button type="submit" className="up-submit-btn" disabled={criandoUsuario}>
                        {criandoUsuario ? 'Processando...' : 'Criar conta no sistema'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="up-panel-card">
                <div className="up-panel-card-header">
                  <IcUsers color="var(--accent)" />
                  Diretório de contas
                </div>

                {usuarios.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-soft)', fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Nenhum usuário localizado na base de dados.
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }} className="up-desktop-only">
                      <table className="up-user-table">
                        <thead>
                          <tr>
                            <th>Colaborador</th>
                            <th>E-mail</th>
                            <th>Nível de acesso</th>
                            <th>Setor</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usuarios.map(u => (
                            <tr key={u.id}>
                              <td style={{ fontWeight: 600 }}>{u.nome}</td>
                              <td className="muted">{u.email}</td>
                              <td>
                                <span className={`up-role-badge ${u.tipo === 'GESTOR' ? 'gestor' : u.tipo === 'TECNICO' ? 'tecnico' : 'usuario'}`}>
                                  {u.tipo}
                                </span>
                              </td>
                              <td className="muted">
                                {u.tipo === 'TECNICO'
                                  ? (u.setorAtendimento || <span style={{ opacity: .35 }}>Não definido</span>)
                                  : <span style={{ opacity: .25 }}>—</span>
                                }
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  className="up-delete-btn"
                                  onClick={() => handleDeletarUsuario(u.id, u.nome)}
                                  title="Revogar acesso"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="up-mobile-only">
                      {usuarios.map(u => (
                        <div key={u.id} className="up-user-mobile-card">
                          <div>
                            <div className="name">{u.nome}</div>
                            <div className="email">{u.email}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className={`up-role-badge ${u.tipo === 'GESTOR' ? 'gestor' : u.tipo === 'TECNICO' ? 'tecnico' : 'usuario'}`}>
                                {u.tipo}
                              </span>
                              {u.tipo === 'TECNICO' && u.setorAtendimento && (
                                <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>• {u.setorAtendimento}</span>
                              )}
                            </div>
                          </div>
                          <button className="up-delete-btn" onClick={() => handleDeletarUsuario(u.id, u.nome)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ══════ DRAWER (Novo Chamado) ══════ */}
      <div className={`up-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
      <div className={`up-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="up-drawer-header">
          <div className="up-drawer-title">
            <Plus size={16} style={{ color: 'var(--accent)' }} /> Abrir novo chamado
          </div>
          <button className="up-drawer-close" onClick={() => setIsDrawerOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="up-drawer-body">
          <UserTicketForm
            onSubmit={handleCreateTicket}
            userEmail={usuario?.email || ''}
            userName={usuario?.nome || ''}
          />
        </div>
      </div>



      {/* ══════ DIALOGS ══════ */}
      <EmailDialog
        isOpen={emailDialog.isOpen}
        ticket={emailDialog.ticket}
        onClose={() => setEmailDialog({ isOpen: false, ticket: null })}
      />
      <TicketDetailsDialog
        isOpen={detailsDialog.isOpen}
        ticket={detailsDialog.ticket}
        onClose={() => setDetailsDialog({ isOpen: false, ticket: null })}
      />
      <ChatPanel
        open={chatDialog.isOpen}
        onClose={() => setChatDialog({ isOpen: false, ticketId: null, chatId: null })}
        chamadoId={chatDialog.ticketId}
        chatId={chatDialog.chatId}
        user={usuario}
      />
    </div>
  )
}

export default GestorPage
