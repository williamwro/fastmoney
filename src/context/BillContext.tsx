
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { Bill, BillInsert, BillUpdate } from '@/types/supabase';

export type BillCategory = 
  | 'utilities' 
  | 'rent' 
  | 'insurance' 
  | 'subscription' 
  | 'services' 
  | 'supplies'
  | 'taxes'
  | 'other';

export type BillInput = Omit<BillInsert, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

type BillContextType = {
  bills: Bill[];
  isLoading: boolean;
  getBill: (id: string) => Bill | undefined;
  addBill: (bill: BillInput) => Promise<void>;
  updateBill: (id: string, bill: Partial<BillInput>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markBillAsPaid: (id: string) => Promise<void>;
  filterBills: (status?: 'paid' | 'unpaid' | 'all', category?: BillCategory | 'all', search?: string) => Bill[];
  getTotalDue: () => number;
  getOverdueBills: () => Bill[];
  getDueSoonBills: () => Bill[];
};

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Fetch bills when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBills();
    } else {
      setBills([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchBills = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Erro ao carregar as contas');
    } finally {
      setIsLoading(false);
    }
  };

  const getBill = (id: string) => {
    return bills.find(bill => bill.id === id);
  };

  const addBill = async (billInput: BillInput) => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar uma conta');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const newBill: BillInsert = {
        ...billInput,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('bills')
        .insert(newBill)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setBills(prevBills => [...prevBills, data as Bill]);
      toast.success('Conta adicionada com sucesso');
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Erro ao adicionar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBill = async (id: string, billUpdates: Partial<BillInput>) => {
    try {
      setIsLoading(true);
      
      const updates: BillUpdate = {
        ...billUpdates,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === id ? (data as Bill) : bill
        )
      );
      
      toast.success('Conta atualizada com sucesso');
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Erro ao atualizar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBill = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setBills(prevBills => prevBills.filter(bill => bill.id !== id));
      toast.success('Conta excluída com sucesso');
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Erro ao excluir conta');
    } finally {
      setIsLoading(false);
    }
  };

  const markBillAsPaid = async (id: string) => {
    await updateBill(id, { status: 'paid' });
    toast.success('Conta marcada como paga');
  };

  const filterBills = (
    status: 'paid' | 'unpaid' | 'all' = 'all', 
    category: BillCategory | 'all' = 'all',
    search: string = ''
  ) => {
    return bills.filter(bill => {
      const matchesStatus = status === 'all' || bill.status === status;
      const matchesCategory = category === 'all' || bill.category === category;
      const matchesSearch = search === '' || 
        bill.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
        (bill.notes && bill.notes.toLowerCase().includes(search.toLowerCase()));
      
      return matchesStatus && matchesCategory && matchesSearch;
    });
  };

  const getTotalDue = () => {
    return bills
      .filter(bill => bill.status === 'unpaid')
      .reduce((total, bill) => total + Number(bill.amount), 0);
  };

  const getOverdueBills = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bills.filter(bill => {
      if (bill.status === 'paid') return false;
      
      const dueDate = new Date(bill.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today;
    });
  };

  const getDueSoonBills = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const inSevenDays = new Date(today);
    inSevenDays.setDate(today.getDate() + 7);
    
    return bills.filter(bill => {
      if (bill.status === 'paid') return false;
      
      const dueDate = new Date(bill.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate >= today && dueDate <= inSevenDays;
    });
  };

  return (
    <BillContext.Provider
      value={{
        bills,
        isLoading,
        getBill,
        addBill,
        updateBill,
        deleteBill,
        markBillAsPaid,
        filterBills,
        getTotalDue,
        getOverdueBills,
        getDueSoonBills,
      }}
    >
      {children}
    </BillContext.Provider>
  );
};

export const useBills = () => {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error('useBills must be used within a BillProvider');
  }
  return context;
};
