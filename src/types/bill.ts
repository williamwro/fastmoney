
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

export type BillContextType = {
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
