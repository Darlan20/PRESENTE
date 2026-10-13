/**
 * UserHeader.jsx — Cabeçalho do painel do Usuário.
 * Exibe o contexto do painel e menu de conta no canto direito.
 */
import { BrandLogo } from "./BrandLogo"
import { AccountMenu } from "./AccountMenu"

export function UserHeader({ user, onLogout }) {
  return (
    <header className="sf-topbar shrink-0">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <BrandLogo variant="compact" className="h-8 w-auto" />
            <p className="mt-1 text-xs font-medium tracking-[0.12em] text-blue-100/85 uppercase">Painel do Usuário</p>
          </div>

          <AccountMenu user={user} onLogout={onLogout} homePath="/usuario" />
        </div>
      </div>
    </header>
  )
}
