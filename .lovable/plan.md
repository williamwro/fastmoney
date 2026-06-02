## Objetivo

Criar um modo "particular" isolado para o novo usuário `gs.armazemfinanceiro@yahoo.com.br`, sem afetar Denise (`denisepaixao_vga@hotmail.com`) nem os demais usuários da empresa, que continuam vendo/compartilhando tudo como hoje.

## Conceito

- Marcar apenas o novo usuário como `is_private = true` na tabela `profiles`.
- Lançamentos (`bills`) criados por um usuário particular ficam visíveis SOMENTE para ele.
- Lançamentos criados por usuários "empresa" continuam visíveis para todos os usuários "empresa" (comportamento atual preservado).
- Usuários particulares NÃO veem dados da empresa, e usuários da empresa NÃO veem dados particulares.
- Categorias e Fornecedores continuam compartilhados (sem mudança), já que não foi pedido isolá-los.

## Passos

### 1. Banco de dados (migração)

- Adicionar coluna `is_private boolean NOT NULL DEFAULT false` em `public.profiles`.
- Criar função `security definer` `public.is_private_user(_user_id uuid)` que lê `profiles.is_private` (evita recursão em RLS).
- Substituir a policy de SELECT em `public.bills` por uma regra que faz:
  - se o dono do lançamento (`user_id`) for particular → só ele mesmo enxerga;
  - se o dono for da empresa → todos os usuários da empresa enxergam; particulares não enxergam.
- Ajustar policies de UPDATE e DELETE em `bills` com a mesma lógica de visibilidade (cada grupo só altera/exclui o que pode ver). INSERT continua exigindo `auth.uid() = user_id`.
- Marcar `is_private = true` para o usuário `gs.armazemfinanceiro@yahoo.com.br` (após ele ser criado/cadastrado).

### 2. Criação do novo usuário

- O novo login `gs.armazemfinanceiro@yahoo.com.br` será criado pelo fluxo normal de cadastro do sistema (ou pelo painel admin de Usuários).
- Após o cadastro, rodar um UPDATE marcando `is_private = true` apenas nesse perfil.

### 3. Frontend

- Nenhuma mudança funcional necessária: a RLS faz todo o isolamento.
- As telas de Contas a Pagar / Receber, Dashboard e Relatórios continuam consultando `bills` normalmente — cada usuário só vai receber as linhas permitidas pela RLS.
- Categorias, Fornecedores, gestão de usuários e área admin (`william@makecard.com.br`) permanecem inalterados.

## Garantias de não regressão

- Denise (`denisepaixao_vga@hotmail.com`) e demais usuários permanecem com `is_private = false` → mesma visibilidade compartilhada de hoje.
- Apenas `gs.armazemfinanceiro@yahoo.com.br` será marcado como particular.
- Lançamentos antigos (todos da empresa) continuam visíveis ao grupo empresa exatamente como agora.

## Detalhes técnicos

- Função auxiliar:
  ```sql
  create or replace function public.is_private_user(_user_id uuid)
  returns boolean language sql stable security definer set search_path = public as $$
    select coalesce((select is_private from public.profiles where id = _user_id), false)
  $$;
  ```
- Policy SELECT em `bills` (substitui a atual `Authenticated users can view bills`):
  ```sql
  using (
    case
      when public.is_private_user(bills.user_id) then bills.user_id = auth.uid()
      else not public.is_private_user(auth.uid())
    end
  )
  ```
- Mesma expressão aplicada em UPDATE (using/with check) e DELETE.

## Pergunta antes de implementar

O novo usuário `gs.armazemfinanceiro@yahoo.com.br` já foi criado no sistema, ou devo deixar você criá-lo pela tela de cadastro/Usuários e, em seguida, eu rodo só o UPDATE marcando `is_private = true`?
