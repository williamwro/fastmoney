
// This file now directly implements the hook instead of re-exporting
// to avoid circular dependencies that were causing React hook errors

import { useLogin } from './auth/useLogin';
import { useSignup } from './auth/useSignup';
import { useLogout } from './auth/useLogout';
import { useResendConfirmation } from './auth/useResendConfirmation';

export const useAuthOperations = () => {
  const { login, isLoading: loginLoading } = useLogin();
  const { signup, isLoading: signupLoading } = useSignup();
  const { logout, isLoading: logoutLoading } = useLogout();
  const { resendConfirmationEmail, isLoading: resendLoading } = useResendConfirmation();

  // Combine loading states
  const isLoading = loginLoading || signupLoading || logoutLoading || resendLoading;

  return {
    isLoading,
    login,
    signup,
    logout,
    resendConfirmationEmail
  };
};
