
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserData, AuthContextType } from '@/types/auth';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { updateUserState } from '@/utils/authUtils';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const { login: authLogin, signup: authSignup, logout: logoutOperation } = useAuthOperations();

  useEffect(() => {
    // Check active session and set up auth state listener
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session found:', session.user.id);
          const userData = await updateUserState(session.user);
          setUser(userData);
        } else {
          console.log('No active session found');
          setUser(null);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (_event, session) => {
            console.log('Auth state changed:', _event, session?.user?.id);
            if (session) {
              const userData = await updateUserState(session.user);
              setUser(userData);
            } else {
              setUser(null);
            }
            setIsLoading(false);
          }
        );
        
        setAuthChecked(true);
        setIsLoading(false);
        
        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsLoading(false);
        setAuthChecked(true);
      }
    };
    
    initializeAuth();
  }, []);

  // Wrap the login function to match the expected type
  const login = async (email: string, password: string) => {
    try {
      await authLogin(email, password);
    } catch (error) {
      console.error('Login error in context:', error);
      // Error is already handled in useAuthOperations
    }
  };

  // Wrap the signup function to void the return value
  const signup = async (name: string, email: string, password: string) => {
    try {
      await authSignup(name, email, password);
    } catch (error) {
      console.error('Signup error in context:', error);
      // Error is already handled in useAuthOperations
    }
  };

  const logout = async () => {
    try {
      const success = await logoutOperation();
      if (success) {
        setUser(null);
      }
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
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
