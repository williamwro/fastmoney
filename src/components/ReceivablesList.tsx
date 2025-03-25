
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBills } from '@/context/BillContext';
import BillCard from '@/components/BillCard';
import { getCategoryInfo } from '@/utils/formatters';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/hooks/useCategoryManagement';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ReceivablesList: React.FC = () => {
  const { filterBills, bills, isLoading } = useBills();
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [filteredBills, setFilteredBills] = useState(bills);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('nome_categoria', { ascending: true });

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);
  
  useEffect(() => {
    const filtered = filterBills(status, categoryFilter, searchQuery, 'receber', startDate, endDate);
    
    const sortedBills = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    setFilteredBills(sortedBills);
  }, [bills, status, categoryFilter, searchQuery, filterBills, startDate, endDate]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleStatusChange = (value: string) => {
    setStatus(value as 'all' | 'paid' | 'unpaid');
  };
  
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setDateRangeOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Contas a Receber', 14, 22);
    
    let statusText = 'Todas as contas';
    if (status === 'paid') statusText = 'Contas recebidas';
    if (status === 'unpaid') statusText = 'Contas pendentes';
    
    let categoryText = 'Todas as categorias';
    if (categoryFilter !== 'all') categoryText = `Categoria: ${categoryFilter}`;
    
    let dateRangeText = '';
    if (startDate && endDate) {
      dateRangeText = `Período de pagamento: ${formatDate(startDate)} a ${formatDate(endDate)}`;
    }
    
    doc.text(`${statusText} - ${categoryText}`, 14, 30);
    if (dateRangeText) {
      doc.text(dateRangeText, 14, 36);
      doc.text(`Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`, 14, 42);
    } else {
      doc.text(`Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);
    }
    
    const startY = dateRangeText ? 50 : 45;
    
    const tableColumn = ["Cliente/Fornecedor", "Valor", "Vencimento", "Pagamento", "Categoria", "Status"];
    const tableRows = filteredBills.map(bill => [
      bill.vendorName,
      formatCurrency(bill.amount),
      formatDate(bill.dueDate),
      formatDate(bill.datapagamento),
      bill.category,
      bill.status === 'paid' ? 'Recebida' : 'Pendente'
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY,
      styles: { 
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [68, 114, 196],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });
    
    const totalAmount = filteredBills.reduce((total, bill) => total + bill.amount, 0);
    const finalY = (doc as any).lastAutoTable.finalY || startY;
    
    doc.text(`Total: ${formatCurrency(totalAmount)}`, 14, finalY + 10);
    
    doc.save('contas-a-receber.pdf');
  };
  
  useEffect(() => {
    window.exportReceivablesToPDF = exportToPDF;
    
    return () => {
      delete window.exportReceivablesToPDF;
    };
  }, [filteredBills]);
  
  if (isLoading || loadingCategories) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-36 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 w-full max-w-md bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar contas..."
            className="w-full pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("flex items-center gap-1", (startDate || endDate) && "border-green-500 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200")}>
                <Calendar className="h-4 w-4 mr-1" />
                <span className={isMobile ? "" : "inline"}>
                  {startDate && endDate 
                    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                    : "Período de Pagamento"
                  }
                </span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrar por data de pagamento</h4>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <label htmlFor="startDate" className="text-sm">Data inicial</label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="endDate" className="text-sm">Data final</label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button size="sm" variant="outline" onClick={clearDateFilters}>
                    Limpar
                  </Button>
                  <Button size="sm" onClick={() => setDateRangeOpen(false)}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                <span className={isMobile ? "" : "inline"}>Categoria</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={categoryFilter} onValueChange={handleCategoryChange}>
                <DropdownMenuRadioItem value="all">
                  Todas Categorias
                </DropdownMenuRadioItem>
                {categories.map(category => (
                  <DropdownMenuRadioItem key={category.id} value={category.nome_categoria}>
                    <span className="mr-2">{getCategoryInfo(category.nome_categoria.toLowerCase()).icon}</span>
                    {category.nome_categoria}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={handleStatusChange} value={status}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unpaid" className="text-red-600">Pendentes</TabsTrigger>
          <TabsTrigger value="paid" className="text-green-600">Recebidas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-2">
          {filteredBills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conta encontrada. Tente ajustar os filtros.
            </div>
          ) : (
            filteredBills.map(bill => (
              <BillCard key={bill.id} bill={bill} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="unpaid" className="space-y-4 mt-2">
          {filteredBills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conta pendente encontrada. Tente ajustar os filtros.
            </div>
          ) : (
            filteredBills.map(bill => (
              <BillCard key={bill.id} bill={bill} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="paid" className="space-y-4 mt-2">
          {filteredBills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conta recebida encontrada. Tente ajustar os filtros.
            </div>
          ) : (
            filteredBills.map(bill => (
              <BillCard key={bill.id} bill={bill} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReceivablesList;
