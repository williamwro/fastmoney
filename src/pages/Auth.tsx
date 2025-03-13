
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/context/AuthContext';

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if user is already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">FastMoney</CardTitle>
          <CardDescription className="text-center">
            Gerencie suas finanças com rapidez e eficiência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <AuthForm type="login" />
            </TabsContent>
            <TabsContent value="signup">
              <AuthForm type="signup" />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-5">
          <p className="text-xs text-center text-gray-500">
            Ao acessar, você concorda com nossos termos de serviço e política de privacidade.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
