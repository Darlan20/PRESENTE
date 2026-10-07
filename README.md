# Nosso Cantinho

Um site estático para guardar lembranças, imagens, anotações, listas, links e arquivos. Os dados podem ficar somente neste navegador ou sincronizar com uma conta Supabase.

## Abrir o site

Para testar localmente, abra um terminal nesta pasta e execute:

```powershell
py -m http.server 8000
```

Depois acesse <http://localhost:8000>. A página inicial encaminha para `amor.html`. Também é possível abrir `amor.html` diretamente, mas executar por `localhost` é necessário para que o navegador permita salvar dados localmente.

## Configurar o Supabase

1. Crie um projeto Supabase e execute nele o conteúdo de `supabase-schema.sql`.
2. Em **Authentication → URL Configuration**, configure a URL do site e inclua as URLs locais de desenvolvimento, como `http://localhost:8000/**`.
3. Edite `amor-config.js` com a URL do projeto e a chave publicável (anon/publishable).
4. Publique o conteúdo desta pasta em um host de site estático. O `vercel.json` encaminha a rota `/` para `amor.html`.

A chave publicável é destinada ao navegador. Não coloque uma chave `service_role` ou outro segredo neste site. Mantenha as políticas de Row Level Security (RLS) habilitadas e aplique o schema fornecido antes de usar contas e sincronização.

Sem conta, o site salva os dados localmente neste navegador. Esses dados não são sincronizados entre dispositivos; use uma conta para manter uma cópia na nuvem.

## Perfis e espaço compartilhado

Cada pessoa deve criar e usar a própria conta. O conteúdo do perfil pessoal continua privado. Para criar um espaço do casal, uma pessoa gera um convite em **Ajustes → Um cantinho só de vocês** e envia o código à outra; a segunda pessoa entra com a própria conta e aceita o convite. O código expira em 7 dias e só pode ser usado uma vez.

Depois da conexão, **Meu espaço** e **Nosso espaço** permitem alternar entre as gavetas pessoais e as gavetas compartilhadas. Tudo que for criado no espaço compartilhado pode ser visto, editado e excluído por ambos; o conteúdo pessoal não é copiado nem compartilhado automaticamente. Para usar esse recurso, aplique novamente `supabase-schema.sql` no Supabase antes de conectar os perfis.

## Arquivos principais

- `amor.html` e `amor.css`: aplicação e estilos.
- `amor-config.js`: configuração pública do Supabase.
- `recuperar-senha.html`: fluxo de redefinição de senha.
- `supabase-schema.sql`: tabelas, políticas e armazenamento necessários à sincronização.
