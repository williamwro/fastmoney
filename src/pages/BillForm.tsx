
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BillCategory, useBills } from '@/context/BillContext';
import { Bill } from '@/types/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCategoryInfo } from '@/utils/formatters';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const billSchema = z.object({
  vendor_name: z.string().min(3, { message: 'O nome do fornecedor deve ter pelo menos 3 caracteres' }),
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'O valor deve ser um número maior que zero',
  }),
  due_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Data de vencimento inválida',
  }),
  category: z.enum(['utilities', 'rent', 'insurance', 'subscription', 'services', 'supplies', 'taxes', 'other']),
  status: z.enum(['paid', 'unpaid']),
  notes: z.string().optional(),
});

type BillFormValues = z.infer<typeof billSchema>;

const BillForm = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { bills, getBill, addBill, updateBill, isLoading: billsLoading } = useBills();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bill, setBill] = useState<Bill | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const isEditMode = !!id;
  
  useEffect(() => {
    if (isEditMode && !billsLoading) {
      const foundBill = getBill(id);
      if (foundBill) {
        setBill(foundBill);
      } else {
        setError('Conta não encontrada');
      }
    }
  }, [id, getBill, isEditMode, billsLoading]);
  
  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      vendor_name: '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      category: 'other',
      status: 'unpaid',
      notes: '',
    },
  });
  
  // Populate form with bill data when in edit mode and bill is loaded
  useEffect(() => {
    if (bill) {
      form.reset({
        vendor_name: bill.vendor_name,
        amount: String(bill.amount),
        due_date: new Date(bill.due_date).toISOString().split('T')[0],
        category: bill.category as BillCategory,
        status: bill.status,
        notes: bill.notes || '',
      });
    }
  }, [bill, form]);
  
  const onSubmit = async (values: BillFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert string values to appropriate types
      const formattedBill = {
        vendor_name: values.vendor_name,
        amount: parseFloat(values.amount),
        due_date: values.due_date,
        category: values.category as BillCategory,
        status: values.status,
        notes: values.notes,
      };
      
      if (isEditMode && id) {
        await updateBill(id, formattedBill);
      } else {
        await addBill(formattedBill);
      }
      
      navigate('/bills');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Ocorreu um erro ao salvar a conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || (isEditMode && billsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const categoryOptions = [
    { value: 'utilities', label: 'Utilidades' },
    { value: 'rent', label: 'Aluguel' },
    { value: 'insurance', label: 'Seguro' },
    { value: 'subscription', label: 'Assinatura' },
    { value: 'services', label: 'Serviços' },
    { value: 'supplies', label: 'Suprimentos' },
    { value: 'taxes', label: 'Impostos' },
    { value: 'other', label: 'Outros' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            {isEditMode ? 'Editar Conta' : 'Nova Conta'}
          </h1>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border p-6 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="vendor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Fornecedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Empresa de Energia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0.01" 
                            placeholder="0,00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                  <span className="mr-2">{getCategoryInfo(option.value).icon}</span>
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unpaid">Pendente</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Informações adicionais sobre esta conta" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/bills')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      isEditMode ? 'Atualizar' : 'Salvar'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BillForm;
