/* ==========================================================================
   board-fx.js · pad PCB determinístico (vias, pads, trilhas de cobre) +
   pulsos de sinal viajando em trilhas ativas. Não é partícula aleatória:
   é uma placa gerada com seed fixa · técnica, intencional, conectada.
   Regras: DPR ≤ 2 / 1.5 touch · pausa em aba oculta · reduced-motion →
           1 frame estático · ≤900px → modo reduzido (2 trilhas, blur menor)
   ========================================================================== */
(() => {
  "use strict";

  const canvas = document.getElementById("board-canvas");
  if (!canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(pointer: coarse)");
  const narrow = window.matchMedia("(max-width: 900px)");

  const ctx = canvas.getContext("2d");
  const COPPER = "217, 142, 74";
  const SIGNAL = "26, 227, 231";
  const CELL = 56;

  let W = 0;
  let H = 0;
  let raf = 0;
  let running = false;
  let pad = null;          // offscreen com o padrão estático
  let activeTraces = [];   // trilhas que recebem pulsos
  let pulses = [];
  let surge = 0;           // 1 → decai para 0: reforço quando o sinal chega (board:surge)

  /* PRNG com seed fixa: a placa é sempre a mesma · intencional */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- padrão estático (desenhado 1x por resize) ---------- */
  function buildPad() {
    const dpr = Math.min(coarse.matches ? 1.5 : 2, window.devicePixelRatio || 1);
    pad = document.createElement("canvas");
    pad.width = Math.round(W * dpr);
    pad.height = Math.round(H * dpr);
    const p = pad.getContext("2d");
    p.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rnd = mulberry32(20061201); // seed da placa: fixa
    const cols = Math.ceil(W / CELL);
    const rows = Math.ceil(H / CELL);

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const x = gx * CELL + CELL / 2;
        const y = gy * CELL + CELL / 2;
        const roll = rnd();

        if (roll < 0.16) {
          // via: ponto pequeno
          p.beginPath();
          p.arc(x, y, 1.4, 0, Math.PI * 2);
          p.fillStyle = `rgba(${COPPER}, .14)`;
          p.fill();
        } else if (roll < 0.22) {
          // pad: anel
          p.beginPath();
          p.arc(x, y, 3.2, 0, Math.PI * 2);
          p.strokeStyle = `rgba(${COPPER}, .12)`;
          p.lineWidth = 1.2;
          p.stroke();
        } else if (roll < 0.34) {
          // trilha L curta (cobre) ou reta (sinal, rara)
          const isSignal = rnd() < 0.22;
          const col = isSignal ? SIGNAL : COPPER;
          const alpha = isSignal ? 0.07 : 0.09;
          const dirX = rnd() < 0.5 ? 1 : -1;
          const dirY = rnd() < 0.5 ? 1 : -1;
          const len = CELL * (1 + Math.floor(rnd() * 2));
          const bend = rnd() < 0.6;

          p.beginPath();
          p.moveTo(x, y);
          if (bend) {
            const mx = x + dirX * len * 0.5;
            p.lineTo(mx, y);
            p.lineTo(mx + dirX * (CELL * 0.5) * 0, y); // mantém ortogonal
            p.lineTo(mx, y + dirY * len * 0.5);
          } else {
            p.lineTo(x + dirX * len, y);
          }
          p.strokeStyle = `rgba(${col}, ${alpha})`;
          p.lineWidth = 1;
          p.stroke();

          // via de término
          p.beginPath();
          p.arc(bend ? x + dirX * len * 0.5 : x + dirX * len, bend ? y + dirY * len * 0.5 : y, 1.4, 0, Math.PI * 2);
          p.fillStyle = `rgba(${col}, ${alpha + 0.06})`;
          p.fill();
        }
        // restante: célula vazia (silêncio da placa)
      }
    }
  }

  /* ---------- trilhas ativas + pulsos ---------- */
  function buildActives() {
    const rnd = mulberry32(77031); // seed das trilhas ativas
    activeTraces = [];
    pulses = [];

    const count = narrow.matches ? 2 : coarse.matches || (navigator.hardwareConcurrency || 8) <= 4 ? 3 : 5;

    for (let i = 0; i < count; i++) {
      const y0 = H * (0.12 + rnd() * 0.76);
      const x0 = -40;
      const segs = [];
      let x = x0;
      let y = y0;
      const pts = [{ x, y }];
      const nSeg = 4 + Math.floor(rnd() * 3);
      for (let s = 0; s < nSeg; s++) {
        const len = W / nSeg + (rnd() - 0.5) * 80;
        x += len;
        pts.push({ x, y });
        if (rnd() < 0.6) {
          const dy = (rnd() < 0.5 ? -1 : 1) * CELL * (1 + Math.floor(rnd() * 2));
          y += dy;
          // canto 45°
          pts.splice(pts.length - 1, 1, { x: x - Math.abs(dy), y: y - dy }, { x, y });
        }
      }
      // comprimentos acumulados
      let total = 0;
      for (let k = 0; k < pts.length - 1; k++) {
        const l = Math.hypot(pts[k + 1].x - pts[k].x, pts[k + 1].y - pts[k].y);
        segs.push({ a: pts[k], b: pts[k + 1], l, start: total });
        total += l;
      }
      activeTraces.push({ pts, segs, total });

      const per = coarse.matches ? 1 : 2;
      for (let q = 0; q < per; q++) {
        pulses.push({
          trace: i,
          t: rnd(),
          speed: 0.00035 + rnd() * 0.0004,
          r: 1.4 + rnd() * 1.1,
        });
      }
    }
  }

  function pointAt(tr, t) {
    const dist = t * tr.total;
    for (const s of tr.segs) {
      if (dist <= s.start + s.l) {
        const k = s.l ? (dist - s.start) / s.l : 0;
        return { x: s.a.x + (s.b.x - s.a.x) * k, y: s.a.y + (s.b.y - s.a.y) * k };
      }
    }
    return tr.pts[tr.pts.length - 1];
  }

  /* ---------- desenho ---------- */
  function draw(animate) {
    ctx.clearRect(0, 0, W, H);
    if (pad) ctx.drawImage(pad, 0, 0, W, H);

    // trilhas ativas (um tom acima do padrão; reforçadas no surge)
    activeTraces.forEach((tr) => {
      ctx.beginPath();
      tr.pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.strokeStyle = `rgba(${SIGNAL}, ${0.08 + surge * 0.12})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // pulsos de sinal
    pulses.forEach((pl) => {
      if (animate) {
        pl.t += pl.speed * (1 + surge * 2.4);
        if (pl.t > 1) pl.t -= 1;
      }
      const tr = activeTraces[pl.trace];
      if (!tr) return;
      const pos = pointAt(tr, pl.t);
      const tail = pointAt(tr, Math.max(0, pl.t - 0.015 - surge * 0.03));

      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = `rgba(${SIGNAL}, ${0.3 + surge * 0.4})`;
      ctx.lineWidth = pl.r * (1 + surge * 0.5);
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pl.r * (1 + surge * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${SIGNAL}, ${0.7 + surge * 0.25})`;
      ctx.shadowColor = `rgba(${SIGNAL}, ${0.7 + surge * 0.3})`;
      ctx.shadowBlur = narrow.matches ? 4 : 7 + surge * 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function loop() {
    if (!running) return;
    if (surge > 0) surge = Math.max(0, surge - 0.009); // decai em ~1.8s
    draw(true);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (reduced.matches) { stop(); draw(false); return; } // 1 frame estático
    if (!running) {
      running = true;
      raf = requestAnimationFrame(loop);
    }
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function resize() {
    const dpr = Math.min(coarse.matches ? 1.5 : 2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildPad();
    buildActives();
    if (!running) draw(false);
  }

  window.addEventListener("resize", resize, { passive: true });

  /* surge: o sinal chegou na faixa drench · reforço breve de brilho/velocidade */
  window.addEventListener("board:surge", () => {
    surge = 1;
    if (!running) {
      // reduced-motion: um frame mais brilhante, depois volta ao estado calmo
      draw(false);
      setTimeout(() => {
        surge = 0;
        if (!running) draw(false);
      }, 2000);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  reduced.addEventListener?.("change", () => {
    stop();
    resize();
    start();
  });

  resize();
  start();
})();
