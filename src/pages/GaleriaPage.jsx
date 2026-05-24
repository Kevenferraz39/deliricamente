import React from 'react';
import { db } from '../firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Placeholder } from '../components';
import { GALLERY } from '../data';
import { useEditMode } from '../context/EditModeContext';
import { EditableSection } from '../components/editor/EditableSection';

const PAGE = 'galeria';

export default function GaleriaPage() {
  const { loadPage } = useEditMode();
  React.useEffect(() => { loadPage(PAGE); }, []);
  const [gallery, setGallery] = React.useState(GALLERY);
  const [open, setOpen] = React.useState(null);

  React.useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (items.length > 0) setGallery(items);
    });
    return () => unsub();
  }, []);

  return (
    <div className="page-enter">
      <EditableSection pageId={PAGE} sectionId="header" label="Cabeçalho + Galeria">
      <section className="section tight" style={{paddingTop:112}}>
        <div className="wrap">
          <div className="kicker">// Memória do coletivo</div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            GALE<span style={{color:"var(--red)"}}>RIA</span>
          </h1>

          <div className="gallery-grid">
            {gallery.map((g, i) => (
              <div key={g.id || i} className={"gallery-item " + (g.size || '')} onClick={() => setOpen(g)}>
                {g.url
                  ? <img src={g.url} alt={g.label || ''} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',display:'block'}} />
                  : <Placeholder label={g.label} variant={g.variant} />
                }
                <div className="gallery-overlay">
                  <div>{g.label || ''}<br/><small style={{opacity:.8}}>CLIQUE PARA AMPLIAR</small></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div onClick={e=>e.stopPropagation()} style={{position:'relative',maxWidth:'90vw',maxHeight:'90vh'}}>
            <button onClick={() => setOpen(null)} style={{position:'absolute',top:-40,right:0,background:'transparent',border:'none',color:'var(--off-white)',fontSize:24,cursor:'pointer'}}>✕</button>
            {open.url
              ? <img src={open.url} alt={open.label || ''} style={{maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain',display:'block'}} />
              : <Placeholder label={open.label} variant={open.variant} />
            }
            {open.label && <div className="mono" style={{marginTop:12,textAlign:'center',fontSize:'0.8rem',color:'var(--muted)'}}>{open.label}</div>}
          </div>
        </div>
      )}
      </EditableSection>
    </div>
  );
}
