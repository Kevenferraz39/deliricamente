/**
 * auditLogger.js — Audit log imutável no Firestore.
 * Registra todas as ações relevantes do sistema na coleção `logs`.
 * Logs nunca são atualizados ou deletados (garantido pelas Firestore Rules).
 */

import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, where, getDocs } from 'firebase/firestore';

// ── Geração de sessionId único por aba/sessão ─────────────────────────────
const SESSION_ID = (() => {
  const key = 'audit_session_id';
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
})();

// ── Constantes de ações ───────────────────────────────────────────────────

export const LOG_ACTIONS = {
  // Autenticação
  auth_login:          'auth/login',
  auth_logout:         'auth/logout',
  auth_register:       'auth/register',
  auth_login_failed:   'auth/login_failed',
  auth_reset_password: 'auth/reset_password',

  // Posts
  post_create: 'post/create',
  post_update: 'post/update',
  post_delete: 'post/delete',

  // Comentários
  comment_create:  'comment/create',
  comment_delete:  'comment/delete',
  comment_flagged: 'comment/flagged',

  // Usuários
  user_activate:   'user/activate',
  user_deactivate: 'user/deactivate',
  user_role_change:'user/role_change',

  // Config
  config_update: 'config/update',

  // Segurança
  security_rate_limit_hit: 'security/rate_limit_hit',
  security_xss_attempt:    'security/xss_attempt',
};

// ── Mapa de ações para mensagens legíveis em português ────────────────────
const ACTION_MESSAGES = {
  'auth/login':          'Usuário fez login',
  'auth/logout':         'Usuário saiu da conta',
  'auth/register':       'Nova conta criada',
  'auth/login_failed':   'Tentativa de login falhou',
  'auth/reset_password': 'Link de redefinição de senha enviado',
  'post/create':         'Post criado',
  'post/update':         'Post atualizado',
  'post/delete':         'Post excluído',
  'comment/create':      'Comentário publicado',
  'comment/delete':      'Comentário excluído',
  'comment/flagged':     'Comentário marcado para moderação',
  'user/activate':       'Usuário ativado',
  'user/deactivate':     'Usuário desativado',
  'user/role_change':    'Função de usuário alterada',
  'config/update':       'Configuração do site atualizada',
  'security/rate_limit_hit': 'Limite de tentativas atingido',
  'security/xss_attempt':    'Tentativa de injeção de código detectada',
};

// ── Mapa de severidade por ação ───────────────────────────────────────────
const ACTION_SEVERITY = {
  'auth/login':          'info',
  'auth/logout':         'info',
  'auth/register':       'info',
  'auth/login_failed':   'warn',
  'auth/reset_password': 'info',
  'post/create':         'info',
  'post/update':         'info',
  'post/delete':         'warn',
  'comment/create':      'info',
  'comment/delete':      'warn',
  'comment/flagged':     'warn',
  'user/activate':       'info',
  'user/deactivate':     'warn',
  'user/role_change':    'warn',
  'config/update':       'warn',
  'security/rate_limit_hit': 'error',
  'security/xss_attempt':    'critical',
};

// ── Função principal de log ───────────────────────────────────────────────

/**
 * Escreve um evento no Firestore (coleção `logs`).
 * NUNCA lança erro para o chamador — falha silenciosamente no I/O,
 * mas jamais suprime o próprio registro.
 *
 * @param {string} action  - Uma das constantes de LOG_ACTIONS
 * @param {object} data    - Dados contextuais do evento
 * @param {object|null} user - Objeto do usuário logado ({ uid, email, name, role })
 */
export async function logEvent(action, data = {}, user = null) {
  try {
    const entry = {
      // Identificação do evento
      action,
      message: ACTION_MESSAGES[action] || action,
      severity: ACTION_SEVERITY[action] || 'info',

      // Dados do usuário
      userId:    user?.uid   || null,
      userEmail: user?.email || null,
      userName:  user?.name  || null,
      userRole:  user?.role  || null,

      // Dados contextuais
      data: data || {},

      // Rastreabilidade
      sessionId: SESSION_ID,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'logs'), entry);
  } catch {
    // Suprime erros de I/O — o sistema não pode travar por causa de um log.
    // Em ambiente de desenvolvimento, loga no console para debug.
    if (import.meta.env?.DEV) {
      console.debug('[auditLogger] Falha ao gravar log:', action, data);
    }
  }
}

// ── Funções especializadas ────────────────────────────────────────────────

/**
 * Registra evento de autenticação.
 * @param {string} action   - LOG_ACTIONS.auth_login | auth_logout | auth_register | auth_login_failed | auth_reset_password
 * @param {string} email
 * @param {string|null} uid
 * @param {boolean} success
 * @param {string|null} reason - Motivo da falha (se houver)
 */
export async function logAuth(action, email, uid, success, reason = null) {
  await logEvent(action, {
    email,
    uid,
    success,
    reason,
  }, uid ? { uid, email } : null);
}

/**
 * Registra ação administrativa.
 * @param {string} action
 * @param {string} resourceType - Tipo do recurso (post, comment, user, config...)
 * @param {string} resourceId   - ID do recurso afetado
 * @param {object} user         - Usuário admin que realizou a ação
 * @param {object} details      - Detalhes adicionais
 */
export async function logAdminAction(action, resourceType, resourceId, user, details = {}) {
  await logEvent(action, {
    resourceType,
    resourceId,
    details,
  }, user);
}

/**
 * Registra evento de segurança (rate limit, XSS, etc.).
 * @param {string} type    - LOG_ACTIONS.security_rate_limit_hit | security_xss_attempt
 * @param {object} details - Detalhes do evento
 */
export async function logSecurityEvent(type, details = {}) {
  await logEvent(type, {
    ...details,
    detectedAt: new Date().toISOString(),
  }, null);
}

// ── Funções de leitura (apenas para master via LogsPage) ──────────────────

/**
 * Busca os logs mais recentes.
 * @param {number} limitCount
 * @returns {Promise<object[]>}
 */
export async function getRecentLogs(limitCount = 100) {
  try {
    const q = query(
      collection(db, 'logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

/**
 * Busca logs de um usuário específico.
 * @param {string} userId
 * @param {number} limitCount
 * @returns {Promise<object[]>}
 */
export async function getLogsByUser(userId, limitCount = 50) {
  try {
    const q = query(
      collection(db, 'logs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}
