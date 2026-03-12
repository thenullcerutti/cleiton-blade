const express = require('express');
const cors = require('cors');
const errorHandler = require('./shared/middlewares/errorHandler');
const { authMiddleware } = require('./shared/middlewares/authMiddleware');

// Importar rotas
const authRoutes = require('./modules/auth/routes');
const userRoutes = require('./modules/users/routes');
const clientRoutes = require('./modules/clients/routes');
const professionalRoutes = require('./modules/professionals/routes');
const serviceRoutes = require('./modules/services/routes');
const scheduleRoutes = require('./modules/schedules/routes');
const appointmentRoutes = require('./modules/appointments/routes');
const paymentRoutes = require('./modules/payments/routes');
const whatsappRoutes = require('./modules/whatsapp/routes');
const workingHoursRoutes = require('./routes/workingHours');
const availabilityRoutes = require('./routes/availability');
const notificationRoutes = require('./routes/notifications');

/**
 * Inicializa Express
 */
const app = express();

/**
 * Middleware de parsing
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
}));

/**
 * Middleware de logging simples
 */
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

/**
 * Middleware de autenticação JWT
 * Valida token se presente, mas não bloqueia rotas públicas
 */
app.use(authMiddleware);

/**
 * Rota de health check
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Rotas da API
 */
console.log('[APP] Loading routes...');
app.use('/auth', authRoutes);
console.log('[APP] ✓ Auth routes loaded');
app.use('/users', userRoutes);
console.log('[APP] ✓ Users routes loaded');
app.use('/clients', clientRoutes);
console.log('[APP] ✓ Clients routes loaded');
app.use('/professionals', professionalRoutes);
console.log('[APP] ✓ Professionals routes loaded');
app.use('/services', serviceRoutes);
console.log('[APP] ✓ Services routes loaded');
app.use('/schedules', scheduleRoutes);
console.log('[APP] ✓ Schedules routes loaded');
app.use('/appointments', appointmentRoutes);
console.log('[APP] ✓ Appointments routes loaded');
app.use('/payments', paymentRoutes);
console.log('[APP] ✓ Payments routes loaded');
app.use('/whatsapp', whatsappRoutes);
console.log('[APP] ✓ Whatsapp routes loaded');
app.use('/working-hours', workingHoursRoutes);
console.log('[APP] ✓ Working Hours routes loaded');
app.use('/availability', availabilityRoutes);
console.log('[APP] ✓ Availability routes loaded');
app.use('/notifications', notificationRoutes);
console.log('[APP] ✓ Notifications routes loaded');

/**
 * Rota 404
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      message: 'Rota não encontrada',
      code: 'NOT_FOUND',
    },
  });
});

/**
 * Middleware de tratamento global de erros
 * DEVE ser o último middleware
 */
app.use(errorHandler);

module.exports = app;
