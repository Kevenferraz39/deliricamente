import React from 'react';
import { db, auth } from '../../firebase.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogoMark, Btn } from '../../components';
import { useApp } from '../../context/AppContext';
import { sanitizeText, validateEmail, validateDisplayName } from '../../security/sanitize.js';
import { checkRateLimit, clearRateLimit, formatWaitTime, RATE_LIMITS } from '../../security/rateLimit.js';
import { logAuth, LOG_ACTIONS } from '../../security/auditLogger.js';

// ── Ícones inline ──────────────────────────────────────────────
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    width="40" height="40" style={{ color: '#1DB954' }}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 8l10 7 10-7" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    width="13" height="13" style={{ color: 'var(--muted)', marginRight: 4 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

// ── Firebase error map ─────────────────────────────────────────
const authError = (code) => ({
  'auth/invalid-credential':    'E-mail ou senha incorretos.',
  'auth/user-not-found':        'Nenhuma conta encontrada com este e-mail.',
  'auth/wrong-password':        'Senha incorreta. Tente novamente.',
  'auth/email-already-in-use':  'Este e-mail já está cadastrado.',
  'auth/invalid-email':         'Formato de e-mail inválido.',
  'auth/too-many-requests':     'Muitas tentativas. Aguarde alguns minutos.',
  'auth/network-request-failed':'Sem conexão. Verifique sua internet.',
}[code] || 'Erro inesperado. Tente novamente.');

