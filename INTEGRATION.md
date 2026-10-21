# Integração Revival Web ↔ API

## Desenvolvimento
1. Rode o PostgreSQL com o esquema do Revival aplicado.
2. Configure `ConnectionStrings__DefaultConnection` e `Jwt__Key` (mínimo 32 bytes) no backend.
3. Execute `dotnet run --project Revival.Api --urls http://localhost:5080` na raiz do backend.
4. Copie `.env.example` para `.env.local` no frontend.
5. Execute `npm install` e `npm run dev` no frontend (porta 5173).
6. Teste cadastro, logout e login. O frontend chama `POST /api/v1/auth/register`, `POST /api/v1/auth/login` e `GET /api/v1/auth/me`.

## Produção
- Defina `VITE_API_URL` no Vercel com a URL HTTPS pública da API, sem barra final.
- Configure `Cors__AllowedOrigins__0` no backend com a URL HTTPS exata do frontend.
- Configure HTTPS, PostgreSQL, segredo JWT e backups.

## Limites atuais
O token de acesso dura 30 minutos e é salvo apenas na sessão da aba, por isso um novo login será necessário quando expirar. Refresh token, verificação de e-mail e recuperação de senha ainda não foram implementados. O restante do feed e recados continua demonstrativo/local; **somente cadastro, login e validação de sessão utilizam a API nesta entrega**.
