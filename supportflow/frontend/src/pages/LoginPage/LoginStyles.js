export const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  /* ─────────────────────────────────────────
     TOKENS
  ───────────────────────────────────────── */
  .sf-root {
    --bg:           #060d1a;
    --surface:      #0b1525;
    --card:         #0f1e30;
    --card-hover:   #132540;
    --border:       #1a2f4a;
    --border-glow:  #2a5caa;
    --accent:       #2b6cff;
    --accent-dim:   #1a4dbf;
    --accent-glow:  rgba(43,108,255,.25);
    --accent-pulse: rgba(43,108,255,.12);
    --text:         #e8f0fe;
    --text-muted:   #7890b0;
    --text-soft:    #4a6585;
    --success:      #10b981;
    --danger:       #ef4444;
    --warning:      #f59e0b;
  }

  /* ─────────────────────────────────────────
     RESET / BASE
  ───────────────────────────────────────── */
  .sf-root * { box-sizing: border-box; }
  .sf-root {
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    display: flex;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow-x: hidden;
  }

  /* ─────────────────────────────────────────
     LAYOUT
  ───────────────────────────────────────── */
  .sf-panel-left {
    flex: 1.1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px 48px;
    position: relative;
    overflow: hidden;
    border-right: 1px solid var(--border);
  }
  .sf-panel-right {
    flex: 0 0 440px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px 40px;
    position: relative;
    background: var(--surface);
  }
  @media (max-width: 900px) {
    .sf-root { flex-direction: column; }
    .sf-panel-left { display: none; }
    .sf-panel-right { flex: 1; width: 100%; padding: 40px 24px; }
  }

  /* ─────────────────────────────────────────
     GRID BACKGROUND
  ───────────────────────────────────────── */
  .sf-grid-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(43,108,255,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(43,108,255,.04) 1px, transparent 1px);
    background-size: 40px 40px;
    z-index: 0;
  }
  .sf-grid-vignette {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, var(--bg) 100%);
    z-index: 1;
  }

  /* ─────────────────────────────────────────
     BLOBS
  ───────────────────────────────────────── */
  .sf-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: .2;
    animation: sfBlobFloat 8s ease-in-out infinite;
    z-index: 0;
  }
  .sf-blob-1 { width:420px; height:420px; background:#1a4dbf; top:-100px; left:-80px; animation-delay:0s; }
  .sf-blob-2 { width:300px; height:300px; background:#0891b2; bottom:-60px; right:60px; animation-delay:3s; }
  .sf-blob-3 { width:200px; height:200px; background:#6d28d9; top:50%; left:40%; animation-delay:5s; }

  @keyframes sfBlobFloat {
    0%,100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-30px) scale(1.05); }
  }

  /* ─────────────────────────────────────────
     BRAND
  ───────────────────────────────────────── */
  .sf-brand {
    position: relative; z-index: 5;
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 48px;
    align-self: flex-start;
  }
  .sf-brand-icon {
    width: 52px; height: 52px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    background: rgba(255,255,255,.96);
    box-shadow: 0 10px 28px rgba(0,0,0,.18);
  }
  .sf-brand-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .sf-brand-name {
    font-family: 'Outfit', sans-serif;
    font-size: 22px; font-weight: 700;
    letter-spacing: -.3px; color: var(--text);
  }
  .sf-brand-tag {
    font-size: 10px; font-weight: 500;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--text-muted); margin-top: 1px;
  }

  /* ─────────────────────────────────────────
     HERO
  ───────────────────────────────────────── */
  .sf-hero-wrap {
    position: relative; z-index: 5;
    align-self: flex-start;
    animation: sfFadeUp .8s ease .2s both;
  }
  .sf-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(43,108,255,.1);
    border: 1px solid rgba(43,108,255,.25);
    border-radius: 100px;
    padding: 5px 14px;
    font-size: 11px; font-weight: 500; letter-spacing: .5px;
    color: #7eb8ff;
    margin-bottom: 24px;
  }
  .sf-badge-dot {
    width: 6px; height: 6px;
    background: var(--accent); border-radius: 50%;
    animation: sfBlink 2s infinite;
  }
  .sf-h1 {
    font-family: 'Outfit', sans-serif;
    font-size: 46px; font-weight: 700;
    line-height: 1.1; letter-spacing: -1.5px;
    margin-bottom: 18px;
  }
  .sf-h1 span { color: var(--accent); }
  .sf-hero-p {
    font-size: 15px; line-height: 1.75;
    color: var(--text-muted); max-width: 480px;
  }

  /* ─────────────────────────────────────────
     STATS
  ───────────────────────────────────────── */
  .sf-stats {
    display: flex; gap: 24px;
    margin-top: 48px;
    position: relative; z-index: 5;
    animation: sfFadeUp .8s ease .65s both;
  }
  .sf-stat { display: flex; flex-direction: column; gap: 2px; }
  .sf-stat-num {
    font-family: 'Outfit', sans-serif;
    font-size: 26px; font-weight: 700; color: var(--text);
  }
  .sf-stat-lbl {
    font-size: 11px; color: var(--text-soft);
    letter-spacing: .5px; text-transform: uppercase;
  }
  .sf-stat-div { width: 1px; background: var(--border); }

  /* ─────────────────────────────────────────
     FLOW SVG WRAP
  ───────────────────────────────────────── */
  .sf-flow-wrap {
    position: relative; z-index: 5;
    width: 100%; max-width: 520px;
    margin-top: 48px;
    animation: sfFadeUp .8s ease .8s both;
  }

  /* ─────────────────────────────────────────
     FLOATING STATUS CARDS
  ───────────────────────────────────────── */
  .sf-floating-cards {
    position: absolute; inset: 0;
    z-index: 3; pointer-events: none;
  }
  .sf-fc {
    position: absolute;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 16px;
    display: flex; align-items: center; gap: 10px;
    font-size: 12px;
    backdrop-filter: blur(8px);
    box-shadow: 0 8px 32px rgba(0,0,0,.4);
    animation: sfFcFloat 6s ease-in-out infinite;
  }
  .sf-fc-1 { top: 15%; right: 5%; animation-delay: 0s; }
  .sf-fc-2 { top: 55%; right: 2%; animation-delay: 2s; }
  .sf-fc-3 { bottom: 20%; left: 5%; animation-delay: 4s; }
  .sf-fc-dot {
    width: 8px; height: 8px;
    border-radius: 50%; flex-shrink: 0;
  }
  .sf-fc-dot-green  { background: var(--success); }
  .sf-fc-dot-amber  { background: var(--warning); }
  .sf-fc-dot-red    { background: var(--danger); animation: sfBlink 1.4s infinite; }
  .sf-fc-text  { color: var(--text-muted); font-size: 11px; }
  .sf-fc-count {
    font-family: 'Outfit', sans-serif;
    font-size: 15px; font-weight: 600; color: var(--text);
  }
  @keyframes sfFcFloat {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
  }

  /* ─────────────────────────────────────────
     FORM BOX
  ───────────────────────────────────────── */
  .sf-form-box {
    width: 100%; max-width: 360px;
    animation: sfFadeUp .9s ease .1s both;
  }
  .sf-form-header { margin-bottom: 32px; }
  .sf-eyebrow {
    font-size: 11px; font-weight: 500;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--text-soft); margin-bottom: 12px;
  }
  .sf-form-title {
    font-family: 'Outfit', sans-serif;
    font-size: 30px; font-weight: 700;
    letter-spacing: -.8px; color: var(--text);
    line-height: 1.1;
  }
  .sf-form-title small {
    display: block;
    font-size: 14px; font-weight: 400;
    color: var(--text-muted); letter-spacing: 0;
    margin-top: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* ─────────────────────────────────────────
     INPUT
  ───────────────────────────────────────── */
  .sf-form-group { margin-bottom: 16px; position: relative; }
  .sf-label {
    display: block;
    font-size: 12px; font-weight: 500;
    letter-spacing: .3px;
    color: var(--text-muted);
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  .sf-input-wrap { position: relative; }
  .sf-input-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    color: var(--text-soft);
    transition: color .3s;
    pointer-events: none;
    display: flex;
  }
  .sf-input-wrap:focus-within .sf-input-icon { color: var(--accent); }
  .sf-input {
    width: 100%;
    padding: 13px 16px 13px 44px;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: border-color .25s, background .25s, box-shadow .25s;
    outline: none;
    letter-spacing: .2px;
  }
  .sf-input::placeholder { color: var(--text-soft); }
  .sf-input:hover  { border-color: #253a5a; background: var(--card-hover); }
  .sf-input:focus  {
    border-color: var(--accent);
    background: var(--card-hover);
    box-shadow: 0 0 0 4px var(--accent-pulse);
  }
  .sf-input.invalid {
    border-color: var(--danger) !important;
    box-shadow: 0 0 0 4px rgba(239,68,68,.1) !important;
  }
  .sf-input.valid { border-color: var(--success) !important; }
  .sf-focus-line {
    position: absolute; bottom: -1px; left: 0; right: 0;
    height: 2px; background: var(--accent);
    transform: scaleX(0); transform-origin: left;
    transition: transform .3s cubic-bezier(.4,0,.2,1);
    border-radius: 0 0 10px 10px;
  }
  .sf-input:focus ~ .sf-focus-line { transform: scaleX(1); }
  .sf-field-hint {
    font-size: 11px; margin-top: 5px;
    color: var(--danger); display: none;
    padding-left: 2px; animation: sfFadeUp .2s ease;
  }
  .sf-field-hint.show { display: block; }
  .sf-pass-toggle {
    position: absolute; right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer;
    color: var(--text-soft);
    transition: color .2s;
    padding: 4px; line-height: 0;
    display: flex;
  }
  .sf-pass-toggle:hover { color: var(--text-muted); }

  /* ─────────────────────────────────────────
     OPTIONS ROW
  ───────────────────────────────────────── */
  .sf-opts {
    display: flex; align-items: center;
    justify-content: space-between;
    margin: 8px 0 24px;
  }
  .sf-check-label {
    display: flex; align-items: center; gap: 8px;
    cursor: pointer;
    font-size: 12px; color: var(--text-muted);
    user-select: none;
  }
  .sf-check-box {
    width: 16px; height: 16px;
    border: 1.5px solid var(--border);
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, border-color .2s;
    flex-shrink: 0;
  }
  .sf-check-box.checked {
    background: var(--accent);
    border-color: var(--accent);
  }
  .sf-check-box.checked::after {
    content: '';
    display: block;
    width: 8px; height: 5px;
    border-left: 2px solid #fff;
    border-bottom: 2px solid #fff;
    transform: rotate(-45deg) translateY(-1px);
  }
  .sf-forgot {
    font-size: 12px; color: var(--accent);
    text-decoration: none; transition: color .2s;
  }
  .sf-forgot:hover { color: #6fa3ff; }

  /* ─────────────────────────────────────────
     SUBMIT BUTTON
  ───────────────────────────────────────── */
  .sf-submit-btn {
    width: 100%;
    padding: 14px 24px;
    background: var(--accent);
    border: none; border-radius: 10px;
    color: #fff;
    font-size: 14px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: .3px;
    cursor: pointer;
    display: flex; align-items: center;
    justify-content: center; gap: 10px;
    position: relative; overflow: hidden;
    transition: background .25s, transform .15s, box-shadow .25s;
  }
  .sf-submit-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.12), transparent);
    opacity: 0; transition: opacity .25s;
  }
  .sf-submit-btn:hover {
    background: #3a78ff;
    box-shadow: 0 8px 24px rgba(43,108,255,.4);
    transform: translateY(-1px);
  }
  .sf-submit-btn:hover::before { opacity: 1; }
  .sf-submit-btn:active { transform: translateY(0) scale(.98); box-shadow: none; }
  .sf-submit-btn:disabled { opacity: .7; cursor: not-allowed; transform: none !important; }
  .sf-submit-btn .sf-btn-arrow { transition: transform .25s; }
  .sf-submit-btn:hover .sf-btn-arrow { transform: translateX(4px); }
  .sf-btn-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: sfSpin .7s linear infinite;
  }

  /* ─────────────────────────────────────────
     ALERT
  ───────────────────────────────────────── */
  .sf-alert {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 8px;
    font-size: 12px; margin-bottom: 16px;
    animation: sfFadeUp .3s ease;
  }
  .sf-alert-err {
    background: rgba(239,68,68,.1);
    border: 1px solid rgba(239,68,68,.25);
    color: #fca5a5;
  }
  .sf-alert-ok {
    background: rgba(16,185,129,.1);
    border: 1px solid rgba(16,185,129,.25);
    color: #6ee7b7;
  }
  .sf-alert-warn {
    background: rgba(245,158,11,.1);
    border: 1px solid rgba(245,158,11,.25);
    color: #fcd34d;
  }

  /* ─────────────────────────────────────────
     DIVIDER / SSO
  ───────────────────────────────────────── */
  .sf-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0;
    color: var(--text-soft);
    font-size: 11px; letter-spacing: .5px;
  }
  .sf-divider::before, .sf-divider::after {
    content: ''; flex: 1;
    height: 1px; background: var(--border);
  }
  .sf-sso-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
  .sf-sso-btn {
    padding: 10px 14px;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    color: var(--text-muted);
    font-size: 12px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    display: flex; align-items: center;
    justify-content: center; gap: 8px;
    transition: border-color .2s, background .2s, color .2s;
    letter-spacing: .2px;
  }
  .sf-sso-btn:hover {
    border-color: #253a5a;
    background: var(--card-hover);
    color: var(--text);
  }

  /* ─────────────────────────────────────────
     FOOTER / SECURITY BADGE
  ───────────────────────────────────────── */
  .sf-form-footer {
    text-align: center;
    font-size: 11px; color: var(--text-soft);
    margin-top: 28px; line-height: 1.8;
  }
  .sf-form-footer a { color: var(--accent); text-decoration: none; }
  .sf-sec-badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; color: var(--text-soft);
    letter-spacing: .3px;
    margin-top: 20px; justify-content: center;
  }
  .sf-sec-dot {
    width: 5px; height: 5px;
    background: var(--success); border-radius: 50%;
    animation: sfBlink 2.5s infinite;
  }

  /* ─────────────────────────────────────────
     KEYFRAMES
  ───────────────────────────────────────── */
  @keyframes sfFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sfBlink {
    0%,100% { opacity: 1; }
    50%      { opacity: .3; }
  }
  @keyframes sfSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes sfNodePulse {
    0%,100% { r: 4; }
    50%      { r: 6.5; }
  }
  @keyframes sfTicketSlide {
    from { transform: translateY(8px); opacity: 0; }
    to   { transform: translateY(0);   opacity: 1; }
  }
`
