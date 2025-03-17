
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Download, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { canInstall, promptInstall, isPWASupported, isStandalone } = usePWAInstall();
  const isMobile = useIsMobile();
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isMobile && isPWASupported && canInstall && !isStandalone) {
      const hasSeenPrompt = localStorage.getItem('pwaPromptSeen');
      if (!hasSeenPrompt) {
        setShowInstallDialog(true);
      }
    }
  }, [isMobile, isPWASupported, canInstall, isStandalone]);
  
  const handleInstall = async () => {
    try {
      await promptInstall();
      setShowInstallDialog(false);
      localStorage.setItem('pwaPromptSeen', 'true');
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "Instalação não concluída",
        description: "Tente instalar manualmente usando o menu do navegador",
        variant: "destructive"
      });
    }
  };
  
  const handleDismiss = () => {
    setShowInstallDialog(false);
    localStorage.setItem('pwaPromptSeen', 'true');
  };
  
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
          <h1 className="text-3xl font-bold text-white">FastMoney</h1>
          <p className="mt-2 text-white/80">
            Gerencie suas contas a pagar de forma simples e eficiente
          </p>
        </div>
        
        {isMobile && isPWASupported && canInstall && !isStandalone && (
          <div className="mt-4">
            <Button 
              onClick={() => setShowInstallDialog(true)}
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
      
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Instalar FastMoney</DialogTitle>
            <DialogDescription>
              Deseja instalar o FastMoney na tela principal do seu dispositivo?
              Isso permitirá que você use o aplicativo mesmo offline e com uma experiência aprimorada.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <h2 className="text-2xl font-bold">FastMoney</h2>
          </div>
          <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDismiss}>
              Agora não
            </Button>
            <Button type="button" onClick={handleInstall} className="bg-green-500 hover:bg-green-600">
              <Download className="mr-2 h-4 w-4" />
              Instalar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
