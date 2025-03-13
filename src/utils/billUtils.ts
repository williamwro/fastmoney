
import { Bill, BillCategory } from '@/types/bill';

export const getBill = (bills: Bill[], id: string): Bill | undefined => {
  return bills.find(bill => bill.id === id);
};

export const markBillAsPaid = async (
  id: string, 
  updateBill: (id: string, updates: { status: 'paid' }) => Promise<void>
) => {
  await updateBill(id, { status: 'paid' });
};

export const filterBills = (
  bills: Bill[],
  status: 'paid' | 'unpaid' | 'all' = 'all', 
  category: BillCategory | 'all' = 'all',
  search: string = ''
): Bill[] => {
  return bills.filter(bill => {
    const matchesStatus = status === 'all' || bill.status === status;
    const matchesCategory = category === 'all' || bill.category === category;
    const matchesSearch = search === '' || 
      bill.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      (bill.notes && bill.notes.toLowerCase().includes(search.toLowerCase()));
    
    return matchesStatus && matchesCategory && matchesSearch;
  });
};

export const getTotalDue = (bills: Bill[]): number => {
  return bills
    .filter(bill => bill.status === 'unpaid')
    .reduce((total, bill) => total + bill.amount, 0);
};

export const getOverdueBills = (bills: Bill[]): Bill[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return bills.filter(bill => {
    if (bill.status === 'paid') return false;
    
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  });
};

export const getDueSoonBills = (bills: Bill[]): Bill[] => {
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
