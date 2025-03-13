
import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BillCategory, useBills } from '@/context/BillContext';
import BillCard from '@/components/BillCard';
import { getCategoryInfo } from '@/utils/formatters';

const BillsList: React.FC = () => {
  const { filterBills, bills, isLoading } = useBills();
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [category, setCategory] = useState<BillCategory | 'all'>('all');
  const [filteredBills, setFilteredBills] = useState(bills);
  
  useEffect(() => {
    setFilteredBills(filterBills(status, category, searchQuery));
  }, [bills, status, category, searchQuery, filterBills]);
  
  const categoryOptions: Array<{ value: BillCategory | 'all', label: string }> = [
    { value: 'all', label: 'Todas Categorias' },
    { value: 'utilities', label: 'Utilidades' },
    { value: 'rent', label: 'Aluguel' },
    { value: 'insurance', label: 'Seguro' },
    { value: 'subscription', label: 'Assinatura' },
    { value: 'services', label: 'Serviços' },
    { value: 'supplies', label: 'Suprimentos' },
    { value: 'taxes', label: 'Impostos' },
    { value: 'other', label: 'Outros' },
  ];
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleStatusChange = (value: string) => {
    setStatus(value as 'all' | 'paid' | 'unpaid');
  };
  
  const handleCategoryChange = (value: string) => {
    setCategory(value as BillCategory | 'all');
  };
  
  if (isLoading) {
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
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                <span>Categoria</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={category} onValueChange={handleCategoryChange}>
                {categoryOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.value !== 'all' && (
                      <span className="mr-2">{getCategoryInfo(option.value).icon}</span>
                    )}
                    {option.label}
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
          <TabsTrigger value="paid" className="text-green-600">Pagas</TabsTrigger>
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
              Nenhuma conta paga encontrada. Tente ajustar os filtros.
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

export default BillsList;
