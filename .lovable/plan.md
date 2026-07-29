## Diagnóstico

O backend está funcionando: consultei o banco `newmoney` agora (respondeu, 4 perfis) e o endpoint de autenticação retornou **200**. Ou seja, o Supabase não está fora do ar.

O `NetworkError when attempting to fetch resource` acontece no navegador, antes da requisição chegar ao Supabase. A causa mais provável é o **Service Worker antigo** do app:

- O projeto tem um service worker escrito à mão em `public/sw.js` (cache `fastmoney-v1`).
- Ao mesmo tempo existem arquivos gerados pelo plugin de PWA (`dev-dist/sw.js`, `workbox-*.js`).
- Dois service workers concorrentes + cache antigo instalado no navegador do usuário = requisições interceptadas e falhando com "NetworkError", inclusive as de login.

## O que fazer

1. **Substituir `public/sw.js` por um "kill-switch"** — um service worker que, ao ser instalado, apaga os caches criados por ele mesmo, recarrega as abas abertas e se desregistra. É o único jeito de remover um service worker já instalado nos navegadores dos usuários (apagar o arquivo não resolve).
2. **Remover o registro do service worker** do código do app (onde ele é registrado no `main.tsx` / componentes de PWA), mantendo apenas o manifesto e os ícones para que o app continue instalável na tela inicial / no Windows.
3. **Limpar os artefatos obsoletos** `dev-dist/` do repositório.
4. **Manter intacto** todo o resto: autenticação, telas, políticas do banco e regras de isolamento da conta particular.

## Resultado esperado

- O login volta a funcionar (as requisições passam direto para o Supabase, sem interceptação).
- O app continua podendo ser instalado no celular e no Windows.
- O modo offline deixa de existir — se você quiser offline de volta depois, dá para reconstruir da forma correta com o plugin oficial.

## Depois de aplicar

Será necessário **publicar o app**, e na primeira visita o navegador do usuário troca o worker antigo pelo kill-switch e recarrega sozinho. Em caso de teimosia, um Ctrl+Shift+R resolve.

## Detalhes técnicos

- `public/sw.js` passa a apagar somente os caches de escopo próprio (`caches.keys()` filtrados) e chamar `self.registration.unregister()` dentro de `finally`, no evento `activate`.
- Remoção de `serviceWorker.register` / `virtual:pwa-register` e de qualquer configuração do `vite-plugin-pwa` em `vite.config.ts` que gere `sw.js`.
- `public/manifest.json` e os ícones permanecem, junto com as tags `manifest`/`theme-color`/`apple-touch-icon` no `index.html`.
