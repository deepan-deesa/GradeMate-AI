import { createClient } from '@supabase/supabase-js';

const url = 'https://frxxudsztexkgtmdbuea.supabase.co';
const key = 'sb_publishable_ljn2hydrAqeQe2G1iZweKQ_fXU0JWxP';

console.log('Connecting to Supabase at:', url);

const supabase = createClient(url, key);

async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('Supabase Auth Ping Error:', error.message);
    } else {
      console.log('✓ Successfully connected to Supabase endpoint!');
      console.log('Session status:', data ? 'Valid session response' : 'No active session');
    }
  } catch (err: any) {
    console.error('Connection error:', err.message);
  }
}

testConnection();
