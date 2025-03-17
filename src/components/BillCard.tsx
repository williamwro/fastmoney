
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
import { Bill, useBills } from '@/context/BillContext';

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
    if (window.confirm(`Tem certeza que deseja excluir esta conta ${bill.tipo === 'pagar' ? 'a pagar' : 'a receber'}?`)) {
      deleteBill(bill.id);
    }
  };

  // Determine edit route based on bill type
  const editRoute = bill.tipo === 'receber' 
    ? `/receitas/${bill.id}/edit`
    : `/bills/${bill.id}/edit`;
  
  return (
    <Card className={`w-full transition-all duration-300 hover:shadow-md animate-scale-in 
      ${bill.tipo === 'receber' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-blue-500'}`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between md:justify-start">
              <h3 className="font-medium text-lg truncate mr-2">{bill.vendorName}</h3>
              <span className={`${badgeColor} text-xs px-2 py-1 rounded-full inline-flex items-center`}>
                {bill.tipo === 'receber' 
                  ? (bill.status === 'paid' ? 'Recebido' : statusText)
                  : statusText}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center mt-1 gap-2 text-sm text-gray-600">
              <span className={`${bgColor} px-2 py-1 rounded-full inline-flex items-center gap-1`}>
                <span>{categoryIcon}</span>
                <span>{categoryName}</span>
              </span>
              <span className="flex items-center gap-1">
                <span>{bill.tipo === 'receber' ? 'Vence em:' : 'Vencimento:'}</span>
                <span className="font-medium">{formatDate(bill.dueDate)}</span>
              </span>
            </div>
            
            {bill.notes && (
              <p className="mt-2 text-gray-500 text-sm line-clamp-1">{bill.notes}</p>
            )}
          </div>
          
          <div className="flex flex-col md:items-end">
            <span className={`text-xl font-bold ${bill.tipo === 'receber' ? 'text-green-600' : 'text-blue-600'}`}>
              {formatCurrency(bill.amount)}
            </span>
            
            <div className="flex items-center gap-2 mt-2">
              {bill.status === 'unpaid' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`
                    ${bill.tipo === 'receber' 
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200' 
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200'
                    }
                  `}
                  onClick={handleMarkAsPaid}
                >
                  <Check className="h-4 w-4 mr-1" />
                  <span>{bill.tipo === 'receber' ? 'Receber' : 'Pagar'}</span>
                </Button>
              )}
              
              <Link to={editRoute}>
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
