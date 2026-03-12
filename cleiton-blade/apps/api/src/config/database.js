const { supabase, query: queryFromSupabase } = require('./supabase');

/**
 * Configuração de Banco de Dados via Supabase REST API
 * Funciona via HTTPS (porta 443) - Nunca bloqueado
 * 
 * ✅ SEM bloqueios de TCP/IP
 * ✅ Funciona atrás de qualquer firewall
 * ✅ Escalável globalmente
 */

console.log('✅ Usando Supabase REST API');
console.log(`🌐 Host: udqayndwjzdlnzknhpcn.supabase.co`);
console.log(`🔐 Protocolo: HTTPS (porta 443)\n`);

/**
 * Função query - executa queries no Supabase via REST API
 */
const query = async (sql, values = []) => {
  return queryFromSupabase(sql, values);
};

module.exports = {
  query,
  supabase
};
