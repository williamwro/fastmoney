
import React, { createContext, useContext } from 'react';
import { toast } from "sonner";
import { Bill, BillInput, BillCategory, BillContextType } from '@/types/bill';
import { useBillsApi } from '@/hooks/useBillsApi';
import { 
  getBill, 
  markBillAsPaid as markPaid, 
  filterBills as filterBillsUtil, 
  getTotalDue as calculateTotalDue,
  getOverdueBills as getOverdueBillsUtil,
  getDueSoonBills as getDueSoonBillsUtil
} from '@/utils/billUtils';

// Re-export types from the types file for backward compatibility
export type { Bill, BillInput, BillCategory };

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    bills, 
    isLoading, 
    addBill: addBillApi, 
    updateBill: updateBillApi,
    deleteBill: deleteBillApi
  } = useBillsApi();

  const getBillById = (id: string) => getBill(bills, id);

  const markBillAsPaid = async (id: string) => {
    await markPaid(id, updateBillApi);
    toast.success('Bill marked as paid');
  };

  const filterBills = (
    status: 'paid' | 'unpaid' | 'all' = 'all', 
    category: BillCategory | 'all' = 'all',
    search: string = ''
  ) => {
    return filterBillsUtil(bills, status, category, search);
  };

  const getTotalDue = () => calculateTotalDue(bills);
  
  const getOverdueBills = () => getOverdueBillsUtil(bills);
  
  const getDueSoonBills = () => getDueSoonBillsUtil(bills);

  return (
    <BillContext.Provider
      value={{
        bills,
        isLoading,
        getBill: getBillById,
        addBill: addBillApi,
        updateBill: updateBillApi,
        deleteBill: deleteBillApi,
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
