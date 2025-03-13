
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoryFormProps {
  categoryName: string;
  setCategoryName: (name: string) => void;
  isEditing: boolean;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  categoryName,
  setCategoryName,
  isEditing,
  isLoading,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="categoryName">Nome da Categoria</Label>
        <Input
          id="categoryName"
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          placeholder="Digite o nome da categoria"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          isEditing ? 'Atualizando...' : 'Cadastrando...'
        ) : (
          isEditing ? 'Atualizar Categoria' : 'Cadastrar Categoria'
        )}
      </Button>
    </form>
  );
};

export default CategoryForm;
