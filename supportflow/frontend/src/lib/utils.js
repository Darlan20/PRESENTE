/**
 * utils.js — Funções utilitárias compartilhadas.
 * Exporta cn() para mesclar classes CSS do Tailwind de forma segura.
 */
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
