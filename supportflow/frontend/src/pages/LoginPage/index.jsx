/**
 * SupportFlow — Login Pages
 * Melhorias: pricing CTA integrado ao design, animações de entrada em cascata,
 * glow de foco nos inputs, shimmer no submit, SSO polido.
 * v2: responsividade mobile aprimorada
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/api'
import { toast } from 'sonner'
import { loginStyles } from './LoginStyles'
import { isValidEmail, isValidPassword, LoginRateLimiter } from '../../context/authValidation'

// ─── CSS extras (complementa LoginStyles sem sobrescrevê-lo) ──────────────────
const loginExtras = `
  /* ── Form box entrance ── */
  .sf-form-box {
    animation: sfBoxIn 0.55s cubic-bezier(.22,.68,0,1.2) both;
  }
  @keyframes sfBoxIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }

  /* ── Staggered form group entrance ── */
  .sf-form-group {
    animation: sfGroupIn 0.45s ease both;
  }
  .sf-form-group:nth-child(1) { animation-delay: 0.15s; }
  .sf-form-group:nth-child(2) { animation-delay: 0.25s; }
  @keyframes sfGroupIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  /* ── Input: glow focus ring ── */
  .sf-input:focus {
    outline: none;
    border-color: rgba(43,108,255,0.7) !important;
    box-shadow: 0 0 0 3px rgba(43,108,255,0.18), 0 0 16px rgba(43,108,255,0.12);
    background: rgba(13,27,46,0.95) !important;
  }
  .sf-input.invalid:focus {
    border-color: rgba(239,68,68,0.7) !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
  }

  /* ── SSO buttons: glow on hover ── */
  .sf-sso-btn {
    transition: all 0.22s ease;
  }
  .sf-sso-btn:hover {
    border-color: rgba(43,108,255,0.45) !important;
    box-shadow: 0 0 16px rgba(43,108,255,0.14), 0 4px 12px rgba(0,0,0,0.25) !important;
    transform: translateY(-1px);
    color: #fff !important;
  }

  /* ── Submit: shimmer sweep ── */
  .sf-submit-btn {
    position: relative;
    overflow: hidden;
  }
  .sf-submit-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.13) 50%, transparent 65%);
    transform: translateX(-100%);
    transition: transform 0s;
  }
  .sf-submit-btn:not(:disabled):hover::before {
    transform: translateX(100%);
    transition: transform 0.55s ease;
  }
  .sf-submit-btn:not(:disabled):active {
    transform: scale(0.985);
  }

  /* ── Pricing CTA card ── */
  .sf-pricing-cta {
    position: relative;
    margin-bottom: 1.5rem;
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    border: 1px solid rgba(43,108,255,0.28);
    background: linear-gradient(135deg, rgba(43,108,255,0.10) 0%, rgba(43,108,255,0.04) 100%);
    overflow: hidden;
    animation: sfGroupIn 0.45s ease 0.05s both;
    cursor: default;
  }

  /* Animated top line */
  .sf-pricing-cta::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, rgba(43,108,255,0.8), rgba(100,180,255,0.7), rgba(43,108,255,0.8), transparent);
    background-size: 200% 100%;
    animation: sfCtaSweep 3.5s linear infinite;
  }

  @keyframes sfCtaSweep {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }

  /* Subtle ambient glow */
  .sf-pricing-cta::after {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 100px; height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(43,108,255,0.2) 0%, transparent 70%);
    pointer-events: none;
  }

  .sf-pricing-cta-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    position: relative;
    z-index: 1;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sf-pricing-cta-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    color: #7eb8ff;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .sf-pricing-cta-label-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #4d87ff;
    box-shadow: 0 0 6px rgba(77,135,255,0.8);
    animation: sfBlink 2.2s ease infinite;
    flex-shrink: 0;
  }

  @keyframes sfBlink {
    0%, 100% { opacity: 1;   box-shadow: 0 0 6px rgba(77,135,255,0.8); }
    50%       { opacity: 0.4; box-shadow: 0 0 3px rgba(77,135,255,0.3); }
  }

  .sf-pricing-cta-plans {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    z-index: 1;
    flex-wrap: wrap;
  }

  .sf-plan-pill {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    border: 1px solid;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .sf-plan-pill-starter {
    background: rgba(100,116,139,0.12);
    border-color: rgba(100,116,139,0.3);
    color: #94a3b8;
  }

  .sf-plan-pill-pro {
    background: rgba(43,108,255,0.18);
    border-color: rgba(43,108,255,0.4);
    color: #7eb8ff;
  }

  .sf-plan-pill-biz {
    background: rgba(56,189,248,0.12);
    border-color: rgba(56,189,248,0.3);
    color: #7dd3fc;
  }

  .sf-pricing-cta-btn {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 10px 16px;
    border-radius: 9px;
    border: 1px solid rgba(43,108,255,0.4);
    background: rgba(43,108,255,0.14);
    color: #93c5fd;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.22s ease;
    overflow: hidden;
  }

  .sf-pricing-cta-btn:hover {
    background: rgba(43,108,255,0.24);
    border-color: rgba(43,108,255,0.65);
    color: #dbeafe;
    box-shadow: 0 4px 16px rgba(43,108,255,0.25);
    transform: translateY(-1px);
  }

  .sf-pricing-cta-btn:active {
    transform: translateY(0);
  }

  .sf-pricing-cta-btn-icon {
    width: 22px; height: 22px;
    border-radius: 6px;
    background: rgba(43,108,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.22s ease;
  }

  .sf-pricing-cta-btn:hover .sf-pricing-cta-btn-icon {
    transform: translateX(3px);
  }

  /* Arrow slide animation on btn hover */
  .sf-pricing-arrow {
    transition: transform 0.22s ease;
  }
  .sf-pricing-cta-btn:hover .sf-pricing-arrow {
    transform: translateX(4px);
  }

  /* ── Divider polishing ── */
  .sf-divider {
    position: relative;
    text-align: center;
    font-size: 11.5px;
    color: rgba(100,116,139,0.75);
    font-weight: 600;
    letter-spacing: 0.05em;
    margin: 1.25rem 0;
  }

  .sf-divider::before,
  .sf-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 70px);
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.08));
  }
  .sf-divider::before { left: 0; }
  .sf-divider::after  { right: 0; background: linear-gradient(to left, transparent, rgba(255,255,255,0.08)); }

  /* ── Security badge pulse ── */
  .sf-sec-dot {
    animation: sfBlink 2s ease infinite;
  }

  /* ── Form footer fade in ── */
  .sf-form-footer, .sf-sec-badge {
    animation: sfGroupIn 0.45s ease 0.4s both;
  }

  /* ── Opts row ── */
  .sf-opts {
    animation: sfGroupIn 0.45s ease 0.35s both;
  }

  /* ════════════════════════════════════════════
     MOBILE BRAND HEADER (só aparece no mobile)
  ════════════════════════════════════════════ */
  .sf-mobile-brand {
    display: none;
  }

  /* ════════════════════════════════════════════
     MOBILE STATS STRIP (só no mobile)
  ════════════════════════════════════════════ */
  .sf-mobile-stats {
    display: none;
  }

  /* ════════════════════════════════════════════
     RESPONSIVIDADE — MOBILE FIRST
  ════════════════════════════════════════════ */

  /* ── Tablet e abaixo ── */
  @media (max-width: 900px) {
    .sf-root {
      flex-direction: column !important;
      min-height: 100vh; /* Fallback for older browsers */
      min-height: 100dvh !important;
      overflow-x: hidden;
    }

    /* Painel esquerdo vira topo compacto */
    .sf-panel-left {
      width: 100% !important;
      min-height: unset !important;
      height: auto !important;
      padding: 2rem 1.5rem 1.5rem !important;
      flex-shrink: 0;
    }

    .sf-floating-cards {
      display: none !important;
    }

    .sf-brand-name {
      font-size: 1.2rem !important;
    }

    .sf-hero-wrap {
      margin: 1rem 0 !important;
    }

    .sf-h1 {
      font-size: clamp(1.6rem, 5vw, 2.2rem) !important;
      line-height: 1.2 !important;
    }

    .sf-hero-p {
      font-size: 0.85rem !important;
      margin-top: 0.5rem !important;
    }

    .sf-stats {
      gap: 1rem !important;
      margin: 1rem 0 !important;
    }

    .sf-stat-num {
      font-size: 1.4rem !important;
    }

    .sf-flow-wrap {
      display: none !important;
    }

    /* Painel direito ocupa o resto */
    .sf-panel-right {
      width: 100% !important;
      min-height: unset !important;
      display: flex;
      align-items: flex-start;
      padding: 1.5rem 1rem 2rem !important;
    }

    .sf-form-box {
      width: 100% !important;
      max-width: 480px !important;
      margin: 0 auto !important;
      padding: 1.75rem 1.5rem !important;
      border-radius: 20px !important;
    }
  }

  /* ── Mobile puro ── */
  @media (max-width: 600px) {
    /* Esconde painel esquerdo inteiro */
    .sf-panel-left {
      display: none !important;
    }

    /* Painel direito vira página inteira */
    .sf-panel-right {
      width: 100% !important;
      min-height: 100vh !important;
      min-height: 100dvh !important;
      padding: 0 !important;
      align-items: stretch !important;
      background: #080f1a !important;
    }

    .sf-form-box {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 1.5rem 1.25rem 2.5rem !important;
      border-radius: 0 !important;
      border: none !important;
      min-height: 100vh !important;
      min-height: 100dvh !important;
      background: transparent !important;
    }

    /* Brand mobile no topo do form */
    .sf-mobile-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1.75rem;
      padding-top: 0.5rem;
    }

    .sf-mobile-brand-icon {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: rgba(255,255,255,0.96);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.24);
      flex-shrink: 0;
      overflow: hidden;
    }

    .sf-mobile-brand-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .sf-mobile-brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .sf-mobile-brand-tag {
      font-size: 10px;
      font-weight: 600;
      color: #4a6585;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Stats strip mobile */
    .sf-mobile-stats {
      display: flex;
      align-items: center;
      gap: 0;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      animation: sfGroupIn 0.45s ease 0.1s both;
    }

    .sf-mobile-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .sf-mobile-stat-num {
      font-size: 1rem;
      font-weight: 800;
      color: #7eb8ff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      line-height: 1;
    }

    .sf-mobile-stat-lbl {
      font-size: 9px;
      color: #4a6585;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-top: 3px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .sf-mobile-stat-div {
      width: 1px;
      height: 28px;
      background: rgba(255,255,255,0.07);
      flex-shrink: 0;
    }

    /* Form header */
    .sf-eyebrow {
      font-size: 10px !important;
    }

    .sf-form-title {
      font-size: 1.35rem !important;
    }

    .sf-form-title small {
      font-size: 0.8rem !important;
      margin-top: 4px !important;
    }

    .sf-form-header {
      margin-bottom: 1.25rem !important;
    }

    /* Pricing CTA menor */
    .sf-pricing-cta {
      padding: 0.9rem 1rem !important;
      margin-bottom: 1.25rem !important;
    }

    .sf-pricing-cta-top {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }

    .sf-pricing-cta-btn {
      font-size: 12px !important;
      padding: 9px 12px !important;
    }

    /* SSO row — empilha em telas muito pequenas */
    .sf-sso-row {
      gap: 8px !important;
    }

    .sf-sso-btn {
      padding: 0 12px !important;
      font-size: 13px !important;
      height: 42px !important;
    }

    /* Inputs */
    .sf-input {
      font-size: 16px !important; /* evita zoom no iOS */
      height: 46px !important;
      padding: 0 42px 0 40px !important;
    }

    .sf-label {
      font-size: 12px !important;
    }

    .sf-form-group {
      margin-bottom: 1rem !important;
    }

    /* Opts row */
    .sf-opts {
      flex-direction: row !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 6px !important;
      margin-bottom: 1.25rem !important;
    }

    .sf-check-label span {
      font-size: 12px !important;
    }

    .sf-forgot {
      font-size: 12px !important;
      margin-left: auto;
    }

    /* Submit */
    .sf-submit-btn {
      height: 48px !important;
      font-size: 14px !important;
      border-radius: 12px !important;
    }

    /* Security + footer */
    .sf-sec-badge {
      font-size: 10.5px !important;
      gap: 6px !important;
      margin-top: 1.25rem !important;
      text-align: center;
      justify-content: center !important;
    }

    .sf-form-footer {
      font-size: 11.5px !important;
      margin-top: 0.75rem !important;
      text-align: center;
    }

    /* Alert */
    .sf-alert {
      font-size: 12px !important;
      padding: 10px 12px !important;
      border-radius: 10px !important;
    }
  }

  /* ── Telas muito pequenas (≤360px) ── */
  @media (max-width: 360px) {
    .sf-form-box {
      padding: 1.25rem 1rem 2rem !important;
    }

    .sf-sso-row {
      flex-direction: column !important;
    }

    .sf-sso-btn {
      width: 100% !important;
    }

    .sf-plan-pill {
      font-size: 10px !important;
      padding: 2px 8px !important;
    }
  }
