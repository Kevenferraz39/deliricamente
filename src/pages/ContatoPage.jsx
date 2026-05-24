import React from 'react';
import { Btn, Icon } from '../components';
import { useEditMode } from '../context/EditModeContext';
import { EditableSection } from '../components/editor/EditableSection';
import { EditableText } from '../components/editor/EditableText';

const PAGE = 'contato';

export default function ContatoPage() {
  const { loadPage } = useEditMode();
  React.useEffect(() => { loadPage(PAGE); }, []);
  const [form, setForm] = React.useState({ nome:"", email:"", assunto:"booking", msg:"" });
  const [sent, setSent] = React.useState(false);

  const submit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <div className="page-enter">
      <EditableSection pageId={PAGE} sectionId="form" label="Formulário de Contato">
      <section className="section tight" style={{paddingTop:112}}>
        <div className="wrap">
          <div className="kicker">
            <EditableText pageId={PAGE} contentKey="header.kicker" defaultValue="// Fala com o coletivo" tag="span" />
          </div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            <EditableText pageId={PAGE} contentKey="header.title1" defaultValue="CON" tag="span" styleKey="header.title1" />
            <EditableText pageId={PAGE} contentKey="header.title2" defaultValue="TATO" tag="span"
              style={{color:"var(--red)"}} styleKey="header.title2" />
          </h1>
          <div className="contato-grid">
            <div>
              {sent ? (
                <div className="share-box" style={{padding:32}}>
                  <h4>// MENSAGEM ENVIADA</h4>
                  <p style={{fontSize:18, lineHeight:1.5}}>
                    Recebemos a sua mensagem, <b>{form.nome.split(" ")[0] || "parceiro"}</b>.
                    A gente responde em até 48h por e-mail. Enquanto isso, segue a gente no
                    Insta — <b>@deliricamente_</b>.
                  </p>
                  <Btn arrow onClick={()=>{setSent(false); setForm({nome:"",email:"",assunto:"booking",msg:""});}}>Enviar outra</Btn>
                </div>
              ) : (
                <form className="comment-form" onSubmit={submit}>
                  <div className="row">
                    <input className="input" placeholder="SEU NOME" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} required />
                    <input className="input" placeholder="E-MAIL" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
                  </div>
                  <select className="input" value={form.assunto} onChange={e=>setForm({...form,assunto:e.target.value})}>
                    <option value="booking">BOOKING · SHOW</option>
                    <option value="parceria">PARCERIA · COLABORAÇÃO</option>
                    <option value="oficina">OFICINA · WORKSHOP</option>
                    <option value="imprensa">IMPRENSA · ENTREVISTA</option>
                    <option value="outro">OUTRO</option>
                  </select>
                  <textarea className="input textarea" placeholder="CONTA O QUE PRECISA — DATA, LOCAL, ORÇAMENTO, CONTEXTO..." value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})} required />
                  <Btn variant="red" arrow type="submit">Enviar mensagem</Btn>
                </form>
              )}
            </div>

            <div className="contato-info">
              <EditableText pageId={PAGE} contentKey="info.redes.title" defaultValue="// REDES" tag="h3" />
              <p>
                <b>Instagram</b> · <EditableText pageId={PAGE} contentKey="info.instagram" defaultValue="@deliricamente_" tag="a" />
                <br/>
                <b>YouTube</b> · <EditableText pageId={PAGE} contentKey="info.youtube" defaultValue="Deliricamente Oficial" tag="a" />
                <br/>
                <b>Spotify</b> · <EditableText pageId={PAGE} contentKey="info.spotify" defaultValue="Selo AGC" tag="a" />
              </p>

              <EditableText pageId={PAGE} contentKey="info.booking.title" defaultValue="// BOOKING & PARCERIAS" tag="h3" />
              <p>
                <EditableText pageId={PAGE} contentKey="info.booking.email1" defaultValue="booking@deliricamente.com.br" tag="a" />
                <br/>
                <EditableText pageId={PAGE} contentKey="info.booking.email2" defaultValue="contato@agc.coletivo" tag="a" />
              </p>

              <EditableText pageId={PAGE} contentKey="info.base.title" defaultValue="// BASE" tag="h3" />
              <EditableText pageId={PAGE} contentKey="info.base.body"
                defaultValue="Caieiras · Grande São Paulo. Atende a região metropolitana e shows fora pra todo Brasil."
                tag="p" multiline />

              <h3>// SIGA</h3>
              <div className="socials">
                <a className="share-icon"><Icon.Insta /></a>
                <a className="share-icon"><Icon.Whats /></a>
                <a className="share-icon"><Icon.Yt /></a>
                <a className="share-icon"><Icon.Tw /></a>
                <a className="share-icon"><Icon.Fb /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
      </EditableSection>
    </div>
  );
}
