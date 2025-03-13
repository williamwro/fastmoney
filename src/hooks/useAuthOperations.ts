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
      
      console.log('Login response:', { data, error });
      
      if (error) {
        throw error;
      }
      
      toast.success('Successfully logged in');
      return data;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Login error details:', authError);
      
      // Handle specific error codes
      if (authError.code === 'email_not_confirmed') {
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
      } else if (authError.message.includes('invalid_credentials')) {
        toast.error('Email ou senha incorretos. Por favor, tente novamente.');
      } else {
        toast.error(authError.message || 'Falha no login');
      }
      
      // For demo purposes, add a direct login option for the specific admin user
      if (email === 'william@makecard.com.br') {
        console.log('Creating test user account...');
        try {
          // Try to create the admin account if it doesn't exist
          const { data, error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: 'William Admin'
              }
            }
          });
          
          if (signupError) {
            console.error('Failed to create test account:', signupError);
          } else if (data.user) {
            await createUserProfile(data.user.id, 'William Admin', email, true);
            toast.success('Conta de teste criada. Por favor, verifique seu email para confirmar a conta.');
          }
        } catch (createError) {
          console.error('Error creating test account:', createError);
        }
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Create a profile for the new user
      if (data.user) {
        await createUserProfile(data.user.id, name, email);
      }
      
      toast.success('Account created successfully');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Signup failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
      return false;
    } else {
      toast.success('Logged out successfully');
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
