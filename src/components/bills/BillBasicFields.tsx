
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
import { formatBrazilianCurrency } from '@/utils/formatters';

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
    if (amount && typeof amount === 'string') {
      // Format the amount for display with proper thousands separators and comma
      const formattedValue = amount.replace(/\./g, ',');
      setDisplayValue(formattedValue);
    }
  }, [amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Remove anything that's not a digit, comma, or dot
    input = input.replace(/[^\d,.]/g, '');
    
    // Convert to Brazilian format:
    // 1. First, replace all commas with a temporary character
    input = input.replace(/,/g, 'T');
    // 2. Remove all dots (thousand separators in Brazilian format)
    input = input.replace(/\./g, '');
    // 3. Replace the temporary character back to comma
    input = input.replace(/T/g, ',');
    
    // Ensure there's only one comma
    const parts = input.split(',');
    if (parts.length > 2) {
      input = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Update the display value
    setDisplayValue(input);
    
    // Convert to a proper numeric format for the form value (replace comma with dot)
    const formValue = input.replace(',', '.');
    
    return { displayValue: input, formValue };
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
                      const { formValue } = handleAmountChange(e);
                      // Update the actual form field value with dot as decimal separator
                      field.onChange(formValue);
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
