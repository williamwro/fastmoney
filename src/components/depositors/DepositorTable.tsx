
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Search, PlusCircle } from 'lucide-react';
import { Depositor, useDepositors } from '@/context/DepositorContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DepositorTable: React.FC = () => {
  const { depositors, deleteDepositor, isLoading } = useDepositors();
  const [search, setSearch] = useState('');
  const [depositorToDelete, setDepositorToDelete] = useState<Depositor | null>(null);
  
  const filteredDepositors = depositors.filter(depositor => 
    depositor.descri.toLowerCase().includes(search.toLowerCase()) ||
    (depositor.cnpj && depositor.cnpj.includes(search)) ||
    (depositor.cpf && depositor.cpf.includes(search))
  );
  
  const handleDelete = async () => {
    if (depositorToDelete) {
      await deleteDepositor(depositorToDelete.id);
      setDepositorToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar depositante..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Button asChild className="sm:self-end w-full sm:w-auto">
          <Link to="/depositors/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Depositante
          </Link>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome/Descrição</TableHead>
              <TableHead className="hidden md:table-cell">CNPJ/CPF</TableHead>
              <TableHead className="hidden md:table-cell">Cidade</TableHead>
              <TableHead className="hidden md:table-cell">UF</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepositors.length > 0 ? (
              filteredDepositors.map((depositor) => (
                <TableRow key={depositor.id}>
                  <TableCell className="font-medium">{depositor.descri}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {depositor.cnpj || depositor.cpf || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {depositor.cidade || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {depositor.uf || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/depositors/${depositor.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setDepositorToDelete(depositor)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o depositante "{depositorToDelete?.descri}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDepositorToDelete(null)}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDelete}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  {search 
                    ? "Nenhum depositante encontrado com os critérios de busca." 
                    : "Nenhum depositante cadastrado. Clique em 'Novo Depositante' para adicionar."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DepositorTable;
