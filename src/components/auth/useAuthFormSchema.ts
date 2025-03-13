
import { z } from 'zod';

export const useAuthFormSchema = (isLogin: boolean) => {
  const loginSchema = z.object({
    email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  });

  const signupSchema = loginSchema.extend({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua senha'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

  return {
    schema: isLogin ? loginSchema : signupSchema,
    defaultValues: isLogin 
      ? { email: '', password: '' }
      : { name: '', email: '', password: '', confirmPassword: '' },
  };
};
