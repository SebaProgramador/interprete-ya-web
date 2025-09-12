// src/pages/Login.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page, Row, Button, Ico } from "../components/ui";
import "../styles/auth-cyber.css"; // 👈 importa el tema

export default function Login() {
  const nav = useNavigate();

  return (
    <Page title="Iniciar Sesión" className="theme-cyber">
      {/* Fondo decorativo */}
      <div className="cyber-bg" aria-hidden />

      <div className="auth-wrap">
        <div className="card auth-card neon">
          {/* Encabezado con logo */}
          <header className="brand-header">
            <picture>
              <source srcSet="/logo-login.svg" type="image/svg+xml" />
              <img src="/login-logo.png" alt="Intérprete Ya — logo" className="brand-logo" />
            </picture>
            <h1 className="heroTitle">
              Acceso a la plataforma <span role="img" aria-label="Te amo en LSCh">🤟🏼</span>
            </h1>
            <p className="heroSub">
              Elige tu tipo de ingreso&nbsp;
              <span aria-hidden>🧏🏻‍♀️🧏🏻‍♂️</span>
            </p>
          </header>

          {/* Nota de aprobación */}
          <div role="status" aria-live="polite" className="badge state-info center">
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
                <span aria-hidden>🧏🏻‍♂️</span>&nbsp;Usuario — RUT + Contraseña
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
                <span aria-hidden>🤟🏼</span>&nbsp;Intérprete — RUT + Contraseña
              </Button>
            </Row>
          </div>

          {/* Accesos rápidos */}
          <nav className="quick-links" aria-label="Accesos rápidos">
            <Link className="chip" to="/recuperar">🔑 Recuperar</Link>
            <Link className="chip" to="/">🏠 Inicio</Link>
            <Link className="chip" to="/login-gerente">👩‍💼 Gerente</Link>
          </nav>

          {/* Tira cultural */}
          <div className="emoji-strip" aria-hidden>
            🤟🏼 🧏🏻‍♀️ 🧏🏻‍♂️ 🇨🇱 🛡️
          </div>
        </div>
      </div>
    </Page>
  );
}
