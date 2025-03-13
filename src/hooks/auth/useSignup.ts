
import { useState } from 'react';
import { toast } from "sonner";
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { createUserProfile } from '@/utils/authUtils';

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);

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

  return {
    isLoading,
    signup
  };
};
