
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Download, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { canInstall, promptInstall, isPWASupported, isStandalone } = usePWAInstall();
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-950 p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8 px-4">
        <div className="text-center">
          <div className="flex flex-col items-center justify-center">
            <img 
              src="/lovable-uploads/cc85aa3d-d2b3-4013-a83b-9d98030f0c56.png" 
              alt="FastMoney Logo" 
              className="h-32 w-auto mb-4"
            />
          </div>
          <p className="mt-2 text-white/80">
            Gerencie suas contas a pagar de forma simples e eficiente
          </p>
        </div>
        
        {isMobile && isPWASupported && canInstall && !isStandalone && (
          <div className="mt-4">
            <Button 
              onClick={promptInstall}
              className="w-full py-2 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600"
            >
              <Download size={18} />
              Instalar Aplicativo
            </Button>
            <p className="text-xs text-white/70 text-center mt-1">
              Instale para usar offline e ter melhor experiência
            </p>
          </div>
        )}
        
        {isMobile && !canInstall && isPWASupported && !isStandalone && (
          <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 text-white">
              <Smartphone size={20} />
              <p className="text-sm font-medium">Adicione à tela inicial</p>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Use o botão de compartilhamento (iOS) ou o menu "Adicionar à tela inicial" (Android) para instalar este app
            </p>
          </div>
        )}
        
        <div className="mt-8">
          <AuthForm type="login" />
        </div>
      </div>
      
      <footer className="absolute bottom-4 text-center text-white/60 text-xs w-full px-4">
        &copy; {new Date().getFullYear()} TecWeb - Todos os direitos reservados
      </footer>
    </div>
  );
};

export default Login;
