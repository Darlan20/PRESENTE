/**
 * TechnicianHeader.jsx — Cabeçalho do painel do Técnico.
 * Exibe informações do técnico logado com menu de conta.
 */
import { BrandLogo } from "./BrandLogo"
import { AccountMenu } from "./AccountMenu"

export function TechnicianHeader({ user, onLogout }) {
  return (
    <header className="sf-topbar shrink-0">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <BrandLogo variant="compact" className="h-8 w-auto" />
            <div>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-blue-100/85">Painel do Técnico</p>
            </div>
          </div>

          <AccountMenu user={user} onLogout={onLogout} homePath="/tecnico" />
        </div>
      </div>
    </header>
  )
}
