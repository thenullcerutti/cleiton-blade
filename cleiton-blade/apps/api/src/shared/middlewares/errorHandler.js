const { AppError } = require('../errors/AppError');
const { formatError } = require('../utils/helpers');

/**
 * Middleware para tratamento global de erros
 * Deve ser o último middleware da aplicação
 * 
 * Enriquece logs com contexto útil para debugging
 */
const errorHandler = (err, req, res, next) => {
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const timestamp = new Date().toISOString();
  
  // Construir objeto de contexto do erro
  const errorContext = {
    errorId,
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    message: err.message,
    statusCode: err.statusCode || 500,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    userAgent: req.headers['user-agent'],
  };

  // Log estruturado para análise
  console.error('\n🔴 ═════════════════════════════════════════════════════════════');
  console.error(`   ERRO CAPTURADO [${errorId}]`);
  console.error('═════════════════════════════════════════════════════════════');
  console.error(`📅 Timestamp: ${timestamp}`);
  console.error(`🌐 Requisição: ${req.method} ${req.originalUrl}`);
  console.error(`🔐 IP: ${req.ip}`);
  console.error(`📝 Mensagem: ${err.message}`);
  console.error(`🏷️  Código: ${err.code || 'N/A'}`);
  console.error(`📊 Status HTTP: ${err.statusCode || 500}`);
  
  if (err.statusCode === 401) {
    console.error(`🔑 Tipo: Erro de Autenticação`);
  } else if (err.statusCode === 403) {
    console.error(`🚫 Tipo: Erro de Autorização`);
  } else if (err.statusCode >= 500) {
    console.error(`💥 Tipo: Erro do Servidor`);
  } else if (err.statusCode >= 400) {
    console.error(`⚠️  Tipo: Erro do Cliente`);
  }

  // Detalhes adicionais baseados no tipo de erro
  if (err.code === '23505') {
    const field = err.constraint?.match(/\w+_\w+_key/)?.[0] || 'campo';
    console.error(`💾 Erro de Banco: VIOLAÇÃO DE CHAVE ÚNICA`);
    console.error(`   Campo: ${field}`);
  } else if (err.code === '23503') {
    console.error(`💾 Erro de Banco: VIOLAÇÃO DE CHAVE ESTRANGEIRA`);
  } else if (err.code === 'ECONNREFUSED') {
    console.error(`💾 Erro de Banco: CONEXÃO NEGADA`);
    console.error(`   Verifique credenciais do Supabase em variáveis de ambiente`);
  } else if (err.code === 'PGRST116' || err.code === 'PGRST000') {
    console.error(`🔐 Erro de RLS: SEM PERMISSÃO`);
    console.error(`   Usuário não tem acesso a este recurso`);
    console.error(`   Use SERVICE_ROLE_KEY ao invés de ANON_KEY`);
  } else if (err.message && err.message.includes('fetch failed')) {
    console.error(`🌐 Erro de Conexão: NÃO CONSEGUIU CONECTAR AO SUPABASE`);
    console.error(`   Verifique SUPABASE_URL e conexão de internet`);
  } else if (err.message && err.message.includes('Token')) {
    console.error(`🔑 Erro de Token: ${err.message}`);
  }

  if (err.stack) {
    console.error(`\n📍 Stack Trace:`);
    const stackLines = err.stack.split('\n').slice(1, 4);
    stackLines.forEach(line => console.error(`   ${line.trim()}`));
  }

  console.error('═════════════════════════════════════════════════════════════\n');

  // Se for um erro da aplicação personalizado
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      formatError(err.message, err.code, errorId)
    );
  }

  // Erros de validação do banco de dados
  if (err.code === '23505') {
    // Violação de constraint unique
    const field = err.constraint?.match(/\w+_\w+_key/)?.[0] || 'campo';
    return res.status(409).json(
      formatError(`${field} já existe`, 'UNIQUE_CONSTRAINT_VIOLATION', errorId)
    );
  }

  if (err.code === '23503') {
    // Violação de foreign key
    return res.status(400).json(
      formatError('Referência inválida', 'FOREIGN_KEY_VIOLATION', errorId)
    );
  }

  // Erro de conexão com banco
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json(
      formatError('Banco de dados indisponível. Verifique credenciais do Supabase.', 'DATABASE_UNAVAILABLE', errorId)
    );
  }

  // Erro de rede/fetch
  if (err.message && err.message.includes('fetch failed')) {
    return res.status(503).json(
      formatError('Falha ao conectar ao Supabase. Verifique SUPABASE_URL e internet.', 'NETWORK_ERROR', errorId)
    );
  }

  // Erro RLS
  if (err.code === 'PGRST116' || err.code === 'PGRST000') {
    return res.status(403).json(
      formatError('Você não tem permissão para acessar este recurso', 'PERMISSION_DENIED', errorId)
    );
  }

  // Erro genérico
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message || 'Erro interno do servidor';

  return res.status(statusCode).json(
    formatError(message, code, errorId)
  );
};

module.exports = errorHandler;
