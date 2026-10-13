/**
 * Toaster.jsx — Componente global de notificações toast.
 * Usa a biblioteca Sonner para exibir mensagens de sucesso, erro e aviso.
 */
import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: "white",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
        },
      }}
    />
  )
}
