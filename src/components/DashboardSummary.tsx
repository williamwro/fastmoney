
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { useBills } from '@/context/BillContext';
import { AlertTriangle, Calendar, CreditCard, Wallet, CheckCircle, Clock } from 'lucide-react';

const DashboardSummary: React.FC = () => {
  const { bills, getTotalDue, getOverdueBills, getDueSoonBills } = useBills();
  
  const totalUnpaid = getTotalDue();
  const totalPaid = bills
    .filter(bill => bill.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);
  const overdueBills = getOverdueBills();
  const dueSoonBills = getDueSoonBills();
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            Total a Pagar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">{formatCurrency(totalUnpaid)}</div>
          <p className="text-xs text-blue-600 mt-1">
            {bills.filter(b => b.status === 'unpaid').length} contas pendentes
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Total Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800">{formatCurrency(totalPaid)}</div>
          <p className="text-xs text-green-600 mt-1">
            {bills.filter(b => b.status === 'paid').length} contas pagas
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Contas Vencidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-800">{formatCurrency(overdueBills.reduce((sum, bill) => sum + bill.amount, 0))}</div>
          <p className="text-xs text-red-600 mt-1">
            {overdueBills.length} {overdueBills.length === 1 ? 'conta vencida' : 'contas vencidas'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Vencendo em Breve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800">{formatCurrency(dueSoonBills.reduce((sum, bill) => sum + bill.amount, 0))}</div>
          <p className="text-xs text-amber-600 mt-1">
            {dueSoonBills.length} {dueSoonBills.length === 1 ? 'conta' : 'contas'} nos próximos 7 dias
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
