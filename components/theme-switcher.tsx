'use client'

import { useTheme } from 'next-themes'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
    >
      <option value="light">Claro</option>
      <option value="dark">Oscuro</option>
      <option value="blue">Azul</option>
      <option value="green">Verde</option>
    </select>
  )
}
