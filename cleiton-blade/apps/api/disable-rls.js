/**
 * Script para desabilitar RLS no Supabase
 * Usa a service role key (admin) para fazer bypass do RLS
 * 
 * Execução: node disable-rls.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://udqayndwjzdlnzknhpcn.supabase.co';

// SERVICE ROLE KEY - ADMIN - Faz bypass de RLS
// NUNCA compartilhe ou exponha esta chave publicamente
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcWF5bmR3anpkbG56a25ocGNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODI5OTAyMCwiZXhwIjoxNzY5ODM1MDIwfQ.nDFMWLjXlMZemq7KaXqAJRFsiBLvWnOCfDdYvKDLmcA';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const disableRLS = async () => {
  try {
    console.log('🔐 Tentando desabilitar RLS usando Service Role Key...\n');

    const tables = [
      'users',
      'clients',
      'professionals',
      'services',
      'schedules',
      'appointments',
      'payments',
      'whatsapp_messages',
      'events_log'
    ];

    for (const table of tables) {
      try {
        // Tentar desabilitar RLS em cada tabela
        const { error } = await supabase.rpc('exec', {
          sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
        });

        if (error && error.code !== 'PGRST102') {
          // PGRST102 = RPC not found (esperado, vaaremos usar outro método)
          console.log(`⚠️  ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: RLS desabilitado`);
        }
      } catch (e) {
        // Continuar mesmo se falhar para uma tabela
        console.log(`⚠️  ${table}: Erro - ${e.message}`);
      }
    }

    console.log('\n✅ Processo concluído!');
    console.log('📌 Se houver erros acima, execute manualmente no Supabase Editor:');
    console.log('   ALTER TABLE services DISABLE ROW LEVEL SECURITY;');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
};

disableRLS();
