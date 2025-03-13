
import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { performLogin, performSignup, performLogout, performResendConfirmation } from '@/utils/authOperations';
import { toast } from "sonner";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our custom hook to manage auth state
  const { 
    user, 
    setUser, 
    isLoading, 
    setIsLoading, 
    authChecked, 
    setAuthChecked 
  } = useAuthState();

  // Wrap the login function to match the expected type
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await performLogin(email, password);
      console.log('Login bem-sucedido, dados recebidos:', data);
      
      // Atualizar o usuário se os dados forem válidos
      if (data?.user) {
        console.log('Atualizando estado do usuário com:', data.user.id);
        // Atualize o estado do usuário imediatamente para acelerar a redireção
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          isAdmin: data.user.email === 'william@makecard.com.br' || data.user.user_metadata?.is_admin === true
        });
        
        // Verificar dados definidos para debug
        return data;
      } else {
        console.error('No user data found after successful login');
        toast.error('Erro ao obter dados do usuário');
        throw new Error('No user data returned');
      }
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Wrap the signup function
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

  // Wrap the logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('Logout: Iniciando processo de logout');
      
      // Important: First set user to null to trigger UI updates
      setUser(null);
      
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

  // Wrap the resend confirmation email function
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

  // Add more verbose logging for authentication state
  console.log("AuthContext - Estado atual:", { 
    user: !!user, 
    userDetails: user ? { id: user.id, name: user.name } : 'no user',
    authChecked, 
    isAuthenticated: authChecked && !!user,
    isLoading 
  });

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: authChecked && !!user,
    isLoading,
    isAdmin: !!user?.isAdmin,
    authChecked,
    login,
    signup,
    logout,
    resendConfirmationEmail,
  };

  // Provide the context value to children
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create the custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
