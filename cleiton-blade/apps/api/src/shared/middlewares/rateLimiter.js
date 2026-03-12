/**
 * Middleware de Rate Limiting
 * Protege contra brute force e spam en múltiplos níveis:
 * - Por IP
 * - Por Email
 * - Por Endpoint
 * - Com armazenamento em memória (para desenvolvimento)
 */

class RateLimiter {
  constructor() {
    this.attempts = new Map(); // { "key": [timestamps...] }
    this.blockedIPs = new Set();
    this.blockedEmails = new Set();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Limpar tentativas expiradas a cada 5 minutos
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of this.attempts.entries()) {
        // Manter apenas tentativas dos últimos 24 horas
        const filtered = timestamps.filter(t => now - t < 24 * 60 * 60 * 1000);
        if (filtered.length === 0) {
          this.attempts.delete(key);
        } else {
          this.attempts.set(key, filtered);
        }
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Registrar tentativa e retornar se deve ser bloqueado
   */
  check(ip, email, endpoint, limits = {}) {
    const defaultLimits = {
      perIP: { max: 50, windowMs: 60 * 60 * 1000 }, // 50 req/hora por IP
      perEmail: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 registros/hora por email
      perEndpoint: { max: 100, windowMs: 60 * 60 * 1000 }, // 100 req/hora por endpoint
      registerPerIP: { max: 100, windowMs: 60 * 60 * 1000 }, // 100 registros/hora por IP (development)
      loginPerEmail: { max: 100, windowMs: 15 * 60 * 1000 }, // 100 tentativas login/15min (development)
    };

    const config = { ...defaultLimits, ...limits };
    const now = Date.now();

    // Verificar se IP ou email estão bloqueados permanentemente
    if (this.blockedIPs.has(ip)) {
      return { blocked: true, reason: 'IP bloqueado permanentemente', reason_code: 'BLOCKED_IP' };
    }
    if (this.blockedEmails.has(email)) {
      return { blocked: true, reason: 'Email bloqueado permanentemente', reason_code: 'BLOCKED_EMAIL' };
    }

    // Verificar limite por IP
    const ipKey = `ip:${ip}`;
    if (!this.checkLimit(ipKey, now, config.perIP)) {
      return { blocked: true, reason: 'Muitas requisições do seu IP', reason_code: 'RATE_LIMIT_IP' };
    }

    // Verificar limite por email (se verificações de signup/login)
    if (email) {
      const emailKey = `email:${email}`;
      if (!this.checkLimit(emailKey, now, config.perEmail)) {
        return { blocked: true, reason: 'Muitas tentativas com este email', reason_code: 'RATE_LIMIT_EMAIL' };
      }

      // Para registros, limite mais rigoroso por IP
      if (endpoint === '/auth/register' || endpoint === '/auth/admin/register') {
        const registerKey = `register:${ip}`;
        if (!this.checkLimit(registerKey, now, config.registerPerIP)) {
          return {
            blocked: true,
            reason: 'Muitos registros do seu IP. Tente novamente em 1 hora',
            reason_code: 'RATE_LIMIT_REGISTER',
            retryAfter: 3600
          };
        }
      }

      // Para login, limite na quantidade de tentativas por email
      if (endpoint === '/auth/login' || endpoint === '/auth/admin/login') {
        const loginKey = `login:${email}`;
        if (!this.checkLimit(loginKey, now, config.loginPerEmail)) {
          return {
            blocked: true,
            reason: 'Muitas tentativas de login. Tente novamente em 15 minutos',
            reason_code: 'RATE_LIMIT_LOGIN',
            retryAfter: 900
          };
        }
      }
    }

    // Verificar limite geral por endpoint
    const endpointKey = `endpoint:${endpoint}`;
    if (!this.checkLimit(endpointKey, now, config.perEndpoint)) {
      return { blocked: true, reason: 'Endpoint sobrecarregado', reason_code: 'RATE_LIMIT_ENDPOINT' };
    }

    return { blocked: false };
  }

  /**
   * Verificar se está dentro do limite
   */
  checkLimit(key, now, limit) {
    const timestamps = (this.attempts.get(key) || []).filter(t => now - t < limit.windowMs);
    this.attempts.set(key, [...timestamps, now]);
    return timestamps.length < limit.max;
  }

  /**
   * Bloquear IP permanentemente (depois de muitas tentativas suspeitas)
   */
  blockIP(ip) {
    console.warn(`⚠️  Bloqueando IP: ${ip}`);
    this.blockedIPs.add(ip);
    // Auto-desbloquear após 24 horas
    setTimeout(() => this.blockedIPs.delete(ip), 24 * 60 * 60 * 1000);
  }

  /**
   * Bloquear email permanentemente (depois de muitos registros)
   */
  blockEmail(email) {
    console.warn(`⚠️  Bloqueando email: ${email}`);
    this.blockedEmails.add(email);
    // Auto-desbloquear após 24 horas
    setTimeout(() => this.blockedEmails.delete(email), 24 * 60 * 60 * 1000);
  }

  /**
   * Resetar tentativas de um IP/email (após sucesso ou verificação)
   */
  reset(key) {
    this.attempts.delete(key);
  }

  /**
   * Middleware Express
   */
  middleware(endpoint) {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const email = req.body?.email || req.query?.email || '';

      const result = this.check(ip, email, endpoint);

      res.set('X-RateLimit-IP-Remaining', 
        50 - (this.attempts.get(`ip:${ip}`) || []).length
      );

      if (result.blocked) {
        const statusCode = result.reason_code === 'BLOCKED_IP' || result.reason_code === 'BLOCKED_EMAIL' ? 403 : 429;
        return res.status(statusCode).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message: result.reason,
          reason_code: result.reason_code,
          retryAfter: result.retryAfter || 3600
        });
      }

      next();
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

module.exports = new RateLimiter();
