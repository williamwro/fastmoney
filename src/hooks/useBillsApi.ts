
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Bill, BillInput } from '@/types/bill';

export const useBillsApi = () => {
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

  return {
    bills,
    setBills,
    isLoading,
    addBill,
    updateBill,
    deleteBill
  };
};
