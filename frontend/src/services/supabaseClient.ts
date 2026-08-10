import { createClient } from '@supabase/supabase-js';

// URL limpa sem o /rest/v1/ no final
const supabaseUrl = 'https://otnpmswawwkaifsguidy.supabase.co/rest/v1'; 

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bnBtc3dhd3drYWlmc2d1aWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNDA3OTMsImV4cCI6MjEwMTYxNjc5M30._rMuNg0MkhkvtfOG0AH6Du7IuE4lwQg0qSYz3JSs52Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