// ── Componente principal ───────────────────────────────────────
export default function AdminLogin() {
  const navigate  = useNavigate();
  const { login, user } = useApp();

  React.useEffect(() => {
    if (user) navigate(
      (user.isMaster || user.role === 'admin' || user.role === 'admin_master')
        ? '/admin/dashboard'
        : '/perfil',
      { replace: true }
    );
  }, [user]);

  // mode: 'login' | 'register' | 'forgot'
  const [mode,    setMode]    = React.useState('login');
  const [email,   setEmail]   = React.useState('');
  const [pwd,     setPwd]     = React.useState('');
  const [name,    setName]    = React.useState('');
  const [err,     setErr]     = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resetOk, setResetOk] = React.useState(false);
  const [showPwd, setShowPwd] = React.useState(false);

  const switchMode = (m) => { setMode(m); setErr(''); setResetOk(false); };

  // ── Login ──────────────────────────────────────────────────
  const doLogin = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);

    // Validação de e-mail
    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      setErr('Formato de e-mail inválido.'); setLoading(false); return;
    }

    // Rate limiting: 5 tentativas por e-mail em 15 minutos
    const rlKey = `login:${trimmedEmail}`;
    const rl = checkRateLimit(rlKey, ...RATE_LIMITS.LOGIN);
    if (!rl.allowed) {
      const wait = formatWaitTime(rl.waitMs);
      setErr(`Muitas tentativas. Aguarde ${wait} antes de tentar novamente.`);
      await logAuth(LOG_ACTIONS.auth_login_failed, trimmedEmail, null, false, `Rate limit atingido — aguardar ${wait}`);
      setLoading(false); return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pwd);
      clearRateLimit(rlKey); // Limpa contador após login bem-sucedido
      await login({
        name:  cred.user.displayName || cred.user.email.split('@')[0],
        role:  'user',
        email: cred.user.email,
        uid:   cred.user.uid,
      });
    } catch (firebaseErr) {
      const msg = authError(firebaseErr.code);
      setErr(msg);
      await logAuth(LOG_ACTIONS.auth_login_failed, trimmedEmail, null, false, firebaseErr.code);
    }
    setLoading(false);
  };

  // ── Registro ───────────────────────────────────────────────
  const doRegister = async (e) => {
    e.preventDefault();

    // Sanitização e validação do nome
    const sanitizedName = sanitizeText(name.trim(), 50);
    const nameValidation = validateDisplayName(sanitizedName);
    if (!nameValidation.valid) { setErr(nameValidation.error); return; }

    // Validação de e-mail
    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) { setErr('Formato de e-mail inválido.'); return; }

    if (pwd.length < 6) { setErr('Senha deve ter ao menos 6 caracteres.'); return; }

    // Rate limiting: 3 registros por hora
    const rlKey = `register:${trimmedEmail}`;
    const rl = checkRateLimit(rlKey, ...RATE_LIMITS.REGISTER);
    if (!rl.allowed) {
      const wait = formatWaitTime(rl.waitMs);
      setErr(`Muitas tentativas de registro. Aguarde ${wait}.`);
      setLoading(false); return;
    }

    setErr(''); setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pwd);
      await updateProfile(cred.user, { displayName: sanitizedName });
      await setDoc(doc(db, 'users', cred.user.uid), {
        email:       cred.user.email,
        displayName: sanitizedName,
        role:        'user',
        active:      false,
        photoUrl:    '',
        createdAt:   serverTimestamp(),
        lastLogin:   serverTimestamp(),
      });
      await logAuth(LOG_ACTIONS.auth_register, cred.user.email, cred.user.uid, true, null);
      await signOut(auth);
      switchMode('login');
      setEmail(''); setPwd(''); setName('');
      setErr('✓ Conta criada! Aguarde o administrador ativar seu acesso.');
    } catch (firebaseErr) {
      setErr(authError(firebaseErr.code));
    }
    setLoading(false);
  };

  // ── Recuperar senha ────────────────────────────────────────
  const doReset = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) { setErr('Digite seu e-mail para continuar.'); return; }
    if (!validateEmail(trimmedEmail)) { setErr('Formato de e-mail inválido.'); return; }

    // Rate limiting: 3 resets por 10 minutos
    const rlKey = `reset:${trimmedEmail}`;
    const rl = checkRateLimit(rlKey, ...RATE_LIMITS.RESET_PWD);
    if (!rl.allowed) {
      const wait = formatWaitTime(rl.waitMs);
      setErr(`Muitas solicitações. Aguarde ${wait} antes de tentar novamente.`);
      return;
    }

    setErr(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      await logAuth(LOG_ACTIONS.auth_reset_password, trimmedEmail, null, true, null);
      setResetOk(true);
    } catch (firebaseErr) {
      setErr(authError(firebaseErr.code));
    }
    setLoading(false);
  };

  // ── Render helpers ─────────────────────────────────────────
  const titles = {
    login:    ['Entrar',       'Acesso restrito ao coletivo.'],
    register: ['Criar conta',  'Sua conta será ativada pelo administrador.'],
    forgot:   ['Recuperar',    'Digite o e-mail cadastrado e enviaremos o link de redefinição.'],
  };
  const [title, subtitle] = titles[mode];

  const isSuccess = err.startsWith('✓');

  return (
    <div className="admin-login">
      <div className="admin-login-card" style={{ maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <LogoMark size={48} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Deliricamente
            </div>
            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--red)' }}>
              // {mode === 'forgot' ? 'RECUPERAR ACESSO' : 'PAINEL ADMINISTRATIVO'}
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.8rem', marginBottom: 4 }}>{title}</h2>
        <p style={{ marginBottom: 24, fontSize: '0.85rem' }}>{subtitle}</p>

        {/* ── Estado de sucesso no reset ── */}
        {mode === 'forgot' && resetOk ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <IconMail />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', textTransform: 'uppercase', margin: '16px 0 8px' }}>
              E-mail enviado!
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 4 }}>
              Verifique a caixa de entrada de <b style={{ color: 'var(--off-white)' }}>{email}</b>.
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 28 }}>
              Não encontrou? Confira a pasta de spam.
            </p>
            <Btn variant="ghost" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { switchMode('login'); setEmail(''); }}>
              Voltar ao login
            </Btn>
          </div>

        ) : (
          /* ── Formulários ── */
          <form onSubmit={mode === 'login' ? doLogin : mode === 'register' ? doRegister : doReset}>

            {mode === 'register' && (
              <input className="input" type="text" placeholder="SEU NOME *"
                value={name} onChange={e => setName(e.target.value)}
                style={{ marginBottom: 10 }} />
            )}

            <input className="input" type="email" placeholder="E-MAIL *"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ marginBottom: 10 }} required />

            {mode !== 'forgot' && (
              <div style={{ position: 'relative', marginBottom: 4 }}>
                <input className="input"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="SENHA (mín. 6 caracteres)"
                  value={pwd} onChange={e => setPwd(e.target.value)}
                  style={{ paddingRight: 48 }} />
                <button type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--off-white)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                  {showPwd ? 'OCULTAR' : 'MOSTRAR'}
                </button>
              </div>
            )}

            {/* Link "Esqueci a senha" — só no login */}
            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 18 }}>
                <button type="button"
                  onClick={() => switchMode('forgot')}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--off-white)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                  <IconLock /> Esqueci minha senha
                </button>
              </div>
            )}

            {mode !== 'login' && <div style={{ marginBottom: 18 }} />}

            <Btn variant="red" arrow type="submit"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}>
              {loading
                ? 'AGUARDE...'
                : mode === 'login'    ? 'ENTRAR'
                : mode === 'register' ? 'CRIAR CONTA'
                : 'ENVIAR LINK'}
            </Btn>
          </form>
        )}

        {/* Feedback de erro / sucesso */}
        {err && (
          <div className="mono" style={{
            marginTop: 14, fontSize: '0.78rem', lineHeight: 1.5,
            color: isSuccess ? '#22c55e' : 'var(--red)',
            padding: '8px 12px',
            background: isSuccess ? 'rgba(34,197,94,0.07)' : 'rgba(225,6,0,0.07)',
            border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.2)' : 'rgba(225,6,0,0.2)'}`,
          }}>
            {err}
          </div>
        )}

        {/* Rodapé */}
        {!(mode === 'forgot' && resetOk) && (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <a className="mono" style={{ color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem' }}
              onClick={() => navigate('/')}>
              ← Voltar ao site
            </a>
            <div style={{ display: 'flex', gap: 12 }}>
              {mode !== 'login' && (
                <a className="mono" style={{ color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                  onClick={() => switchMode('login')}>
                  Já tenho conta
                </a>
              )}
              {mode !== 'register' && (
                <a className="mono" style={{ color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                  onClick={() => switchMode('register')}>
                  Criar conta
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
