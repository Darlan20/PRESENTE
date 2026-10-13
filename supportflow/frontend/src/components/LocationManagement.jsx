import { useEffect, useState, useMemo } from "react"
import { MapPin, Plus, Trash2, Search, Layers, Hash, Info, Edit2, X } from "lucide-react"
import { toast } from "sonner"
import { localizacaoAPI, getApiErrorMessage } from "../services/api"

// ── Setores sugeridos com descrição ────────────────────────────────────────────
const SETORES_SUGERIDOS = [
  { nome: "Pedagógico",    desc: "Salas de aula, laboratórios de ensino" },
  { nome: "Administrativo", desc: "Secretaria, diretoria, RH, financeiro" },
  { nome: "Infraestrutura", desc: "TI, manutenção, almoxarifado" },
  { nome: "Esporte e Lazer", desc: "Quadra, ginásio, piscina" },
  { nome: "Biblioteca",    desc: "Acervo, sala de leitura" },
  { nome: "Refeitório",    desc: "Cantina, copa, cozinha" },
]

// ── Tabs ───────────────────────────────────────────────────────────────────────
const TAB_SINGLE = "single"
const TAB_BULK   = "bulk"

export function LocationManagement() {
  const [locations,   setLocations]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [searchTerm,  setSearchTerm]  = useState("")
  const [activeTab,   setActiveTab]   = useState(TAB_SINGLE)
  const [editing,     setEditing]     = useState(null)

  // ── Formulário unitário ──────────────────────────────────────────────────────
  const [form, setForm] = useState({ setor: "", bloco: "", sala: "" })

  // ── Formulário em lote ───────────────────────────────────────────────────────
  const [bulk, setBulk] = useState({
    setor:    "",
    bloco:    "",
    prefixo:  "Sala",
    inicio:   1,
    fim:      10,
    zeros:    false, // padding: Sala 01, 02...
  })

  // Preview das salas que serão criadas em lote
  const bulkPreview = useMemo(() => {
    const ini = parseInt(bulk.inicio) || 1
    const fim = parseInt(bulk.fim)    || 1
    if (!bulk.setor.trim() || !bulk.bloco.trim() || ini > fim || fim - ini > 199) return []
    const items = []
    for (let i = ini; i <= fim; i++) {
      const num  = bulk.zeros ? String(i).padStart(2, "0") : String(i)
      const sala = bulk.prefixo.trim() ? `${bulk.prefixo.trim()} ${num}` : num
      items.push({ setor: bulk.setor.trim(), bloco: bulk.bloco.trim(), sala })
    }
    return items
  }, [bulk])

  // ── API ─────────────────────────────────────────────────────────────────────
  const fetchLocations = async ({ silent = false } = {}) => {
    try {
      const response = await localizacaoAPI.listar()
      setLocations(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      if (!silent) toast.error(getApiErrorMessage(error, "Erro ao carregar localizações."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLocations() }, [])

  // ── Submit unitário ─────────────────────────────────────────────────────────
  const handleSubmitSingle = async (e) => {
    e.preventDefault()
    if (!form.setor.trim() || !form.bloco.trim() || !form.sala.trim()) {
      toast.error("Preencha setor, bloco e sala.")
      return
    }
    setSaving(true)
    try {
      await localizacaoAPI.criar(form)
      setForm({ setor: "", bloco: "", sala: "" })
      await fetchLocations({ silent: true })
      toast.success("Localização cadastrada com sucesso.")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível cadastrar a localização."))
    } finally {
      setSaving(false)
    }
  }

  // ── Submit em lote ──────────────────────────────────────────────────────────
  const handleSubmitBulk = async (e) => {
    e.preventDefault()
    if (bulkPreview.length === 0) {
      toast.error("Verifique os campos: setor, bloco e intervalo de salas.")
      return
    }
    if (bulkPreview.length > 200) {
      toast.error("Máximo de 200 salas por lote.")
      return
    }
    setSaving(true)
    try {
      // Envia todas em paralelo
      const results = await Promise.allSettled(
        bulkPreview.map((item) => localizacaoAPI.criar(item))
      )
      const ok      = results.filter((r) => r.status === "fulfilled").length
      const falhas  = results.filter((r) => r.status === "rejected").length

      await fetchLocations({ silent: true })

      if (falhas === 0) {
        toast.success(`${ok} sala(s) cadastrada(s) com sucesso!`)
        setBulk((prev) => ({ ...prev, setor: "", bloco: "", prefixo: "Sala", inicio: 1, fim: 10 }))
      } else {
        toast.warning(`${ok} cadastradas, ${falhas} ignoradas (já existiam ou erro).`)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao cadastrar em lote."))
    } finally {
      setSaving(false)
    }
  }

  // ── Deletar ─────────────────────────────────────────────────────────────────
  const handleDeleteLocation = async (id) => {
    if (!window.confirm("Excluir esta localização?")) return
    try {
      await localizacaoAPI.deletar(id)
      await fetchLocations({ silent: true })
      toast.success("Localização removida.")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir a localização."))
    }
  }

  const handleDeleteSector = async (setor) => {
    if (!window.confirm(`Excluir o setor "${setor}" e todas as suas salas?`)) return
    try {
      await localizacaoAPI.deletarSetor(setor)
      await fetchLocations({ silent: true })
      toast.success("Setor removido.")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir o setor."))
    }
  }

  const openEditLocation = (location) => {
    setEditing({
      mode: "location",
      id: location.id,
      setor: location.setor || "",
      bloco: location.bloco || "",
      sala: location.sala || "",
    })
  }

  const openEditSector = (setor) => {
    setEditing({
      mode: "sector",
      originalSetor: setor,
      setor,
    })
  }

  const closeEditor = () => setEditing(null)

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    if (!editing) return

    if (editing.mode === "location") {
      if (!editing.setor.trim() || !editing.bloco.trim() || !editing.sala.trim()) {
        toast.error("Preencha setor, bloco e sala.")
        return
      }
    } else if (!editing.setor.trim()) {
      toast.error("Informe o nome do setor.")
      return
    }

    setSaving(true)
    try {
      if (editing.mode === "location") {
        await localizacaoAPI.atualizar(editing.id, {
          setor: editing.setor,
          bloco: editing.bloco,
          sala: editing.sala,
        })
        toast.success("Localização atualizada.")
      } else {
        await localizacaoAPI.renomearSetor(editing.originalSetor, { setor: editing.setor })
        toast.success("Setor atualizado.")
      }

      closeEditor()
      await fetchLocations({ silent: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar a localização."))
    } finally {
      setSaving(false)
    }
  }

  // ── Dados filtrados / agrupados ──────────────────────────────────────────────
  const filteredLocations = locations.filter((l) => {
    const t = searchTerm.toLowerCase()
    return l.setor?.toLowerCase().includes(t) || l.bloco?.toLowerCase().includes(t) || l.sala?.toLowerCase().includes(t)
  })
  const uniqueSectors = [...new Set(locations.map((l) => l.setor).filter(Boolean))]
  const uniqueBlocks  = [...new Set(locations.map((l) => l.bloco).filter(Boolean))]
  const groupedLocations = [...new Set(filteredLocations.map((l) => l.setor).filter(Boolean))].map((setor) => ({
    setor,
    blocos: [...new Set(filteredLocations.filter((l) => l.setor === setor).map((l) => l.bloco).filter(Boolean))].map((bloco) => ({
      bloco,
      salas: filteredLocations.filter((l) => l.setor === setor && l.bloco === bloco),
    })),
  }))

  // ── Setores já cadastrados (para sugestão no select) ───────────────────────
  const setoresExistentes = [...new Set(locations.map((l) => l.setor).filter(Boolean))]

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-blue-50 p-4 shadow-sm">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <MapPin size={14} />
              Configuração de Localizações
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Estrutura física da instituição</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cadastre setores, blocos e salas. O usuário escolherá a localização do chamado a partir dessas opções.
            </p>

            {/* Explicação de "Setor" */}
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
              <div className="text-xs text-amber-800 leading-5">
                <span className="font-semibold">O que é Setor?</span> É a área/departamento da instituição.
                Use <span className="font-semibold">Pedagógico</span> para salas de aula,{" "}
                <span className="font-semibold">Administrativo</span> para secretaria/diretoria,{" "}
                <span className="font-semibold">Infraestrutura</span> para TI/manutenção etc.
                Assim chamados de locais que não são sala de aula ficam organizados no setor correto.
              </div>
            </div>

            {/* Sugestões rápidas de setor */}
            <div className="mt-3 flex flex-wrap gap-2">
              {SETORES_SUGERIDOS.map((s) => (
                <button
                  key={s.nome}
                  type="button"
                  title={s.desc}
                  onClick={() => {
                    if (activeTab === TAB_SINGLE) setForm((p) => ({ ...p, setor: s.nome }))
                    else setBulk((p) => ({ ...p, setor: s.nome }))
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                >
                  {s.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-3 gap-3 sm:min-w-65">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-500">Setores</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{uniqueSectors.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-500">Blocos</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{uniqueBlocks.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-500">Salas</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{locations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Abas de cadastro ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Tab buttons */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab(TAB_SINGLE)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === TAB_SINGLE
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Plus size={15} />
            Avulso
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TAB_BULK)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === TAB_BULK
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Layers size={15} />
            Em lote
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">novo</span>
          </button>
        </div>

        {/* ── Formulário avulso ────────────────────────────────────────────────── */}
        {activeTab === TAB_SINGLE && (
          <form onSubmit={handleSubmitSingle} className="grid gap-3 p-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Setor</label>
              <input
                list="setores-list-single"
                type="text"
                value={form.setor}
                onChange={(e) => setForm((p) => ({ ...p, setor: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                placeholder="Ex: Pedagógico"
              />
              <datalist id="setores-list-single">
                {setoresExistentes.map((s) => <option key={s} value={s} />)}
                {SETORES_SUGERIDOS.map((s) => <option key={s.nome} value={s.nome} />)}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Bloco</label>
              <input
                type="text"
                value={form.bloco}
                onChange={(e) => setForm((p) => ({ ...p, bloco: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                placeholder="Ex: Bloco A"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Sala</label>
              <input
                type="text"
                value={form.sala}
                onChange={(e) => setForm((p) => ({ ...p, sala: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                placeholder="Ex: Sala 01 / Secretaria"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Plus size={16} />
                {saving ? "Salvando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        )}

        {/* ── Formulário em lote ───────────────────────────────────────────────── */}
        {activeTab === TAB_BULK && (
          <form onSubmit={handleSubmitBulk} className="p-4 space-y-4">
            <p className="text-xs text-slate-500">
              Preencha o setor e bloco, defina o prefixo e o intervalo numérico — todas as salas serão criadas de uma vez.
            </p>

            {/* Linha 1: setor + bloco */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Setor</label>
                <input
                  list="setores-list-bulk"
                  type="text"
                  value={bulk.setor}
                  onChange={(e) => setBulk((p) => ({ ...p, setor: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  placeholder="Ex: Pedagógico"
                />
                <datalist id="setores-list-bulk">
                  {setoresExistentes.map((s) => <option key={s} value={s} />)}
                  {SETORES_SUGERIDOS.map((s) => <option key={s.nome} value={s.nome} />)}
                </datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Bloco</label>
                <input
                  type="text"
                  value={bulk.bloco}
                  onChange={(e) => setBulk((p) => ({ ...p, bloco: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  placeholder="Ex: Bloco A"
                />
              </div>
            </div>

            {/* Linha 2: prefixo + início + fim + zeros */}
            <div className="grid gap-3 sm:grid-cols-4 items-end">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Prefixo da sala
                </label>
                <input
                  type="text"
                  value={bulk.prefixo}
                  onChange={(e) => setBulk((p) => ({ ...p, prefixo: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  placeholder="Ex: Sala, Lab, Andar"
                />
                <p className="mt-1 text-xs text-slate-400">Deixe em branco para usar só o número</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">De</label>
                <input
                  type="number" min={1} max={999}
                  value={bulk.inicio}
                  onChange={(e) => setBulk((p) => ({ ...p, inicio: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Até</label>
                <input
                  type="number" min={1} max={999}
                  value={bulk.fim}
                  onChange={(e) => setBulk((p) => ({ ...p, fim: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>

            {/* Zero-padding toggle */}
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={bulk.zeros}
                onChange={(e) => setBulk((p) => ({ ...p, zeros: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <Hash size={13} />
              Adicionar zero à esquerda (Sala 01, 02...)
            </label>

            {/* Preview */}
            {bulkPreview.length > 0 && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                <p className="mb-2 text-xs font-semibold text-blue-700">
                  Preview — {bulkPreview.length} sala(s) serão criadas:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {bulkPreview.map((item, i) => (
                    <span key={i} className="rounded-md border border-blue-200 bg-white px-2 py-0.5 text-xs text-slate-700">
                      {item.sala}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-blue-600">
                  Setor: <strong>{bulkPreview[0].setor}</strong> · Bloco: <strong>{bulkPreview[0].bloco}</strong>
                </p>
              </div>
            )}

            {parseInt(bulk.fim) - parseInt(bulk.inicio) > 199 && (
              <p className="text-xs text-red-600">Máximo de 200 salas por lote.</p>
            )}

            <button
              type="submit"
              disabled={saving || bulkPreview.length === 0 || parseInt(bulk.fim) - parseInt(bulk.inicio) > 199}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Layers size={16} />
              {saving ? "Criando..." : `Criar ${bulkPreview.length || 0} sala(s)`}
            </button>
          </form>
        )}
      </div>

      {/* ── Lista cadastrada ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Estrutura cadastrada</h3>
            <p className="text-xs text-slate-500">
              {searchTerm
                ? `${filteredLocations.length} de ${locations.length} resultado(s)`
                : `${locations.length} localização(ões) cadastrada(s)`}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar setor, bloco ou sala..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Carregando localizações...
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <MapPin className="mx-auto mb-2 text-slate-300" size={32} />
            <p className="text-sm font-medium text-slate-600">
              {searchTerm ? "Nenhuma localização encontrada" : "Nenhuma localização cadastrada ainda"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? "Tente outro termo de busca" : "Use o formulário acima para cadastrar"}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedLocations.map((group) => (
              <div key={group.setor} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                {/* Setor header */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    <p className="text-sm font-bold text-slate-900">{group.setor}</p>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                      {group.blocos.reduce((acc, b) => acc + b.salas.length, 0)} sala(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditSector(group.setor)}
                      className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                      title="Editar setor"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSector(group.setor)}
                      className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Excluir setor"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Blocos */}
                <div className="space-y-3">
                  {group.blocos.map((bGroup) => (
                    <div key={bGroup.bloco}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {bGroup.bloco}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {bGroup.salas.map((location) => (
                          <div
                            key={location.id}
                            className="flex items-center justify-between rounded-lg border border-white bg-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <span className="min-w-0 truncate text-sm font-medium text-slate-800">{location.sala}</span>
                            <div className="ml-2 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditLocation(location)}
                                className="rounded p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title="Editar"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLocation(location.id)}
                                className="rounded p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                title="Excluir"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  {editing.mode === "sector" ? "Editar setor" : "Editar localização"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {editing.mode === "sector" ? editing.originalSetor : editing.sala}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  {editing.mode === "sector" ? "Novo nome do setor" : "Setor"}
                </label>
                <input
                  type="text"
                  value={editing.setor}
                  onChange={(e) => setEditing((prev) => ({ ...prev, setor: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              {editing.mode === "location" && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Bloco</label>
                    <input
                      type="text"
                      value={editing.bloco}
                      onChange={(e) => setEditing((prev) => ({ ...prev, bloco: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Sala</label>
                    <input
                      type="text"
                      value={editing.sala}
                      onChange={(e) => setEditing((prev) => ({ ...prev, sala: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}