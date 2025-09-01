// src/pages/PerfilInterprete.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Page, Row } from "../components/ui";

export default function PerfilInterprete(){
  const { id } = useParams(); // id del intérprete
  const [interp, setInterp] = useState(null);
  const nav = useNavigate();

  useEffect(()=>{
    (async ()=>{
      const snap = await getDoc(doc(db, "users", id));
      if (snap.exists()) setInterp({ id, ...snap.data() });
    })();
  },[id]);

  if(!interp) return <Page title="Perfil del Intérprete"><p className="badge">Cargando…</p></Page>;

  // Nombre a mostrar del usuario actual (si está logeado)
  const me = auth.currentUser;
  const myName = (me?.displayName || me?.email || "Invitado");

  // Sala sugerida (puedes cambiar el formato si quieres)
  const suggestedRoom = `interpreteya-${id.slice(0,6)}-${(me?.uid || "anon").slice(0,6)}`;

  const gotoVideo = () => {
    nav(`/videollamada?room=${encodeURIComponent(suggestedRoom)}&name=${encodeURIComponent(myName)}`);
  };

  return (
    <Page title="Perfil del Intérprete">
      <div className="card" style={{padding:12, display:"grid", gap:10}}>
        <div className="row" style={{alignItems:"center", gap:12}}>
          <img
            src={interp.photoURL || "https://api.dicebear.com/9.x/initials/svg?seed="+encodeURIComponent(interp.displayName||"I")}
            alt="foto"
            width={56} height={56}
            style={{borderRadius:"50%"}}
          />
          <div>
            <div style={{fontWeight:800, fontSize:18}}>{interp.displayName || "Intérprete"}</div>
            {interp.certificacion && <div className="badge" style={{marginTop:4}}>Certificación: {interp.certificacion}</div>}
          </div>
        </div>

        {interp.experiencia && (
          <div className="badge">Experiencia: {interp.experiencia}</div>
        )}

        <Row>
          <Link className="btn" to={`/agendar?interpreter=${interp.id}`}>🗓️ Agendar</Link>
          <button className="btn secondary" onClick={gotoVideo}>🎥 Videollamada</button>
        </Row>

        <div className="badge">
          Sala sugerida: <b>{suggestedRoom}</b> (puedes compartirla con el intérprete)
        </div>
      </div>
    </Page>
  );
}
