/**
 * PricingPage — Premium & Animatedssss
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check, X, ArrowLeft, ArrowRight, Shield, Server,
  Database, ChevronDown, Zap, Users, BarChart3, Star
} from 'lucide-react'
import { toast } from 'sonner'

/* ─────────────────────── CSS ─────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  :root {
    --navy-950: #070e1a;
    --navy-900: #0d1b2e;
    --navy-800: #0f2040;
    --navy-700: #132847;
    --blue-main: #2b6cff;
    --blue-light: #4d87ff;
    --blue-glow: rgba(43,108,255,0.35);
    --blue-subtle: rgba(43,108,255,0.08);
    --cyan: #38bdf8;
    --emerald: #10b981;
    --slate-300: #cbd5e1;
    --slate-400: #94a3b8;
    --slate-500: #64748b;
    --white-06: rgba(255,255,255,0.06);
    --white-10: rgba(255,255,255,0.10);
    --white-15: rgba(255,255,255,0.15);
    --radius-xl: 20px;
    --radius-lg: 14px;
    --radius-md: 10px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pr-root {
    min-height: 100vh;
    height: 100%;
    background: var(--navy-950);
    font-family: 'DM Sans', sans-serif;
    color: var(--slate-300);
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    position: relative;
  }

  /* ── Animated Background ── */
  .pr-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .pr-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(43,108,255,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(43,108,255,0.06) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
    animation: pr-grid-pulse 8s ease-in-out infinite;
  }

  @keyframes pr-grid-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .pr-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    animation: pr-float linear infinite;
  }

  .pr-orb-1 {
    width: 600px; height: 600px;
    top: -200px; left: -150px;
    background: radial-gradient(circle, rgba(43,108,255,0.18) 0%, transparent 70%);
    animation-duration: 20s;
  }

  .pr-orb-2 {
    width: 500px; height: 500px;
    top: 30%; right: -100px;
    background: radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%);
    animation-duration: 25s;
    animation-direction: reverse;
  }

  .pr-orb-3 {
    width: 400px; height: 400px;
    bottom: 10%; left: 20%;
    background: radial-gradient(circle, rgba(43,108,255,0.12) 0%, transparent 70%);
    animation-duration: 18s;
  }

  @keyframes pr-float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-20px, 15px) scale(0.97); }
  }

  /* ── Layout ── */
  .pr-content {
    position: relative;
    z-index: 1;
    padding-bottom: 2.5rem;
  }

  /* ── Header ── */
  .pr-header {
    padding: 3rem 2rem 2rem;
    text-align: center;
    animation: pr-fadein 0.7s ease both;
  }

  @keyframes pr-fadein {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pr-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2.5rem;
    padding: 9px 18px;
    border-radius: var(--radius-md);
    background: var(--white-06);
    border: 1px solid var(--white-10);
    color: var(--slate-400);
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.25s;
    font-family: 'DM Sans', sans-serif;
  }

  .pr-back:hover {
    background: var(--white-10);
    border-color: var(--white-15);
    color: var(--slate-300);
    transform: translateX(-2px);
  }

  .pr-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 50px;
    background: rgba(43,108,255,0.12);
    border: 1px solid rgba(43,108,255,0.3);
    color: #7eb8ff;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    font-family: 'Sora', sans-serif;
  }

  .pr-title {
    font-family: 'Sora', sans-serif;
    font-size: clamp(2rem, 5vw, 3.25rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #ffffff 0%, #7eb8ff 60%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .pr-subtitle {
    font-size: 1.05rem;
    color: var(--slate-400);
    max-width: 480px;
    margin: 0 auto 2.5rem;
    line-height: 1.6;
  }

  /* ── Toggle ── */
  .pr-toggle-wrap {
    display: inline-flex;
    align-items: center;
    padding: 5px;
    border-radius: 12px;
    background: var(--white-06);
    border: 1px solid var(--white-10);
    gap: 4px;
    margin-bottom: 1.5rem;
  }

  .pr-toggle-btn {
    padding: 9px 22px;
    border-radius: 9px;
    border: none;
    background: transparent;
    color: var(--slate-400);
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.25s;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pr-toggle-btn.active {
    background: var(--blue-main);
    color: #fff;
    box-shadow: 0 4px 16px rgba(43,108,255,0.4);
  }

  .pr-toggle-btn:not(.active):hover {
    color: #fff;
    background: var(--white-10);
  }

  .pr-discount {
    padding: 3px 10px;
    background: rgba(16,185,129,0.2);
    border: 1px solid rgba(16,185,129,0.35);
    border-radius: 20px;
    color: #6ee7b7;
    font-size: 11px;
    font-weight: 700;
  }

  .pr-revenue {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: rgba(43,108,255,0.08);
    border: 1px solid rgba(43,108,255,0.2);
    border-radius: var(--radius-md);
    font-size: 14px;
    color: #7eb8ff;
  }

  .pr-revenue strong { color: #fff; }

  .pr-revenue-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--emerald);
    box-shadow: 0 0 6px var(--emerald);
    animation: pr-blink 2s ease infinite;
  }

  @keyframes pr-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* ── Cards Grid ── */
  .pr-cards {
    max-width: 1140px;
    margin: 0 auto;
    padding: 1rem 2rem 4rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    align-items: start;
  }

  .pr-card {
    border-radius: var(--radius-xl);
    border: 1px solid var(--white-10);
    background: var(--white-06);
    padding: 2.25rem;
    position: relative;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    animation: pr-fadein 0.7s ease both;
    overflow: hidden;
  }

  .pr-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.4s;
    background: linear-gradient(135deg, rgba(43,108,255,0.06), transparent);
  }

  .pr-card:hover::before { opacity: 1; }

  .pr-card:nth-child(1) { animation-delay: 0.1s; }
  .pr-card:nth-child(2) { animation-delay: 0.2s; }
  .pr-card:nth-child(3) { animation-delay: 0.3s; }

  .pr-card:hover {
    border-color: rgba(43,108,255,0.4);
    transform: translateY(-6px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(43,108,255,0.08);
  }

  .pr-card.popular {
    border-color: rgba(43,108,255,0.6);
    background: linear-gradient(160deg, rgba(43,108,255,0.14) 0%, rgba(43,108,255,0.05) 60%, var(--white-06) 100%);
    box-shadow: 0 0 0 1px rgba(43,108,255,0.3), 0 24px 80px rgba(43,108,255,0.18);
    transform: translateY(-12px);
    animation: pr-popular-float 5s ease-in-out infinite;
  }

  @keyframes pr-popular-float {
    0%, 100% { transform: translateY(-12px); }
    50% { transform: translateY(-20px); }
  }

  .pr-card.popular:hover {
    transform: translateY(-22px);
    animation: none;
    box-shadow: 0 0 0 1px rgba(43,108,255,0.5), 0 32px 100px rgba(43,108,255,0.25);
  }

  .pr-card-glow {
    position: absolute;
    top: -1px; left: -1px; right: -1px;
    height: 2px;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    background: linear-gradient(90deg, transparent, var(--blue-main), var(--cyan), var(--blue-main), transparent);
    background-size: 200% 100%;
    animation: pr-glow-slide 3s linear infinite;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .pr-card.popular .pr-card-glow { opacity: 1; }
  .pr-card:hover .pr-card-glow { opacity: 0.6; }

  @keyframes pr-glow-slide {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }

  .pr-badge {
    position: absolute;
    top: 18px; right: 18px;
    padding: 5px 12px;
    background: linear-gradient(135deg, var(--blue-main), #1b50cc);
    color: #fff;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Sora', sans-serif;
    box-shadow: 0 4px 12px rgba(43,108,255,0.4);
  }

  .pr-plan-name {
    font-family: 'Sora', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pr-plan-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--blue-subtle);
    border: 1px solid rgba(43,108,255,0.2);
  }

  .pr-price-block { margin-bottom: 0.5rem; }

  .pr-price {
    font-family: 'Sora', sans-serif;
    font-size: 2.8rem;
    font-weight: 800;
    color: #fff;
    line-height: 1;
    display: flex;
    align-items: flex-end;
    gap: 4px;
  }

  .pr-price-currency {
    font-size: 1.2rem;
    color: var(--blue-light);
    margin-bottom: 5px;
    font-weight: 600;
  }

  .pr-price-period {
    font-size: 0.9rem;
    color: var(--slate-400);
    margin-bottom: 6px;
    font-weight: 400;
  }

  .pr-price-annual {
    font-size: 12px;
    color: var(--slate-500);
    margin-bottom: 1rem;
    height: 18px;
  }

  .pr-price-annual.show {
    color: #6ee7b7;
  }

  .pr-desc {
    font-size: 0.9rem;
    color: var(--slate-400);
    line-height: 1.5;
    margin-bottom: 1.75rem;
    padding-bottom: 1.75rem;
    border-bottom: 1px solid var(--white-10);
  }

  .pr-btn {
    width: 100%;
    padding: 13px 16px;
    border-radius: var(--radius-md);
    border: none;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.25s;
    margin-bottom: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
  }

  .pr-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }

  .pr-btn:hover::after { transform: translateX(100%); }

  .pr-btn.primary {
    background: linear-gradient(135deg, var(--blue-main), #1b50cc);
    color: #fff;
    box-shadow: 0 4px 20px rgba(43,108,255,0.35);
  }

  .pr-btn.primary:hover {
    box-shadow: 0 8px 32px rgba(43,108,255,0.5);
    transform: translateY(-1px);
  }

  .pr-btn.secondary {
    background: var(--white-06);
    color: var(--slate-300);
    border: 1px solid var(--white-15);
  }

  .pr-btn.secondary:hover {
    background: var(--white-10);
    border-color: rgba(43,108,255,0.3);
    color: #fff;
  }

  /* ── Features list ── */
  .pr-features { display: flex; flex-direction: column; gap: 0.7rem; }

  .pr-feature {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13.5px;
    color: var(--slate-300);
    line-height: 1.4;
  }

  .pr-feature-icon {
    width: 20px; height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .pr-feature-icon.yes {
    background: rgba(16,185,129,0.15);
    color: var(--emerald);
  }

  .pr-feature-icon.no {
    background: rgba(100,116,139,0.12);
    color: var(--slate-500);
  }

  .pr-feature.excluded {
    opacity: 0.4;
  }

  /* ─────────────── Trust Section ─────────────── */
  .pr-trust {
    max-width: 1140px;
    margin: 0 auto 5rem;
    padding: 0 2rem;
    animation: pr-fadein 0.7s ease 0.4s both;
  }

  .pr-trust-title {
    font-family: 'Sora', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .pr-trust-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .pr-trust-card {
    border-radius: var(--radius-lg);
    border: 1px solid var(--white-10);
    background: var(--white-06);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: border-color 0.3s, transform 0.3s;
  }

  .pr-trust-card:hover {
    border-color: rgba(43,108,255,0.35);
    transform: translateY(-3px);
  }

  .pr-trust-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(43,108,255,0.12);
    border: 1px solid rgba(43,108,255,0.2);
    color: var(--blue-light);
  }

  .pr-trust-card h4 {
    font-family: 'Sora', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
  }

  .pr-trust-card p {
    font-size: 13px;
    color: var(--slate-400);
    line-height: 1.6;
  }

  /* ─────────────── Comparison Table ─────────────── */
  .pr-compare {
    max-width: 1140px;
    margin: 0 auto 5rem;
    padding: 0 2rem;
    animation: pr-fadein 0.7s ease 0.5s both;
  }

  .pr-compare-title {
    font-family: 'Sora', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    text-align: center;
    margin-bottom: 2rem;
  }

  .pr-compare-wrap {
    border-radius: var(--radius-xl);
    border: 1px solid var(--white-10);
    background: var(--white-06);
    overflow: hidden;
  }

  .pr-cmp-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    background: rgba(43,108,255,0.08);
    border-bottom: 1px solid var(--white-10);
  }

  .pr-cmp-hcell {
    padding: 1rem 1.25rem;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: var(--slate-300);
    text-align: center;
  }

  .pr-cmp-hcell:first-child { text-align: left; }
  .pr-cmp-hcell.highlight { color: var(--blue-light); }

  .pr-cmp-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: background 0.2s;
  }

  .pr-cmp-row:last-child { border-bottom: none; }
  .pr-cmp-row:hover { background: var(--white-06); }

  .pr-cmp-cell {
    padding: 0.9rem 1.25rem;
    font-size: 13px;
    color: var(--slate-400);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .pr-cmp-cell:first-child {
    justify-content: flex-start;
    color: var(--slate-300);
    font-weight: 500;
  }

  .pr-cmp-cell.check { color: var(--emerald); }
  .pr-cmp-cell.cross { color: var(--slate-500); opacity: 0.5; }

  /* ─────────────── FAQ ─────────────── */
  .pr-faq {
    max-width: 760px;
    margin: 0 auto 5rem;
    padding: 0 2rem;
    animation: pr-fadein 0.7s ease 0.6s both;
  }

  .pr-faq-title {
    font-family: 'Sora', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    text-align: center;
    margin-bottom: 2rem;
  }

  .pr-faq-item {
    border-radius: var(--radius-lg);
    border: 1px solid var(--white-10);
    background: var(--white-06);
    margin-bottom: 12px;
    overflow: hidden;
    transition: border-color 0.25s;
  }

  .pr-faq-item.open {
    border-color: rgba(43,108,255,0.3);
    background: rgba(43,108,255,0.05);
  }

  .pr-faq-q {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.25rem;
    background: none;
    border: none;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    gap: 12px;
  }

  .pr-faq-q:hover { color: var(--blue-light); }

  .pr-faq-chevron {
    flex-shrink: 0;
    color: var(--slate-400);
    transition: transform 0.3s ease;
  }

  .pr-faq-item.open .pr-faq-chevron { transform: rotate(180deg); color: var(--blue-light); }

  .pr-faq-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease, padding 0.3s ease;
  }

  .pr-faq-item.open .pr-faq-body { max-height: 300px; }

  .pr-faq-body p {
    padding: 0 1.25rem 1.25rem;
    font-size: 13.5px;
    color: var(--slate-400);
    line-height: 1.7;
  }

  /* ─────────────── CTA Banner ─────────────── */
  .pr-cta {
    max-width: 1140px;
    margin: 0 auto 4rem;
    padding: 0 2rem;
    animation: pr-fadein 0.7s ease 0.7s both;
  }

  .pr-cta-inner {
    border-radius: var(--radius-xl);
    border: 1px solid rgba(43,108,255,0.3);
    background: linear-gradient(135deg, rgba(43,108,255,0.14) 0%, rgba(43,108,255,0.05) 100%);
    padding: 3rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .pr-cta-inner::before {
    content: '';
    position: absolute;
    top: -80px; left: 50%;
    transform: translateX(-50%);
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(43,108,255,0.2) 0%, transparent 70%);
    pointer-events: none;
  }

  .pr-cta-inner h2 {
    font-family: 'Sora', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 0.75rem;
  }

  .pr-cta-inner p {
    font-size: 1rem;
    color: var(--slate-400);
    margin-bottom: 2rem;
  }

  .pr-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 28px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--blue-main), #1b50cc);
    border: none;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.25s;
    box-shadow: 0 6px 24px rgba(43,108,255,0.4);
  }

  .pr-cta-btn:hover {
    box-shadow: 0 10px 36px rgba(43,108,255,0.55);
    transform: translateY(-2px);
  }

  /* ─────────────── Footer ─────────────── */
  .pr-footer {
    border-top: 1px solid var(--white-10);
    padding: 2rem;
    text-align: center;
    font-size: 13px;
    color: var(--slate-500);
  }

  .pr-footer a {
    color: var(--blue-light);
    text-decoration: none;
    font-weight: 600;
  }

  .pr-footer a:hover { text-decoration: underline; }

  /* ─────────────── Responsive ─────────────── */
  @media (max-width: 900px) {
    .pr-cards {
      grid-template-columns: 1fr;
      max-width: 480px;
    }

    .pr-card.popular {
      transform: none;
      animation: none;
      order: -1;
    }

    .pr-trust-grid { grid-template-columns: 1fr; }

    .pr-cmp-header,
    .pr-cmp-row {
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
    }

    .pr-cmp-hcell,
    .pr-cmp-cell { padding: 0.8rem 0.6rem; font-size: 12px; }
  }

  @media (max-width: 600px) {
    .pr-cmp-header,
    .pr-cmp-row { grid-template-columns: 1.8fr 1fr 1fr 1fr; }
    .pr-cta-inner { padding: 2rem 1.5rem; }
  }
