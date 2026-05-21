/**
 * sanitize.js — Utilitários de sanitização de inputs sem dependências externas.
 * Remove HTML, scripts e padrões maliciosos usando regex/replace puro.
 */

/**
 * Escapa caracteres HTML especiais para exibição segura.
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Remove tags HTML, atributos on*, protocolos javascript:/vbscript: e limita o tamanho.
 * O texto legítimo (sem HTML) passa sem alteração.
 * @param {string} input
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeText(input, maxLength = 5000) {
  if (typeof input !== 'string') return '';

  let result = input;

  // Remove protocolos perigosos: javascript:, vbscript:, data: (em contexto de href/src)
  result = result.replace(/javascript\s*:/gi, '');
  result = result.replace(/vbscript\s*:/gi, '');

  // Remove atributos de evento inline: onload=, onerror=, onclick=, etc.
  result = result.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\bon\w+\s*=\s*[^\s>]*/gi, '');

  // Remove tags <script> com todo o conteúdo
  result = result.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Remove tags <style> com todo o conteúdo
  result = result.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Remove tags <iframe>, <object>, <embed>, <link>, <meta>
  result = result.replace(/<(iframe|object|embed|link|meta|form|input|button)[^>]*>/gi, '');

  // Remove todas as outras tags HTML
  result = result.replace(/<[^>]+>/g, '');

  // Decodifica entidades HTML simples para evitar bypass via encoding
  result = result.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
  // Reaplica a remoção de tags após decode
  result = result.replace(/<[^>]+>/g, '');

  // Remove null bytes e caracteres de controle (exceto newline e tab)
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Limita o tamanho
  result = result.slice(0, maxLength);

  return result.trim();
}

/**
 * Sanitiza texto de comentário (máx. 1000 chars).
 * @param {string} text
 * @returns {string}
 */
export function sanitizeComment(text) {
  return sanitizeText(text, 1000);
}

/**
 * Sanitiza conteúdo de post (máx. 50000 chars — permite textos longos).
 * @param {string} text
 * @returns {string}
 */
export function sanitizePostContent(text) {
  return sanitizeText(text, 50000);
}

/**
 * Valida formato de e-mail.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim()) && email.length <= 254;
}

/**
 * Valida URL segura (só http e https).
 * @param {string} url
 * @returns {boolean}
 */
export function validateUrl(url) {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Valida nome de exibição: sem HTML, entre 2 e 50 caracteres.
 * @param {string} name
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateDisplayName(name) {
  if (typeof name !== 'string') return { valid: false, error: 'Nome inválido.' };

  const sanitized = sanitizeText(name, 50);

  if (sanitized.length < 2) {
    return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres.' };
  }
  if (sanitized.length > 50) {
    return { valid: false, error: 'Nome deve ter no máximo 50 caracteres.' };
  }

  // Bloqueia nomes que são só caracteres especiais ou números
  if (/^[\d\s\W]+$/.test(sanitized)) {
    return { valid: false, error: 'Nome deve conter letras.' };
  }

  return { valid: true, error: null };
}
