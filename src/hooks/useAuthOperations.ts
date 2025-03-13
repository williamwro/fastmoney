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
      toast.success('Login bem-sucedido');
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
      // First, aggressively clear all Supabase auth data from localStorage
      console.log('Clearing all Supabase auth data from localStorage');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          console.log(`Removing localStorage key: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      // Also clear sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          console.log(`Removing sessionStorage key: ${key}`);
          sessionStorage.removeItem(key);
        }
      });
      
      // After clearing storage, try to officially sign out via Supabase API
      console.log('Calling supabase.auth.signOut()');
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Changed to global to ensure all sessions are terminated
      });
      
      if (error) {
        console.error('Error signing out from Supabase:', error);
        toast.error('Erro ao sair da conta');
        
        // Even with an error, we've already cleared local storage so the user is effectively logged out
        console.log('User is still effectively logged out due to localStorage clearing');
        return true;
      } else {
        console.log('Logged out successfully from Supabase');
        toast.success('Sessão encerrada com sucesso');
        return true;
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast.error('Erro ao sair da conta');
      
      // Even if there's an error, we've already cleared storage so return true
      return true;
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
