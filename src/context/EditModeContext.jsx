import React from 'react';
import { db } from '../firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const EditModeContext = React.createContext(null);
export const useEditMode = () => React.useContext(EditModeContext);

// Seções padrão de cada página (fallback quando não há doc no Firestore)
export const PAGE_DEFAULT_SECTIONS = {
  home: [
    { id: 'hero',         label: 'Hero',          visible: true, order: 0 },
    { id: 'marquee',      label: 'Marquee',        visible: true, order: 1 },
    { id: 'latest-posts', label: 'Últimos Posts',  visible: true, order: 2 },
    { id: 'agc',          label: 'AGC',            visible: true, order: 3 },
    { id: 'agenda',       label: 'Agenda',         visible: true, order: 4 },
  ],
  blog: [
    { id: 'header', label: 'Cabeçalho', visible: true, order: 0 },
    { id: 'grid',   label: 'Posts',     visible: true, order: 1 },
  ],
  historia: [
    { id: 'header',   label: 'Cabeçalho', visible: true, order: 0 },
    { id: 'timeline', label: 'Timeline',  visible: true, order: 1 },
    { id: 'agc',      label: 'AGC',       visible: true, order: 2 },
    { id: 'members',  label: 'Membros',   visible: true, order: 3 },
  ],
  galeria: [
    { id: 'header', label: 'Cabeçalho', visible: true, order: 0 },
    { id: 'grid',   label: 'Galeria',   visible: true, order: 1 },
  ],
  loja: [
    { id: 'produtos', label: 'Produtos', visible: true, order: 0 },
  ],
  contato: [
    { id: 'form', label: 'Formulário',   visible: true, order: 0 },
    { id: 'info', label: 'Informações',  visible: true, order: 1 },
  ],
  musica: [
    { id: 'header',   label: 'Cabeçalho', visible: true, order: 0 },
    { id: 'playlist', label: 'Playlist',  visible: true, order: 1 },
    { id: 'artists',  label: 'Artistas',  visible: true, order: 2 },
  ],
};

const emptyPage = (pageId) => ({
  sections: PAGE_DEFAULT_SECTIONS[pageId] || [],
  content: {},
  styles: {},
});

