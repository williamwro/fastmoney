
import { createClient } from '@supabase/supabase-js';

// Insira suas credenciais do Supabase aqui
const supabaseUrl = 'SUA_URL_DO_SUPABASE'; // Exemplo: https://abcdefghijklm.supabase.co
const supabaseAnonKey = 'SUA_CHAVE_ANONIMA_DO_SUPABASE'; // Sua chave anônima

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
