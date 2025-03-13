
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserData } from '@/types/auth';

// Admin email for access control
export const ADMIN_EMAIL = 'william@makecard.com.br';

// Function to get user profile data from the profiles table
export const updateUserState = async (authUser: User | null): Promise<UserData | null> => {
  if (!authUser) {
    console.log('No auth user provided to updateUserState');
    return null;
  }
  
  try {
    console.log('Updating user state for:', authUser.id);
    
    // Dados básicos do usuário que serão retornados mesmo em caso de falha
    const isAdmin = authUser.email === ADMIN_EMAIL || authUser.user_metadata?.is_admin === true;
    const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
    const userEmail = authUser.email || '';
    
    // Primeiro tentamos buscar o perfil na tabela profiles
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, is_admin')
        .eq('id', authUser.id)
        .single();
      
      if (!error && data) {
        console.log('Profile found in database:', data);
        return {
          id: authUser.id,
          name: data.name || userName,
          email: userEmail,
          isAdmin: data.is_admin || isAdmin
        };
      }
    } catch (err) {
      console.error('Error querying profiles table:', err);
    }
    
    console.log('Profile not found in database, using fallback data');
    
    // Se chegamos aqui, vamos tentar criar um perfil
    try {
      await createUserProfile(
        authUser.id,
        userName,
        userEmail,
        isAdmin
      );
      console.log('Profile creation attempted');
    } catch (profileError) {
      console.error('Error creating profile, using metadata:', profileError);
    }
    
    // Sempre retornamos os dados básicos do usuário
    return {
      id: authUser.id,
      name: userName,
      email: userEmail,
      isAdmin
    };
  } catch (error) {
    console.error('Error in updateUserState:', error);
    
    // Fallback para dados básicos em caso de qualquer erro
    if (authUser) {
      return {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        isAdmin: authUser.email === ADMIN_EMAIL || authUser.user_metadata?.is_admin === true
      };
    }
    
    return null;
  }
};

// Create a profile for the user in the profiles table
export const createUserProfile = async (userId: string, name: string, email: string, isAdmin = false) => {
  try {
    console.log('Creating profile with:', { userId, name, email, isAdmin });
    
    // First method: Direct insert to profiles table
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name,
        email,
        is_admin: isAdmin || email === ADMIN_EMAIL
      }, {
        onConflict: 'id'
      });
      
    if (!error) {
      console.log('Profile created successfully via direct insert');
      return true;
    }
    
    console.error('Error creating profile in database:', error);
  } catch (error) {
    console.error('Unexpected error in createUserProfile:', error);
  }
  
  // Sempre tente atualizar os metadados como fallback
  try {
    console.log('Updating user metadata as fallback');
    const { error } = await supabase.auth.updateUser({
      data: { 
        name, 
        is_admin: isAdmin || email === ADMIN_EMAIL,
        profile_created: false
      }
    });
    
    if (error) {
      console.error('Failed to update user metadata:', error);
      return false;
    } else {
      console.log('Updated user metadata as fallback');
      return true;
    }
  } catch (metaError) {
    console.error('Unexpected error updating user metadata:', metaError);
    return false;
  }
};
