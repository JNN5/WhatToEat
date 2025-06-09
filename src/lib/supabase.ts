import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://enlalpfokbyhvdhlqrhn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubGFscGZva2J5aHZkaGxxcmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NjM0NjEsImV4cCI6MjA2NTAzOTQ2MX0.VY9_1-a4oaLFqaNBTbvPKgkpXPdUBhgIgFKYiz8lcEA';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);