import React from 'react';

/* ============================================================
   Shared visual primitives for the Deliricamente site
   ============================================================ */

// --------------------------------------------------------------
// Concentric-oval logo, original mark (ellipses + small cluster)
// --------------------------------------------------------------
function LogoMark({ size = 64, color = "var(--off-white)", accent = "var(--red)", imageUrl = "" }) {
  // ID unico por instancia para evitar conflito de clipPath
  const cid = React.useId ? React.useId().replace(/:/g,'') : 'lm' + size;
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 100 100" fill="none">
      {imageUrl && (
        <defs>
          <clipPath id={cid}>
            <circle cx="50" cy="50" r="47" />
          </clipPath>
        </defs>
      )}
      {/* Circulo de fundo */}
      <circle cx="50" cy="50" r="49" fill="var(--black)" stroke={accent} strokeWidth="1" />
      {/* Imagem dentro do circulo (opcional) */}
      {imageUrl && (
        <image href={imageUrl} x="3" y="3" width="94" height="94"
          preserveAspectRatio="xMidYMid slice"
          clipPath={'url(#' + cid + ')'} style={{opacity:0.85}} />
      )}
    </svg>
  );
}

// --------------------------------------------------------------
// Paint splatter — large decorative SVG.
// Built from a fixed seed so it doesn't reflow.
// --------------------------------------------------------------
const SPLATTER_BLOBS = [
  { cx: 8,  cy: 18, r: 9,  o: 0.95 },
  { cx: 12, cy: 22, r: 4,  o: 0.7 },
  { cx: 3,  cy: 60, r: 14, o: 0.9 },
  { cx: 18, cy: 72, r: 5,  o: 0.65 },
  { cx: 28, cy: 12, r: 7,  o: 0.85 },
  { cx: 38, cy: 4,  r: 3,  o: 0.6 },
  { cx: 88, cy: 28, r: 11, o: 0.9 },
  { cx: 94, cy: 18, r: 4,  o: 0.7 },
  { cx: 78, cy: 80, r: 12, o: 0.92 },
  { cx: 92, cy: 88, r: 6,  o: 0.7 },
  { cx: 62, cy: 92, r: 5,  o: 0.55 },
  { cx: 48, cy: 86, r: 8,  o: 0.8 },
  { cx: 24, cy: 96, r: 3,  o: 0.5 },
  { cx: 70, cy: 6,  r: 6,  o: 0.7 },
  { cx: 56, cy: 30, r: 4,  o: 0.6 },
  { cx: 32, cy: 50, r: 3,  o: 0.4 },
];
const SPLATTER_DROPS = [
  { x: 14, y: 30 }, { x: 6, y: 36 }, { x: 18, y: 40 }, { x: 22, y: 28 },
  { x: 88, y: 36 }, { x: 92, y: 44 }, { x: 84, y: 50 }, { x: 96, y: 60 },
  { x: 36, y: 8 },  { x: 40, y: 16 }, { x: 64, y: 88 }, { x: 74, y: 94 },
  { x: 52, y: 76 }, { x: 30, y: 86 }, { x: 60, y: 18 },
];

function Splatter({ color = "var(--red)", opacity = 1 }) {
  return (
    <svg
      className="hero-splatter"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    >
      <g fill={color} opacity={opacity}>
        {SPLATTER_BLOBS.map((b, i) => (
          <circle key={"b" + i} cx={b.cx} cy={b.cy} r={b.r} opacity={b.o} />
        ))}
        {SPLATTER_DROPS.map((d, i) => (
          <circle key={"d" + i} cx={d.x} cy={d.y} r={0.7} opacity={0.7} />
        ))}
      </g>
    </svg>
  );
}

// --------------------------------------------------------------
// Placeholder image w/ caption
// --------------------------------------------------------------
function Placeholder({ label = "FOTO", variant = "" }) {
  return <div className={"ph " + variant}>{label}</div>;
}

// --------------------------------------------------------------
// Marquee
// --------------------------------------------------------------
function Marquee({ items, dot = true }) {
  const content = (
    <span>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {it}
          {dot && <span className="marquee-dot" />}
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="marquee">
      <div className="marquee-track">
        {content}
        {content}
      </div>
    </div>
  );
}

