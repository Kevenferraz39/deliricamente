import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Btn, Icon } from '../components';
// Segurança: importações disponíveis para futuras funcionalidades de edição
import { sanitizeText, validateDisplayName, validateEmail } from '../security/sanitize.js';

export default function UserProfilePage() {
  const { user, logout, comments, posts } = useApp();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/admin" replace />;

  // Comentários do usuário logado (filtra por nome ou e-mail)
  const myComments = Object.values(comments)
    .flat()
    .filter(c => c.name === user.name || c.email === user.email)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const relTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00');
    const diff = Date.now() - d.getTime();
    if (isNaN(diff)) return '';
    if (diff < 60000) return 'agora';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'min';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getPostTitle = (postId) => {
    const p = posts?.find(p => p.id === postId);
    return p?.title || postId;
  };

  return (
    <div className="page-enter" style={{ minHeight: '100vh' }}>
      <section className="section tight" style={{ paddingTop: 112, paddingBottom: 64 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>

          {/* Header */}
          <div className="kicker">// MEU PERFIL</div>
          <h1 style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', margin: '8px 0 40px', lineHeight: 0.9 }}>
            OLÁ, <span style={{ color: 'var(--red)' }}>{(user.name || 'USUÁRIO').split(' ')[0].toUpperCase()}</span>
          </h1>

          {/* Card de perfil */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48,
          }} className="profile-grid">

            {/* Identidade */}
            <div className="share-box" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h4>// IDENTIFICAÇÃO</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--red)', color: 'var(--black)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 28, flexShrink: 0,
                }}>
                  {(user.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', textTransform: 'uppercase' }}>
                    {user.name}
                  </div>
                  <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                    {user.email}
                  </div>
                  <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--red)', marginTop: 4, textTransform: 'uppercase' }}>
                    // {user.role || 'usuário'}
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="share-box" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h4>// ATIVIDADE</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'COMENTÁRIOS', val: myComments.length },
                  { label: 'POSTS LIDOS', val: posts?.length || 0 },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: 'var(--black)', border: '1px solid var(--line)', padding: '12px 16px' }}>
                    <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1, color: 'var(--off-white)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comentários */}
          <div style={{ marginBottom: 48 }}>
            <div className="kicker" style={{ marginBottom: 16 }}>// MEUS COMENTÁRIOS</div>
            {myComments.length === 0 ? (
              <div className="mono" style={{ color: 'var(--muted)', padding: '2rem', background: 'var(--panel)', border: '1px solid var(--line)', fontSize: '0.85rem' }}>
                Você ainda não fez nenhum comentário. Explore os posts e deixe a sua!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myComments.map((c, i) => (
                  <div key={i} style={{
                    background: 'var(--panel)', border: '1px solid var(--line)',
                    padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
                    cursor: 'pointer', transition: 'border-color 0.2s',
                  }}
                    onClick={() => navigate('/blog/' + c.postId)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                  >
                    <Icon.Comment style={{ flexShrink: 0, marginTop: 2, color: 'var(--red)', width: 14, height: 14 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>
                        {relTime(c.date)} · <span style={{ color: 'var(--off-white)' }}>{getPostTitle(c.postId)}</span>
                        {c.status === 'flagged' && (
                          <span style={{ marginLeft: 8, color: '#f59e0b', fontSize: '0.6rem' }}>// aguardando moderação</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: 1.5 }}>{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 24, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
            <Btn variant="ghost" arrow onClick={() => navigate('/blog')}>
              <Icon.Eye style={{ width: 14, height: 14 }} /> Ver posts
            </Btn>
            <Btn variant="ghost" onClick={() => { logout(); navigate('/'); }}>
              Sair da conta
            </Btn>
          </div>

        </div>
      </section>
    </div>
  );
}
