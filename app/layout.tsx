import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sistema de Seguimiento de Eventos",
  description: "Aplicación para gestionar y hacer seguimiento de eventos académicos",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="antialiased">
      <body className="font-sans">{children}</body>
    </html>
  )
}
