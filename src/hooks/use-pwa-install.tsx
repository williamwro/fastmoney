
import * as React from "react";
import { useIsMobile } from "./use-mobile";

interface PWAInstallHookReturn {
  canInstall: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<void>;
  isPWASupported: boolean;
}

export function usePWAInstall(): PWAInstallHookReturn {
  const isMobile = useIsMobile();
  const [canInstall, setCanInstall] = React.useState<boolean>(false);
  const [isStandalone, setIsStandalone] = React.useState<boolean>(false);
  const [isPWASupported, setIsPWASupported] = React.useState<boolean>(false);
  const deferredPrompt = React.useRef<any>(null);

  React.useEffect(() => {
    // Check if the app is already installed (standalone mode)
    const isInStandaloneMode = () => 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true || 
      document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode());
    
    // Check if PWA is supported
    const isPWASupportedCheck = 'serviceWorker' in navigator && 
                               window.location.protocol === 'https:';
    
    setIsPWASupported(isPWASupportedCheck);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      deferredPrompt.current = e;
      // Show install button
      setCanInstall(true);
      
      console.log('PWA install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      // Clear the deferredPrompt
      deferredPrompt.current = null;
      // Hide install button
      setCanInstall(false);
      // Update standalone status
      setIsStandalone(true);
      
      console.log('PWA installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if we need to manually trigger the install prompt
    const checkManualInstall = () => {
      // For iOS devices that don't support beforeinstallprompt
      if (isPWASupportedCheck && isMobile && !isInStandaloneMode() && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setCanInstall(true);
      }
    };
    
    checkManualInstall();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile]);

  const promptInstall = async (): Promise<void> => {
    if (deferredPrompt.current) {
      // Show the install prompt
      deferredPrompt.current.prompt();
      
      // Wait for the user to respond to the prompt
      try {
        const choiceResult = await deferredPrompt.current.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the installation');
        } else {
          console.log('User dismissed the installation');
        }
        
        // We no longer need the prompt
        deferredPrompt.current = null;
        setCanInstall(false);
      } catch (error) {
        console.error('Error during PWA installation:', error);
      }
    } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // For iOS, we need to show manual instructions
      alert('Para instalar este aplicativo no seu dispositivo iOS:\n\n1. Toque no ícone de compartilhamento (📤)\n2. Role para baixo e toque em "Adicionar à Tela de Início" (➕)\n3. Toque em "Adicionar" no canto superior direito');
    }
  };

  return {
    canInstall,
    isStandalone,
    promptInstall,
    isPWASupported
  };
}
