// src/pages/RegistroUsuario.js
import React, { useState } from "react";
import { Page, Row, Button, Field, Select, Segmented, Ico } from "../components/ui";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

/* ================= Helpers ================= */

/* 3 días hábiles (sin sábados ni domingos) */
function addBusinessDays(fromDate, days) {
  const d = new Date(fromDate);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay(); // 0 dom, 6 sáb
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

/* Guardar/actualizar doc del usuario en /users/{uid} */
async function ensureUserDoc(uid, data){
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { createdAt: Date.now(), ...data });
  } else {
    await setDoc(ref, { ...snap.data(), ...data }, { merge: true });
  }
}

const emailOK = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

/* RUT CHILE — formato y validación. Si no es chileno, se puede omitir el formato. */
function cleanRut(rut=""){ return rut.replace(/[.\-]/g, "").toUpperCase(); }
function formatRut(rut=""){
  const c = cleanRut(rut);
  if (c.length <= 1) return c;
  const cuerpo = c.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const dv = c.slice(-1);
  return `${cuerpo}-${dv}`;
}
function dvRut(cuerpoNum){
  let M=0,S=1;
  for(;cuerpoNum;cuerpoNum=Math.floor(cuerpoNum/10))
    S=(S+cuerpoNum%10*(9-M++%6))%11;
  return S?String(S-1):"K";
}
function rutOK(rut=""){
  const c = cleanRut(rut);
  if (c.length < 2) return false;
  const cuerpo = c.slice(0,-1);
  const dv = c.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  return dvRut(Number(cuerpo)) === dv;
}

/* WhatsApp Chile +56 9 #### #### → guarda E.164 (+569XXXXXXXX) */
function digits(v=""){ return String(v||"").replace(/\D/g, ""); }
function formatCLPhone(v=""){
  const D = digits(v);
  // Normalizar a 569 + 8 dígitos si parece chileno móvil
  let local = D;
  if (D.startsWith("56")) local = D.slice(2);
  if (local.startsWith("9") && local.length >= 9) {
    const a = local.slice(0,1);      // 9
    const b = local.slice(1,5);      // 4 dígitos
    const c = local.slice(5,9);      // 4 dígitos
    return `+56 ${a} ${b} ${c}`;
  }
  // fallback: muestra lo que sea que tenga
  return v;
}
function phoneE164(v=""){
  const D = digits(v);
  let rest = D;
  if (D.startsWith("56")) rest = D.slice(2);
  if (rest.startsWith("9") && rest.length >= 9) {
    const n8 = rest.slice(1,9);
    return `+569${n8}`;
  }
  return null;
}
function phoneOK(v=""){
  const e = phoneE164(v);
  return !!e && /^\+569\d{8}$/.test(e);
}

/* Opciones */
const TIPOS_SORDERA = [
  { value:"sordoProfundo", label:"Sordo profundo" },
  { value:"hipoacusiaLeve", label:"Hipoacusia leve" },
  { value:"hipoacusiaModerada", label:"Hipoacusia moderada" },
  { value:"hipoacusiaSevera", label:"Hipoacusia severa" },
  { value:"implanteCoclear", label:"Implante coclear" },
  { value:"usuarioAudifono", label:"Usuario de audífono" },
  { value:"otra", label:"Otra" },
];

const ESTADOS_OPTS = [
  { value:"Trabaja", label:"Trabaja" },
  { value:"Estudia", label:"Estudia" },
  { value:"Cesante", label:"Cesante" },
];

const ESTUDIA_NIVEL = [
  { value:"Tecnico", label:"Técnico" },
  { value:"Universidad", label:"Universidad" },
  { value:"Instituto", label:"Instituto" },
  { value:"ColegioLiceo", label:"Colegio/Liceo" },
  { value:"Postgrado", label:"Postgrado" },
  { value:"Otro", label:"Otro" },
];

