import Link from "next/link"

export default function InfoPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 prose">
      <h1>Guía de uso</h1>
      <p>
        Esta aplicación funciona solo con acceso a archivos locales y expone tres endpoints GET. Todos deben incluir un <code>reqId</code> único (UUID) y <code>ts</code> (timestamp en ms) para evitar respuestas cacheadas.
      </p>
      <ol>
        <li>
          Selecciona la carpeta del workspace donde están los materiales y abre el visor de PDFs.
        </li>
        <li>
          Elige una franja de estudio: mañana (120&nbsp;min), tarde (240&nbsp;min) o noche (120&nbsp;min).
        </li>
        <li>
          Para iniciar un bloque, llama a <code>/api/next</code> con <code>slotMinutes</code>, el <code>currentTrack</code> si ya estabas en uno, <code>forceSwitch</code> si quieres cambiar, además de <code>reqId</code> y <code>ts</code>. Abre el PDF indicado y revisa el motivo recibido.
        </li>
        <li>
          Cuando completes un acto, registra el avance con <code>/api/progress</code> enviando <code>track</code>, <code>minutes</code>, <code>nextIndex</code> (o <code>activityId</code>) junto a <code>reqId</code> y <code>ts</code>.
        </li>
        <li>
          Si queda tiempo en el bloque, solicita el siguiente acto del mismo vector. Si el bloque termina, usa el <code>suggestedNext</code> devuelto o vuelve a pedir <code>/api/next</code> con <code>forceSwitch=1</code>.
        </li>
        <li>
          El botón <code>→</code> siempre consulta <code>/api/next</code>; el visor nunca decide localmente.
        </li>
        <li>
          Consulta <code>/api/tracks</code> para mostrar barras de cobertura y días restantes en la interfaz.
        </li>
        <li>
          Si <code>/api/next</code> responde <code>204</code>, todo está hecho y puedes dedicar tiempo a repasar o iniciar otra franja.
        </li>
      </ol>
      <p>
        Todas las respuestas incluyen <code>Cache-Control: no-store</code> y el seguimiento ignora un <code>reqId</code> repetido.
      </p>
      <p>
        <Link href="/" className="text-blue-600 underline">Volver al seguimiento</Link>
      </p>
    </div>
  )
}

