import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase.js';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { AGENDA } from '../data.jsx';
import { Btn, Splatter } from '../components.jsx';

const TIPO_COLORS = {
  Festival: 'var(--red)',
  Show:     '#7c3aed',
  Batalha:  '#0ea5e9',
  Oficina:  '#16a34a',
  Cultura:  '#d97706',
  Outro:    'var(--muted)',
};

function ytId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function isDirectVideo(url) {
  if (!url) return false;
  // Firebase Storage ou qualquer URL de arquivo de vídeo direto
  return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url) || url.includes('firebasestorage.googleapis.com');
}

export default function EventoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const ref = doc(db, 'agenda', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setEvento({ id: snap.id, ...snap.data() });
        } else {
          // fallback para seed data
          const seed = AGENDA.find(a => a.id === id);
          setEvento(seed || null);
        }
      } catch {
        const seed = AGENDA.find(a => a.id === id);
        setEvento(seed || null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--gray)', borderTopColor: 'var(--red)', animation: 'spin 0.9s linear infinite' }} />
          <div className="mono" style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>// CARREGANDO EVENTO...</div>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap">
          <div className="kicker">// EVENTO NÃO ENCONTRADO</div>
          <h1 style={{ color: 'var(--red)', margin: '12px 0 24px' }}>404</h1>
          <Btn variant="red" arrow onClick={() => navigate('/')}>Voltar ao início</Btn>
        </div>
      </div>
    );
  }

  const cor = TIPO_COLORS[evento.tipo] || 'var(--red)';
  const videoYtId = ytId(evento.videoUrl);
  const videoIsDirect = !videoYtId && isDirectVideo(evento.videoUrl);
  const hasMedia = evento.imageUrl || videoYtId || videoIsDirect;

  return (
    <div className="page-enter">
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: hasMedia ? 'clamp(340px, 55vh, 560px)' : 180, display: 'flex', alignItems: 'flex-end', overflow: 'hidden', paddingTop: 112 }}>
        {/* Fundo com imagem ou cor */}
        {evento.imageUrl && (
          <>
            <img src={evento.imageUrl} alt={evento.title} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.35)', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--black) 20%, transparent 80%)', zIndex: 1 }} />
          </>
        )}
        {!evento.imageUrl && <Splatter color={cor} opacity={0.06} />}

        <div className="wrap" style={{ position: 'relative', zIndex: 2, paddingBottom: 48, paddingTop: 48 }}>
          <a className="mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', cursor: 'pointer', display: 'inline-block', marginBottom: 20 }} onClick={() => navigate(-1)}>
            ← Voltar
          </a>

          {/* Badge tipo */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cor + '22', border: `1px solid ${cor}55`, padding: '4px 12px', marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cor, display: 'inline-block' }} />
            <span className="mono" style={{ fontSize: '0.7rem', color: cor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{evento.tipo}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', lineHeight: 0.92, margin: '0 0 24px', textTransform: 'uppercase', color: 'var(--off-white)' }}>
            {evento.title}
          </h1>

          {/* Info rápida */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: cor, fontSize: 16 }}>📅</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1, color: 'var(--off-white)' }}>
                  {evento.dia} {evento.mes} {evento.ano}
                </div>
                {evento.time && (
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>
                    {evento.time}{evento.timeEnd ? ` → ${evento.timeEnd}` : ''}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: cor, fontSize: 16 }}>📍</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--off-white)' }}>{evento.local}</div>
                {evento.endereco && (
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>{evento.endereco}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="section tight" style={{ paddingTop: 0, paddingBottom: 64 }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40, maxWidth: 860 }}>

          {/* Imagem principal (se não usou como hero) ou Vídeo */}
          {/* Vídeo YouTube */}
          {videoYtId && (
            <div style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoYtId}`}
                  title={evento.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Vídeo direto (Firebase Storage / MP4) */}
          {videoIsDirect && (
            <div style={{ border: '1px solid var(--line)', overflow: 'hidden', background: '#000' }}>
              <video
                src={evento.videoUrl}
                controls
                playsInline
                style={{ width: '100%', maxHeight: 480, display: 'block' }}
              >
                Seu navegador não suporta vídeo HTML5.
              </video>
            </div>
          )}

          {/* Imagem (quando não há vídeo) */}
          {evento.imageUrl && !videoYtId && !videoIsDirect && (
            <img src={evento.imageUrl} alt={evento.title} style={{ width: '100%', maxHeight: 480, objectFit: 'cover', border: '1px solid var(--line)' }} />
          )}

          {/* Descrição */}
          {evento.description && (
            <div>
              <div className="kicker" style={{ marginBottom: 16 }}>// SOBRE O EVENTO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {evento.description.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} style={{ margin: 0, color: 'var(--text-body)', fontSize: '1.05rem', lineHeight: 1.75 }}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Localização */}
          {evento.endereco && (
            <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="mono" style={{ fontSize: '0.7rem', color: cor }}>// LOCALIZAÇÃO</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase' }}>{evento.local}</div>
              <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{evento.endereco}</div>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(evento.endereco)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ alignSelf: 'flex-start', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: cor, textDecoration: 'none' }}
              >
                Abrir no Google Maps →
              </a>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
            <Btn variant="ghost" onClick={() => navigate(-1)}>← Voltar</Btn>
            <Btn variant="ghost" onClick={() => navigate('/contato')}>Booking / Contato →</Btn>
          </div>
        </div>
      </section>
    </div>
  );
}
