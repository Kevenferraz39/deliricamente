import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useEditMode } from '../context/EditModeContext';
import { LogoMark, Placeholder, Marquee, Btn, AnimatedBackground, HeroCarousel } from '../components';
import { EditableSection } from '../components/editor/EditableSection';
import { EditableText } from '../components/editor/EditableText';
import { EditableImage } from '../components/editor/EditableImage';
import { DynamicBlock } from '../components/editor/DynamicBlock';
import { AGENDA, COLLECTIVES } from '../data';
import { db } from '../firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const PAGE = 'home';

export function fmtDate(iso) {
  const meses = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  const d = new Date(iso + "T12:00:00");
  return [String(d.getDate()).padStart(2,"0"), meses[d.getMonth()], d.getFullYear()];
}

// ============================================================
// HERO + MARQUEE
// ============================================================
function Hero({ bgConfig = {}, heroLogoUrl = "" }) {
  const navigate = useNavigate();
  const { editMode, getContent } = useEditMode();
  const { style = 'blobs', speed = 1, density = 15, opacity = 0.85 } = bgConfig;

  const c = (key, def) => { const v = getContent(PAGE, key); return v !== undefined ? v : def; };

  return (
    <>
      <section className="hero">
        <AnimatedBackground style={style} speed={speed} density={density} opacity={opacity} />
        <div className="wrap hero-grid">
          <div>
            <div className="hero-eyebrow">
              <EditableText pageId={PAGE} contentKey="hero.eyebrow1" defaultValue="Caieiras · São Paulo" tag="span" />
              <EditableText pageId={PAGE} contentKey="hero.eyebrow2" defaultValue="· Coletivo desde 2019" tag="b" />
            </div>
            <h1 className="display">
              <EditableText pageId={PAGE} contentKey="hero.title1" defaultValue="DELÍRICA"
                tag="span" className="delirica" styleKey="hero.title1" />
              <EditableText pageId={PAGE} contentKey="hero.title2" defaultValue="MENTE"
                tag="span" className="mente" styleKey="hero.title2" />
            </h1>
            <EditableText pageId={PAGE} contentKey="hero.subtitle"
              defaultValue="Coletivo de hip-hop, literatura periférica e intervenção urbana. Som, palavra e ação na quebrada — pela revolução cultural e interna. Parte do movimento AGC — Arte, Guerrilha e Conhecimento."
              tag="p" className="hero-tag" styleKey="hero.subtitle" multiline />

            <div className="hero-meta">
              {[
                ['hero.meta1.label', 'FORMADO POR', 'hero.meta1.value', '3 COLETIVOS'],
                ['hero.meta2.label', 'SEDE',         'hero.meta2.value', 'CAIEIRAS · SP'],
                ['hero.meta3.label', 'SEGUIDORES',   'hero.meta3.value', '1.049'],
                ['hero.meta4.label', 'EVENTOS',      'hero.meta4.value', '+ 40 / ANO'],
              ].map(([lk, ld, vk, vd]) => (
                <div key={lk}>
                  <EditableText pageId={PAGE} contentKey={lk} defaultValue={ld} tag="span" />
                  <EditableText pageId={PAGE} contentKey={vk} defaultValue={vd} tag="b" />
                </div>
              ))}
            </div>

            <div className="hero-actions">
              <Btn variant="red" arrow onClick={() => navigate("/blog")}>
                <EditableText pageId={PAGE} contentKey="hero.cta1" defaultValue="Últimos posts" tag="span" />
              </Btn>
              <Btn variant="ghost" arrow onClick={() => navigate("/historia")}>
                <EditableText pageId={PAGE} contentKey="hero.cta2" defaultValue="Nossa história" tag="span" />
              </Btn>
              <Btn variant="ghost" onClick={() => navigate("/contato")}>
                <EditableText pageId={PAGE} contentKey="hero.cta3" defaultValue="Booking · Contato" tag="span" />
              </Btn>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-logo-bg">
              <EditableImage pageId={PAGE} contentKey="hero.logoUrl" defaultSrc={heroLogoUrl}>
                <div style={{ pointerEvents: editMode ? 'none' : undefined }}>
                  <LogoMark size={300} imageUrl={c('hero.logoUrl', heroLogoUrl)} />
                </div>
              </EditableImage>
              <div className="hero-stamp">
                <EditableText pageId={PAGE} contentKey="hero.stamp" defaultValue="EPIFANIA" tag="span" />
                <small>
                  <EditableText pageId={PAGE} contentKey="hero.stampDate" defaultValue="23 · 11 · 2024" tag="span" />
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Marquee items={[
        c('marquee.1', 'VIVA A NASCENÇA'),
        c('marquee.2', 'CULTURA UNDERGROUND'),
        c('marquee.3', 'ATITUDE & REVOLUÇÃO'),
        c('marquee.4', 'ARTE GUERRILHA & CONHECIMENTO'),
        c('marquee.5', 'DELÍRIO EM COLETIVO'),
        c('marquee.6', 'CAIEIRAS — SP'),
      ]} />
    </>
  );
}

