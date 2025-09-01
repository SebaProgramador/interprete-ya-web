// src/components/DevGerenteSwitch.jsx
import React, { useMemo } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import useUserRole from "../hooks/useUserRole";

/**
 * Botón visible solo en DEV o cuando la URL tiene ?dev=1
 * Permite poner/quitar el rol "gerente" al usuario logeado.
 */
export default function DevGerenteSwitch(){
  const user = auth.currentUser;
  const role = useUserRole(user);

  // Visible en dev o con ?dev=1
  const showDev = useMemo(()=>{
    const isDevEnv = process.env.NODE_ENV !== "production";
    const hasParam = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("dev");
    return isDevEnv || hasParam;
  }, []);

  if (!showDev || !user) return null;

  const makeGerente = async ()=>{
    try {
      await updateDoc(doc(db, "users", user.uid), { role: "gerente" });
      alert("✅ Ahora eres GERENTE");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const quitarGerente = async ()=>{
    try {
      await updateDoc(doc(db, "users", user.uid), { role: "usuarioSordo" });
      alert("Rol gerente quitado");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="row" style={{ gap: 6, marginLeft: 8 }}>
      {role === "gerente" ? (
        <button className="btn secondary" onClick={quitarGerente} title="Quitar rol gerente (solo dev)">
          Quitar GERENTE
        </button>
      ) : (
        <button className="btn" onClick={makeGerente} title="Hacerme gerente (solo dev)">
          Hacerme GERENTE
        </button>
      )}
    </div>
  );
}
