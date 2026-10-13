/**
 * useExport.js - Hook React para exportação com feedback visual
 * Gerencia loading, erros, sucesso e feedback ao usuário
 */

import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import ExportService from '../lib/ExportService'

/**
 * Hook para gerenciar exportação
 * @param {string} theme - Tema de cor: 'professional', 'modern', 'corporate'
 * @returns {Object} Objeto com funções de exportação e estado
 */
export function useExport(theme = 'professional') {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const exportService = useMemo(() => new ExportService(theme), [theme])

  /**
   * Simular progresso (para UX melhorada)
   */
  const simulateProgress = async (duration = 2000) => {
    const steps = 20
    const interval = duration / steps

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, interval))
      setProgress((i / steps) * 100)
    }
  }

  /**
   * Exportar para CSV
   */
  const exportCsv = useCallback(
    async (filename, columns, rows) => {
      try {
        setIsLoading(true)
        setError(null)
        setProgress(0)

        // Simular progresso
        const progressPromise = simulateProgress()

        // Executar exportação
        const result = await exportService.exportToCsv(filename, columns, rows)

        await progressPromise
        setProgress(100)

        if (result.success) {
          toast.success(result.message.title, {
            description: result.message.description,
          })
          return result
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        const message = err.message || 'Erro ao exportar CSV'
        setError(message)
        toast.error('Erro na exportação', {
          description: message,
        })
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
        setProgress(0)
      }
    },
    [exportService]
  )

  /**
   * Exportar para PDF
   */
  const exportPdf = useCallback(
    async (filename, columns, rows, options = {}) => {
      try {
        setIsLoading(true)
        setError(null)
        setProgress(0)

        const progressPromise = simulateProgress()
        const result = await exportService.exportToPdf(filename, columns, rows, options)

        await progressPromise
        setProgress(100)

        if (result.success) {
          toast.success(result.message.title, {
            description: result.message.description,
          })
          return result
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        const message = err.message || 'Erro ao exportar PDF'
        setError(message)
        toast.error('Erro na exportação', {
          description: message,
        })
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
        setProgress(0)
      }
    },
    [exportService]
  )

  /**
   * Exportar para DOCX
   */
  const exportDocx = useCallback(
    async (filename, columns, rows, options = {}) => {
      try {
        setIsLoading(true)
        setError(null)
        setProgress(0)

        const progressPromise = simulateProgress()
        const result = await exportService.exportToDocx(filename, columns, rows, options)

        await progressPromise
        setProgress(100)

        if (result.success) {
          toast.success(result.message.title, {
            description: result.message.description,
          })
          return result
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        const message = err.message || 'Erro ao exportar DOCX'
        setError(message)
        toast.error('Erro na exportação', {
          description: message,
        })
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
        setProgress(0)
      }
    },
    [exportService]
  )

  /**
   * Exportar para Excel
   */
  const exportExcel = useCallback(
    async (filename, columns, rows, options = {}) => {
      try {
        setIsLoading(true)
        setError(null)
        setProgress(0)

        const progressPromise = simulateProgress()
        const result = await exportService.exportToExcel(filename, columns, rows, options)

        await progressPromise
        setProgress(100)

        if (result.success) {
          toast.success(result.message.title, {
            description: result.message.description,
          })
          return result
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        const message = err.message || 'Erro ao exportar Excel'
        setError(message)
        toast.error('Erro na exportação', {
          description: message,
        })
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
        setProgress(0)
      }
    },
    [exportService]
  )

  /**
   * Exportar para múltiplos formatos ao mesmo tempo
   */
  const exportMultiple = useCallback(
    async (baseFilename, columns, rows, formats = ['csv', 'pdf', 'docx'], options = {}) => {
      try {
        setIsLoading(true)
        setError(null)
        setProgress(0)

        const results = {}
        const totalSteps = formats.length

        for (let i = 0; i < formats.length; i++) {
          const format = formats[i]
          setProgress((i / totalSteps) * 100)

          const filename = `${baseFilename}.${format}`

          switch (format) {
            case 'csv':
              results.csv = await exportService.exportToCsv(filename, columns, rows)
              break
            case 'pdf':
              results.pdf = await exportService.exportToPdf(
                filename,
                columns,
                rows,
                options
              )
              break
            case 'docx':
              results.docx = await exportService.exportToDocx(
                filename,
                columns,
                rows,
                options
              )
              break
            case 'xlsx':
            case 'excel':
              results.excel = await exportService.exportToExcel(filename, columns, rows, options)
              break
            default:
              break
          }
        }

        setProgress(100)

        // Contar sucessos
        const successCount = Object.values(results).filter(r => r.success).length
        toast.success(`${successCount} arquivo(s) exportado(s) com sucesso!`)

        return results
      } catch (err) {
        const message = err.message || 'Erro ao exportar arquivos'
        setError(message)
        toast.error('Erro na exportação múltipla', {
          description: message,
        })
        return { success: false, error: message }
      } finally {
        setIsLoading(false)
        setProgress(0)
      }
    },
    [exportService]
  )

  return {
    // Funções
    exportCsv,
    exportPdf,
    exportDocx,
    exportExcel,
    exportMultiple,

    // Estado
    isLoading,
    progress,
    error,

    // Serviço para customizações avançadas
    exportService,
  }
}

export default useExport
