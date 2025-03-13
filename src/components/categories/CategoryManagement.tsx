
import React from 'react';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CategoryForm from './CategoryForm';
import CategoryTable from './CategoryTable';

const CategoryManagement = () => {
  const {
    categories,
    isLoading,
    isOpen,
    setIsOpen,
    isEditing,
    categoryName,
    setCategoryName,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm
  } = useCategoryManagement();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Categorias</h2>
        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-1">
          <PlusCircle className="mr-1 h-5 w-5" />
          Nova Categoria
        </Button>
      </div>

      <CategoryTable 
        categories={categories} 
        isLoading={isLoading} 
        onEditCategory={handleEdit} 
        onDeleteCategory={handleDelete} 
      />

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            categoryName={categoryName}
            setCategoryName={setCategoryName}
            isEditing={isEditing}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;