// --------------------------------------------------------------
// Generic Button
// --------------------------------------------------------------
function Btn({ children, variant = "ghost", arrow = false, ...rest }) {
  const cls =
    "btn " +
    (variant === "red" ? "btn-red" :
     variant === "paper" ? "btn-paper" : "btn-ghost");
  return (
    <button className={cls} {...rest}>
      {children}
      {arrow && <span className="arrow">→</span>}
    </button>
  );
}

// --------------------------------------------------------------
// Tiny inline icons
// --------------------------------------------------------------
const Icon = {
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  ),
  Insta: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="18" height="18" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  ),
  Whats: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}>
      <path d="M12 2a10 10 0 00-8.6 15l-1.4 5 5.1-1.4A10 10 0 1012 2zm5.6 14.2c-.2.7-1.3 1.4-1.9 1.5-.5.1-1.1.1-1.8-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.2c.1.2.1.4 0 .5l-.3.4-.3.4c-.1.1-.2.2-.1.4.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.8-.9c.2-.2.4-.2.7-.1l2.1 1c.2.1.4.2.5.3s.1.6-.1 1.2z" />
    </svg>
  ),
  Tw: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...p}>
      <path d="M18.244 2H21l-6.516 7.444L22 22h-6.844l-4.793-6.262L4.8 22H2l6.97-7.96L2 2h6.97l4.33 5.72L18.244 2zM17 20h1.5L7 4H5.5L17 20z"/>
    </svg>
  ),
  Fb: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}>
      <path d="M13 22v-9h3l1-4h-4V6.5c0-1.1.4-2 2-2h2V1.1C16.5 1 15.4 1 14.3 1c-2.6 0-4.3 1.6-4.3 4.4V9H7v4h3v9h3z"/>
    </svg>
  ),
  Yt: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}>
      <path d="M23.5 7.2a3 3 0 00-2.1-2.1C19.6 4.6 12 4.6 12 4.6s-7.6 0-9.4.5A3 3 0 00.5 7.2C0 9 0 12 0 12s0 3 .5 4.8a3 3 0 002.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 002.1-2.1c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>
    </svg>
  ),
  Heart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" {...p}>
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  ),
  Fire: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" {...p}>
      <path d="M12 2c1 4 6 5 6 11a6 6 0 11-12 0c0-3 2-4 2-7 2 1 3 3 4 0 0-1 0-2 0-4z" />
    </svg>
  ),
  Comment: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" {...p}>
      <path d="M21 12a8 8 0 01-12 7l-5 1 1-5a8 8 0 1116-3z" />
    </svg>
  ),
  Share: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" {...p}>
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M8.5 10.5l7-3M8.5 13.5l7 3" />
    </svg>
  ),
  Link: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" {...p}>
      <path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
      <path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
    </svg>
  ),
  Upload: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22" {...p}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14" {...p}>
      <path d="M11 4H4v16h16v-7" />
      <path d="M18.5 2.5l3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14" {...p}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14" {...p}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Close: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" {...p}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  ),
};

