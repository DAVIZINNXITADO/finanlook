# Deploy e execução — FinanLook

Este documento descreve os passos para rodar, testar e publicar o FinanLook. Está em português e pensado para desenvolvimento local e deploy em hosts (Lovable, Vercel, Netlify, etc.).

IMPORTANTE: não contém segredos. Use o arquivo `.env.example` (já criado) como referência e não comite chaves reais.

## Requisitos locais
- Node.js (recomendo 18+)
- npm ou bun (o projeto parece usar bunlock mas instruções abaixo usam npm)

## Variáveis de ambiente necessárias
Preencha um `.env` local (copie `.env.example`) com pelo menos:

- VITE_SUPABASE_URL=
- VITE_SUPABASE_PUBLISHABLE_KEY=

Para execução do lado servidor (opcional/produção):

- SUPABASE_URL=
- SUPABASE_PUBLISHABLE_KEY=
- SUPABASE_SERVICE_ROLE_KEY= (somente se precisar de acesso de serviço no servidor)

Observação: se estiver usando Lovable Cloud, configure essas variáveis no painel do Lovable (seu host). Em Vercel/Netlify, configure na seção de Environment Variables do projeto.

## Rodar em desenvolvimento (local)
1. Clone o repositório:
   git clone https://github.com/DAVIZINNXITADO/finanlook.git
2. Entre na pasta e instale dependências:
   cd finanlook
   npm install
3. Crie `.env` copiando `.env.example` e preencha as variáveis necessárias.
4. Rode em dev:
   npm run dev

Verificações úteis no browser (DevTools):
- Network: confirme que `/src/client.tsx` não retorna 404 (public/index.html carrega esse script). Se houver 404, o cliente não iniciará.
- Console: copie qualquer stack trace ou erro e cole aqui — eu te ajudo a corrigir.

## Build e preview (testar build de produção localmente)
1. Gerar build:
   npm run build
2. Testar o build localmente:
   npm run preview

Isso te mostra como a aplicação se comporta em modo de produção antes de publicar.

## Deploy
Dependendo do tipo de hosting, as instruções variam.

A) Lovable Cloud (recomendado dado que o projeto usa ferramentas Lovable/TanStack):
- Configure as variáveis de ambiente no painel do projeto (VITE_SUPABASE_*, SUPABASE_*).
- Configure o build command: `npm run build`.
- Configure o processo de execução/público conforme o tipo de build do Lovable (algumas apps TanStack Start usam SSR — verifique se o Lovable oferece suporte a Node/Nitro para SSR). Se o provedor exige uma aplicação Node, publique o build que o nitro produz e use o comando de start do host.
- Se for site estático (não-SSR), o diretório de publicação normalmente é `dist` — confirme no output do `npm run build`.

B) Vercel/Netlify:
- Em muitos casos TanStack Start exige SSR. Vercel suporta Node serverless/Server Functions — escolha o template Node.
- Build command: `npm run build`.
- Publish dir: `dist` (se o projeto for gerado estaticamente). Se o projeto usar Nitro/server, escolha o adaptador apropriado (Vercel adapter) ou use deploy como Node app.

C) GitHub Pages:
- Normalmente não indicado para apps SSR. Se a app for apenas SPA/estática, é preciso gerar build estático e configurar `homepage`/base path. Para TanStack Start com SSR, GitHub Pages NÃO é apropriado.

Se não souber qual target usar, me diga qual host pretende usar e eu adapto as instruções.

## Erros comuns e como resolver
- 404 em `/src/client.tsx`: já foi corrigido criando `src/client.tsx`. Se ainda ocorrer, limpe cache do host e verifique se o build incluiu esse arquivo.
- Erro no Supabase ao inicializar: as integrações no projeto fazem `console.error` e lançam se variáveis faltarem. Preencha as variáveis (VITE_ para dev client, SUPABASE_* para server).
- Assets (CSS/Fonts) com 404: certifique-se de que o campo `base`/`publicPath` em `vite` esteja correto se você servir a app em subpath.

## Logs / Debug
- Use DevTools → Console e Network
- Rode `npm run build` localmente para ver erros do bundler
- Se houver erro de SSR (500), verifique o log do servidor (host) para stack trace. O repositório já tem `src/server.ts` que renderiza uma página de erro — confira os logs que o provedor retorna.

## Sugestões que eu posso aplicar agora
- Adicionar um workflow GitHub Actions que roda `npm ci` + `npm run build` para detectar erros de build automaticamente.
- Criar um `README.md` com instruções resumidas para colaboradores.
- Ajudar a configurar o deploy no Lovable (posso preparar os comandos/arquivos necessários, mas não posso definir variáveis secretas no painel do host).

Quer que eu adicione um workflow de CI que rode o build automaticamente (commit direto)? Responda `CI` e eu crio o arquivo `.github/workflows/ci.yml` com os passos básicos.

---
Se preferir, posso também abrir um PR com outras mudanças (ex.: ajustes de build, correções automáticas). Diga qual ação prefere: `CI`, `PR`, `README` (criar README.md), ou `deploy-lovable` (preparo específico para Lovable).