// src/pages/Interpretes.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { Page, Row } from "../components/ui";

/* Estrellas accesibles */
function Stars({ value = 0 }) {
  const num = Number(value) || 0;
  const v = Math.max(0, Math.min(5, Math.round(num)));
  return (
    <span aria-label={`${num.toFixed(1)} estrellas`}>
      {"★".repeat(v)}
      {"☆".repeat(5 - v)}
    </span>
  );
}

export default function Interpretes() {
  const [items, setItems] = useState([]);               // /users con role=interprete
  const [extraRatings, setExtraRatings] = useState({}); // { [id]: { avg, count, source } }
  const [busca, setBusca] = useState("");
  const [orden, setOrden] = useState("rating");         // rating | nombre

  // 1) Suscripción a usuarios intérpretes
  useEffect(() => {
    const qInt = query(collection(db, "users"), where("role", "==", "interprete"));
    const unsub = onSnapshot(qInt, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 2) Fallback: SOLO buscar en evaluaciones/ratings si el perfil NO tiene ratingCount/ratingSum
  useEffect(() => {
    let cancelled = false;

    const ids = items
      .filter((i) => !(typeof i.ratingCount === "number" && typeof i.ratingSum === "number"))
      .map((i) => i.id);

    if (ids.length === 0) {
      setExtraRatings({});
      return;
    }

    (async () => {
      const entries = await Promise.all(
        ids.map(async (id) => {
          // a) Intento con /evaluaciones (estructura nueva)
          const evSnap = await getDocs(
            query(collection(db, "evaluaciones"), where("interpreterId", "==", id))
          );
          let vals = evSnap.docs
            .map((d) => Number(d.data()?.stars))
            .filter((n) => !Number.isNaN(n));

          if (vals.length > 0) {
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
            return [id, { avg, count: vals.length, source: "evaluaciones" }];
          }

          // b) Fallback con /ratings (compatibilidad antigua)
          const rSnap = await getDocs(
            query(collection(db, "ratings"), where("interpreterId", "==", id))
          );
          vals = rSnap.docs
            .map((d) => Number(d.data()?.stars))
            .filter((n) => !Number.isNaN(n));

          const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          return [id, { avg, count: vals.length, source: "ratings" }];
        })
      );

      if (!cancelled) setExtraRatings(Object.fromEntries(entries));
    })();

    return () => { cancelled = true; };
  }, [items]);

  // 3) Filtro + cálculo final de rating (prefiere ratingSum/ratingCount del perfil)
  const lista = useMemo(() => {
    const filtrada = items.filter((i) => {
      if (!busca.trim()) return true;
      const t = busca.toLowerCase();
      return (
        (i.displayName || "").toLowerCase().includes(t) ||
        (i.certificacion || "").toLowerCase().includes(t) ||
        (i.experiencia || "").toLowerCase().includes(t)
      );
    });

    const conRating = filtrada.map((i) => {
      const hasProfileAgg = (typeof i.ratingCount === "number" && typeof i.ratingSum === "number");
      const avg = hasProfileAgg
        ? (i.ratingCount > 0 ? (i.ratingSum || 0) / i.ratingCount : 0)
        : (extraRatings[i.id]?.avg || 0);
      const count = hasProfileAgg ? (i.ratingCount || 0) : (extraRatings[i.id]?.count || 0);
      const source = hasProfileAgg ? "user" : (extraRatings[i.id]?.source || "none");
      return { ...i, _avg: avg, _count: count, _source: source };
    });

    return conRating.sort((a, b) => {
      if (orden === "nombre") return (a.displayName || "").localeCompare(b.displayName || "");
      return (b._avg || 0) - (a._avg || 0);
    });
  }, [items, busca, orden, extraRatings]);

  const calidadTexto = (avg) => (Number(avg) >= 4 ? "Buena Calidad" : "Baja Calidad");

  return (
    <Page title="Intérpretes disponibles">
      <div className="card" style={{ marginBottom: 12 }}>
        <Row style={{ gap: 8, alignItems: "center" }}>
          <input
            placeholder="Buscar por nombre, certificación, experiencia…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ flex: 1, minWidth: 260 }}
          />
          <select
            className="btn secondary"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="rating">Ordenar por rating</option>
            <option value="nombre">Ordenar por nombre</option>
          </select>
        </Row>
      </div>

      {lista.length === 0 ? (
        <p className="badge">Aún no hay intérpretes registrados.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {lista.map((i) => (
            <div key={i.id} className="card" style={{ padding: 12, display: "grid", gap: 8 }}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={
                      i.photoURL ||
                      "https://api.dicebear.com/9.x/initials/svg?seed=" +
                        encodeURIComponent(i.displayName || "I")
                    }
                    alt="foto"
                    width={48}
                    height={48}
                    style={{ borderRadius: "50%" }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>{i.displayName || "Intérprete"}</div>
                    <div className="badge" style={{ marginTop: 2 }}>
                      <Stars value={i._avg} />{" "}
                      <span style={{ marginLeft: 6 }}>
                        {Number(i._avg || 0).toFixed(1)} ({i._count || 0})
                      </span>
                    </div>
                    <div className="badge">{calidadTexto(i._avg)}</div>
                  </div>
                </div>

                <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                  <Link className="btn secondary" to={`/interprete/${i.id}`}>
                    Ver perfil
                  </Link>
                  <Link
                    className="btn"
                    to={`/agendar?interpreter=${i.id}&name=${encodeURIComponent(i.displayName || "")}`}
                  >
                    Agendar
                  </Link>
                  <Link
                    className="btn secondary"
                    to={`/solicitar?interpreter=${i.id}&name=${encodeURIComponent(i.displayName || "")}`}
                  >
                    Urgente
                  </Link>
                </div>
              </div>

              {(i.certificacion || i.experiencia) && (
                <div className="badge" style={{ lineHeight: 1.6 }}>
                  {i.certificacion && (
                    <span>
                      <b>Certificación:</b> {i.certificacion}
                    </span>
                  )}
                  {i.certificacion && i.experiencia && <span> · </span>}
                  {i.experiencia && (
                    <span>
                      <b>Experiencia:</b> {i.experiencia}
                    </span>
                  )}
                </div>
              )}

              {/* Fuente del rating (útil en migración) */}
              <div className="badge" style={{ opacity: 0.6 }}>
                Fuente rating: {i._source}
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
