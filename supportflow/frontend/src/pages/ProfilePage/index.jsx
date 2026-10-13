/**
 * SupportFlow — Profile Page
 * Redesigned from scratch — dark theme matching the site's design language.
 * Colors: navy #060d1a / #0b1525 / #0f1e30 · Accent #2b6cff · Font: Plus Jakarta Sans
 */
import { createElement, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock, Key, ArrowLeft, Mail, User, Shield,
  CheckCircle2, Eye, EyeOff, Building2, Camera,
  Settings, Trash2, LogOut,
  AlertTriangle, Upload, Link as LinkIcon, Save,
  ChevronRight, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { perfilAPI, authAPI, getApiErrorMessage } from '../../services/api'

// ─── Inline styles injected into <head> ───────────────────────────────────────
const PROFILE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  .pf2-root {
    height: 100vh;
    height: 100dvh;
    overflow-y: auto;
    background: #060d1a;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #e8f0fe;
    overflow-x: hidden;
  }
  .pf2-root::-webkit-scrollbar {
    width: 8px;
  }
  .pf2-root::-webkit-scrollbar-track {
    background: #060d1a;
  }
  .pf2-root::-webkit-scrollbar-thumb {
    background: rgba(43, 108, 255, 0.2);
    border-radius: 99px;
  }
  .pf2-root::-webkit-scrollbar-thumb:hover {
    background: rgba(43, 108, 255, 0.45);
  }
  .pf2-root * { box-sizing: border-box; }

  /* ── Grid background ── */
  .pf2-grid-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(43,108,255,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(43,108,255,.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .pf2-grid-vignette {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse 80% 80% at 50% 0%, transparent 30%, #060d1a 100%);
  }

  /* ── Blobs ── */
  .pf2-blob {
    position: fixed; border-radius: 50%;
    filter: blur(100px); opacity: .12;
    pointer-events: none; z-index: 0;
    animation: pf2BlobFloat 10s ease-in-out infinite;
  }
  .pf2-blob-1 { width: 500px; height: 500px; background: #1a4dbf; top: -120px; left: -100px; animation-delay: 0s; }
  .pf2-blob-2 { width: 350px; height: 350px; background: #0891b2; bottom: -80px; right: -60px; animation-delay: 4s; }
  @keyframes pf2BlobFloat {
    0%,100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-30px) scale(1.04); }
  }

  /* ── Topbar ── */
  .pf2-topbar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(6,13,26,0.85);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid rgba(43,108,255,0.12);
    padding: 0 2rem;
    display: flex; align-items: center; gap: 1rem;
    height: 60px;
  }
  .pf2-back-btn {
    display: flex; align-items: center; gap: 6px;
    color: #7890b0; font-size: 13px; font-weight: 600;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px; padding: 6px 14px;
    cursor: pointer; transition: all .2s ease;
    text-decoration: none;
  }
  .pf2-back-btn:hover { color: #e8f0fe; background: rgba(255,255,255,0.08); border-color: rgba(43,108,255,0.3); }
  .pf2-topbar-title {
    font-size: 14px; font-weight: 700; color: #e8f0fe; letter-spacing: -0.01em;
  }
  .pf2-topbar-sub { font-size: 12px; color: #4a6585; }

  /* ── Layout ── */
  .pf2-layout {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
    display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .pf2-layout { grid-template-columns: 1fr; }
    .pf2-sidebar { display: none; }
    .pf2-mobile-tabs { display: flex !important; }
  }

  /* ── Hero Card ── */
  .pf2-hero {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #0f1e30 0%, #0b1728 100%);
    border: 1px solid rgba(43,108,255,0.18);
    border-radius: 20px; overflow: hidden;
    position: relative;
  }
  .pf2-hero-banner {
    height: 120px;
    background: linear-gradient(135deg, #1a3a7a 0%, #0e2a60 30%, #1a0a4a 70%, #0a1a50 100%);
    position: relative; overflow: hidden;
  }
  .pf2-hero-banner::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .pf2-hero-banner::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 40px;
    background: linear-gradient(to bottom, transparent, #0f1e30);
  }
  .pf2-hero-glow {
    position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
    width: 300px; height: 180px;
    background: radial-gradient(ellipse, rgba(43,108,255,0.3) 0%, transparent 70%);
    pointer-events: none;
  }
  .pf2-hero-body {
    padding: 0 1.75rem 1.75rem;
    display: flex; flex-wrap: wrap;
    align-items: flex-end; gap: 1.25rem;
  }
  .pf2-avatar-wrap {
    position: relative; margin-top: -44px; flex-shrink: 0;
    cursor: pointer;
  }
  .pf2-avatar-wrap:hover .pf2-avatar-overlay { opacity: 1; }
  .pf2-avatar {
    width: 88px; height: 88px; border-radius: 18px;
    border: 3px solid #0f1e30;
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    font-size: 1.75rem; font-weight: 800; color: #fff;
    background: linear-gradient(135deg, #2b6cff, #6366f1);
    flex-shrink: 0;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .pf2-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .pf2-avatar-overlay {
    position: absolute; inset: 3px; border-radius: 15px;
    background: rgba(0,0,0,0.55); opacity: 0; transition: opacity .2s;
    display: flex; align-items: center; justify-content: center;
  }
  .pf2-hero-info { flex: 1; min-width: 0; padding-bottom: 4px; }
  .pf2-hero-name {
    font-size: 1.35rem; font-weight: 800; color: #e8f0fe;
    letter-spacing: -0.02em; line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pf2-hero-meta {
    display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 6px;
  }
  .pf2-hero-meta-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 12.5px; color: #7890b0; font-weight: 500;
  }
  .pf2-hero-actions {
    display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
    padding-bottom: 4px;
  }
  .pf2-role-badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 11.5px; font-weight: 700; letter-spacing: 0.03em;
    padding: 5px 12px; border-radius: 99px;
  }
  .pf2-role-badge.gestor  { background: rgba(168,85,247,.15); color: #c084fc; border: 1px solid rgba(168,85,247,.3); }
  .pf2-role-badge.tecnico { background: rgba(43,108,255,.15);  color: #7eb8ff; border: 1px solid rgba(43,108,255,.3); }
  .pf2-role-badge.usuario { background: rgba(255,255,255,.07); color: #94a3b8; border: 1px solid rgba(255,255,255,.12); }
  .pf2-status-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #10b981;
    box-shadow: 0 0 6px #10b981; animation: pf2Pulse 2s ease infinite;
  }
  @keyframes pf2Pulse {
    0%,100% { box-shadow: 0 0 4px #10b981; }
    50% { box-shadow: 0 0 10px #10b981; }
  }
  .pf2-logout-btn {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: #4a6585; font-weight: 600;
    background: none; border: none; cursor: pointer;
    transition: color .2s;
  }
  .pf2-logout-btn:hover { color: #ef4444; }
  .pf2-hero-stats {
    border-top: 1px solid rgba(255,255,255,0.06);
    display: grid; grid-template-columns: repeat(3, 1fr);
    margin: 0 1.75rem 1.75rem;
    border-radius: 14px; overflow: hidden;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.06);
  }
  .pf2-stat {
    padding: 1rem;
    display: flex; flex-direction: column; align-items: center;
    border-right: 1px solid rgba(255,255,255,0.06);
    text-align: center;
  }
  .pf2-stat:last-child { border-right: none; }
  .pf2-stat-val {
    font-size: 1rem; font-weight: 800; color: #7eb8ff;
    font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1;
  }
  .pf2-stat-lbl {
    font-size: 10px; font-weight: 600; color: #4a6585;
    text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;
  }

  /* ── Sidebar ── */
  .pf2-sidebar {
    background: #0f1e30;
    border: 1px solid rgba(43,108,255,0.12);
    border-radius: 16px; overflow: hidden;
    position: sticky; top: 76px;
  }
  .pf2-menu-label {
    font-size: 10px; font-weight: 700; color: #4a6585;
    text-transform: uppercase; letter-spacing: 0.1em;
    padding: 1rem 1.25rem 0.5rem;
  }
  .pf2-nav-btn {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 11px 1.25rem; font-size: 13.5px; font-weight: 600;
    color: #7890b0; background: none; border: none; cursor: pointer;
    transition: all .18s ease; text-align: left;
    border-left: 3px solid transparent;
  }
  .pf2-nav-btn:hover { color: #e8f0fe; background: rgba(255,255,255,0.04); }
  .pf2-nav-btn.active {
    color: #7eb8ff; background: rgba(43,108,255,0.1);
    border-left-color: #2b6cff;
  }
  .pf2-nav-btn .pf2-nav-chevron {
    margin-left: auto; opacity: 0; transition: opacity .18s;
  }
  .pf2-nav-btn:hover .pf2-nav-chevron,
  .pf2-nav-btn.active .pf2-nav-chevron { opacity: 1; }
  .pf2-sidebar-footer {
    padding: 1rem 1.25rem;
    border-top: 1px solid rgba(255,255,255,0.06);
    font-size: 11px; color: #4a6585; text-align: center;
  }

  /* ── Mobile Tab Row ── */
  .pf2-mobile-tabs {
    display: none;
    background: #0f1e30;
    border: 1px solid rgba(43,108,255,0.12);
    border-radius: 16px; overflow-x: auto;
    padding: 6px;
    gap: 4px;
    scrollbar-width: none;
  }
  .pf2-mobile-tabs::-webkit-scrollbar { display: none; }
  .pf2-mobile-tab {
    flex-shrink: 0; display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 600;
    color: #7890b0; background: none; border: none; cursor: pointer;
    white-space: nowrap; transition: all .18s;
  }
  .pf2-mobile-tab.active { color: #7eb8ff; background: rgba(43,108,255,0.15); }

  /* ── Content Panel ── */
  .pf2-content {
    background: #0f1e30;
    border: 1px solid rgba(43,108,255,0.12);
    border-radius: 16px; padding: 2rem;
    min-height: 420px;
  }
  .pf2-tab-header { margin-bottom: 1.75rem; }
  .pf2-tab-title {
    font-size: 1.15rem; font-weight: 800; color: #e8f0fe;
    letter-spacing: -0.02em;
  }
  .pf2-tab-sub { font-size: 13px; color: #7890b0; margin-top: 4px; }

  /* ── Form elements ── */
  .pf2-label {
    display: block; font-size: 12px; font-weight: 700; color: #7890b0;
    text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 7px;
  }
  .pf2-input {
    width: 100%; height: 44px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: #e8f0fe; font-size: 14px; font-weight: 500;
    padding: 0 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all .2s ease;
    outline: none;
  }
  .pf2-input:focus {
    border-color: rgba(43,108,255,0.6);
    background: rgba(43,108,255,0.06);
    box-shadow: 0 0 0 3px rgba(43,108,255,0.14);
  }
  .pf2-input:disabled {
    opacity: 0.5; cursor: not-allowed;
    background: rgba(0,0,0,0.2);
  }
  .pf2-input::placeholder { color: #4a6585; }
  .pf2-input.invalid { border-color: rgba(239,68,68,0.6); }
  .pf2-input-wrap { position: relative; }
  .pf2-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #4a6585; }
  .pf2-input.has-icon { padding-left: 40px; }
  .pf2-eye-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #4a6585;
    transition: color .18s; display: flex; align-items: center;
  }
  .pf2-eye-btn:hover { color: #7890b0; }
  .pf2-hint { font-size: 11.5px; color: #4a6585; margin-top: 5px; }
  .pf2-field { margin-bottom: 1.25rem; }
  .pf2-divider {
    border: none; border-top: 1px solid rgba(255,255,255,0.07);
    margin: 1.5rem 0;
  }

  /* ── Password strength ── */
  .pf2-strength-bars {
    display: flex; gap: 4px; margin-top: 8px;
  }
  .pf2-strength-bar {
    flex: 1; height: 3px; border-radius: 99px;
    background: rgba(255,255,255,0.1);
    transition: all .3s ease;
  }
  .pf2-strength-bar.filled-0 { background: #ef4444; }
  .pf2-strength-bar.filled-1 { background: #f97316; }
  .pf2-strength-bar.filled-2 { background: #eab308; }
  .pf2-strength-bar.filled-3 { background: #10b981; }
  .pf2-strength-txt { font-size: 11.5px; margin-top: 5px; font-weight: 600; }
  .pf2-strength-txt.s0 { color: #ef4444; }
  .pf2-strength-txt.s1 { color: #f97316; }
  .pf2-strength-txt.s2 { color: #eab308; }
  .pf2-strength-txt.s3 { color: #10b981; }

  /* ── Buttons ── */
  .pf2-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 0 1.5rem; height: 42px; border-radius: 10px;
    font-size: 13.5px; font-weight: 700; cursor: pointer;
    border: none; transition: all .2s ease; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .pf2-btn-primary {
    background: linear-gradient(135deg, #2b6cff, #1a4dbf);
    color: #fff;
    box-shadow: 0 4px 18px rgba(43,108,255,0.3);
  }
  .pf2-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #3a7bff, #2258d4);
    box-shadow: 0 6px 24px rgba(43,108,255,0.45);
    transform: translateY(-1px);
  }
  .pf2-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .pf2-btn-ghost {
    background: rgba(255,255,255,0.05);
    color: #7890b0;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .pf2-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #e8f0fe; }
  .pf2-btn-danger {
    background: rgba(239,68,68,0.1);
    color: #f87171;
    border: 1px solid rgba(239,68,68,0.25);
  }
  .pf2-btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.5); }
  .pf2-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
  .pf2-btn-emerald {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    box-shadow: 0 4px 16px rgba(16,185,129,0.25);
  }
  .pf2-btn-emerald:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(16,185,129,0.38); }
  .pf2-btn-emerald:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Photo section ── */
  .pf2-photo-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 1.25rem;
    margin-bottom: 1.5rem;
    display: flex; gap: 1.25rem; align-items: center;
  }
  .pf2-photo-mini {
    width: 68px; height: 68px; border-radius: 14px; flex-shrink: 0;
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    font-size: 1.35rem; font-weight: 800; color: #fff;
    background: linear-gradient(135deg, #2b6cff, #6366f1);
  }
  .pf2-photo-mini img { width: 100%; height: 100%; object-fit: cover; }
  .pf2-photo-mode-toggle {
    display: flex; gap: 6px; margin-bottom: 8px;
  }
  .pf2-mode-btn {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 600;
    padding: 5px 12px; border-radius: 8px; cursor: pointer;
    transition: all .18s;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); color: #7890b0;
  }
  .pf2-mode-btn.active { background: rgba(43,108,255,0.2); color: #7eb8ff; border-color: rgba(43,108,255,0.4); }
  .pf2-upload-zone {
    width: 100%; padding: 10px;
    border: 1.5px dashed rgba(255,255,255,0.15); border-radius: 10px;
    background: none; color: #4a6585; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px; justify-content: center;
    transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .pf2-upload-zone:hover { border-color: rgba(43,108,255,0.5); color: #7eb8ff; background: rgba(43,108,255,0.05); }

  /* ── Toggle switch ── */
  .pf2-toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .pf2-toggle-row:last-child { border-bottom: none; }
  .pf2-toggle-info { flex: 1; padding-right: 1rem; }
  .pf2-toggle-lbl { font-size: 13.5px; font-weight: 600; color: #c8d8ee; }
  .pf2-toggle-desc { font-size: 12px; color: #4a6585; margin-top: 2px; }
  .pf2-switch {
    position: relative; width: 42px; height: 24px; flex-shrink: 0;
    background: rgba(255,255,255,0.1); border-radius: 99px;
    cursor: pointer; border: none; transition: background .2s;
  }
  .pf2-switch.on { background: #2b6cff; }
  .pf2-switch-thumb {
    position: absolute; top: 3px; left: 3px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; transition: transform .2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .pf2-switch.on .pf2-switch-thumb { transform: translateX(18px); }
  .pf2-toggle-group {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 0 1rem;
    margin-bottom: 1.25rem;
  }

  /* ── Section headers in config ── */
  .pf2-section-head {
    display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
  }
  .pf2-section-icon-wrap {
    width: 30px; height: 30px; border-radius: 8px;
    background: rgba(43,108,255,0.12);
    display: flex; align-items: center; justify-content: center;
    color: #7eb8ff; flex-shrink: 0;
  }
  .pf2-section-title { font-size: 13px; font-weight: 700; color: #c8d8ee; }

  /* ── Alert ── */
  .pf2-alert {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; border-radius: 12px; margin-bottom: 1.25rem;
    font-size: 13px;
  }
  .pf2-alert-info { background: rgba(43,108,255,0.1); border: 1px solid rgba(43,108,255,0.25); color: #93c5fd; }
  .pf2-alert-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; }
  .pf2-alert-danger { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; }
  .pf2-alert-icon { flex-shrink: 0; margin-top: 1px; }

  /* ── Danger zone ── */
  .pf2-danger-zone {
    background: rgba(239,68,68,0.05);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 14px; padding: 1.25rem;
    margin-top: 1rem;
  }
  .pf2-danger-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0;
    border-top: 1px solid rgba(239,68,68,0.1);
  }
  .pf2-danger-item:first-of-type { border-top: none; }
  .pf2-danger-item-title { font-size: 13.5px; font-weight: 600; color: #fca5a5; }
  .pf2-danger-item-desc { font-size: 12px; color: rgba(239,68,68,0.6); margin-top: 2px; }

  /* ── Select ── */
  .pf2-select {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #e8f0fe; font-size: 13.5px; font-weight: 600;
    padding: 8px 12px; font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; cursor: pointer; transition: all .2s;
  }
  .pf2-select:focus { border-color: rgba(43,108,255,0.5); background: rgba(43,108,255,0.06); }
  .pf2-select option { background: #0f1e30; }

  /* ── Fade in animation ── */
  @keyframes pf2FadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pf2-fade-up { animation: pf2FadeUp .35s ease both; }

  /* ── Buttons row ── */
  .pf2-btn-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 1.5rem; }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (nome) => {
  if (!nome) return '?'
  return nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const getPasswordStrength = (password) => {
  if (!password) return null
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  if (password.length < 6)  return { level: 0, label: 'Muito fraca' }
  if (password.length < 8)  return { level: 1, label: 'Fraca' }
  if (password.length >= 10 && hasNumber && hasSpecial)
                            return { level: 3, label: 'Forte' }
  return                           { level: 2, label: 'Média' }
}

// ─── Sub-components ──────────────────────────────────────────────────────────
const AvatarImg = ({ fotoUrl, nome, className }) => {
  const [imgError, setImgError] = useState(false)
  useEffect(() => { setImgError(false) }, [fotoUrl])
  const show = fotoUrl && !imgError
  return (
    <div className={className}>
      {show
        ? <img src={fotoUrl} alt={nome} onError={() => setImgError(true)} />
        : <span>{getInitials(nome)}</span>
      }
    </div>
  )
}

const PasswordField = ({ value, onChange, placeholder, invalid, id, name, autoComplete }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="pf2-input-wrap">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••'}
        className={`pf2-input${invalid ? ' invalid' : ''}`}
        style={{ paddingRight: '42px' }}
        autoComplete={autoComplete || 'current-password'}
      />
      <button type="button" className="pf2-eye-btn" tabIndex={-1} onClick={() => setShow(s => !s)}>
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

const StrengthBar = ({ password }) => {
  const s = getPasswordStrength(password)
  if (!s) return null
  const cls = ['s0','s1','s2','s3']
  const filledCls = ['filled-0','filled-1','filled-2','filled-3']
  return (
    <div>
      <div className="pf2-strength-bars">
        {[0,1,2,3].map(i => (
          <div key={i} className={`pf2-strength-bar${i <= s.level ? ` ${filledCls[s.level]}` : ''}`} />
        ))}
      </div>
      <p className={`pf2-strength-txt ${cls[s.level]}`}>Segurança: {s.label}</p>
    </div>
  )
}

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="pf2-toggle-row">
    <div className="pf2-toggle-info">
      <p className="pf2-toggle-lbl">{label}</p>
      {description && <p className="pf2-toggle-desc">{description}</p>}
    </div>
    <button
      type="button"
      className={`pf2-switch${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
    >
      <span className="pf2-switch-thumb" />
    </button>
  </div>
)

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'dados',     label: 'Meu Perfil',       icon: User     },
  { id: 'senha',     label: 'Alterar Senha',     icon: Lock     },
  { id: 'recuperar', label: 'Recuperar Senha',   icon: Key      },
  { id: 'config',    label: 'Configurações',     icon: Settings },
]

const ROLE_LABEL = { GESTOR: 'Gestor', TECNICO: 'Técnico', USUARIO: 'Usuário' }
const ROLE_CLS   = { GESTOR: 'gestor', TECNICO: 'tecnico', USUARIO: 'usuario' }

// ─── Main ─────────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const navigate = useNavigate()
  const { user: usuario, logout, updateUserLocal } = useAuth()
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab]     = useState('dados')
  const [loading, setLoading]         = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoMode, setFotoMode]       = useState('url')
  const [showDanger, setShowDanger]   = useState(false)

  const [perfil, setPerfil] = useState({
    nome:             usuario?.nome             ?? '',
    fotoUrl:          usuario?.fotoUrl          ?? '',
    email:            usuario?.email            ?? '',
    tipo:             usuario?.tipo             ?? '',
    setorAtendimento: usuario?.setorAtendimento ?? '',
  })

  const [trocarSenha, setTrocarSenha] = useState({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
  const [recuperarSenha, setRecuperarSenha] = useState({ email: '', token: '', novaSenha: '', etapa: 'email' })
  const [configuracoes, setConfiguracoes] = useState({
    notifEmail: true, notifSistema: true, notifChamados: true, idioma: 'pt-BR',
  })

  useEffect(() => {
    setRecuperarSenha(s => ({ ...s, email: usuario?.email ?? '' }))
  }, [usuario?.email])

  const carregarPerfil = useCallback(async () => {
    try {
      const { data } = await perfilAPI.buscar()
      const novo = {
        nome: data.nome, email: data.email, tipo: data.tipo,
        fotoUrl: data.fotoUrl ?? '', setorAtendimento: data.setorAtendimento ?? '',
      }
      setPerfil(novo)
      updateUserLocal(novo)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao carregar perfil'))
    }
  }, [updateUserLocal])

  const carregarPreferencias = useCallback(async () => {
    try {
      const { data } = await perfilAPI.buscarPreferencias()
      setConfiguracoes({
        notifEmail:    data.notifEmail    ?? true,
        notifSistema:  data.notifSistema  ?? true,
        notifChamados: data.notifChamados ?? true,
        idioma:        data.idioma        ?? 'pt-BR',
      })
    } catch { /* use defaults */ }
  }, [])

  useEffect(() => { carregarPerfil(); carregarPreferencias() }, [carregarPerfil, carregarPreferencias])

  const handleFotoFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Imagem muito grande. Máximo 5MB.')
    const reader = new FileReader()
    reader.onload = (ev) => {
      setFotoPreview(ev.target.result)
      setPerfil(p => ({ ...p, fotoUrl: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSalvarDados = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await perfilAPI.atualizar(perfil.nome, perfil.fotoUrl, perfil.setorAtendimento)
      updateUserLocal({ nome: perfil.nome, fotoUrl: perfil.fotoUrl, setorAtendimento: perfil.setorAtendimento })
      setFotoPreview(null)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar perfil'))
    } finally { setLoading(false) }
  }

  const handleTrocarSenha = async (e) => {
    e.preventDefault()
    if (trocarSenha.novaSenha !== trocarSenha.confirmarSenha) return toast.error('As senhas não conferem')
    if (trocarSenha.novaSenha.length < 6) return toast.error('Mínimo 6 caracteres')
    setLoading(true)
    try {
      await perfilAPI.trocarSenha(trocarSenha.senhaAtual, trocarSenha.novaSenha)
      toast.success('Senha alterada com sucesso!')
      setTrocarSenha({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao trocar senha'))
    } finally { setLoading(false) }
  }

  const handleRecuperarSenha = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await authAPI.recuperarSenha(recuperarSenha.email)
      setRecuperarSenha(s => ({ ...s, token: data.token, etapa: 'reset' }))
      toast.success('Token gerado! Cadastre a nova senha abaixo.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Email não encontrado'))
    } finally { setLoading(false) }
  }

  const handleResetarSenha = async (e) => {
    e.preventDefault()
    if (recuperarSenha.novaSenha.length < 6) return toast.error('Mínimo 6 caracteres')
    setLoading(true)
    try {
      await authAPI.resetarSenha(recuperarSenha.token, recuperarSenha.novaSenha)
      toast.success('Senha redefinida! Faça login novamente.')
      logout(); navigate('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao resetar senha'))
    } finally { setLoading(false) }
  }

  const handleSalvarConfiguracoes = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await perfilAPI.atualizarPreferencias(configuracoes)
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao salvar configurações'))
    } finally { setLoading(false) }
  }

  const handleLogoutAll = async () => {
    if (!window.confirm('Tem certeza? Você será desconectado de todos os dispositivos.')) return
    setLoading(true)
    try {
      await perfilAPI.logoutAll()
      toast.success('Todos os dispositivos foram desconectados!')
      logout(); navigate('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao encerrar sessões'))
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Tem CERTEZA? Isso vai DELETAR permanentemente sua conta e todos os dados!')) return
    if (!window.confirm('Isso é IRREVERSÍVEL. Confirme novamente.')) return
    setLoading(true)
    try {
      await perfilAPI.deletarConta()
      toast.success('Conta deletada com sucesso!')
      logout(); navigate('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao deletar conta'))
      setLoading(false)
    }
  }

  if (!usuario) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#060d1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7890b0', fontSize: 15, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid #2b6cff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
          Carregando perfil...
        </div>
      </div>
    )
  }

  const fotoAtual = fotoPreview || usuario.fotoUrl
  const roleCls   = ROLE_CLS[usuario.tipo]   ?? 'usuario'
  const roleLabel = ROLE_LABEL[usuario.tipo]  ?? 'Usuário'
  const senhasNaoConferem = trocarSenha.confirmarSenha.length > 0 && trocarSenha.novaSenha !== trocarSenha.confirmarSenha

  return (
    <div className="pf2-root">
      {/* Inject CSS */}
      <style>{PROFILE_CSS}</style>

      {/* Decorations */}
      <div className="pf2-grid-bg" />
      <div className="pf2-grid-vignette" />
      <div className="pf2-blob pf2-blob-1" />
      <div className="pf2-blob pf2-blob-2" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="fotoPerfilInput"
        name="fotoPerfil"
        type="file"
        accept="image/*"
        title="Selecionar foto de perfil"
        aria-label="Selecionar foto de perfil"
        className="hidden"
        onChange={handleFotoFileChange}
        style={{ display: 'none' }}
      />

      {/* Topbar */}
      <div className="pf2-topbar">
        <button onClick={() => navigate(-1)} className="pf2-back-btn">
          <ArrowLeft size={13} /> Voltar
        </button>
        <div>
          <div className="pf2-topbar-title">Meu Perfil</div>
          <div className="pf2-topbar-sub">{usuario.email}</div>
        </div>
      </div>

      {/* Main layout */}
      <div className="pf2-layout">

        {/* ── Hero Card ── */}
        <div className="pf2-hero">
          <div className="pf2-hero-banner">
            <div className="pf2-hero-glow" />
          </div>
          <div className="pf2-hero-body">
            {/* Avatar */}
            <div className="pf2-avatar-wrap" onClick={() => { setActiveTab('dados'); setTimeout(() => fileInputRef.current?.click(), 150) }} title="Alterar foto">
              <div className="pf2-avatar">
                {fotoAtual && <img src={fotoAtual} alt={usuario.nome} onError={() => {}} />}
                {!fotoAtual && <span>{getInitials(usuario.nome)}</span>}
              </div>
              <div className="pf2-avatar-overlay">
                <Camera size={20} color="white" />
              </div>
            </div>

            {/* Info */}
            <div className="pf2-hero-info">
              <h1 className="pf2-hero-name">{usuario.nome}</h1>
              <div className="pf2-hero-meta">
                <span className="pf2-hero-meta-item"><Mail size={12} /> {usuario.email}</span>
                {usuario.setorAtendimento && (
                  <span className="pf2-hero-meta-item"><Building2 size={12} /> {usuario.setorAtendimento}</span>
                )}
                <span className="pf2-hero-meta-item">
                  <div className="pf2-status-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                  Online
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="pf2-hero-actions">
              <div className={`pf2-role-badge ${roleCls}`}>
                <Shield size={11} />
                {roleLabel}
              </div>
              <button className="pf2-logout-btn" onClick={() => { logout(); navigate('/') }}>
                <LogOut size={12} /> Sair da conta
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="pf2-hero-stats">
            <div className="pf2-stat">
              <div className="pf2-stat-val">{usuario.tipo || '—'}</div>
              <div className="pf2-stat-lbl">Tipo de Conta</div>
            </div>
            <div className="pf2-stat">
              <div className="pf2-stat-val" style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>{usuario.setorAtendimento || '—'}</div>
              <div className="pf2-stat-lbl">Setor</div>
            </div>
            <div className="pf2-stat">
              <div className="pf2-stat-val" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Ativo
              </div>
              <div className="pf2-stat-lbl">Status</div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="pf2-sidebar">
          <p className="pf2-menu-label">Navegação</p>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`pf2-nav-btn${activeTab === id ? ' active' : ''}`}
            >
              {createElement(Icon, { size: 15 })}
              {label}
              <ChevronRight size={13} className="pf2-nav-chevron" />
            </button>
          ))}
          <div className="pf2-sidebar-footer">
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Zap size={11} />
              SupportFlow v1.0
            </span>
          </div>
        </div>

        {/* ── Mobile tab row ── */}
        <div className="pf2-mobile-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`pf2-mobile-tab${activeTab === id ? ' active' : ''}`}
            >
              {createElement(Icon, { size: 14 })} {label}
            </button>
          ))}
        </div>

        {/* ── Content Panel ── */}
        <div className="pf2-content">

          {/* ── Meu Perfil ── */}
          {activeTab === 'dados' && (
            <div className="pf2-fade-up">
              <div className="pf2-tab-header">
                <h2 className="pf2-tab-title">Meu Perfil</h2>
                <p className="pf2-tab-sub">Gerencie suas informações pessoais e foto de perfil.</p>
              </div>

              {/* Photo card */}
              <div className="pf2-photo-card">
                <div className="pf2-photo-mini">
                  {fotoAtual
                    ? <img src={fotoAtual} alt={perfil.nome} onError={() => {}} />
                    : <span>{getInitials(perfil.nome)}</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#c8d8ee', marginBottom: 10 }}>Foto de Perfil</p>
                  <div className="pf2-photo-mode-toggle">
                    <button
                      type="button"
                      className={`pf2-mode-btn${fotoMode === 'upload' ? ' active' : ''}`}
                      onClick={() => setFotoMode('upload')}
                    >
                      <Upload size={11} /> Enviar arquivo
                    </button>
                    <button
                      type="button"
                      className={`pf2-mode-btn${fotoMode === 'url' ? ' active' : ''}`}
                      onClick={() => setFotoMode('url')}
                    >
                      <LinkIcon size={11} /> Usar URL
                    </button>
                  </div>
                  {fotoMode === 'upload' ? (
                    <button type="button" className="pf2-upload-zone" onClick={() => fileInputRef.current?.click()}>
                      <Camera size={14} />
                      {fotoPreview ? 'Trocar imagem' : 'Selecionar imagem'}
                    </button>
                  ) : (
                    <input
                      id="fotoUrl"
                      name="fotoUrl"
                      type="url"
                      className="pf2-input"
                      value={perfil.fotoUrl}
                      onChange={(e) => { setPerfil({ ...perfil, fotoUrl: e.target.value }); setFotoPreview(null) }}
                      placeholder="https://exemplo.com/foto.jpg"
                      style={{ height: 38, fontSize: 13 }}
                      aria-label="URL da foto de perfil"
                      autoComplete="photo"
                    />
                  )}
                  <p className="pf2-hint" style={{ marginTop: 6 }}>JPG, PNG, GIF · máx. 5MB</p>
                </div>
              </div>

              <form onSubmit={handleSalvarDados}>
                <div className="pf2-field">
                  <label className="pf2-label" htmlFor="nomeCompleto">Nome Completo</label>
                  <div className="pf2-input-wrap">
                    <User size={14} className="pf2-input-icon" />
                    <input
                      id="nomeCompleto"
                      name="nome"
                      type="text"
                      className="pf2-input has-icon"
                      value={perfil.nome}
                      onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                      required
                      placeholder="Seu nome completo"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="pf2-field">
                  <label className="pf2-label" htmlFor="setorAtendimento">Setor de Atendimento</label>
                  <div className="pf2-input-wrap">
                    <Building2 size={14} className="pf2-input-icon" />
                    <input
                      id="setorAtendimento"
                      name="setorAtendimento"
                      type="text"
                      className="pf2-input has-icon"
                      value={perfil.setorAtendimento}
                      onChange={(e) => setPerfil({ ...perfil, setorAtendimento: e.target.value })}
                      placeholder="Ex: TI, Service Desk, Gerência..."
                      autoComplete="organization-title"
                    />
                  </div>
                  <p className="pf2-hint">Seu departamento ou área de atuação.</p>
                </div>

                <div className="pf2-field">
                  <label className="pf2-label" htmlFor="emailAcesso">E-mail de Acesso</label>
                  <div className="pf2-input-wrap">
                    <Mail size={14} className="pf2-input-icon" />
                    <input
                      id="emailAcesso"
                      name="email"
                      type="email"
                      className="pf2-input has-icon"
                      value={perfil.email}
                      disabled
                      autoComplete="email"
                    />
                  </div>
                  <p className="pf2-hint">O e-mail não pode ser alterado.</p>
                </div>

                <hr className="pf2-divider" />
                <div className="pf2-btn-row" style={{ marginTop: 0 }}>
                  <button type="submit" className="pf2-btn pf2-btn-primary" disabled={loading}>
                    <Save size={14} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Alterar Senha ── */}
          {activeTab === 'senha' && (
            <div className="pf2-fade-up">
              <div className="pf2-tab-header">
                <h2 className="pf2-tab-title">Alterar Senha</h2>
                <p className="pf2-tab-sub">Mantenha sua conta segura com uma senha forte.</p>
              </div>

              <form onSubmit={handleTrocarSenha}>
                <div className="pf2-field">
                  <label className="pf2-label" htmlFor="senhaAtual">Senha Atual</label>
                  <PasswordField
                    id="senhaAtual"
                    name="senhaAtual"
                    autoComplete="current-password"
                    value={trocarSenha.senhaAtual}
                    onChange={(e) => setTrocarSenha({ ...trocarSenha, senhaAtual: e.target.value })}
                  />
                </div>

                <div className="pf2-field">
                  <label className="pf2-label" htmlFor="novaSenha">Nova Senha</label>
                  <PasswordField
                    id="novaSenha"
                    name="novaSenha"
                    autoComplete="new-password"
                    value={trocarSenha.novaSenha}
                    onChange={(e) => setTrocarSenha({ ...trocarSenha, novaSenha: e.target.value })}
                  />
                  <StrengthBar password={trocarSenha.novaSenha} />
                </div>

                <div className="pf2-field">
                  <label className="pf2-label" htmlFor="confirmarSenha">Confirmar Nova Senha</label>
                  <PasswordField
                    id="confirmarSenha"
                    name="confirmarSenha"
                    autoComplete="new-password"
                    value={trocarSenha.confirmarSenha}
                    onChange={(e) => setTrocarSenha({ ...trocarSenha, confirmarSenha: e.target.value })}
                    invalid={senhasNaoConferem}
                  />
                  {senhasNaoConferem && <p className="pf2-hint" style={{ color: '#f87171' }}>As senhas não conferem</p>}
                </div>

                <hr className="pf2-divider" />
                <div className="pf2-btn-row" style={{ marginTop: 0 }}>
                  <button type="submit" className="pf2-btn pf2-btn-primary" disabled={loading || senhasNaoConferem}>
                    <Lock size={14} /> {loading ? 'Alterando...' : 'Atualizar Senha'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Recuperar Senha ── */}
          {activeTab === 'recuperar' && (
            <div className="pf2-fade-up">
              <div className="pf2-tab-header">
                <h2 className="pf2-tab-title">Recuperação de Senha</h2>
                <p className="pf2-tab-sub">Redefina sua senha via token caso tenha esquecido a atual.</p>
              </div>

              <form onSubmit={recuperarSenha.etapa === 'email' ? handleRecuperarSenha : handleResetarSenha}>
                {recuperarSenha.etapa === 'email' ? (
                  <>
                    <div className="pf2-alert pf2-alert-info" style={{ marginBottom: '1.25rem' }}>
                      <span className="pf2-alert-icon"><Mail size={15} /></span>
                      Informe seu e-mail cadastrado para gerar um token de redefinição.
                    </div>
                    <div className="pf2-field">
                      <label className="pf2-label" htmlFor="recuperarEmail">E-mail</label>
                      <div className="pf2-input-wrap">
                        <Mail size={14} className="pf2-input-icon" />
                        <input
                          id="recuperarEmail"
                          name="recuperarEmail"
                          type="email"
                          className="pf2-input has-icon"
                          value={recuperarSenha.email}
                          onChange={(e) => setRecuperarSenha({ ...recuperarSenha, email: e.target.value })}
                          required
                          placeholder="seu@email.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <hr className="pf2-divider" />
                    <div className="pf2-btn-row" style={{ marginTop: 0 }}>
                      <button type="submit" className="pf2-btn pf2-btn-primary" disabled={loading}>
                        <Key size={14} /> {loading ? 'Enviando...' : 'Solicitar Token'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pf2-alert pf2-alert-success" style={{ marginBottom: '1.25rem' }}>
                      <span className="pf2-alert-icon"><CheckCircle2 size={15} /></span>
                      Token gerado com sucesso! Cadastre sua nova senha abaixo.
                    </div>
                    <div className="pf2-field">
                      <label className="pf2-label" htmlFor="recuperarNovaSenha">Nova Senha</label>
                      <PasswordField
                        id="recuperarNovaSenha"
                        name="recuperarNovaSenha"
                        autoComplete="new-password"
                        value={recuperarSenha.novaSenha}
                        onChange={(e) => setRecuperarSenha({ ...recuperarSenha, novaSenha: e.target.value })}
                      />
                      <StrengthBar password={recuperarSenha.novaSenha} />
                    </div>
                    <hr className="pf2-divider" />
                    <div className="pf2-btn-row" style={{ marginTop: 0 }}>
                      <button
                        type="button"
                        className="pf2-btn pf2-btn-ghost"
                        onClick={() => setRecuperarSenha(s => ({ ...s, etapa: 'email' }))}
                      >
                        Voltar
                      </button>
                      <button type="submit" className="pf2-btn pf2-btn-emerald" disabled={loading}>
                        <CheckCircle2 size={14} /> {loading ? 'Redefinindo...' : 'Confirmar Nova Senha'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}

          {/* ── Configurações ── */}
          {activeTab === 'config' && (
            <div className="pf2-fade-up">
              <div className="pf2-tab-header">
                <h2 className="pf2-tab-title">Configurações</h2>
                <p className="pf2-tab-sub">Personalize sua experiência no sistema.</p>
              </div>

              <form onSubmit={handleSalvarConfiguracoes}>
                <div className="pf2-btn-row">
                  <button type="submit" className="pf2-btn pf2-btn-primary" disabled={loading}>
                    <Save size={14} /> {loading ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </form>

              {/* Danger zone */}
              <hr className="pf2-divider" style={{ marginTop: '2rem' }} />
              <button
                type="button"
                onClick={() => setShowDanger(s => !s)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity .2s' }}
              >
                <AlertTriangle size={14} />
                {showDanger ? 'Ocultar' : 'Mostrar'} zona de perigo
              </button>

              {showDanger && (
                <div className="pf2-danger-zone pf2-fade-up">
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <AlertTriangle size={13} /> Ações irreversíveis
                  </p>

                  <div className="pf2-danger-item">
                    <div>
                      <p className="pf2-danger-item-title">Encerrar todas as sessões</p>
                      <p className="pf2-danger-item-desc">Desconecta todos os dispositivos vinculados</p>
                    </div>
                    <button
                      type="button"
                      className="pf2-btn pf2-btn-danger"
                      style={{ minHeight: 44 }}
                      onClick={handleLogoutAll}
                      disabled={loading}
                    >
                      {loading ? 'Processando...' : 'Encerrar'}
                    </button>
                  </div>

                  <div className="pf2-danger-item">
                    <div>
                      <p className="pf2-danger-item-title">Excluir minha conta</p>
                      <p className="pf2-danger-item-desc">Remove permanentemente todos os seus dados</p>
                    </div>
                    <button
                      type="button"
                      className="pf2-btn pf2-btn-danger"
                      style={{ minHeight: 44 }}
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      <Trash2 size={13} /> {loading ? 'Processando...' : 'Excluir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ProfilePage