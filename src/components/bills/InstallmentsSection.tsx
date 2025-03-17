
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Control, UseFormWatch } from 'react-hook-form';
import { BillFormValues } from '@/types/bill';

interface InstallmentsSectionProps {
  control: Control<BillFormValues>;
  watch: UseFormWatch<BillFormValues>;
  isEditMode: boolean;
}

const InstallmentsSection = ({ control, watch, isEditMode }: InstallmentsSectionProps) => {
  const hasInstallments = watch('hasInstallments');
  
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
                      type="number"
                      step="0.01"
                      placeholder="Valor total da conta"
                      {...field}
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
            
            {watch('installmentsCount') && watch('installmentsTotal') && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <p className="font-medium text-blue-800 dark:text-blue-300">
                  Valor de cada parcela: R$ 
                  {(parseFloat(watch('installmentsTotal') || '0') / 
                    parseInt(watch('installmentsCount') || '1')).toFixed(2)}
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
