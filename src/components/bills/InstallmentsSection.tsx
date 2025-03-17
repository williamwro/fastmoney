
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Control, UseFormWatch, useWatch } from 'react-hook-form';
import { BillFormValues } from '@/types/bill';

interface InstallmentsSectionProps {
  control: Control<BillFormValues>;
  watch: UseFormWatch<BillFormValues>;
  isEditMode: boolean;
}

const InstallmentsSection = ({ control, watch, isEditMode }: InstallmentsSectionProps) => {
  const hasInstallments = watch('hasInstallments');
  const installmentsCount = watch('installmentsCount');
  const installmentsTotal = watch('installmentsTotal');
  const [installmentValue, setInstallmentValue] = useState<string>('0,00');
  
  // Calculate installment value when count or total changes
  useEffect(() => {
    if (installmentsCount && installmentsTotal) {
      try {
        const count = parseInt(installmentsCount);
        if (count <= 0) return;
        
        let total: number;
        if (typeof installmentsTotal === 'string') {
          // Convert from Brazilian format (1.234,56) to number
          const sanitizedTotal = installmentsTotal.replace(/\./g, '').replace(',', '.');
          total = parseFloat(sanitizedTotal);
        } else {
          total = installmentsTotal;
        }
        
        if (isNaN(total)) return;
        
        const value = total / count;
        // Format to Brazilian currency format
        setInstallmentValue(value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      } catch (e) {
        console.error('Error calculating installment value:', e);
        setInstallmentValue('0,00');
      }
    } else {
      setInstallmentValue('0,00');
    }
  }, [installmentsCount, installmentsTotal]);
  
  // Formats input to currency as user types
  const formatCurrency = (value: string) => {
    // Remove any non-numeric character except comma
    let onlyNumbers = value.replace(/[^\d,]/g, '');
    
    // Ensure only one comma
    const commaCount = (onlyNumbers.match(/,/g) || []).length;
    if (commaCount > 1) {
      const parts = onlyNumbers.split(',');
      onlyNumbers = parts[0] + ',' + parts.slice(1).join('');
    }
    
    return onlyNumbers;
  };
  
  return (
    <>
      <FormField
        control={control}
        name="hasInstallments"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Parcelamento</FormLabel>
              <FormDescription>
                Dividir esta conta em parcelas mensais
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isEditMode}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {hasInstallments && !isEditMode && (
        <div className="space-y-4 rounded-lg border p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="font-medium text-lg">Configuração das Parcelas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="installmentsCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de Parcelas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="48"
                      placeholder="Ex: 12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="installmentsTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Valor total da conta"
                      value={field.value}
                      onChange={(e) => {
                        const formattedValue = formatCurrency(e.target.value);
                        field.onChange(formattedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Primeiro Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="text-sm text-muted-foreground mt-2">
            <p>As parcelas serão criadas com 30 dias de intervalo entre cada vencimento.</p>
            
            {installmentsCount && installmentsTotal && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <p className="font-medium text-blue-800 dark:text-blue-300">
                  Valor de cada parcela: R$ {installmentValue}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default InstallmentsSection;
