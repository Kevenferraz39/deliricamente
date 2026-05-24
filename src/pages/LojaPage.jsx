import React from 'react';
import { db } from '../firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Splatter, Placeholder } from '../components';
import { useEditMode } from '../context/EditModeContext';
import { EditableSection } from '../components/editor/EditableSection';

const PAGE = 'loja';

export default function LojaPage() {
  const { loadPage } = useEditMode();
  React.useEffect(() => { loadPage(PAGE); }, []);
  const STATIC_PRODUTOS = [
    { name:"Camiseta Logo Deliricamente", description:"Preta · Estampa branca", price:"R$ 65" },
    { name:"Moletom AGC", description:"Cinza · Bordado vermelho", price:"R$ 180" },
    { name:"Fanzine #03", description:"40 págs · A5", price:"R$ 20" },
  ];
  const [produtos, setProdutos] = React.useState(STATIC_PRODUTOS);

  React.useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.active !== false);
      if (items.length > 0) setProdutos(items);
    });
    return () => unsub();
  }, []);

  return (
    <div className="page-enter">
      <EditableSection pageId={PAGE} sectionId="produtos" label="Loja — Produtos">
      <section className="loja-section">
        <Splatter color="var(--black)" opacity={0.55} />
        <div className="wrap loja-grid">
          <div>
            <div className="kicker" style={{color:"var(--off-white)"}}>// Produtos oficiais</div>
            <h2>VESTE A <em>CAMISA</em><br/>DA QUEBRADA</h2>
            <p>
              Camisetas, moletons, bonés, fanzines e vinis do selo independente do AGC. Cada
              compra ajuda a financiar a próxima EPIFANIA, as oficinas e as ações de
              arrecadação.
            </p>
            <div className="mono" style={{marginTop:24,color:"rgba(255,255,255,.8)"}}>
              // FRETE PRA TODO BRASIL · ENVIO EM ATÉ 7 DIAS ÚTEIS
            </div>
          </div>

          <div className="product-stack">
            {produtos.map((p, i) => (
              <div className="product-card" key={p.id || i} style={{"--r": (i % 2 ? "1.5deg" : "-1.5deg")}}
                onClick={() => p.link && window.open(p.link, '_blank')}>
                <div className="product-thumb" style={{overflow:'hidden'}}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    : <Placeholder label={p.name.split(" ")[0]} variant="paper" />
                  }
                </div>
                <div style={{flex:1}}>
                  <h4>{p.name}</h4>
                  <small>{p.description || p.var}</small>
                </div>
                <div className="product-price">{p.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </EditableSection>
    </div>
  );
}
