
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
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
import { useBills } from '@/context/BillContext';
import BillCard from '@/components/BillCard';
import { getCategoryInfo } from '@/utils/formatters';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/hooks/useCategoryManagement';

const BillsList: React.FC = () => {
  const { filterBills, bills, isLoading } = useBills();
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [filteredBills, setFilteredBills] = useState(bills);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  useEffect(() => {
    // Carregar categorias do banco de dados
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
    setFilteredBills(filterBills(status, categoryFilter, searchQuery));
  }, [bills, status, categoryFilter, searchQuery, filterBills]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleStatusChange = (value: string) => {
    setStatus(value as 'all' | 'paid' | 'unpaid');
  };
  
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };
  
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
