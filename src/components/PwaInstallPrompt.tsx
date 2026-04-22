import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, X, Monitor } from 'lucide-react';

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_HOURS = 24;

const PwaInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if recently dismissed
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const hoursSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSince < DISMISS_HOURS) {
        setDismissed(true);
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log('PWA installation prompt is available');
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success('FastMoney instalado com sucesso!');
    });

    // Fallback: if beforeinstallprompt didn't fire after 3s on a desktop
    // browser that supports PWAs (Chrome/Edge), offer manual instructions.
    const timer = setTimeout(() => {
      const ua = navigator.userAgent;
      const isDesktop = !/Mobi|Android|iPhone|iPad/i.test(ua);
      const isChromeOrEdge = /Chrome|Edg/i.test(ua);
      if (isDesktop && isChromeOrEdge && !installPrompt) {
        setShowManual(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      toast.info(
        'Para instalar: clique no ícone de instalação na barra de endereço do navegador (Chrome/Edge)'
      );
      return;
    }

    (installPrompt as any).prompt();
    const choiceResult = await (installPrompt as any).userChoice;

    if (choiceResult.outcome === 'accepted') {
      toast.success('Aplicativo instalado com sucesso!');
      setInstallPrompt(null);
    } else {
      toast.info('Instalação cancelada');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setInstallPrompt(null);
    setShowManual(false);
    setDismissed(true);
  };

  if (isInstalled || dismissed) return null;
  if (!installPrompt && !showManual) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-card rounded-lg shadow-lg border border-border max-w-sm animate-in slide-in-from-bottom-5">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col space-y-3 pr-4">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-sm">Instalar o FastMoney</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          {installPrompt
            ? 'Instale o app no seu computador para acesso rápido, funcionamento offline e abertura como um programa nativo.'
            : 'Para instalar no Windows: clique no ícone de instalação (⊕) na barra de endereço do Chrome ou Edge, ou abra o menu do navegador e selecione "Instalar FastMoney".'}
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            Depois
          </Button>
          {installPrompt && (
            <Button variant="default" size="sm" onClick={handleInstallClick}>
              <Download className="h-4 w-4 mr-1" />
              Instalar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
