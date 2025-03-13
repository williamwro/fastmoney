import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
};

export const useUserManagement = () => {
  const { signup } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar lista de usuários');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && editUserId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name, email })
          .eq('id', editUserId);

        if (profileError) throw profileError;
        
        toast.success('Usuário atualizado com sucesso');
        fetchProfiles();
      } else {
        await signup(name, email, password);
        toast.success('Usuário criado com sucesso');
        fetchProfiles();
      }
      
      resetForm();
    } catch (error) {
      console.error('Erro ao processar usuário:', error);
      toast.error(isEditing ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (profile: Profile) => {
    setName(profile.name || '');
    setEmail(profile.email || '');
    setPassword('');
    setConfirmPassword('');
    setEditUserId(profile.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsOpen(false);
    setIsEditing(false);
    setEditUserId(null);
  };

  return {
    isOpen,
    setIsOpen,
    isEditing,
    setIsEditing,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    profiles,
    fetchLoading,
    handleSubmit,
    handleEdit,
    resetForm
  };
};
