import React from 'react';
import { useEditMode } from '../../context/EditModeContext';
import { EditableSection } from './EditableSection';
import { DynamicBlock } from './DynamicBlock';

/**
 * Renderiza todas as seções dinâmicas (criadas pelo admin via editor)
 * de uma página. Deve ser colocado no final de cada página.
 *
 * Seções nativas (sem `type`) são ignoradas — já estão no JSX da página.
 * Seções com `type` (ex: 'text-block', 'cta-banner') são renderizadas aqui.
 */
export function DynamicSectionsRenderer({ pageId }) {
  const { editMode, getSections, setAddSectionTarget } = useEditMode();
  const sections = getSections(pageId);
  const dynamic = sections.filter(s => s.type); // apenas seções criadas pelo editor

  if (!editMode && !dynamic.length) return null;

  if (!editMode) {
    return (
      <>
        {dynamic.filter(s => s.visible !== false).map(s => (
          <DynamicBlock key={s.id} pageId={pageId} section={s} />
        ))}
      </>
    );
  }

  return (
    <>
      {dynamic.map(s => (
        <EditableSection key={s.id} pageId={pageId} sectionId={s.id} label={s.label || s.type}>
          <DynamicBlock pageId={pageId} section={s} />
        </EditableSection>
      ))}

      {/* Botão para adicionar nova seção no final da página */}
      <div style={{ padding: '16px 24px' }}>
        <button
          className="bz-add-trigger"
          style={{ width: '100%', maxWidth: 800, margin: '0 auto', display: 'flex' }}
          onClick={() => setAddSectionTarget({ pageId, afterSectionId: null })}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Adicionar seção à página
        </button>
      </div>
    </>
  );
}
