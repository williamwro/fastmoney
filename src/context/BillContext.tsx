import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type Bill = {
  id: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  category: string;
  id_categoria: string | null;
  id_depositante: string | null;
  status: 'paid' | 'unpaid';
  notes?: string;
  numero_nota_fiscal?: string;
  createdAt: string;
  updatedAt: string;
};

export type BillInput = Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>;

type BillContextType = {
  bills: Bill[];
  isLoading: boolean;
  getBill: (id: string) => Bill | undefined;
  addBill: (bill: BillInput) => Promise<void>;
  updateBill: (id: string, bill: Partial<BillInput>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markBillAsPaid: (id: string) => Promise<void>;
  filterBills: (status?: 'paid' | 'unpaid' | 'all', category?: string | 'all', search?: string) => Bill[];
  getTotalDue: () => number;
  getOverdueBills: () => Bill[];
  getDueSoonBills: () => Bill[];
};

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchBills = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const transformedBills = data.map(bill => ({
          id: bill.id,
          vendorName: bill.vendor_name,
          amount: Number(bill.amount),
          dueDate: bill.due_date,
          category: bill.category,
          id_categoria: bill.id_categoria,
          id_depositante: bill.id_depositante,
          status: bill.status as 'paid' | 'unpaid',
          notes: bill.notes,
          numero_nota_fiscal: bill.numero_nota_fiscal,
          createdAt: bill.created_at,
          updatedAt: bill.updated_at
        }));

        setBills(transformedBills);
      } catch (error) {
        console.error('Error fetching bills:', error);
        toast.error('Falha ao carregar contas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [isAuthenticated, user]);

  const getBill = (id: string) => {
    return bills.find(bill => bill.id === id);
  };

  const addBill = async (billInput: BillInput) => {
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    try {
      const dbBill = {
        vendor_name: billInput.vendorName,
        amount: billInput.amount,
        due_date: billInput.dueDate,
        category: billInput.category,
        id_categoria: billInput.id_categoria,
        id_depositante: billInput.id_depositante,
        status: billInput.status,
        notes: billInput.notes,
        numero_nota_fiscal: billInput.numero_nota_fiscal,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('bills')
        .insert(dbBill)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newBill: Bill = {
        id: data.id,
        vendorName: data.vendor_name,
        amount: Number(data.amount),
        dueDate: data.due_date,
        category: data.category,
        id_categoria: data.id_categoria,
        id_depositante: data.id_depositante,
        status: data.status as 'paid' | 'unpaid',
        notes: data.notes,
        numero_nota_fiscal: data.numero_nota_fiscal,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setBills(prevBills => [newBill, ...prevBills]);
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Falha ao adicionar conta');
    }
  };

  const updateBill = async (id: string, billUpdates: Partial<BillInput>) => {
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    try {
      const dbUpdates: any = {};
      
      if (billUpdates.vendorName) dbUpdates.vendor_name = billUpdates.vendorName;
      if (billUpdates.amount !== undefined) dbUpdates.amount = billUpdates.amount;
      if (billUpdates.dueDate) dbUpdates.due_date = billUpdates.dueDate;
      if (billUpdates.category) dbUpdates.category = billUpdates.category;
      if (billUpdates.id_categoria !== undefined) dbUpdates.id_categoria = billUpdates.id_categoria;
      if (billUpdates.id_depositante !== undefined) dbUpdates.id_depositante = billUpdates.id_depositante;
      if (billUpdates.status) dbUpdates.status = billUpdates.status;
      if (billUpdates.notes !== undefined) dbUpdates.notes = billUpdates.notes;
      if (billUpdates.numero_nota_fiscal !== undefined) dbUpdates.numero_nota_fiscal = billUpdates.numero_nota_fiscal;
      
      const { data, error } = await supabase
        .from('bills')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setBills(prevBills => {
        const updatedBills = prevBills.map(bill => 
          bill.id === id 
            ? { 
                ...bill, 
                ...billUpdates,
                updatedAt: data.updated_at 
              } 
            : bill
        );
        
        return updatedBills.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      });

      toast.success('Conta atualizada com sucesso');
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Falha ao atualizar conta');
    }
  };

  const deleteBill = async (id: string) => {
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    try {
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
      toast.error('Falha ao excluir conta');
    }
  };

  const markBillAsPaid = async (id: string) => {
    await updateBill(id, { status: 'paid' });
    toast.success('Conta marcada como paga');
  };

  const filterBills = (
    status: 'paid' | 'unpaid' | 'all' = 'all', 
    category: string | 'all' = 'all',
    search: string = ''
  ) => {
    return bills.filter(bill => {
      const matchesStatus = status === 'all' || bill.status === status;
      const matchesCategory = category === 'all' || bill.category === category;
      const matchesSearch = search === '' || 
        bill.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        (bill.notes && bill.notes.toLowerCase().includes(search.toLowerCase()));
      
      return matchesStatus && matchesCategory && matchesSearch;
    });
  };

  const getTotalDue = () => {
    return bills
      .filter(bill => bill.status === 'unpaid')
      .reduce((total, bill) => total + bill.amount, 0);
  };

  const getOverdueBills = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bills.filter(bill => {
      if (bill.status === 'paid') return false;
      
      const dueDate = new Date(bill.dueDate);
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
      
      const dueDate = new Date(bill.dueDate);
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
