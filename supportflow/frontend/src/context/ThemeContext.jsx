/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const DEPARTMENT_THEMES = {
  default: 'default',
  ti: 'ti',
  suporte: 'suporte',
  operacoes: 'operacoes',
  administrativo: 'administrativo',
}

function getInitialMode() {
  const saved = localStorage.getItem('sf-theme-mode')
  if (saved === 'light' || saved === 'dark') {
    return saved
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialDepartmentTheme() {
  const saved = localStorage.getItem('sf-department-theme')
  if (saved && Object.values(DEPARTMENT_THEMES).includes(saved)) {
    return saved
  }
  return DEPARTMENT_THEMES.default
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode)
  const [departmentTheme, setDepartmentTheme] = useState(getInitialDepartmentTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', mode === 'dark')
    localStorage.setItem('sf-theme-mode', mode)
  }, [mode])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'sf-theme-mode') {
        if (event.newValue === 'dark' || event.newValue === 'light') {
          setMode(event.newValue)
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-department-theme', departmentTheme)
    localStorage.setItem('sf-department-theme', departmentTheme)
  }, [departmentTheme])

  const value = useMemo(() => ({
    mode,
    isDark: mode === 'dark',
    departmentTheme,
    setMode,
    toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
    setDepartmentTheme,
    departmentThemes: DEPARTMENT_THEMES,
  }), [mode, departmentTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}
