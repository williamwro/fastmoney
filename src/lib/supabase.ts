
import { createClient } from '@supabase/supabase-js';

// Insira suas credenciais do Supabase aqui
const supabaseUrl = 'https://onfuyjqtclihbqvjzgrt.supabase.co'; // Exemplo: https://abcdefghijklm.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnV5anF0Y2xpaGJxdmp6Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NjYyNzgsImV4cCI6MjA1NzQ0MjI3OH0._eZGIQu5-3ob5bHdfmanYP_SVe6MGujjj_DKF2tj3yY'; // Sua chave anônima

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
