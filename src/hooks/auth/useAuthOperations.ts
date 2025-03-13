
import { useLogin } from './useLogin';
import { useSignup } from './useSignup';
import { useLogout } from './useLogout';
import { useResendConfirmation } from './useResendConfirmation';

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
