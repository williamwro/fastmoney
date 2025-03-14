
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBills } from '@/context/BillContext';
import Brand from '@/components/navbar/Brand';
import NavLinks from '@/components/navbar/NavLinks';
import UserMenu from '@/components/navbar/UserMenu';
import DashboardSummary from '@/components/DashboardSummary';
import BillCard from '@/components/BillCard';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { PlusCircle, ArrowRight, AlertCircle, Smartphone, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { isLoading: authLoading, isAuthenticated, user, logout } = useAuth();
  const { getOverdueBills, getDueSoonBills, isLoading: billsLoading } = useBills();
  const [showQrCode, setShowQrCode] = useState(false);
  const isMobile = useIsMobile();
  
  const overdueBills = getOverdueBills().slice(0, 3);
  const dueSoonBills = getDueSoonBills().slice(0, 3);
  
  // App URL for QR code
  const appUrl = "https://bill-craft.lovable.app/";
  
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Redirect unauthenticated users to the login page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full bg-white dark:bg-gray-900 py-2 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Brand />
            <div className="ml-6">
              <NavLinks isAuthenticated={isAuthenticated} />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Abrir no App button */}
            <Button 
              variant="outline" 
              onClick={() => setShowQrCode(true)}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border-gray-200 dark:border-gray-700"
              size={isMobile ? "sm" : "default"}
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Abrir no App</span>
              <QrCode className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <UserMenu 
              user={user} 
              logout={logout} 
              isAuthenticated={isAuthenticated} 
            />
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 pt-6 pb-12 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="text-left">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
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
                  <CardTitle className="text-lg font-medium text-red-600 dark:text-red-500">
                    Contas Vencidas
                  </CardTitle>
                  <Link to="/bills?status=unpaid">
                    <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 p-0">
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
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
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
                  <CardTitle className="text-lg font-medium text-amber-600 dark:text-amber-500">
                    Vencendo em Breve
                  </CardTitle>
                  <Link to="/bills?status=unpaid">
                    <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 p-0">
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
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
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

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escaneie o QR Code</DialogTitle>
            <DialogDescription>
              Use a câmera do seu celular para escanear o código QR e abrir o aplicativo BillCraft
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="bg-white p-4 rounded-md shadow-md">
              {/* Using a real QR code that encodes the app URL */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`}
                alt="QR Code para o app BillCraft" 
                width="200" 
                height="200"
                className="w-64 h-64"
              />
            </div>
            <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              Ou acesse diretamente: <a href={appUrl} className="text-blue-600 dark:text-blue-400 underline">{appUrl}</a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
