
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormActionsProps {
  isSubmitting: boolean;
  isEditMode: boolean;
}

const FormActions = ({ isSubmitting, isEditMode }: FormActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate('/bills')}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          isEditMode ? 'Atualizar' : 'Salvar'
        )}
      </Button>
    </div>
  );
};

export default FormActions;
