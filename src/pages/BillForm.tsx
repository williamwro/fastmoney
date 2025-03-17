import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DepositorProvider } from '@/context/DepositorContext';
import Navbar from '@/components/Navbar';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBillForm } from '@/hooks/useBillForm';
import DepositorSelector from '@/components/bills/DepositorSelector';
import BillBasicFields from '@/components/bills/BillBasicFields';
import InstallmentsSection from '@/components/bills/InstallmentsSection';
import FormActions from '@/components/bills/FormActions';

// This wrapper is needed since we're using the DepositorProvider
const BillFormWrapper = () => {
  return (
    <DepositorProvider>
      <BillForm />
    </DepositorProvider>
  );
};

const BillForm = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    form,
    isSubmitting,
    isEditMode,
    error,
    categories,
    selectedDepositor,
    depositorOptions,
    isLoading,
    handleCategoryChange,
    handleDepositorChange,
    onSubmit
  } = useBillForm();
  
  const hasInstallments = form.watch('hasInstallments');
  
  if (authLoading || isLoading) {
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
                <DepositorSelector 
                  control={form.control}
                  depositorOptions={depositorOptions}
                  selectedDepositor={selectedDepositor}
                  handleDepositorChange={handleDepositorChange}
                />
                
                <BillBasicFields 
                  control={form.control}
                  categories={categories}
                  handleCategoryChange={handleCategoryChange}
                  hasInstallments={hasInstallments}
                />
                
                <InstallmentsSection 
                  control={form.control}
                  watch={form.watch}
                  isEditMode={isEditMode}
                />
                
                <FormActions 
                  isSubmitting={isSubmitting}
                  isEditMode={isEditMode}
                />
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BillFormWrapper;
