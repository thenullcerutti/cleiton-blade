const { formatSuccess, formatError } = require('../../shared/utils/helpers');
const AuthService = require('./AuthService');

/**
 * Controller de autenticação
 * Manipula requisições HTTP relacionadas a autenticação
 */

class AuthController {
  /**
   * POST /auth/register
   * Registra novo usuário (cliente ou admin) com verificação de email
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, role, adminKey } = req.body;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || '';

      // Por padrão, registra como cliente
      let userRole = role || 'client';

      // ✅ Permitir criação de admin se a chave correta for fornecida
      if (userRole === 'admin') {
        // Validar chave de admin
        const correctAdminKey = process.env.ADMIN_SECRET_KEY || 'cleiton-blade-admin-2026';
        console.log('🔑 Admin Key recebida:', adminKey);
        console.log('🔑 Admin Key esperada:', correctAdminKey);
        if (!adminKey || adminKey !== correctAdminKey) {
          return res.status(403).json(
            formatError(
              'Chave de admin inválida. Não pode criar conta administrador.',
              'INVALID_ADMIN_KEY'
            )
          );
        }
      }

      // Registrar com validações e gerar token de verificação
      const user = await AuthService.register(name, email, password, userRole, ip, userAgent);

      return res.status(201).json(
        formatSuccess(user, 'Cadastro realizado! Verifique seu email para ativar a conta.')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Faz login do usuário
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';

      const result = await AuthService.login(email, password, ip);

      return res.status(200).json(
        formatSuccess(result, 'Login realizado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   * Renova o access token usando refresh token
   */
  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json(
          formatError('Refresh token é obrigatório', 'MISSING_REFRESH_TOKEN')
        );
      }

      const tokens = await AuthService.refreshToken(refreshToken);

      return res.status(200).json(
        formatSuccess(tokens, 'Token renovado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /auth/change-password
   * Muda senha do usuário autenticado
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const result = await AuthService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      return res.status(200).json(
        formatSuccess(result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   * Retorna dados do usuário autenticado
   */
  static async me(req, res, next) {
    try {
      const user = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      };

      return res.status(200).json(
        formatSuccess(user)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/verify-email
   * Valida token de verificação de email
   */
  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json(
          formatError('Token de verificação obrigatório', 'MISSING_VERIFICATION_TOKEN')
        );
      }

      const result = await AuthService.verifyEmail(token);

      return res.status(200).json(
        formatSuccess(result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/resend-verification
   * Reenviar email de verificação
   */
  static async resendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json(
          formatError('Email obrigatório', 'MISSING_EMAIL')
        );
      }

      const result = await AuthService.resendVerificationEmail(email);

      return res.status(200).json(
        formatSuccess(result)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
