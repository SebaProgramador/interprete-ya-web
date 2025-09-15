import React, { useEffect, useRef, useState } from "react";

export default function TermsModal({
  open = false,
  audience = "user", // "user" | "interpreter"
  onClose = () => {},
  onAccept = () => {},
}) {
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

  const isUser = audience === "user";
  const roleLabel = isUser ? "Usuario/a" : "Intérprete";

  return (
    <div
      className="modal-backdrop terms-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="terms-head">
          <h3 id="terms-title" className="terms-title">📄 Términos y Condiciones de Uso</h3>
          <span className="chip-role">{roleLabel}</span>
          <div className="terms-meta" aria-hidden="true">📆 Última act.: 2025 - Pronto...</div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✖</button>
        </div>

        <div
          ref={bodyRef}
          className="terms-body"
          role="document"
          tabIndex={0}
          onScroll={onScroll}
        >
          {/* Intro */}
          <p>
            Esta Aplicación conecta a la comunidad sorda y a intérpretes profesionales en
            <strong> Lengua de Señas Chilena (LSCh)</strong> e <strong>Internacional (IS)</strong>,
            tanto de forma presencial como por videollamada. Al registrarte confirmas que leíste y aceptas estos Términos.
          </p>

          {/* Resumen rápido accesible */}
          <details className="quick-summary" role="note">
            <summary><strong>⚖️ Resumen rápido — {roleLabel}</strong></summary>
            {isUser ? (
              <ul>
                <li>✅ Registro con datos reales.</li>
                <li>⏳ Aprobación por ADMIN en <strong>3–4 días hábiles</strong>.</li>
                <li>🔑 Acceso con <strong>RUT y contraseña</strong> tras aprobación.</li>
                <li>📩 ¿Olvidaste la contraseña? <strong>Contacta al ADMIN</strong>.</li>
                <li>💻 Videollamada: desde <strong>$5.000 CLP</strong> (10 min).</li>
                <li>📍 Presencial: costo mayor (incluye trayecto e impuestos).</li>
                <li>🤝 Respeto a intérpretes y demás usuarios/as.</li>
                <li>🔒 Tus datos se usan solo para prestar el servicio.</li>
                <li>🚨 Emergencias comprobadas: servicio gratuito (según disponibilidad).</li>
              </ul>
            ) : (
              <ul>
                <li>✅ Registro con datos reales y comprobables.</li>
                <li>📄 Podemos solicitar credenciales de formación/experiencia.</li>
                <li>⏱️ El tiempo se valida con <strong>botón de inicio</strong> o <strong>código QR</strong>.</li>
                <li>❌ No se reconocen tiempos <strong>no validados</strong> en App.</li>
                <li>💻 Videollamada: referencia desde <strong>$5.000 CLP</strong> (10 min).</li>
                <li>📍 Presencial: tarifa mayor (incluye trayecto e impuestos).</li>
                <li>🔐 Confidencialidad absoluta y calidad profesional.</li>
                <li>⚠️ Reportes negativos pueden generar advertencias o suspensión.</li>
              </ul>
            )}
          </details>

          {/* 1. Registro y verificación */}
          <h4>1. Registro y verificación</h4>
          <ul>
            <li>Usa datos verdaderos y completos.</li>
            {isUser ? (
              <>
                <li>Podemos solicitar credencial de discapacidad u otro documento válido.</li>
                <li>
                  ⏳ La verificación por parte del <strong>ADMIN</strong> puede tardar
                  {" "}<strong>3–4 días hábiles</strong>. Durante ese periodo tu cuenta permanecerá en revisión.
                </li>
                <li>
                  🔑 Una vez aprobada, podrás ingresar con tu <strong>RUT y contraseña</strong>.
                </li>
                <li>
                  📩 Si olvidas la contraseña, <strong>contacta al ADMIN</strong> para su recuperación.
                </li>
              </>
            ) : (
              <>
                <li>Podemos solicitar certificación/credenciales LSCh y antecedentes profesionales.</li>
                <li>Debes mantener actualizados tus datos de contacto y disponibilidad.</li>
              </>
            )}
            <li>Resguarda la confidencialidad de tus credenciales de acceso.</li>
          </ul>

          {/* 2. Conducta y respeto */}
          <h4>2. Conducta y respeto</h4>
          <ul>
            <li>Respeto entre personas usuarias e intérpretes.</li>
            <li>Prohibido acoso, insultos o discriminación.</li>
            <li>Incumplimientos reiterados pueden suspender o eliminar tu cuenta.</li>
          </ul>

          {/* 3. Alcance del servicio */}
          <h4>3. Alcance del servicio</h4>
          <ul>
            <li>Apoyo presencial y por videollamada, sujeto a disponibilidad.</li>
            <li>La modalidad presencial puede incluir costos por traslado y tiempos de espera.</li>
            {isUser ? (
              <li>Puedes solicitar servicios para trámites, salud, trabajo, educación y otros ámbitos.</li>
            ) : (
              <li>Debes cumplir la duración contratada y la puntualidad acordada.</li>
            )}
          </ul>

          {/* 4. Pagos y tarifas */}
          <h4>4. Pagos y tarifas</h4>
          <ul>
            {isUser ? (
              <>
                <li>El pago debe realizarse puntualmente según duración, modalidad y ubicación.</li>
                <li>💻 Videollamada (referencia): hasta 10 minutos por <strong>$5.000 CLP</strong>.</li>
                <li>📍 Presencial: costo mayor; incluye impuestos y trayecto.</li>
              </>
            ) : (
              <>
                <li>Los pagos dependen de duración, modalidad y tarifas vigentes.</li>
                <li>💻 Videollamada (referencia): hasta 10 minutos por <strong>$5.000 CLP</strong>.</li>
                <li>📍 Presencial: tarifa mayor; incluye trayecto e impuestos.</li>
              </>
            )}
          </ul>

          {/* 5. Seguridad y validación */}
          <h4>5. Seguridad y validación</h4>
          <ul>
            {isUser ? (
              <>
                <li>La App protege tu información personal y la usa solo para prestar el servicio.</li>
                <li>Puedes reportar un servicio deficiente para revisión y medidas.</li>
              </>
            ) : (
              <>
                <li>
                  Todo servicio debe registrarse en la App mediante <strong>botón de inicio</strong> o{" "}
                  <strong>código QR</strong>.
                </li>
                <li>❌ No se reconocerán tiempos no validados en la App.</li>
              </>
            )}
          </ul>

          {/* 6. Ética, confidencialidad y calidad (más fuerte para intérprete) */}
          <h4>6. Ética, confidencialidad y calidad</h4>
          <ul>
            <li>Confidencialidad absoluta de la información tratada durante el servicio.</li>
            {isUser ? (
              <li>La calidad de la interpretación es un estándar de la plataforma.</li>
            ) : (
              <>
                <li>Debes actuar con calidad, precisión, profesionalismo y puntualidad.</li>
                <li>
                  Los reportes por mala praxis pueden generar <strong>advertencias, descuentos, suspensión o eliminación</strong>.
                </li>
              </>
            )}
          </ul>

          {/* 7. Responsabilidad / intermediación */}
          <h4>7. Responsabilidad</h4>
          <ul>
            <li>La plataforma actúa como intermediaria entre personas usuarias e intérpretes.</li>
          </ul>

          {/* 8. Bloque específico por rol */}
          {isUser ? (
            <>
              <h4>8. Deberes de la Persona Usuaria</h4>
              <ul>
                <li>Entregar contexto veraz para una interpretación precisa.</li>
                <li>Respetar horarios y condiciones de la solicitud.</li>
              </ul>
            </>
          ) : (
            <>
              <h4>8. Deberes del/de la Intérprete</h4>
              <ul>
                <li>Mantener formación actualizada y credenciales vigentes.</li>
                <li>Usar la App para iniciar/detener el tiempo del servicio.</li>
              </ul>
            </>
          )}

          {/* 9. Emergencias (solo se muestra a usuarios, pero se deja neutro) */}
          {isUser && (
            <>
              <h4>9. Emergencias</h4>
              <ul>
                <li>En emergencias comprobadas, el servicio podrá ser gratuito, sujeto a disponibilidad.</li>
              </ul>
            </>
          )}

          {/* 10. Modificaciones */}
          <h4>{isUser ? "10" : "9"}. Modificaciones</h4>
          <ul>
            <li>Los cambios se publicarán y regirán desde su publicación.</li>
            <li>El uso continuo implica aceptación de las modificaciones.</li>
          </ul>

          {/* 11. Aceptación */}
          <h4>{isUser ? "11" : "10"}. Aceptación</h4>
          <p>
            Al pulsar <strong>Acepto</strong>, confirmas que has leído y aceptas estos Términos y Condiciones.
          </p>

          {!scrolledEnd && (
            <div className="scroll-tip" aria-live="polite">
              Desplázate hasta el final para habilitar <strong>Acepto</strong>.
            </div>
          )}
        </div>

        {/* Progreso de lectura */}
        <div className="terms-progress" aria-hidden="true">
          <div
            className={`bar ${scrolledEnd ? "done" : ""}`}
            style={{ width: scrolledEnd ? "100%" : `${Math.max(32, pct * 100)}%` }}
          />
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
