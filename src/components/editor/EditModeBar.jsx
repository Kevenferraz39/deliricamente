import React from 'react';
import { useLocation } from 'react-router-dom';
import { useEditMode } from '../../context/EditModeContext';
import { useApp } from '../../context/AppContext';
import { NewPageModal } from './NewPageModal';

const PAGE_LABELS = {
  '/':         'Início',
  '/blog':     'Blog',
  '/historia': 'História',
  '/galeria':  'Galeria',
  '/musica':   'Música',
  '/loja':     'Loja',
  '/contato':  'Contato',
};

const isAdminUser = (u) => u && (u.isMaster || u.role === 'admin' || u.role === 'admin_master');

export function EditModeBar() {
  const { user } = useApp();
  const { editMode, toggleEditMode, saveAll, discardAll, dirty, saving, setAddSectionTarget } = useEditMode();
  const location = useLocation();
  const [newPageOpen, setNewPageOpen] = React.useState(false);

  if (!isAdminUser(user)) return null;
  if (location.pathname.startsWith('/admin')) return null;

  const pageId = Object.keys(PAGE_LABELS).find(k => k === location.pathname) ||
                 Object.keys(PAGE_LABELS).find(k => k !== '/' && location.pathname.startsWith(k)) ||
                 null;
  const pageLabel = pageId ? PAGE_LABELS[pageId] : null;

  if (!editMode) {
    return (
      <div className="edit-fab-group">
        <button className="edit-fab" onClick={toggleEditMode} title="Ativar modo de edição">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>Editar site</span>
        </button>
        <button
          className="edit-fab edit-fab-new-page"
          onClick={() => setNewPageOpen(true)}
          title="Criar nova página"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15h6"/></svg>
          <span>Nova página</span>
        </button>
        {newPageOpen && <NewPageModal onClose={() => setNewPageOpen(false)} />}
      </div>
    );
  }

  return (
    <>
      {/* Barra de edição fixada no rodapé */}
      <div className="edit-mode-bar">
        <div className="edit-mode-bar-left">
          <div className="edit-mode-indicator">
            <span className="edit-mode-dot" />
            EDITANDO
          </div>
          {pageLabel && (
            <span className="mono edit-mode-page">// {pageLabel.toUpperCase()}</span>
          )}
          {dirty && <span className="edit-mode-unsaved">● não salvo</span>}
        </div>

        <div className="edit-mode-bar-center">
          {pageId && (
            <button
              className="edit-bar-btn edit-bar-btn-add"
              onClick={() => setAddSectionTarget({ pageId, afterSectionId: null })}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
              Adicionar seção
            </button>
          )}
        </div>

        <div className="edit-mode-bar-right">
          <button
            className="edit-bar-btn edit-bar-btn-discard"
            onClick={discardAll}
            disabled={!dirty || saving}
          >
            Descartar
          </button>
          <button
            className="edit-bar-btn edit-bar-btn-save"
            onClick={saveAll}
            disabled={!dirty || saving}
          >
            {saving
              ? <><span className="edit-spinner-small">⟳</span> Salvando…</>
              : <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Salvar
                </>
            }
          </button>
          <button
            className="edit-bar-btn"
            onClick={() => setNewPageOpen(true)}
            title="Criar nova página personalizada"
            style={{ borderColor: 'rgba(22,163,74,0.4)', color: '#16a34a' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15h6"/></svg>
            Nova página
          </button>
          <button className="edit-bar-btn edit-bar-btn-exit" onClick={toggleEditMode}>
            Sair da edição
          </button>
        </div>
      </div>

      {newPageOpen && <NewPageModal onClose={() => setNewPageOpen(false)} />}

      {/* Dica de uso (aparece uma vez) */}
      <div className="edit-mode-tip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        Clique em qualquer texto para editar · Clique em imagens para trocar · Use os controles de cada seção para mover ou ocultar
      </div>
    </>
  );
}
