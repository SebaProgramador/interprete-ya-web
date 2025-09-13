import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page, Row, Button, Ico } from "../components/ui";
import "../styles/auth-cyber.css";

export default function Login() {
  const nav = useNavigate();

  return (
    <Page title="Iniciar Sesión" className="theme-cyber">
      {/* Fondo tecnología (grid + scanlines + circuito + partículas) */}
      <div className="cyber-bg animated tech" aria-hidden>
        <div className="circuit" />
        <div className="particles" />
      </div>

      <div className="auth-wrap">
        <div className="card auth-card neon">
          {/* Encabezado con LOGO en marco LED PRO */}
          <header className="brand-header">
            <div className="logo-frame led pro" aria-hidden="true">
              <span className="scanline" />
              <span className="corners" />
              <picture>
                <source srcSet="/banner-bienvenido.png" type="image/svg+xml" />
                <img
                  src="/banner-bienvenido.png"
                  alt="Intérprete Ya — logo"
                  className="brand-logo pulse"
                />
              </picture>
            </div>

            <h1 className="heroTitle">
              Acceso a la plataforma <span aria-label="Te amo en LSCh">🤟🏼</span>
            </h1>
            <p className="heroSub">
              Elige tu tipo de ingreso&nbsp; 🧏🏻‍♀️🧏🏻‍♂️
            </p>
          </header>

          {/* Nota de aprobación */}
          <div role="status" className="badge state-info center">
            La aprobación de cuenta puede tardar <b>3–4 días hábiles</b>.
          </div>

          {/* Botones principales */}
          <div className="grid-btns">
            <Row>
              <Button
                type="button"
                full
                className="lg glow"
                iconRight={Ico.Next}
                aria-label="Ingresar como Usuario con RUT y Contraseña"
                onClick={() => nav("/login-usuario")}
              >
                🧏🏻‍♂️ Usuario
              </Button>
            </Row>
            <Row>
              <Button
                type="button"
                variant="secondary"
                full
                className="lg glow"
                iconRight={Ico.Next}
                aria-label="Ingresar como Intérprete con RUT y Contraseña"
                onClick={() => nav("/login-interprete")}
              >
                🤟🏼 Intérprete
              </Button>
            </Row>
          </div>

          {/* Accesos rápidos */}
          <nav className="quick-links" aria-label="Accesos rápidos">
            <Link className="chip glow-chip" to="/recuperar">🔑 Recuperar</Link>
            <Link className="chip glow-chip" to="/">🏠 Inicio</Link>
            <Link className="chip glow-chip" to="/login-gerente">👩‍💼 Gerente</Link>
          </nav>

          {/* Tira cultural */}
          <div className="emoji-strip" aria-hidden>
            🤟🏼 🧏🏻‍♀️ 🧏🏻‍♂️ 🇨🇱 ✨
          </div>
        </div>
      </div>
    </Page>
  );
}
