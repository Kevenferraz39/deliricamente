import React from 'react';
import { useEditMode } from '../../context/EditModeContext';

/**
 * Grid de cards editável — adiciona, remove e edita cards inline.
 *
 * schema: [{ key, label, type: 'text'|'multiline', style, className, tag }]
 * defaultCards: [{ id, ...fields }]
 */
export function EditableCardGrid({
  pageId,
  gridKey,
  defaultCards = [],
  schema = [],
  columns = 3,
  cardClassName = 'collective',
  cardStyle = {},
  gridStyle = {},
}) {
  const { editMode, getContent, updateContent } = useEditMode();

  // Carrega do page config (JSON) ou usa defaults com IDs estáveis
  const stored = getContent(pageId, `${gridKey}.__cards`);
  const cards = React.useMemo(() => {
    if (stored) { try { return JSON.parse(stored); } catch {} }
    return defaultCards.map((c, i) => ({ id: c.id || `default_${i}`, ...c }));
  }, [stored, defaultCards]);

  const save = (newCards) =>
    updateContent(pageId, `${gridKey}.__cards`, JSON.stringify(newCards));

  const updateField = (cardId, field, value) =>
    save(cards.map(c => c.id === cardId ? { ...c, [field]: value } : c));

  const addCard = () => {
    const blank = Object.fromEntries(schema.map(f => [f.key, f.placeholder || '']));
    save([...cards, { id: 'card_' + Date.now(), ...blank }]);
  };

  const removeCard = (cardId) =>
    save(cards.filter(c => c.id !== cardId));

  const moveCard = (cardId, dir) => {
    const idx = cards.findIndex(c => c.id === cardId);
    if (idx < 0) return;
    const next = [...cards];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    save(next);
  };

  const gridCols = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: 24,
    ...gridStyle,
  };

  if (!editMode) {
    return (
      <div style={gridCols}>
        {cards.map((card) => (
          <div key={card.id} className={cardClassName} style={cardStyle}>
            {schema.map(f => {
              const Tag = f.tag || (f.type === 'multiline' ? 'p' : 'div');
              return (
                <Tag key={f.key} className={f.className} style={f.style}>
                  {card[f.key] || ''}
                </Tag>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────
  return (
    <div style={gridCols} className="edit-card-grid-root">
      {cards.map((card, idx) => (
        <div key={card.id} className="edit-card-wrapper">
          {/* Card toolbar */}
          <div className="edit-card-bar">
            <button className="edit-btn" style={{width:24,height:24}} onClick={() => moveCard(card.id, -1)} title="Mover esquerda">‹</button>
            <button className="edit-btn" style={{width:24,height:24}} onClick={() => moveCard(card.id,  1)} title="Mover direita">›</button>
            <span className="mono" style={{fontSize:'0.6rem',color:'var(--muted)',flex:1,paddingLeft:6}}>card {idx+1}/{cards.length}</span>
            <button
              className="edit-btn edit-btn-danger"
              style={{width:24,height:24}}
              onClick={() => { if (window.confirm('Remover este card?')) removeCard(card.id); }}
              title="Remover card"
            >✕</button>
          </div>

          {/* Card content — contentEditable por campo */}
          <div className={cardClassName} style={{...cardStyle, outline:'1px dashed rgba(225,6,0,0.4)'}}>
            {schema.map(f => {
              const Tag = f.tag || (f.type === 'multiline' ? 'p' : 'div');
              return (
                <Tag
                  key={f.key}
                  contentEditable
                  suppressContentEditableWarning
                  className={(f.className || '') + ' editable-text'}
                  style={{...f.style, cursor:'text'}}
                  onBlur={(e) => updateField(card.id, f.key, e.target.innerText.trim())}
                  onKeyDown={(e) => {
                    if (f.type !== 'multiline' && e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
                    if (e.key === 'Escape') { e.target.innerText = card[f.key] || ''; e.target.blur(); }
                  }}
                >
                  {card[f.key] || f.placeholder || ''}
                </Tag>
              );
            })}
          </div>
        </div>
      ))}

      {/* Botão adicionar card */}
      <button className="edit-card-add" onClick={addCard}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M12 5v14M5 12h14"/></svg>
        Adicionar card
      </button>
    </div>
  );
}
