/**
 * ExportService.js - Serviço centralizado de exportação
 * Suporta: PDF, CSV, DOCX, XLSX
 * Inclui validação, formatação, tratamento de erros
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
} from 'docx'
import * as XLSX from 'xlsx'
import {
  THEMES,
  FORMATTERS,
  PRIORITY_PDF_COLORS,
  TEMPLATES,
  VALIDATORS,
  MESSAGES,
  PDF_STYLES,
  EXPORT_OPTIONS,
} from './ExportConfig'

class ExportService {
  constructor(theme = 'professional') {
    this.theme = THEMES[theme] || THEMES.professional
    this.isProcessing = false
  }

  /**
   * 🔍 Validar dados antes de exportar
   */
  validateData(rows, columns) {
    try {
      if (!rows || rows.length === 0) {
        throw new Error(MESSAGES.noData.description)
      }
      if (!columns || columns.length === 0) {
        throw new Error('Nenhuma coluna definida para exportação.')
      }
      return true
    } catch (error) {
      throw new Error(error.message)
    }
  }

  /**
   * 📋 Normalizar e formatar dados
   */
  normalizeValue(value, formatter = null) {
    if (value === null || value === undefined) return '-'
    if (typeof formatter === 'function') {
      return formatter(value)
    }
    return String(value).trim()
  }

  /**
   * 📊 Formatar linha com formatadores customizados
   */
  formatRow(row, columns) {
    return columns.reduce((acc, column) => {
      const value = row[column.key]
      const formatter = column.formatter || FORMATTERS.text
      acc[column.key] = this.normalizeValue(value, formatter)
      return acc
    }, {})
  }

  getPriorityPdfColors(value) {
    const normalized = String(value || '').trim().toLowerCase()
    return PRIORITY_PDF_COLORS[normalized] || null
  }

  /**
   * ✅ Exportar para CSV
   */
  async exportToCsv(filename, columns, rows) {
    try {
      this.validateData(rows, columns)
      this.isProcessing = true

      // Formatar dados
      const formattedRows = rows.map(row => this.formatRow(row, columns))

      // Criar cabeçalho
      const header = columns.map(c => c.label).join(',')

      // Criar linhas (com escape de aspas)
      const csvRows = formattedRows.map(row =>
        columns
          .map(col => {
            const value = row[col.key]
            const escaped = String(value).replace(/"/g, '""')
            return `"${escaped}"`
          })
          .join(',')
      )

      // Combinar tudo
      const csvContent = [header, ...csvRows].join('\n')

      // Adicionar BOM para UTF-8 (Excel compativa)
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

      // Download
      this.downloadFile(blob, filename)
      this.isProcessing = false

      return {
        success: true,
        message: MESSAGES.success('csv', rows.length),
        rowCount: rows.length,
      }
    } catch (error) {
      this.isProcessing = false
      return {
        success: false,
        message: MESSAGES.error('csv'),
        error: error.message,
      }
    }
  }

  /**
   * 📄 Exportar para PDF
   */
  async exportToPdf(filename, columns, rows, options = {}) {
    try {
      this.validateData(rows, columns)
      this.isProcessing = true

      const opts = { ...EXPORT_OPTIONS.pdf, ...options }

      // Criar documento
      const doc = new jsPDF({
        orientation: opts.orientation,
        unit: 'pt',
        format: opts.format,
      })

      // Cabeçalho
      doc.setFontSize(opts.headerFontSize)
      doc.setTextColor(...this.theme.primaryColor)
      doc.text(options.title || 'Relatório', 40, 40)

      // Subtítulo com data
      doc.setFontSize(10)
      doc.setTextColor(...this.theme.textColor)
      const subtitle = options.subtitle ? options.subtitle(rows.length) : `Total: ${rows.length}`
      doc.text(subtitle, 40, 58)

      if (options.includeDate) {
        const today = new Date().toLocaleDateString('pt-BR')
        doc.text(`Data: ${today}`, 40, 72)
      }

      // Tabela
      const formattedRows = rows.map(row => this.formatRow(row, columns))

      autoTable(doc, {
        startY: 90,
        head: [columns.map(c => c.label)],
        body: formattedRows.map(row =>
          columns.map(col => row[col.key])
        ),
        styles: {
          fontSize: opts.fontSize,
          cellPadding: 5,
          textColor: this.theme.textColor,
          lineColor: this.theme.borderColor,
        },
        headStyles: {
          fillColor: this.theme.primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: opts.fontSize + 1,
        },
        alternateRowStyles: {
          fillColor: [241, 245, 250],
        },
        columnStyles: columns.reduce((acc, col, idx) => {
          acc[idx] = {
            halign: col.align || 'left',
            cellWidth: col.width || 'auto',
          }
          return acc
        }, {}),
        didParseCell: (hookData) => {
          if (hookData.section !== 'body') return

          const column = columns[hookData.column.index]
          if (!column || !['prioridade', 'priority'].includes(column.key)) return

          const colors = this.getPriorityPdfColors(hookData.cell.raw)
          if (!colors) return

          hookData.cell.styles.fillColor = colors.fillColor
          hookData.cell.styles.textColor = colors.textColor
          hookData.cell.styles.fontStyle = 'bold'
          hookData.cell.styles.halign = 'center'
        },
        margin: { top: 90, right: 20, bottom: 30, left: 20 },
        didDrawPage: (data) => {
          // Rodapé
          const pageCount = doc.getNumberOfPages()
          const pageSize = doc.internal.pageSize
          const pageHeight = pageSize.getHeight()
          const pageWidth = pageSize.getWidth()

          if (options.includeFooter !== false) {
            doc.setFontSize(8)
            doc.setTextColor(...this.theme.borderColor)
            doc.text(
              `Página ${data.pageNumber} de ${pageCount}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
            )
          }
        },
      })

      doc.save(filename)
      this.isProcessing = false

      return {
        success: true,
        message: MESSAGES.success('pdf', rows.length),
        rowCount: rows.length,
      }
    } catch (error) {
      this.isProcessing = false
      return {
        success: false,
        message: MESSAGES.error('pdf'),
        error: error.message,
      }
    }
  }

  /**
   * 📘 Exportar para DOCX
   */
  async exportToDocx(filename, columns, rows, options = {}) {
    try {
      this.validateData(rows, columns)
      this.isProcessing = true

      const formattedRows = rows.map(row => this.formatRow(row, columns))

      // Cabeçalho da tabela
      const headerCells = columns.map(col =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: col.label,
                  bold: true,
                  color: 'FFFFFF',
                  size: 22, // 11pt = 22 em half-points
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { fill: this.rgbToHex(...this.theme.primaryColor) },
        })
      )

      // Linhas da tabela
      const bodyRows = formattedRows.map((row, idx) =>
        new TableRow({
          children: columns.map(col =>
            new TableCell({
              children: [
                new Paragraph({
                  text: row[col.key],
                  alignment: col.align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
                }),
              ],
              shading: idx % 2 === 0 ? { fill: 'F1F5FA' } : {},
            })
          ),
        })
      )

      // Criar documento
      const doc = new Document({
        sections: [
          {
            children: [
              // Título
              new Paragraph({
                children: [
                  new TextRun({
                    text: options.title || 'Relatório',
                    bold: true,
                    size: 32, // 16pt
                    color: this.rgbToHex(...this.theme.primaryColor),
                  }),
                ],
                spacing: { after: 100 },
              }),

              // Subtítulo e data
              new Paragraph({
                children: [
                  new TextRun({
                    text: options.subtitle ? options.subtitle(rows.length) : `Total: ${rows.length}`,
                    size: 20, // 10pt
                  }),
                ],
                spacing: { after: 50 },
              }),

              ...(options.includeDate
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Data: ${new Date().toLocaleDateString('pt-BR')}`,
                          size: 18, // 9pt
                          italics: true,
                          color: '64748b',
                        }),
                      ],
                      spacing: { after: 200 },
                    }),
                  ]
                : []),

              // Tabela
              new Table({
                rows: [
                  new TableRow({ children: headerCells }),
                  ...bodyRows,
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: 'single', size: 1, color: 'e2e8f0' },
                  bottom: { style: 'single', size: 1, color: 'e2e8f0' },
                  left: { style: 'single', size: 1, color: 'e2e8f0' },
                  right: { style: 'single', size: 1, color: 'e2e8f0' },
                  insideHorizontal: { style: 'single', size: 1, color: 'e2e8f0' },
                  insideVertical: { style: 'single', size: 1, color: 'e2e8f0' },
                },
              }),

              // Rodapé
              ...(options.includeFooter !== false
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Gerado em ${new Date().toLocaleString('pt-BR')}`,
                          size: 14,
                          italics: true,
                          color: '94a3b8',
                        }),
                      ],
                      spacing: { before: 200 },
                    }),
                  ]
                : []),
            ],
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      this.downloadFile(blob, filename)
      this.isProcessing = false

      return {
        success: true,
        message: MESSAGES.success('docx', rows.length),
        rowCount: rows.length,
      }
    } catch (error) {
      this.isProcessing = false
      return {
        success: false,
        message: MESSAGES.error('docx'),
        error: error.message,
      }
    }
  }

  /**
   * 📊 Exportar para XLSX (Excel)
   */
  async exportToExcel(filename, columns, rows, options = {}) {
    try {
      this.validateData(rows, columns)
      this.isProcessing = true

      const formattedRows = rows.map(row => this.formatRow(row, columns))

      // Preparar dados para Excel
      const worksheetData = [
        columns.map(c => c.label),
        ...formattedRows.map(row => columns.map(col => row[col.key])),
      ]

      // Criar workbook
      const ws = XLSX.utils.aoa_to_sheet(worksheetData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Dados')

      // Estilizar cabeçalho
      const range = XLSX.utils.decode_range(ws['!ref'])
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1'
        if (!ws[address]) continue
        ws[address].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '2563EB' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        }
      }

      // Ajustar largura das colunas
      ws['!cols'] = columns.map(col => ({ wch: col.width || 20 }))

      // Congelar primeira linha
      if (options.freezePane) {
        ws['!freeze'] = { xSplit: 0, ySplit: 1 }
      }

      // Gerar arquivo
      XLSX.writeFile(wb, filename)
      this.isProcessing = false

      return {
        success: true,
        message: MESSAGES.success('xlsx', rows.length),
        rowCount: rows.length,
      }
    } catch (error) {
      this.isProcessing = false
      return {
        success: false,
        message: MESSAGES.error('xlsx'),
        error: error.message,
      }
    }
  }

  /**
   * 💾 Fazer download do arquivo
   */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 🎨 Converter RGB para HEX (para DOCX)
   */
  rgbToHex(r, g, b) {
    return [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('').toUpperCase()
  }
}

export default ExportService
