import React from 'react';
import { useEditMode } from '../../context/EditModeContext';
import { LinkPicker } from './LinkPicker';

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

// ── Tipos de bloco ──────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { type: 'heading',   icon: 'H',  label: 'Título',           desc: 'Cabeçalho em qualquer tamanho e cor' },
  { type: 'text',      icon: '¶',  label: 'Texto',            desc: 'Parágrafo de texto livre' },
  { type: 'card-grid', icon: '⊞',  label: 'Cards',            desc: 'Grid de cards configuráveis (imagem, tag, título, texto, botão)' },
  { type: 'button',    icon: '→',  label: 'Botão',            desc: 'Botão com texto e link' },
  { type: 'btn-row',   icon: '⇒',  label: 'Linha de Botões',  desc: 'Vários botões lado a lado' },
  { type: 'image',     icon: '⬜', label: 'Imagem',           desc: 'Foto ou banner com upload' },
  { type: 'divider',   icon: '—',  label: 'Divisor',          desc: 'Linha separadora' },
  { type: 'spacer',    icon: '↕',  label: 'Espaço',           desc: 'Espaço em branco ajustável' },
  { type: 'kicker',    icon: '//', label: 'Kicker',           desc: 'Label pequeno estilo "// código"' },
];

const newCard = () => ({
  id: 'card_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
  bgColor: '',
  imageUrl: '',
  imageHeight: 200,
  tag: '',
  title: 'Título do Card',
  text: '',
  btnText: '',
  btnLink: '',
  btnVariant: 'red',
  cardLink: '',
  showImage: true,
  showTag: true,
  showTitle: true,
  showText: true,
  showBtn: false,
});

const blockDefaults = (type) => {
  switch (type) {
    case 'heading':   return { text: 'Novo Título', level: 'h2', color: '', size: '' };
    case 'text':      return { text: 'Escreva aqui...', color: '', size: '' };
    case 'card-grid': return { columns: 3, gap: 24, cards: [newCard(), newCard(), newCard()] };
    case 'button':    return { text: 'Clique aqui', link: '/', variant: 'red', arrow: true };
    case 'btn-row':   return { buttons: [{ id:'b1', text:'Botão 1', link:'/', variant:'red', arrow:true },{ id:'b2', text:'Botão 2', link:'/', variant:'ghost', arrow:false }] };
    case 'image':     return { url: '', alt: '', width: '100%', rounded: false };
    case 'divider':   return {};
    case 'spacer':    return { height: 40 };
    case 'kicker':    return { text: '// Seção' };
    default:          return {};
  }
};

