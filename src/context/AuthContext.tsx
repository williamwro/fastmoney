
import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { performLogin, performSignup, performLogout, performResendConfirmation } from '@/utils/authOperations';

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

  // Wrap the logout function
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

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: authChecked && !!user, // Only consider authenticated if authChecked is true
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
