// src/pages/LoginInterpreteRut.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page, Row, Button, Field, Ico } from "../components/ui";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, limit, getDocs } from "firebase/firestore";

const normalizaRut = (r) => (r || "").trim().replace(/\./g, "").toUpperCase();

export default function LoginInterpreteRut() {
  const nav = useNavigate();
  const [rut, setRut] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [msg, setMsg] = React.useState("");

  const ingresar = async (e) => {
    e.preventDefault();
    setMsg("");
    const errs = {};
    if (!rut) errs.rut = "Ingresa tu RUT.";
    if (!pass || pass.length < 6) errs.pass = "Mínimo 6 caracteres.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      const rutN = normalizaRut(rut);
      const q = query(
        collection(db, "users"),
        where("dni", "==", rutN),
        where("role", "==", "interprete"),
        limit(1)
      );
      const s = await getDocs(q);
      if (s.empty) {
        setMsg("RUT no encontrado o no corresponde a Intérprete.");
        return;
      }
      const u = s.docs[0].data();
      if (u.bloqueado) {
        setMsg("Tu cuenta está bloqueada. Contacta al gerente/soporte.");
        return;
      }
      if (u.aprobado !== true) {
        nav("/pendiente");
        return;
      }
      await signInWithEmailAndPassword(auth, u.email, pass);
      nav("/");
    } catch (err) {
      setMsg(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Ingresar — Intérprete (RUT)">
      <div className="auth-box">
        <div className="card auth-card">
          <div style={{ textAlign: "center", marginTop: -2 }}>
            <img src="/logo.png" alt="InterpreteYa" />
            <h2 className="heroTitle" style={{ marginTop: 8 }}>
              Intérprete — Acceso con RUT
            </h2>
            <div className="heroSub">Ingresa tus credenciales</div>
          </div>

          {msg && (
            <div
              role="alert"
              className="badge state-error"
              style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
            >
              {msg}
            </div>
          )}

          <form
            onSubmit={ingresar}
            style={{ display: "grid", gap: 12, marginTop: 12 }}
          >
            <Field
              label="RUT"
              type="text"
              placeholder="12.345.678-9"
              icon={Ico.Id}
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              error={errors.rut}
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              inputMode="text"
              enterKeyHint="go"
            />
            <Field
              label="Contraseña"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              icon={Ico.Lock}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              error={errors.pass}
              autoComplete="current-password"
              enterKeyHint="go"
            />

            <label className="badge" style={{ width: "fit-content" }}>
              <input
                type="checkbox"
                checked={show}
                onChange={(e) => setShow(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Mostrar contraseña
            </label>

            <Row>
              <Button
                type="submit"
                full
                className="lg"
                iconRight={Ico.Next}
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </Row>

            <Row
              style={{ justifyContent: "center", gap: 8, flexWrap: "wrap" }}
            >
              <Link className="badge" to="/recuperar">
                Recuperar Contraseña
              </Link>
              <Link className="badge" to="/login">
                Volver a opciones
              </Link>
            </Row>
          </form>
        </div>
      </div>
    </Page>
  );
}
