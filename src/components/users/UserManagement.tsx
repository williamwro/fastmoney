
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, X } from 'lucide-react';
import UserTable from './UserTable';
import UserForm from './UserForm';
import { useUserManagement } from '@/hooks/useUserManagement';

const UserManagement = () => {
  const {
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
  } = useUserManagement();

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
          <UserForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isEditing={isEditing}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </CardContent>
      )}

      <CardContent className={isOpen ? "pt-4" : ""}>
        <UserTable 
          profiles={profiles}
          fetchLoading={fetchLoading}
          onEditUser={handleEdit}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagement;
