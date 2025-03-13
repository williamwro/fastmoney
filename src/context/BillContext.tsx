
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export type BillCategory = 
  | 'utilities' 
  | 'rent' 
  | 'insurance' 
  | 'subscription' 
  | 'services' 
  | 'supplies'
  | 'taxes'
  | 'other';

export type Bill = {
  id: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  status: 'paid' | 'unpaid';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
};

export type BillInput = Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;

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
  const { user } = useAuth();

  // Load bills from Supabase
  useEffect(() => {
    const fetchBills = async () => {
      if (!user) {
        setBills([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .order('dueDate', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setBills(data || []);
      } catch (error) {
        console.error('Error fetching bills:', error);
        toast.error('Failed to load bills');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [user]);

  const getBill = (id: string) => {
    return bills.find(bill => bill.id === id);
  };

  const addBill = async (billInput: BillInput) => {
    if (!user) {
      toast.error('You must be logged in to add bills');
      return;
    }
    
    const now = new Date().toISOString();
    
    const newBill = {
      ...billInput,
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };
    
    try {
      const { data, error } = await supabase
        .from('bills')
        .insert(newBill)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setBills(prevBills => [...prevBills, data]);
      toast.success('Bill added successfully');
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill');
    }
  };

  const updateBill = async (id: string, billUpdates: Partial<BillInput>) => {
    try {
      const updates = {
        ...billUpdates,
        updatedAt: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === id ? { ...bill, ...updates } : bill
        )
      );
      
      toast.success('Bill updated successfully');
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Failed to update bill');
    }
  };

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setBills(prevBills => prevBills.filter(bill => bill.id !== id));
      toast.success('Bill deleted successfully');
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill');
    }
  };

  const markBillAsPaid = async (id: string) => {
    await updateBill(id, { status: 'paid' });
    toast.success('Bill marked as paid');
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
