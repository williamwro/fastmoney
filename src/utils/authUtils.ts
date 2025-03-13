
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
        const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
        const userEmail = authUser.email || '';
        const isAdmin = authUser.email === ADMIN_EMAIL;
        
        console.log('Creating profile for new user:', { userName, userEmail, isAdmin });
        
        await createUserProfile(
          authUser.id,
          userName,
          userEmail,
          isAdmin
        );
        
        // Retry fetching after creating
        const { data: newData, error: retryError } = await supabase
          .from('profiles')
          .select('name, is_admin')
          .eq('id', authUser.id)
          .single();
          
        if (retryError) {
          console.error('Error fetching user profile after creation:', retryError);
          // Fallback if there's still an error
          return {
            id: authUser.id,
            name: userName,
            email: userEmail,
            isAdmin: isAdmin
          };
        }
        
        if (newData) {
          console.log('Profile created and fetched successfully:', newData);
          return {
            id: authUser.id,
            name: newData.name,
            email: userEmail,
            isAdmin: newData.is_admin || isAdmin
          };
        }
      }
      
      // Fallback if there's an error with the profile
      return {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        isAdmin: authUser.email === ADMIN_EMAIL
      };
    }
    
    return {
      id: authUser.id,
      name: data.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      isAdmin: data.is_admin || authUser.email === ADMIN_EMAIL
    };
  } catch (error) {
    console.error('Error in updateUserState:', error);
    return null;
  }
};

// Create a profile for the user in the profiles table with RLS support
export const createUserProfile = async (userId: string, name: string, email: string, isAdmin = false) => {
  try {
    console.log('Attempting to create/update profile with:', { userId, name, email, isAdmin });
    
    // First try direct insert via RLS
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name,
        email,
        is_admin: isAdmin || email === ADMIN_EMAIL,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });
      
    if (error) {
      console.error('Error in standard profile creation:', error);
      
      // If we get an error, try a more direct approach
      const { error: fallbackError } = await supabase.rpc('create_user_profile', {
        user_id: userId,
        user_name: name,
        user_email: email,
        is_user_admin: isAdmin || email === ADMIN_EMAIL
      });
      
      if (fallbackError) {
        console.error('Error in fallback RPC profile creation:', fallbackError);
        
        // Last resort: Try to update auth metadata
        try {
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
      } else {
        console.log('Created profile via RPC function');
        return true;
      }
    } else {
      console.log('Profile created successfully via standard method');
      return true;
    }
  } catch (error) {
    console.error('Unexpected error in createUserProfile:', error);
    return false;
  }
};
