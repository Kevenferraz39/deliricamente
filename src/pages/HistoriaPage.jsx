import React from 'react';
import { db } from '../firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { TIMELINE, COLLECTIVES } from '../data';
import { useEditMode } from '../context/EditModeContext';
import { EditableSection } from '../components/editor/EditableSection';
import { EditableText } from '../components/editor/EditableText';
import { EditableCardGrid } from '../components/editor/EditableCardGrid';
import { DynamicSectionsRenderer } from '../components/editor/DynamicSectionsRenderer';

const PAGE = 'historia';

// Schema dos coletivos (screenshot 2)
const COLLECTIVES_SCHEMA = [
  { key: 'num',  label: 'Número',    tag: 'div', className: 'num',  style: {} },
  { key: 'role', label: 'Área',      tag: 'div', className: 'role', style: {} },
  { key: 'name', label: 'Nome',      tag: 'h3',  style: {} },
  { key: 'body', label: 'Descrição', tag: 'p',   type: 'multiline', style: {} },
];

// Schema dos depoimentos (screenshot 1)
const MEMBERS_SCHEMA = [
  { key: 'role',  label: 'Função',   tag: 'div', className: 'role', style: {} },
  { key: 'name',  label: 'Nome',     tag: 'h3',  style: {} },
  { key: 'quote', label: 'Citação',  tag: 'p',   type: 'multiline',
    style: { color: 'var(--text-body)', fontStyle: 'italic' } },
];

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

      {/* ── Cabeçalho ── */}
      <EditableSection pageId={PAGE} sectionId="header" label="Cabeçalho">
        <section className="section tight" style={{paddingTop:112}}>
          <div className="wrap">
            <div className="kicker">
              <EditableText pageId={PAGE} contentKey="header.kicker" defaultValue="// Trajetória" tag="span" />
            </div>
            <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
              <EditableText pageId={PAGE} contentKey="header.title1" defaultValue="NOSSA" tag="span" styleKey="header.title1" />
              <br/>
              <EditableText pageId={PAGE} contentKey="header.title2" defaultValue="HISTÓRIA" tag="span"
                style={{color:"var(--red)"}} styleKey="header.title2" />
            </h1>
            <EditableText pageId={PAGE} contentKey="header.subtitle"
              defaultValue="Da primeira roda informal no Centro Cultural até as duas edições da EPIFANIA — uma linha do tempo do que a quebrada construiu junta."
              tag="p" styleKey="header.subtitle" multiline
              style={{maxWidth:"60ch",fontSize:18,color:"var(--text-body)",lineHeight:1.55}} />
          </div>
        </section>
      </EditableSection>

      {/* ── Timeline ── */}
      <EditableSection pageId={PAGE} sectionId="timeline" label="Timeline">
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
      </EditableSection>

      {/* ── AGC + Coletivos (screenshot 2) ── */}
      <EditableSection pageId={PAGE} sectionId="agc" label="AGC + Coletivos">
        <section className="section agc-section">
          <div className="wrap">
            <div className="kicker">
              <EditableText pageId={PAGE} contentKey="agc.kicker" defaultValue="// O movimento" tag="span" />
            </div>
            <h2 className="display" style={{fontSize:"clamp(48px,7vw,110px)",lineHeight:0.86,margin:"12px 0 24px",textTransform:"uppercase",color:"var(--ink)"}}>
              <EditableText pageId={PAGE} contentKey="agc.title1" defaultValue="ARTE," tag="span" styleKey="agc.title1" />
              {' '}
              <EditableText pageId={PAGE} contentKey="agc.title2" defaultValue="GUERRILHA" tag="em"
                style={{fontStyle:"normal",color:"var(--red)"}} styleKey="agc.title2" />
              <br/>
              <EditableText pageId={PAGE} contentKey="agc.title3" defaultValue="& CONHECIMENTO" tag="span" styleKey="agc.title3" />
            </h2>

            {/* Cards dos coletivos — editável */}
            <EditableCardGrid
              pageId={PAGE}
              gridKey="agc.collectives"
              defaultCards={COLLECTIVES.map((c, i) => ({ id: `col_${i}`, ...c }))}
              schema={COLLECTIVES_SCHEMA}
              columns={3}
              cardClassName="collective"
            />
          </div>
        </section>
      </EditableSection>

      {/* ── Depoimentos dos Membros (screenshot 1) ── */}
      <EditableSection pageId={PAGE} sectionId="members" label="Depoimentos dos Membros">
        <section className="section">
          <div className="wrap">
            <div className="row-head">
              <div>
                <div className="kicker">
                  <EditableText pageId={PAGE} contentKey="members.kicker" defaultValue="// Memória viva" tag="span" />
                </div>
                <h2 className="display">
                  <EditableText pageId={PAGE} contentKey="members.title1" defaultValue="DEPOIMENTOS" tag="span" styleKey="members.title1" />
                  <br/>
                  <EditableText pageId={PAGE} contentKey="members.title2" defaultValue="DOS MEMBROS" tag="em" styleKey="members.title2" />
                </h2>
              </div>
            </div>

            {/* Cards dos membros — editável */}
            <EditableCardGrid
              pageId={PAGE}
              gridKey="members"
              defaultCards={[
                { id: 'm1', role: 'Voz · Composição', name: 'MC Roma',   quote: 'Coletivo é onde o som vira ação e a ação vira som. Sem isso é só playlist.' },
                { id: 'm2', role: 'MC · Produção',    name: 'GuLírico',  quote: 'A Deliricamente me ensinou que rima sem comunidade é só barulho organizado.' },
                { id: 'm3', role: 'Voz · Letras',     name: 'Leo Braga', quote: 'A gente fala de quebrada com a quebrada do lado, não pra ela ouvir de longe.' },
              ]}
              schema={MEMBERS_SCHEMA}
              columns={3}
              cardClassName="collective"
              cardStyle={{background:"var(--panel)"}}
            />
          </div>
        </section>
      </EditableSection>

      <DynamicSectionsRenderer pageId={PAGE} />
    </div>
  );
}
