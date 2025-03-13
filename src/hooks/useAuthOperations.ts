
import { useState } from 'react';
import { toast } from "sonner";
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/utils/authUtils';

export const useAuthOperations = () => {
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
        throw error;
      }
      
      console.log('Login successful:', data.user?.id);
      return data;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Login error details:', authError);
      
      // Handle specific error codes
      if (authError.message.includes('Email not confirmed')) {
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
      } else if (authError.message.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos. Por favor, tente novamente.');
      } else {
        toast.error(authError.message || 'Falha no login');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        toast.error('Falha ao reenviar o email de confirmação. ' + error.message);
        throw error;
      }
      
      toast.success('Email de confirmação reenviado. Por favor, verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('Starting signup process for:', { name, email });
      
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
        console.error('Signup error:', error);
        throw error;
      }
      
      console.log('Signup successful, creating profile...', data.user?.id);
      
      // Create a profile for the new user
      if (data.user) {
        const isAdmin = email === 'william@makecard.com.br';
        
        // Create the profile with multiple retries
        let profileCreated = false;
        try {
          profileCreated = await createUserProfile(
            data.user.id, 
            name, 
            email, 
            isAdmin
          );
          
          console.log('Profile creation result:', profileCreated);
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
        }
        
        // Even if profile creation failed, continue with signup
        toast.success('Conta criada com sucesso. Por favor, verifique seu email para confirmar sua conta.');
      } else {
        toast.warning('Conta criada, mas houve um problema ao configurar seu perfil.');
      }
      
      return data;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Signup error:', authError);
      toast.error(authError.message || 'Falha no cadastro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Attempting to log out');
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast.error('Erro ao sair da conta');
        return false;
      } else {
        console.log('Logged out successfully');
        toast.success('Sessão encerrada com sucesso');
        return true;
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast.error('Erro ao sair da conta');
      return false;
    }
  };

  return {
    isLoading,
    login,
    signup,
    logout,
    resendConfirmationEmail
  };
};
