
-- 1. BILLS: Remove política permissiva que expõe dados de todos os usuários
DROP POLICY IF EXISTS "Anyone can view all bills" ON public.bills;

-- 2. DEPOSITANTES: Restringe acesso apenas a usuários autenticados
DROP POLICY IF EXISTS "Users can view depositantes" ON public.depositantes;
DROP POLICY IF EXISTS "Users can insert depositantes" ON public.depositantes;
DROP POLICY IF EXISTS "Users can update depositantes" ON public.depositantes;
DROP POLICY IF EXISTS "Users can delete depositantes" ON public.depositantes;

CREATE POLICY "Authenticated users can view depositantes"
  ON public.depositantes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert depositantes"
  ON public.depositantes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update depositantes"
  ON public.depositantes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete depositantes"
  ON public.depositantes FOR DELETE
  TO authenticated
  USING (is_admin());

-- 3. CATEGORIAS: Corrige política de modificação para admin only
DROP POLICY IF EXISTS "Apenas administradores podem modificar categorias" ON public.categories;

CREATE POLICY "Apenas administradores podem modificar categorias"
  ON public.categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 4. PROFILES: Adiciona política de INSERT (para o trigger handle_new_user)
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5. FUNÇÕES: Define search_path para segurança
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT email = 'william@makecard.com.br'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;
