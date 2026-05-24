import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Btn, Icon } from '../components';
import { sanitizeText, validateDisplayName } from '../security/sanitize.js';

const AVATAR_COLORS = ['#E10600', '#7c3aed', '#0ea5e9', '#16a34a', '#d97706', '#db2777'];

const uploadImg = async (file) => {
  const key = import.meta.env.VITE_IMGBB_KEY;
  if (!key || key === 'SUA_CHAVE_IMGBB_AQUI') throw new Error('Configure VITE_IMGBB_KEY no .env');
  const form = new FormData();
  form.append('image', file);
  form.append('key', key);
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Upload falhou');
  return json.data.url;
};

function Avatar({ url, color, name, size = 64, children }) {
  const letter = (name || '?')[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: url ? 'transparent' : (color || '#E10600'),
      flexShrink: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {url
        ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <span style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.43, color: '#fff', lineHeight: 1 }}>{letter}</span>
      }
      {children}
    </div>
  );
}

export default function UserProfilePage() {
  const { user, logout, comments, posts, updateProfile } = useApp();
  const navigate = useNavigate();

  const [editing, setEditing] = React.useState(false);
  const [nameInput, setNameInput] = React.useState('');
  const [colorInput, setColorInput] = React.useState('');
  const [avatarUrlInput, setAvatarUrlInput] = React.useState(undefined);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const fileRef = React.useRef(null);

  if (!user) return <Navigate to="/admin" replace />;

  const avatarColor = user.avatarColor || '#E10600';
  const avatarUrl = user.avatarUrl || null;

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

  const handleEditStart = () => {
    setNameInput(user.name || '');
    setColorInput(avatarColor);
    setAvatarUrlInput(undefined);
    setNameError('');
    setUploadError('');
    setSaved(false);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setNameError('');
    setUploadError('');
    setAvatarUrlInput(undefined);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Selecione uma imagem.'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Imagem muito grande. Máximo 5 MB.'); return; }

    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadImg(file);
      setAvatarUrlInput(url);
    } catch (err) {
      setUploadError(err.message || 'Erro no upload.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrlInput(null);
    setUploadError('');
  };

  const handleSave = async () => {
    const trimmed = sanitizeText(nameInput, 50);
    const { valid, error } = validateDisplayName(trimmed);
    if (!valid) { setNameError(error); return; }

    setSaving(true);
    try {
      await updateProfile(trimmed, colorInput, avatarUrlInput);
      setSaved(true);
      setEditing(false);
    } catch {
      setNameError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // Foto a exibir no modo edição: prioriza a nova (avatarUrlInput), depois a atual
  const previewUrl = avatarUrlInput !== undefined ? avatarUrlInput : avatarUrl;

  return (
    <div className="page-enter" style={{ minHeight: '100vh' }}>
      <section className="section tight" style={{ paddingTop: 112, paddingBottom: 64 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>

          <div className="kicker">// MEU PERFIL</div>
          <h1 style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', margin: '8px 0 40px', lineHeight: 0.9 }}>
            OLÁ, <span style={{ color: 'var(--red)' }}>{(user.name || 'USUÁRIO').split(' ')[0].toUpperCase()}</span>
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }} className="profile-grid">

            {/* Identificação */}
            <div className="share-box" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>// IDENTIFICAÇÃO</h4>
                {!editing && (
                  <button
                    onClick={handleEditStart}
                    style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'border-color 0.2s, color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--muted)'; }}
                  >
                    Editar
                  </button>
                )}
              </div>

              {saved && !editing && (
                <div className="mono" style={{ fontSize: '0.7rem', color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', padding: '6px 12px' }}>
                  // Perfil atualizado com sucesso
                </div>
              )}

              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Área do avatar com botão de upload */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar url={previewUrl} color={colorInput} name={nameInput || user.name} size={72} />
                      {/* Overlay de câmera */}
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        title="Mudar foto"
                        style={{
                          position: 'absolute', inset: 0, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.55)', border: 'none', cursor: uploading ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                      >
                        {uploading
                          ? <span style={{ color: '#fff', fontSize: 18 }}>⟳</span>
                          : <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" width="22" height="22"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        }
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--off-white)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '5px 12px', cursor: uploading ? 'wait' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}
                      >
                        {uploading ? 'Enviando…' : 'Mudar foto'}
                      </button>
                      {(previewUrl || avatarUrl) && (
                        <button
                          onClick={handleRemovePhoto}
                          style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '5px 12px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                          Remover foto
                        </button>
                      )}
                    </div>
                  </div>

                  {uploadError && (
                    <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--red)' }}>{uploadError}</div>
                  )}

                  {/* Cor do avatar (quando sem foto) */}
                  {!previewUrl && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Cor (sem foto)</div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {AVATAR_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setColorInput(color)}
                            style={{
                              width: 28, height: 28, borderRadius: '50%', background: color, padding: 0,
                              border: colorInput === color ? '3px solid var(--off-white)' : '3px solid transparent',
                              outline: colorInput === color ? '2px solid ' + color : 'none',
                              outlineOffset: 2, cursor: 'pointer', transition: 'border 0.15s, outline 0.15s',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nome */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                      Nome de exibição
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                      maxLength={50}
                      autoFocus
                      style={{
                        background: 'var(--black)', border: '1px solid ' + (nameError ? 'var(--red)' : 'var(--line)'),
                        color: 'var(--off-white)', fontFamily: 'var(--font-body)', fontSize: '1rem',
                        padding: '10px 14px', outline: 'none', width: '100%', boxSizing: 'border-box',
                      }}
                      onFocus={e => { if (!nameError) e.currentTarget.style.borderColor = 'var(--red)'; }}
                      onBlur={e => { if (!nameError) e.currentTarget.style.borderColor = 'var(--line)'; }}
                      onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                    />
                    {nameError && (
                      <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--red)' }}>{nameError}</div>
                    )}
                    <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'right' }}>{nameInput.length}/50</div>
                  </div>

                  {/* Botões */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Btn onClick={handleSave} disabled={saving || uploading} style={{ flex: 1 }}>
                      {saving ? 'Salvando…' : 'Salvar'}
                    </Btn>
                    <Btn variant="ghost" onClick={handleCancel} disabled={saving}>
                      Cancelar
                    </Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar url={avatarUrl} color={avatarColor} name={user.name} size={64} />
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
              )}
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
