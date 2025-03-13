
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
    console.log('Updating user state for:', authUser.id);
    
    // Get user profile from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('name, is_admin')
      .eq('id', authUser.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      
      // If profile doesn't exist yet, create one for the user
      if (error.code === 'PGRST116') {
        const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
        const userEmail = authUser.email || '';
        const isAdmin = userEmail === ADMIN_EMAIL;
        
        console.log('Creating profile for new user:', { userName, userEmail, isAdmin });
        
        // Create profile for new user
        await createUserProfile(
          authUser.id,
          userName,
          userEmail,
          isAdmin
        );
        
        // Return basic user data even if profile creation failed
        return {
          id: authUser.id,
          name: userName,
          email: userEmail,
          isAdmin
        };
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
    
    // Simpler insert without updated_at field
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
      
    if (error) {
      console.error('Error creating profile in database:', error);
      
      // Update auth metadata as a fallback
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
      console.log('Profile created successfully');
      return true;
    }
  } catch (error) {
    console.error('Unexpected error in createUserProfile:', error);
    return false;
  }
};
