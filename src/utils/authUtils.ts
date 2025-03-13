
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
        await createUserProfile(
          authUser.id,
          authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          authUser.email || '',
          authUser.email === ADMIN_EMAIL
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
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            isAdmin: authUser.email === ADMIN_EMAIL
          };
        }
        
        if (newData) {
          return {
            id: authUser.id,
            name: newData.name,
            email: authUser.email || '',
            isAdmin: newData.is_admin || authUser.email === ADMIN_EMAIL
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
    // First, check if the service role key is available for admin operations
    // For security, we'll use the service role key only for the admin user
    if (email === ADMIN_EMAIL) {
      console.log('Creating admin profile...');
    }
    
    // Create the profile using standard auth
    const { error } = await supabase
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
      console.error('Error creating user profile:', error);
      
      // If error is RLS related, attempt a retry with different approach
      if (error.code === '42501') {
        console.log('Attempting alternate profile creation approach...');
        
        // Try to bypass RLS with auth.updateUser for metadata
        try {
          await supabase.auth.updateUser({
            data: { name, is_admin: isAdmin || email === ADMIN_EMAIL }
          });
          console.log('Updated user metadata successfully');
        } catch (metadataError) {
          console.error('Error updating user metadata:', metadataError);
        }
      }
    } else {
      console.log('Profile created successfully for:', email);
    }
  } catch (error) {
    console.error('Unexpected error in createUserProfile:', error);
  }
};
