import React from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase.js';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

/**
 * Modal de criação de nova página personalizada.
 * Props: onClose()
 */
export function NewPageModal({ onClose }) {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugEdited, setSlugEdited] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState('');

  // Gera slug automaticamente a partir do título
  React.useEffect(() => {
    if (!slugEdited && title) setSlug(slugify(title));
  }, [title, slugEdited]);

  const handleSlugChange = (e) => {
    setSlug(slugify(e.target.value));
    setSlugEdited(true);
  };

  const handleCreate = async () => {
    if (!title.trim()) { setError('Digite um título para a página.'); return; }
    if (!slug)         { setError('Digite um slug (URL) para a página.'); return; }

    // Verifica se o slug já existe
    const reserved = ['historia', 'blog', 'galeria', 'musica', 'loja', 'contato', 'perfil', 'admin', 'agenda', 'error'];
    if (reserved.includes(slug)) { setError(`"/${slug}" já é uma página do sistema.`); return; }

    setCreating(true);
    setError('');
    try {
      const ref = doc(db, 'custom_pages', slug);
      const existing = await getDoc(ref);
      if (existing.exists()) { setError(`A página "/${slug}" já existe.`); setCreating(false); return; }

      await setDoc(ref, {
        title: title.trim(),
        slug,
        createdAt: serverTimestamp(),
        navVisible: false,
      });

      onClose();
      navigate('/' + slug);
    } catch (e) {
      setError('Erro ao criar página: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="np-backdrop" onClick={onClose}>
      <div className="np-modal" onClick={e => e.stopPropagation()}>
        <div className="np-header">
          <div>
            <div className="kicker" style={{ color: 'var(--muted)' }}>// EDITOR</div>
            <h3 style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.4rem' }}>
              Nova Página
            </h3>
          </div>
          <button className="add-section-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Título */}
          <div>
            <label className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Título da página
            </label>
            <input
              className="bz-input"
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Sobre o Projeto, Vídeos, Fotos 2024..."
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {/* Slug / URL */}
          <div>
            <label className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              URL da página
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRight: 'none', padding: '7px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)', flexShrink: 0 }}>
                deliricamente.com/
              </span>
              <input
                className="bz-input"
                value={slug}
                onChange={handleSlugChange}
                placeholder="minha-pagina"
                style={{ borderRadius: 0 }}
              />
            </div>
            <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: 4 }}>
              Apenas letras minúsculas, números e hífens. Gerado automaticamente pelo título.
            </div>
          </div>

          {error && (
            <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--red)', background: 'rgba(225,6,0,0.06)', border: '1px solid rgba(225,6,0,0.2)', padding: '8px 12px' }}>
              {error}
            </div>
          )}

          {/* Preview */}
          {slug && (
            <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', padding: '12px 16px' }}>
              <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>PÁGINA SERÁ CRIADA EM:</div>
              <div className="mono" style={{ color: '#0ea5e9' }}>/{slug}</div>
              <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--muted)' }}>
                Você será redirecionado para a nova página onde poderá adicionar vídeos, imagens, textos e botões usando o editor.
              </div>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button
              className="edit-bar-btn edit-bar-btn-save"
              style={{ flex: 1, justifyContent: 'center', padding: '10px 20px' }}
              onClick={handleCreate}
              disabled={creating || !title || !slug}
            >
              {creating ? '⟳ Criando…' : 'Criar página →'}
            </button>
            <button className="edit-bar-btn" onClick={onClose} disabled={creating}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
