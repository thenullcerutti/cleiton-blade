const { query } = require('./src/config/database');

(async () => {
  try {
    const res = await query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Tabelas no banco:');
    res.rows.forEach(row => console.log('  -', row.table_name));
    process.exit(0);
  } catch (e) {
    console.error('Erro:', e.message);
    process.exit(1);
  }
})();
