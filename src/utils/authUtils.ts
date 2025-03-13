
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
    
    // Try to get the user profile from the profiles table
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
          name: data.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          isAdmin: data.is_admin || authUser.email === ADMIN_EMAIL
        };
      }
    } catch (err) {
      console.error('Error querying profiles table:', err);
    }
    
    console.log('Profile not found in database, using fallback data');
    
    // If we get here, we couldn't get a profile from the database
    // Try to create one before falling back to metadata
    const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
    const userEmail = authUser.email || '';
    const isAdmin = userEmail === ADMIN_EMAIL;
    
    // Try to create a profile
    const profileCreated = await createUserProfile(
      authUser.id,
      userName,
      userEmail,
      isAdmin
    );
    
    console.log('Profile creation attempt result:', profileCreated);
    
    // Return user data regardless of profile creation success
    return {
      id: authUser.id,
      name: userName,
      email: userEmail,
      isAdmin
    };
  } catch (error) {
    console.error('Error in updateUserState:', error);
    
    // Fallback to basic user data on any error
    if (authUser) {
      return {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        isAdmin: authUser.email === ADMIN_EMAIL
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
    const { data, error } = await supabase
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
    
    // Fallback: Update auth metadata
    try {
      console.log('Attempting to update user metadata as fallback');
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          name, 
          is_admin: isAdmin || email === ADMIN_EMAIL,
          profile_created: false
        }
      });
      
      if (metadataError) {
        console.error('Failed to update user metadata:', metadataError);
        return false;
      } else {
        console.log('Updated user metadata as fallback');
        return true;
      }
    } catch (metaError) {
      console.error('Unexpected error updating user metadata:', metaError);
      return false;
    }
  } catch (error) {
    console.error('Unexpected error in createUserProfile:', error);
    return false;
  }
};
