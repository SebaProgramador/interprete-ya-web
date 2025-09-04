// src/pages/Home.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();

  // ======= UI State (solo login/registro aquí) =======
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regTab, setRegTab] = useState("user"); // "user" | "interpreter"
  const [ubicacion, setUbicacion] = useState("Santiago, Chile");

  // ======= Helpers =======
  const abrirLogin = useCallback(() => {
    setShowRegister(false);
    setShowLogin(true);
  }, []);
  const abrirRegister = useCallback((tab = "user") => {
    setRegTab(tab);
    setShowLogin(false);
    setShowRegister(true);
  }, []);
  const cerrarTodo = useCallback(() => {
    setShowLogin(false);
    setShowRegister(false);
  }, []);
  const actualizarUbicacion = () => setUbicacion("Santiago, Chile");

  // Bloquea scroll si hay modal
  const hayModal = showLogin || showRegister;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = hayModal ? "hidden" : prev;
    return () => (document.body.style.overflow = prev);
  }, [hayModal]);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && cerrarTodo();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cerrarTodo]);

  return (
    <div className="theme-cyber">
      {/* ===== Header ===== */}
      <header className="iy2-header gradient-bg sticky neon-header" role="banner">
        <div className="container">
          <div className="header-row">
            <div className="logo-group" aria-label="Inicio InterpreteYa">
              <i className="fas fa-hands-sign-language logo-icon" aria-hidden="true" />
              <h1 className="brand">InterpreteYa</h1>
            </div>
            <div className="auth-actions" role="group" aria-label="Acciones de sesión">
              <button type="button" className="ubereats-btn-secondary neon-btn" onClick={abrirLogin}>
                Ingresar
              </button>
              <button
                type="button"
                className="ubereats-btn neon-btn-strong"
                onClick={() => abrirRegister("user")}
              >
                Regístrate
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className="container main-pad" role="main">
        {/* Hero */}
        <section className="hero-card neon-card" aria-labelledby="hero-titulo">
          <div className="hero-flex">
            <div className="hero-col">
              <h2 id="hero-titulo" className="hero-title neon-title">
                Comunicación sin barreras
              </h2>
              <p className="hero-sub neon-muted">
                Conectamos a la comunidad sorda con intérpretes certificados de lengua de señas
                chilena (LSCh) las 24 horas del día.
              </p>
              <div className="hero-ctas" role="group" aria-label="Acciones principales">
                <button
                  type="button"
                  className="cta-round cta-strong pulse-animation neon-cta"
                  onClick={() => navigate("/solicitar")}
                >
                  <i className="fas fa-bolt" aria-hidden="true" /> Intérprete Ahora
                </button>
                <button
                  type="button"
                  className="cta-round cta-outline neon-cta-outline"
                  onClick={() => navigate("/agendar")}
                >
                  <i className="fas fa-calendar-alt" aria-hidden="true" /> Agendar
                </button>
              </div>
            </div>
            <div className="hero-col img-col">
              <img
                src="/logo-bienvenido.mp4"
                alt="Personas comunicándose con lengua de señas"
                className="hero-img neon-img"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </section>

        {/* Radar */}
        <section className="card white mb-8 neon-card" aria-label="Intérpretes disponibles cerca de ti">
          <div className="card-head">
            <h2 className="card-title">Intérpretes disponibles cerca de ti</h2>
            <span className="muted neon-muted">
              <i className="fas fa-map-marker-alt text-blue" aria-hidden="true" /> {ubicacion}
            </span>
          </div>

          <div className="radar-wrap neon-radar">
            <div className="radar-circle" aria-hidden="true" />
            {/* demo markers */}
            <div className="interpreter-marker mk-1"><div className="pulse-dot" /><div className="mk-label">María G. (0.5 km)</div></div>
            <div className="interpreter-marker mk-2"><div className="pulse-dot" /><div className="mk-label">Juan P. (1.2 km)</div></div>
            <div className="interpreter-marker mk-3"><div className="pulse-dot" /><div className="mk-label">Carla S. (2.1 km)</div></div>

            <div className="radar-actions">
              <button type="button" className="btn-blue neon-btn" onClick={actualizarUbicacion}>
                <i className="fas fa-sync-alt" aria-hidden="true" /> Actualizar ubicación
              </button>
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="mb-10" aria-labelledby="categorias-titulo">
          <h2 id="categorias-titulo" className="h2 mb-4 neon-title">Categorías</h2>
          <div className="cat-scroll" role="list">
            {[
              { ico: "fa-bolt", txt: "Rápido" },
              { ico: "fa-calendar-day", txt: "Programado" },
              { ico: "fa-user-md", txt: "Médico" },
              { ico: "fa-gavel", txt: "Legal" },
            ].map((c) => (
              <div className="cat-item" role="listitem" key={c.txt}>
                <div className="cat-ico neon-chip" aria-hidden="true">
                  <i className={`fas ${c.ico}`} aria-hidden="true" />
                </div>
                <span className="cat-label neon-muted">{c.txt}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ir a la segunda página */}
        <div className="center mb-16">
          <button
            type="button"
            className="ubereats-btn neon-btn-strong"
            onClick={() => navigate("/home2")}
          >
            🤟🏼 Vida Intérprete ➜
          </button>
        </div>
      </main>

      {/* ===== MODALES (solo login/registro aquí) ===== */}
      {showLogin && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={cerrarTodo}>
          <div className="modal-card neon-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="login-title">Iniciar Sesión</h3>
              <button className="icon-btn" onClick={cerrarTodo} aria-label="Cerrar"><i className="fas fa-times" /></button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); cerrarTodo(); navigate("/login"); }}
            >
              <label className="label">Correo Electrónico</label>
              <input type="email" className="input" required autoComplete="email" />
              <label className="label">Contraseña</label>
              <input type="password" className="input" required autoComplete="current-password" />
              <button type="submit" className="btn-blue block mt-12 neon-btn-strong">Iniciar Sesión</button>
              <div className="center mt-10">
                <a className="link-blue neon-link" href="#">¿Olvidaste tu contraseña?</a>
              </div>
            </form>
            <div className="divider" />
            <div className="center">
              ¿No tienes una cuenta?{" "}
              <button type="button" className="link-blue neon-link" onClick={() => abrirRegister("user")}>
                Regístrate
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="register-title" onClick={cerrarTodo}>
          <div className="modal-card neon-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="register-title">Registrarse</h3>
              <button className="icon-btn" onClick={cerrarTodo} aria-label="Cerrar"><i className="fas fa-times" /></button>
            </div>

            <div className="tabs" role="tablist" aria-label="Tipo de registro">
              <button type="button" role="tab" aria-selected={regTab === "user"} className={`tab-btn ${regTab === "user" ? "active" : ""}`} onClick={() => setRegTab("user")}>Usuario</button>
              <button type="button" role="tab" aria-selected={regTab === "interpreter"} className={`tab-btn ${regTab === "interpreter" ? "active" : ""}`} onClick={() => setRegTab("interpreter")}>Intérprete</button>
            </div>

            {regTab === "user" && (
              <form onSubmit={(e) => { e.preventDefault(); cerrarTodo(); navigate("/registro-usuario"); }}>
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
                  <a href="#" className="link-blue neon-link">Términos y Condiciones</a>
                </label>
                <button type="submit" className="btn-blue block mt-12 neon-btn-strong">Registrarse como Usuario</button>
                <div className="divider" />
                <div className="center">¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={abrirLogin}>Inicia Sesión</button>
                </div>
              </form>
            )}

            {regTab === "interpreter" && (
              <form onSubmit={(e) => { e.preventDefault(); cerrarTodo(); navigate("/registro-interprete"); }}>
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
                  <a href="#" className="link-blue neon-link">Términos y Condiciones</a>
                </label>
                <button type="submit" className="btn-purple block mt-12 neon-btn-strong">Registrarse como Intérprete</button>
                <div className="divider" />
                <div className="center">¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={abrirLogin}>Inicia Sesión</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
