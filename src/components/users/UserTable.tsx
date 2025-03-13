
import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
};

interface UserTableProps {
  profiles: Profile[];
  fetchLoading: boolean;
  onEditUser: (profile: Profile) => void;
}

const UserTable: React.FC<UserTableProps> = ({ profiles, fetchLoading, onEditUser }) => {
  return (
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
                    onClick={() => onEditUser(profile)}
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
  );
};

export default UserTable;
