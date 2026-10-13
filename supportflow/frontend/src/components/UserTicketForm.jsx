/**
 * UserTicketForm.jsx — Formulário para criar novo chamado com dropdown integrado
 *
 * Melhorias aplicadas:
 * - Correção do bug de ref: wrapper único cobre botão + dropdown, eliminando
 *   o fechamento imediato ao clicar no botão de abertura
 * - bg-linear-to-r → bg-gradient-to-r (classe Tailwind correta)
 * - fileToBase64 extraído do componente (sem dependências internas)
 * - IIFE no JSX substituído por variável derivada legível
 * - Validação de localização adicionada ao handleSubmit
 * - Handlers de localização unificados em updateLocation()
 * - Reset de formulário extraído para resetForm()
 * - Constante INITIAL_FORM_DATA evita repetição no reset
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown, ChevronLeft, Check, MapPin, Paperclip } from "lucide-react"
import { toast } from "sonner"
import { Card } from "./ui/card"
import { TICKET_TEMPLATES, getTemplateById } from "../lib/ticketTemplates"
import { localizacaoAPI } from "../services/api"

// ---------------------------------------------------------------------------
// Helpers (fora do componente — sem acesso a closures desnecessárias)
// ---------------------------------------------------------------------------

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  setor: "",
  bloco: "",
  sala: "",
  templateId: null,
  templateIndex: null,
  attachment: null,
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function UserTicketForm({ onSubmit, userEmail, userName }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  // Dropdown de templates
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownStep, setDropdownStep] = useState("category") // "category" | "problem"
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Localização
  const [locationRows, setLocationRows] = useState([])
  const [locationLoading, setLocationLoading] = useState(true)

  // Refs
  const wrapperRef = useRef(null)   // ← cobre botão + dropdown (corrige o bug)
  const fileInputRef = useRef(null)

  // -------------------------------------------------------------------------
  // Efeito: fechar dropdown ao clicar fora do wrapper (botão + menu)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // -------------------------------------------------------------------------
  // Efeito: carregar localizações
  // -------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true

    const loadLocations = async () => {
      setLocationLoading(true)
      try {
        const response = await localizacaoAPI.listar()
        if (!mounted) return
        setLocationRows(Array.isArray(response.data) ? response.data : [])
      } catch {
        if (!mounted) return
        setLocationRows([])
        toast.error("Não foi possível carregar a tabela de localização.")
      } finally {
        if (mounted) setLocationLoading(false)
      }
    }

    loadLocations()
    return () => { mounted = false }
  }, [])

  // -------------------------------------------------------------------------
  // Opções derivadas de localização
  // -------------------------------------------------------------------------
  const isIndiferente = formData.setor === "Indiferente"

  const sectorOptions = [...new Set(locationRows.map((r) => r.setor).filter(Boolean))]

  const blockOptions = isIndiferente
    ? []
    : [...new Set(
        locationRows
          .filter((r) => r.setor === formData.setor)
          .map((r) => r.bloco)
          .filter(Boolean)
      )]

  const roomOptions =
    isIndiferente || !formData.bloco
      ? []
      : [...new Set(
          locationRows
            .filter((r) => r.setor === formData.setor && r.bloco === formData.bloco)
            .map((r) => r.sala)
            .filter(Boolean)
        )]

  // -------------------------------------------------------------------------
  // Handlers de localização unificados
  // -------------------------------------------------------------------------
  const updateLocation = useCallback((field, value) => {
    if (field === "setor") {
      const normalized = value === "__indiferente__" ? "Indiferente" : value
      setFormData((prev) => ({ ...prev, setor: normalized, bloco: "", sala: "" }))
    } else if (field === "bloco") {
      setFormData((prev) => ({ ...prev, bloco: value, sala: "" }))
    } else {
      setFormData((prev) => ({ ...prev, sala: value }))
    }
  }, [])

  // -------------------------------------------------------------------------
  // Handlers do dropdown de templates
  // -------------------------------------------------------------------------
  const handleToggleDropdown = () => {
    setDropdownOpen((prev) => {
      if (!prev) {
        setDropdownStep("category")
        setSelectedCategory(null)
      }
      return !prev
    })
  }

  const handleSelectCategory = (templateId) => {
    setSelectedCategory(templateId)
    setDropdownStep("problem")
  }

  const handleSelectProblem = (index) => {
    const template = getTemplateById(selectedCategory)
    const selected = template?.templates[index]
    if (!selected) return

    setFormData((prev) => ({
      ...prev,
      title: selected.title,
      description: selected.description,
      templateId: selectedCategory,
      templateIndex: index,
    }))
    setDropdownOpen(false)
    setDropdownStep("category")
    setSelectedCategory(null)
  }

  const handleBackToCategories = () => {
    setDropdownStep("category")
    setSelectedCategory(null)
  }

  // -------------------------------------------------------------------------
  // Anexo
  // -------------------------------------------------------------------------
  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0] ?? null
    setFormData((prev) => ({ ...prev, attachment: file }))
  }

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Preencha título e descrição.")
      return
    }

    // Validação de localização
    if (!isIndiferente && !formData.setor) {
      toast.error("Selecione o setor ou marque como Indiferente.")
      return
    }
    if (!isIndiferente && (!formData.bloco || !formData.sala)) {
      toast.error("Selecione bloco e sala para o setor escolhido.")
      return
    }

    let attachmentBase64 = null
    let attachmentName = null
    let attachmentContentType = null

    if (formData.attachment) {
      attachmentBase64 = await fileToBase64(formData.attachment)
      attachmentName = formData.attachment.name
      attachmentContentType = formData.attachment.type || "application/octet-stream"
    }

    await onSubmit({
      ...formData,
      requester: userName,
      email: userEmail,
      attachmentBase64,
      attachmentName,
      attachmentContentType,
    })

    resetForm()
  }

  // -------------------------------------------------------------------------
  // Render: dropdown de templates
  // -------------------------------------------------------------------------
  const currentCategoryTemplates = getTemplateById(selectedCategory)?.templates ?? []

  const renderDropdownContent = () => {
    if (dropdownStep === "category") {
      return TICKET_TEMPLATES.map((template, idx) => (
        <button
          key={template.id}
          type="button"
          onClick={() => handleSelectCategory(template.id)}
          className={`w-full px-4 py-2.5 text-left transition-all flex justify-between items-center group hover:bg-blue-50 ${
            idx !== TICKET_TEMPLATES.length - 1 ? "border-b border-slate-100" : ""
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm">📋</span>
            <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700 truncate">
              {template.name}
            </span>
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
        </button>
      ))
    }

    return (
      <>
        <button
          type="button"
          onClick={handleBackToCategories}
          className="w-full px-5 py-3 text-left border-b border-slate-200 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 bg-slate-50"
        >
          <ChevronLeft size={16} />
          <span>Voltar às categorias</span>
        </button>

        {currentCategoryTemplates.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSelectProblem(index)}
            className={`w-full px-4 py-2.5 text-left transition-all hover:bg-blue-50 ${
              index !== currentCategoryTemplates.length - 1 ? "border-b border-slate-100" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <Check size={14} className="mt-0.5 text-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-slate-900 text-sm">{item.title}</div>
                <div className="text-xs text-slate-600 mt-1">{item.description}</div>
              </div>
            </div>
          </button>
        ))}
      </>
    )
  }

  // -------------------------------------------------------------------------
  // JSX principal
  // -------------------------------------------------------------------------
  return (
    <Card className="flex flex-col border-0 bg-white shadow-sm">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Novo Chamado</h2>
        <p className="text-xs text-blue-100 mt-1">Descreva seu problema para que a equipe possa ajudar</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Dropdown de templates — wrapper unificado (botão + menu) */}
        <div className="relative" ref={wrapperRef}>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Descreva o Problema
          </label>

          <button
            type="button"
            onClick={handleToggleDropdown}
            className={`w-full px-3 py-2 text-left border rounded-md transition-all flex justify-between items-center text-sm ${
              dropdownOpen
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : formData.title
                ? "border-green-300 bg-green-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className={formData.title ? "text-green-700 font-medium flex items-center gap-2 text-sm" : "text-slate-500 text-sm"}>
              {formData.title ? (
                <>
                  <Check size={14} />
                  <span className="truncate">{formData.title}</span>
                </>
              ) : (
                "Escolher modelo"
              )}
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""} text-slate-500`}
            />
          </button>

          {/* Menu dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
              {renderDropdownContent()}
            </div>
          )}

          <p className="text-xs text-slate-500 mt-2">
            💡 Dica: Selecione um modelo para preencher automaticamente título e descrição
          </p>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Título</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Título do seu chamado..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            required
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Descrição Detalhada</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Adicione mais detalhes sobre o problema..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-28 text-sm"
            required
          />
          <p className="text-xs text-slate-500 mt-1">Seja específico para que possamos resolver mais rápido</p>
        </div>

        {/* Anexo */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            <Paperclip size={14} className="inline mr-1" />
            Foto ou print
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleAttachmentChange}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 file:cursor-pointer"
          />
          <p className="text-xs text-slate-500 mt-2">
            Opcional: envie uma foto ou print para ajudar a equipe a entender o problema.
          </p>
          {formData.attachment && (
            <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-xs text-green-800 font-semibold">✓ Arquivo selecionado:</p>
              <p className="text-xs text-green-700 mt-1 break-words">{formData.attachment.name}</p>
            </div>
          )}
        </div>

        {/* Localização */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="block text-sm font-semibold text-slate-900">Localização</label>
            <span className="text-xs text-slate-500">Definida pelo gestor</span>
          </div>

          {!locationLoading && sectorOptions.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              ⚠️ Nenhuma localização cadastrada. Peça ao gestor para cadastrar setores, blocos e salas em{" "}
              <strong>Catálogo e Locais</strong>.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {/* Setor */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Setor</label>
              <select
                value={isIndiferente ? "__indiferente__" : formData.setor}
                onChange={(e) => updateLocation("setor", e.target.value)}
                disabled={locationLoading}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="" disabled>
                  {locationLoading ? "Carregando..." : "Selecione o setor"}
                </option>
                <option value="__indiferente__">📍 Indiferente (não depende de local)</option>
                {sectorOptions.map((setor) => (
                  <option key={setor} value={setor}>{setor}</option>
                ))}
              </select>
            </div>

            {/* Bloco + Sala */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Bloco</label>
                <select
                  value={formData.bloco}
                  onChange={(e) => updateLocation("bloco", e.target.value)}
                  disabled={isIndiferente || locationLoading || !formData.setor || blockOptions.length === 0}
                  required={!isIndiferente}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="" disabled>Selecione</option>
                  {blockOptions.map((bloco) => (
                    <option key={bloco} value={bloco}>{bloco}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Sala</label>
                <select
                  value={formData.sala}
                  onChange={(e) => updateLocation("sala", e.target.value)}
                  disabled={isIndiferente || locationLoading || !formData.bloco || roomOptions.length === 0}
                  required={!isIndiferente}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="" disabled>Selecione</option>
                  {roomOptions.map((sala) => (
                    <option key={sala} value={sala}>{sala}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resumo de localização */}
            {!isIndiferente && formData.setor && formData.bloco && formData.sala && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                <MapPin size={13} />
                <span>
                  <strong>{formData.setor}</strong> · {formData.bloco} · {formData.sala}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg active:shadow-sm"
        >
          Criar Chamado
        </button>
      </form>
    </Card>
  )
}