import React from 'react';

/* ============================================================
   Shared visual primitives for the Deliricamente site
   ============================================================ */

// --------------------------------------------------------------
// Concentric-oval logo, original mark (ellipses + small cluster)
// --------------------------------------------------------------
function LogoMark({ size = 64, color = "#F4F0E8", accent = "#E10600" }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="49" fill="#0A0A0A" stroke={accent} strokeWidth="1" />
      {/* concentric ellipses */}
      <ellipse cx="50" cy="50" rx="40" ry="14" stroke={color} strokeWidth="1.2" />
      <ellipse cx="50" cy="50" rx="34" ry="12" stroke={color} strokeWidth="1" opacity=".8" />
      <ellipse cx="50" cy="50" rx="28" ry="10" stroke={color} strokeWidth="1" opacity=".6" />
      <ellipse cx="50" cy="50" rx="22" ry="8"  stroke={color} strokeWidth="1" opacity=".45" />
      {/* central cluster */}
      <circle cx="50" cy="50" r="5" fill={color} />
      <circle cx="46" cy="47" r="3" fill={color} />
      <circle cx="54" cy="47" r="3" fill={color} />
      <circle cx="50" cy="53" r="3" fill={color} />
      <circle cx="47" cy="51" r="2" fill={color} />
      <circle cx="53" cy="51" r="2" fill={color} />
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

function Splatter({ color = "#E10600", opacity = 1 }) {
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

Object.assign(window, {
  LogoMark, Splatter, Placeholder, Marquee, Btn, Icon,
});