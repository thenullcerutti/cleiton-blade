const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const { hashPassword, comparePassword } = require('../../shared/utils/helpers');
const { AuthenticationError, ValidationError, ConflictError } = require('../../shared/errors/AppError');
const AuthRepository = require('./AuthRepository');
const EmailVerificationService = require('./EmailVerificationService');
const nodemailer = require('nodemailer');

/**
 * Serviço de autenticação
 * Lógica de negócio para autenticação (register, login, token validation)
 */

class AuthService {
  /**
   * Registra novo usuário (admin)
   */
  static async register(name, email, password, role = 'admin', ip = 'unknown', userAgent = '') {
    // Validações básicas
    if (!name || name.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
    }

    // Validação avançada de email
    const emailValidation = EmailVerificationService.validateEmailFormat(email);
    if (!emailValidation.valid) {
      throw new ValidationError(emailValidation.error);
    }

    if (!password || password.length < 6) {
      throw new ValidationError('Senha deve ter pelo menos 6 caracteres');
    }

    if (!['admin', 'professional', 'client'].includes(role)) {
      throw new ValidationError('Role inválido');
    }

    // Verificar padrões suspeitos
    if (EmailVerificationService.detectSuspiciousPatterns(email)) {
      throw new ValidationError('Email suspeito. Use um email real e verificável.');
    }

    // Calcular score de confiança
    const trustScore = EmailVerificationService.calculateTrustScore(email, ip, userAgent);
    console.log(`📊 Trust Score para ${email}: ${trustScore}/100`);

    // Se score muito baixo, bloquear registro
    if (trustScore < 20) {
      throw new AuthenticationError('Não foi possível verificar sua identidade. Tente novamente mais tarde.');
    }

    // Verifica se email já existe
    const emailExists = await AuthRepository.emailExists(email);
    if (emailExists) {
      throw new ConflictError('Email já cadastrado');
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Criar usuário COM verified_at = NULL (conta inativa)
    const user = await AuthRepository.createUnverified(name, email, passwordHash, role);

    // Gerar token de verificação
    const verificationData = EmailVerificationService.createVerificationRecord(
      user.id,
      email,
      ip,
      userAgent
    );

    // Salvar token de verificação no banco (você precisará criar um repositório para isso)
    // Por enquanto, vamos retornar o dados para que o controller salve
    const verificationLink = EmailVerificationService.getVerificationLink(verificationData.token);
    const emailHTML = EmailVerificationService.getEmailHTML(verificationLink, name);

    // Tentar enviar email (se configurado)
    try {
      await this.sendVerificationEmail(email, emailHTML);
      console.log(`✉️  Email de verificação enviado para ${email}`);
    } catch (emailError) {
      console.warn(`⚠️  Falha ao enviar email: ${emailError.message}`);
      // Não falha o registro se email falhar, mas log a tentativa
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: false,
      message: 'Cadastro realizado! Verifique seu email para ativar a conta.',
      verificationToken: verificationData.token, // Para testes/desenvolvimento
    };
  }

  /**
   * Faz login do usuário
   */
  static async login(email, password, ip = 'unknown') {
    // Validações
    if (!email || !password) {
      throw new ValidationError('Email e senha são obrigatórios');
    }

    // Busca usuário
    const user = await AuthRepository.findByEmail(email);
    if (!user) {
      // Uso defensivo: não revelar se email existe
      throw new AuthenticationError('Email ou senha inválidos');
    }

    // ⚠️ NOVA VALIDAÇÃO: verificar se email está confirmado
    // EXCETO para admins, que são criados pelo sistema
    if (user.role !== 'admin' && !user.verified_at) {
      throw new AuthenticationError(
        'Email não verificado. Verifique seu email para ativar a conta.'
      );
    }

    if (!user.active) {
      throw new AuthenticationError('Usuário inativo');
    }

    // Compara senha
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      throw new AuthenticationError('Email ou senha inválidos');
    }

    // Gera tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Gera access e refresh tokens
   */
  static generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Valida e renova token usando refresh token
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      
      const user = await AuthRepository.findById(decoded.id);
      if (!user || !user.active) {
        throw new AuthenticationError('Usuário inválido ou inativo');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError('Refresh token inválido');
    }
  }

  /**
   * Muda senha do usuário
   */
  static async changePassword(userId, currentPassword, newPassword) {
    // Validações
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Senhas são obrigatórias');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('Nova senha deve ter pelo menos 6 caracteres');
    }

    // Busca usuário
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('Usuário não encontrado');
    }

    // Compara senha atual
    const passwordMatch = await comparePassword(currentPassword, user.password_hash);
    if (!passwordMatch) {
      throw new AuthenticationError('Senha atual inválida');
    }

    // Hash da nova senha
    const newPasswordHash = await hashPassword(newPassword);

    // Atualiza senha
    await AuthRepository.updatePassword(userId, newPasswordHash);

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Valida token de verificação de email e marca como verificado
   */
  static async verifyEmail(token) {
    if (!token || token.length !== 64) {
      throw new ValidationError('Token de verificação inválido');
    }

    // Aqui você precisará buscar o registro de verificação no banco
    // Este é um exemplo simplificado
    // const verification = await EmailVerificationRepository.findByToken(token);
    
    // if (!verification) {
    //   throw new AuthenticationError('Token não encontrado');
    // }

    // if (verification.verified_at) {
    //   throw new ValidationError('Email já foi verificado');
    // }

    // if (new Date() > verification.expires_at) {
    //   throw new ValidationError('Token expirado. Solicite um novo.');
    // }

    // // Marcar como verificado
    // await EmailVerificationRepository.markAsVerified(verification.id);
    // await AuthRepository.markEmailVerified(verification.user_id);

    return { message: 'Email verificado com sucesso! Sua conta está ativa.' };
  }

  /**
   * Reenviar email de verificação
   */
  static async resendVerificationEmail(email) {
    // Buscar usuário
    const user = await AuthRepository.findByEmail(email);
    if (!user) {
      // Não revelar se email existe
      return { message: 'Se o email existe, você receberá um novo link em breve.' };
    }

    if (user.verified_at) {
      throw new ValidationError('Este email já foi verificado');
    }

    // Gerar novo token
    const verificationData = EmailVerificationService.createVerificationRecord(
      user.id,
      email,
      'unknown',
      ''
    );

    const verificationLink = EmailVerificationService.getVerificationLink(verificationData.token);
    const emailHTML = EmailVerificationService.getEmailHTML(verificationLink, user.name);

    // Enviar email
    try {
      await this.sendVerificationEmail(email, emailHTML);
      return { message: 'Email de verificação reenviado!' };
    } catch (error) {
      throw new Error('Falha ao enviar email. Tente novamente mais tarde.');
    }
  }

  /**
   * Enviar email de verificação
   */
  static async sendVerificationEmail(to, htmlContent) {
    // Configurar transporte de email
    // Exemplo com Gmail ou serviço SMTP
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@cleitonblade.com',
      to,
      subject: 'Verifique seu email - Cleiton Blade',
      html: htmlContent
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) reject(err);
        else resolve(info);
      });
    });
  }
}

module.exports = AuthService;