`

/* ─────────────── Data ─────────────── */
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: <Zap size={16} color="#7eb8ff" />,
    monthlyPrice: 299,
    annualPrice: 2990,
    description: 'Perfeito para equipes pequenas que estão começando com gestão de chamados.',
    button: 'Começar grátis',
    badge: null,
    features: [
      { label: 'Até 3 técnicos',            included: true  },
      { label: '300 chamados/mês',           included: true  },
      { label: 'Alertas de SLA por e-mail',  included: true  },
      { label: 'Catálogo e locais',          included: true  },
      { label: 'Histórico de chamados',      included: true  },
      { label: 'Exportar CSV/PDF/Excel',     included: false },
      { label: 'Múltiplos departamentos',    included: false },
      { label: 'Relatórios corporativos',    included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: <Star size={16} color="#7eb8ff" />,
    monthlyPrice: 499,
    annualPrice: 4990,
    description: 'Para empresas em crescimento que precisam de escala e relatórios avançados.',
    button: 'Assinar Pro',
    badge: 'Mais popular',
    features: [
      { label: 'Até 10 técnicos',            included: true  },
      { label: 'Chamados ilimitados',         included: true  },
      { label: 'Alertas de SLA por e-mail',  included: true  },
      { label: 'Catálogo e locais',          included: true  },
      { label: 'Histórico de chamados',      included: true  },
      { label: 'Exportar CSV/PDF/Excel',     included: true  },
      { label: 'Múltiplos departamentos',    included: false },
      { label: 'Relatórios corporativos',    included: true  },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    icon: <Users size={16} color="#7eb8ff" />,
    monthlyPrice: 899,
    annualPrice: 8990,
    description: 'Capacidade total para médias e grandes empresas com múltiplas unidades.',
    button: 'Assinar Business',
    badge: null,
    features: [
      { label: 'Técnicos ilimitados',        included: true  },
      { label: 'Chamados ilimitados',         included: true  },
      { label: 'Alertas de SLA por e-mail',  included: true  },
      { label: 'Catálogo e locais',          included: true  },
      { label: 'Histórico de chamados',      included: true  },
      { label: 'Exportar CSV/PDF/Excel',     included: true  },
      { label: 'Múltiplos departamentos',    included: true  },
      { label: 'Relatórios corporativos',    included: true  },
    ],
  },
]

const COMPARE_ROWS = [
  { label: 'Técnicos',              starter: '3',    pro: '10',   business: '∞'   },
  { label: 'Chamados/mês',          starter: '300',  pro: '∞',    business: '∞'   },
  { label: 'SLA por e-mail',        starter: true,   pro: true,   business: true  },
  { label: 'Catálogo e locais',     starter: true,   pro: true,   business: true  },
  { label: 'Histórico completo',    starter: true,   pro: true,   business: true  },
  { label: 'Exportar CSV/PDF',      starter: false,  pro: true,   business: true  },
  { label: 'Relatórios corporativos', starter: false, pro: true,  business: true  },
  { label: 'Múltiplos departamentos', starter: false, pro: false, business: true  },
  { label: 'Suporte prioritário',   starter: false,  pro: true,   business: true  },
  { label: 'SLA personalizado',     starter: false,  pro: false,  business: true  },
]

const FAQ = [
  {
    q: 'Posso mudar de plano a qualquer momento?',
    a: 'Sim. Upgrades são imediatos e o valor proporcional é creditado. Para downgrades, a mudança ocorre no início do próximo ciclo de cobrança, sem fidelidade.',
  },
  {
    q: 'Como funciona o desconto anual?',
    a: 'Ao optar pelo ciclo anual, você paga em uma parcela com 20% de desconto. No Pro, por exemplo, o valor efetivo cai de R$499 para aproximadamente R$416/mês.',
  },
  {
    q: 'O que acontece se eu atingir o limite de chamados no Starter?',
    a: 'O sistema emite um alerta preventivo ao atingir 80% do limite. Ao atingir 100%, novos chamados são bloqueados até o próximo ciclo ou até você fazer upgrade.',
  },
  {
    q: 'Os dados são seguros?',
    a: 'Sim. Senhas são protegidas com bcrypt e toda autenticação ocorre via JWT com expiração configurável. Os anexos são armazenados em infraestrutura no Render com Docker, com backup automático diário.',
  },
  {
    q: 'Existe período de teste gratuito?',
    a: 'O plano Starter é gratuito por 30 dias sem necessidade de cartão de crédito. Após o período, você escolhe continuar no Starter pago ou migrar para um plano maior.',
  },
]

/* ── Helper ── */
const fmt = (n) => n.toLocaleString('pt-BR')
const fmtCurrency = (n) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const CellValue = ({ val }) => {
  if (val === true)  return <span className="pr-cmp-cell check"><Check size={16} /></span>
  if (val === false) return <span className="pr-cmp-cell cross"><X size={15} /></span>
  return <span className="pr-cmp-cell" style={{ color: '#cbd5e1', fontWeight: 600 }}>{val}</span>
}

/* ─────────────── Component ─────────────── */
const PricingPage = () => {
  const [billing, setBilling]   = useState('monthly')
  const [openFaq, setOpenFaq]   = useState(null)
  const navigate = useNavigate()

  const handleSelectPlan = (planId) => {
    toast.success(`Plano ${planId.toUpperCase()} selecionado!`)
    setTimeout(() => {
      if (planId === 'starter') navigate('/usuario')
      else toast.info('Redirecionando para checkout...')
    }, 900)
  }

  const revenue = fmtCurrency(billing === 'monthly' ? 10 * 499 : (10 * 4990) / 12)

  return (
    <div className="pr-root">
      <style>{CSS}</style>

      {/* Animated Background */}
      <div className="pr-bg">
        <div className="pr-grid" />
        <div className="pr-orb pr-orb-1" />
        <div className="pr-orb pr-orb-2" />
        <div className="pr-orb pr-orb-3" />
      </div>

      <div className="pr-content">

        {/* ── Header ── */}
        <div className="pr-header">
          <button className="pr-back" onClick={() => navigate('/')}>
            <ArrowLeft size={15} /> Voltar ao Login
          </button>

          <div className="pr-eyebrow">
            <BarChart3 size={13} /> Planos & Preços
          </div>

          <h1 className="pr-title">
            Escale seu suporte<br />sem escalar os custos
          </h1>

          <p className="pr-subtitle">
            Comece gratuitamente e cresça conforme sua equipe.
            Sem taxa de instalação, sem surpresas.
          </p>

          {/* Billing toggle */}
          <div className="pr-toggle-wrap">
            <button
              className={`pr-toggle-btn${billing === 'monthly' ? ' active' : ''}`}
              onClick={() => setBilling('monthly')}
            >
              Mensal
            </button>
            <button
              className={`pr-toggle-btn${billing === 'annual' ? ' active' : ''}`}
              onClick={() => setBilling('annual')}
            >
              Anual
              <span className="pr-discount">-20%</span>
            </button>
          </div>

          <br />

          <div className="pr-revenue">
            <span className="pr-revenue-dot" />
            Receita potencial com 10 clientes Pro:&nbsp;
            <strong>{revenue}/mês</strong>
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="pr-cards">
          {PLANS.map((plan) => {
            const price  = billing === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualPrice / 12)
            const isPop  = !!plan.badge

            return (
              <div key={plan.id} className={`pr-card${isPop ? ' popular' : ''}`}>
                <div className="pr-card-glow" />

                {plan.badge && <div className="pr-badge">{plan.badge}</div>}

                <div className="pr-plan-name">
                  <span className="pr-plan-icon">{plan.icon}</span>
                  {plan.name}
                </div>

                <div className="pr-price-block">
                  <div className="pr-price">
                    <span className="pr-price-currency">R$</span>
                    {fmt(price)}
                    <span className="pr-price-period">
                      /{billing === 'monthly' ? 'mês' : 'mês*'}
                    </span>
                  </div>
                </div>

                <div className={`pr-price-annual${billing === 'annual' ? ' show' : ''}`}>
                  {billing === 'annual'
                    ? `*R$ ${fmt(plan.annualPrice)} cobrado anualmente`
                    : ' '}
                </div>

                <p className="pr-desc">{plan.description}</p>

                <button
                  className={`pr-btn ${isPop ? 'primary' : 'secondary'}`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.button}
                  {plan.id !== 'starter' && <ArrowRight size={15} />}
                </button>

                <div className="pr-features">
                  {plan.features.map((f, i) => (
                    <div key={i} className={`pr-feature${f.included ? '' : ' excluded'}`}>
                      <span className={`pr-feature-icon ${f.included ? 'yes' : 'no'}`}>
                        {f.included
                          ? <Check size={11} />
                          : <X size={11} />
                        }
                      </span>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Security / Trust ── */}
        <div className="pr-trust">
          <h2 className="pr-trust-title">Infraestrutura segura e confiável</h2>
          <div className="pr-trust-grid">
            <div className="pr-trust-card">
              <div className="pr-trust-icon"><Shield size={22} /></div>
              <h4>Segurança de ponta a ponta</h4>
              <p>Senhas protegidas com bcrypt e autenticação via JWT com expiração configurável. Dados em trânsito criptografados via HTTPS/TLS.</p>
            </div>
            <div className="pr-trust-card">
              <div className="pr-trust-icon"><Server size={22} /></div>
              <h4>Infraestrutura robusta</h4>
              <p>Hospedado no Render com containers Docker para isolamento e consistência. Deploy automático com zero downtime em atualizações.</p>
            </div>
            <div className="pr-trust-card">
              <div className="pr-trust-icon"><Database size={22} /></div>
              <h4>Backup automático</h4>
              <p>Chamados e anexos com backup diário automático. Retenção de histórico completo garantida independente do plano contratado.</p>
            </div>
          </div>
        </div>

        {/* ── Comparison Table ── */}
        <div className="pr-compare">
          <h2 className="pr-compare-title">Comparativo completo de funcionalidades</h2>
          <div className="pr-compare-wrap">
            <div className="pr-cmp-header">
              <div className="pr-cmp-hcell">Funcionalidade</div>
              <div className="pr-cmp-hcell">Starter</div>
              <div className="pr-cmp-hcell highlight">Pro</div>
              <div className="pr-cmp-hcell">Business</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={i} className="pr-cmp-row">
                <div className="pr-cmp-cell">{row.label}</div>
                <CellValue val={row.starter} />
                <CellValue val={row.pro} />
                <CellValue val={row.business} />
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="pr-faq">
          <h2 className="pr-faq-title">Perguntas frequentes</h2>
          {FAQ.map((item, i) => (
            <div key={i} className={`pr-faq-item${openFaq === i ? ' open' : ''}`}>
              <button className="pr-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{item.q}</span>
                <ChevronDown size={18} className="pr-faq-chevron" />
              </button>
              <div className="pr-faq-body">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Banner ── */}
        <div className="pr-cta">
          <div className="pr-cta-inner">
            <h2>Pronto para começar?</h2>
            <p>Configure sua conta em minutos. Sem cartão de crédito para o plano Starter.</p>
            <button className="pr-cta-btn" onClick={() => handleSelectPlan('starter')}>
              Criar conta grátis <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="pr-footer">
          <p>
            Dúvidas?{' '}
            <a href="mailto:suporte@supportflow.com">Entre em contato</a>
            {' '}ou consulte a{' '}
            <a href="#">documentação</a>.
          </p>
          <p style={{ marginTop: '0.75rem', fontSize: '12px' }}>
            Todos os planos incluem suporte técnico, SLA monitorado e backup automático.
          </p>
        </div>

      </div>
    </div>
  )
}

export default PricingPage
