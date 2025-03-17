
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Control, useWatch } from 'react-hook-form';
import { BillFormValues } from '@/types/bill';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Category } from '@/hooks/useCategoryManagement';
import { getCategoryInfo } from '@/utils/formatters';

interface BillBasicFieldsProps {
  control: Control<BillFormValues>;
  categories: Category[];
  handleCategoryChange: (categoryId: string) => void;
  hasInstallments: boolean;
}

const BillBasicFields = ({ 
  control, 
  categories, 
  handleCategoryChange,
  hasInstallments 
}: BillBasicFieldsProps) => {
  const [displayValue, setDisplayValue] = useState('');
  
  // Watch for amount changes using useWatch hook
  const amount = useWatch({
    control,
    name: "amount"
  });

  // Update displayValue when amount changes
  useEffect(() => {
    if (amount) {
      // Format the amount for display
      const formattedValue = amount.toString().replace(/\./g, ',');
      setDisplayValue(formattedValue);
    } else {
      setDisplayValue('');
    }
  }, [amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Remove anything that's not a digit, comma, or dot
    input = input.replace(/[^\d,.]/g, '');
    
    // Handle decimal separator for Brazilian format
    // 1. First, replace dots (thousand separators) with nothing
    input = input.replace(/\./g, '');
    
    // 2. Ensure only one comma for decimal separator
    const parts = input.split(',');
    if (parts.length > 2) {
      input = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // 3. If there's a comma, ensure no more than 2 digits after it
    if (input.includes(',')) {
      const [whole, decimal] = input.split(',');
      if (decimal && decimal.length > 2) {
        input = `${whole},${decimal.slice(0, 2)}`;
      }
    }
    
    // Update the display value
    setDisplayValue(input);
    
    return input;
  };

  return (
    <>
      {!hasInstallments && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="0,00" 
                    value={displayValue}
                    onChange={(e) => {
                      const formattedValue = handleAmountChange(e);
                      // Update the form field value
                      field.onChange(formattedValue);
                    }}
                    type="text"
                    inputMode="numeric"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      
      {!hasInstallments && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="datapagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Pagamento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="numero_nota_fiscal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Nota Fiscal</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: NF-e 123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="id_categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select 
                onValueChange={(value) => handleCategoryChange(value)} 
                defaultValue={field.value || undefined}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <span className="mr-2">{getCategoryInfo(category.nome_categoria.toLowerCase()).icon}</span>
                        <span>{category.nome_categoria}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unpaid">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações (opcional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Informações adicionais sobre esta conta" 
                {...field} 
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BillBasicFields;
