
import React, { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBills } from '@/context/BillContext';
import Navbar from '@/components/Navbar';
import BillsList from '@/components/BillsList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const Bills = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: billsLoading } = useBills();
  const [searchParams, setSearchParams] = useSearchParams();
  
  useEffect(() => {
    // Check if we have status param in URL
    const statusParam = searchParams.get('status');
    if (statusParam === 'paid' || statusParam === 'unpaid') {
      // This will be handled by the BillsList component
    }
  }, [searchParams]);
  
  if (authLoading || billsLoading) {
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
              <p className="text-gray-500 mt-1">
                Visualize, organize e gerencie suas contas
              </p>
            </div>
            
            <Link to="/bills/new">
              <Button className="mt-4 md:mt-0">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </Link>
          </div>
          
          <BillsList />
        </div>
      </main>
    </div>
  );
};

export default Bills;
