
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type Depositor = {
  id: string;
  descri: string;
  endereco: string | null;
  num: string | null;
  cidade: string | null;
  uf: string | null;
  cnpj: string | null;
  ie: string | null;
  cpf: string | null;
  bairro: string | null;
  cep: string | null;
  created_at: string;
  updated_at: string;
};

export type DepositorInput = Omit<Depositor, 'id' | 'created_at' | 'updated_at'>;

type DepositorContextType = {
  depositors: Depositor[];
  isLoading: boolean;
  getDepositor: (id: string) => Depositor | undefined;
  addDepositor: (depositor: DepositorInput) => Promise<Depositor | null>;
  updateDepositor: (id: string, depositor: Partial<DepositorInput>) => Promise<void>;
  deleteDepositor: (id: string) => Promise<void>;
};

const DepositorContext = createContext<DepositorContextType | undefined>(undefined);

export const DepositorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [depositors, setDepositors] = useState<Depositor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchDepositors = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('depositantes')
          .select('*')
          .order('descri', { ascending: true });

        if (error) {
          throw error;
        }

        setDepositors(data);
      } catch (error) {
        console.error('Error fetching depositors:', error);
        toast.error('Falha ao carregar depositantes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepositors();
  }, [isAuthenticated, user]);

  const getDepositor = (id: string) => {
    return depositors.find(depositor => depositor.id === id);
  };

  const addDepositor = async (depositorInput: DepositorInput): Promise<Depositor | null> => {
    try {
      const { data, error } = await supabase
        .from('depositantes')
        .insert(depositorInput)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newDepositor = data as Depositor;
      setDepositors(prevDepositors => [...prevDepositors, newDepositor]);
      return newDepositor;
    } catch (error) {
      console.error('Error adding depositor:', error);
      toast.error('Falha ao adicionar depositante');
      return null;
    }
  };

  const updateDepositor = async (id: string, depositorUpdates: Partial<DepositorInput>) => {
    try {
      const { data, error } = await supabase
        .from('depositantes')
        .update(depositorUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setDepositors(prevDepositors => 
        prevDepositors.map(depositor => 
          depositor.id === id 
            ? { ...depositor, ...depositorUpdates, updated_at: data.updated_at } 
            : depositor
        )
      );

      toast.success('Depositante atualizado com sucesso');
    } catch (error) {
      console.error('Error updating depositor:', error);
      toast.error('Falha ao atualizar depositante');
    }
  };

  const deleteDepositor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('depositantes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setDepositors(prevDepositors => prevDepositors.filter(depositor => depositor.id !== id));
      toast.success('Depositante excluído com sucesso');
    } catch (error) {
      console.error('Error deleting depositor:', error);
      toast.error('Falha ao excluir depositante');
    }
  };

  return (
    <DepositorContext.Provider
      value={{
        depositors,
        isLoading,
        getDepositor,
        addDepositor,
        updateDepositor,
        deleteDepositor,
      }}
    >
      {children}
    </DepositorContext.Provider>
  );
};

export const useDepositors = () => {
  const context = useContext(DepositorContext);
  if (context === undefined) {
    throw new Error('useDepositors must be used within a DepositorProvider');
  }
  return context;
};
