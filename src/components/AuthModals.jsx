// src/components/AuthModals.jsx
import React from "react";

export default function AuthModals({
  showLogin,
  showRegister,
  regTab,
  setRegTab,
  abrirLogin,
  abrirRegister,
  cerrarTodo,
  navigate,
}) {
  return (
    <>
      {/* ===== MODAL: LOGIN ===== */}
      {showLogin && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          onClick={cerrarTodo}
        >
          <div className="modal-card neon-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="login-title">Iniciar Sesión</h3>
              <button className="icon-btn" onClick={cerrarTodo} aria-label="Cerrar">
                <i className="fas fa-times" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                cerrarTodo();
                navigate("/login");
              }}
            >
              <label className="label">Correo Electrónico</label>
              <input type="email" className="input" required autoComplete="email" />

              <label className="label">Contraseña</label>
              <input type="password" className="input" required autoComplete="current-password" />

              <button type="submit" className="btn-blue block mt-12 neon-btn-strong">
                Iniciar Sesión
              </button>

              <div className="center mt-10">
                <a className="link-blue neon-link" href="#">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </form>

            <div className="divider" />
            <div className="center">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                className="link-blue neon-link"
                onClick={() => abrirRegister("user")}
              >
                Regístrate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: REGISTRO ===== */}
      {showRegister && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-title"
          onClick={cerrarTodo}
        >
          <div className="modal-card neon-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="register-title">Registrarse</h3>
              <button className="icon-btn" onClick={cerrarTodo} aria-label="Cerrar">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="tabs" role="tablist" aria-label="Tipo de registro">
              <button
                type="button"
                role="tab"
                aria-selected={regTab === "user"}
                className={`tab-btn ${regTab === "user" ? "active" : ""}`}
                onClick={() => setRegTab("user")}
              >
                Usuario
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={regTab === "interpreter"}
                className={`tab-btn ${regTab === "interpreter" ? "active" : ""}`}
                onClick={() => setRegTab("interpreter")}
              >
                Intérprete
              </button>
            </div>

            {/* === FORM USUARIO === */}
            {regTab === "user" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  cerrarTodo();
                  navigate("/registro-usuario");
                }}
              >
                <label className="label">Nombre Completo</label>
                <input type="text" className="input" required autoComplete="name" />

                <label className="label">Correo Electrónico</label>
                <input type="email" className="input" required autoComplete="email" />

                <label className="label">Contraseña</label>
                <input type="password" className="input" required autoComplete="new-password" />

                <label className="label">RUT</label>
                <input type="text" className="input" />

                <label className="label">Credencial de Discapacidad</label>
                <input type="file" className="input" />

                <label className="checkbox">
                  <input type="checkbox" required /> Acepto los{" "}
                  <a href="#" className="link-blue neon-link">
                    Términos y Condiciones
                  </a>
                </label>

                <button type="submit" className="btn-blue block mt-12 neon-btn-strong">
                  Registrarse como Usuario
                </button>

                <div className="divider" />
                <div className="center">
                  ¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={abrirLogin}>
                    Inicia Sesión
                  </button>
                </div>
              </form>
            )}

            {/* === FORM INTÉRPRETE === */}
            {regTab === "interpreter" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  cerrarTodo();
                  navigate("/registro-interprete");
                }}
              >
                <label className="label">Nombre Completo</label>
                <input type="text" className="input" required />

                <label className="label">Correo Electrónico</label>
                <input type="email" className="input" required />

                <label className="label">Contraseña</label>
                <input type="password" className="input" required />

                <label className="label">RUT</label>
                <input type="text" className="input" />

                <label className="label">Certificación LSCh</label>
                <input type="file" className="input" />

                <label className="label">Años de Experiencia</label>
                <input type="number" className="input" min="0" />

                <label className="checkbox">
                  <input type="checkbox" required /> Acepto los{" "}
                  <a href="#" className="link-blue neon-link">
                    Términos y Condiciones
                  </a>
                </label>

                <button type="submit" className="btn-purple block mt-12 neon-btn-strong">
                  Registrarse como Intérprete
                </button>

                <div className="divider" />
                <div className="center">
                  ¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={abrirLogin}>
                    Inicia Sesión
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
