
import React, { useState, useEffect } from 'react';
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
  onEmailChange?: (email: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onEmailChange }) => {
  const { login, signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isLogin = type === 'login';
  const { schema, defaultValues } = useAuthFormSchema(isLogin);
  
  // Initialize form before trying to use it
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any, // Type assertion to fix the TypeScript error
  });
  
  // Pass email to parent component when it changes
  const emailValue = form.watch('email');
  
  useEffect(() => {
    if (onEmailChange && emailValue) {
      onEmailChange(emailValue);
    }
  }, [emailValue, onEmailChange]);
  
  // Redirect to bills page after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to /bills');
      navigate('/bills');
    }
  }, [isAuthenticated, navigate]);
  
  const onSubmit = async (values: any) => {
    if (isSubmitting || authLoading) return;
    
    setIsSubmitting(true);
    
    try {
      console.log(`Attempting ${isLogin ? 'login' : 'signup'} with:`, values);
      
      if (isLogin) {
        const { email, password } = values;
        await login(email, password);
        console.log('Login successful, redirecting via useEffect');
        // Navigation happens in useEffect when isAuthenticated changes
      } else {
        const { name, email, password } = values;
        await signup(name, email, password);
      }
    } catch (error: any) {
      console.error(`${isLogin ? 'Login' : 'Signup'} error:`, error);
      // Toast error is already handled in useAuthOperations
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card shadow-sm rounded-lg border">
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
                    <InputWithIcon icon={<User className="h-4 w-4 text-gray-400 dark:text-gray-500" />} placeholder="Seu nome" {...field} />
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
                  <InputWithIcon icon={<Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />} type="email" placeholder="seu@email.com" {...field} />
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
                  <InputWithIcon icon={<Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />} type="password" placeholder="********" {...field} />
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
                    <InputWithIcon icon={<Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />} type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <Button 
            type="submit" 
            className="w-full mt-6"
            disabled={isSubmitting || authLoading}
          >
            {(isSubmitting || authLoading) && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AuthForm;
