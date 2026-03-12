const { query } = require('../../config/database');

/**
 * Repositório de agendamentos
 * Operações de banco de dados para agendamentos
 */

class AppointmentRepository {
  /**
   * Lista agendamentos com filtros
   */
  static async findAll(offset = 0, limit = 20, filters = {}) {
    // Simples SELECT sem JOINs (REST API não suporta)
    let sql = `
      SELECT 
        id, client_id, professional_id, service_id,
        appointment_datetime, status, origin, payment_status, notes,
        created_at, updated_at
      FROM appointments
      WHERE true
    `;

    const params = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (filters.clientId) {
      sql += ` AND client_id = $${paramCount++}`;
      params.push(filters.clientId);
    }

    if (filters.professionalId) {
      sql += ` AND professional_id = $${paramCount++}`;
      params.push(filters.professionalId);
    }

    if (filters.startDate) {
      sql += ` AND appointment_datetime >= $${paramCount++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND appointment_datetime <= $${paramCount++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY appointment_datetime DESC OFFSET $${paramCount++} LIMIT $${paramCount++}`;
    params.push(offset, limit);

    const appointments = await query(sql, params);
    
    // Fetch total count sem COUNT (não suportado)
    const countSql = 'SELECT id FROM appointments WHERE true';
    const countResult = await query(countSql, []);
    let total = countResult.rows.length;

    if (filters.status) {
      total = countResult.rows.filter(r => r.status === filters.status).length;
    }

    return {
      appointments: appointments.rows,
      total: total
    };
  }

  /**
   * Busca agendamento por ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        id, client_id, professional_id, service_id,
        appointment_datetime, status, origin, payment_status, notes,
        created_at, updated_at
      FROM appointments
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca agendamentos por cliente
   */
  static async findByClientId(clientId) {
    const sql = `
      SELECT 
        id, client_id, professional_id, service_id,
        appointment_datetime, status, origin, payment_status,
        created_at
      FROM appointments
      WHERE client_id = $1
      ORDER BY appointment_datetime DESC
    `;

    const result = await query(sql, [clientId]);
    return result.rows;
  }

  /**
   * Busca agendamentos por profissional
   */
  static async findByProfessionalId(professionalId) {
    const sql = `
      SELECT 
        id, client_id, professional_id, service_id,
        appointment_datetime, status, origin, payment_status,
        created_at
      FROM appointments
      WHERE professional_id = $1
      ORDER BY appointment_datetime DESC
    `;

    const result = await query(sql, [professionalId]);
    return result.rows;
  }

  /**
   * Cria novo agendamento
   */
  static async create(clientId, professionalId, serviceId, appointmentDatetime, origin = 'app', notes = null) {
    const sql = `
      INSERT INTO appointments 
      (client_id, professional_id, service_id, appointment_datetime, status, origin, payment_status, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING id, client_id, professional_id, service_id, appointment_datetime, status, origin, payment_status, notes, created_at, updated_at;
    `;

    const result = await query(sql, [
      clientId,
      professionalId,
      serviceId,
      appointmentDatetime,
      'scheduled',
      origin,
      'pending',
      notes
    ]);

    return result.rows[0];
  }

  /**
   * Atualiza status do agendamento
   */
  static async updateStatus(id, status) {
    const sql = `
      UPDATE appointments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, client_id, professional_id, service_id, appointment_datetime, status, origin, payment_status, notes, created_at, updated_at;
    `;

    const result = await query(sql, [status, id]);
    return result.rows[0];
  }

  /**
   * Atualiza status de pagamento
   */
  static async updatePaymentStatus(id, paymentStatus) {
    const sql = `
      UPDATE appointments
      SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, client_id, professional_id, service_id, appointment_datetime, status, origin, payment_status, notes, created_at, updated_at;
    `;

    const result = await query(sql, [paymentStatus, id]);
    return result.rows[0];
  }

  /**
   * Verifica conflitos de horário
   */
  static async findConflicts(professionalId, appointmentDatetime, serviceDurationMinutes) {
    // Calcula horário de fim
    const startTime = new Date(appointmentDatetime);
    const endTime = new Date(startTime.getTime() + serviceDurationMinutes * 60000);

    const sql = `
      SELECT a.id 
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.professional_id = $1
      AND a.status NOT IN ('canceled', 'no_show')
      AND a.appointment_datetime < $2
      AND (a.appointment_datetime + make_interval(mins => s.duration_minutes)) > $3
    `;

    const result = await query(sql, [professionalId, endTime.toISOString(), appointmentDatetime]);
    return result.rows.length > 0;
  }

  /**
   * Obtém agendamentos para um período
   */
  static async findByPeriod(professionalId, startDate, endDate) {
    const sql = `
      SELECT 
        id, appointment_datetime, 
        (SELECT duration_minutes FROM services WHERE id = appointments.service_id) as duration_minutes
      FROM appointments
      WHERE professional_id = $1
      AND status NOT IN ('canceled', 'no_show')
      AND appointment_datetime >= $2
      AND appointment_datetime < $3
      ORDER BY appointment_datetime ASC;
    `;

    const result = await query(sql, [professionalId, startDate, endDate]);
    return result.rows;
  }
}

module.exports = AppointmentRepository;
