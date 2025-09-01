// src/pages/Agendar.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { Page, Row } from "../components/ui";

const PRICE = { 10: 2000, 30: 5000, 60: 9000 };
const priceFor = (min) => PRICE[min] ?? 0;

export default function Agendar(){
  const nav = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const interpreterId = params.get("interpreter") || params.get("i"); // acepta ambas claves

  const [fechaHora, setFechaHora] = useState("");
  const [tipo, setTipo] = useState("videoconferencia");
  const [duracion, setDuracion] = useState(30);
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);

  // sala por defecto, útil si el servicio es por videoconferencia
  const defaultRoom = `interpreteya-${(auth.currentUser?.uid || "anon").slice(0,6)}-${Date.now().toString(36).slice(-5)}`;

  const crearAgenda = async () => {
    if (!auth.currentUser){ alert("Debes iniciar sesión."); nav("/login"); return; }
    if (!fechaHora){ alert("Selecciona fecha y hora"); return; }

    try{
      setLoading(true);
      const when = Timestamp.fromDate(new Date(fechaHora));

      await addDoc(collection(db, "reservas"), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email,
        interpreterRequestedId: interpreterId || null,    // 👈 solicitado por el cliente
        interpreterRequestedName: null,                   // (opcional si luego guardas nombre)
        interpreterId: null,                              // asignado por gerente
        interpreterName: null,
        tipo,                                             // presencial | videoconferencia
        minutes: duracion,
        price: priceFor(duracion),
        scheduledAt: when,
        note: nota,
        roomName: defaultRoom,                            // 👈 agregado
        status: "pendiente",
        createdAt: serverTimestamp()
      });

      alert("✅ Reserva agendada correctamente");
      nav("/mis-reservas");
    }catch(e){
      alert("Error al agendar: " + e.message);
    }finally{
      setLoading(false);
    }
  };

  return (
    <Page title="Agendar Intérprete">
      <div style={{display:"grid", gap:12}}>
        {interpreterId && (
          <div className="badge">
            Intérprete solicitado: <b>{interpreterId.slice(0,6)}…</b>
          </div>
        )}

        <label>
          Fecha y hora:
          <input type="datetime-local" value={fechaHora} onChange={e=>setFechaHora(e.target.value)} />
        </label>

        <label>
          Tipo de servicio:
          <select value={tipo} onChange={e=>setTipo(e.target.value)}>
            <option value="presencial">Presencial</option>
            <option value="videoconferencia">Videoconferencia</option>
          </select>
        </label>

        <label>
          Duración:
          <div className="row" style={{flexWrap:"wrap"}}>
            {[10,30,60].map(m => (
              <button
                key={m}
                type="button"
                className={"btn " + (duracion===m ? "" : "secondary")}
                onClick={()=>setDuracion(m)}
                style={{marginRight:8}}
              >
                {m===60 ? "1 hora" : `${m} min`}
              </button>
            ))}
          </div>
        </label>

        <label>
          Nota (opcional):
          <textarea
            rows={3}
            placeholder="Ej: Contexto de la cita, dirección si es presencial…"
            value={nota}
            onChange={e=>setNota(e.target.value)}
          />
        </label>

        <div className="card" style={{padding:12}}>
          <div className="row" style={{justifyContent:"space-between"}}>
            <strong>Precio</strong>
            <strong>${priceFor(duracion).toLocaleString("es-CL")}</strong>
          </div>
        </div>

        <Row>
          <button className="btn" onClick={crearAgenda} disabled={loading}>
            {loading ? "Agendando..." : "Confirmar Agenda"}
          </button>
        </Row>

        <p className="badge">* Pagos (WebPay/MercadoPago) los conectamos después.</p>
      </div>
    </Page>
  );
}
