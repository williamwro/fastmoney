
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserData } from '@/types/auth';

// Admin email for access control
export const ADMIN_EMAIL = 'william@makecard.com.br';

// Function to get user profile data from the profiles table
export const updateUserState = async (authUser: User | null): Promise<UserData | null> => {
  if (!authUser) {
    return null;
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
            return {
              id: authUser.id,
              name: newData.name,
              email: authUser.email || '',
              isAdmin: newData.is_admin || authUser.email === ADMIN_EMAIL
            };
          }
        }
      }
      
      // Fallback if there's an error with the profile
      return {
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        isAdmin: authUser.email === ADMIN_EMAIL
      };
    }
    
    return {
      id: authUser.id,
      name: data.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      isAdmin: data.is_admin || authUser.email === ADMIN_EMAIL
    };
  } catch (error) {
    console.error('Error in updateUserState:', error);
    return null;
  }
};

// Create a profile for the user in the profiles table
export const createUserProfile = async (userId: string, name: string, email: string, isAdmin = false) => {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      name,
      email,
      is_admin: isAdmin || email === ADMIN_EMAIL
    });
    
  if (error) {
    console.error('Error creating user profile:', error);
  }
};
