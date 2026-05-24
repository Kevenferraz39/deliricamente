import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditMode } from '../../context/EditModeContext';

const VARIANTS = ['red', 'ghost', 'outline', 'white'];

/**
 * Botão editável — em edit mode mostra popover com texto, link e variante.
 * Pode ser "removido" (hidden) pelo admin.
 */
export function EditableButton({
  pageId,
  contentKey,         // prefixo: salva contentKey.text, contentKey.link, contentKey.variant, contentKey.visible
  defaultText = 'Botão',
  defaultLink = '/',
  defaultVariant = 'red',
  arrow = false,
  style = {},
  className = '',
}) {
  const { editMode, getContent, updateContent } = useEditMode();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const popRef = React.useRef(null);

  const get = (suffix, def) => { const v = getContent(pageId, `${contentKey}.${suffix}`); return v !== undefined ? v : def; };
  const set = (suffix, val) => updateContent(pageId, `${contentKey}.${suffix}`, val);

  const text    = get('text',    defaultText);
  const link    = get('link',    defaultLink);
  const variant = get('variant', defaultVariant);
  const visible = get('visible', 'true');

  // Click fora fecha o popover
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleNavigate = () => {
    if (!editMode) {
      if (link.startsWith('http')) window.open(link, '_blank');
      else navigate(link);
    }
  };

  // Em modo de leitura: não renderiza se invisible
  if (!editMode && visible === 'false') return null;

  // Estilos do botão por variante
  const btnStyles = {
    red:     { background:'var(--red)',      color:'#fff',              border:'2px solid var(--red)' },
    ghost:   { background:'transparent',      color:'var(--off-white)',   border:'2px solid var(--off-white)' },
    outline: { background:'transparent',      color:'var(--red)',         border:'2px solid var(--red)' },
    white:   { background:'#fff',             color:'var(--black)',       border:'2px solid #fff' },
  };

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 24px', fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.06em', cursor: editMode ? 'default' : 'pointer',
    transition: 'all 0.2s', border: '2px solid',
    opacity: (!editMode && visible === 'false') ? 0 : (visible === 'false' ? 0.35 : 1),
    position: 'relative',
    ...btnStyles[variant] || btnStyles.red,
    ...style,
  };

  return (
    <span style={{ position: 'relative', display: 'inline-block' }} className={className}>
      {/* O botão em si */}
      <button style={btnBase} onClick={handleNavigate}>
        {text}{arrow && ' →'}
      </button>

      {/* Overlay de edição */}
      {editMode && (
        <span
          className="editable-btn-trigger"
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
          title="Editar botão"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </span>
      )}

      {/* Popover de edição */}
      {editMode && open && (
        <div ref={popRef} className="editable-btn-popover" onClick={e => e.stopPropagation()}>
          <div className="style-panel-label">TEXTO</div>
          <input
            className="edit-field-input"
            value={text}
            onChange={e => set('text', e.target.value)}
            placeholder="Texto do botão"
          />

          <div className="style-panel-label" style={{marginTop:10}}>LINK</div>
          <input
            className="edit-field-input"
            value={link}
            onChange={e => set('link', e.target.value)}
            placeholder="/pagina ou https://..."
          />

          <div className="style-panel-label" style={{marginTop:10}}>VARIANTE</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {VARIANTS.map(v => (
              <button
                key={v}
                className={'style-preset-btn' + (variant === v ? ' active' : '')}
                onClick={() => set('variant', v)}
                style={{ textTransform: 'capitalize' }}
              >
                {v}
              </button>
            ))}
          </div>

          <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <label style={{display:'flex',alignItems:'center',gap:6,fontFamily:'var(--font-mono)',fontSize:'0.65rem',color:'var(--muted)',textTransform:'uppercase',cursor:'pointer'}}>
              <input
                type="checkbox"
                checked={visible !== 'false'}
                onChange={e => set('visible', e.target.checked ? 'true' : 'false')}
                style={{accentColor:'var(--red)'}}
              />
              Visível
            </label>
            <button className="style-panel-reset" style={{width:'auto',padding:'4px 10px'}} onClick={() => setOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