export function EditModeProvider({ children }) {
  const [editMode, setEditMode] = React.useState(false);
  // configs: versão salva no Firestore (fonte da verdade após load)
  const [configs, setConfigs] = React.useState({});
  // pending: alterações não salvas (sobrepõem configs)
  const [pending, setPending] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  // qual painel de estilo está aberto { pageId, contentKey }
  const [styleTarget, setStyleTarget] = React.useState(null);
  // se o modal de adicionar seção está aberto
  const [addSectionTarget, setAddSectionTarget] = React.useState(null);

  // ── Carrega config da página do Firestore (lazy, uma vez por pageId) ──
  const loadPage = React.useCallback(async (pageId) => {
    if (configs[pageId] !== undefined) return;
    try {
      const snap = await getDoc(doc(db, 'pages', pageId));
      setConfigs(prev => ({
        ...prev,
        [pageId]: snap.exists() ? snap.data() : emptyPage(pageId),
      }));
    } catch {
      setConfigs(prev => ({ ...prev, [pageId]: emptyPage(pageId) }));
    }
  }, [configs]);

  // ── Config mesclada: salvo + pending ────────────────────────────────
  const getConfig = React.useCallback((pageId) => {
    const base = configs[pageId] || emptyPage(pageId);
    const p = pending[pageId] || {};
    return {
      sections: p.sections ?? base.sections,
      content:  { ...base.content,  ...(p.content  || {}) },
      styles:   { ...base.styles,   ...(p.styles   || {}) },
    };
  }, [configs, pending]);

  const getSections = React.useCallback((pageId) =>
    [...getConfig(pageId).sections].sort((a, b) => a.order - b.order),
  [getConfig]);

  const isSectionVisible = React.useCallback((pageId, sectionId) => {
    const s = getConfig(pageId).sections.find(s => s.id === sectionId);
    return s ? s.visible !== false : true;
  }, [getConfig]);

  const getContent = React.useCallback((pageId, key) =>
    getConfig(pageId).content[key],
  [getConfig]);

  const getStyle = React.useCallback((pageId, key) =>
    getConfig(pageId).styles[key] || {},
  [getConfig]);

  // ── Mutações (escrevem em pending) ──────────────────────────────────
  const _patchPending = (pageId, patch) => {
    setPending(prev => {
      const cur = prev[pageId] || {};
      return { ...prev, [pageId]: { ...cur, ...patch } };
    });
    setDirty(true);
  };

  const updateContent = React.useCallback((pageId, key, value) => {
    setPending(prev => {
      const cur = prev[pageId] || {};
      return { ...prev, [pageId]: { ...cur, content: { ...(cur.content || {}), [key]: value } } };
    });
    setDirty(true);
  }, []);

  const updateStyle = React.useCallback((pageId, key, styleObj) => {
    setPending(prev => {
      const cur = prev[pageId] || {};
      const existing = cur.styles || {};
      return { ...prev, [pageId]: { ...cur, styles: { ...existing, [key]: { ...(existing[key] || {}), ...styleObj } } } };
    });
    setDirty(true);
  }, []);

  const toggleSectionVisibility = React.useCallback((pageId, sectionId) => {
    const sections = getConfig(pageId).sections.map(s =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    _patchPending(pageId, { sections });
  }, [getConfig]);

  const moveSectionUp = React.useCallback((pageId, sectionId) => {
    const sorted = getSections(pageId);
    const idx = sorted.findIndex(s => s.id === sectionId);
    if (idx <= 0) return;
    const next = [...sorted];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    _patchPending(pageId, { sections: next.map((s, i) => ({ ...s, order: i })) });
  }, [getSections]);

  const moveSectionDown = React.useCallback((pageId, sectionId) => {
    const sorted = getSections(pageId);
    const idx = sorted.findIndex(s => s.id === sectionId);
    if (idx >= sorted.length - 1) return;
    const next = [...sorted];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    _patchPending(pageId, { sections: next.map((s, i) => ({ ...s, order: i })) });
  }, [getSections]);

  const deleteSection = React.useCallback((pageId, sectionId) => {
    const sections = getConfig(pageId).sections
      .filter(s => s.id !== sectionId)
      .map((s, i) => ({ ...s, order: i }));
    _patchPending(pageId, { sections });
  }, [getConfig]);

  const addSection = React.useCallback((pageId, template) => {
    const current = getConfig(pageId);
    const maxOrder = current.sections.reduce((m, s) => Math.max(m, s.order), -1);
    const uid = 'custom_' + Math.random().toString(36).slice(2, 8);
    const newSection = { id: uid, type: template.type, label: template.label, visible: true, order: maxOrder + 1 };
    // Conteúdo padrão do template
    const contentPatch = {};
    (template.defaultContent || []).forEach(({ key, value }) => {
      contentPatch[`${uid}.${key}`] = value;
    });
    setPending(prev => {
      const cur = prev[pageId] || {};
      return {
        ...prev,
        [pageId]: {
          ...cur,
          sections: [...(cur.sections ?? current.sections), newSection],
          content: { ...(cur.content || {}), ...contentPatch },
        },
      };
    });
    setDirty(true);
  }, [getConfig]);

  // ── Save all pending → Firestore ─────────────────────────────────────
  const saveAll = React.useCallback(async () => {
    setSaving(true);
    try {
      for (const [pageId, changes] of Object.entries(pending)) {
        if (!changes || !Object.keys(changes).length) continue;
        const base = configs[pageId] || emptyPage(pageId);
        const merged = {
          sections: changes.sections ?? base.sections,
          content:  { ...base.content,  ...(changes.content  || {}) },
          styles:   { ...base.styles,   ...(changes.styles   || {}) },
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'pages', pageId), merged);
        setConfigs(prev => ({ ...prev, [pageId]: { ...merged, updatedAt: new Date() } }));
      }
      setPending({});
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [pending, configs]);

  const discardAll = React.useCallback(() => {
    setPending({});
    setDirty(false);
  }, []);

  const toggleEditMode = React.useCallback(() => {
    if (editMode && dirty) {
      if (!window.confirm('Descartar alterações não salvas?')) return;
      discardAll();
    }
    setEditMode(e => !e);
    setStyleTarget(null);
  }, [editMode, dirty, discardAll]);

  const value = React.useMemo(() => ({
    editMode,
    toggleEditMode,
    loadPage,
    getSections,
    isSectionVisible,
    getContent,
    getStyle,
    updateContent,
    updateStyle,
    toggleSectionVisibility,
    moveSectionUp,
    moveSectionDown,
    deleteSection,
    addSection,
    saveAll,
    discardAll,
    saving,
    dirty,
    styleTarget,
    setStyleTarget,
    addSectionTarget,
    setAddSectionTarget,
  }), [
    editMode, toggleEditMode, loadPage, getSections, isSectionVisible,
    getContent, getStyle, updateContent, updateStyle, toggleSectionVisibility,
    moveSectionUp, moveSectionDown, deleteSection, addSection,
    saveAll, discardAll, saving, dirty, styleTarget, addSectionTarget,
  ]);

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}
