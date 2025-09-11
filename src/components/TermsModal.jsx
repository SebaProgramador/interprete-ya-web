import React, { useEffect, useRef, useState } from "react";

export default function TermsModal({ open = false, audience = "user", onClose = () => {}, onAccept = () => {} }) {
  const bodyRef = useRef(null);
  const [scrolledEnd, setScrolledEnd] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!open) return;
    setScrolledEnd(false);
    setPct(0);
  }, [open, audience]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    const p = max > 0 ? Math.min(1, el.scrollTop / max) : 1;
    setPct(p);
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setScrolledEnd(true);
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="terms-head">
          <h3 id="terms-title" className="terms-title">
            📄 Términos y Condiciones de Uso
          </h3>
          <span className="chip-role">{audience === "user" ? "Usuario/a" : "Intérprete"}</span>
          <div className="terms-meta" aria-hidden="true">📆 Última act.: 09/2025</div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✖</button>
        </div>

        <div
          ref={bodyRef}
          className="terms-body"
          role="document"
          tabIndex={0}
          onScroll={onScroll}
        >
          <p>
            Esta Aplicación conecta a la comunidad sorda y a intérpretes certificados en
            <strong> Lengua de Señas Chilena (LSCh)</strong> e <strong>Internacional (IS)</strong>.
            Al registrarte confirmas que leíste y aceptas estos Términos.
          </p>

          <h4>1. Registro y verificación</h4>
          <ul>
            <li>Usa datos verdaderos y completos.</li>
            {audience === "user"
              ? <li>Podemos solicitar credencial que acredite condición de persona sorda.</li>
              : <li>Podemos solicitar certificación LSCh y antecedentes profesionales.</li>}
            <li>Resguarda la confidencialidad de tus credenciales.</li>
          </ul>

          <h4>2. Conducta y respeto</h4>
          <ul>
            <li>Respeto entre personas usuarias e intérpretes.</li>
            <li>Prohibido acoso, insultos o discriminación.</li>
            <li>Incumplimientos reiterados pueden suspender tu cuenta.</li>
          </ul>

          <h4>3. Alcance del servicio</h4>
          <ul>
            <li>Apoyo presencial y por videollamada, según disponibilidad.</li>
            <li>Modalidad presencial puede incluir costos por traslado.</li>
          </ul>

          <h4>4. Pagos</h4>
          <ul>
            <li>Pago puntual según duración y modalidad.</li>
          </ul>

          <h4>5. Datos y seguridad</h4>
          <ul>
            <li>Confidencialidad y uso de datos sólo para prestar el servicio.</li>
          </ul>

          <h4>6. Responsabilidad</h4>
          <ul>
            <li>La plataforma es un intermediario entre usuarios e intérpretes.</li>
          </ul>

          <h4>7. Modificaciones</h4>
          <ul>
            <li>Los cambios se publicarán y regirán desde su publicación.</li>
          </ul>

          {audience === "user" ? (
            <>
              <h4>8. Usuario/a</h4>
              <ul><li>Entrega contexto veraz para una interpretación precisa.</li></ul>
            </>
          ) : (
            <>
              <h4>8. Intérprete</h4>
              <ul><li>Ética, confidencialidad y actualización profesional.</li></ul>
            </>
          )}

          <h4>9. Aceptación</h4>
          <p>Al pulsar <strong>Acepto</strong> confirmas la lectura y aceptación.</p>

          {!scrolledEnd && (
            <div className="scroll-tip" aria-live="polite">
              Desplázate hasta el final para habilitar <strong>Acepto</strong>.
            </div>
          )}
        </div>

        {/* Progreso de lectura */}
        <div className="terms-progress" aria-hidden="true">
          <div className={`bar ${scrolledEnd ? "done" : ""}`} style={{ width: scrolledEnd ? "100%" : `${Math.max(32, pct * 100)}%` }} />
        </div>

        <div className="terms-foot">
          <button className="terms-btn" onClick={onClose}>Cerrar</button>
          <button
            className="terms-btn primary"
            onClick={onAccept}
            disabled={!scrolledEnd}
            aria-disabled={!scrolledEnd}
            title={!scrolledEnd ? "Desplázate hasta el final para aceptar" : "Aceptar Términos"}
          >
            Acepto
          </button>
        </div>
      </div>
    </div>
  );
}
