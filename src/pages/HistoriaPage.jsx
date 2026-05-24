import React from 'react';
import { db } from '../firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { TIMELINE, COLLECTIVES } from '../data';
import { useEditMode } from '../context/EditModeContext';
import { EditableSection } from '../components/editor/EditableSection';

const PAGE = 'historia';

export default function HistoriaPage() {
  const { loadPage } = useEditMode();
  React.useEffect(() => { loadPage(PAGE); }, []);
  const [timeline, setTimeline] = React.useState(TIMELINE);

  React.useEffect(() => {
    const q = query(collection(db, 'timeline'), orderBy('year', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (items.length > 0) setTimeline(items);
    });
    return () => unsub();
  }, []);

  return (
    <div className="page-enter">
      <EditableSection pageId={PAGE} sectionId="header" label="Cabeçalho">
      <section className="section tight" style={{paddingTop:112}}>
        <div className="wrap">
          <div className="kicker">// Trajetória</div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            NOSSA<br/><span style={{color:"var(--red)"}}>HISTÓRIA</span>
          </h1>
          <p style={{maxWidth:"60ch",fontSize:18,color:"var(--text-body)",lineHeight:1.55}}>
            Da primeira roda informal no Centro Cultural até as duas edições da EPIFANIA —
            uma linha do tempo do que a quebrada construiu junta.
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap">
          <div className="timeline">
            {[...timeline].sort((a, b) => (b.year || 0) - (a.year || 0)).map((t, i) => (
              <div className="tl-item" key={t.id || i}>
                <div className="tl-year">{t.year}</div>
                <div className="tl-body">
                  {t.imageUrl && <img src={t.imageUrl} alt={t.title} style={{width:'100%',height:200,objectFit:'cover',marginBottom:16,display:'block'}} />}
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                  <div className="tl-tags">
                    {(t.tags || []).map(g => <span key={g}>{g}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section agc-section">
        <div className="wrap">
          <div className="kicker">// O movimento</div>
          <h2 className="display" style={{fontSize:"clamp(48px,7vw,110px)",lineHeight:0.86,margin:"12px 0 24px",textTransform:"uppercase",color:"var(--ink)"}}>
            ARTE, <em style={{fontStyle:"normal",color:"var(--red)"}}>GUERRILHA</em><br/>& CONHECIMENTO
          </h2>
          <div className="collectives">
            {COLLECTIVES.map((c,i) => (
              <div className="collective" key={i}>
                <div className="num">{c.num}/03</div>
                <div className="role">{c.role}</div>
                <h3>{c.name}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="row-head">
            <div>
              <div className="kicker">// Memória viva</div>
              <h2 className="display">DEPOIMENTOS<br/><em>DOS MEMBROS</em></h2>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
            {[
              { name:"MC Roma", role:"Voz · Composição", quote:"Coletivo é onde o som vira ação e a ação vira som. Sem isso é só playlist." },
              { name:"GuLírico", role:"MC · Produção", quote:"A Deliricamente me ensinou que rima sem comunidade é só barulho organizado." },
              { name:"Leo Braga", role:"Voz · Letras", quote:"A gente fala de quebrada com a quebrada do lado, não pra ela ouvir de longe." },
            ].map((p,i)=>(
              <div key={i} className="collective" style={{background:"var(--panel)"}}>
                <div className="role">{p.role}</div>
                <h3>{p.name}</h3>
                <p style={{color:"var(--text-body)",fontStyle:"italic"}}>&ldquo;{p.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </EditableSection>
    </div>
  );
}
