import React, { useEffect, useRef } from "react";

/**
 * Fondo tecnológico animado (grid/paneles tipo “Digimon”) con partículas.
 * No depende de CSS animations → funciona aunque el SO tenga “reducir movimiento”.
 */
export default function CanvasTechBg({
  speed = 8,        // px/seg (velocidad del desplazamiento diagonal)
  grid = 64,        // tamaño de la grilla en px (a 1x; luego escala por DPR)
  softness = 0.85,  // 0..1, atenúa el contraste del grid
  particles = 36,   // cantidad de puntos de luz
}) {
  const ref = useRef(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    // Tomar colores del :root para integrarlo con tu tema
    const css = getComputedStyle(document.documentElement);
    const BG  = css.getPropertyValue("--bg").trim()     || "#070d1a";
    const BG2 = css.getPropertyValue("--bg-2").trim()   || "#0b162b";
    const CY  = css.getPropertyValue("--cyan").trim()   || "#22d3ee";
    const BL  = css.getPropertyValue("--blue").trim()   || "#60a5fa";
    const VI  = css.getPropertyValue("--violet").trim() || "#8b5cf6";

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Prepara partículas en posiciones semialeatorias
    const pts = Array.from({ length: particles }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 1.6,
      p: Math.random() * Math.PI * 2, // fase
      s: 0.3 + Math.random() * 0.7,   // brillo relativo
    }));

    let start = performance.now();

    const draw = (t) => {
      const elapsed = (t - start) / 1000; // segundos
      const { width: WCSS, height: HCSS } = canvas.getBoundingClientRect();
      const W = WCSS;
      const H = HCSS;

      // Fondo: gradiente vertical muy suave
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, BG);
      g.addColorStop(1, BG2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Parámetros del grid
      const cell = grid;
      const off = (elapsed * speed) % (cell * 4); // desplazamiento diagonal

      // Grid: líneas finas + “paneles” cada 4 celdas
      ctx.save();
      ctx.globalAlpha = 0.18 * softness;
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1;

      // desplazamiento diagonal (x + y)
      ctx.translate(-off, -off);

      // Líneas verticales
      for (let x = -cell * 4; x < W + cell * 4; x += cell) {
        // línea gruesa cada 4
        const major = Math.round(x / cell) % 4 === 0;
        ctx.globalAlpha = (major ? 0.28 : 0.18) * softness;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H + cell * 8);
        ctx.stroke();
      }
      // Líneas horizontales
      for (let y = -cell * 4; y < H + cell * 4; y += cell) {
        const major = Math.round(y / cell) % 4 === 0;
        ctx.globalAlpha = (major ? 0.28 : 0.18) * softness;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W + cell * 8, y);
        ctx.stroke();
      }
      ctx.restore();

      // Halo/luces radiales sutiles (cian/azul/violeta)
      const blobs = [
        { x: W * 0.12, y: H * 0.18, r: Math.max(W, H) * 0.45, c: CY },
        { x: W * 0.86, y: H * 0.10, r: Math.max(W, H) * 0.42, c: BL },
        { x: W * 0.55, y: H * 0.92, r: Math.max(W, H) * 0.55, c: VI },
      ];
      blobs.forEach(({ x, y, r, c }) => {
        const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, hexToRgba(c, 0.12 * softness));
        rg.addColorStop(1, hexToRgba(c, 0));
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Partículas: parpadean suavemente y se desplazan leeeento
      ctx.save();
      pts.forEach((p, i) => {
        const px = (p.x * (W + cell * 4) + elapsed * speed * 0.6) % (W + cell * 4) - cell * 2;
        const py = (p.y * (H + cell * 4) + elapsed * speed * 0.6) % (H + cell * 4) - cell * 2;
        const tw = 0.5 + 0.5 * Math.sin(elapsed * 1.0 + p.p);
        ctx.fillStyle = hexToRgba(i % 3 === 0 ? CY : i % 3 === 1 ? BL : VI, (0.35 + 0.35 * tw) * p.s * softness);
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };

    // Helpers
    function hexToRgba(hex, a) {
      const h = hex.replace("#", "");
      const bigint = parseInt(h.length === 3 ? h.split("").map((c)=>c+c).join("") : h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r},${g},${b},${a})`;
    }
  }, [grid, speed, softness, particles]);

  return <canvas ref={ref} className="tech-canvas" aria-hidden />;
}
