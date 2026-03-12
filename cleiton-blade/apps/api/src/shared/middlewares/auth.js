const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const { AuthenticationError, AuthorizationError } = require('../errors/AppError');

/**
 * Middleware para verificar e decodificar JWT
 * Extrai o token do header Authorization
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('Token não fornecido');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer') {
      throw new AuthenticationError('Esquema de autenticação inválido');
    }

    if (!token) {
      throw new AuthenticationError('Token não fornecido');
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expirado'));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Token inválido'));
    }

    next(error);
  }
};

/**
 * Middleware para verificar papel (role) do usuário
 * @param {string|Array} roles - Role ou array de roles permitidas
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Usuário não autenticado'));
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError('Você não tem permissão para acessar este recurso'));
    }

    next();
  };
};

/**
 * Middleware para validar dados do corpo da requisição
 * @param {Object} schema - Schema de validação (objeto com regras)
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Validação obrigatória
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = `${field} é obrigatório`;
        continue;
      }

      // Se não é obrigatório e está vazio, skip validações adicionais
      if (!value) continue;

      // Validação de tipo
      if (rules.type && typeof value !== rules.type) {
        errors[field] = `${field} deve ser do tipo ${rules.type}`;
        continue;
      }

      // Validação de comprimento mínimo
      if (rules.minLength && String(value).length < rules.minLength) {
        errors[field] = `${field} deve ter pelo menos ${rules.minLength} caracteres`;
        continue;
      }

      // Validação de comprimento máximo
      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors[field] = `${field} deve ter no máximo ${rules.maxLength} caracteres`;
        continue;
      }

      // Validação customizada
      if (rules.custom && !rules.custom(value)) {
        errors[field] = rules.customError || `${field} é inválido`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message: 'Erro de validação',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  validateBody,
};
