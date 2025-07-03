const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Use service role key for admin access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  try {
    // Read the SQL schema
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
      .map(s => s + ';');

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Get a preview of the statement
      const preview = statement.substring(0, 60).replace(/\n/g, ' ');
      console.log(`Executing statement ${i + 1}: ${preview}...`);
      
      // Use raw SQL execution
      const { data, error } = await supabase.rpc('query', {
        query: statement
      }).catch(async (err) => {
        // If RPC doesn't work, try using the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return { data: await response.json(), error: null };
      });

      if (error) {
        console.error(`❌ Error: ${error.message || error}`);
        // Try to continue with next statement
      } else {
        console.log(`✅ Success`);
      }
    }

    console.log('\n🎉 Database setup attempt complete!');
    
    // Verify tables
    console.log('\n📊 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (tablesError && tablesError.message.includes('does not exist')) {
      console.log('\n❌ Tables not created. Please run the schema.sql file directly in your Supabase dashboard:');
      console.log('1. Go to https://app.supabase.com/project/zvtsaikgwozotnjqgntu/editor');
      console.log('2. Copy the contents of supabase/schema.sql');
      console.log('3. Paste and run in the SQL editor');
    } else {
      console.log('\n✅ Users table verified!');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Please run the schema manually in Supabase:');
    console.log('1. Go to https://app.supabase.com/project/zvtsaikgwozotnjqgntu/editor');
    console.log('2. Copy the contents of supabase/schema.sql');
    console.log('3. Paste and run in the SQL editor');
  }
}

// Run the setup
setupDatabase();