import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChangePassword from '@/components/ChangePassword';

type UserMenuProps = {
  user: any | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  mobile?: boolean;
  closeMenu?: () => void;
  onOpenPasswordDialog?: () => void;
};

const UserMenu: React.FC<UserMenuProps> = ({ 
  user, 
  logout, 
  isAuthenticated,
  mobile = false,
  closeMenu,
  onOpenPasswordDialog
}) => {
  const navigate = useNavigate();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (closeMenu) closeMenu();
  };

  const handleLogin = () => {
    navigate('/login');
    if (closeMenu) closeMenu();
  };

  const handleOpenPasswordDialog = () => {
    if (onOpenPasswordDialog) {
      onOpenPasswordDialog();
      if (closeMenu && mobile) closeMenu();
    } else {
      setIsPasswordDialogOpen(true);
    }
  };

  const handleClosePasswordDialog = () => {
    setIsPasswordDialogOpen(false);
  };

  if (!isAuthenticated) {
    if (mobile) {
      return (
        <button
          onClick={handleLogin}
          className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-blue-600 hover:bg-blue-50 hover:border-blue-300 text-base font-medium"
        >
          Entrar / Cadastrar
        </button>
      );
    }
    
    return (
      <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
        <Button variant="ghost" onClick={handleLogin}>Entrar / Cadastrar</Button>
      </div>
    );
  }

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  if (mobile) {
    return (
      <>
        <button
          onClick={handleOpenPasswordDialog}
          className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 text-base font-medium"
        >
          <div className="flex items-center">
            <Key className="h-5 w-5" />
            <span className="ml-2">Alterar Senha</span>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 text-base font-medium"
        >
          <div className="flex items-center">
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Sair</span>
          </div>
        </button>
        
        {!onOpenPasswordDialog && (
          <ChangePassword 
            isOpen={isPasswordDialogOpen} 
            onClose={handleClosePasswordDialog} 
          />
        )}
      </>
    );
  }

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-semibold text-foreground">Minha Conta</DropdownMenuLabel>
          <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-foreground" disabled>
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-foreground" onClick={handleOpenPasswordDialog}>
            <Key className="mr-2 h-4 w-4" />
            <span>Alterar Senha</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-foreground" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePassword 
        isOpen={isPasswordDialogOpen} 
        onClose={handleClosePasswordDialog} 
      />
    </div>
  );
};

export default UserMenu;
