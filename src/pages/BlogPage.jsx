import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useEditMode } from '../context/EditModeContext';
import { Placeholder, Icon } from '../components';
import { EditableSection } from '../components/editor/EditableSection';
import { EditableText } from '../components/editor/EditableText';
import { fmtDate } from './HomePage';

const PAGE = 'blog';

export default function BlogPage() {
  const navigate = useNavigate();
  const { posts } = useApp();
  const { loadPage } = useEditMode();
  React.useEffect(() => { loadPage(PAGE); }, []);
  const [q, setQ] = React.useState("");
  const [tag, setTag] = React.useState("Todos");
  const tags = ["Todos", "EVENTO", "SHOW", "NOTÍCIA", "CULTURA", "ANÚNCIO"];

  const filtered = posts.filter(p => p.status === "published")
    .filter(p => tag === "Todos" || p.type === tag)
    .filter(p => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page-enter">
      <EditableSection pageId={PAGE} sectionId="header" label="Cabeçalho + Posts">
      <section className="section tight" style={{paddingTop:112}}>
        <div className="wrap">
          <div className="kicker">
            <EditableText pageId={PAGE} contentKey="header.kicker" defaultValue="// Arquivo" tag="span" />
          </div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            <EditableText pageId={PAGE} contentKey="header.title1" defaultValue="BLOG &" tag="span" styleKey="header.title1" />
            <br/>
            <EditableText pageId={PAGE} contentKey="header.title2" defaultValue="POSTS" tag="span"
              style={{color:"var(--red)"}} styleKey="header.title2" />
          </h1>

          <div className="blog-tools">
            <div className="tag-chips">
              {tags.map(t => (
                <button key={t} className={"chip " + (tag === t ? "active" : "")} onClick={() => setTag(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="search-input">
              <Icon.Search />
              <input placeholder="BUSCAR..." value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>
          </div>

          <div className="blog-grid">
            {filtered.map(p => (
              <a key={p.id} className="post-card" onClick={() => navigate("/blog/" + p.id)} style={{cursor:"pointer"}}>
                <div className="post-cover">
                  <span className="badge">{p.type}</span>
                  <span className="date">{fmtDate(p.date).join(" · ")}</span>
                  {p.cover?.url
                    ? <img src={p.cover.url} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:(p.cover?.position ? 'center '+p.cover.position : 'center top'),display:'block'}} />
                    : <Placeholder label={p.cover?.label} variant={p.cover?.variant} />
                  }
                </div>
                <div className="post-body">
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <div className="meta">
                    <span>♥ <b>{p.likes}</b></span>
                    <span>🔥 <b>{p.fires}</b></span>
                    <span>💬 <b>{p.comments}</b></span>
                  </div>
                </div>
              </a>
            ))}
            {filtered.length === 0 && (
              <div className="mono" style={{padding:40, color:"var(--muted)", gridColumn:"1/-1", textAlign:"center"}}>
                NENHUM POST ENCONTRADO PARA ESSES FILTROS.
              </div>
            )}
          </div>
        </div>
      </section>
      </EditableSection>
    </div>
  );
}
