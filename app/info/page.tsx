'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Step {
  step: number
  action: string
  endpoint: string
  details: string
}

const steps: Step[] = [
  {
    step: 1,
    action: 'Elegir carpeta del workspace y abrir el visor PDF',
    endpoint: '',
    details:
      'El visor solicitar\u00e1 acceso mediante File System Access y solo funcionar\u00e1 con archivos locales.',
  },
  {
    step: 2,
    action: 'Seleccionar franja de estudio (ma\u00f1ana, tarde o noche)',
    endpoint: '',
    details:
      'Cada franja tiene una duraci\u00f3n fija: 120, 240 o 120 minutos respectivamente.',
  },
  {
    step: 3,
    action: 'Iniciar bloque solicitando sugerencia',
    endpoint: '/api/next',
    details:
      'Llama a /api/next con slotMinutes, currentTrack si ya estabas en uno, forceSwitch para cambiar, y siempre reqId y ts. Abre el PDF indicado y revisa el motivo recibido.',
  },
  {
    step: 4,
    action: 'Registrar avance del acto completado',
    endpoint: '/api/progress',
    details:
      'Env\u00eda track, minutes reales y nextIndex (o activityId) junto a reqId y ts para descontar el avance.',
  },
  {
    step: 5,
    action: 'Continuar o cambiar de vector seg\u00fan el tiempo restante',
    endpoint: '/api/next',
    details:
      'Si queda tiempo en el bloque, vuelve a pedir /api/next sin forceSwitch para seguir en el mismo vector; si termina, usa el suggestedNext devuelto o solicita /api/next?forceSwitch=1.',
  },
  {
    step: 6,
    action: 'Bot\u00f3n → para pedir sugerencia inmediata',
    endpoint: '/api/next',
    details:
      'El visor nunca decide localmente; cada toque del bot\u00f3n consulta /api/next.',
  },
  {
    step: 7,
    action: 'Mostrar barras de cobertura y d\u00edas restantes',
    endpoint: '/api/tracks',
    details:
      'Consulta /api/tracks para renderizar el resumen de los seis vectores.',
  },
  {
    step: 8,
    action: 'Todo hecho (204 No Content)',
    endpoint: '/api/next',
    details:
      'Si /api/next responde 204 puedes repasar o iniciar otra franja; no quedan pendientes.',
  },
]

export default function InfoPage() {
  const [openStep, setOpenStep] = useState<number | null>(null)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Gu\u00eda de uso</h1>
        <p className="mb-4">
          Todos los endpoints son <code>GET</code> y requieren los par\u00e1metros
          <code> reqId </code> y <code> ts </code> para garantizar idempotencia y
          evitar cach\u00e9.
        </p>
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm border mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Par\u00e1metro
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qu\u00e9 es
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Por qu\u00e9 se usa
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                C\u00f3mo generarlo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-2 font-mono">reqId (UUID)</td>
              <td className="px-4 py-2">Identificador \u00fanico por petici\u00f3n</td>
              <td className="px-4 py-2">Permite ignorar duplicados</td>
              <td className="px-4 py-2 font-mono">crypto.randomUUID()</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-mono">ts</td>
              <td className="px-4 py-2">Timestamp en milisegundos</td>
              <td className="px-4 py-2">Evita respuestas cacheadas</td>
              <td className="px-4 py-2 font-mono">Date.now()</td>
            </tr>
          </tbody>
        </table>
        <p>
          Un <strong>UUID</strong> es una cadena como
          <code> 123e4567-e89b-12d3-a456-426614174000 </code>. Se utiliza como
          <code> reqId </code> para que el seguimiento registre cada solicitud una
          sola vez.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Flujo completo</h2>
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paso
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acci\u00f3n
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endpoint
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {steps.map((s) => (
              <tr key={s.step} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2">{s.step}</td>
                <td className="px-4 py-2">{s.action}</td>
                <td className="px-4 py-2 font-mono">{s.endpoint}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => setOpenStep(s.step)}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {steps.map(
          (s) =>
            openStep === s.step && (
              <div
                key={s.step}
                className="fixed inset-0 bg-black/40 flex items-center justify-center"
              >
                <div className="bg-white rounded-lg p-6 max-w-lg mx-auto">
                  <h3 className="text-lg font-semibold mb-2">Paso {s.step}</h3>
                  <p className="mb-4">{s.details}</p>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => setOpenStep(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ),
        )}
      </section>

      <p>
        <Link href="/" className="text-blue-600 underline">
          Volver al seguimiento
        </Link>
      </p>
    </div>
  )
}

