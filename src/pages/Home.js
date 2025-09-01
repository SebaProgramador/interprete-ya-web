import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home(){
  const nav = useNavigate();
  return (
    <div className="container">
      <div className="card">
        <div className="heroTitle">Intérprete Ya</div>
        <div className="heroSub">Accesibilidad 24/7.</div>
        <div className="grid3" style={{marginTop:16}}>
          <button className="btn" onClick={()=>nav("/solicitar")}>⚡ Solicitar Ahora</button>
          <button className="btn secondary" onClick={()=>nav("/agendar")}>🗓️ Agendar</button>
          <button className="btn secondary" onClick={()=>nav("/videollamada")}>🎥 Videollamada</button>
        </div>
      </div>
    </div>
  );
}
