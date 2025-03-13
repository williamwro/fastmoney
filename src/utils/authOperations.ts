
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Perform login operation with Supabase Auth
 */
export const performLogin = async (email: string, password: string) => {
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
  return data;
};

/**
 * Perform signup operation with Supabase Auth
 */
export const performSignup = async (name: string, email: string, password: string) => {
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
};

/**
 * Perform logout operation with Supabase Auth
 */
export const performLogout = async () => {
  console.log('Performing logout operation');
  
  // Clear all auth data from localStorage and sessionStorage
  try {
    // First try normal signOut
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Error in normal signOut:', error);
      throw error;
    }
    
    console.log('Normal signOut successful');
    
    // Force clear local storage auth data as a backup
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Clear any other potential auth items
      for (const key in localStorage) {
        if (key.includes('supabase.auth')) {
          localStorage.removeItem(key);
        }
      }
      
      for (const key in sessionStorage) {
        if (key.includes('supabase.auth')) {
          sessionStorage.removeItem(key);
        }
      }
      
      console.log('Manually cleared auth data from storage');
    } catch (storageError) {
      console.error('Error clearing manual storage:', storageError);
    }
    
    return true;
  } catch (error) {
    console.error('Logout operation failed:', error);
    throw error;
  }
};

/**
 * Resend confirmation email
 */
export const performResendConfirmation = async (email: string) => {
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
  }
};