// ============================================================
// LATEST POSTS BLOCK
// ============================================================
function LatestPosts({ posts }) {
  const navigate = useNavigate();
  const [a, b, c, d] = posts;
  return (
    <section className="section">
      <div className="wrap">
        <div className="row-head">
          <div>
            <div className="kicker">// Últimos posts</div>
            <h2 className="display">EM <em>DESTAQUE</em></h2>
          </div>
          <div className="right">
            <Btn arrow onClick={() => navigate("/blog")}>Ver todos</Btn>
          </div>
        </div>
        <div className="posts-grid">
          {[a, b, c, d].map((p, i) => p ? (
            <a key={p.id} className={`post-card ${i === 0 ? 'featured' : i === 1 ? 'standard' : 'third'}`}
              onClick={() => navigate("/blog/" + p.id)} style={{ cursor: "pointer" }}>
              <div className="post-cover">
                <span className="badge">{p.type}</span>
                <span className="date">{fmtDate(p.date).join(" · ")}</span>
                {p.cover?.url
                  ? <img src={p.cover.url} alt={p.title} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:(p.cover?.position ? 'center '+p.cover.position : 'center top'),display:'block' }} />
                  : <Placeholder label={p.cover?.label} variant={p.cover?.variant} />
                }
              </div>
              <div className="post-body">
                <div className="kicker">// post #{p.id.toUpperCase()}</div>
                <h3>{p.title}</h3>
                {p.excerpt && <p>{p.excerpt}</p>}
                <div className="meta">
                  <span>♥ <b>{p.likes}</b></span>
                  <span>💬 <b>{p.comments}</b></span>
                  <span>POR <b>{p.author}</b></span>
                </div>
              </div>
            </a>
          ) : null)}
          <a className="post-card third" onClick={() => navigate("/blog")} style={{ cursor: "pointer" }}>
            <div className="post-cover" style={{ background: "var(--red)" }}>
              <Placeholder label="VER ARQUIVO COMPLETO →" variant="red" />
            </div>
            <div className="post-body">
              <h3>+ 80 posts no arquivo</h3>
              <div className="meta"><span>EVENTOS · SHOWS · OFICINAS</span></div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// AGC SECTION
