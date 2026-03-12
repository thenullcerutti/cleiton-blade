/**
 * Classe base para erros da aplicação
 * Permite controlar status HTTP e mensagens de erro padronizadas
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validação de erro
 */
class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message, 400, code);
    this.name = 'ValidationError';
  }
}

/**
 * Erro de autenticação
 */
class AuthenticationError extends AppError {
  constructor(message = 'Autenticação necessária', code = 'AUTHENTICATION_ERROR') {
    super(message, 401, code);
    this.name = 'AuthenticationError';
  }
}

/**
 * Erro de autorização
 */
class AuthorizationError extends AppError {
  constructor(message = 'Você não tem permissão para acessar este recurso', code = 'AUTHORIZATION_ERROR') {
    super(message, 403, code);
    this.name = 'AuthorizationError';
  }
}

/**
 * Erro de recurso não encontrado
 */
class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado', code = 'NOT_FOUND') {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

/**
 * Erro de conflito (ex: email já registrado)
 */
class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
};
