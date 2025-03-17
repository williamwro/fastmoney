
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface FormActionsProps {
  isSubmitting: boolean;
  isEditMode: boolean;
}

const FormActions = ({ isSubmitting, isEditMode }: FormActionsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if we're on a receivable route
  const isReceivable = location.pathname.includes('/receitas');
  
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
        className={isReceivable ? "bg-green-500 hover:bg-green-600" : ""}
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
