export const usuarioStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  .up-root {
    --bg:           #060d1a;
    --surface:      #0b1525;
    --card:         #0f1e30;
    --card-hover:   #132540;
    --border:       #1a2f4a;
    --border-mid:   #253a5a;
    --accent:       #2b6cff;
    --accent-dim:   #1a4dbf;
    --accent-pulse: rgba(43,108,255,.12);
    --accent-glow:  rgba(43,108,255,.25);
    --text:         #e8f0fe;
    --text-muted:   #7890b0;
    --text-soft:    #4a6585;
    --success:      #10b981;
    --danger:       #ef4444;
    --warning:      #f59e0b;
    --info:         #0891b2;
  }

  .up-root * { box-sizing: border-box; }
  .up-root {
    min-height: 100vh; height: 100vh;
    width: 100%;
    display: flex; flex-direction: column;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
  }

  /* ─── HEADER ─── */
  .up-header {
    flex-shrink: 0;
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    height: 62px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: relative; z-index: 20;
    gap: 12px;
  }
  @media (max-width: 768px) {
    .up-header {
      padding: 0 16px;
      height: auto;
      min-height: 56px;
      flex-wrap: nowrap;
    }
  }
  .up-header-left { display: flex; align-items: center; gap: 20px; }
  @media (max-width: 768px) { .up-header-left { gap: 12px; } }
  .up-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .up-brand-icon {
    width: 38px; height: 38px;
    background: rgba(255,255,255,.96);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden; flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(0,0,0,.2);
  }
  .up-brand-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .up-brand-name {
    font-family: 'Outfit', sans-serif;
    font-size: 18px; font-weight: 700;
    letter-spacing: -.3px; color: var(--text);
  }
  @media (max-width: 768px) { .up-brand-name { display: none; } }
  .up-header-divider { width: 1px; height: 24px; background: var(--border); }
  @media (max-width: 768px) { .up-header-divider { display: none; } }
  .up-header-section {
    font-size: 12px; font-weight: 500;
    letter-spacing: .5px; text-transform: uppercase;
    color: var(--text-soft);
  }
  @media (max-width: 768px) { .up-header-section { display: none; } }
  .up-header-right { display: flex; align-items: center; gap: 12px; }
  @media (max-width: 768px) { .up-header-right { gap: 8px; } }
  .up-user-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 100px;
  }
  @media (max-width: 768px) { .up-user-chip { padding: 6px 10px; gap: 8px; } }
  .up-user-avatar {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-size: 11px; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .up-user-name {
    font-size: 13px; font-weight: 500;
    color: var(--text); max-width: 160px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .up-logout-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 7px 14px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-muted);
    font-size: 13px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: border-color .2s, color .2s, background .2s;
  }
  @media (max-width: 768px) {
    .up-logout-btn { padding: 8px 12px; font-size: 12px; min-height: 40px; }
  }
  .up-logout-btn:hover {
    border-color: var(--danger); color: #fca5a5;
    background: rgba(239,68,68,.06);
  }

  /* ─── STATS BAR ─── */
  .up-stats-bar {
    flex-shrink: 0;
    display: flex; align-items: center;
    padding: 0 28px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .up-stats-bar::-webkit-scrollbar { display: none; }

  .up-stat-card {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 28px;
    border-right: 1px solid var(--border);
    flex-shrink: 0;
    animation: upFadeIn .5s ease both;
  }
  .up-stat-card:first-child { padding-left: 0; }
  .up-stat-card:last-child  { border-right: none; }

  .up-stat-icon {
    width: 36px; height: 36px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .up-stat-icon-blue   { background: rgba(43,108,255,.12);  }
  .up-stat-icon-amber  { background: rgba(245,158,11,.12);  }
  .up-stat-icon-green  { background: rgba(16,185,129,.12);  }
  .up-stat-icon-cyan   { background: rgba(8,145,178,.12);   }
  .up-stat-icon-red    { background: rgba(239,68,68,.12);   }

  .up-stat-num {
    font-family: 'Outfit', sans-serif;
    font-size: 22px; font-weight: 700;
    color: var(--text); line-height: 1;
  }
  .up-stat-lbl {
    font-size: 11px; font-weight: 500;
    color: var(--text-soft);
    letter-spacing: .3px; text-transform: uppercase;
    margin-top: 2px;
  }

  /* Stats — mobile: compact horizontal pills */
  @media (max-width: 768px) {
    .up-stats-bar {
      padding: 10px 14px;
      gap: 6px;
    }
    .up-stat-card {
      padding: 8px 12px;
      border-right: none;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--card);
      flex: 0 0 auto;
      gap: 7px;
      animation-delay: 0ms !important;
    }
    .up-stat-card:first-child { padding-left: 12px; }
    .up-stat-icon {
      width: 28px; height: 28px;
      border-radius: 7px;
    }
    .up-stat-icon svg { width: 14px !important; height: 14px !important; }
    .up-stat-num { font-size: 15px; }
    .up-stat-lbl { font-size: 9px; margin-top: 1px; letter-spacing: .2px; }
  }

  /* ─── MAIN ─── */
  .up-main { flex: 1; display: flex; overflow: hidden; }

  /* ─── SIDEBAR ─── */
  .up-sidebar {
    width: 380px; flex-shrink: 0;
    display: flex; flex-direction: column;
    border-right: 1px solid var(--border);
    background: var(--surface);
    overflow: hidden;
  }
  .up-sidebar-header {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 18px 24px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .up-sidebar-title {
    font-family: 'Outfit', sans-serif;
    font-size: 15px; font-weight: 600;
    color: var(--text);
  }
  .up-sidebar-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
  .up-sidebar-body::-webkit-scrollbar { width: 4px; }
  .up-sidebar-body::-webkit-scrollbar-track { background: transparent; }
  .up-sidebar-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ─── CONTENT ─── */
  .up-content {
    flex: 1; display: flex; flex-direction: column;
    overflow: hidden; background: var(--bg);
  }
  .up-content-header {
    flex-shrink: 0;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .up-content-title {
    font-family: 'Outfit', sans-serif;
    font-size: 15px; font-weight: 600;
    color: var(--text); margin-bottom: 14px;
  }

  /* ─── FILTER BAR ─── */
  .up-filters {
    display: flex; flex-wrap: wrap;
    gap: 8px; align-items: center;
  }
  .up-search-wrap { flex: 1; min-width: 200px; position: relative; }
  .up-search-icon {
    position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%);
    color: var(--text-soft);
    display: flex; pointer-events: none;
  }
  .up-input {
    width: 100%; padding: 9px 14px 9px 38px;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 9px; color: var(--text);
    font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; transition: border-color .2s, box-shadow .2s;
  }
  .up-input::placeholder { color: var(--text-soft); }
  .up-input:hover { border-color: var(--border-mid); }
  .up-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-pulse); }
  .up-select {
    padding: 9px 32px 9px 12px;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 9px; color: var(--text-muted);
    font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; cursor: pointer;
    transition: border-color .2s, box-shadow .2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a6585' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-color: var(--card);
  }
  .up-select:hover { border-color: var(--border-mid); }
  .up-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-pulse); }
  .up-select option { background: #0f1e30; color: var(--text); }
  .up-date-input {
    padding: 9px 12px;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 9px; color: var(--text-muted);
    font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; transition: border-color .2s, box-shadow .2s;
    color-scheme: dark;
  }
  .up-date-input:hover { border-color: var(--border-mid); }
  .up-date-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-pulse); }

  /* ─── ICON BUTTONS ─── */
  .up-icon-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 14px;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 9px; color: var(--text-muted);
    font-size: 13px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; white-space: nowrap;
    transition: border-color .2s, background .2s, color .2s;
  }
  .up-icon-btn:hover { border-color: var(--border-mid); background: var(--card-hover); color: var(--text); }
  .up-icon-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .up-icon-btn.active:hover { background: #3a78ff; }

  .up-refresh-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 9px; color: var(--text-muted);
    cursor: pointer; flex-shrink: 0;
    transition: border-color .2s, color .2s, background .2s;
  }
  .up-refresh-btn:hover { border-color: var(--border-mid); background: var(--card-hover); color: var(--text); }
  .up-refresh-btn.spinning svg { animation: upSpin .7s linear infinite; }

  /* ─── RESULT BAR ─── */
  .up-result-bar {
    flex-shrink: 0;
    display: flex; align-items: center; gap: 10px;
    padding: 10px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    font-size: 12px; color: var(--text-soft);
    flex-wrap: wrap;
  }
  .up-result-bar strong { color: var(--text); font-weight: 600; }
  .up-result-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 2px 10px;
    background: rgba(43,108,255,.1);
    border: 1px solid rgba(43,108,255,.2);
    border-radius: 100px;
    color: #7eb8ff; font-size: 11px;
    animation: upFadeIn .2s ease;
  }

  /* ─── LIST AREA ─── */
  .up-list-area { flex: 1; overflow-y: auto; padding: 16px 24px; }
  .up-list-area::-webkit-scrollbar { width: 4px; }
  .up-list-area::-webkit-scrollbar-track { background: transparent; }
  .up-list-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ─── UTILITY ─── */
  .up-desktop-only { display: initial; }
  .up-mobile-only  { display: none;    }
  @media (max-width: 768px) {
    .up-desktop-only { display: none !important; }
    .up-mobile-only  { display: initial; }
  }
  @media (max-width: 768px) {
    .up-sidebar { display: none !important; }
    .up-content { display: flex !important; width: 100%; }
  }

  /* ─── MOBILE SEARCH ROW ─── */
  /* A busca de texto foi removida do mobile — só aparecem os botões de ação */
  .up-mobile-search-row { display: none; }
  @media (max-width: 768px) {
    .up-mobile-search-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 10px 14px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    /* Esconde o input de busca no mobile */
    .up-mobile-search-row .up-search-wrap { display: none !important; }
    /* Botões de ação com tamanho fixo e compacto */
    .up-mobile-search-row .up-filter-toggle-btn,
    .up-mobile-search-row .up-refresh-btn {
      width: 38px !important;
      height: 38px !important;
      flex: 0 0 38px !important;
      border-radius: 9px;
    }
  }

  /* ─── FILTER TOGGLE ─── */
  .up-filter-toggle-btn {
    display: flex; align-items: center; justify-content: center;
    position: relative;
    width: 44px; height: 44px; flex-shrink: 0;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 9px; color: var(--text-muted);
    cursor: pointer; transition: all .2s;
  }
  .up-filter-toggle-btn:hover { border-color: var(--border-mid); background: var(--card-hover); color: var(--text); }
  .up-filter-toggle-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .up-filter-toggle-btn.has-filters { border-color: var(--accent); color: var(--accent); }
  .up-filter-toggle-btn.has-filters.active { color: #fff; }
  .up-filter-badge {
    position: absolute; top: -5px; right: -5px;
    background: var(--accent); color: #fff;
    font-size: 9px; font-weight: 700;
    width: 16px; height: 16px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif;
    border: 1.5px solid var(--bg);
  }

  /* ─── MOBILE COLLAPSIBLE FILTERS ─── */
  @media (max-width: 768px) {
    .up-content-header {
      max-height: 0; overflow: hidden;
      padding: 0; border-bottom: none;
      transition: max-height 0.3s ease, padding 0.2s ease;
    }
    .up-content-header.filters-open {
      max-height: 600px;
      padding: 12px 14px 14px;
      border-bottom: 1px solid var(--border);
    }
    .up-content-header .up-filters { gap: 8px; width: 100%; }
    .up-content-header .up-filters .up-select,
    .up-content-header .up-filters .up-date-input,
    .up-content-header .up-filters .up-icon-btn {
      flex: 1 1 calc(50% - 4px);
      min-width: 0; font-size: 15px; min-height: 44px;
    }
    .up-result-bar { padding: 8px 14px; font-size: 11px; gap: 6px; }
    .up-list-area { padding: 12px 14px 96px; }
  }

  /* ─── CLEAR FILTERS (mobile) ─── */
  .up-clear-filters-btn { display: none; }
  @media (max-width: 768px) {
    .up-clear-filters-btn {
      display: flex; align-items: center; justify-content: center;
      flex: 1 1 100%; padding: 11px;
      background: rgba(239,68,68,.08);
      border: 1.5px solid rgba(239,68,68,.2);
      border-radius: 9px; color: #f87171;
      font-size: 13px; font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer; transition: all .2s; min-height: 44px;
    }
    .up-clear-filters-btn:hover { background: rgba(239,68,68,.15); border-color: rgba(239,68,68,.35); }
  }

  /* ─── HEADER EXTRAS ─── */
  .up-online-badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; color: var(--text-soft);
  }
  .up-online-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--success); display: inline-block;
    animation: upBlink 2.5s infinite;
  }
  @media (max-width: 480px) {
    .up-online-badge { display: none; }
    .up-user-name { display: none; }
    .up-user-chip { padding: 6px; gap: 0; }
    .up-logout-label { display: none; }
    .up-logout-btn { padding: 8px; }
  }
  .up-btn-label { font-size: 12px; }
  @media (max-width: 768px) { .up-btn-label { display: none; } }

  /* ─── NEW CHAMADO (desktop header) ─── */
  .up-new-chamado-btn {
    display: flex; align-items: center; gap: 6px;
    background: var(--accent); color: #fff;
    border: none; padding: 7px 14px; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background .2s, box-shadow .2s, transform .15s;
    white-space: nowrap;
  }
  .up-new-chamado-btn:hover {
    background: #3a78ff;
    box-shadow: 0 4px 16px rgba(43,108,255,.35);
    transform: translateY(-1px);
  }

  /* ─── FAB — Mobile redesign glassmorphism ─── */
  .up-fab {
    position: fixed;
    bottom: 20px; left: 50%;
    transform: translateX(-50%);
    z-index: 9000;
    display: flex; align-items: center; gap: 9px;
    /* Dark glass look que combina com o design system */
    background: rgba(11, 21, 37, 0.88);
    border: 1px solid rgba(43, 108, 255, 0.4);
    color: var(--text);
    border-radius: 14px;
    padding: 13px 22px;
    font-size: 14px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow:
      0 0 0 1px rgba(43, 108, 255, 0.08),
      0 8px 32px rgba(0, 0, 0, 0.55),
      0 0 24px rgba(43, 108, 255, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap; letter-spacing: 0.1px;
  }
  /* Ícone + com cor de acento */
  .up-fab svg {
    color: var(--accent);
    flex-shrink: 0;
    filter: drop-shadow(0 0 4px rgba(43,108,255,.5));
  }
  .up-fab:hover {
    background: rgba(15, 30, 50, 0.96);
    border-color: rgba(43, 108, 255, 0.65);
    box-shadow:
      0 0 0 1px rgba(43, 108, 255, 0.15),
      0 12px 40px rgba(0, 0, 0, 0.65),
      0 0 36px rgba(43, 108, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transform: translateX(-50%) translateY(-2px);
    color: #fff;
  }
  .up-fab:active {
    transform: translateX(-50%) scale(0.97);
    box-shadow:
      0 0 0 1px rgba(43, 108, 255, 0.12),
      0 4px 16px rgba(0, 0, 0, 0.5),
      0 0 12px rgba(43, 108, 255, 0.1);
  }

  /* ─── DRAWER ─── */
  .up-drawer-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    z-index: 9998; opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .up-drawer-overlay.open { opacity: 1; pointer-events: auto; }
  .up-drawer {
    position: fixed; top: 0; left: -420px; bottom: 0;
    width: 420px; max-width: 100vw;
    background: var(--bg);
    border-right: 1px solid var(--border);
    z-index: 9999;
    box-shadow: 4px 0 24px rgba(0,0,0,0.4);
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex; flex-direction: column;
  }
  .up-drawer.open { left: 0; }
  @media (max-width: 768px) {
    .up-drawer { width: 100vw; left: -100vw; }
    .up-drawer.open { left: 0; }
  }
  .up-drawer-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    background: var(--surface);
  }
  .up-drawer-title {
    font-size: 16px; font-weight: 600; color: var(--text);
    font-family: 'Outfit', sans-serif;
    display: flex; align-items: center; gap: 8px;
  }
  .up-drawer-close {
    background: none; border: none; color: var(--text-soft);
    cursor: pointer; padding: 4px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .up-drawer-close:hover { background: rgba(255,255,255,0.05); color: var(--text); }
  .up-drawer-body { padding: 24px; overflow-y: auto; flex: 1; }
  .up-drawer-body::-webkit-scrollbar { width: 4px; }
  .up-drawer-body::-webkit-scrollbar-track { background: transparent; }
  .up-drawer-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* ─── EMPTY STATE ─── */
  .up-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 64px 24px; text-align: center;
    animation: upFadeIn .5s ease;
  }
  @media (max-width: 768px) { .up-empty { padding: 40px 20px; } }
  .up-empty-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: var(--card); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; color: var(--text-soft);
  }
  .up-empty-title {
    font-family: 'Outfit', sans-serif;
    font-size: 16px; font-weight: 600;
    color: var(--text); margin-bottom: 6px;
  }
  .up-empty-sub {
    font-size: 13px; color: var(--text-soft);
    max-width: 280px; line-height: 1.6;
  }

  /* ─── SKELETON ─── */
  .up-skeleton { display: flex; flex-direction: column; gap: 10px; }
  .up-skeleton-item {
    height: 72px; background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px; position: relative; overflow: hidden;
  }
  @media (max-width: 768px) { .up-skeleton-item { height: 80px; } }
  .up-skeleton-item::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.03) 50%, transparent 100%);
    animation: upShimmer 1.4s ease infinite;
  }
  @keyframes upShimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* ─── CHILD OVERRIDES: Sidebar ─── */
  .up-sidebar-body form,
  .up-sidebar-body [class*="bg-white"],
  .up-sidebar-body [class*="bg-slate"] { background: transparent !important; border-color: var(--border) !important; }
  .up-sidebar-body input,
  .up-sidebar-body select,
  .up-sidebar-body textarea {
    background: var(--card) !important; border-color: var(--border) !important;
    color: var(--text) !important; font-family: 'Plus Jakarta Sans', sans-serif !important;
    border-radius: 9px !important; border-width: 1.5px !important;
    outline: none !important; transition: border-color .2s, box-shadow .2s !important;
  }
  .up-sidebar-body input::placeholder,
  .up-sidebar-body textarea::placeholder { color: var(--text-soft) !important; }
  .up-sidebar-body input:focus,
  .up-sidebar-body select:focus,
  .up-sidebar-body textarea:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent-pulse) !important;
  }
  .up-sidebar-body input:hover,
  .up-sidebar-body select:hover,
  .up-sidebar-body textarea:hover { border-color: var(--border-mid) !important; }
  .up-sidebar-body select { color-scheme: dark; }
  .up-sidebar-body select option { background: #0f1e30; }
  .up-sidebar-body label,
  .up-sidebar-body [class*="text-slate-7"],
  .up-sidebar-body [class*="text-slate-8"],
  .up-sidebar-body [class*="text-slate-9"],
  .up-sidebar-body [class*="text-gray"] { color: var(--text-muted) !important; }
  .up-sidebar-body [class*="text-slate-5"],
  .up-sidebar-body [class*="text-slate-4"] { color: var(--text-soft) !important; }
  .up-sidebar-body h1, .up-sidebar-body h2,
  .up-sidebar-body h3, .up-sidebar-body h4 { color: var(--text) !important; }
  .up-sidebar-body button[type="submit"],
  .up-sidebar-body [class*="bg-blue-6"] {
    background: var(--accent) !important; border-color: var(--accent) !important;
    color: #fff !important; font-family: 'Plus Jakarta Sans', sans-serif !important;
    border-radius: 10px !important; font-weight: 600 !important;
    transition: background .2s, transform .15s, box-shadow .2s !important;
  }
  .up-sidebar-body button[type="submit"]:hover,
  .up-sidebar-body [class*="bg-blue-6"]:hover {
    background: #3a78ff !important;
    box-shadow: 0 6px 20px rgba(43,108,255,.35) !important;
    transform: translateY(-1px) !important;
  }
  .up-sidebar-body [class*="border-slate"],
  .up-sidebar-body [class*="border-gray"] { border-color: var(--border) !important; }
  .up-sidebar-body [class*="rounded"] { border-radius: 9px !important; }
  .up-sidebar-body [class*="shadow"] { box-shadow: none !important; }
  .up-sidebar-body .absolute.top-full.left-0.right-0 {
    background: rgba(11, 21, 37, .92) !important;
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid var(--border-mid) !important;
    box-shadow: 0 14px 30px rgba(0, 0, 0, .45) !important;
    z-index: 90 !important;
  }
  .up-sidebar-body .absolute.top-full.left-0.right-0 button { background: transparent !important; color: var(--text) !important; }
  .up-sidebar-body .absolute.top-full.left-0.right-0 button:hover { background: rgba(43,108,255,.14) !important; color: #bcd5ff !important; }
  .up-sidebar-body .absolute.top-full.left-0.right-0 [class*="text-slate-900"],
  .up-sidebar-body .absolute.top-full.left-0.right-0 [class*="text-slate-500"],
  .up-sidebar-body .absolute.top-full.left-0.right-0 [class*="text-slate-400"] { color: var(--text) !important; }

  /* ─── CHILD OVERRIDES: List ─── */
  .up-list-area [class*="bg-white"],
  .up-list-area [class*="bg-slate-5"],
  .up-list-area [class*="bg-slate-1"] { background: var(--card) !important; border-color: var(--border) !important; }
  .up-list-area [class*="border-slate"],
  .up-list-area [class*="border-gray"] { border-color: var(--border) !important; }
  .up-list-area [class*="text-slate-9"],
  .up-list-area [class*="text-slate-8"],
  .up-list-area [class*="text-slate-7"] { color: var(--text) !important; }
  .up-list-area [class*="text-slate-5"],
  .up-list-area [class*="text-slate-6"],
  .up-list-area [class*="text-gray-5"] { color: var(--text-muted) !important; }
  .up-list-area [class*="text-slate-4"],
  .up-list-area [class*="text-gray-4"] { color: var(--text-soft) !important; }
  .up-list-area [class*="hover:bg-slate"],
  .up-list-area [class*="hover:bg-gray"]:hover { background: var(--card-hover) !important; }
  .up-list-area [class*="rounded"] { border-radius: 12px !important; }
  .up-list-area [class*="shadow"] { box-shadow: 0 2px 12px rgba(0,0,0,.3) !important; }
  .up-list-area [class*="divide-slate"] > * + *,
  .up-list-area [class*="divide-gray"] > * + * { border-color: var(--border) !important; }
  .up-list-area [class*="rounded"][class*="border"]:hover {
    border-color: var(--border-mid) !important;
    background: var(--card-hover) !important;
    transform: translateY(-1px);
    transition: all .2s;
  }
  .up-list-area [class*="bg-green"] { background: rgba(16,185,129,.15) !important; color: #6ee7b7 !important; border: 1px solid rgba(16,185,129,.25) !important; }
  .up-list-area [class*="bg-yellow"],
  .up-list-area [class*="bg-amber"] { background: rgba(245,158,11,.15) !important; color: #fcd34d !important; border: 1px solid rgba(245,158,11,.25) !important; }
  .up-list-area [class*="bg-blue"]:not([class*="bg-blue-6"]) { background: rgba(43,108,255,.15) !important; color: #7eb8ff !important; border: 1px solid rgba(43,108,255,.25) !important; }
  .up-list-area [class*="bg-red"] { background: rgba(239,68,68,.15) !important; color: #fca5a5 !important; border: 1px solid rgba(239,68,68,.25) !important; }
  .up-list-area [class*="bg-orange"] { background: rgba(234,88,12,.15) !important; color: #fdba74 !important; border: 1px solid rgba(234,88,12,.25) !important; }
  .up-list-area [class*="bg-purple"] { background: rgba(124,58,237,.15) !important; color: #c4b5fd !important; border: 1px solid rgba(124,58,237,.25) !important; }
  .up-list-area [class*="bg-slate-1"],
  .up-list-area [class*="bg-gray-1"] { background: rgba(255,255,255,.05) !important; color: var(--text-muted) !important; }

  /* ─── CHILD OVERRIDES: Drawer ─── */
  .up-drawer-body form,
  .up-drawer-body [class*="bg-white"],
  .up-drawer-body [class*="bg-slate"] { background: transparent !important; border-color: var(--border) !important; }
  .up-drawer-body input,
  .up-drawer-body select,
  .up-drawer-body textarea {
    background: var(--card) !important; border-color: var(--border) !important;
    color: var(--text) !important; font-family: 'Plus Jakarta Sans', sans-serif !important;
    border-radius: 9px !important; border-width: 1.5px !important;
    outline: none !important; transition: border-color .2s, box-shadow .2s !important;
  }
  .up-drawer-body input::placeholder,
  .up-drawer-body textarea::placeholder { color: var(--text-soft) !important; }
  .up-drawer-body input:focus,
  .up-drawer-body select:focus,
  .up-drawer-body textarea:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-pulse) !important; }
  .up-drawer-body select { color-scheme: dark; }
  .up-drawer-body select option { background: #0f1e30; }
  .up-drawer-body label,
  .up-drawer-body [class*="text-slate-7"],
  .up-drawer-body [class*="text-slate-8"],
  .up-drawer-body [class*="text-slate-9"],
  .up-drawer-body [class*="text-gray"] { color: var(--text-muted) !important; }
  .up-drawer-body [class*="text-slate-5"],
  .up-drawer-body [class*="text-slate-4"] { color: var(--text-soft) !important; }
  .up-drawer-body h1, .up-drawer-body h2,
  .up-drawer-body h3, .up-drawer-body h4 { color: var(--text) !important; }
  .up-drawer-body button[type="submit"],
  .up-drawer-body [class*="bg-blue-6"] {
    background: var(--accent) !important; border-color: var(--accent) !important;
    color: #fff !important; font-family: 'Plus Jakarta Sans', sans-serif !important;
    border-radius: 10px !important; font-weight: 600 !important;
    transition: background .2s, transform .15s, box-shadow .2s !important;
  }
  .up-drawer-body button[type="submit"]:hover,
  .up-drawer-body [class*="bg-blue-6"]:hover {
    background: #3a78ff !important;
    box-shadow: 0 6px 20px rgba(43,108,255,.35) !important;
    transform: translateY(-1px) !important;
  }
  .up-drawer-body [class*="border-slate"],
  .up-drawer-body [class*="border-gray"] { border-color: var(--border) !important; }
  .up-drawer-body [class*="rounded"] { border-radius: 9px !important; }
  .up-drawer-body [class*="shadow"] { box-shadow: none !important; }
  .up-drawer-body .absolute.top-full.left-0.right-0 {
    background: rgba(11, 21, 37, .92) !important;
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1.5px solid var(--border-mid) !important;
    box-shadow: 0 14px 30px rgba(0, 0, 0, .45) !important; z-index: 90 !important;
  }
  .up-drawer-body .absolute.top-full.left-0.right-0 button { background: transparent !important; color: var(--text) !important; }
  .up-drawer-body .absolute.top-full.left-0.right-0 button:hover { background: rgba(43,108,255,.14) !important; color: #bcd5ff !important; }
  .up-drawer-body .absolute.top-full.left-0.right-0 [class*="text-slate-900"],
  .up-drawer-body .absolute.top-full.left-0.right-0 [class*="text-slate-500"],
  .up-drawer-body .absolute.top-full.left-0.right-0 [class*="text-slate-400"] { color: var(--text) !important; }

  /* ─── KEYFRAMES ─── */
  @keyframes upFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes upSpin { to { transform: rotate(360deg); } }
  @keyframes upBlink {
    0%,100% { opacity: 1; }
    50%      { opacity: .3; }
  }
`
