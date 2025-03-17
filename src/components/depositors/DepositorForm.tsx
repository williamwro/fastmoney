
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Depositor, DepositorInput, useDepositors } from '@/context/DepositorContext';
import { searchAddressByCep } from '@/services/cepService';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Lista de estados brasileiros para o select
const ESTADOS_BRASILEIROS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

const depositorSchema = z.object({
  descri: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres' }),
  cep: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  num: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  ie: z.string().nullable().optional(),
  cpf: z.string().nullable().optional(),
});

type DepositorFormValues = z.infer<typeof depositorSchema>;

const DepositorForm = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { depositors, getDepositor, addDepositor, updateDepositor, isLoading: depositorsLoading } = useDepositors();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositor, setDepositor] = useState<Depositor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lookingUpCep, setLookingUpCep] = useState(false);
  
  const isEditMode = !!id;
  
  useEffect(() => {
    if (isEditMode && !depositorsLoading) {
      const foundDepositor = getDepositor(id);
      if (foundDepositor) {
        setDepositor(foundDepositor);
      } else {
        setError('Depositante não encontrado');
      }
    }
  }, [id, getDepositor, isEditMode, depositorsLoading]);
  
  const form = useForm<DepositorFormValues>({
    resolver: zodResolver(depositorSchema),
    defaultValues: {
      descri: '',
      cep: '',
      endereco: '',
      num: '',
      bairro: '',
      cidade: '',
      uf: '',
      cnpj: '',
      ie: '',
      cpf: '',
    },
  });
  
  useEffect(() => {
    if (depositor) {
      form.reset({
        descri: depositor.descri,
        cep: depositor.cep || '',
        endereco: depositor.endereco || '',
        num: depositor.num || '',
        bairro: depositor.bairro || '',
        cidade: depositor.cidade || '',
        uf: depositor.uf || '',
        cnpj: depositor.cnpj || '',
        ie: depositor.ie || '',
        cpf: depositor.cpf || '',
      });
    }
  }, [depositor, form]);
  
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.trim();
    if (cep && cep.length >= 8) {
      setLookingUpCep(true);
      try {
        const addressData = await searchAddressByCep(cep);
        if (addressData) {
          form.setValue('endereco', addressData.logradouro);
          form.setValue('bairro', addressData.bairro);
          form.setValue('cidade', addressData.localidade);
          form.setValue('uf', addressData.uf);
          
          // Move focus to the number field if the address was found
          setTimeout(() => {
            const numInput = document.getElementById('num');
            if (numInput) {
              numInput.focus();
            }
          }, 100);
        }
      } finally {
        setLookingUpCep(false);
      }
    }
  };
  
  const onSubmit = async (values: DepositorFormValues) => {
    setIsSubmitting(true);
    
    try {
      const depositorData: DepositorInput = {
        descri: values.descri,
        cep: values.cep || null,
        endereco: values.endereco || null,
        num: values.num || null,
        bairro: values.bairro || null,
        cidade: values.cidade || null,
        uf: values.uf || null,
        cnpj: values.cnpj || null,
        ie: values.ie || null,
        cpf: values.cpf || null,
      };
      
      if (isEditMode && id) {
        await updateDepositor(id, depositorData);
      } else {
        await addDepositor(depositorData);
      }
      
      toast.custom((id) => (
        <div className="w-full min-w-[350px] md:min-w-[450px] bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-6 mb-4 border border-green-100 dark:border-green-800 animate-in slide-in-from-bottom-5">
          <div className="flex-1 w-0 flex items-center">
            <div className="ml-4 flex-1">
              <p className="text-lg font-medium text-green-800 dark:text-green-300">
                Depositante salvo com sucesso!
              </p>
            </div>
          </div>
          <button onClick={() => toast.dismiss(id)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none">
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
        navigate('/depositors');
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Ocorreu um erro ao salvar o depositante. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (isEditMode && depositorsLoading)) {
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
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col text-left mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Editar Depositante' : 'Novo Depositante'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isEditMode ? 'Atualize os dados do depositante' : 'Preencha os dados do novo depositante'}
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
                  name="descri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome/Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa ou pessoa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="ie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inscrição Estadual</FormLabel>
                      <FormControl>
                        <Input placeholder="Inscrição Estadual" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium">Endereço</h3>
                  
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="00000-000" 
                                {...field} 
                                value={field.value || ''}
                                onBlur={handleCepBlur}
                              />
                              {lookingUpCep && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Digite o CEP para buscar o endereço automaticamente
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua, Avenida, etc" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="num"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input id="num" placeholder="123" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="uf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                              value={field.value || ''}
                            >
                              <option value="">Selecione...</option>
                              {ESTADOS_BRASILEIROS.map(estado => (
                                <option key={estado.sigla} value={estado.sigla}>
                                  {estado.nome} ({estado.sigla})
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/depositors')}
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

export default DepositorForm;
