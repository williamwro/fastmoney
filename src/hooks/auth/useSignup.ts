
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting signup with:', { name, email, passwordLength: password.length });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            is_admin: email === 'william@makecard.com.br'
          }
        }
      });
      
      if (error) {
        console.error('Signup failed with error:', error);
        
        if (error.message.includes('already registered')) {
          toast.error('Este email já está registrado. Por favor, use outro email ou recupere sua senha.');
        } else {
          toast.error(error.message || 'Falha no cadastro');
        }
        
        throw error;
      }
      
      console.log('Signup response:', data);
      
      if (data.user) {
        toast.success('Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.');
        return data;
      } else {
        toast.error('Erro inesperado ao criar conta');
        throw new Error('No user data returned from signup');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    signup
  };
};
