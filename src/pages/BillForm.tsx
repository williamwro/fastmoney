import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Bill, useBills } from '@/context/BillContext';
import { Category } from '@/hooks/useCategoryManagement';
import { supabase } from '@/integrations/supabase/client';
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
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { getCategoryInfo } from '@/utils/formatters';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const billSchema = z.object({
  vendorName: z.string().min(3, { message: 'O nome do fornecedor deve ter pelo menos 3 caracteres' }),
  amount: z.string().refine(val => {
    if (val === '') return true;
    return !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }, {
    message: 'O valor deve ser um número maior que zero',
  }),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Data de vencimento inválida',
  }),
  category: z.string(),
  id_categoria: z.string().nullable(),
  status: z.enum(['paid', 'unpaid']),
  notes: z.string().optional(),
  // New installment fields
  hasInstallments: z.boolean().default(false),
  installmentsCount: z.string().refine(val => {
    if (val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num <= 48;
  }, {
    message: 'Número de parcelas deve ser um número entre 1 e 48',
  }).optional(),
  installmentsTotal: z.string().refine(val => {
    if (val === '') return true;
    return !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }, {
    message: 'Valor total deve ser um número maior que zero',
  }).optional(),
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
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
  
  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      vendorName: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      category: '',
      id_categoria: null,
      status: 'unpaid',
      notes: '',
      hasInstallments: false,
      installmentsCount: '',
      installmentsTotal: '',
    },
  });
  
  useEffect(() => {
    if (bill) {
      form.reset({
        vendorName: bill.vendorName,
        amount: bill.amount.toString(),
        dueDate: bill.dueDate.split('T')[0],
        category: bill.category,
        id_categoria: bill.id_categoria,
        status: bill.status,
        notes: bill.notes || '',
        hasInstallments: false,
      });
    }
  }, [bill, form]);

  const hasInstallments = form.watch('hasInstallments');
  
  const onSubmit = async (values: BillFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (values.hasInstallments && values.installmentsCount && values.installmentsTotal) {
        const installmentsCount = parseInt(values.installmentsCount);
        const totalAmount = parseFloat(values.installmentsTotal);
        const installmentAmount = totalAmount / installmentsCount;
        const firstDueDate = new Date(values.dueDate);
        
        const installmentPromises = Array.from({ length: installmentsCount }).map((_, index) => {
          const dueDate = new Date(firstDueDate);
          dueDate.setDate(dueDate.getDate() + (index * 30));
          
          const installmentBill = {
            vendorName: `${values.vendorName} - Parcela ${index + 1}/${installmentsCount}`,
            amount: installmentAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            category: values.category,
            id_categoria: values.id_categoria,
            status: values.status,
            notes: values.notes ? `${values.notes} - Parcela ${index + 1} de ${installmentsCount}` : `Parcela ${index + 1} de ${installmentsCount}`,
          };
          
          return addBill(installmentBill);
        });
        
        await Promise.all(installmentPromises);
      } else {
        const formattedBill = {
          vendorName: values.vendorName,
          amount: values.amount === '' ? 0 : parseFloat(values.amount),
          dueDate: values.dueDate,
          category: values.category,
          id_categoria: values.id_categoria,
          status: values.status,
          notes: values.notes,
        };
        
        if (isEditMode && id) {
          updateBill(id, formattedBill);
        } else {
          addBill(formattedBill);
        }
      }
      
      navigate('/bills');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Ocorreu um erro ao salvar a conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    
    if (selectedCategory) {
      form.setValue('id_categoria', categoryId);
      form.setValue('category', selectedCategory.nome_categoria);
    }
  };

  if (authLoading || (isEditMode && billsLoading) || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col text-left mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Editar Conta' : 'Nova Conta'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isEditMode ? 'Atualize os detalhes da conta' : 'Preencha os detalhes da nova conta a pagar'}
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border dark:border-gray-700 p-6 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="vendorName"
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
                
                {!hasInstallments && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="" 
                              {...field} 
                              type="number"
                              step="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dueDate"
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
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="id_categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select 
                          onValueChange={(value) => handleCategoryChange(value)} 
                          defaultValue={field.value || undefined}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center">
                                  <span className="mr-2">{getCategoryInfo(category.nome_categoria.toLowerCase()).icon}</span>
                                  <span>{category.nome_categoria}</span>
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
                  name="hasInstallments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Parcelamento</FormLabel>
                        <FormDescription>
                          Dividir esta conta em parcelas mensais
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isEditMode}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {hasInstallments && !isEditMode && (
                  <div className="space-y-4 rounded-lg border p-4 bg-slate-50">
                    <h3 className="font-medium text-lg">Configuração das Parcelas</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="installmentsCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade de Parcelas</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="48"
                                placeholder="Ex: 12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="installmentsTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Total</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Valor total da conta"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data do Primeiro Vencimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>As parcelas serão criadas com 30 dias de intervalo entre cada vencimento.</p>
                      
                      {form.watch('installmentsCount') && form.watch('installmentsTotal') && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="font-medium text-blue-800">
                            Valor de cada parcela: R$ 
                            {(parseFloat(form.watch('installmentsTotal') || '0') / 
                              parseInt(form.watch('installmentsCount') || '1')).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
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