/* Chips accesibles (single-select) con micro-animación */
function ChipGroup({ label, options, value, onChange, cols=2 }){
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <div style={{marginBottom:6, color:"var(--muted)", fontWeight:700}}>{label}</div>}
      <div
        role="listbox"
        aria-label={label}
        style={{
          display:"grid",
          gridTemplateColumns:`repeat(${cols}, minmax(0,1fr))`,
          gap:8
        }}
      >
        {options.map(opt=>{
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={active}
              aria-pressed={active}
              onClick={()=>onChange(opt.value)}
              className="btn"
              style={{
                background: active ? "linear-gradient(180deg, var(--primary), #2563eb)" : "transparent",
                color: active ? "#fff" : "var(--text)",
                border: active ? "none" : "1px solid rgba(148,163,184,.25)",
                boxShadow: active ? "0 8px 18px rgba(59,130,246,.35)" : "none",
                justifyContent:"flex-start",
                fontWeight: 700,
                transition: "transform .12s ease, box-shadow .12s ease, background .2s ease",
                transform: active ? "translateY(-1px)" : "translateY(0)"
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Acordeón simple */
function Accordion({ title, children, defaultOpen=false }){
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ padding:12 }}>
      <button
        type="button"
        onClick={()=>setOpen(o=>!o)}
        className="btn"
        style={{
          width:"100%", display:"flex", justifyContent:"space-between",
          alignItems:"center", background: open ? "linear-gradient(180deg, var(--primary), #2563eb)" : "transparent",
          color: open ? "#fff" : "var(--text)", border: open ? "none" : "1px solid rgba(148,163,184,.25)"
        }}
        aria-expanded={open}
      >
        <span style={{fontWeight:800}}>{title}</span>
        <span aria-hidden style={{opacity:.85}}>{open ? "▴" : "▾"}</span>
      </button>
      {open && <div style={{marginTop:10}}>{children}</div>}
    </div>
  );
}

/* ================ Página ================ */
export default function RegistroUsuario(){
  const [name,setName]   = useState("");
  const [email,setEmail] = useState("");
  const [pass,setPass]   = useState("");

  // Perfil
  const [cred,setCred]   = useState("");
  const [dni,setDni]     = useState("");
  const [tipo,setTipo]   = useState("");
  const [prof,setProf]   = useState("");
  const [estado,setEstado] = useState("");
  const [pref,setPref]   = useState("");

  // Datos extra
  const [dob,setDob] = useState("");            // fecha de nacimiento (YYYY-MM-DD)
  const [direccion,setDireccion] = useState("");
  const [whatsapp,setWhatsapp] = useState("");

  // Subcampos si “Estudia”
  const [nivelEstudio, setNivelEstudio] = useState("");
  const [queEstudia, setQueEstudia] = useState("");
  const [institucion, setInstitucion] = useState("");

  // Subcampo si “Cesante”
  const [buscaEn, setBuscaEn] = useState("");

  const [loading,setLoading] = useState(false);
  const [errors,setErrors] = useState({});
  const [done,setDone] = useState(false);
  const [msg,setMsg] = useState("");
  const [expectedDate,setExpectedDate] = useState("");

  const registrar = async (e) => {
    e?.preventDefault?.();

    // Validación
    const errs = {};
    if (!name) errs.name = "Ingresa tu nombre completo.";
    if (!email) errs.email = "Ingresa tu correo.";
    if (email && !emailOK(email)) errs.email = "Correo inválido.";
    if (!pass || pass.length < 6) errs.pass = "La contraseña debe tener al menos 6 caracteres.";
    if (!cred) errs.cred = "Ingresa tu credencial de discapacidad.";
    if (!dni) errs.dni = "Ingresa tu RUT/DNI.";
    else {
      const dniClean = cleanRut(dni);
      if (/^\d{6,9}[0-9Kk]$/.test(dniClean) && !rutOK(dni)) {
        errs.dni = "RUT inválido. Revisa dígito verificador.";
      }
    }
    if (!tipo) errs.tipo = "Selecciona tu tipo de sordera.";

    if (!estado) errs.estado = "Selecciona tu estado (trabaja/estudia/cesante).";
    if (estado === "Estudia") {
      if (!nivelEstudio) errs.nivelEstudio = "Selecciona tu nivel.";
      if (!queEstudia) errs.queEstudia = "Cuéntanos qué estudias.";
    }
    if (estado === "Cesante" && !buscaEn) {
      errs.buscaEn = "¿En qué área te gustaría trabajar?";
    }

    if (!dob) errs.dob = "Ingresa tu fecha de nacimiento.";
    if (!direccion) errs.direccion = "Ingresa tu dirección.";
    if (!whatsapp) errs.whatsapp = "Ingresa tu WhatsApp (+56 9 ...).";
    else if (!phoneOK(whatsapp)) errs.whatsapp = "WhatsApp inválido. Formato: +56 9 1234 5678";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    try{
      setLoading(true);
      setMsg("");

      const credAuth = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(credAuth.user, { displayName: name });

      const pendingUntil = addBusinessDays(new Date(), 3);
      const pendingUntilISO = pendingUntil.toISOString();
      setExpectedDate(pendingUntil.toLocaleDateString("es-CL"));

      const phoneE = phoneE164(whatsapp);
      await ensureUserDoc(credAuth.user.uid, {
        role: "usuarioSordo",
        displayName: name,
        email: email.trim().toLowerCase(),
        estadoCuenta: "pendiente",     // (pendiente | aprobado | rechazado)
        aprobado: false,
        pendingUntil: pendingUntilISO, // fecha estimada

        // Perfil
        credencialDiscapacidad: cred.trim(),
        dni: formatRut(dni),
        tipoSordera: tipo,
        profesion: prof.trim(),
        estado,                         // "Trabaja" | "Estudia" | "Cesante"
        preferencias: pref.trim(),

        // Datos de contacto
        direccion: direccion.trim(),
        whatsapp: phoneE,               // +569XXXXXXXX (E.164)
        whatsappDisplay: formatCLPhone(whatsapp),

        // Nacimiento
        nacimientoISO: dob,             // YYYY-MM-DD

        // Si estudia
        ...(estado === "Estudia" ? {
          nivelEstudio,
          queEstudia: queEstudia.trim(),
          institucion: institucion.trim(),
        } : {}),

        // Si cesante
        ...(estado === "Cesante" ? {
          buscaEn: buscaEn.trim(),
        } : {}),
      });

      // Bloquear acceso hasta aprobación
      await signOut(auth);
      setDone(true);
    }catch(e){
      console.error(e);
      setMsg(e?.message || "No fue posible registrar la cuenta.");
    }finally{
      setLoading(false);
    }
  };

  return (
    <Page title={done ? "Registro enviado" : "Registro de Usuario Sordo"}>
      {/* ========= ESTILOS: animación y tamaño para foto1/logo ========= */}
      <style>{`
        .logoWrap {
          position: relative;
          display: inline-block;
          border-radius: 20px;
          isolation: isolate;
        }
        .logoWrap::before {
          content: "";
          position: absolute;
          inset: -14px;
          border-radius: 24px;
          background: radial-gradient(60% 60% at 50% 40%, rgba(37,99,235,.35), transparent 70%),
                      radial-gradient(60% 60% at 30% 70%, rgba(212,175,80,.35), transparent 70%);
          filter: blur(18px);
          opacity: .8;
          z-index: -1;
          animation: breathe 3.6s ease-in-out infinite;
        }
        .heroLogo {
          width: clamp(120px, 42vw, 220px); /* ⬅️ más grande y responsivo */
          height: auto;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,.35), 0 0 0 1px rgba(184,140,80,.35) inset;
          animation: floaty 4.2s ease-in-out infinite, popIn .28s ease-out 1 both;
          will-change: transform, box-shadow;
        }
        @keyframes floaty {
          0%   { transform: translateY(0) }
          50%  { transform: translateY(-6px) }
          100% { transform: translateY(0) }
        }
        @keyframes popIn {
          from { transform: scale(.92); opacity: 0 }
          to   { transform: scale(1);   opacity: 1 }
        }
        @keyframes breathe {
          0%,100% { opacity: .65; transform: scale(1) }
          50%     { opacity: .9;  transform: scale(1.04) }
        }
        /* Accesibilidad: si el usuario prefiere menos movimiento, se reduce la animación */
        @media (prefers-reduced-motion: reduce) {
          .heroLogo { animation: none }
          .logoWrap::before { animation: none }
        }
      `}</style>

      {/* ========= Contenido según estado ========= */}
      {done ? (
        <div style={{ textAlign:"center", marginTop:-4 }}>
          <span className="logoWrap" aria-hidden="true">
            {/* Puedes usar tu logo normal o la misma foto1 si prefieres */}
            <img src="/logo.png" alt="InterpreteYa" className="heroLogo" />
          </span>
          <h2 className="heroTitle" style={{ marginTop: 10 }}>
            ¡Gracias, {name}!
          </h2>
          <p className="heroSub" style={{ marginTop: 6 }}>
            Por seguridad, estamos validando tu información.
          </p>
          <div className="badge" style={{ marginTop:12 }}>
            ⏳ Tiempo estimado: <b>3 a 4 días hábiles</b>{expectedDate ? ` (aprox. hasta ${expectedDate})` : ""}.
          </div>
          <p className="subtle" style={{ marginTop:12 }}>
            Un <b>Gerente</b> debe aprobar tu cuenta antes de ingresar.
            Te avisaremos por correo cuando esté <b>aprobada</b>.
          </p>
          <Row style={{ justifyContent:"center", marginTop:16 }}>
            <Button to="/" variant="secondary">Volver al inicio</Button>
            <Button to="/login">Ir a Login</Button>
          </Row>
        </div>
      ) : (
        <>
          {/* Header con FOTO1 animada y más grande */}
          <div style={{ textAlign:"center", marginTop:-4 }}>
            <span className="logoWrap" aria-hidden="true">
              <img
                src="/foto1.png"
                alt="InterpreteYa"
                className="heroLogo"         /* ⬅️ tamaño + animación */
                loading="eager"
              />
            </span>
            <div className="heroSub" style={{ marginTop: 8 }}>
              Crea tu cuenta para continuar
            </div>
          </div>

          {msg && (
            <div role="alert" className="badge"
              style={{ marginTop: 12, borderColor: "rgba(239,68,68,.6)", background: "rgba(239,68,68,.15)" }}>
              {msg}
            </div>
          )}

          {/* ======= Formulario ======= */}
          <form style={{display:"grid", gap:12, marginTop:12}} onSubmit={registrar}>
            {/* Datos básicos */}
            <Field label="Nombre completo" placeholder="Ej: Juan Pérez" icon={Ico.User}
                  value={name} onChange={e=>setName(e.target.value)} error={errors.name} autoComplete="name" />
            <Field label="Correo electrónico" type="email" placeholder="tu@correo.cl" icon={Ico.Mail}
                  value={email} onChange={e=>setEmail(e.target.value)} error={errors.email} autoComplete="email" />
            <Field label="Crear contraseña" type="password" placeholder="••••••••" icon={Ico.Lock}
                  value={pass} onChange={e=>setPass(e.target.value)} error={errors.pass} autoComplete="new-password" />

            {/* Datos personales extra */}
            <Field label="Fecha de nacimiento" type="date" value={dob}
                  onChange={e=>setDob(e.target.value)} error={errors.dob} />
            <Field label="Dirección" placeholder="Calle 123, Comuna, Ciudad"
                  value={direccion} onChange={e=>setDireccion(e.target.value)} error={errors.direccion} />
            <Field label="WhatsApp" placeholder="+56 9 1234 5678"
                  value={whatsapp} onChange={e=>setWhatsapp(formatCLPhone(e.target.value))}
                  error={errors.whatsapp} />

            {/* Identificación */}
            <Field label="Credencial de discapacidad" placeholder="Número o código"
                  value={cred} onChange={e=>setCred(e.target.value)} error={errors.cred} />
            <Field label="Carnet de identidad (RUT/DNI)" placeholder="12.345.678-9"
                  value={dni} onChange={e=>setDni(formatRut(e.target.value))} error={errors.dni} autoComplete="off" />

            {/* Acordeón: Tipo de Sordera */}
            <Accordion title={tipo ? `Tipo de Sordera: ${TIPOS_SORDERA.find(t=>t.value===tipo)?.label || ""}` : "Seleccionar Tipo de Sordera"}>
              <ChipGroup label="Tipo de Sordera" options={TIPOS_SORDERA} value={tipo} onChange={setTipo} cols={2} />
              {errors.tipo && <div style={{color:"var(--danger)", fontSize:12, marginTop:-6}}>{errors.tipo}</div>}
            </Accordion>

            {/* Profesión (si trabaja) */}
            <Field label="Profesión (si trabajas)" placeholder="Ej: Técnico, Contador, Barbero…"
                  value={prof} onChange={e=>setProf(e.target.value)} />

            {/* Acordeón: Estado */}
            <Accordion title={estado ? `Estado: ${estado}` : "Seleccionar Estado (trabaja/estudia/cesante)"}>
              <div>
                <div style={{marginBottom:6, color:"var(--muted)", fontWeight:700}}>Estado</div>
                <Segmented options={ESTADOS_OPTS} value={estado} onChange={setEstado} />
                {errors.estado && <div style={{color:"var(--danger)", fontSize:12, marginTop:6}}>{errors.estado}</div>}
              </div>

              {/* Subcampos dinámicos por estado */}
              {estado === "Estudia" && (
                <div style={{marginTop:12, display:"grid", gap:10}}>
                  <ChipGroup label="Nivel" options={ESTUDIA_NIVEL} value={nivelEstudio} onChange={setNivelEstudio} cols={3} />
                  {errors.nivelEstudio && <div style={{color:"var(--danger)", fontSize:12, marginTop:-6}}>{errors.nivelEstudio}</div>}
                  <Field label="¿Qué estudias?" placeholder="Carrera/Especialidad" value={queEstudia}
                        onChange={e=>setQueEstudia(e.target.value)} error={errors.queEstudia} />
                  <Field label="Institución (opcional)" placeholder="Universidad/Instituto/Colegio" value={institucion}
                        onChange={e=>setInstitucion(e.target.value)} />
                </div>
              )}

              {estado === "Cesante" && (
                <div style={{marginTop:12}}>
                  <Field label="¿En qué área buscas trabajo?" placeholder="Ej: Atención al cliente, Bodega, Tecnología…"
                        value={buscaEn} onChange={e=>setBuscaEn(e.target.value)} error={errors.buscaEn} />
                </div>
              )}
            </Accordion>

            {/* Preferencias (opcional) */}
            <Field label="Rango de solicitud (opcional)" placeholder="Ej: Urgencias, Salud, Educación, Legal…"
                  value={pref} onChange={e=>setPref(e.target.value)} />

            <Row>
              <Button type="submit" full disabled={loading}>
                {loading? "Creando..." : "Registrar"}
              </Button>
            </Row>
          </form>
        </>
      )}
    </Page>
  );
}
