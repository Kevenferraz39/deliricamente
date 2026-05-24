import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { db } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { useEditMode } from '../context/EditModeContext';
import { EditableSection } from '../components/editor/EditableSection';
import { EditableText } from '../components/editor/EditableText';

export default function CustomPage() {
  const { slug } = useParams();
  const { loadPage } = useEditMode();
  const [page, setPage] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const pageId = 'custom_' + slug;

  React.useEffect(() => {
    setLoading(true);
    setPage(null);
    getDoc(doc(db, 'custom_pages', slug))
      .then(snap => { if (snap.exists()) setPage({ slug, ...snap.data() }); })
      .finally(() => setLoading(false));
    loadPage(pageId);
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mono" style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>// CARREGANDO...</div>
      </div>
    );
  }

  if (!page) return <Navigate to="/404" replace />;

  return (
    <div className="page-enter" style={{ minHeight: '100vh' }}>
      {/* Cabeçalho da página */}
      <EditableSection pageId={pageId} sectionId="header" label="Cabeçalho da Página">
        <section className="section tight" style={{ paddingTop: 112 }}>
          <div className="wrap">
            <div className="kicker">
              <EditableText pageId={pageId} contentKey="header.kicker" defaultValue="// Página" tag="span" />
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(3rem,8vw,8rem)', lineHeight: 0.88, margin: '8px 0 32px', textTransform: 'uppercase' }}>
              <EditableText pageId={pageId} contentKey="header.title" defaultValue={page.title.toUpperCase()} tag="span" styleKey="header.title" />
            </h1>
          </div>
        </section>
      </EditableSection>

      {/* Conteúdo principal — totalmente livre via BlockZone */}
      <EditableSection pageId={pageId} sectionId="content" label="Conteúdo">
        <section className="section tight" style={{ paddingTop: 0 }}>
          <div className="wrap" />
        </section>
      </EditableSection>
    </div>
  );
}
