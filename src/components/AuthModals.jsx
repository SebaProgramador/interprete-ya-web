// src/components/AuthModals.jsx
import React from "react";

export default function AuthModals({
  // visibilidad
  showRegister = false,
  // tabs
  regTab = "user",
  setRegTab = () => {},
  // acciones
  onCloseAll = () => {},
  onGoLogin = () => {},
  onOpenTerms = () => {},
  // gating T&C
  tcAcceptedUser = false,
  tcAcceptedInt = false,
}) {
  if (!showRegister) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-title"
      onClick={onCloseAll}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabezera */}
        <div className="modal-head">
          <h3 id="register-title">Registrarse</h3>
          <button className="icon-btn" onClick={onCloseAll} aria-label="Cerrar">
            ✖
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs" role="tablist" aria-label="Tipo de registro">
          <button
            type="button"
            role="tab"
            aria-selected={regTab === "user"}
            className={`tab-btn ${regTab === "user" ? "active" : ""}`}
            onClick={() => setRegTab("user")}
          >
            🧏‍♀️ Usuario
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={regTab === "interpreter"}
            className={`tab-btn ${regTab === "interpreter" ? "active" : ""}`}
            onClick={() => setRegTab("interpreter")}
          >
            🤟 Intérprete
          </button>
        </div>

        {/* ===== Formulario: Usuario ===== */}
        {regTab === "user" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCloseAll();
              // aquí podrías navegar a /bienvenida o similar
            }}
          >
            <label className="label">Nombre Completo</label>
            <input type="text" className="input" required autoComplete="name" />

            <label className="label">Correo Electrónico</label>
            <input type="email" className="input" required autoComplete="email" />

            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              required
              autoComplete="new-password"
            />

            <label className="label">RUT</label>
            <input type="text" className="input" placeholder="12.345.678-9" />

            <label className="label">Credencial de Discapacidad</label>
            <input type="file" className="input" />

            {/* Gating de T&C: el checkbox se habilita solo si ya aceptó en el modal de T&C */}
            <label className="checkbox">
              <input
                type="checkbox"
                required
                disabled={!tcAcceptedUser}
                aria-describedby="termsNoteUser"
              />{" "}
              Acepto los{" "}
              <button
                type="button"
                className="link"
                onClick={() => onOpenTerms("user")}
              >
                Términos y Condiciones
              </button>
            </label>
            <div
              id="termsNoteUser"
              role="note"
              className="muted"
              style={{ marginTop: 6, lineHeight: 1.3 }}
            >
              🤟 <strong>Registro para la comunidad sorda.</strong> 📄 Debes leer
              y aceptar los Términos para habilitar la casilla.
            </div>

            <button type="submit" className="btn-identity user" aria-label="Registrarse como Usuario">
              <span className="btn-text">
                <strong>Registrarse como Usuario</strong>
                <small>Comunidad sorda</small>
              </span>
              <span aria-hidden="true" className="btn-arrow">→</span>
            </button>

            <div className="divider" />
            <div className="center">
              ¿Ya tienes una cuenta?{" "}
              <button type="button" className="link" onClick={onGoLogin}>
                Inicia Sesión
              </button>
            </div>
          </form>
        )}

        {/* ===== Formulario: Intérprete ===== */}
        {regTab === "interpreter" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCloseAll();
            }}
          >
            <label className="label">Nombre Completo</label>
            <input type="text" className="input" required />

            <label className="label">Correo Electrónico</label>
            <input type="email" className="input" required />

            <label className="label">Contraseña</label>
            <input type="password" className="input" required />

            <label className="label">RUT</label>
            <input type="text" className="input" placeholder="12.345.678-9" />

            <label className="label">Certificación LSCh</label>
            <input type="file" className="input" />

            <label className="label">Años de Experiencia</label>
            <input type="number" className="input" min="0" />

            <label className="checkbox">
              <input
                type="checkbox"
                required
                disabled={!tcAcceptedInt}
                aria-describedby="termsNoteInt"
              />{" "}
              Acepto los{" "}
              <button
                type="button"
                className="link"
                onClick={() => onOpenTerms("interpreter")}
              >
                Términos y Condiciones
              </button>
            </label>
            <div
              id="termsNoteInt"
              role="note"
              className="muted"
              style={{ marginTop: 6, lineHeight: 1.3 }}
            >
              🤟 <strong>Registro para intérpretes LSCh.</strong> 📄 Debes leer y
              aceptar los Términos para habilitar la casilla.
            </div>

            <button
              type="submit"
              className="btn-identity interpreter"
              aria-label="Registrarse como Intérprete"
            >
              <span className="btn-text">
                <strong>Registrarse como Intérprete</strong>
                <small>LSCh certificada/o</small>
              </span>
              <span aria-hidden="true" className="btn-arrow">→</span>
            </button>

            <div className="divider" />
            <div className="center">
              ¿Ya tienes una cuenta?{" "}
              <button type="button" className="link" onClick={onGoLogin}>
                Inicia Sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
