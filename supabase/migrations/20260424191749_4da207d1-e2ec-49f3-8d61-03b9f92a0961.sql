-- Remover políticas restritas por user_id
DROP POLICY IF EXISTS "Users can view their own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can insert their own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can update their own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can delete their own bills" ON public.bills;

-- Criar políticas compartilhadas para usuários autenticados
CREATE POLICY "Authenticated users can view bills"
ON public.bills FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert bills"
ON public.bills FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update bills"
ON public.bills FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete bills"
ON public.bills FOR DELETE
TO authenticated
USING (true);