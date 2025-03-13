
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Category = {
  id: string;
  nome_categoria: string;
  created_at: string;
  updated_at: string;
};

export const useCategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
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
      toast.error('Erro ao carregar lista de categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && editCategoryId) {
        const { error } = await supabase
          .from('categories')
          .update({ 
            nome_categoria: categoryName,
            updated_at: new Date().toISOString()
          })
          .eq('id', editCategoryId);

        if (error) throw error;
        
        toast.success('Categoria atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({ nome_categoria: categoryName });

        if (error) throw error;
        
        toast.success('Categoria criada com sucesso');
      }
      
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Erro ao processar categoria:', error);
      toast.error(isEditing ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Verificar se há contas associadas a esta categoria
      const { data: billsWithCategory, error: checkError } = await supabase
        .from('bills')
        .select('id')
        .eq('id_categoria', id);
        
      if (checkError) throw checkError;
      
      if (billsWithCategory && billsWithCategory.length > 0) {
        toast.error('Esta categoria não pode ser excluída pois está sendo utilizada em contas');
        return;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Categoria excluída com sucesso');
      fetchCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryName(category.nome_categoria);
    setEditCategoryId(category.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const resetForm = () => {
    setCategoryName('');
    setIsOpen(false);
    setIsEditing(false);
    setEditCategoryId(null);
  };

  return {
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
  };
};
