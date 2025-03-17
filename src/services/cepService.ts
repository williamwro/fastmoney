
import { toast } from "sonner";

interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Searches an address using a Brazilian postal code (CEP)
 * @param cep The postal code to search (only numbers)
 * @returns The address data or null if not found
 */
export const searchAddressByCep = async (cep: string): Promise<AddressData | null> => {
  try {
    // Remove any non-numeric characters
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos');
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json() as AddressData;
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar CEP';
    console.error('CEP lookup error:', error);
    toast.error(message);
    return null;
  }
};
