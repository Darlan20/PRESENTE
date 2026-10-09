# 💚 Nosso Cantinho

Um espaço privado e delicado para guardar lembranças, imagens, anotações, listas, links e arquivos.

O projeto funciona **sem conta**, salvando os dados no navegador, e também pode usar **Supabase** para autenticação e sincronização em nuvem. Contas diferentes mantêm seus conteúdos separados e existe um espaço compartilhado opcional para duas pessoas.

## ✨ Recursos

- 🗂️ Gavetas personalizadas para organizar conteúdos.
- 🖼️ Imagens, 📝 anotações, 📋 listas, 🔗 links e 📎 arquivos.
- 🔎 Busca por gavetas, itens e extensões.
- 🌙 Tema claro/escuro.
- 💾 Uso local sem necessidade de cadastro.
- ☁️ Login e sincronização com Supabase.
- 👥 Espaço compartilhado entre duas contas.
- 🔐 Políticas de Row Level Security (RLS) para separar os dados.
- 📦 Armazenamento privado de arquivos no Supabase Storage.
- 🔑 Recuperação e redefinição de senha.
- 📱 Interface responsiva e acessível.
- 💞 Contador de dias e personalização dos nomes.
- 🕰️ Linha do tempo de lembranças.
- 💌 Cartas com data programada para abrir (organização visual, não segurança).
- 🗓️ Lista de datas especiais.
- 🎲 Perguntas para conversar a dois e som ambiente opcional.
- 📲 Estrutura PWA para instalação e cache estático limitado.

## 🧰 Tecnologias

- HTML5
- CSS3
- JavaScript
- Supabase Auth
- Supabase Database (PostgreSQL)
- Supabase Storage
- Vercel

O projeto é intencionalmente simples e não depende de um framework de frontend.

## 🚀 Executar localmente

Na pasta do projeto:

```powershell
py -m http.server 8000
```

Abra:

```
http://localhost:8000
```

A página inicial encaminha para `amor.html`.

> Use um servidor local em vez de abrir o HTML diretamente com `file://`. Isso evita limitações do navegador com recursos locais e integrações web.

## ☁️ Configurar o Supabase

1. Crie um projeto no Supabase.
2. Execute o conteúdo de `supabase-schema.sql` no SQL Editor.
3. Em **Authentication → URL Configuration**, configure a URL publicada e as URLs locais necessárias.
4. Confira as configurações de e-mail em **Authentication** se quiser confirmação de cadastro e recuperação de senha.
5. Edite `amor-config.js` com a URL do projeto e a chave **publicável** (publishable/anon).
6. Publique os arquivos em um host estático, como Vercel.

### 🔐 Sobre a chave do Supabase

A chave publicável usada pelo navegador **não é um segredo**. A segurança dos dados depende principalmente das políticas de RLS e das regras do Storage.

**Nunca coloque neste repositório:**

- `service_role`;
- chaves secretas;
- senhas;
- tokens administrativos;
- credenciais SMTP.

Mantenha o RLS habilitado e aplique o schema antes de usar dados reais.

## 🔑 Configuração de login e recuperação de senha

O projeto **não precisa de um backend próprio** para login, cadastro ou recuperação de senha. O Supabase Auth cuida da autenticação e o PostgreSQL/RLS separa os dados por `auth.uid()`.

No painel do Supabase, em **Authentication → URL Configuration**, adicione como URLs de redirecionamento:

- URL publicada: `https://SEU-DOMINIO/amor.html`
- Recuperação: `https://SEU-DOMINIO/recuperar-senha.html`
- Desenvolvimento: `http://localhost:8000/amor.html`
- Recuperação local: `http://localhost:8000/recuperar-senha.html`

Troque `SEU-DOMINIO` pelo domínio real usado no Vercel.

### E-mails de confirmação e recuperação

Se o projeto estiver configurado para exigir confirmação de e-mail, o Supabase precisa conseguir enviar os e-mails. Para produção, configure um provedor SMTP em **Authentication → SMTP Settings** e confira o remetente e os registros de autenticação do domínio.

O código do projeto trata separadamente:

- conta ainda não confirmada;
- senha incorreta;
- e-mail já cadastrado;
- limite de envio de e-mails;
- erro de conexão;
- link de recuperação expirado ou inválido.

### Separação das contas

Cada conta usa seu próprio `auth.uid()`. As tabelas pessoais possuem RLS:

- `apo_gavetas` → somente o próprio usuário;
- `apo_itens` → somente o próprio usuário;
- `apo_perfis` → somente o próprio usuário;
- Storage → somente arquivos pertencentes ao usuário ou ao casal do qual ele participa.

O espaço do casal usa `couple_id` e só pode ser acessado por membros daquele casal.

**Importante:** depois de alterar `supabase-schema.sql`, execute novamente o SQL no projeto Supabase. Alterar o arquivo no GitHub, sozinho, não altera o banco que já está hospedado no Supabase.

## 👥 Espaço compartilhado

Cada pessoa deve usar sua própria conta. Para criar um espaço compartilhado:

1. Entre na sua conta.
2. Abra **Ajustes → Um cantinho só de vocês**.
3. Gere um convite.
4. Envie o código para a outra pessoa.
5. A outra pessoa entra com a própria conta e aceita o convite.

O convite expira em 7 dias e pode ser usado uma única vez.

O conteúdo pessoal continua separado. Apenas o espaço compartilhado fica acessível às duas contas.

### Recursos extras de lembranças

A linha do tempo, as cartas, as datas especiais e os nomes personalizados ficam no armazenamento local do navegador, separados pelo e-mail da conta quando o perfil está autenticado. Esses dados **não são sincronizados para a nuvem** nem compartilhados automaticamente com a outra pessoa. Faça backup antes de limpar os dados do navegador. A data de abertura de uma carta é apenas uma organização visual; não use esse recurso para guardar informações confidenciais.

## 📁 Estrutura principal

| Arquivo | Função |
|---|---|
| `amor.html` | Aplicação principal |
| `amor.css` | Estilos e responsividade |
| `amor-config.js` | Configuração pública do Supabase |
| `recuperar-senha.html` | Redefinição de senha |
| `supabase-recovery-email.html` | Modelo/fluxo relacionado à recuperação |
| `supabase-schema.sql` | Banco, RLS, funções e Storage |
| `index.html` | Entrada do site |
| `vercel.json` | Configuração de rotas e cabeçalhos |
| `favicon.svg` | Ícone do site |
| `nosso-recursos.js` | Linha do tempo, cartas, datas e personalização |
| `nosso-recursos.css` | Estilos responsivos dos novos recursos |
| `manifest.webmanifest` | Metadados de instalação PWA |
| `service-worker.js` | Cache limitado do shell estático offline |

## 🛡️ Privacidade

O projeto foi pensado para armazenar conteúdo pessoal. Por isso, a aplicação evita indexação por mecanismos de busca e o bucket de arquivos do Supabase é privado.

Mesmo assim, **não trate a aplicação como um cofre para informações altamente sensíveis**. Revise as políticas do Supabase e faça backups dos dados importantes.

## 📌 Desenvolvimento

Antes de alterar o schema ou as regras de acesso, faça um backup e teste em um projeto Supabase separado quando possível.

Para alterações de frontend, mantenha o projeto compatível com hospedagem estática e preserve a acessibilidade dos controles, diálogos e formulários.

---

Feito com carinho para guardar pequenos momentos. 💚
