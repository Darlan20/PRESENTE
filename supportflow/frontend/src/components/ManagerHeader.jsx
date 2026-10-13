/**
 * ManagerHeader.jsx — Cabeçalho do painel do Gestor.
 * Exibe informações do gestor logado com menu de conta.
 */
import { BrandLogo } from "./BrandLogo"
import { AccountMenu } from "./AccountMenu"

export function ManagerHeader({ user, onLogout }) {
  return (
    <header className="sf-topbar shrink-0">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandLogo variant="compact" className="h-8 w-auto" />
            <div>
              <h1 className="font-semibold text-slate-50">Painel do Gestor</h1>
              <p className="text-sm text-blue-100/80">Operações, equipes e desempenho em um único painel</p>
            </div>
          </div>

          <AccountMenu user={user} onLogout={onLogout} homePath="/gestor" />
        </div>
      </div>
    </header>
  )
}
