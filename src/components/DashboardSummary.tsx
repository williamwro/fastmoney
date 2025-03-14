
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { useBills } from '@/context/BillContext';
import { AlertTriangle, Calendar, CreditCard, Wallet, CheckCircle, Clock, QrCode, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DashboardSummary: React.FC = () => {
  const { bills, getTotalDue, getOverdueBills, getDueSoonBills } = useBills();
  const [showQrCode, setShowQrCode] = useState(false);
  
  const totalUnpaid = getTotalDue();
  const totalPaid = bills
    .filter(bill => bill.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);
  const overdueBills = getOverdueBills();
  const dueSoonBills = getDueSoonBills();
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              Total a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">{formatCurrency(totalUnpaid)}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {bills.filter(b => b.status === 'unpaid').length} contas pendentes
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-300">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {bills.filter(b => b.status === 'paid').length} contas pagas
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Contas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-300">{formatCurrency(overdueBills.reduce((sum, bill) => sum + bill.amount, 0))}</div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {overdueBills.length} {overdueBills.length === 1 ? 'conta vencida' : 'contas vencidas'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Vencendo em Breve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">{formatCurrency(dueSoonBills.reduce((sum, bill) => sum + bill.amount, 0))}</div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {dueSoonBills.length} {dueSoonBills.length === 1 ? 'conta' : 'contas'} nos próximos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* QR Code button */}
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={() => setShowQrCode(true)}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Smartphone className="h-4 w-4" />
          <span>Abrir no App</span>
          <QrCode className="h-4 w-4" />
        </Button>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escaneie o QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="bg-white p-4 rounded-md shadow-md">
              <svg
                className="w-64 h-64"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="200" height="200" fill="white" />
                <path
                  d="M50 50H80V80H50V50ZM120 50H150V80H120V50ZM50 120H80V150H50V120ZM90 50H110V60H90V50ZM90 70H110V80H90V70ZM90 90H110V100H90V90ZM90 110H110V120H90V110ZM90 130H110V140H90V130ZM90 150H110V160H90V150ZM120 90H130V100H120V90ZM140 90H150V100H140V90ZM120 110H130V120H120V110ZM140 110H150V120H140V110ZM120 130H130V140H120V130ZM140 130H150V140H140V130ZM120 150H130V160H120V150ZM140 150H150V160H140V150Z"
                  fill="black"
                />
              </svg>
            </div>
            <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              Use a câmera do seu celular para escanear o código QR e abrir o aplicativo BillCraft
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardSummary;
