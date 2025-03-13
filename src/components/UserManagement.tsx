
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const UserManagement = () => {
  const { user, signup } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is the authorized admin
  const isAuthorizedAdmin = user?.email === 'william@makecard.com.br';

  if (!isAuthorizedAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(name, email, password);
      setName('');
      setEmail('');
      setPassword('');
      setIsOpen(false);
      toast.success('Usuário criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>Apenas administradores podem adicionar novos usuários</CardDescription>
          </div>
          <Button 
            onClick={() => setIsOpen(!isOpen)} 
            variant={isOpen ? "secondary" : "default"}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isOpen ? 'Fechar' : 'Novo Usuário'}
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
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Senha segura"
                minLength={6}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
};

export default UserManagement;
