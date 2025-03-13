
import { createClient } from '@supabase/supabase-js';

// Para fins de teste ou desenvolvimento, insira suas credenciais aqui
// No ambiente de produção, use variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'INSIRA_SUA_URL_DO_SUPABASE_AQUI';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'INSIRA_SUA_CHAVE_ANONIMA_DO_SUPABASE_AQUI';

// Remova o erro se você inserir diretamente as credenciais
if ((supabaseUrl === 'INSIRA_SUA_URL_DO_SUPABASE_AQUI' || supabaseAnonKey === 'INSIRA_SUA_CHAVE_ANONIMA_DO_SUPABASE_AQUI') &&
    (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.error('Configurações do Supabase não encontradas. Por favor, insira suas credenciais no arquivo supabase.ts');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
