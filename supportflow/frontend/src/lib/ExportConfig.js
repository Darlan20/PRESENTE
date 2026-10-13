/**
 * ExportConfig.js - Configurações, temas e templates de exportação
 * Define formatadores, temas de cores, estilos de tabelas
 */

// 🎨 TEMAS PROFISSIONAIS
export const THEMES = {
  professional: {
    primaryColor: [37, 99, 235], // Azul profissional
    headerColor: [25, 68, 170],  // Azul escuro
    accentColor: [59, 130, 246], // Azul claro
    textColor: [15, 23, 42],     // Cinza escuro
    borderColor: [226, 232, 240], // Cinza claro
  },
  modern: {
    primaryColor: [6, 182, 212], // Cyan
    headerColor: [8, 145, 178],  // Cyan escuro
    accentColor: [34, 197, 94],  // Verde
    textColor: [15, 23, 42],
    borderColor: [226, 232, 240],
  },
  corporate: {
    primaryColor: [55, 65, 81],  // Cinza
    headerColor: [31, 41, 55],   // Cinza escuro
    accentColor: [156, 39, 176], // Roxo
    textColor: [17, 24, 39],
    borderColor: [229, 231, 235],
  },
}

// 📋 FORMATADORES DE VALORES
export const FORMATTERS = {
  date: (value) => {
    if (!value) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value))
  },

  datetime: (value) => {
    if (!value) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  },

  currency: (value) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  },

  percent: (value) => {
    if (!value) return '-'
    return `${Math.round(value)}%`
  },

  boolean: (value) => {
    return value ? 'Sim' : 'Não'
  },

  status: (value) => {
    const statusMap = {
      'aberto': 'Aberto',
      'em-andamento': 'Em Andamento',
      'resolvido': 'Resolvido',
    }
    return statusMap[value] || value
  },

  priority: (value) => {
    const priorityMap = {
      'baixa': 'Baixa',
      'média': 'Média',
      'alta': 'Alta',
      'urgente': 'Urgente',
    }
    return priorityMap[value] || value
  },

  text: (value) => {
    if (value === null || value === undefined) return '-'
    return String(value).trim()
  },
}

export const PRIORITY_PDF_COLORS = {
  baixa: { fillColor: [241, 245, 249], textColor: [71, 85, 105] },
  média: { fillColor: [254, 243, 199], textColor: [180, 83, 9] },
  alta: { fillColor: [255, 237, 213], textColor: [194, 65, 12] },
  urgente: { fillColor: [254, 226, 226], textColor: [185, 28, 28] },
}

// 🎯 TEMPLATES DE EXPORTAÇÃO
export const TEMPLATES = {
  default: {
    title: 'Relatório',
    subtitle: (count) => `Total de registros: ${count}`,
    includeDate: true,
    includeFooter: true,
  },

  reports: {
    title: 'SupportFlow - Relatório de Chamados',
    subtitle: (count) => `Resumo de ${count} chamado(s)`,
    includeDate: true,
    includeFooter: true,
    headerImage: null, // URL da logo
  },

  tickets: {
    title: 'SupportFlow - Lista de Solicitações',
    subtitle: (count) => `Total: ${count} solicitação(ões)`,
    includeDate: true,
    includeFooter: true,
  },
}

// 📊 CONFIGURAÇÕES DE COLUNA
export const COLUMN_TYPES = {
  text: {
    width: 'auto',
    align: 'left',
    formatter: FORMATTERS.text,
  },
  date: {
    width: 80,
    align: 'center',
    formatter: FORMATTERS.date,
  },
  datetime: {
    width: 100,
    align: 'center',
    formatter: FORMATTERS.datetime,
  },
  status: {
    width: 80,
    align: 'center',
    formatter: FORMATTERS.status,
  },
  priority: {
    width: 70,
    align: 'center',
    formatter: FORMATTERS.priority,
  },
  number: {
    width: 60,
    align: 'right',
    formatter: (v) => v || '-',
  },
  currency: {
    width: 80,
    align: 'right',
    formatter: FORMATTERS.currency,
  },
  boolean: {
    width: 60,
    align: 'center',
    formatter: FORMATTERS.boolean,
  },
}

// 🔧 OPÇÕES DE EXPORTAÇÃO
export const EXPORT_OPTIONS = {
  pdf: {
    orientation: 'landscape',
    format: 'a4',
    margin: 10,
    fontSize: 9,
    headerFontSize: 16,
    lineHeight: 1.2,
  },
  docx: {
    pageSize: 'A4',
    margins: {
      top: 720, // twips (1/20 pt)
      right: 720,
      bottom: 720,
      left: 720,
    },
    fontSize: 11,
  },
  excel: {
    sheetName: 'Dados',
    freezePane: true,
    autoFilter: true,
    columnWidth: 'auto',
  },
  csv: {
    delimiter: ',',
    encoding: 'utf-8',
    quoteFields: true,
  },
}

// 🎨 ESTILOS PDF
export const PDF_STYLES = {
  header: {
    fillColor: [37, 99, 235],
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 10,
    alignment: 'center',
  },
  body: {
    fontSize: 8,
    cellPadding: 5,
  },
  alternateRow: {
    fillColor: [241, 245, 250],
  },
  footer: {
    textColor: [100, 116, 139],
    fontSize: 7,
    italics: true,
  },
}

// ✅ VALIDAÇÕES
export const VALIDATORS = {
  notEmpty: (rows) => {
    if (!rows || rows.length === 0) {
      throw new Error('Nenhum registro para exportar. Ajuste os filtros.')
    }
  },

  validColumns: (columns) => {
    if (!columns || columns.length === 0) {
      throw new Error('Nenhuma coluna definida para exportação.')
    }
  },

  validData: (rows, columns) => {
    this.notEmpty(rows)
    this.validColumns(columns)

    // Validar se todas as linhas têm as chaves esperadas
    const validKeys = columns.map(c => c.key)
    const invalidRows = rows.filter(row => 
      !validKeys.some(key => key in row)
    )

    if (invalidRows.length === rows.length) {
      throw new Error('Estrutura de dados inválida.')
    }
  },
}

// 📝 MENSAGENS
export const MESSAGES = {
  success: (format, count) => ({
    title: `${format.toUpperCase()} exportado com sucesso!`,
    description: `${count} registro(s) incluído(s).`,
  }),

  error: (format) => ({
    title: `Erro ao exportar ${format.toUpperCase()}`,
    description: 'Tente novamente ou verifique os dados.',
  }),

  noData: {
    title: 'Nenhum dado para exportar',
    description: 'Ajuste os filtros e tente novamente.',
  },

  validating: (format) => ({
    title: `Preparando ${format.toUpperCase()}...`,
    description: 'Validando dados...',
  }),
}

export default {
  THEMES,
  FORMATTERS,
  PRIORITY_PDF_COLORS,
  TEMPLATES,
  COLUMN_TYPES,
  EXPORT_OPTIONS,
  PDF_STYLES,
  VALIDATORS,
  MESSAGES,
}
