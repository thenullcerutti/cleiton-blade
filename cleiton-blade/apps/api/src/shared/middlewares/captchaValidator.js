/**
 * Middleware de Validação de CAPTCHA
 * Integração com Google reCAPTCHA v3
 * 
 * Para implementar:
 * 1. Gere keys em: https://www.google.com/recaptcha/admin
 * 2. Adicione ao .env:
 *    RECAPTCHA_SECRET_KEY=seu_secret_key_aqui
 *    RECAPTCHA_SITE_KEY=seu_site_key_aqui
 */

const https = require('https');

class CaptchaValidator {
  constructor() {
    this.secretKey = process.env.RECAPTCHA_SECRET_KEY;
    this.siteKey = process.env.RECAPTCHA_SITE_KEY;
    this.enabled = !!this.secretKey;
  }

  /**
   * Verificar resposta do reCAPTCHA v3
   * @param token - Token recebido do frontend
   * @param remoteIP - IP da requisição
   * @returns {Promise<{success: boolean, score: number, action: string, challenge_ts: string}>}
   */
  async verify(token, remoteIP) {
    if (!this.enabled) {
      console.warn('⚠️  CAPTCHA não configurado. Pulando validação.');
      return { success: true, score: 1.0, warning: 'CAPTCHA desabilitado' };
    }

    return new Promise((resolve, reject) => {
      const postData = {
        secret: this.secretKey,
        response: token,
        remoteip: remoteIP
      };

      const postString = Object.entries(postData)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const options = {
        hostname: 'www.google.com',
        port: 443,
        path: '/recaptcha/api/siteverify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postString)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(new Error('Erro ao parsear resposta do CAPTCHA'));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.write(postString);
      req.end();
    });
  }

  /**
   * Middleware Express para validar CAPTCHA
   * @param requiredScore - Score mínimo (0-1). Padrão: 0.5
   */
  middleware(requiredScore = 0.5) {
    return async (req, res, next) => {
      if (!this.enabled) {
        console.warn('⚠️  CAPTCHA desabilitado em .env. Pulando middleware.');
        return next();
      }

      const token = req.body?.captchaToken || req.headers?.['x-captcha-token'];

      if (!token) {
        return res.status(400).json({
          error: 'CAPTCHA_REQUIRED',
          message: 'Token de CAPTCHA obrigatório'
        });
      }

      try {
        const result = await this.verify(token, req.ip);

        if (!result.success) {
          return res.status(400).json({
            error: 'CAPTCHA_INVALID',
            message: 'Validação de CAPTCHA falhou',
            errors: result['error-codes'] || []
          });
        }

        // reCAPTCHA v3 > 0.7 = provavelmente humano
        // reCAPTCHA v3 < 0.3 = provavelmente bot
        if (result.score < requiredScore) {
          console.warn(`⚠️  Score de CAPTCHA baixo: ${result.score} (IP: ${req.ip})`);
          return res.status(403).json({
            error: 'CAPTCHA_SCORE_LOW',
            message: 'Parece que você é um bot. Tente novamente mais tarde.',
            score: result.score,
            requiredScore
          });
        }

        // Adicionar score ao request para logging/analytics
        req.captchaScore = result.score;
        req.captchaAction = result.action;

        next();
      } catch (err) {
        console.error('Erro ao validar CAPTCHA:', err);
        return res.status(500).json({
          error: 'CAPTCHA_ERROR',
          message: 'Erro ao validar CAPTCHA. Tente novamente.'
        });
      }
    };
  }

  /**
   * Obter site key para enviar ao frontend
   */
  getSiteKey() {
    return this.siteKey;
  }

  /**
   * Gerar HTML para teste manual de CAPTCHA
   */
  getTestHTML() {
    if (!this.siteKey) {
      return '<p>CAPTCHA não configurado</p>';
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Teste CAPTCHA</title>
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
      </head>
      <body>
        <h1>Teste de CAPTCHA</h1>
        <form id="testForm">
          <input type="email" name="email" placeholder="seu@email.com" required />
          <input type="text" name="password" placeholder="Senha" required />
          
          <script>
            function testCaptcha() {
              grecaptcha.ready(function() {
                grecaptcha.execute('${this.siteKey}', { action: 'register' }).then(function(token) {
                  document.getElementById('captchaToken').value = token;
                  document.getElementById('testForm').submit();
                });
              });
            }
          </script>
          
          <input type="hidden" id="captchaToken" name="captchaToken" />
          <button type="button" onclick="testCaptcha()">Testar CAPTCHA</button>
        </form>
      </body>
      </html>
    `;
  }
}

module.exports = new CaptchaValidator();
