// src/pages/DevTools.js
import React from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Page, Row } from "../components/ui";
import { Link, useNavigate } from "react-router-dom";

export default function DevTools(){
  const nav = useNavigate();

  const makeMeGerente = async ()=>{
    if (!auth.currentUser){ alert("Primero inicia sesión."); nav("/login"); return; }
    try{
      await updateDoc(doc(db, "users", auth.currentUser.uid), { role: "gerente" });
      alert("✅ Listo, ahora eres GERENTE");
      nav("/gerente");
    }catch(e){
      alert("Error: " + e.message);
    }
  };

  return (
    <Page title="DevTools (temporal)">
      <p className="badge">Solo para desarrollo. Quitar en producción.</p>
      <Row>
        <button className="btn" onClick={makeMeGerente}>Hacerme GERENTE</button>
        <Link className="btn secondary" to="/">Inicio</Link>
      </Row>
    </Page>
  );
}
