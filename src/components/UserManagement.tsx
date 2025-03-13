
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, UserCog, X } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
};

const UserManagement = () => {
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

    // Validate passwords match when editing
    if (isEditing && password && password !== confirmPassword) {
      toast.error('As senhas não correspondem');
      setIsLoading(false);
      return;
    }

    try {
      if (isEditing && editUserId) {
        // Basic profile update
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name, email })
          .eq('id', editUserId);

        if (profileError) throw profileError;
        
        // Update password if provided
        if (password) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            editUserId,
            { password }
          );
          
          if (passwordError) throw passwordError;
        }
        
        toast.success('Usuário atualizado com sucesso');
        fetchProfiles();
      } else {
        // Create new user
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

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>Apenas administradores podem gerenciar usuários</CardDescription>
          </div>
          <Button 
            onClick={() => {
              if (isOpen && isEditing) {
                resetForm();
              } else {
                setIsOpen(!isOpen);
                if (isEditing) setIsEditing(false);
              }
            }} 
            variant={isOpen ? "secondary" : "default"}
          >
            {isOpen ? (
              isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar Edição
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </>
              )
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Digite o nome completo"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="exemplo@email.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">
                {isEditing ? "Nova Senha (deixe em branco para manter a atual)" : "Senha"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEditing}
                placeholder={isEditing ? "Nova senha (opcional)" : "Senha segura"}
                minLength={6}
              />
            </div>

            {(isEditing || !isEditing) && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">
                  {isEditing ? "Confirmar Nova Senha" : "Confirmar Senha"}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isEditing || (isEditing && password.length > 0)}
                  placeholder="Confirme a senha"
                  minLength={6}
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                isEditing ? 'Atualizando...' : 'Cadastrando...'
              ) : (
                isEditing ? 'Atualizar Usuário' : 'Cadastrar Usuário'
              )}
            </Button>
          </form>
        </CardContent>
      )}

      <CardContent className={isOpen ? "pt-4" : ""}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetchLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-pulse space-y-2 flex flex-col items-center">
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Nenhum usuário cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.name || '-'}</TableCell>
                    <TableCell>{profile.email || '-'}</TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(profile)}
                        className="flex items-center gap-1"
                      >
                        <UserCog className="h-4 w-4" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
