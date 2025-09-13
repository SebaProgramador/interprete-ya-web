import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/auth-cyber.css";

/* 🔐 Edita esta lista con los correos de gerentes autorizados */
const GERENTES_ALLOW = new Set([
  "gerentesebastian@admin.com",
  "gerenteandres@admin.com",
]);

export default function LoginGerente() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && GERENTES_ALLOW.has((u.email || "").toLowerCase())) {
        navigate("/admin-gerente", { replace: true });
      }
    });
    return () => unsub();
  }, [navigate]);

  const friendlyError = (code) => {
    switch (code) {
      case "auth/invalid-email": return "Correo inválido.";
      case "auth/missing-password": return "Ingresa la contraseña.";
      case "auth/invalid-credential":
      case "auth/wrong-password": return "Correo o contraseña incorrectos.";
      case "auth/user-not-found": return "Usuario no existe.";
      case "auth/too-many-requests": return "Demasiados intentos. Intenta más tarde.";
      default: return "No se pudo iniciar sesión. Intenta de nuevo.";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const mail = email.trim().toLowerCase();
    if (!mail || !password) {
      setError("Ingresa correo y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, mail, password);
      if (GERENTES_ALLOW.has((res.user.email || "").toLowerCase())) {
        navigate("/admin-gerente", { replace: true });
      } else {
        setError("Esta cuenta no tiene permiso de Gerente.");
        await signOut(auth);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-cyber page-pad">
      {/* Fondo tecnología */}
      <div className="cyber-bg animated tech" aria-hidden>
        <div className="circuit" />
        <div className="particles" />
      </div>

      <div className="auth-wrap">
        <div className="card auth-card neon">
          <header className="brand-header small">
            <div className="logo-frame led pro" aria-hidden="true">
              <span className="scanline" />
              <span className="corners" />
              <picture>
                <source srcSet="/gerente-logo.jpg" type="image/svg+xml" />
                <img
                  src="/gerente-logo.jpg"
                  alt="Intérprete Ya — logo"
                  className="brand-logo sm pulse"
                />
              </picture>
            </div>

            <h2 className="heroTitle">Acceso Gerente <span aria-hidden>👩‍💼</span></h2>
            <p className="heroSub">Solo cuentas autorizadas.</p>
          </header>

          <form onSubmit={handleLogin} className="form-grid">
            <label className="sr-only" htmlFor="correoGerente">Correo del gerente</label>
            <input
              id="correoGerente"
              type="email"
              placeholder="Correo del gerente"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="input glow"
            />

            <div className="row-gap">
              <label className="sr-only" htmlFor="pwdGerente">Contraseña</label>
              <input
                id="pwdGerente"
                type={showPwd ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="input glow flex-1"
                required
              />
              <button
                type="button"
                className="btn secondary ghost"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>

            <button type="submit" className="btn lg glow" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {error && (
            <p role="alert" aria-live="assertive" className="badge state-error shake">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
