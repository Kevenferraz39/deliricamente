import React from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const INTERNAL = [
  { label: 'Início',    path: '/' },
  { label: 'História',  path: '/historia' },
  { label: 'Blog',      path: '/blog' },
  { label: 'Galeria',   path: '/galeria' },
  { label: 'Música',    path: '/musica' },
  { label: 'Loja',      path: '/loja' },
  { label: 'Contato',   path: '/contato' },
  { label: 'Perfil',    path: '/perfil' },
];

/**
 * Input de link inteligente:
 * - Sugere páginas internas do site
 * - Sugere páginas criadas pelo admin (custom_pages)
 * - Aceita link externo (https://...)
 *
 * Props: value, onChange(newValue)
 */
export function LinkPicker({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [customPages, setCustomPages] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);
  const wrapRef = React.useRef(null);

  // Carrega páginas criadas uma única vez
  React.useEffect(() => {
    if (!loaded) return;
    getDocs(query(collection(db, 'custom_pages'), orderBy('title', 'asc')))
      .then(snap => setCustomPages(snap.docs.map(d => ({ slug: d.id, ...d.data() }))))
      .catch(() => {});
  }, [loaded]);

  const handleFocus = () => {
    setOpen(true);
    setLoaded(true);
  };

  // Fecha ao clicar fora
  React.useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const pick = (path) => { onChange(path); setOpen(false); };

  const isExternal = value && (value.startsWith('http') || value.startsWith('mailto'));

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        className="bz-input"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onFocus={handleFocus}
        placeholder="/pagina ou https://..."
      />

      {open && (
        <div className="lp-dropdown">
          {/* Páginas internas */}
          <div className="lp-group-label">Páginas do site</div>
          <div className="lp-chips">
            {INTERNAL.map(p => (
              <button
                key={p.path}
                className={'lp-chip' + (value === p.path ? ' active' : '')}
                onMouseDown={e => { e.preventDefault(); pick(p.path); }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Páginas criadas */}
          {customPages.length > 0 && (
            <>
              <div className="lp-group-label" style={{ marginTop: 10 }}>Páginas criadas</div>
              <div className="lp-chips">
                {customPages.map(p => (
                  <button
                    key={p.slug}
                    className={'lp-chip lp-chip-custom' + (value === '/' + p.slug ? ' active' : '')}
                    onMouseDown={e => { e.preventDefault(); pick('/' + p.slug); }}
                  >
                    {p.title}
                    <span style={{ opacity: 0.5, fontSize: '0.6rem', marginLeft: 4 }}>/{p.slug}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Link externo */}
          <div className="lp-group-label" style={{ marginTop: 10 }}>Link externo</div>
          <div className="lp-ext-hint">
            {isExternal
              ? <span style={{ color: '#0ea5e9' }}>↗ {value}</span>
              : <span style={{ color: 'var(--muted)' }}>Cole https://... no campo acima</span>
            }
          </div>
        </div>
      )}
    </div>
  );
}
