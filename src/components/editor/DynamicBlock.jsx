import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditMode } from '../../context/EditModeContext';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';

// Renderiza seções adicionadas dinamicamente pelo editor
export function DynamicBlock({ pageId, section }) {
  const { getContent } = useEditMode();
  const navigate = useNavigate();
  const { id, type } = section;

  const c = (key) => getContent(pageId, `${id}.${key}`);

  switch (type) {

    case 'text-block':
      return (
        <section className="section">
          <div className="wrap">
            <EditableText pageId={pageId} contentKey={`${id}.title`} defaultValue="Novo Título"
              tag="h2" className="display" styleKey={`${id}.title`}
              style={{ textTransform: 'uppercase', marginBottom: 24 }} />
            <EditableText pageId={pageId} contentKey={`${id}.body`} defaultValue="Escreva aqui..."
              tag="p" styleKey={`${id}.body`} multiline
              style={{ maxWidth: 680, lineHeight: 1.7 }} />
          </div>
        </section>
      );

    case 'cta-banner':
      return (
        <section style={{ background: 'var(--red)', padding: '80px 0', textAlign: 'center' }}>
          <div className="wrap">
            <EditableText pageId={pageId} contentKey={`${id}.title`} defaultValue="CHAMADA PARA AÇÃO"
              tag="h2" className="display" styleKey={`${id}.title`}
              style={{ color: '#fff', fontSize: 'clamp(2rem,5vw,4rem)', textTransform: 'uppercase', marginBottom: 16 }} />
            <EditableText pageId={pageId} contentKey={`${id}.subtitle`} defaultValue="Texto de apoio."
              tag="p" styleKey={`${id}.subtitle`}
              style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }} />
            <button
              className="btn btn-ghost"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
              onClick={() => { const link = c('link'); if (link) navigate(link); }}
            >
              <EditableText pageId={pageId} contentKey={`${id}.cta`} defaultValue="Saiba Mais" tag="span" />
              {' →'}
            </button>
          </div>
        </section>
      );

    case 'image-text':
      return (
        <section className="section">
          <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <EditableImage pageId={pageId} contentKey={`${id}.imageUrl`} alt="Imagem da seção"
              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
            <div>
              <EditableText pageId={pageId} contentKey={`${id}.title`} defaultValue="Título da Seção"
                tag="h2" className="display" styleKey={`${id}.title`}
                style={{ textTransform: 'uppercase', marginBottom: 20 }} />
              <EditableText pageId={pageId} contentKey={`${id}.body`} defaultValue="Texto explicativo..."
                tag="p" styleKey={`${id}.body`} multiline
                style={{ lineHeight: 1.7 }} />
            </div>
          </div>
        </section>
      );

    case 'quote':
      return (
        <section className="section" style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="wrap" style={{ maxWidth: 760 }}>
            <div style={{ fontSize: '5rem', color: 'var(--red)', lineHeight: 0.5, marginBottom: 16, fontFamily: 'Georgia, serif' }}>"</div>
            <EditableText pageId={pageId} contentKey={`${id}.quote`} defaultValue="A quebrada cuidando da quebrada."
              tag="blockquote" styleKey={`${id}.quote`}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,3rem)', textTransform: 'uppercase', margin: '0 0 24px', lineHeight: 1.1 }} />
            <EditableText pageId={pageId} contentKey={`${id}.author`} defaultValue="— Deliricamente"
              tag="cite" styleKey={`${id}.author`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'normal' }} />
          </div>
        </section>
      );

    case 'divider':
      return (
        <div style={{ padding: '40px 0' }}>
          <div className="wrap">
            <div style={{ borderTop: '1px solid var(--line)' }} />
          </div>
        </div>
      );

    case 'video-embed': {
      const url = c('videoUrl') || '';
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/);
      const ytId = ytMatch ? ytMatch[1] : null;
      return (
        <section className="section">
          <div className="wrap">
            <EditableText pageId={pageId} contentKey={`${id}.title`} defaultValue="Assista ao vídeo"
              tag="h3" styleKey={`${id}.title`}
              style={{ textTransform: 'uppercase', marginBottom: 24 }} />
            {ytId
              ? <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title="Vídeo"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              : <div style={{ background: 'var(--panel)', border: '1px dashed var(--line)', padding: '40px', textAlign: 'center' }}>
                  <p className="mono" style={{ color: 'var(--muted)' }}>Cole a URL do YouTube no campo de conteúdo para exibir o vídeo.</p>
                  <EditableText pageId={pageId} contentKey={`${id}.videoUrl`} defaultValue=""
                    tag="p" style={{ color: 'var(--off-white)', marginTop: 12 }} />
                </div>
            }
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
