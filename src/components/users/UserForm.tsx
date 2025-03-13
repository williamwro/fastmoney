
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  isEditing: boolean;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const UserForm: React.FC<UserFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isEditing,
  isLoading,
  handleSubmit,
}) => {
  return (
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
      
      {/* Only show password fields when creating new users */}
      {!isEditing && (
        <>
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

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirme a senha"
              minLength={6}
            />
          </div>
        </>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          isEditing ? 'Atualizando...' : 'Cadastrando...'
        ) : (
          isEditing ? 'Atualizar Usuário' : 'Cadastrar Usuário'
        )}
      </Button>
    </form>
  );
};

export default UserForm;
