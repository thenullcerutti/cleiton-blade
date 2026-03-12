const app = require('./app');
const config = require('./config/env');

/**
 * Inicia o servidor
 */
const PORT = config.server.port;
const NODE_ENV = config.server.nodeEnv;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🔥 CLEITON BLADE SYSTEM - Backend                        ║
║                                                            ║
║  ✨ Servidor rodando em: http://localhost:${PORT}         ║
║  🌍 Ambiente: ${NODE_ENV}                                     ║
║  🗄️  Banco de Dados: ${config.database.host}:${config.database.port}           ║
║                                                            ║
║  📚 Documentação: http://localhost:${PORT}/docs            ║
║  💓 Health Check: http://localhost:${PORT}/health          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

/**
 * Tratamento de erro não capturado
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', promise, 'razão:', reason);
});

/**
 * Tratamento de exceção não capturada
 */
process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
  process.exit(1);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor gracefully...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

module.exports = server;
