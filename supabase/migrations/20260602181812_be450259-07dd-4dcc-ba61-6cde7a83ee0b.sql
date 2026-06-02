-- 1. Add is_private flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

-- 2. Helper function (security definer) to check if a user is "private"
CREATE OR REPLACE FUNCTION public.is_private_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_private FROM public.profiles WHERE id = _user_id),
    false
  )
$$;

-- 3. Replace SELECT/UPDATE/DELETE policies on bills with isolation logic
DROP POLICY IF EXISTS "Authenticated users can view bills" ON public.bills;
DROP POLICY IF EXISTS "Authenticated users can update bills" ON public.bills;
DROP POLICY IF EXISTS "Authenticated users can delete bills" ON public.bills;

CREATE POLICY "View bills with privacy isolation"
ON public.bills
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN public.is_private_user(bills.user_id) THEN bills.user_id = auth.uid()
    ELSE NOT public.is_private_user(auth.uid())
  END
);

CREATE POLICY "Update bills with privacy isolation"
ON public.bills
FOR UPDATE
TO authenticated
USING (
  CASE
    WHEN public.is_private_user(bills.user_id) THEN bills.user_id = auth.uid()
    ELSE NOT public.is_private_user(auth.uid())
  END
)
WITH CHECK (
  CASE
    WHEN public.is_private_user(bills.user_id) THEN bills.user_id = auth.uid()
    ELSE NOT public.is_private_user(auth.uid())
  END
);

CREATE POLICY "Delete bills with privacy isolation"
ON public.bills
FOR DELETE
TO authenticated
USING (
  CASE
    WHEN public.is_private_user(bills.user_id) THEN bills.user_id = auth.uid()
    ELSE NOT public.is_private_user(auth.uid())
  END
);