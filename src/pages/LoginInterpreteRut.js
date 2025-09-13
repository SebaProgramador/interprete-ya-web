import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page, Row, Button, Field, Ico } from "../components/ui";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import "../styles/auth-cyber.css";

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
        where("role", "in", ["interprete", "interpreteLSCh"]),
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
      nav("/"); // o /panel-interprete
    } catch (err) {
      setMsg(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Ingresar — Intérprete (RUT)" className="theme-cyber">
      <div className="cyber-bg animated tech" aria-hidden>
        <div className="circuit" />
        <div className="particles" />
      </div>

      <div className="auth-wrap">
        <div className="card auth-card neon">
          <div className="brand-header">
            <div className="logo-frame led pro" aria-hidden="true">
              <span className="scanline" />
              <span className="corners" />
              <picture>
                <source srcSet="/interpreterut-logo.jpg" type="image/svg+xml" />
                <img
                  src="/interpreterut-logo.jpg"
                  alt="Intérprete Ya — logo"
                  className="brand-logo pulse"
                />
              </picture>
            </div>
            <h2 className="heroTitle">
              Intérprete — Acceso con RUT <span aria-hidden>🤟🏼</span>
            </h2>
            <div className="heroSub">Ingresa tus credenciales</div>
          </div>

          {msg && (
            <div role="alert" aria-live="assertive" className="badge state-error shake center">
              {msg}
            </div>
          )}

          <form onSubmit={ingresar} className="form-grid">
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
              hint="Mínimo 6 caracteres"
            />

            <label className="chip ghost" style={{ width: "fit-content" }}>
              <input
                type="checkbox"
                checked={show}
                onChange={(e) => setShow(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Mostrar contraseña
            </label>

            <Row>
              <Button type="submit" full className="lg glow" iconRight={Ico.Next} disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </Row>

            <Row className="links-row">
              <Link className="chip glow-chip" to="/recuperar">🔑 Recuperar</Link>
              <Link className="chip glow-chip" to="/login">↩️ Volver</Link>
            </Row>
          </form>

          <div className="emoji-strip" aria-hidden>
            🧏🏻‍♀️ 🧏🏻‍♂️ 🤟🏼 🇨🇱
          </div>
        </div>
      </div>
    </Page>
  );
}
