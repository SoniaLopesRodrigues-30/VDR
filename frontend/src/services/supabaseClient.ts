import { createClient } from '@supabase/supabase-js';

// URL corrigida - Removido o /rest/v1 do final
const supabaseUrl = 'https://otnpmswawwkaifsguidy.supabase.co'; 

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bnBtc3dhd3drYWlmc2d1aWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNDA3OTMsImV4cCI6MjEwMTYxNjc5M30._rMuNg0MkhkvtfOG0AH6Du7IuE4lwQg0qSYz3JSs52Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
