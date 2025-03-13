
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

export const useResendConfirmation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const resendConfirmationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        toast.error('Falha ao reenviar o email de confirmação. ' + error.message);
        throw error;
      }
      
      toast.success('Email de confirmação reenviado. Por favor, verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    resendConfirmationEmail
  };
};