// --------------------------------------------------------------
// AnimatedBackground — Canvas 2D: blobs | rede | geo | off
// --------------------------------------------------------------
function AnimatedBackground({ style = 'blobs', speed = 1, density = 15, opacity = 0.85 }) {
  const canvasRef = React.useRef(null);
  const st = React.useRef({ ps: [], tags: [], raf: null, frame: 0, color: '#E10600', nextTag: 0 });

  React.useEffect(() => {
    if (style === 'off') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = st.current;

    const getAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || '#E10600';
    const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };

    const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#%&/?<>';

    const makeTag = () => {
      const sx = 40 + Math.random() * (canvas.width - 80);
      const sy = 30 + Math.random() * (canvas.height - 60);
      const n = 5 + Math.floor(Math.random() * 9);
      const pts = [{ x: sx, y: sy }];
      for (let i = 1; i < n; i++)
        pts.push({ x: pts[i-1].x + (Math.random() - 0.5) * 140, y: pts[i-1].y + (Math.random() - 0.5) * 90 });
      return { pts, life: 1, decay: (0.002 + Math.random() * 0.005) * speed, drawn: 0, ds: 0.04 + Math.random() * 0.1, w: 1.5 + Math.random() * 4 };
    };

    const init = () => {
      const n = Math.min(Math.max(5, Math.floor(density)), 40);
      s.color = getAccent(); s.tags = []; s.nextTag = 30;
      if (style === 'blobs') {
        s.ps = Array.from({ length: n }, () => ({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          r: 30 + Math.random() * 150, vx: (Math.random() - 0.5) * 0.3 * speed, vy: (Math.random() - 0.5) * 0.3 * speed,
          phase: Math.random() * Math.PI * 2, ps: (0.005 + Math.random() * 0.008) * speed, op: 0.4 + Math.random() * 0.55,
        }));
      } else if (style === 'rede') {
        s.ps = Array.from({ length: Math.min(n * 3, 90) }, () => ({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          r: 2 + Math.random() * 3, vx: (Math.random() - 0.5) * 0.5 * speed, vy: (Math.random() - 0.5) * 0.5 * speed, op: 0.5 + Math.random() * 0.5,
        }));
      } else if (style === 'geo') {
        s.ps = Array.from({ length: Math.min(n, 22) }, () => ({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          size: 20 + Math.random() * 70, vx: (Math.random() - 0.5) * 0.2 * speed, vy: (Math.random() - 0.5) * 0.2 * speed,
          rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.012 * speed,
          sides: [3, 4, 6][Math.floor(Math.random() * 3)], op: 0.2 + Math.random() * 0.45,
        }));
      } else if (style === 'chuva') {
        const cols = Math.floor(canvas.width / 16);
        s.ps = Array.from({ length: cols }, (_, i) => ({
          x: i * 16 + 8, y: Math.random() * canvas.height,
          spd: (0.4 + Math.random() * 1.5) * speed,
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
          bright: Math.random() > 0.88,
        }));
      } else if (style === 'spray') {
        s.ps = Array.from({ length: Math.min(n * 5, 150) }, () => ({
          x: Math.random() * canvas.width, y: -Math.random() * canvas.height * 0.5,
          vx: (Math.random() - 0.5) * 1.5, vy: (0.8 + Math.random() * 2) * speed,
          r: 1 + Math.random() * 3, life: Math.random(),
        }));
      } else if (style === 'glitch' || style === 'pichacao') {
        s.ps = [];
      }
    };

    const polygon = (x, y, size, sides, rot) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = rot + (i / sides) * Math.PI * 2;
        i === 0 ? ctx.moveTo(x + Math.cos(a) * size, y + Math.sin(a) * size) : ctx.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size);
      }
      ctx.closePath();
    };

    const draw = () => {
      s.frame++; if (s.frame % 60 === 0) s.color = getAccent();
      const c = s.color; const ps = s.ps;

      // --- GLITCH ---
      if (style === 'glitch') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 4 + Math.floor(Math.random() * 8); i++) {
          const y = Math.random() * canvas.height;
          const h = 1 + Math.floor(Math.random() * 12);
          ctx.fillStyle = c + hex2(Math.random() * opacity * 0.4 * 255);
          ctx.fillRect(0, y, canvas.width, h);
        }
        for (let y = 0; y < canvas.height; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0, y, canvas.width, 1); }
        if (Math.random() < 0.12) {
          const sh = 8 + Math.random() * 14;
          ctx.fillStyle = '#ff000018'; ctx.fillRect(-sh, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#0000ff18'; ctx.fillRect(sh, 0, canvas.width, canvas.height);
        }
        if (Math.random() < 0.04) { ctx.fillStyle = c + hex2(opacity * 0.9 * 255); ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 1 + Math.random() * 2); }
        if (Math.random() < 0.06) {
          for (let i = 0; i < 4; i++) {
            ctx.fillStyle = c + hex2(Math.random() * opacity * 0.35 * 255);
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 20 + Math.random() * 100, 2 + Math.random() * 5);
          }
        }

      // --- CHUVA (char rain) ---
      } else if (style === 'chuva') {
        const bg = getComputedStyle(document.documentElement).getPropertyValue('--black').trim() || '#0A0A0A';
        ctx.fillStyle = bg + '12'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px monospace';
        ps.forEach(p => {
          ctx.fillStyle = p.bright ? '#ffffff' + hex2(opacity * 255) : c + hex2(opacity * 0.75 * 255);
          ctx.fillText(p.char, p.x, p.y);
          p.y += p.spd * 3;
          if (Math.random() < 0.08) p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          if (p.y > canvas.height) { p.y = -16; p.bright = Math.random() > 0.88; }
        });

      // --- SPRAY ---
      } else if (style === 'spray') {
        ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ps.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vx += (Math.random() - 0.5) * 0.08; p.life -= 0.004;
          if (p.y > canvas.height || p.life <= 0) {
            p.x = Math.random() * canvas.width; p.y = -5;
            p.vx = (Math.random() - 0.5) * 1.5; p.vy = (0.8 + Math.random() * 2) * speed;
            p.life = 0.5 + Math.random() * 0.5; p.r = 1 + Math.random() * 3;
          }
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = c + hex2(Math.min(p.life, 1) * opacity * 255); ctx.fill();
        });

      // --- PICHACAO (identidade do site) ---
      } else if (style === 'pichacao') {
        ctx.fillStyle = 'rgba(0,0,0,0.018)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        s.nextTag--;
        if (s.nextTag <= 0) {
          s.tags.push(makeTag());
          s.nextTag = Math.floor((50 + Math.random() * 100) / speed);
          if (s.tags.length > 14) s.tags.shift();
        }
        s.tags = s.tags.filter(t => t.life > 0);
        s.tags.forEach(t => {
          t.drawn = Math.min(1, t.drawn + t.ds); t.life -= t.decay;
          const pts = t.pts; const show = Math.max(2, Math.floor(t.drawn * pts.length));
          ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < show; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.strokeStyle = c + hex2(Math.min(t.life, 1) * opacity * 255);
          ctx.lineWidth = t.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
          // detalhes de preenchimento (bolhas de tinta)
          if (t.drawn > 0.5 && Math.random() < 0.015) {
            const pt = pts[Math.floor(Math.random() * show)];
            ctx.beginPath(); ctx.arc(pt.x + (Math.random()-0.5)*8, pt.y + (Math.random()-0.5)*8, 1 + Math.random()*2.5, 0, Math.PI * 2);
            ctx.fillStyle = c + hex2(t.life * opacity * 0.7 * 255); ctx.fill();
          }
        });

      // --- BLOBS / REDE / GEO (com clearRect) ---
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (style === 'blobs') {
          ps.forEach(b => {
            b.x += b.vx; b.y += b.vy; b.phase += b.ps;
            if (b.x < -b.r*2) b.x = canvas.width+b.r; if (b.x > canvas.width+b.r*2) b.x = -b.r;
            if (b.y < -b.r*2) b.y = canvas.height+b.r; if (b.y > canvas.height+b.r*2) b.y = -b.r;
            const pulse = 1 + Math.sin(b.phase) * 0.12;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2);
            ctx.fillStyle = c + hex2(b.op * opacity * 255); ctx.fill();
          });
        } else if (style === 'rede') {
          ps.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
          });
          const maxD = 130;
          for (let i = 0; i < ps.length; i++) for (let j = i+1; j < ps.length; j++) {
            const dx = ps[i].x-ps[j].x, dy = ps[i].y-ps[j].y, d = Math.sqrt(dx*dx+dy*dy);
            if (d < maxD) {
              ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y);
              ctx.strokeStyle = c + hex2((1-d/maxD)*opacity*0.5*255); ctx.lineWidth = 1; ctx.stroke();
            }
          }
          ps.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fillStyle = c + hex2(p.op*opacity*255); ctx.fill(); });
        } else if (style === 'geo') {
          ps.forEach(g => {
            g.x += g.vx; g.y += g.vy; g.rot += g.rotV;
            if (g.x < -g.size*2) g.x = canvas.width+g.size; if (g.x > canvas.width+g.size*2) g.x = -g.size;
            if (g.y < -g.size*2) g.y = canvas.height+g.size; if (g.y > canvas.height+g.size*2) g.y = -g.size;
            polygon(g.x, g.y, g.size, g.sides, g.rot);
            ctx.strokeStyle = c + hex2(g.op*opacity*255); ctx.lineWidth = 1.5; ctx.stroke();
          });
        }
      }
      s.raf = requestAnimationFrame(draw);
    };

    resize(); window.addEventListener('resize', resize); init(); draw();
    return () => { cancelAnimationFrame(s.raf); window.removeEventListener('resize', resize); };
  }, [style, speed, density, opacity]);

  if (style === 'off') return null;
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
}

