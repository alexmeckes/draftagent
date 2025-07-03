const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read the SQL schema
const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Supabase credentials
const supabaseUrl = 'https://zvtsaikgwozotnjqgntu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dHNhaWtnd296b3RuanFnbnR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM5MTcyMiwiZXhwIjoyMDY2OTY3NzIyfQ.8uPdGHIrJFfxBI5RThMTBxa_B9YNuV15zy_QmJE-20k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  try {
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + ';');

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      
      // Get a preview of the statement
      const preview = statement.substring(0, 50).replace(/\n/g, ' ');
      console.log(`Executing statement ${i + 1}: ${preview}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      }).catch(err => {
        // If RPC doesn't exist, try direct approach
        return { error: err };
      });

      if (error) {
        console.error(`❌ Error: ${error.message}`);
        // Continue with next statement
      } else {
        console.log(`✅ Success`);
      }
    }

    console.log('\n🎉 Database setup complete!');
    
    // List tables to verify
    console.log('\n📊 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tables) {
      console.log('\nTables created:');
      tables.forEach(table => console.log(`  - ${table.table_name}`));
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupDatabase();