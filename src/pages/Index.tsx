
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBills } from '@/context/BillContext';
import Brand from '@/components/navbar/Brand';
import NavLinks from '@/components/navbar/NavLinks';
import DashboardSummary from '@/components/DashboardSummary';
import BillCard from '@/components/BillCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { getOverdueBills, getDueSoonBills, isLoading: billsLoading } = useBills();
  
  const overdueBills = getOverdueBills().slice(0, 3);
  const dueSoonBills = getDueSoonBills().slice(0, 3);
  
  useEffect(() => {
    if (overdueBills.length > 0) {
      toast.warning(`Você tem ${overdueBills.length} conta(s) vencida(s)`, {
        description: 'Verifique suas contas para evitar juros e multas.',
        id: 'overdue-bills-notice',
        duration: 5000,
      });
    }
  }, [overdueBills.length]);
  
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-start">
            <div className="mb-2">
              <Brand />
            </div>
            <div className="mb-4">
              <NavLinks isAuthenticated={isAuthenticated} />
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 pt-6 pb-12 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="text-left">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Gerencie suas contas a pagar de forma eficiente
              </p>
            </div>
            
            <Link to="/bills/new">
              <Button className="mt-4 md:mt-0">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </Link>
          </div>
          
          <DashboardSummary />
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-red-600">
                    Contas Vencidas
                  </CardTitle>
                  <Link to="/bills?status=unpaid">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0">
                      <span className="mr-1">Ver todas</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Contas pendentes que já ultrapassaram a data de vencimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {overdueBills.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Não há contas vencidas. Continue assim!
                  </div>
                ) : (
                  overdueBills.map(bill => (
                    <BillCard key={bill.id} bill={bill} />
                  ))
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-amber-600">
                    Vencendo em Breve
                  </CardTitle>
                  <Link to="/bills?status=unpaid">
                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-0">
                      <span className="mr-1">Ver todas</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Contas que vencem nos próximos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dueSoonBills.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Não há contas vencendo em breve.
                  </div>
                ) : (
                  dueSoonBills.map(bill => (
                    <BillCard key={bill.id} bill={bill} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