// --------------------------------------------------------------
// HeroCarousel — slides com imagem, titulo, CTA e auto-play
// --------------------------------------------------------------
function HeroCarousel({ slides = [], autoPlay = true, interval = 5, go }) {
  const [cur, setCur] = React.useState(0);
  const [fade, setFade] = React.useState(false);
  const total = slides.length;

  React.useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const t = setInterval(() => move(1), interval * 1000);
    return () => clearInterval(t);
  }, [autoPlay, interval, total, cur]);

  const move = (dir) => {
    setFade(true);
    setTimeout(() => { setCur(c => (c + dir + total) % total); setFade(false); }, 300);
  };
  const goTo = (i) => { setFade(true); setTimeout(() => { setCur(i); setFade(false); }, 300); };

  if (!total) return null;
  const s = slides[cur];
  const hasText = s.title || s.kicker || s.subtitle || s.ctaText;

  const SLIDE_H = 'clamp(460px, 68vh, 700px)';
  const BTN = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 6,
    width: 44, height: 44, cursor: 'pointer', fontSize: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.25)',
    color: 'var(--off-white)', transition: 'background 0.2s, border-color 0.2s',
  };

  return (
    /* ── Faixa full-width com fundo da página ── */
    <div style={{ background: 'var(--black)', padding: '0 0 0' }}>

      {/* ── Banner 90% centralizado ── */}
      <div style={{ width: '90%', maxWidth: 1400, margin: '0 auto', borderTop: '2px solid var(--red)', position: 'relative' }}>

        {/* ── Área da imagem ── */}
        <div style={{ position: 'relative', height: SLIDE_H, overflow: 'hidden' }}>

          {/* Slides */}
          {slides.map((sl, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, zIndex: i === cur ? 1 : 0, opacity: i === cur ? (fade ? 0 : 1) : 0, transition: 'opacity 0.35s ease' }}>
              {sl.imageUrl
                ? <img src={sl.imageUrl} alt={sl.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', background: 'var(--panel)' }} />
              }
            </div>
          ))}

          {/* Gradiente lateral para legibilidade do texto */}
          {hasText && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(90deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.0) 75%)' }} />
          )}

          {/* ── Efeito embaçado na borda inferior (estilo ML) ── */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, zIndex: 5, pointerEvents: 'none' }}>
            {/* Camada de blur progressivo */}
            <div style={{
              position: 'absolute', inset: 0,
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 40%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 40%, black 100%)',
            }} />
            {/* Camada de cor que funde com o fundo da página */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.4) 45%, var(--black) 100%)',
            }} />
          </div>

          {/* Texto */}
          {hasText && (
            <div className="wrap" style={{ position: 'absolute', inset: 0, zIndex: 4, display: 'flex', alignItems: 'center' }}>
              <div style={{ maxWidth: 560, opacity: fade ? 0 : 1, transform: fade ? 'translateY(10px)' : 'none', transition: 'opacity 0.28s, transform 0.28s' }}>
                {s.kicker && <div className="kicker">{s.kicker}</div>}
                {s.title && <h2 style={{ fontSize: 'clamp(1.8rem, 4.2vw, 3.8rem)', margin: '6px 0 12px', lineHeight: 0.92, color: 'var(--off-white)' }}>{s.title}</h2>}
                {s.subtitle && <p style={{ color: 'var(--text-body)', maxWidth: '42ch', marginBottom: 20, fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)' }}>{s.subtitle}</p>}
                {s.ctaText && <Btn variant="red" arrow onClick={() => s.ctaPage && go && go(s.ctaPage)}>{s.ctaText}</Btn>}
              </div>
            </div>
          )}

          {/* Setas */}
          {total > 1 && (
            <>
              <button onClick={() => move(-1)} style={{ ...BTN, left: 14 }}>&#8592;</button>
              <button onClick={() => move(1)}  style={{ ...BTN, right: 14 }}>&#8594;</button>
            </>
          )}

          {/* Contador */}
          <div style={{ position: 'absolute', top: 12, right: 14, zIndex: 6, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', letterSpacing: '0.05em' }}>
            {cur + 1} / {total}
          </div>
        </div>

        {/* Dots centralizados abaixo */}
        {total > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '10px 0 4px' }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => goTo(i)} style={{ width: i === cur ? 28 : 8, height: 8, borderRadius: 4, background: i === cur ? 'var(--red)' : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  LogoMark, Splatter, Placeholder, Marquee, Btn, Icon,
  AnimatedBackground, HeroCarousel,
});