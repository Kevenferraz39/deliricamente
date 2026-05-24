import React from 'react';
import { useEditMode } from '../../context/EditModeContext';

export function EditableSection({ pageId, sectionId, label, children }) {
  const {
    editMode,
    isSectionVisible,
    toggleSectionVisibility,
    moveSectionUp,
    moveSectionDown,
    deleteSection,
    setAddSectionTarget,
  } = useEditMode();

  const visible = isSectionVisible(pageId, sectionId);

  if (!editMode && !visible) return null;
  if (!editMode) return <>{children}</>;

  const handleDelete = () => {
    if (window.confirm(`Remover seção "${label}"? Esta ação pode ser desfeita descartando as alterações.`)) {
      deleteSection(pageId, sectionId);
    }
  };

  return (
    <div className={'edit-section-wrapper' + (!visible ? ' edit-section-hidden' : '')}>
      <div className="edit-section-bar">
        <div className="edit-section-label">
          <span className="edit-section-icon">⠿</span>
          {label}
          {!visible && <span className="edit-section-badge-hidden">OCULTO</span>}
        </div>
        <div className="edit-section-actions">
          <button className="edit-btn" onClick={() => moveSectionUp(pageId, sectionId)} title="Mover para cima">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <button className="edit-btn" onClick={() => moveSectionDown(pageId, sectionId)} title="Mover para baixo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <button
            className={'edit-btn' + (!visible ? ' edit-btn-inactive' : '')}
            onClick={() => toggleSectionVisibility(pageId, sectionId)}
            title={visible ? 'Ocultar seção' : 'Mostrar seção'}
          >
            {visible
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
            }
          </button>
          <button
            className="edit-btn edit-btn-add"
            onClick={() => setAddSectionTarget({ pageId, afterSectionId: sectionId })}
            title="Adicionar seção abaixo"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <button className="edit-btn edit-btn-danger" onClick={handleDelete} title="Remover seção">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>

      {!visible && <div className="edit-section-overlay"><span>SEÇÃO OCULTA</span></div>}
      <div className={!visible ? 'edit-section-preview' : ''}>
        {children}
      </div>
    </div>
  );
}
