/**
 * rateLimit.js — Rate limiting client-side com janela deslizante.
 * Persiste no sessionStorage para sobreviver a refreshes de página.
 * Usa Map em memória como cache local, sincronizado com sessionStorage.
 */

const STORAGE_PREFIX = 'rl_';

// Cache em memória para evitar leituras excessivas do sessionStorage
const memoryCache = new Map();

/**
 * Lê o estado de rate limit do sessionStorage (com fallback para memória).
 * @param {string} key
 * @returns {{ attempts: number[], lastReset: number }}
 */
function readState(key) {
  const cacheKey = STORAGE_PREFIX + key;

  // Tenta ler do sessionStorage primeiro
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // sessionStorage indisponível (iframe, modo privado extremo) — usa memória
  }

  return memoryCache.get(key) || { attempts: [], lastReset: Date.now() };
}

/**
 * Persiste o estado no sessionStorage e no cache em memória.
 * @param {string} key
 * @param {{ attempts: number[], lastReset: number }} state
 */
function writeState(key, state) {
  memoryCache.set(key, state);
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
  } catch {
    // Silencioso — memória será usada como fallback
  }
}

/**
 * Verifica e registra uma tentativa de rate limit com janela deslizante.
 *
 * @param {string} key           - Identificador único (ex: "login:email@x.com")
 * @param {number} maxAttempts   - Número máximo de tentativas na janela
 * @param {number} windowMs      - Tamanho da janela em milissegundos
 * @returns {{ allowed: boolean, remaining: number, waitMs: number }}
 */
export function checkRateLimit(key, maxAttempts, windowMs) {
  const now = Date.now();
  const state = readState(key);

  // Remove tentativas fora da janela deslizante
  const validAttempts = state.attempts.filter(ts => now - ts < windowMs);

  if (validAttempts.length >= maxAttempts) {
    // Bloqueado — calcula quanto tempo falta para a tentativa mais antiga expirar
    const oldest = Math.min(...validAttempts);
    const waitMs = windowMs - (now - oldest);

    writeState(key, { attempts: validAttempts, lastReset: state.lastReset });

    return {
      allowed: false,
      remaining: 0,
      waitMs: Math.max(0, waitMs),
    };
  }

  // Permitido — registra a tentativa
  validAttempts.push(now);
  writeState(key, { attempts: validAttempts, lastReset: state.lastReset });

  return {
    allowed: true,
    remaining: maxAttempts - validAttempts.length,
    waitMs: 0,
  };
}

/**
 * Limpa os contadores de rate limit para uma chave específica.
 * Útil após login bem-sucedido.
 * @param {string} key
 */
export function clearRateLimit(key) {
  memoryCache.delete(key);
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Silencioso
  }
}

/**
 * Formata o tempo de espera em português legível.
 * @param {number} waitMs
 * @returns {string}
 */
export function formatWaitTime(waitMs) {
  if (waitMs <= 0) return 'agora';
  const secs = Math.ceil(waitMs / 1000);
  if (secs < 60) return `${secs} segundo${secs !== 1 ? 's' : ''}`;
  const mins = Math.ceil(secs / 60);
  return `${mins} minuto${mins !== 1 ? 's' : ''}`;
}

// ── Presets de rate limit ─────────────────────────────────────────────────

/**
 * Login: 5 tentativas a cada 15 minutos por e-mail.
 * Uso: checkRateLimit(`login:${email}`, ...RATE_LIMITS.LOGIN)
 */
export const RATE_LIMITS = {
  LOGIN:        [5,   15 * 60 * 1000],  // 5 tentativas / 15 min
  COMMENT:      [3,        60 * 1000],  // 3 comentários / 1 min
  FORM_SUBMIT:  [10,  60 * 1000],       // 10 submissões / 1 min
  API_CALL:     [30,  60 * 1000],       // 30 chamadas / 1 min
  RESET_PWD:    [3,   10 * 60 * 1000],  // 3 resets / 10 min
  REGISTER:     [3,   60 * 60 * 1000],  // 3 registros / 1 hora
};
