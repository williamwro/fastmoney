
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Bill, useBills } from '@/context/BillContext';
import { useDepositors, Depositor } from '@/context/DepositorContext';
import { Category } from '@/hooks/useCategoryManagement';
import { billSchema, BillFormValues } from '@/types/bill';
import LottieSuccess from '@/components/LottieSuccess';
import successAnimation from '@/assets/success-animation.json';

interface SelectOption {
  value: string;
  label: string;
}

export const useBillForm = () => {
  const { bills, getBill, addBill, updateBill, isLoading: billsLoading } = useBills();
  const { depositors, isLoading: depositorsLoading } = useDepositors();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bill, setBill] = useState<Bill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedDepositor, setSelectedDepositor] = useState<Depositor | null>(null);
  const [depositorOptions, setDepositorOptions] = useState<SelectOption[]>([]);
  
  const isEditMode = !!id;
  
  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      id_depositante: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      category: '',
      id_categoria: null,
      status: 'unpaid',
      notes: '',
      numero_nota_fiscal: '',
      hasInstallments: false,
      installmentsCount: '',
      installmentsTotal: '',
    },
  });
  
  useEffect(() => {
    if (isEditMode && !billsLoading) {
      const foundBill = getBill(id);
      if (foundBill) {
        setBill(foundBill);
        
        // If the bill has a depositor, find it
        if (foundBill.id_depositante) {
          const findDepositor = depositors.find(d => d.id === foundBill.id_depositante);
          if (findDepositor) {
            setSelectedDepositor(findDepositor);
          }
        }
      } else {
        setError('Conta não encontrada');
      }
    }
  }, [id, getBill, isEditMode, billsLoading, depositors]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('nome_categoria', { ascending: true });

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setError('Falha ao carregar categorias');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Create options for react-select from depositors
  useEffect(() => {
    if (depositors && depositors.length > 0) {
      const options = depositors.map(depositor => ({
        value: depositor.id,
        label: depositor.descri
      }));
      setDepositorOptions(options);
    }
  }, [depositors]);
  
  useEffect(() => {
    if (bill) {
      form.reset({
        id_depositante: bill.id_depositante || '',
        amount: bill.amount.toString().replace('.', ','),
        dueDate: bill.dueDate.split('T')[0],
        category: bill.category,
        id_categoria: bill.id_categoria,
        status: bill.status,
        notes: bill.notes || '',
        numero_nota_fiscal: bill.numero_nota_fiscal || '',
        hasInstallments: false,
      });
    }
  }, [bill, form]);

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    
    if (selectedCategory) {
      form.setValue('id_categoria', categoryId);
      form.setValue('category', selectedCategory.nome_categoria);
    }
  };

  const handleDepositorChange = (option: SelectOption | null) => {
    if (option) {
      const depositor = depositors.find(d => d.id === option.value);
      if (depositor) {
        form.setValue('id_depositante', option.value);
        setSelectedDepositor(depositor);
      }
    } else {
      form.setValue('id_depositante', '');
      setSelectedDepositor(null);
    }
  };
  
  const onSubmit = async (values: BillFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Find the depositor to get its name
      const depositor = depositors.find(d => d.id === values.id_depositante);
      if (!depositor) {
        throw new Error('Depositante não encontrado');
      }

      // Convert amount string with comma to number with dot
      const amountValue = typeof values.amount === 'string' 
        ? parseFloat(values.amount.replace(',', '.')) 
        : values.amount;

      if (values.hasInstallments && values.installmentsCount && values.installmentsTotal) {
        const installmentsCount = parseInt(values.installmentsCount);
        const totalAmount = parseFloat(String(values.installmentsTotal).replace(',', '.'));
        const installmentAmount = totalAmount / installmentsCount;
        const firstDueDate = new Date(values.dueDate);
        
        const installmentPromises = Array.from({ length: installmentsCount }).map((_, index) => {
          const dueDate = new Date(firstDueDate);
          dueDate.setDate(dueDate.getDate() + (index * 30));
          
          const installmentBill = {
            // Use depositor name as vendor name
            vendorName: `${depositor.descri} - Parcela ${index + 1}/${installmentsCount}`,
            amount: installmentAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            category: values.category,
            id_categoria: values.id_categoria,
            id_depositante: values.id_depositante,
            status: values.status,
            numero_nota_fiscal: values.numero_nota_fiscal,
            notes: values.notes ? `${values.notes} - Parcela ${index + 1} de ${installmentsCount}` : `Parcela ${index + 1} de ${installmentsCount}`,
          };
          
          return addBill(installmentBill);
        });
        
        await Promise.all(installmentPromises);
      } else {
        const formattedBill = {
          // Use depositor name as vendor name
          vendorName: depositor.descri,
          amount: values.amount === '' ? 0 : amountValue,
          dueDate: values.dueDate,
          category: values.category,
          id_categoria: values.id_categoria,
          id_depositante: values.id_depositante,
          status: values.status,
          numero_nota_fiscal: values.numero_nota_fiscal,
          notes: values.notes,
        };
        
        if (isEditMode && id) {
          updateBill(id, formattedBill);
        } else {
          addBill(formattedBill);
        }
      }
      
      toast.custom(() => (
        <div className="w-full min-w-[350px] md:min-w-[450px] bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-6 mb-4 border border-green-100 dark:border-green-800 animate-in slide-in-from-bottom-5">
          <div className="flex-1 w-0 flex items-center">
            <div className="w-16 h-16 flex-shrink-0">
              <LottieSuccess 
                animationData={successAnimation} 
                loop={false}
              />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-lg font-medium text-green-800 dark:text-green-300">
                Conta salva com sucesso!
              </p>
            </div>
          </div>
          <button 
            onClick={() => toast.dismiss()} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
          >
            <span className="sr-only">Fechar</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      });
      
      setTimeout(() => {
        navigate('/bills');
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Ocorreu um erro ao salvar a conta. Tente novamente.');
      
      toast.error("Erro ao salvar conta", {
        description: "Ocorreu um erro ao salvar a conta. Tente novamente.",
        position: "top-center",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    isEditMode,
    bill,
    error,
    categories,
    selectedDepositor,
    depositorOptions,
    isLoading: billsLoading || depositorsLoading || loadingCategories,
    handleCategoryChange,
    handleDepositorChange,
    onSubmit
  };
};
