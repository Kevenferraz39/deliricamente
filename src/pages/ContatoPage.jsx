import React from 'react';
import { Btn, Icon } from '../components';

export default function ContatoPage() {
  const [form, setForm] = React.useState({ nome:"", email:"", assunto:"booking", msg:"" });
  const [sent, setSent] = React.useState(false);

  const submit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <div className="page-enter">
      <section className="section tight" style={{paddingTop:112}}>
        <div className="wrap">
          <div className="kicker">// Fala com o coletivo</div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            CON<span style={{color:"var(--red)"}}>TATO</span>
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
              <h3>// REDES</h3>
              <p>
                <b>Instagram</b> · <a>@deliricamente_</a><br/>
                <b>YouTube</b> · <a>Deliricamente Oficial</a><br/>
                <b>Spotify</b> · <a>Selo AGC</a>
              </p>

              <h3>// BOOKING & PARCERIAS</h3>
              <p>
                <a>booking@deliricamente.com.br</a><br/>
                <a>contato@agc.coletivo</a>
              </p>

              <h3>// BASE</h3>
              <p>
                Caieiras · Grande São Paulo<br/>
                Atende a região metropolitana e shows fora pra todo Brasil.
              </p>

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
    </div>
  );
}
