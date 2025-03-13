
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    console.log('Attempting to log out');
    setIsLoading(true);
    
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    logout
  };
};
