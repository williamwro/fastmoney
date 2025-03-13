
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

type UserData = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
};

type AuthContextType = {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email for access control
const ADMIN_EMAIL = 'william@makecard.com.br';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session and set up auth state listener
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await updateUserState(session.user);
      }
      
      // Set up auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session) {
            await updateUserState(session.user);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
      );
      
      setIsLoading(false);
      
      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);
  
  // Function to get user profile data from the profiles table
  const updateUserState = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    
    try {
      // Get user profile from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('name, is_admin')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Create profile if it doesn't exist yet (for new users)
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              name: authUser.email?.split('@')[0] || 'User',
              email: authUser.email,
              is_admin: authUser.email === ADMIN_EMAIL
            });
            
          if (insertError) {
            console.error('Error creating user profile:', insertError);
          } else {
            // Retry fetching after creating
            const { data: newData } = await supabase
              .from('profiles')
              .select('name, is_admin')
              .eq('id', authUser.id)
              .single();
              
            if (newData) {
              setUser({
                id: authUser.id,
                name: newData.name,
                email: authUser.email || '',
                isAdmin: newData.is_admin || authUser.email === ADMIN_EMAIL
              });
              return;
            }
          }
        }
        
        // Fallback if there's an error with the profile
        setUser({
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          isAdmin: authUser.email === ADMIN_EMAIL
        });
        return;
      }
      
      setUser({
        id: authUser.id,
        name: data.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        isAdmin: data.is_admin || authUser.email === ADMIN_EMAIL
      });
    } catch (error) {
      console.error('Error in updateUserState:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Successfully logged in');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Login failed');
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
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            email,
            is_admin: email === ADMIN_EMAIL
          });
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
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
    } else {
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: !!user?.isAdmin,
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