// ============================================================
function AGCSection() {
  const navigate = useNavigate();
  return (
    <section className="section agc-section">
      <div className="wrap">
        <div className="agc-grid">
          <div>
            <div className="kicker">
              <EditableText pageId={PAGE} contentKey="agc.kicker" defaultValue="// O movimento" tag="span" />
            </div>
            <h2>
              <EditableText pageId={PAGE} contentKey="agc.title" defaultValue="ARTE, GUERRILHA & CONHECIMENTO"
                tag="span" styleKey="agc.title" multiline />
            </h2>
          </div>
          <div>
            <EditableText pageId={PAGE} contentKey="agc.body1"
              defaultValue="AGC é a aliança entre três coletivos da quebrada que decidiram trampar juntos ao invés de competir por palco, mídia e edital. Cada um tem sua frente — som, texto e imagem — mas as ações grandes, festivais e campanhas saem assinadas em coletivo."
              tag="p" styleKey="agc.body1" multiline />
            <EditableText pageId={PAGE} contentKey="agc.body2"
              defaultValue="Não é selo, não é produtora, não é ONG. É movimento. Atitude e revolução dentro e fora do som. A quebrada cuidando da quebrada, sem pedir licença pra ninguém."
              tag="p" styleKey="agc.body2" multiline style={{ marginTop: 16 }} />
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:24 }}>
              <Btn variant="red" arrow onClick={() => navigate("/historia")}>Conhecer a história</Btn>
            </div>
          </div>
        </div>
        <div className="collectives">
          {COLLECTIVES.map((c, i) => (
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
  );
}

// ============================================================
// AGENDA
// ============================================================
const TIPO_COR = {
  Festival: 'var(--red)', Show: '#7c3aed', Batalha: '#0ea5e9',
  Oficina: '#16a34a', Cultura: '#d97706',
};

function AgendaSection() {
  const navigate = useNavigate();
  const [eventos, setEventos] = React.useState(AGENDA);

  React.useEffect(() => {
    try {
      const q = query(collection(db, 'agenda'), orderBy('date', 'asc'));
      const unsub = onSnapshot(q, snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.active !== false);
        if (items.length > 0) setEventos(items);
      });
      return () => unsub();
    } catch {}
  }, []);

  return (
    <section className="section">
      <div className="wrap">
        <div className="row-head">
          <div>
            <div className="kicker">// Próximos rolês</div>
            <h2 className="display">NA <em>AGENDA</em></h2>
          </div>
        </div>
        <div className="agenda-list">
          {eventos.map((e, i) => (
            <div key={e.id || i} className="agenda-row agenda-row-link"
              onClick={() => navigate(`/agenda/${e.id}`)} style={{ cursor: 'pointer' }}>
              <div className="agenda-date">{e.dia}<small>{e.mes} · {e.ano}</small></div>
              <div className="agenda-title">{e.title}</div>
              <div className="agenda-meta">{e.local}</div>
              <div className="agenda-meta" style={{ color: TIPO_COR[e.tipo] || 'var(--red)', display:'flex', alignItems:'center', gap:6 }}>
                {e.tipo}
                {e.time && <span className="mono" style={{ fontSize:'0.7rem', color:'var(--muted)' }}>· {e.time}</span>}
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
export default function HomePage() {
  const { posts, bgConfig = {}, carouselConfig = {}, heroLogoUrl = "" } = useApp();
  const { editMode, loadPage, getSections } = useEditMode();
  const published = posts.filter(p => p.status === 'published');
  const showCarousel = carouselConfig.enabled && (carouselConfig.slides || []).length > 0;

  React.useEffect(() => { loadPage(PAGE); }, []);

  // Mapa de seções nativas
  const NATIVE = {
    hero: (
      <EditableSection key="hero" pageId={PAGE} sectionId="hero" label="Hero">
        <Hero bgConfig={bgConfig} heroLogoUrl={heroLogoUrl} />
      </EditableSection>
    ),
    marquee: null, // embutido no Hero, controlado junto
    'latest-posts': published.length >= 4 ? (
      <EditableSection key="latest-posts" pageId={PAGE} sectionId="latest-posts" label="Últimos Posts">
        <LatestPosts posts={published.slice(0, 4)} />
      </EditableSection>
    ) : null,
    agc: (
      <EditableSection key="agc" pageId={PAGE} sectionId="agc" label="AGC">
        <AGCSection />
      </EditableSection>
    ),
    agenda: (
      <EditableSection key="agenda" pageId={PAGE} sectionId="agenda" label="Agenda">
        <AgendaSection />
      </EditableSection>
    ),
  };

  if (!editMode) {
    // Modo de leitura: respeita visibilidade salva mas renderiza na ordem do Firestore
    const sections = getSections(PAGE);
    return (
      <div className="page-enter">
        {sections.map(s => {
          if (!s.visible) return null;
          if (s.id === 'hero') return <React.Fragment key="hero"><Hero bgConfig={bgConfig} heroLogoUrl={heroLogoUrl} /></React.Fragment>;
          if (s.id === 'latest-posts') return published.length >= 4 ? <LatestPosts key="lp" posts={published.slice(0, 4)} /> : null;
          if (s.id === 'agc') return <AGCSection key="agc" />;
          if (s.id === 'agenda') return <AgendaSection key="agenda" />;
          if (s.type) return <DynamicBlock key={s.id} pageId={PAGE} section={s} />;
          return null;
        })}
        {showCarousel && (
          <HeroCarousel slides={carouselConfig.slides} autoPlay={carouselConfig.autoPlay !== false} interval={carouselConfig.interval || 5} />
        )}
      </div>
    );
  }

  // Modo de edição: envolve cada seção com controles
  const sections = getSections(PAGE);
  return (
    <div className="page-enter">
      {sections.map(s => {
        if (s.type) return (
          <EditableSection key={s.id} pageId={PAGE} sectionId={s.id} label={s.label}>
            <DynamicBlock pageId={PAGE} section={s} />
          </EditableSection>
        );
        return NATIVE[s.id] || null;
      })}
      {showCarousel && (
        <HeroCarousel slides={carouselConfig.slides} autoPlay={carouselConfig.autoPlay !== false} interval={carouselConfig.interval || 5} />
      )}
    </div>
  );
}
