
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Select from 'react-select';
import { Depositor } from '@/context/DepositorContext';
import { Control } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
}

interface DepositorSelectorProps {
  control: Control<any>;
  depositorOptions: SelectOption[];
  selectedDepositor: Depositor | null;
  handleDepositorChange: (option: SelectOption | null) => void;
}

const DepositorSelector = ({
  control,
  depositorOptions,
  selectedDepositor,
  handleDepositorChange,
}: DepositorSelectorProps) => {
  return (
    <FormField
      control={control}
      name="id_depositante"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fornecedor</FormLabel>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                options={depositorOptions}
                value={depositorOptions.find(option => option.value === field.value) || null}
                onChange={handleDepositorChange}
                placeholder="Selecione ou digite para buscar"
                isClearable
                isSearchable
                noOptionsMessage={() => "Nenhum fornecedor encontrado"}
                classNames={{
                  control: (state) => 
                    `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${state.isFocused ? 'ring-2 ring-ring ring-offset-2' : ''}`,
                  placeholder: () => "text-muted-foreground",
                  input: () => "text-sm",
                  menu: () => "bg-white dark:bg-gray-800 mt-1 shadow-lg rounded-md border",
                  option: (state) => 
                    `px-3 py-2 ${state.isFocused ? 'bg-gray-100 dark:bg-gray-700' : ''}`,
                }}
              />
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              asChild
            >
              <Link to="/depositors/new">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Novo Fornecedor</span>
              </Link>
            </Button>
          </div>
          
          {selectedDepositor && (
            <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md text-sm">
              <div className="font-medium">{selectedDepositor.descri}</div>
              {selectedDepositor.cidade && selectedDepositor.uf && (
                <div className="text-muted-foreground mt-1">
                  {selectedDepositor.cidade}, {selectedDepositor.uf}
                </div>
              )}
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DepositorSelector;
