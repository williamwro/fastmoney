
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PwaInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e);
      console.log('PWA installation prompt is available');
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => setIsInstalled(true));
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      toast.info('Instalação não disponível no momento');
      return;
    }

    // Show the installation prompt
    (installPrompt as any).prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await (installPrompt as any).userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      toast.success('Aplicativo instalado com sucesso!');
      setInstallPrompt(null);
    } else {
      toast.info('Instalação cancelada');
    }
  };

  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-card rounded-lg shadow-lg border border-border max-w-xs">
      <div className="flex flex-col space-y-3">
        <h4 className="font-medium text-sm">Instalar o FastMoney</h4>
        <p className="text-xs text-muted-foreground">
          Instale nosso app para acesso rápido e offline às suas finanças.
        </p>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setInstallPrompt(null)}
          >
            Depois
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleInstallClick}
          >
            Instalar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