`

// ─── icons ────────────────────────────────────────────────────────────────────
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,12 2,6"/>
  </svg>
)
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconArrow = () => (
  <svg className="sf-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12,5 19,12 12,19"/>
  </svg>
)
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const BrandMark = ({ className = '' }) => (
  <img className={className} src="/brand/sf-logo.png" alt="SupportFlow" />
)
const IconSparkle = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/>
  </svg>
)
const IconChevronRight = () => (
  <svg className="sf-pricing-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
)

// ─── role routing ─────────────────────────────────────────────────────────────
const getRouteByRole = (tipo) => {
  if (tipo === 'USUARIO') return '/usuario'
  if (tipo === 'TECNICO') return '/tecnico'
  if (tipo === 'GESTOR')  return '/gestor'
  return '/'
}

// ─── animated counter hook ────────────────────────────────────────────────────
function useCounter(target, suffix = '', duration = 1200, delay = 900) {
  const [value, setValue] = useState('0' + suffix)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const steps    = 60
      const step     = target / steps
      const interval = duration / steps
      let current    = 0
      const iv = setInterval(() => {
        current += step
        if (current >= target) { current = target; clearInterval(iv) }
        setValue(Math.round(current) + suffix)
      }, interval)
      return () => clearInterval(iv)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, suffix, duration, delay])
  return value
}

// ─── SVG Flow Diagram ─────────────────────────────────────────────────────────
const FlowDiagram = () => {
  const svgRef = useRef(null)

  useEffect(() => {
    const lines = ['sf-ln1','sf-ln2','sf-ln3','sf-ln4','sf-ln5','sf-ln6']
    lines.forEach((id, i) => {
      const el = document.getElementById(id)
      if (!el) return
      setTimeout(() => {
        el.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)'
        el.style.strokeDashoffset = '0'
      }, 1000 + i * 120)
    })

    const nodes = ['sf-nd1','sf-nd2','sf-nd3','sf-nd4','sf-nd5','sf-nd6']
    nodes.forEach((id, i) => {
      const el = document.getElementById(id)
      if (!el) return
      setTimeout(() => {
        el.style.animation = 'sfNodePulse 2s ease-in-out infinite'
        el.style.animationDelay = (i * 0.3) + 's'
      }, 1600 + i * 100)
    })

    const paths   = ['sf-ln1','sf-ln3','sf-ln5'].map(id => document.getElementById(id))
    const packets = document.querySelectorAll('.sf-packet')
    let pIdx = 0
    let packetTimer

    const animatePacket = () => {
      const path   = paths[pIdx % 3]
      const packet = packets[pIdx % 3]
      if (!path || !packet) { pIdx++; return }
      const len = path.getTotalLength ? path.getTotalLength() : 200
      let i = 0; const steps = 60
      packet.setAttribute('opacity', '1')
      const iv = setInterval(() => {
        if (i >= steps) {
          clearInterval(iv)
          packet.setAttribute('opacity', '0')
          pIdx++
          packetTimer = setTimeout(animatePacket, 800)
          return
        }
        const pt = path.getPointAtLength ? path.getPointAtLength((i / steps) * len) : null
        if (pt) { packet.setAttribute('cx', pt.x); packet.setAttribute('cy', pt.y) }
        i++
      }, 16)
    }
    const startTimer = setTimeout(animatePacket, 2000)
    return () => { clearTimeout(startTimer); clearTimeout(packetTimer) }
  }, [])

  return (
    <div className="sf-flow-wrap">
      <svg ref={svgRef} viewBox="0 0 520 180" width="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="sf-glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <marker id="sf-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#2a5caa"/>
          </marker>
        </defs>
        <g stroke="#1a2f4a" strokeWidth="1.5" fill="none" markerEnd="url(#sf-arr)">
          <path id="sf-ln1" d="M 90,90 Q 155,50 215,70"  strokeDasharray="300" strokeDashoffset="300"/>
          <path id="sf-ln2" d="M 90,90 Q 155,130 215,110" strokeDasharray="300" strokeDashoffset="300"/>
          <path id="sf-ln3" d="M 265,70 L 335,55"        strokeDasharray="300" strokeDashoffset="300"/>
          <path id="sf-ln4" d="M 265,110 L 335,125"      strokeDasharray="300" strokeDashoffset="300"/>
          <path id="sf-ln5" d="M 385,55 L 450,80"        strokeDasharray="300" strokeDashoffset="300"/>
          <path id="sf-ln6" d="M 385,125 L 450,100"      strokeDasharray="300" strokeDashoffset="300"/>
        </g>
        <g>
          <rect x="30"  y="62"  width="60" height="56" rx="10" fill="#0f1e30" stroke="#1a2f4a" strokeWidth="1.5"/>
          <text x="60"  y="88"  textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#4a6585" letterSpacing="0.3">ENTRADA</text>
          <circle id="sf-nd1" cx="60" cy="100" r="4" fill="#2b6cff" filter="url(#sf-glow)"/>
          <rect x="205" y="48"  width="60" height="44" rx="10" fill="#0f1e30" stroke="#1a2f4a" strokeWidth="1.5"/>
          <text x="235" y="68"  textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#4a6585">TRIAGEM</text>
          <circle id="sf-nd2" cx="235" cy="78" r="4" fill="#f59e0b"/>
          <rect x="205" y="88"  width="60" height="44" rx="10" fill="#0f1e30" stroke="#1a2f4a" strokeWidth="1.5"/>
          <text x="235" y="108" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#4a6585">CLASSIFY</text>
          <circle id="sf-nd3" cx="235" cy="118" r="4" fill="#0891b2"/>
          <rect x="325" y="33"  width="60" height="44" rx="10" fill="#0f1e30" stroke="#1a2f4a" strokeWidth="1.5"/>
          <text x="355" y="53"  textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#4a6585">TÉCNICO</text>
          <circle id="sf-nd4" cx="355" cy="63" r="4" fill="#10b981"/>
          <rect x="325" y="103" width="60" height="44" rx="10" fill="#0f1e30" stroke="#1a2f4a" strokeWidth="1.5"/>
          <text x="355" y="123" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#4a6585">ESCALADO</text>
          <circle id="sf-nd5" cx="355" cy="133" r="4" fill="#ef4444"/>
          <rect x="435" y="58"  width="60" height="56" rx="10" fill="#132540" stroke="#2a5caa" strokeWidth="1.5"/>
          <text x="465" y="82"  textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#4a6585">RESOLVIDO</text>
          <circle id="sf-nd6" cx="465" cy="95" r="4" fill="#10b981" filter="url(#sf-glow)"/>
        </g>
        <circle className="sf-packet" cx="60" cy="90" r="3" fill="#2b6cff" opacity="0"/>
        <circle className="sf-packet" cx="60" cy="90" r="3" fill="#f59e0b" opacity="0"/>
        <circle className="sf-packet" cx="60" cy="90" r="3" fill="#10b981" opacity="0"/>
        <text x="60"  y="152" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="9" fill="#7890b0">Abertura</text>
        <text x="235" y="152" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="9" fill="#7890b0">Roteamento</text>
        <text x="355" y="165" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="9" fill="#7890b0">Atendimento</text>
        <text x="465" y="152" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="9" fill="#7890b0">Conclusão</text>
      </svg>
    </div>
  )
}

// ─── Pricing CTA ──────────────────────────────────────────────────────────────
const PricingCTA = ({ onNavigate }) => (
  <div className="sf-pricing-cta">
    <div className="sf-pricing-cta-top">
      <div className="sf-pricing-cta-label">
        <span className="sf-pricing-cta-label-dot" />
        Novo na plataforma?
      </div>
      <div className="sf-pricing-cta-plans">
        <span className="sf-plan-pill sf-plan-pill-starter">Starter</span>
        <span className="sf-plan-pill sf-plan-pill-pro">Pro</span>
        <span className="sf-plan-pill sf-plan-pill-biz">Business</span>
      </div>
    </div>
    <button className="sf-pricing-cta-btn" type="button" onClick={onNavigate}>
      <span className="sf-pricing-cta-btn-icon">
        <IconSparkle />
      </span>
      <span>Confira nossos planos e preços</span>
      <IconChevronRight />
    </button>
  </div>
)

// ─── Mobile Brand Header ──────────────────────────────────────────────────────
const MobileBrand = () => (
  <div className="sf-mobile-brand">
    <div className="sf-mobile-brand-icon">
      <BrandMark className="sf-mobile-brand-img" />
    </div>
    <div>
      <div className="sf-mobile-brand-name">SupportFlow</div>
      <div className="sf-mobile-brand-tag">Enterprise Platform</div>
    </div>
  </div>
)

// ─── Mobile Stats Strip ───────────────────────────────────────────────────────
const MobileStats = ({ tickets, sla, time }) => (
  <div className="sf-mobile-stats">
    <div className="sf-mobile-stat">
      <span className="sf-mobile-stat-num">{tickets}</span>
      <span className="sf-mobile-stat-lbl">Chamados/mês</span>
    </div>
    <div className="sf-mobile-stat-div" />
    <div className="sf-mobile-stat">
      <span className="sf-mobile-stat-num">{sla}</span>
      <span className="sf-mobile-stat-lbl">SLA cumprido</span>
    </div>
    <div className="sf-mobile-stat-div" />
    <div className="sf-mobile-stat">
      <span className="sf-mobile-stat-num">{time}</span>
      <span className="sf-mobile-stat-lbl">Tempo médio</span>
    </div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const Login = () => {
  const [email,          setEmail]          = useState('')
  const [senha,          setSenha]          = useState('')
  const [showPassword,   setShowPassword]   = useState(false)
  const [rememberMe,     setRememberMe]     = useState(false)
  const [blockedUntil,   setBlockedUntil]   = useState(null)
  const [emailError,     setEmailError]     = useState(false)
  const [senhaError,     setSenhaError]     = useState(false)
  const [alert,          setAlert]          = useState(null)
  const [ticketCount,    setTicketCount]    = useState(247)

  const { login: contextLogin, isLoading } = useAuth()
  const navigate    = useNavigate()
  const rateLimiter = useRef(new LoginRateLimiter(3, 5 * 60 * 1000))

  const statTickets = useCounter(12400, '',    1200, 900)
  const statSla     = useCounter(98,    '%',   1000, 900)
  const statTime    = useCounter(4,     'min',  800, 900)

  useEffect(() => {
    const savedRemember = sessionStorage.getItem('rememberMe') === 'true'
    setRememberMe(savedRemember)
    const state = rateLimiter.current.check()
    if (state.isBlocked) {
      setBlockedUntil(new Date(Date.now() + state.waitSeconds * 1000))
    }
  }, [])

  useEffect(() => {
    if (!blockedUntil) return
    const iv = setInterval(() => {
      if (new Date() >= blockedUntil) {
        rateLimiter.current.reset()
        setBlockedUntil(null)
        setAlert(null)
      } else {
        setBlockedUntil(new Date(blockedUntil))
      }
    }, 1000)
    return () => clearInterval(iv)
  }, [blockedUntil])

  useEffect(() => {
    const iv = setInterval(() => setTicketCount(c => c + 1), 4000)
    return () => clearInterval(iv)
  }, [])

  const getBlockedSeconds = () =>
    !blockedUntil ? 0 : Math.max(0, Math.ceil((blockedUntil - new Date()) / 1000))

  const validateFields = () => {
    let ok = true
    if (!email.trim() || !isValidEmail(email))   { setEmailError(true); ok = false }
    if (!senha.trim() || !isValidPassword(senha)) { setSenhaError(true); ok = false }
    return ok
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAlert(null)

    const limiterCheck = rateLimiter.current.check()
    if (limiterCheck.isBlocked) {
      setAlert({ type: 'warn', msg: `Muitas tentativas. Aguarde ${Math.ceil(limiterCheck.waitSeconds)}s.` })
      return
    }

    if (!validateFields()) return

    try {
      await contextLogin(email, senha)
      if (rememberMe) sessionStorage.setItem('rememberMe', 'true')
      else sessionStorage.removeItem('rememberMe')

      setAlert({ type: 'ok', msg: 'Login realizado com sucesso!' })
      toast.success('Bem-vindo ao SupportFlow!')
      rateLimiter.current.reset()

      setTimeout(() => {
        const usuario = JSON.parse(sessionStorage.getItem('authUser') || '{}')
        navigate(getRouteByRole(usuario?.tipo))
      }, 500)
    } catch (error) {
      const msg    = getApiErrorMessage(error, 'Credenciais inválidas')
      const status = error?.response?.status
      const shouldCountAttempt = status === 400 || status === 401

      if (!shouldCountAttempt) {
        setAlert({ type: 'err', msg })
        return
      }

      const result = rateLimiter.current.recordAttempt()

      if (result.isBlocked) {
        const wait = Math.ceil(result.waitSeconds / 1000)
        setBlockedUntil(new Date(Date.now() + result.waitSeconds))
        setAlert({ type: 'warn', msg: `Bloqueado por ${wait} minutos após ${result.attempts} tentativas.` })
        toast.error('Conta temporariamente bloqueada')
      } else {
        const remaining = 3 - result.attempts
        setAlert({
          type: 'err',
          msg: `${msg} — ${remaining} tentativa${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`,
        })
        setEmailError(true)
        setSenhaError(true)
      }
    }
  }

  const isBlocked = blockedUntil !== null

  return (
    <div className="sf-root">
      <style>{loginStyles}</style>
      <style>{loginExtras}</style>

      {/* ════════ LEFT PANEL ════════ */}
      <div className="sf-panel-left">
        <div className="sf-grid-bg" />
        <div className="sf-grid-vignette" />
        <div className="sf-blob sf-blob-1" />
        <div className="sf-blob sf-blob-2" />
        <div className="sf-blob sf-blob-3" />

        <div className="sf-floating-cards">
          <div className="sf-fc sf-fc-1">
            <div className="sf-fc-dot sf-fc-dot-green" />
            <div>
              <div className="sf-fc-count">{ticketCount}</div>
              <div className="sf-fc-text">Chamados resolvidos hoje</div>
            </div>
          </div>
          <div className="sf-fc sf-fc-2">
            <div className="sf-fc-dot sf-fc-dot-amber" />
            <div>
              <div className="sf-fc-count">12</div>
              <div className="sf-fc-text">Em atendimento agora</div>
            </div>
          </div>
          <div className="sf-fc sf-fc-3">
            <div className="sf-fc-dot sf-fc-dot-red" />
            <div>
              <div className="sf-fc-count">3</div>
              <div className="sf-fc-text">Prioridade crítica</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 5, width: '100%', maxWidth: '560px' }}>
          <div className="sf-brand">
            <div className="sf-brand-icon"><BrandMark className="sf-brand-img" /></div>
            <div>
              <div className="sf-brand-name">SupportFlow</div>
              <div className="sf-brand-tag">Enterprise Platform</div>
            </div>
          </div>

          <div className="sf-hero-wrap">
            <div className="sf-badge">
              <span className="sf-badge-dot" />
              Sistema Operacional · Uptime 99.97%
            </div>
            <h1 className="sf-h1">
              Suporte técnico<br />
              <span>inteligente</span> e<br />
              sem atrito.
            </h1>
            <p className="sf-hero-p">
              Gerencie chamados, escale prioridades e acompanhe SLAs em tempo real —
              tudo em uma plataforma corporativa unificada.
            </p>
          </div>

          <div className="sf-stats">
            <div className="sf-stat">
              <span className="sf-stat-num">{statTickets}</span>
              <span className="sf-stat-lbl">Chamados/mês</span>
            </div>
            <div className="sf-stat-div" />
            <div className="sf-stat">
              <span className="sf-stat-num">{statSla}</span>
              <span className="sf-stat-lbl">SLA cumprido</span>
            </div>
            <div className="sf-stat-div" />
            <div className="sf-stat">
              <span className="sf-stat-num">{statTime}</span>
              <span className="sf-stat-lbl">Tempo médio</span>
            </div>
          </div>

          <FlowDiagram />
        </div>
      </div>

      {/* ════════ RIGHT PANEL ════════ */}
      <div className="sf-panel-right">
        <div className="sf-form-box">

          {/* Brand + stats exclusivos do mobile */}
          <MobileBrand />
          <MobileStats tickets={statTickets} sla={statSla} time={statTime} />

          {/* Header */}
          <div className="sf-form-header">
            <div className="sf-eyebrow">Acesso Corporativo</div>
            <div className="sf-form-title">
              Bem-vindo de volta
              <small>Insira suas credenciais para continuar</small>
            </div>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`sf-alert sf-alert-${alert.type}`}>
              <IconAlert />
              <span>
                {alert.type === 'warn' && isBlocked
                  ? `Muitas tentativas. Aguarde ${getBlockedSeconds()}s para tentar novamente.`
                  : alert.msg}
              </span>
            </div>
          )}

          <PricingCTA onNavigate={() => navigate('/planos')} />

          {/* Form */}
          <form onSubmit={handleLogin} noValidate>
            <div className="sf-form-group">
              <label className="sf-label" htmlFor="sf-email">E-mail</label>
              <div className="sf-input-wrap">
                <span className="sf-input-icon"><IconMail /></span>
                <input
                  id="sf-email"
                  className={`sf-input${emailError ? ' invalid' : ''}`}
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(false) }}
                  onBlur={() => { if (email && !isValidEmail(email)) setEmailError(true) }}
                  placeholder="voce@empresa.com"
                  disabled={isBlocked}
                  autoComplete="username"
                />
                <div className="sf-focus-line" />
              </div>
              {emailError && <div className="sf-field-hint show">E-mail inválido</div>}
            </div>

            <div className="sf-form-group">
              <label className="sf-label" htmlFor="sf-senha">Senha</label>
              <div className="sf-input-wrap">
                <span className="sf-input-icon"><IconLock /></span>
                <input
                  id="sf-senha"
                  className={`sf-input${senhaError ? ' invalid' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setSenhaError(false) }}
                  onBlur={() => { if (senha && !isValidPassword(senha)) setSenhaError(true) }}
                  placeholder="••••••••"
                  disabled={isBlocked}
                  autoComplete="current-password"
                />
                <button
                  className="sf-pass-toggle"
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  disabled={isBlocked}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
                <div className="sf-focus-line" />
              </div>
              {senhaError && <div className="sf-field-hint show">Mínimo de 6 caracteres</div>}
            </div>

            <div className="sf-opts">
              <label className="sf-check-label">
                <div
                  className={`sf-check-box${rememberMe ? ' checked' : ''}`}
                  onClick={() => setRememberMe(v => !v)}
                  role="checkbox"
                  aria-checked={rememberMe}
                  tabIndex={0}
                  onKeyDown={e => e.key === ' ' && setRememberMe(v => !v)}
                />
                <span>Manter sessão</span>
              </label>
              <a href="/recuperar-senha" className="sf-forgot">Esqueceu a senha?</a>
            </div>

            <button
              className="sf-submit-btn"
              type="submit"
              disabled={isLoading || isBlocked}
            >
              {isLoading ? (
                <div className="sf-btn-spinner" />
              ) : isBlocked ? (
                <>Bloqueado — {getBlockedSeconds()}s</>
              ) : (
                <>
                  <span>Entrar na Plataforma</span>
                  <IconArrow />
                </>
              )}
            </button>
          </form>

          <div className="sf-sec-badge">
            <div className="sf-sec-dot" />
            <span>Conexão segura · TLS 1.3 · SOC 2 Certificado</span>
          </div>

          <div className="sf-form-footer">
            Problemas de acesso?{' '}
            <a href="mailto:ti@empresa.com">Contate o administrador</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
