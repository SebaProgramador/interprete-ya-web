// src/pages/CuentaPendiente.js
import React from "react";
import { Button, Page, Row } from "../components/ui";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function CuentaPendiente(){
  const [info, setInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const user = auth.currentUser;

  async function cargar(){
    if (!user) return;
    setLoading(true);
    const snap = await getDoc(doc(db, "users", user.uid));
    setInfo(snap.exists() ? snap.data() : null);
    setLoading(false);
  }

  React.useEffect(()=>{ cargar(); /* al montar */ }, []);

  const fechaEstimada = info?.pendingUntil
    ? new Date(info.pendingUntil).toLocaleDateString("es-CL")
    : "";

  return (
    <Page title="Tu cuenta está en revisión">
      <div style={{ textAlign:"center", marginTop:-4 }}>
        <span className="logoWrap">
          <img src="/logo.png" alt="InterpreteYa" style={{ height: 72 }} />
        </span>
      </div>

      {loading ? (
        <div className="badge" style={{marginTop:12}}>Verificando estado…</div>
      ) : (
        <>
          <p className="heroSub" style={{ marginTop: 10 }}>
            Por seguridad, un <b>Gerente</b> debe aprobar tu cuenta.
          </p>
          <div className="badge" style={{ marginTop:12 }}>
            ⏳ Tiempo estimado: <b>3 a 4 días hábiles</b>
            {fechaEstimada ? ` (aprox. hasta ${fechaEstimada})` : ""}.
          </div>
          <p className="subtle" style={{ marginTop: 12 }}>
            Te avisaremos por correo cuando esté <b>aprobada</b>.
          </p>

          <Row style={{ justifyContent:"center", marginTop:16 }}>
            <Button onClick={cargar} variant="secondary">Actualizar estado</Button>
            <Button onClick={()=>signOut(auth)} to="/" >Cerrar sesión</Button>
          </Row>
        </>
      )}
    </Page>
  );
}
