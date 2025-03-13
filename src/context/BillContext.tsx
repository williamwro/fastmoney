
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

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
};

export type BillInput = Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>;

type BillContextType = {
  bills: Bill[];
  isLoading: boolean;
  getBill: (id: string) => Bill | undefined;
  addBill: (bill: BillInput) => void;
  updateBill: (id: string, bill: Partial<BillInput>) => void;
  deleteBill: (id: string) => void;
  markBillAsPaid: (id: string) => void;
  filterBills: (status?: 'paid' | 'unpaid' | 'all', category?: BillCategory | 'all', search?: string) => Bill[];
  getTotalDue: () => number;
  getOverdueBills: () => Bill[];
  getDueSoonBills: () => Bill[];
};

// Sample data for bills
const SAMPLE_BILLS: Bill[] = [
  {
    id: '1',
    vendorName: 'Electricity Company',
    amount: 120.50,
    dueDate: '2023-12-15',
    category: 'utilities',
    status: 'unpaid',
    notes: 'Monthly electricity bill',
    createdAt: '2023-11-30T10:00:00Z',
    updatedAt: '2023-11-30T10:00:00Z',
  },
  {
    id: '2',
    vendorName: 'Internet Provider',
    amount: 89.99,
    dueDate: '2023-12-10',
    category: 'utilities',
    status: 'unpaid',
    createdAt: '2023-11-28T14:30:00Z',
    updatedAt: '2023-11-28T14:30:00Z',
  },
  {
    id: '3',
    vendorName: 'Office Rent',
    amount: 1500.00,
    dueDate: '2023-12-01',
    category: 'rent',
    status: 'paid',
    notes: 'December office rent',
    createdAt: '2023-11-25T09:15:00Z',
    updatedAt: '2023-12-01T11:20:00Z',
  },
  {
    id: '4',
    vendorName: 'Insurance Company',
    amount: 210.75,
    dueDate: '2023-12-20',
    category: 'insurance',
    status: 'unpaid',
    notes: 'Quarterly insurance premium',
    createdAt: '2023-11-26T16:45:00Z',
    updatedAt: '2023-11-26T16:45:00Z',
  },
  {
    id: '5',
    vendorName: 'Software Subscription',
    amount: 49.99,
    dueDate: '2023-12-05',
    category: 'subscription',
    status: 'unpaid',
    createdAt: '2023-11-29T13:10:00Z',
    updatedAt: '2023-11-29T13:10:00Z',
  }
];

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load bills from localStorage or use sample data
    const loadBills = () => {
      const storedBills = localStorage.getItem('billcraft_bills');
      if (storedBills) {
        try {
          setBills(JSON.parse(storedBills));
        } catch (error) {
          console.error('Failed to parse stored bills', error);
          setBills(SAMPLE_BILLS);
        }
      } else {
        setBills(SAMPLE_BILLS);
      }
      setIsLoading(false);
    };

    // Simulate loading delay for demo purposes
    setTimeout(loadBills, 1000);
  }, []);

  // Save bills to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('billcraft_bills', JSON.stringify(bills));
    }
  }, [bills, isLoading]);

  const getBill = (id: string) => {
    return bills.find(bill => bill.id === id);
  };

  const addBill = (billInput: BillInput) => {
    const newBill: Bill = {
      ...billInput,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBills(prevBills => [...prevBills, newBill]);
    toast.success('Bill added successfully');
  };

  const updateBill = (id: string, billUpdates: Partial<BillInput>) => {
    setBills(prevBills => 
      prevBills.map(bill => 
        bill.id === id 
          ? { 
              ...bill, 
              ...billUpdates, 
              updatedAt: new Date().toISOString() 
            } 
          : bill
      )
    );
    toast.success('Bill updated successfully');
  };

  const deleteBill = (id: string) => {
    setBills(prevBills => prevBills.filter(bill => bill.id !== id));
    toast.success('Bill deleted successfully');
  };

  const markBillAsPaid = (id: string) => {
    updateBill(id, { status: 'paid' });
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
