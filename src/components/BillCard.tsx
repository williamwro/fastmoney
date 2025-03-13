
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  formatCurrency, 
  formatDate, 
  getBillStatusInfo,
  getCategoryInfo
} from '@/utils/formatters';
import { Bill } from '@/types/supabase';
import { useBills } from '@/context/BillContext';

interface BillCardProps {
  bill: Bill;
}

const BillCard: React.FC<BillCardProps> = ({ bill }) => {
  const { markBillAsPaid, deleteBill } = useBills();
  const { statusText, badgeColor } = getBillStatusInfo(bill.dueDate, bill.status);
  const { name: categoryName, icon: categoryIcon, bgColor } = getCategoryInfo(bill.category);
  
  const handleMarkAsPaid = () => {
    markBillAsPaid(bill.id);
  };
  
  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      deleteBill(bill.id);
    }
  };
  
  return (
    <Card className="w-full transition-all duration-300 hover:shadow-md animate-scale-in">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between md:justify-start">
              <h3 className="font-medium text-lg truncate mr-2">{bill.vendorName}</h3>
              <span className={`${badgeColor} text-xs px-2 py-1 rounded-full inline-flex items-center`}>
                {statusText}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center mt-1 gap-2 text-sm text-gray-600">
              <span className={`${bgColor} px-2 py-1 rounded-full inline-flex items-center gap-1`}>
                <span>{categoryIcon}</span>
                <span>{categoryName}</span>
              </span>
              <span className="flex items-center gap-1">
                <span>Vencimento:</span>
                <span className="font-medium">{formatDate(bill.dueDate)}</span>
              </span>
            </div>
            
            {bill.notes && (
              <p className="mt-2 text-gray-500 text-sm line-clamp-1">{bill.notes}</p>
            )}
          </div>
          
          <div className="flex flex-col md:items-end">
            <span className="text-xl font-bold">{formatCurrency(bill.amount)}</span>
            
            <div className="flex items-center gap-2 mt-2">
              {bill.status === 'unpaid' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  onClick={handleMarkAsPaid}
                >
                  <Check className="h-4 w-4 mr-1" />
                  <span>Pagar</span>
                </Button>
              )}
              
              <Link to={`/bills/${bill.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1" />
                  <span>Editar</span>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillCard;
