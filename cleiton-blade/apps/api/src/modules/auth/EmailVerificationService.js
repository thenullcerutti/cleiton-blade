/**
 * Serviço de Verificação de Email
 * Gera tokens únicos, valida, e gerencia o ciclo de vida
 */

const crypto = require('crypto');

class EmailVerificationService {
  /**
   * Gerar token único e armazenar
   */
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validar email (formato básico)
   */
  static validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      return { valid: false, error: 'Email inválido' };
    }

    // Rejeitar domínios temporários/descartáveis conhecidos
    const tempDomains = [
      'tempmail.com', 'guerrillamail.com', 'mailinator.com',
      '10minutemail.com', 'throwaway.email', 'temp-mail.org',
      'yopmail.com', 'fakeinbox.com', 'trashmail.com'
    ];
    
    const domain = email.split('@')[1].toLowerCase();
    if (tempDomains.includes(domain)) {
      return { valid: false, error: 'Email temporário não permitido' };
    }

    return { valid: true };
  }

  /**
   * Detectar padrões suspeitos no email
   */
  static detectSuspiciousPatterns(email) {
    const suspiciousPatterns = [
      /\d{5,}/,  // Muitos números sequenciais
      /(admin|root|test|demo|fake)/i, // Palavras comuns de teste
      /[^a-z0-9._-]/i, // Caracteres inválidos (básico)
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(email.split('@')[0])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Detectar IP suspeito (muito simplificado - em produção usar serviço externo)
   */
  static isIPSuspicious(ip) {
    // Implementar verificação contra lista de IPs conhecidos como maliciosos
    // Por enquanto, apenas IPs privados são considerados "seguros"
    const privateIPRanges = [
      /^127\./, // localhost
      /^192\.168\./, // RFC 1918
      /^10\./, // RFC 1918
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // RFC 1918
      /^::1$/, // IPv6 localhost
    ];

    return !privateIPRanges.some(range => range.test(ip));
  }

  /**
   * Calcular confiança da requisição (0-100)
   */
  static calculateTrustScore(email, ip, userAgent) {
    let score = 100;

    // Penalidades
    if (this.detectSuspiciousPatterns(email)) score -= 30;
    if (this.isIPSuspicious(ip)) score -= 10;
    if (!userAgent) score -= 20; // Sem user agent = suspeito
    if (userAgent?.includes('bot') || userAgent?.includes('curl')) score -= 40;

    return Math.max(0, score);
  }

  /**
   * Criar registro de verificação de email
   */
  static createVerificationRecord(userId, email, ip, userAgent) {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    return {
      user_id: userId,
      email,
      token,
      expires_at: expiresAt,
      ip_address: ip,
      user_agent: userAgent,
      attempts: 0
    };
  }

  /**
   * Definir usuário como verificado
   */
  static markAsVerified() {
    return {
      verified_at: new Date()
    };
  }

  /**
   * Montar link de verificação
   */
  static getVerificationLink(token, baseUrl = process.env.FRONTEND_URL) {
    return `${baseUrl}/verify-email?token=${token}`;
  }

  /**
   * Montar email HTML para envio
   */
  static getEmailHTML(verificationLink, userName = 'Usuário') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 20px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 6px; margin: 20px 0; color: #856404; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verificar seu Email</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Obrigado por se cadastrar na <strong>Cleiton Blade</strong>!</p>
            
            <p>Para ativar sua conta, clique no link abaixo:</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verificar Email</a>
            </div>
            
            <p><strong>Ou copie este link:</strong></p>
            <p style="word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 4px; font-size: 12px;">
              ${verificationLink}
            </p>
            
            <div class="warning">
              ⏰ Este link expira em 24 horas por segurança.
            </div>
            
            <p>Se não solicitou este cadastro, ignore este email.</p>
            
            <p>Dúvidas? Entre em contato: <strong>suporte@cleitonblade.com</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Cleiton Blade. Todos os direitos reservados.</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = EmailVerificationService;
