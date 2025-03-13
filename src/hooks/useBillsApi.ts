
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
          .order('due_date', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        // Transform data from snake_case to camelCase if needed
        const formattedData = data?.map(bill => ({
          id: bill.id,
          userId: bill.user_id,
          vendorName: bill.vendor_name,
          amount: bill.amount,
          dueDate: bill.due_date,
          category: bill.category,
          status: bill.status,
          notes: bill.notes,
          createdAt: bill.created_at,
          updatedAt: bill.updated_at
        })) || [];
        
        setBills(formattedData);
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
    
    // Transform camelCase to snake_case for Supabase
    const newBillForDb = {
      user_id: user.id,
      vendor_name: billInput.vendorName,
      amount: billInput.amount,
      due_date: billInput.dueDate,
      category: billInput.category,
      status: billInput.status || 'unpaid',
      notes: billInput.notes,
      created_at: now,
      updated_at: now
    };
    
    try {
      const { data, error } = await supabase
        .from('bills')
        .insert(newBillForDb)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Transform back to camelCase for the app
      const newBill: Bill = {
        id: data.id,
        userId: data.user_id,
        vendorName: data.vendor_name,
        amount: data.amount,
        dueDate: data.due_date,
        category: data.category,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setBills(prevBills => [...prevBills, newBill]);
      toast.success('Bill added successfully');
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill');
    }
  };

  const updateBill = async (id: string, billUpdates: Partial<BillInput>) => {
    try {
      // Transform camelCase to snake_case for Supabase
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (billUpdates.vendorName !== undefined) updates.vendor_name = billUpdates.vendorName;
      if (billUpdates.amount !== undefined) updates.amount = billUpdates.amount;
      if (billUpdates.dueDate !== undefined) updates.due_date = billUpdates.dueDate;
      if (billUpdates.category !== undefined) updates.category = billUpdates.category;
      if (billUpdates.status !== undefined) updates.status = billUpdates.status;
      if (billUpdates.notes !== undefined) updates.notes = billUpdates.notes;
      
      const { error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Transform camelCase updates for the local state
      const camelCaseUpdates: Partial<Bill> = {
        updatedAt: updates.updated_at
      };
      
      if (billUpdates.vendorName !== undefined) camelCaseUpdates.vendorName = billUpdates.vendorName;
      if (billUpdates.amount !== undefined) camelCaseUpdates.amount = billUpdates.amount;
      if (billUpdates.dueDate !== undefined) camelCaseUpdates.dueDate = billUpdates.dueDate;
      if (billUpdates.category !== undefined) camelCaseUpdates.category = billUpdates.category;
      if (billUpdates.status !== undefined) camelCaseUpdates.status = billUpdates.status;
      if (billUpdates.notes !== undefined) camelCaseUpdates.notes = billUpdates.notes;
      
      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === id ? { ...bill, ...camelCaseUpdates } : bill
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
