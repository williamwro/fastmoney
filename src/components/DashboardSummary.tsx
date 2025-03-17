
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { useBills } from '@/context/BillContext';
import { AlertTriangle, Calendar, CreditCard, Wallet, CheckCircle, Clock, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const DashboardSummary: React.FC = () => {
  const { bills, getTotalDue, getOverdueBills, getDueSoonBills } = useBills();
  
  const totalUnpaidExpenses = getTotalDue('pagar');
  const totalUnpaidReceivables = getTotalDue('receber');
  
  const totalPaidExpenses = bills
    .filter(bill => bill.status === 'paid' && bill.tipo === 'pagar')
    .reduce((sum, bill) => sum + bill.amount, 0);
    
  const totalPaidReceivables = bills
    .filter(bill => bill.status === 'paid' && bill.tipo === 'receber')
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  const overdueExpenses = getOverdueBills('pagar');
  const overdueReceivables = getOverdueBills('receber');
  
  const dueSoonExpenses = getDueSoonBills('pagar');
  const dueSoonReceivables = getDueSoonBills('receber');
  
  const balance = totalPaidReceivables - totalPaidExpenses;
  const pendingBalance = totalUnpaidReceivables - totalUnpaidExpenses;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center">
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Total a Pagar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">{formatCurrency(totalUnpaidExpenses)}</div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {bills.filter(b => b.status === 'unpaid' && b.tipo === 'pagar').length} contas pendentes
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center">
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Total a Receber
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800 dark:text-green-300">{formatCurrency(totalUnpaidReceivables)}</div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {bills.filter(b => b.status === 'unpaid' && b.tipo === 'receber').length} contas a receber
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Saldo Realizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Recebido: {formatCurrency(totalPaidReceivables)} | Pago: {formatCurrency(totalPaidExpenses)}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            Saldo Pendente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${pendingBalance >= 0 ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
            {formatCurrency(pendingBalance)}
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            A receber: {formatCurrency(totalUnpaidReceivables)} | A pagar: {formatCurrency(totalUnpaidExpenses)}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Contas Vencidas (Pagar)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-800 dark:text-red-300">{formatCurrency(overdueExpenses.reduce((sum, bill) => sum + bill.amount, 0))}</div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {overdueExpenses.length} {overdueExpenses.length === 1 ? 'conta vencida' : 'contas vencidas'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Contas Vencidas (Receber)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800 dark:text-orange-300">{formatCurrency(overdueReceivables.reduce((sum, bill) => sum + bill.amount, 0))}</div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            {overdueReceivables.length} {overdueReceivables.length === 1 ? 'conta vencida' : 'contas vencidas'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Vencendo em Breve (Pagar)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-300">{formatCurrency(dueSoonExpenses.reduce((sum, bill) => sum + bill.amount, 0))}</div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
            {dueSoonExpenses.length} {dueSoonExpenses.length === 1 ? 'conta' : 'contas'} nos próximos 7 dias
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Vencendo em Breve (Receber)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{formatCurrency(dueSoonReceivables.reduce((sum, bill) => sum + bill.amount, 0))}</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            {dueSoonReceivables.length} {dueSoonReceivables.length === 1 ? 'conta' : 'contas'} nos próximos 7 dias
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
