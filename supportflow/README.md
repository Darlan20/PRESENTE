# SupportFlow — módulo integrado ao repositório

Este diretório contém a aplicação SupportFlow separada do **Nosso Cantinho**. O site principal continua sendo servido pelos arquivos da raiz; o SupportFlow tem frontend React/Vite e backend Spring Boot independentes.

## Telas e recursos incluídos

- Login, cadastro, recuperação e redefinição de senha, renovação de sessão JWT e controle de acesso por perfil.
- Área do usuário: abertura de chamados, anexos, acompanhamento de status e conversa sobre os chamados.
- Área do técnico: fila de atendimento, filtros, atualização de status, detalhes e temporizador/SLA.
- Área do gestor: indicadores, gráficos, relatórios, exportação, lixeira de chamados e administração de localizações.
- Perfil, preferências, notificações, tema, chat em tempo real via WebSocket/STOMP e diálogos de e-mail.
- Banco relacional com JPA, PostgreSQL em produção e H2 para desenvolvimento local.

## Executar localmente

### Backend (Java 21 + Maven Wrapper)

```bash
cd supportflow/Backend
./mvnw spring-boot:run
```

No Windows, use `mvnw.cmd spring-boot:run`. O perfil local usa H2. As chaves padrão são exclusivas para desenvolvimento local; nunca reutilize essas chaves em produção.

### Frontend (Node.js)

Em outro terminal:

```bash
cd supportflow/frontend
npm ci
npm run dev
```

Copie `.env.example` para `.env.local` e ajuste `VITE_API_URL=http://localhost:8080/api` se necessário.

## Implantação separada

A raiz do repositório continua destinada ao Nosso Cantinho na Vercel. Para publicar o SupportFlow:

1. Crie um projeto Vercel apontando o **Root Directory** para `supportflow/frontend`.
2. Defina `VITE_API_URL` com a URL pública do backend terminada em `/api`.
3. Use o Blueprint `render.yaml` na raiz para criar o backend e o PostgreSQL no Render. O banco está configurado no plano pago mínimo `basic-256mb`; confira os preços e altere o plano antes de aplicar o Blueprint se não quiser esse custo.
4. Configure `FRONTEND_URL` no Render com o domínio real da implantação Vercel.
5. Configure SMTP apenas se quiser habilitar envio de e-mails.

O backend de produção exige `JWT_SECRET`, `JWT_REFRESH_SECRET` e credenciais PostgreSQL configuradas no provedor. O blueprint não contém senhas de banco nem chaves JWT fixas. O seed de demonstração é desativado em produção; crie contas reais e conceda o perfil de gestor de forma controlada.

## Separação e segurança

- Não coloque arquivos `.env`, tokens, senhas ou credenciais de produção no Git.
- Use um banco exclusivo para esta implantação; não compartilhe o banco do Nosso Cantinho.
- Os dados dos chamados pertencem a este módulo e não são copiados para o Supabase do site principal.
- Antes de usar em produção, revise CORS, regras de acesso, anexos e contas administrativas e configure os segredos no painel do provedor.
