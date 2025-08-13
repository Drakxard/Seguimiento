'use client'

import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="border rounded p-1"
    >
      <option value="light">Claro</option>
      <option value="dark">Oscuro</option>
      <option value="blue">Azulado</option>
      <option value="green">Verde</option>
    </select>
  )
}
