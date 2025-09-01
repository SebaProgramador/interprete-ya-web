// src/hooks/useUserRole.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

/**
 * Devuelve el rol del usuario en vivo desde Firestore.
 * - "gerente" | "interprete" | "usuarioSordo" (por defecto)
 */
export default function useUserRole(user) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!user) { setRole(null); return; }

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setRole(snap.data().role || "usuarioSordo");
        else setRole("usuarioSordo");
      },
      () => setRole("usuarioSordo")
    );

    return () => unsub();
  }, [user]); // ✅ dependencia añadida

  return role;
}
