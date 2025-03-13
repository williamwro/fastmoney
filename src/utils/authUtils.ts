
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
      // Verificamos se o usuário tem permissão para acessar o profile
      const { data: rpcResult, error: rpcError } = await supabase.rpc('get_profile', {
        user_id: authUser.id
      });
      
      if (!rpcError && rpcResult) {
        console.log('Profile found via RPC:', rpcResult);
        return {
          id: authUser.id,
          name: rpcResult.name || userName,
          email: userEmail,
          isAdmin: rpcResult.is_admin || isAdmin
        };
      } else {
        console.log('RPC fallback, trying direct query');
        
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
      }
    } catch (err) {
      console.error('Error querying profiles table:', err);
    }
    
    console.log('Profile not found in database, using fallback data');
    
    // Se chegamos aqui, vamos tentar criar um perfil
    try {
      const profileCreated = await createUserProfile(
        authUser.id,
        userName,
        userEmail,
        isAdmin
      );
      console.log('Profile creation attempted, result:', profileCreated);
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
    
    // Primeiro, verificamos se o RLS está ativo tentando criar através de uma função RPC
    // que deve ter permissões adequadas no banco de dados
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_profile', {
      user_id: userId,
      user_name: name,
      user_email: email,
      user_is_admin: isAdmin || email === ADMIN_EMAIL
    });
    
    if (!rpcError) {
      console.log('Profile created successfully via RPC:', rpcData);
      return true;
    }
    
    console.log('RPC profile creation failed, trying direct insert:', rpcError);
    
    // Se o RPC falhar, tentamos o método direto
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
