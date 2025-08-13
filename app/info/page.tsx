'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Step {
  step: number
  action: string
  endpoint: string
  details: string
  href?: string
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
    href: '/api/next?slotMinutes=50',
    details:
      'Llama a /api/next con slotMinutes, currentTrack si ya estabas en uno y forceSwitch=1 para cambiar. Abre el PDF indicado y revisa el motivo recibido.',
  },
  {
    step: 4,
    action: 'Registrar avance del acto completado',
    endpoint: '/api/progress',
    href: '/api/progress?track=algebra-t&minutes=50&nextIndex=0',
    details:
      'Env\u00eda track, minutes reales y nextIndex (o activityId) para descontar el avance.',
  },
  {
    step: 5,
    action: 'Continuar o cambiar de vector seg\u00fan el tiempo restante',
    endpoint: '/api/next',
    href: '/api/next?slotMinutes=50',
    details:
      'Si queda tiempo en el bloque, vuelve a pedir /api/next sin forceSwitch para seguir en el mismo vector; si termina, usa el suggestedNext devuelto o solicita /api/next?forceSwitch=1.',
  },
  {
    step: 6,
    action: 'Bot\u00f3n → para pedir sugerencia inmediata',
    endpoint: '/api/next',
    href: '/api/next?slotMinutes=50',
    details:
      'El visor nunca decide localmente; cada toque del bot\u00f3n consulta /api/next.',
  },
  {
    step: 7,
    action: 'Mostrar barras de cobertura y d\u00edas restantes',
    endpoint: '/api/tracks',
    href: '/api/tracks',
    details:
      'Consulta /api/tracks para renderizar el resumen de los seis vectores.',
  },
  {
    step: 8,
    action: 'Todo hecho (204 No Content)',
    endpoint: '/api/next',
    href: '/api/next?slotMinutes=50',
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
          Todos los endpoints son <code>GET</code> y tienen un l\u00edmite diario
          configurable. Por defecto cada ruta admite 100 llamadas; puedes
          modificarlo con <code>/api/settings?dailyLimit=150</code>.
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
                <td className="px-4 py-2 font-mono">
                  {s.href ? (
                    <Link href={s.href} className="text-blue-600 underline">
                      {s.endpoint}
                    </Link>
                  ) : (
                    s.endpoint
                  )}
                </td>
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
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Endpoints de materias</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>
            <Link href="/api/materias" className="text-blue-600 underline">
              /api/materias
            </Link>{' '}
            — lista todas con días restantes.
          </li>
          <li>
            <Link href="/api/menosdias" className="text-blue-600 underline">
              /api/menosdias
            </Link>{' '}
            — materia con menos días.
          </li>
          <li>
            <Link href="/api/masdias" className="text-blue-600 underline">
              /api/masdias
            </Link>{' '}
            — materia con más días.
          </li>
          <li>
            <Link href="/api/menosminutos" className="text-blue-600 underline">
              /api/menosminutos
            </Link>{' '}
            — materia con menos minutos.
          </li>
          <li>
            <Link href="/api/masminutos" className="text-blue-600 underline">
              /api/masminutos
            </Link>{' '}
            — materia con más minutos.
          </li>
          <li>
            <Link href="/api/mastareas" className="text-blue-600 underline">
              /api/mastareas
            </Link>{' '}
            — mayor número de tareas.
          </li>
          <li>
            <Link href="/api/menostareas" className="text-blue-600 underline">
              /api/menostareas
            </Link>{' '}
            — menor número de tareas.
          </li>
          <li>
            <Link href="/api/materia/algebra?sumar=1" className="text-blue-600 underline">
              /api/materia/NOMBRE?sumar=1
            </Link>{' '}
            — suma 1 al progreso.
          </li>
          <li>
            <Link href="/api/materia/algebra?progreso=2" className="text-blue-600 underline">
              /api/materia/NOMBRE?progreso=x
            </Link>{' '}
            — agrega x al progreso.
          </li>
          <li>
            <Link href="/api/materia/algebra?totaltareas=5" className="text-blue-600 underline">
              /api/materia/NOMBRE?totaltareas=x
            </Link>{' '}
            — define total de tareas.
          </li>
          <li>
            <Link
              href="/api/materia/crear?data=2025-08-17-nueva-0-5"
              className="text-blue-600 underline"
            >
              /api/materia/crear?data=fecha-nombre-progreso-total
            </Link>{' '}
            — crea materia.
          </li>
          <li>
            <Link href="/api/materia/eliminar/algebra" className="text-blue-600 underline">
              /api/materia/eliminar/NOMBRE
            </Link>{' '}
            — elimina materia.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Temas visuales</h2>
        <p className="text-sm">Usa el selector del encabezado para cambiar entre modos Claro, Oscuro, Azul y Verde.</p>
      </section>


      <p>
        <Link href="/" className="text-blue-600 underline">
          Volver al seguimiento
        </Link>
      </p>
    </div>
  )
}

