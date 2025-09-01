// src/pages/Login.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page, Row, Button, Field, Ico } from "../components/ui";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [msg, setMsg] = React.useState("");

  const ingresar = async (e) => {
    e.preventDefault();
    setMsg("");
    const errs = {};
    if (!email) errs.email = "Ingresa tu correo.";
    if (!pass || pass.length < 6) errs.pass = "Mínimo 6 caracteres.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      nav("/");
    } catch (err) {
      setMsg(err?.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    setMsg("");
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      nav("/");
    } catch (err) {
      // Fallback si el popup es bloqueado/cerrado
      if (
        err?.code === "auth/popup-blocked" ||
        err?.code === "auth/popup-closed-by-user"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          // Al volver del redirect, continuará el flujo
        } catch (e2) {
          setMsg(e2?.message || "No fue posible iniciar sesión con Google.");
        }
      } else {
        setMsg(err?.message || "No fue posible iniciar sesión con Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Iniciar Sesión">
      {/* Logo arriba */}
      <div style={{ textAlign: "center", marginTop: -4 }}>
        <span className="logoWrap">
          <img src="/logo.png" alt="InterpreteYa" style={{ height: 72 }} />
        </span>
        <div className="heroSub" style={{ marginTop: 8 }}>
          Accede para continuar
        </div>
      </div>

      {/* Mensaje de error accesible */}
      {msg && (
        <div
          role="alert"
          className="badge"
          style={{
            marginTop: 12,
            borderColor: "rgba(239,68,68,.6)",
            background: "rgba(239,68,68,.15)",
          }}
        >
          {msg}
        </div>
      )}

      <form
        onSubmit={ingresar}
        style={{ display: "grid", gap: 12, marginTop: 12 }}
      >
        <Field
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.cl"
          icon={Ico.Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Field
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          icon={Ico.Lock}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          error={errors.pass}
          autoComplete="current-password"
        />

        <Row>
          <Button type="submit" full iconRight={Ico.Next} disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </Button>
        </Row>
        <Row>
          <Button
            type="button"
            variant="secondary"
            full
            onClick={loginGoogle}
            disabled={loading}
          >
            {loading ? "..." : "Iniciar con Google"}
          </Button>
        </Row>

        <Row>
          <Link className="badge" to="/recuperar">
            Recuperar Contraseña
          </Link>
          <Link className="badge" to="/registro-usuario">
            Crear cuenta (Usuario Sordo)
          </Link>
          <Link className="badge" to="/registro-interprete">
            Crear cuenta (Intérprete)
          </Link>
        </Row>
      </form>
    </Page>
  );
}
