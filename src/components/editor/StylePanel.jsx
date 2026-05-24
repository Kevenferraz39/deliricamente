import React from 'react';
import { useEditMode } from '../../context/EditModeContext';

const COLOR_PRESETS = [
  { label: 'Off-white', value: '#F4F8EB' },
  { label: 'Vermelho',  value: '#E10600' },
  { label: 'Preto',     value: '#0A0A0A' },
  { label: 'Cinza',     value: '#888888' },
  { label: 'Branco',    value: '#FFFFFF' },
  { label: 'Roxo',      value: '#7c3aed' },
  { label: 'Azul',      value: '#0ea5e9' },
  { label: 'Verde',     value: '#16a34a' },
  { label: 'Âmbar',     value: '#d97706' },
];

const FONT_SIZE_PRESETS = [
  { label: 'XS',   value: '0.75rem' },
  { label: 'SM',   value: '0.875rem' },
  { label: 'Base', value: '1rem' },
  { label: 'LG',   value: '1.25rem' },
  { label: 'XL',   value: '1.5rem' },
  { label: '2XL',  value: '2rem' },
  { label: '3XL',  value: '3rem' },
  { label: '4XL',  value: 'clamp(2rem,5vw,4rem)' },
  { label: '5XL',  value: 'clamp(3rem,8vw,7rem)' },
  { label: 'Hero', value: 'clamp(4rem,12vw,14rem)' },
];

export function StylePanel() {
  const { editMode, styleTarget, setStyleTarget, getStyle, updateStyle } = useEditMode();

  if (!editMode || !styleTarget) return null;

  const { pageId, contentKey } = styleTarget;
  const current = getStyle(pageId, contentKey) || {};

  const set = (prop, val) => updateStyle(pageId, contentKey, { [prop]: val });
  const toggle = (prop, a, b) => set(prop, current[prop] === a ? b : a);

  return (
    <div className="style-panel" onClick={(e) => e.stopPropagation()}>
      <div className="style-panel-header">
        <span className="mono" style={{ fontSize: '0.7rem' }}>// ESTILO · {contentKey}</span>
        <button className="style-panel-close" onClick={() => setStyleTarget(null)}>✕</button>
      </div>

      {/* Tamanho */}
      <div className="style-panel-section">
        <div className="style-panel-label">TAMANHO</div>
        <div className="style-panel-row">
          {FONT_SIZE_PRESETS.map(p => (
            <button
              key={p.label}
              className={'style-preset-btn' + (current.fontSize === p.value ? ' active' : '')}
              onClick={() => set('fontSize', p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cor */}
      <div className="style-panel-section">
        <div className="style-panel-label">COR</div>
        <div className="style-panel-colors">
          {COLOR_PRESETS.map(c => (
            <button
              key={c.value}
              className={'style-color-swatch' + (current.color === c.value ? ' active' : '')}
              style={{ background: c.value, border: c.value === '#FFFFFF' || c.value === '#F4F8EB' ? '1px solid #444' : 'none' }}
              title={c.label}
              onClick={() => set('color', c.value)}
            />
          ))}
          <input
            type="color"
            value={current.color || '#F4F8EB'}
            onChange={(e) => set('color', e.target.value)}
            title="Cor personalizada"
            style={{ width: 28, height: 28, border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 2, background: 'transparent' }}
          />
        </div>
      </div>

      {/* Formatação */}
      <div className="style-panel-section">
        <div className="style-panel-label">FORMATAÇÃO</div>
        <div className="style-panel-row">
          <button
            className={'style-preset-btn' + (current.fontWeight === 'bold' ? ' active' : '')}
            onClick={() => toggle('fontWeight', 'bold', 'normal')}
            style={{ fontWeight: 'bold' }}
          >
            <b>B</b>
          </button>
          <button
            className={'style-preset-btn' + (current.fontStyle === 'italic' ? ' active' : '')}
            onClick={() => toggle('fontStyle', 'italic', 'normal')}
            style={{ fontStyle: 'italic' }}
          >
            <i>I</i>
          </button>
          <button
            className={'style-preset-btn' + (current.textTransform === 'uppercase' ? ' active' : '')}
            onClick={() => toggle('textTransform', 'uppercase', 'none')}
          >
            AA
          </button>
          <button
            className={'style-preset-btn' + (current.textAlign === 'center' ? ' active' : '')}
            onClick={() => toggle('textAlign', 'center', 'left')}
          >
            ≡
          </button>
        </div>
      </div>

      <button
        className="style-panel-reset"
        onClick={() => updateStyle(pageId, contentKey, {})}
      >
        Redefinir estilo
      </button>
    </div>
  );
}
