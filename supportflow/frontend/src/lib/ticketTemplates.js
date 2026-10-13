/**
 * ticketTemplates.js - Templates de problemas para suporte técnico
 * Cada template contém categoria, exemplos de títulos e descrição sugerida
 */

export const TICKET_TEMPLATES = [
  {
    id: "infraestrutura",
    name: "🌐 Infraestrutura & Rede",
    category: "Infraestrutura",
    icon: "Wifi",
    templates: [
      {
        title: "Internet/WiFi sem conexão",
        description: "Estou sem acesso à internet. Meu dispositivo está conectado à rede, mas não conseguo acessar sites ou serviços online. Tentei reiniciar o roteador, mas o problema persiste."
      },
      {
        title: "Servidor fora do ar",
        description: "O servidor está inacessível e não consigo conectar. Recebi erro de timeout ao tentar acessar o sistema. Outros usuários também estão com o mesmo problema."
      },
      {
        title: "VPN não funciona",
        description: "A conexão VPN não está estabelecendo. Recebo erro de autenticação ao tentar conectar. Preciso do acesso remoto para trabalhar."
      },
      {
        title: "Rede muito lenta",
        description: "A velocidade da rede está extremamente lenta, dificultando o trabalho. Vários programas estão com latência alta. A conexão fica instável."
      }
    ]
  },
  {
    id: "acesso",
    name: "🔐 Identidade & Acesso",
    category: "Acesso",
    icon: "Lock",
    templates: [
      {
        title: "Esqueci minha senha",
        description: "Não consigo lembrar da minha senha de acesso ao sistema. Tentei usar a opção 'esqueci minha senha' mas não recebi o email de recuperação."
      },
      {
        title: "Não consigo fazer login",
        description: "Quando digito meu usuário e senha, recebo mensagem de erro 'credenciais inválidas'. Tenho certeza que a senha está correta."
      },
      {
        title: "Permissão de acesso negada",
        description: "Recebi uma mensagem dizendo que não tenho permissão para acessar este recurso. Preciso de acesso urgente para completar minha atividade."
      },
      {
        title: "Preciso de novo perfil/grupo de acesso",
        description: "Fui promovido e preciso de um novo perfil no sistema com permissões diferentes. Atualmente tenho acesso de usuário comum mas preciso de acesso de gestor."
      }
    ]
  },
  {
    id: "hardware",
    name: "🖥️ Hardware & Periféricos",
    category: "Técnico",
    icon: "HardDrive",
    templates: [
      {
        title: "Impressora não funciona",
        description: "A impressora não está respondendo aos comandos de impressão. O status no sistema mostra 'offline'. Tentei reiniciar o computador mas continua não funcionando."
      },
      {
        title: "Teclado/Mouse com problema",
        description: "Meu teclado/mouse está com falha. Algumas teclas não respondem ou o cursor fica preso. Tentei reconectar o dispositivo mas o problema continua."
      },
      {
        title: "Monitor não funciona",
        description: "O monitor não está exibindo imagem corretamente. A tela fica preta ou intermitente. Já tentei trocar o cabo de vídeo."
      },
      {
        title: "Notebook/Computador não liga",
        description: "Meu equipamento não está ligando. Não vejo nenhuma luz de inicialização. Tentei deixar carregando mas nada acontece."
      }
    ]
  },
  {
    id: "software",
    name: "⚙️ Software & Sistemas",
    category: "Performance",
    icon: "Zap",
    templates: [
      {
        title: "Aplicação está travando",
        description: "O programa fica frequentemente travado e não responde. Preciso fechar e abrir novamente. Isso está afetando minha produtividade."
      },
      {
        title: "Sistema muito lento",
        description: "Todas as operações estão executando muito lentamente. O computador parece sobrecarregado mesmo quando não estou usando muitos programas."
      },
      {
        title: "Erro ao abrir programa",
        description: "Quando tento abrir o programa, recebo uma mensagem de erro. O programa não inicia. Já tentei reinstalar."
      },
      {
        title: "Arquivo corrompido ou não abre",
        description: "Um arquivo importante não consegue ser aberto. Recebo mensagem de erro dizendo que o arquivo está corrompido."
      }
    ]
  },
  {
    id: "solicitacao",
    name: "📝 Solicitações & Configurações",
    category: "Solicitação",
    icon: "FileText",
    templates: [
      {
        title: "Solicitar novo usuário",
        description: "Preciso criar um novo usuário no sistema. O nome do usuário é [NOME], email [EMAIL], e o departamento é [DEPARTAMENTO]. O usuário precisa de acesso [TIPO DE ACESSO]."
      },
      {
        title: "Instalar software",
        description: "Preciso que instalem um software específico no meu computador. O nome do programa é [NOME_SOFTWARE]. É necessário para a atividade [ATIVIDADE]."
      },
      {
        title: "Criar conta de email",
        description: "Preciso de uma nova conta de email corporativo. Nome: [NOME], Departamento: [DEPARTAMENTO], Função: [FUNÇÃO]."
      },
      {
        title: "Configurar novo equipamento",
        description: "Recebi um novo equipamento e preciso de ajuda para configurá-lo. É um [TIPO_EQUIPAMENTO]. Preciso que configure os programas necessários e conecte à rede."
      }
    ]
  },
  {
    id: "outro",
    name: "❓ Outro Problema",
    category: "Outros",
    icon: "HelpCircle",
    templates: [
      {
        title: "Descreva seu problema",
        description: "Descreva em detalhes o problema que está experimentando. Incluir: (1) O que está acontecendo? (2) Quando começou? (3) Já tentou algo para resolver?"
      }
    ]
  }
];

/**
 * Encontra template por ID
 */
export function getTemplateById(templateId) {
  return TICKET_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Retorna um template específico dentro de uma categoria
 */
export function getSpecificTemplate(templateId, index) {
  const template = getTemplateById(templateId);
  if (template && template.templates[index]) {
    return template.templates[index];
  }
  return null;
}
