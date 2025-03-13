
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserData } from '@/types/auth';
import { updateUserState } from '@/utils/authUtils';

export const useAuthState = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check active session and set up auth state listener
    const initializeAuth = async () => {
      setIsLoading(true);
      // Start with authChecked as false until we've checked session
      setAuthChecked(false); 
      console.log('Inicializando autenticação...');
      
      try {
        // Clear any existing sessions from localStorage to force fresh check
        try {
          // This is a safety measure to clear potential stale sessions
          for (const key in localStorage) {
            if (key.includes('supabase.auth')) {
              localStorage.removeItem(key);
            }
          }
          
          for (const key in sessionStorage) {
            if (key.includes('supabase.auth')) {
              sessionStorage.removeItem(key);
            }
          }
          console.log('Limpou potenciais sessões antigas para garantir verificação limpa');
        } catch (storageError) {
          console.error('Erro ao limpar storage:', storageError);
        }
        
        // Agora verifica se há sessão ativa no Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Sessão encontrada:', session.user.id);
          try {
            console.log('Atualizando estado do usuário para:', session.user.id);
            const userData = await updateUserState(session.user);
            setUser(userData);
          } catch (error) {
            console.error('Erro ao atualizar estado do usuário:', error);
            // Fallback para dados básicos
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              isAdmin: session.user.email === 'william@makecard.com.br'
            });
          }
        } else {
          console.log('Nenhuma sessão ativa encontrada');
          setUser(null);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Estado de autenticação alterado:', event, session?.user?.id);
            
            if (event === 'SIGNED_OUT') {
              console.log('Usuário deslogou, limpando o estado');
              setUser(null);
              return;
            }
            
            if (session) {
              try {
                const userData = await updateUserState(session.user);
                setUser(userData);
              } catch (error) {
                console.error('Error during auth state change:', error);
                // Fallback para dados básicos
                setUser({
                  id: session.user.id,
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  isAdmin: session.user.email === 'william@makecard.com.br'
                });
              }
            } else {
              setUser(null);
            }
          }
        );
        
        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setUser(null);
      } finally {
        // Set these states at the end of initialization process
        setIsLoading(false);
        setAuthChecked(true);
        console.log('Autenticação inicializada, authChecked definido como true');
      }
    };
    
    initializeAuth();
  }, []);

  return {
    user,
    setUser,
    isLoading, 
    setIsLoading,
    authChecked,
    setAuthChecked
  };
};
