
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AuthFormHeader } from './auth/AuthFormHeader';
import { InputWithIcon } from './auth/InputWithIcon';
import { useAuthFormSchema } from './auth/useAuthFormSchema';

interface AuthFormProps {
  type: 'login' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isLogin = type === 'login';
  const { schema, defaultValues } = useAuthFormSchema(isLogin);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any, // Type assertion to fix the TypeScript error
  });
  
  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { email, password } = values;
        await login(email, password);
        navigate('/');
      } else {
        const { name, email, password } = values;
        await signup(name, email, password);
        navigate('/');
      }
    } catch (error) {
      // Error is already handled by auth context
      console.error('Error during authentication:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white shadow-sm rounded-lg border">
      <AuthFormHeader title={isLogin ? 'Login' : 'Criar Conta'} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <InputWithIcon icon={<User className="h-4 w-4 text-gray-400" />} placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <InputWithIcon icon={<Mail className="h-4 w-4 text-gray-400" />} type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <InputWithIcon icon={<Lock className="h-4 w-4 text-gray-400" />} type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {!isLogin && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <InputWithIcon icon={<Lock className="h-4 w-4 text-gray-400" />} type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <Button 
            type="submit" 
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AuthForm;
