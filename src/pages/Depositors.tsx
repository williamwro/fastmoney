
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import DepositorTable from '@/components/depositors/DepositorTable';
import { DepositorProvider } from '@/context/DepositorContext';

const Depositors = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
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
    <DepositorProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <main className="container mx-auto px-4 pt-20 pb-12">
          <div className="flex flex-col text-left mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gerencie os fornecedores do sistema
            </p>
          </div>
          
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border dark:border-gray-700 p-6 shadow-sm">
            <DepositorTable />
          </div>
        </main>
      </div>
    </DepositorProvider>
  );
};

export default Depositors;
