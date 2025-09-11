import React, { useCallback, useEffect, useRef, useState } from "react";
import "./NearbyMap.css";

export default function NearbyMap({
  ubicacion = "Santiago, Chile",
  onRefresh,
  onOpenInterpretes,
  onOpenVida,
}) {
  const mapRef = useRef(null);
  const [searching, setSearching] = useState(true);

  const [markers, setMarkers] = useState([
    { id: "maria", name: "María G.", dist: 0.5, emoji: "🧏‍♀️" },
    { id: "juan",  name: "Juan P.",  dist: 1.2, emoji: "🧏‍♂️" },
    { id: "carla", name: "Carla S.", dist: 2.1, emoji: "🤟"   },
  ]);

  // posiciones responsivas (en %)
  const scatterMarkers = useCallback(() => {
    setMarkers(prev =>
      prev.map(m => ({
        ...m,
        x: Math.round(15 + Math.random() * 70), // 15–85 %
        y: Math.round(18 + Math.random() * 60), // 18–78 %
      }))
    );
  }, []);

  useEffect(() => {
    scatterMarkers();
    const t = setTimeout(() => setSearching(false), 1400);
    return () => clearTimeout(t);
  }, [scatterMarkers]);

  const buscarAlrededor = useCallback(() => {
    setSearching(true);
    setTimeout(() => {
      scatterMarkers();
      setSearching(false);
      onRefresh?.();
    }, 1600);
  }, [scatterMarkers, onRefresh]);

  return (
    <section className="card white mb-8 radar-card" aria-label="Intérpretes cerca de ti">
      <div className="card-head">
        <h2 className="card-title">Intérpretes cerca de ti</h2>
        <span className="muted"><span aria-hidden="true">📍</span> {ubicacion}</span>
      </div>

      <div className="radar-wrap" ref={mapRef} role="region" aria-label="Radar de intérpretes">
        {/* fondo y círculo grande */}
        <div className="radar-circle" aria-hidden="true" />

        {/* giro suave SIEMPRE visible */}
        <div className="radar-spin" aria-hidden="true" />

        {/* barrido fuerte SOLO cuando searching = true */}
        <div className={`radar-sweep ${searching ? "on" : ""}`} aria-hidden="true">
          <div className="sweep" />
          <div className="ring r1" />
          <div className="ring r2" />
          <div className="ring r3" />
        </div>

        {/* chip LSCh (reemplaza “N”) */}
        <div className="lsch-chip" title="Lengua de Señas Chilena — Región Metropolitana, Chile">
          LSCh – R.M., Chile
        </div>

        {/* pin central con anillos */}
        <div className={`center-pin ${searching ? "active" : ""}`} aria-hidden="true">
          <div className="pin-dot">📍</div>
          <div className="pin-ring spin" />
          <div className="pin-pulse" />
        </div>

        {/* marcadores */}
        {markers.map((m) => (
          <button
            key={m.id}
            type="button"
            className="interp-marker"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            onClick={() => onOpenInterpretes?.()}
            title={`${m.name} (${m.dist} km)`}
            aria-label={`${m.name}, a ${m.dist} kilómetros`}
          >
            <span className="pulse-dot" aria-hidden="true" />
            <span className="marker-label" aria-hidden="true">
              <span className="avatar">{m.emoji}</span>
              {m.name} ({m.dist} km)
            </span>
          </button>
        ))}

        {/* estado “buscando” */}
        <div className={`search-toast ${searching ? "show" : ""}`} role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Buscando intérpretes cerca…
        </div>

        <div className="radar-actions">
          <button type="button" className="btn pill" onClick={buscarAlrededor}>
            🔄 Actualizar ubicación
          </button>
        </div>
      </div>

      <div className="center mt-12">
        <button type="button" className="btn pill lg" onClick={() => onOpenVida?.()}>
          🤟🏼 Vida Intérprete ➜
        </button>
      </div>
    </section>
  );
}
