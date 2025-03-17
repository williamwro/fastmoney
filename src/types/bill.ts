
import { z } from 'zod';

export const billSchema = z.object({
  id_depositante: z.string({
    required_error: "O depositante é obrigatório",
  }),
  amount: z.string().refine(val => {
    if (val === '') return true;
    return !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }, {
    message: 'O valor deve ser um número maior que zero',
  }),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Data de vencimento inválida',
  }),
  datapagamento: z.string().optional().nullable(),
  category: z.string(),
  id_categoria: z.string().nullable(),
  status: z.enum(['paid', 'unpaid']),
  tipo: z.enum(['pagar', 'receber']),
  notes: z.string().optional(),
  numero_nota_fiscal: z.string().optional(),
  hasInstallments: z.boolean().default(false),
  installmentsCount: z.string().refine(val => {
    if (val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num <= 48;
  }, {
    message: 'Número de parcelas deve ser um número entre 1 e 48',
  }).optional(),
  installmentsTotal: z.string().refine(val => {
    if (val === '') return true;
    return !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }, {
    message: 'Valor total deve ser um número maior que zero',
  }).optional(),
});

export type BillFormValues = z.infer<typeof billSchema>;
