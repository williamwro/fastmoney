
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import AuthForm from '@/components/AuthForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Mail, LogOut } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, isLoading, authChecked, logout } = useAuth();
  const { resendConfirmationEmail } = useAuthOperations();
  const [email, setEmail] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is already logged in and *wants* to go to dashboard
  const handleGoToDashboard = () => {
    navigate('/', { replace: true });
  };
  
  // Handle user logout
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoggingOut(false);
    }
  };
  
  const handleResendEmail = async () => {
    if (!email) {
      return;
    }
    
    setResendingEmail(true);
    try {
      await resendConfirmationEmail(email);
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setResendingEmail(false);
    }
  };
  
  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
        <div className="text-white text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-t-transparent border-white rounded-full mb-4"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  // Show different loading state during authentication operations
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
        <div className="text-white text-center">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-t-transparent border-white rounded-full mb-4"></div>
          <p>Processando...</p>
        </div>
      </div>
    );
  }
  
  // If already authenticated, show options
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Você já está autenticado</h2>
          <p className="text-gray-600 mb-6">
            Você já está conectado. Gostaria de ir para o dashboard ou sair da sua conta?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleGoToDashboard}
              className="flex items-center justify-center"
            >
              Ir para Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center justify-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loggingOut ? 'Saindo...' : 'Sair da conta'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Login form for unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">FinTec</h1>
          <p className="mt-2 text-white/80">
            Gerencie suas contas a pagar de forma simples e eficiente
          </p>
        </div>
        
        <div className="mt-8">
          <AuthForm type="login" onEmailChange={setEmail} />
          
          {email && (
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={handleResendEmail}
                disabled={resendingEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                {resendingEmail ? 'Reenviando...' : 'Reenviar email de confirmação'}
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-100">
              Não tem uma conta?{' '}
              <Link to="/signup" className="font-medium text-white hover:underline">
                Cadastre-se
              </Link>
            </p>
            
            <Alert className="mt-4 bg-white/10 text-white border-white/20">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Para fins de demonstração, use:
                <div className="mt-1 font-mono">
                  Admin: william@makecard.com.br
                  <br />
                  Senha: Kb109733*
                </div>
                <div className="mt-2 text-xs">
                  O projeto agora usa Supabase para autenticação e armazenamento.
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
      
      <footer className="absolute bottom-4 text-center text-white/60 text-xs">
        &copy; {new Date().getFullYear()} TecWeb - Todos os direitos reservados
      </footer>
    </div>
  );
};

export default Login;
