
import { useState } from 'react';
import { toast } from "sonner";
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { email, passwordLength: password.length });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login failed with error:', error);
        
        // Handle specific error codes
        if (error.message.includes('Email not confirmed')) {
          toast.error('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
          
          // Try to resend confirmation email
          try {
            await supabase.auth.resend({
              type: 'signup',
              email,
            });
            toast.info('Email de confirmação reenviado. Por favor, verifique sua caixa de entrada.');
          } catch (resendError) {
            console.error('Failed to resend confirmation email:', resendError);
          }
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos. Por favor, tente novamente.');
        } else {
          toast.error(error.message || 'Falha no login');
        }
        
        throw error;
      }
      
      console.log('Login successful:', data.user?.id);
      toast.success('Login bem-sucedido');
      
      // Certifique-se de que a sessão e o usuário foram obtidos
      if (!data.user) {
        console.error('Login successful but no user returned');
        toast.error('Erro ao obter dados do usuário');
        throw new Error('No user data returned');
      }
      
      return data;
    } catch (error) {
      console.error('Login error details:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    login
  };
};
