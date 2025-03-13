
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, UserPlus, Trash2, Edit, Save } from 'lucide-react';

type UserType = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

const Users = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserType[]>([
    { id: '1', name: 'Admin User', email: 'admin@example.com' },
    { id: '2', name: 'William Admin', email: 'william@makecard.com.br', isAdmin: true },
  ]);
  
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', isAdmin: false });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
          <div className="mt-4 h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    // Simple validation
    if (users.some(user => user.email === newUser.email)) {
      toast.error("Este email já está em uso");
      return;
    }
    
    const newId = (users.length + 1).toString();
    setUsers([...users, { ...newUser, id: newId }]);
    setIsAddUserDialogOpen(false);
    setNewUser({ name: '', email: '', password: '', isAdmin: false });
    toast.success("Usuário adicionado com sucesso");
  };
  
  const handleDeleteUser = (id: string) => {
    // Prevent deleting the admin user
    if (id === '2') {
      toast.error("Você não pode excluir o usuário administrativo principal");
      return;
    }
    
    setUsers(users.filter(user => user.id !== id));
    toast.success("Usuário excluído com sucesso");
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os usuários que têm acesso ao sistema
          </p>
        </div>
        
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
                      Usuário
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === '2'} // Prevent deleting the admin user
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isAdmin" className="text-right">
                Admin
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  id="isAdmin"
                  type="checkbox"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isAdmin" className="text-sm font-normal">
                  Este usuário é administrador
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddUser}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
