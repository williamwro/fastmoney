-- Atualiza o user_id de todas as bills do usuário antigo para o novo
UPDATE public.bills
SET user_id = 'fecd6e9f-a588-4188-9e5e-1f5b6ce8efae'
WHERE user_id = 'e0200375-4739-4881-a498-4492fa97a68d';
