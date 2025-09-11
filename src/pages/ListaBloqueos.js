// src/pages/ListaBloqueos.js
import React from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function ListaBloqueos(){
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  async function cargar(){
    setLoading(true);
    const q = query(collection(db, "users"), where("bloqueado", "==", true));
    const s = await getDocs(q);
    setItems(s.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }
  React.useEffect(()=>{ cargar(); }, []);

  async function desbloquear(id){
    await updateDoc(doc(db, "users", id), { bloqueado: false });
    await cargar();
  }

  return (
    <div className="container">
      <h1 className="heroTitle">Lista de bloqueos</h1>
      {loading && <div className="badge" style={{marginTop:12}}>Cargando…</div>}
      {!loading && items.length === 0 && (
        <div className="badge" style={{marginTop:12}}>No hay usuarios bloqueados.</div>
      )}
      <div className="grid3" style={{marginTop:12}}>
        {items.map(u=>(
          <div className="card white" key={u.id}>
            <h3 className="card-title" style={{marginTop:0}}>{u.displayName || u.email}</h3>
            <p className="muted">RUT/DNI: <b>{u.dni || "-"}</b></p>
            <button className="btn" onClick={()=>desbloquear(u.id)}>✅ Desbloquear</button>
          </div>
        ))}
      </div>
    </div>
  );
}