// ── Render de um card individual (view mode) ───────────────────────────
function CardView({ card }) {
  const btnStyles = {
    red:     { background:'var(--red)',    color:'#fff',            border:'2px solid var(--red)' },
    ghost:   { background:'transparent',   color:'var(--off-white)',border:'2px solid var(--off-white)' },
    outline: { background:'transparent',   color:'var(--red)',      border:'2px solid var(--red)' },
    white:   { background:'#fff',          color:'var(--black)',    border:'2px solid #fff' },
  };

  const inner = (
    <div style={{
      background: card.bgColor || 'var(--panel)',
      border: '1px solid var(--line)',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: card.cardLink ? 'transform 0.2s, box-shadow 0.2s' : undefined,
    }}>
      {card.showImage !== false && card.imageUrl && (
        <img src={card.imageUrl} alt={card.title || ''} style={{ width:'100%', height: card.imageHeight || 200, objectFit:'cover', display:'block', flexShrink:0 }} />
      )}
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {card.showTag !== false && card.tag && (
          <div className="kicker" style={{ marginBottom: 0 }}>{card.tag}</div>
        )}
        {card.showTitle !== false && card.title && (
          <h3 style={{ fontFamily:'var(--font-display)', textTransform:'uppercase', margin: 0, lineHeight: 1.1 }}>{card.title}</h3>
        )}
        {card.showText !== false && card.text && (
          <p style={{ color:'var(--text-body)', lineHeight: 1.6, margin: 0, flex: 1 }}>{card.text}</p>
        )}
        {card.showBtn !== false && card.btnText && (
          <a
            href={card.btnLink || '#'}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', fontFamily:'var(--font-mono)', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', textDecoration:'none', cursor:'pointer', marginTop:'auto', alignSelf:'flex-start', ...btnStyles[card.btnVariant || 'red'] }}
            onClick={e => e.stopPropagation()}
          >
            {card.btnText} →
          </a>
        )}
      </div>
    </div>
  );

  if (card.cardLink) {
    return (
      <a href={card.cardLink} style={{ textDecoration:'none', display:'block', height:'100%', color:'inherit' }}
        onMouseEnter={e => { e.currentTarget.querySelector('div')?.style && (e.currentTarget.querySelector('div').style.transform = 'translateY(-3px)'); e.currentTarget.querySelector('div')?.style && (e.currentTarget.querySelector('div').style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'); }}
        onMouseLeave={e => { e.currentTarget.querySelector('div')?.style && (e.currentTarget.querySelector('div').style.transform = ''); e.currentTarget.querySelector('div')?.style && (e.currentTarget.querySelector('div').style.boxShadow = ''); }}
      >{inner}</a>
    );
  }
  return inner;
}

// ── ViewBlock ───────────────────────────────────────────────────────────
function ViewBlock({ block }) {
  const s = block;

  switch (s.type) {
    case 'heading': {
      const Tag = s.level || 'h2';
      const fs = s.size || (s.level==='h1'?'clamp(2.5rem,6vw,5rem)':s.level==='h3'?'1.5rem':'clamp(1.8rem,4vw,3rem)');
      return <Tag style={{ fontFamily:'var(--font-display)', textTransform:'uppercase', lineHeight:0.9, marginBottom:12, fontSize:fs, color:s.color||'inherit' }}>{s.text}</Tag>;
    }
    case 'text':
      return <p style={{ lineHeight:1.7, maxWidth:'72ch', color:s.color||'var(--text-body)', fontSize:s.size||'1rem', marginBottom:8 }}>{s.text}</p>;

    case 'card-grid':
      return (
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${s.columns||3},1fr)`, gap:s.gap||24, margin:'8px 0' }}>
          {(s.cards||[]).map(card => <CardView key={card.id} card={card} />)}
        </div>
      );

    case 'button':
      return (
        <a href={s.link||'/'} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', fontFamily:'var(--font-mono)', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', textDecoration:'none', cursor:'pointer', border:'2px solid', ...(s.variant==='ghost'?{background:'transparent',color:'var(--off-white)',borderColor:'var(--off-white)'}:s.variant==='outline'?{background:'transparent',color:'var(--red)',borderColor:'var(--red)'}:s.variant==='white'?{background:'#fff',color:'var(--black)',borderColor:'#fff'}:{background:'var(--red)',color:'#fff',borderColor:'var(--red)'}) }}>
          {s.text}{s.arrow&&' →'}
        </a>
      );
    case 'btn-row':
      return (
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          {(s.buttons||[]).map(b => <ViewBlock key={b.id} block={{...b,type:'button'}} />)}
        </div>
      );
    case 'image':
      return s.url ? <img src={s.url} alt={s.alt||''} style={{ width:s.width||'100%', borderRadius:s.rounded?8:0, display:'block', marginBottom:8 }} /> : null;
    case 'divider':
      return <div style={{ borderTop:'1px solid var(--line)', margin:'16px 0' }} />;
    case 'spacer':
      return <div style={{ height:s.height||40 }} />;
    case 'kicker':
      return <div className="kicker" style={{ marginBottom:8 }}>{s.text}</div>;
    default:
      return null;
  }
}

// ── Helpers cor/tamanho ─────────────────────────────────────────────────
const COLORS = ['#F4F8EB','#E10600','#FFFFFF','#888888','#0A0A0A','#1a1a1a','#7c3aed','#0ea5e9','#16a34a','#d97706'];
const SIZES  = [{l:'XS',v:'0.75rem'},{l:'SM',v:'0.875rem'},{l:'MD',v:'1rem'},{l:'LG',v:'1.25rem'},{l:'XL',v:'1.5rem'},{l:'2XL',v:'2rem'},{l:'3XL',v:'3rem'},{l:'4XL',v:'clamp(2rem,5vw,4rem)'},{l:'5XL',v:'clamp(3rem,8vw,7rem)'}];

function BzColorRow({ label='Cor', value, onChange }) {
  return (
    <div className="bz-field-row">
      <label>{label}</label>
      <div style={{display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}}>
        {COLORS.map(c => (
          <button key={c} onClick={() => onChange(c)} style={{ width:20,height:20,borderRadius:'50%',background:c,border:value===c?'2px solid var(--off-white)':'2px solid transparent',padding:0,cursor:'pointer',outline:value===c?'2px solid '+c:'none',outlineOffset:1 }} />
        ))}
        <input type="color" value={value||'#F4F8EB'} onChange={e => onChange(e.target.value)} style={{width:22,height:22,border:'none',background:'transparent',cursor:'pointer',padding:0}} />
      </div>
    </div>
  );
}

function BzSizeRow({ value, onChange }) {
  return (
    <div className="bz-field-row">
      <label>Tamanho</label>
      <div className="bz-chips">
        {SIZES.map(s => (
          <button key={s.v} className={'bz-chip'+(value===s.v?' active':'')} onClick={() => onChange(s.v)}>{s.l}</button>
        ))}
      </div>
    </div>
  );
}

// ── Editor de um card individual ───────────────────────────────────────
function CardEditor({ card, onChange, onRemove, onMove, idx, total }) {
  const fileRef = React.useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const set = (key, val) => onChange({ ...card, [key]: val });

  const toggleField = (key) => set(key, !card[key]);

  return (
    <div className="card-editor-item">
      {/* Header do card */}
      <div className="card-editor-bar" onClick={() => setOpen(o => !o)}>
        <span className="bz-block-icon" style={{fontSize:'0.7rem'}}>⊞</span>
        <span className="bz-block-label" style={{flex:1}}>Card {idx+1}/{total} {card.title ? '· '+card.title.slice(0,20) : ''}</span>
        <div className="bz-block-actions" onClick={e => e.stopPropagation()}>
          {idx > 0 && <button className="edit-btn" style={{width:22,height:22}} onClick={() => onMove(-1)}>↑</button>}
          {idx < total-1 && <button className="edit-btn" style={{width:22,height:22}} onClick={() => onMove(1)}>↓</button>}
          <button className="edit-btn edit-btn-danger" style={{width:22,height:22}} onClick={() => { if (window.confirm('Remover card?')) onRemove(); }}>✕</button>
        </div>
        <span className="bz-block-toggle">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="card-editor-body">
          {/* Imagem */}
          <div className="bz-field-row">
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              Imagem
              <input type="checkbox" checked={card.showImage!==false} onChange={e=>set('showImage',e.target.checked)} style={{accentColor:'var(--red)'}} />
            </label>
            {card.showImage !== false && (
              <div style={{display:'flex',gap:8,alignItems:'center',marginTop:6}}>
                {card.imageUrl
                  ? <img src={card.imageUrl} alt="" style={{width:64,height:44,objectFit:'cover',borderRadius:2,flexShrink:0}} />
                  : <div className="bz-img-placeholder">Sem imagem</div>
                }
                <button className="bz-chip" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? '⟳ Enviando…' : '⬆ Upload'}
                </button>
                {card.imageUrl && <button className="bz-chip" onClick={() => set('imageUrl','')}>✕ Remover</button>}
                <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  setUploading(true);
                  try { set('imageUrl', await uploadImg(file)); } catch(err) { alert(err.message); }
                  finally { setUploading(false); e.target.value=''; }
                }} />
              </div>
            )}
            {card.showImage !== false && (
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
                <label style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'var(--muted)'}}>Altura (px)</label>
                <input className="bz-input" type="number" min={80} max={600} value={card.imageHeight||200}
                  onChange={e => set('imageHeight', Number(e.target.value))} style={{width:70}} />
              </div>
            )}
          </div>

          {/* Tag/kicker */}
          <div className="bz-field-row">
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              Tag/Kicker
              <input type="checkbox" checked={card.showTag!==false} onChange={e=>set('showTag',e.target.checked)} style={{accentColor:'var(--red)'}} />
            </label>
            {card.showTag !== false && (
              <div contentEditable suppressContentEditableWarning className="bz-inline-edit" style={{marginTop:4}}
                onBlur={e => set('tag', e.target.innerText.trim())}
                onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),e.target.blur())}
              >{card.tag || ''}</div>
            )}
          </div>

          {/* Título */}
          <div className="bz-field-row">
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              Título
              <input type="checkbox" checked={card.showTitle!==false} onChange={e=>set('showTitle',e.target.checked)} style={{accentColor:'var(--red)'}} />
            </label>
            {card.showTitle !== false && (
              <div contentEditable suppressContentEditableWarning className="bz-inline-edit" style={{marginTop:4}}
                onBlur={e => set('title', e.target.innerText.trim())}
                onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),e.target.blur())}
              >{card.title || ''}</div>
            )}
          </div>

          {/* Texto */}
          <div className="bz-field-row">
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              Texto
              <input type="checkbox" checked={card.showText!==false} onChange={e=>set('showText',e.target.checked)} style={{accentColor:'var(--red)'}} />
            </label>
            {card.showText !== false && (
              <div contentEditable suppressContentEditableWarning className="bz-inline-edit bz-multiline" style={{marginTop:4}}
                onBlur={e => set('text', e.target.innerText.trim())}
              >{card.text || ''}</div>
            )}
          </div>

          {/* Botão */}
          <div className="bz-field-row">
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              Botão
              <input type="checkbox" checked={card.showBtn===true} onChange={e=>set('showBtn',e.target.checked)} style={{accentColor:'var(--red)'}} />
            </label>
            {card.showBtn && (
              <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:6}}>
                <div contentEditable suppressContentEditableWarning className="bz-inline-edit"
                  onBlur={e => set('btnText', e.target.innerText.trim())}
                  onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),e.target.blur())}
                  style={{marginBottom:4}}
                >{card.btnText || 'Saiba mais'}</div>
                <LinkPicker value={card.btnLink||''} onChange={v => set('btnLink', v)} />
                <div className="bz-chips">
                  {['red','ghost','outline','white'].map(v => (
                    <button key={v} className={'bz-chip'+(card.btnVariant===v?' active':'')} onClick={() => set('btnVariant',v)}>{v}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Link do card inteiro */}
          <div className="bz-field-row">
            <label>Link do card (card inteiro clicável)</label>
            <LinkPicker value={card.cardLink||''} onChange={v => set('cardLink', v)} />
          </div>

          {/* Cor de fundo */}
          <BzColorRow label="Fundo do card" value={card.bgColor} onChange={v => set('bgColor', v)} />
        </div>
      )}
    </div>
  );
}

// ── EditBlock ────────────────────────────────────────────────────────────
function EditBlock({ block, onChange }) {
  const fileRef = React.useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const set = (key, val) => onChange({ ...block, [key]: val });

  switch (block.type) {

    case 'heading':
      return (
        <div className="bz-edit-fields">
          <div className="bz-field-row">
            <label>Texto</label>
            <div contentEditable suppressContentEditableWarning className="bz-inline-edit"
              onBlur={e => set('text', e.target.innerText.trim())}
              onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),e.target.blur())}
            >{block.text}</div>
          </div>
          <div className="bz-field-row">
            <label>Nível</label>
            <div className="bz-chips">
              {['h1','h2','h3','h4'].map(l => (
                <button key={l} className={'bz-chip'+(block.level===l?' active':'')} onClick={() => set('level',l)}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <BzColorRow value={block.color} onChange={v => set('color', v)} />
          <BzSizeRow  value={block.size}  onChange={v => set('size',  v)} />
        </div>
      );

    case 'text':
      return (
        <div className="bz-edit-fields">
          <div className="bz-field-row">
            <label>Texto</label>
            <div contentEditable suppressContentEditableWarning className="bz-inline-edit bz-multiline"
              onBlur={e => set('text', e.target.innerText.trim())}
            >{block.text}</div>
          </div>
          <BzColorRow value={block.color} onChange={v => set('color', v)} />
          <BzSizeRow  value={block.size}  onChange={v => set('size',  v)} />
        </div>
      );

    case 'kicker':
      return (
        <div className="bz-edit-fields">
          <div className="bz-field-row">
            <label>Label</label>
            <div contentEditable suppressContentEditableWarning className="bz-inline-edit"
              onBlur={e => set('text', e.target.innerText.trim())}
              onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),e.target.blur())}
            >{block.text}</div>
          </div>
        </div>
      );

    case 'card-grid': {
      const cards = block.cards || [];
      const updCard = (id, updated) => set('cards', cards.map(c => c.id===id ? updated : c));
      const addCard = () => set('cards', [...cards, newCard()]);
      const remCard = (id) => set('cards', cards.filter(c => c.id!==id));
      const moveCard = (id, dir) => {
        const idx = cards.findIndex(c => c.id===id);
        if (idx<0) return;
        const next = [...cards];
        const swap = idx+dir;
        if (swap<0||swap>=next.length) return;
        [next[idx],next[swap]] = [next[swap],next[idx]];
        set('cards', next);
      };
      return (
        <div className="bz-edit-fields">
          {/* Config do grid */}
          <div className="bz-field-row">
            <label>Colunas</label>
            <div className="bz-chips">
              {[1,2,3,4].map(n => (
                <button key={n} className={'bz-chip'+((block.columns||3)===n?' active':'')} onClick={() => set('columns',n)}>{n} col</button>
              ))}
            </div>
          </div>
          <div className="bz-field-row">
            <label>Espaçamento (px)</label>
            <input className="bz-input" type="number" min={0} max={64} value={block.gap||24}
              onChange={e => set('gap', Number(e.target.value))} style={{width:70}} />
          </div>

          {/* Cards */}
          <div style={{borderTop:'1px solid var(--line)',paddingTop:10,marginTop:4}}>
            <div className="bz-field-row" style={{marginBottom:8}}>
              <label>Cards ({cards.length})</label>
            </div>
            {cards.map((card, idx) => (
              <CardEditor
                key={card.id}
                card={card}
                idx={idx}
                total={cards.length}
                onChange={updated => updCard(card.id, updated)}
                onRemove={() => remCard(card.id)}
                onMove={dir => moveCard(card.id, dir)}
              />
            ))}
            <button className="bz-add-btn-inline" style={{width:'100%',marginTop:8}} onClick={addCard}>
              + Adicionar card
            </button>
          </div>
        </div>
      );
    }

    case 'button':
      return (
        <div className="bz-edit-fields">
          <div className="bz-field-row"><label>Texto</label>
            <div contentEditable suppressContentEditableWarning className="bz-inline-edit"
              onBlur={e => set('text', e.target.innerText.trim())}
              onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),e.target.blur())}
            >{block.text}</div>
          </div>
          <div className="bz-field-row"><label>Link</label>
            <LinkPicker value={block.link||''} onChange={v => set('link', v)} />
          </div>
          <div className="bz-field-row">
            <label>Variante</label>
            <div className="bz-chips">
              {['red','ghost','outline','white'].map(v => (
                <button key={v} className={'bz-chip'+(block.variant===v?' active':'')} onClick={() => set('variant',v)}>{v}</button>
              ))}
            </div>
          </div>
          <div className="bz-field-row">
            <label>Seta →</label>
            <input type="checkbox" checked={!!block.arrow} onChange={e => set('arrow',e.target.checked)} style={{accentColor:'var(--red)',width:16,height:16}} />
          </div>
        </div>
      );

    case 'btn-row': {
      const btns = block.buttons||[];
      const updBtn = (id,key,val) => set('buttons', btns.map(b => b.id===id?{...b,[key]:val}:b));
      const addBtn = () => set('buttons', [...btns, {id:'b_'+Date.now(),text:'Botão',link:'/',variant:'ghost',arrow:false}]);
      const delBtn = (id) => set('buttons', btns.filter(b => b.id!==id));
      return (
        <div className="bz-edit-fields">
          {btns.map(b => (
            <div key={b.id} className="bz-btn-row-item">
              <div contentEditable suppressContentEditableWarning className="bz-inline-edit"
                onBlur={e => updBtn(b.id,'text',e.target.innerText.trim())}
                onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),e.target.blur())}
              >{b.text}</div>
              <div style={{flex:1}}><LinkPicker value={b.link||''} onChange={v => updBtn(b.id,'link',v)} /></div>
              <div className="bz-chips">
                {['red','ghost'].map(v => <button key={v} className={'bz-chip'+(b.variant===v?' active':'')} onClick={()=>updBtn(b.id,'variant',v)}>{v}</button>)}
              </div>
              <button className="bz-del-btn" onClick={() => delBtn(b.id)}>✕</button>
            </div>
          ))}
          <button className="bz-add-btn-inline" onClick={addBtn}>+ Botão</button>
        </div>
      );
    }

    case 'image':
      return (
        <div className="bz-edit-fields">
          <div className="bz-field-row">
            <label>Imagem</label>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {block.url
                ? <img src={block.url} alt="" style={{width:60,height:40,objectFit:'cover',borderRadius:2}} />
                : <div className="bz-img-placeholder">Sem imagem</div>
              }
              <button className="bz-chip" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? '⟳ Enviando…' : '⬆ Upload'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={async e => {
                const file = e.target.files?.[0]; if (!file) return;
                setUploading(true);
                try { set('url', await uploadImg(file)); } catch(err) { alert(err.message); }
                finally { setUploading(false); e.target.value=''; }
              }} />
            </div>
          </div>
          <div className="bz-field-row"><label>Largura</label>
            <div className="bz-chips">
              {['100%','75%','50%','25%'].map(w => (
                <button key={w} className={'bz-chip'+(block.width===w?' active':'')} onClick={() => set('width',w)}>{w}</button>
              ))}
            </div>
          </div>
          <div className="bz-field-row">
            <label>Arredondado</label>
            <input type="checkbox" checked={!!block.rounded} onChange={e => set('rounded',e.target.checked)} style={{accentColor:'var(--red)',width:16,height:16}} />
          </div>
        </div>
      );

    case 'divider':
      return <div className="bz-edit-fields"><p className="mono" style={{fontSize:'0.65rem',color:'var(--muted)'}}>Linha separadora — sem configuração.</p></div>;

    case 'spacer':
      return (
        <div className="bz-edit-fields">
          <div className="bz-field-row"><label>Altura (px)</label>
            <input className="bz-input" type="number" min={8} max={400} value={block.height||40}
              onChange={e => set('height', Number(e.target.value))} style={{width:80}} />
          </div>
        </div>
      );

    default: return null;
  }
}

// ── BlockZone principal ─────────────────────────────────────────────────
export function BlockZone({ pageId, zoneKey, className='', style={} }) {
  const { editMode, getContent, updateContent } = useEditMode();
  const [addOpen, setAddOpen] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState(null);

  const raw = getContent(pageId, `${zoneKey}.__blocks`);
  const blocks = React.useMemo(() => {
    if (raw) { try { return JSON.parse(raw); } catch {} }
    return [];
  }, [raw]);

  const save = (nb) => updateContent(pageId, `${zoneKey}.__blocks`, JSON.stringify(nb));

  const addBlock = (type) => {
    const nb = { id:'blk_'+Date.now(), type, ...blockDefaults(type) };
    save([...blocks, nb]);
    setExpandedId(nb.id);
    setAddOpen(false);
  };

  const updateBlock = (id, updated) => save(blocks.map(b => b.id===id ? updated : b));

  const removeBlock = (id) => {
    if (window.confirm('Remover este bloco?')) {
      save(blocks.filter(b => b.id!==id));
      if (expandedId===id) setExpandedId(null);
    }
  };

  const moveBlock = (id, dir) => {
    const idx = blocks.findIndex(b => b.id===id);
    if (idx<0) return;
    const next = [...blocks];
    const swap = idx+dir;
    if (swap<0||swap>=next.length) return;
    [next[idx],next[swap]] = [next[swap],next[idx]];
    save(next);
  };

  if (!editMode) {
    if (!blocks.length) return null;
    return (
      <div className={className} style={style}>
        {blocks.map(b => <ViewBlock key={b.id} block={b} />)}
      </div>
    );
  }

  return (
    <div className={'bz-root '+className} style={style}>
      {blocks.map((block) => {
        const isOpen = expandedId===block.id;
        const meta = BLOCK_TYPES.find(t => t.type===block.type) || {icon:'?',label:block.type};
        const preview = block.type==='card-grid' ? `${(block.cards||[]).length} cards · ${block.columns||3} colunas` : block.text ? String(block.text).slice(0,40) : '';
        return (
          <div key={block.id} className={'bz-block'+(isOpen?' bz-block-open':'')}>
            <div className="bz-block-bar" onClick={() => setExpandedId(isOpen ? null : block.id)}>
              <span className="bz-block-icon">{meta.icon}</span>
              <span className="bz-block-label">{meta.label}</span>
              {preview && <span className="bz-block-preview">{preview}</span>}
              <div className="bz-block-actions" onClick={e => e.stopPropagation()}>
                <button className="edit-btn" style={{width:24,height:24}} onClick={() => moveBlock(block.id,-1)} title="↑">↑</button>
                <button className="edit-btn" style={{width:24,height:24}} onClick={() => moveBlock(block.id, 1)} title="↓">↓</button>
                <button className="edit-btn edit-btn-danger" style={{width:24,height:24}} onClick={() => removeBlock(block.id)}>✕</button>
              </div>
              <span className="bz-block-toggle">{isOpen?'▲':'▼'}</span>
            </div>
            {isOpen && (
              <div className="bz-block-body">
                <div className="bz-preview"><ViewBlock block={block} /></div>
                <div className="bz-editor"><EditBlock block={block} onChange={u => updateBlock(block.id, u)} /></div>
              </div>
            )}
          </div>
        );
      })}

      <div className="bz-add-row">
        <button className="bz-add-trigger" onClick={() => setAddOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
          {addOpen ? 'Fechar' : 'Adicionar bloco'}
        </button>
        {addOpen && (
          <div className="bz-type-picker">
            {BLOCK_TYPES.map(t => (
              <button key={t.type} className="bz-type-card" onClick={() => addBlock(t.type)}>
                <span className="bz-type-icon">{t.icon}</span>
                <span className="bz-type-name">{t.label}</span>
                <span className="bz-type-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
