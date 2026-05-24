import React from 'react';
import { useEditMode } from '../../context/EditModeContext';

const TEMPLATES = [
  {
    type: 'text-block',
    label: 'Bloco de Texto',
    icon: '¶',
    description: 'Título + parágrafo de texto livre.',
    defaultContent: [
      { key: 'title', value: 'Novo Título' },
      { key: 'body',  value: 'Escreva o conteúdo desta seção aqui. Clique para editar.' },
    ],
  },
  {
    type: 'cta-banner',
    label: 'Banner CTA',
    icon: '→',
    description: 'Fundo colorido com chamada para ação.',
    defaultContent: [
      { key: 'title',    value: 'CHAMADA PARA AÇÃO' },
      { key: 'subtitle', value: 'Texto de apoio da seção.' },
      { key: 'cta',      value: 'Saiba Mais' },
      { key: 'link',     value: '/contato' },
    ],
  },
  {
    type: 'image-text',
    label: 'Imagem + Texto',
    icon: '⬜',
    description: 'Imagem à esquerda com título e texto à direita.',
    defaultContent: [
      { key: 'title',    value: 'Título da Seção' },
      { key: 'body',     value: 'Texto explicativo ao lado da imagem.' },
      { key: 'imageUrl', value: '' },
    ],
  },
  {
    type: 'quote',
    label: 'Citação',
    icon: '"',
    description: 'Citação ou frase de destaque em grande.',
    defaultContent: [
      { key: 'quote',  value: 'A quebrada cuidando da quebrada.' },
      { key: 'author', value: '— Deliricamente' },
    ],
  },
  {
    type: 'divider',
    label: 'Divisor',
    icon: '—',
    description: 'Separador visual entre seções.',
    defaultContent: [],
  },
  {
    type: 'video-embed',
    label: 'Vídeo',
    icon: '▶',
    description: 'Incorpora um vídeo do YouTube.',
    defaultContent: [
      { key: 'videoUrl', value: '' },
      { key: 'title',    value: 'Assista ao vídeo' },
    ],
  },
];

export function AddSectionModal() {
  const { editMode, addSectionTarget, setAddSectionTarget, addSection } = useEditMode();

  if (!editMode || !addSectionTarget) return null;

  const handleAdd = (template) => {
    addSection(addSectionTarget.pageId, template);
    setAddSectionTarget(null);
  };

  return (
    <div className="add-section-backdrop" onClick={() => setAddSectionTarget(null)}>
      <div className="add-section-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-section-header">
          <div>
            <div className="kicker" style={{ color: 'var(--muted)' }}>// EDITOR</div>
            <h3 style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.5rem' }}>
              Adicionar Seção
            </h3>
          </div>
          <button className="add-section-close" onClick={() => setAddSectionTarget(null)}>✕</button>
        </div>

        <div className="add-section-grid">
          {TEMPLATES.map((t) => (
            <button key={t.type} className="add-section-card" onClick={() => handleAdd(t)}>
              <div className="add-section-icon">{t.icon}</div>
              <div className="add-section-name">{t.label}</div>
              <div className="add-section-desc">{t.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
