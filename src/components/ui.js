// src/components/ui.js
import React from "react";
import { Navigate } from "react-router-dom";

/* Íconos: usa esta import si te funciona */
import {
  FaStar, FaChevronRight, FaExclamationCircle,
  FaUser, FaEnvelope, FaLock
} from "react-icons/fa";

/* --- Si arriba falla por fa/fa6, comenta lo anterior y usa esto ---
import {
  FaStar,
  FaChevronRight,
  FaCircleExclamation as FaExclamationCircle,
  FaUser,
  FaEnvelope,
  FaLock
} from "react-icons/fa6";
------------------------------------------------------------------- */

/* ---------- BOTÓN (Uber style) ---------- */
export const Button = ({
  children,
  onClick,
  to,
  type = "button",
  variant = "primary",   // primary | secondary | danger | success | ghost
  size = "lg",           // lg | md | sm
  full = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...rest
}) => {
  const V = {
    primary:  { bg:"linear-gradient(180deg, var(--primary), #2563eb)", fg:"#fff", br:"none" },
    secondary:{ bg:"transparent", fg:"var(--text)", br:"1px solid rgba(148,163,184,.3)" },
    danger:   { bg:"linear-gradient(180deg, var(--danger), #c22f2f)", fg:"#fff", br:"none" },
    success:  { bg:"linear-gradient(180deg, var(--success), #0d8f70)", fg:"#001b14", br:"none" },
    ghost:    { bg:"transparent", fg:"var(--text)", br:"1px solid rgba(59,130,246,.35)" },
  }[variant];

  const S = {
    lg: { pad:"14px 18px", fs:16, rad:14 },
    md: { pad:"10px 14px", fs:15, rad:12 },
    sm: { pad:"8px 12px",  fs:14, rad:10 },
  }[size];

  const style = {
    background: V.bg,
    color: V.fg,
    border: V.br,
    padding: S.pad,
    borderRadius: S.rad,
    fontWeight: 800,
    fontSize: S.fs,
    cursor: "pointer",
    width: full ? "100%" : "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(59,130,246,.30)",
    transition: "transform .12s ease, box-shadow .12s ease"
  };

  const Content = ({children}) => (
    <span style={{display:"inline-flex", alignItems:"center", gap:10}}>
      {IconLeft && <IconLeft aria-hidden />}
      <span>{children}</span>
      {IconRight && <IconRight aria-hidden />}
    </span>
  );

  if (to) return <a href={to} style={style} {...rest}><Content>{children}</Content></a>;
  return <button type={type} onClick={onClick} style={style} {...rest}><Content>{children}</Content></button>;
};

/* ---------- CARD ---------- */
export const Card = ({ children, title, subtitle, right }) => (
  <div className="panel" role="region" aria-label={title || "Sección"}>
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
      <div>
        {title && <h2 style={{margin:0}}>{title}</h2>}
        {subtitle && <div className="subtle">{subtitle}</div>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

/* ---------- ESTRELLAS (rating) ---------- */
export const Stars = ({ value=4 }) => {
  const items = [1,2,3,4,5];
  return (
    <div aria-label={`Calificación ${value} de 5`}>
      {items.map(i => (
        <FaStar key={i}
          className="star"
          style={{color: i<=value ? "var(--gold)" : "rgba(255,255,255,0.2)"}}
          aria-hidden
        />
      ))}
    </div>
  );
};

/* ---------- NAVBAR ---------- */
export const Navbar = () => (
  <header className="sticky">
    <div className="container">
      <div className="row" style={{justifyContent:"space-between"}}>
        <a className="brand" href="/">
          <span className="logoWrap">
            <img src="/logo.png" alt="InterpreteYa" />
          </span>
          <span>InterpreteYa</span>
        </a>
        <nav className="row" aria-label="Navegación principal">
          <a className="badge" href="/principal">Inicio</a>
          <a className="badge" href="/perfil-interprete">Intérpretes</a>
          <a className="badge tag-emergency" href="/emergencia">EMERGENCIA</a>
        </nav>
      </div>
    </div>
  </header>
);

/* ---------- INPUT (label + icono + error) ---------- */
export const Field = ({
  label,
  type="text",
  placeholder,
  icon:Icon,
  error,
  hint,
  ...props
}) => {
  const id = React.useId();
  return (
    <label htmlFor={id} style={{display:"block", marginBottom:12}}>
      {label && <div style={{marginBottom:6, color:"var(--muted)", fontWeight:700}}>{label}</div>}
      <div style={{position:"relative"}}>
        {Icon && <Icon aria-hidden style={{position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", opacity:.65}} />}
        <input id={id} className="input" type={type} placeholder={placeholder}
               style={{paddingLeft: Icon? 40:12}}
               aria-invalid={!!error}
               {...props} />
        {error && <FaExclamationCircle aria-hidden style={{position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"var(--danger)"}} />}
      </div>
      {hint && !error && <div className="subtle" style={{fontSize:12, marginTop:6}}>{hint}</div>}
      {error && <div style={{color:"var(--danger)", fontSize:12, marginTop:6}}>{error}</div>}
    </label>
  );
};

/* ---------- SELECT SIMPLE ---------- */
export const Select = ({ label, children, ...props }) => {
  const id = React.useId();
  return (
    <label htmlFor={id} style={{display:"block", marginBottom:12}}>
      {label && <div style={{marginBottom:6, color:"var(--muted)", fontWeight:700}}>{label}</div>}
      <select id={id} className="input" {...props}>{children}</select>
    </label>
  );
};

/* ---------- SEGMENTED (10m/30m/1h/Agendar) ---------- */
export const Segmented = ({ options=[], value, onChange }) => (
  <div role="tablist" aria-label="Duración del servicio" style={{
    display:"grid", gridAutoFlow:"column", gap:8,
    background:"var(--panel-2)", padding:6, borderRadius:12, border:"1px solid var(--border)"
  }}>
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(opt.value)}
          className="btn"
          style={{
            background: active ? "linear-gradient(180deg, var(--primary), #2563eb)" : "transparent",
            color: active ? "#fff" : "var(--text)",
            border: active ? "none" : "1px solid rgba(148,163,184,.25)",
            boxShadow: active ? "0 8px 18px rgba(59,130,246,.35)" : "none"
          }}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

/* ---------- ICONOS COMUNES ---------- */
export const Ico = { User: FaUser, Mail: FaEnvelope, Lock: FaLock, Next: FaChevronRight };

/* ---------- Page & Row ---------- */
export const Page = ({ title, children }) => (
  <div className="container">
    <div className="card">
      <h2>{title}</h2>
      <p className="badge">Pantalla base; iremos sumando funciones.</p>
      {children}
    </div>
  </div>
);

export const Row = ({ children, style }) => (
  <div className="row" style={{ marginTop: 12, ...(style||{}) }}>{children}</div>
);

/* ===================== GUARDS ===================== */

/** Requiere estar logueado */
export function Protected({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Requiere logueado + aprobado=true (sino, redirige a /pendiente) */
export function ProtectedApproved({ user, userDoc, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (!userDoc) {
    return (
      <div className="container">
        <div className="badge">Verificando estado…</div>
      </div>
    );
  }
  if (userDoc.aprobado !== true) return <Navigate to="/pendiente" replace />;
  return children;
}

/** Requiere rol específico (por defecto, 'gerente') */
export function RequireRole({ user, userDoc, role="gerente", children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (!userDoc) {
    return (
      <div className="container">
        <div className="badge">Cargando…</div>
      </div>
    );
  }
  if (userDoc.role !== role) return <Navigate to="/" replace />;
  return children;
}
