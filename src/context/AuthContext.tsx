
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserData, AuthContextType } from '@/types/auth';
import { updateUserState } from '@/utils/authUtils';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define these functions outside the component to prevent re-creation
const performLogin = async (email: string, password: string) => {
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

const performSignup = async (name: string, email: string, password: string) => {
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

const performLogout = async () => {
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

const performResendConfirmation = async (email: string) => {
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check active session and set up auth state listener
    const initializeAuth = async () => {
      setIsLoading(true);
      console.log('Inicializando autenticação...');
      
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Sessão encontrada:', session.user.id);
          try {
            console.log('Updating user state for:', session.user.id);
            const userData = await updateUserState(session.user);
            setUser(userData);
          } catch (error) {
            console.error('Error updating user state:', error);
            // Fallback para dados básicos
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              isAdmin: session.user.email === 'william@makecard.com.br'
            });
          }
        } else {
          console.log('Nenhuma sessão ativa encontrada');
          setUser(null);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Estado de autenticação alterado:', event, session?.user?.id);
            
            if (event === 'SIGNED_OUT') {
              console.log('Usuário deslogou, limpando o estado');
              setUser(null);
              setIsLoading(false); // Ensure we're not in loading state after logout
              return;
            }
            
            if (session) {
              try {
                const userData = await updateUserState(session.user);
                setUser(userData);
              } catch (error) {
                console.error('Error during auth state change:', error);
                // Fallback para dados básicos
                setUser({
                  id: session.user.id,
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  isAdmin: session.user.email === 'william@makecard.com.br'
                });
              }
            } else {
              setUser(null);
            }
          }
        );
        
        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setUser(null);
      } finally {
        // Always set these states, even if there's an error
        setAuthChecked(true);
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Wrap the login function to match the expected type
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await performLogin(email, password);
    } catch (error) {
      console.error('Login error in context:', error);
      // Error is already handled in useAuthOperations
    } finally {
      setIsLoading(false);
    }
  };

  // Wrap the signup function to void the return value
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await performSignup(name, email, password);
    } catch (error) {
      console.error('Signup error in context:', error);
      // Error is already handled in useAuthOperations
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('Logout: Iniciando processo de logout');
      
      // Important: First set user to null to trigger UI updates
      setUser(null);
      setAuthChecked(true);
      
      // Then call the logout operation to clean up server-side
      await performLogout();
      
      console.log('Logout operation complete');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear user even if there was an error
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      await performResendConfirmation(email);
    } catch (error) {
      console.error('Resend confirmation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: !!user?.isAdmin,
        authChecked,
        login,
        signup,
        logout,
        resendConfirmationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
