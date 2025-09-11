// src/pages/Login.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page, Row, Button, Ico } from "../components/ui";

export default function Login() {
  const nav = useNavigate();

  return (
    <Page title="Iniciar Sesión">
      <div className="auth-box">
        <div className="card auth-card">
          <div style={{ textAlign: "center", marginTop: -2 }}>
            <span className="logoWrap">
              <img src="/login-logo.png" alt="InterpreteYa" />
            </span>
            <h1 className="heroTitle" style={{ marginTop: 8 }}>
              Acceso a la plataforma
            </h1>
            <div className="heroSub">Elige tu tipo de ingreso</div>
          </div>

          <div
            role="note"
            className="badge state-info"
            style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
          >
            La aprobación de cuenta puede tardar <b>3–4 días hábiles</b>.
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <Row>
              <Button
                type="button"
                full
                className="lg"
                iconRight={Ico.Next}
                aria-label="Ingresar como Usuario con RUT y Contraseña"
                onClick={() => nav("/login-usuario")}
              >
                Ingresar como Usuario (RUT + Contraseña)
              </Button>
            </Row>
            <Row>
              <Button
                type="button"
                variant="secondary"
                full
                className="lg"
                iconRight={Ico.Next}
                aria-label="Ingresar como Intérprete con RUT y Contraseña"
                onClick={() => nav("/login-interprete")}
              >
                Ingresar como Intérprete (RUT + Contraseña)
              </Button>
            </Row>
          </div>

          <div
            className="row"
            style={{ marginTop: 14, gap: 8, justifyContent: "center" }}
          >
            <Link className="badge" to="/recuperar">
              Recuperar Contraseña
            </Link>
            <Link className="badge" to="/">
              Volver al inicio
            </Link>
            <Link className="badge" to="/login-gerente">
              ¿Eres Gerente? Ingresar
            </Link>
          </div>
        </div>
      </div>
    </Page>
  );
}
