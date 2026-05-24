import React from 'react';
import { useEditMode } from '../../context/EditModeContext';

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

export function EditableImage({ pageId, contentKey, defaultSrc, alt = '', style, className, children }) {
  const { editMode, getContent, updateContent } = useEditMode();
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileRef = React.useRef(null);

  const src = getContent(pageId, contentKey) ?? defaultSrc;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Selecione uma imagem.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Máximo 8 MB.'); return; }
    setError('');
    setUploading(true);
    try {
      const url = await uploadImg(file);
      updateContent(pageId, contentKey, url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (!editMode) {
    if (children) return <>{children}</>;
    return src ? <img src={src} alt={alt} style={style} className={className} /> : null;
  }

  return (
    <span className="editable-image-root" style={{ position: 'relative', display: 'inline-block' }}>
      {children
        ? React.cloneElement(React.Children.only(children), {
            style: { ...children.props.style, cursor: 'pointer' },
            onClick: () => fileRef.current?.click(),
          })
        : src
          ? <img src={src} alt={alt} style={{ ...style, cursor: 'pointer' }} className={className} onClick={() => fileRef.current?.click()} />
          : <div className="editable-image-placeholder" onClick={() => fileRef.current?.click()} style={style} />
      }
      <div
        className="editable-image-overlay"
        onClick={() => fileRef.current?.click()}
        title="Trocar imagem"
      >
        {uploading
          ? <span className="edit-spinner">⟳</span>
          : <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <span>Trocar</span>
            </>
        }
      </div>
      {error && <div className="editable-image-error">{error}</div>}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </span>
  );
}
