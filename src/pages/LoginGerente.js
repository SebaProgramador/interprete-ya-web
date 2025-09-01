// src/pages/LoginGerente.js
import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

/* Los únicos correos con acceso al panel del Gerente */
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

  // Si ya está logueado y es gerente, entrar directo
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

      // Permitir solo a la lista blanca
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
    <div className="page" style={{ maxWidth: 420, margin: "40px auto" }}>
      <div className="card" style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 12 }}>Acceso Gerente</h2>
        <form onSubmit={handleLogin} className="col" style={{ gap: 10 }}>
          <input
            type="email"
            placeholder="Correo del gerente"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <div className="row" style={{ gap: 8 }}>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ flex: 1 }}
              required
            />
            <button
              type="button"
              className="btn secondary"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {error && (
          <p className="badge" style={{ marginTop: 10, color: "#c62828" }}>
            {error}
          </p>
        )}

        <p className="badge" style={{ marginTop: 10 }}>
          Solo para cuentas autorizadas del Gerente.
        </p>
      </div>
    </div>
  );
}
