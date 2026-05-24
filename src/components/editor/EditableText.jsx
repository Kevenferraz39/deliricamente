import React from 'react';
import { useEditMode } from '../../context/EditModeContext';

export function EditableText({
  pageId,
  contentKey,
  defaultValue = '',
  tag: Tag = 'span',
  className = '',
  style = {},
  styleKey,
  multiline = false,
}) {
  const { editMode, getContent, getStyle, updateContent, setStyleTarget } = useEditMode();
  const ref = React.useRef(null);
  const [focused, setFocused] = React.useState(false);

  const saved = getContent(pageId, contentKey);
  const value = saved !== undefined ? saved : defaultValue;
  const customStyle = styleKey ? (getStyle(pageId, styleKey) || {}) : {};
  const mergedStyle = { ...style, ...customStyle };

  // Sincroniza o DOM quando o valor muda externamente (ex: discard)
  React.useEffect(() => {
    if (ref.current && !focused) {
      ref.current.innerText = value;
    }
  }, [value, focused]);

  if (!editMode) {
    return <Tag className={className} style={mergedStyle}>{value}</Tag>;
  }

  const handleBlur = (e) => {
    setFocused(false);
    const text = e.target.innerText.trim();
    if (text !== value) updateContent(pageId, contentKey, text);
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === 'Escape') {
      ref.current.innerText = value;
      ref.current?.blur();
    }
  };

  return (
    <span className="editable-text-root" style={{ position: 'relative', display: 'contents' }}>
      <Tag
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={className + ' editable-text'}
        style={mergedStyle}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        suppressHydrationWarning
      >
        {value}
      </Tag>
      {styleKey && (
        <button
          className="editable-text-style-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            setStyleTarget({ pageId, contentKey: styleKey });
          }}
          title="Estilo do texto"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
        </button>
      )}
    </span>
  );
}
