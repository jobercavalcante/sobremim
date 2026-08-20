/* ==========================================================================
   script.js — nav, reveals, boot typewriter, decode, trace scroll-driven,
   CTAs honestos. Regras: reduced-motion · sem libs · progressive enhancement
   ========================================================================== */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- nav mobile ---------- */
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  revealEls.forEach((el, i) => el.style.setProperty("--reveal-delay", `${(i % 4) * 70}ms`));

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
    setTimeout(() => revealEls.forEach((el) => el.classList.add("is-visible")), 2000);
  }

  /* ---------- boot log: typewriter honesto (hero + boot final) ---------- */
  function typeBoot(el, failsafe) {
    if (!el || el.dataset.typed) return;
    el.dataset.typed = "1";
    const lines = [...el.querySelectorAll(".boot__line")];
    const texts = lines.map((l) => l.textContent);
    if (reduced.matches) return; // texto fica completo, sem animação
    lines.forEach((l) => (l.textContent = ""));
    let li = 0;
    let ci = 0;
    const tick = () => {
      if (li >= lines.length) return;
      ci++;
      lines[li].textContent = texts[li].slice(0, ci);
      if (ci >= texts[li].length) {
        li++;
        ci = 0;
        setTimeout(tick, 160);
      } else {
        setTimeout(tick, 10 + Math.random() * 20);
      }
    };
    setTimeout(tick, 400);
    // garantia: texto completo mesmo se algo interromper
    setTimeout(() => lines.forEach((l, i) => (l.textContent = texts[i])), failsafe);
  }

  typeBoot(document.getElementById("boot"), 6000);

  /* ---------- scramble/decode no <em> do hero ---------- */
  const decodeEl = document.getElementById("decode");
  if (decodeEl && !reduced.matches) {
    const original = decodeEl.textContent;
    const pool = "!<>-_\\/[]{}=+*^?#";
    const frames = 42;
    let frame = 0;

    const run = () => {
      frame++;
      const solved = Math.floor(original.length * (frame / frames));
      let out = "";
      for (let i = 0; i < original.length; i++) {
        out += i < solved ? original[i] : pool[Math.floor(Math.random() * pool.length)];
      }
      decodeEl.textContent = out;
      if (frame < frames) requestAnimationFrame(run);
      else decodeEl.textContent = original;
    };
    requestAnimationFrame(run);
    setTimeout(() => (decodeEl.textContent = original), 1600);
  }

  /* ---------- trace SVG: o traço de cobre que se desenha com o scroll ---------- */
  const svg = document.getElementById("trace");
  const stops = ["topo", "metodo", "fundacao", "produtos", "ia", "quem", "contato"];

  let tracePath = null;
  let traceGlow = null;
  let traceHead = null;
  let nodeEls = [];
  let nodeYs = [];
  let totalLen = 0;
  let ticking = false;

  const NS = "http://www.w3.org/2000/svg";

  function buildTrace() {
    if (!svg) return;
    const docH = document.documentElement.scrollHeight;
    const narrow = window.innerWidth <= 900;
    const xA = narrow ? 14 : 56;
    const xB = narrow ? 28 : 112;

    svg.setAttribute("width", narrow ? 44 : 160);
    svg.setAttribute("height", docH);
    svg.style.height = `${docH}px`;
    svg.innerHTML = "";

    nodeYs = stops.map((id) => {
      const el = document.getElementById(id);
      if (!el) return 0;
      return Math.round(el.offsetTop + Math.min(240, el.offsetHeight * 0.3));
    });

    // caminho estilo PCB: colunas alternadas com cantos de 45°
    let d = `M ${xA} 72`;
    let cur = xA;
    nodeYs.forEach((y, i) => {
      const target = i % 2 === 0 ? xA : xB;
      if (target !== cur) {
        const dx = Math.abs(target - cur);
        const yCorner = Math.max(72, y - 140);
        d += ` L ${cur} ${yCorner} L ${target} ${yCorner + dx}`;
        cur = target;
      }
      d += ` L ${cur} ${y}`;
    });
    d += ` L ${cur} ${docH - 32}`;

    tracePath = document.createElementNS(NS, "path");
    tracePath.setAttribute("d", d);
    tracePath.setAttribute("class", "trace-path");
    svg.appendChild(tracePath);

    traceGlow = document.createElementNS(NS, "path");
    traceGlow.setAttribute("d", d);
    traceGlow.setAttribute("class", "trace-glow");
    svg.appendChild(traceGlow);

    totalLen = traceGlow.getTotalLength();
    traceGlow.style.strokeDasharray = String(totalLen);
    traceGlow.style.strokeDashoffset = String(totalLen);

    nodeEls = nodeYs.map((y, i) => {
      const x = i % 2 === 0 ? xA : xB;
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", x);
      c.setAttribute("cy", y);
      c.setAttribute("r", narrow ? 4 : 5);
      c.setAttribute("class", "trace-node");
      svg.appendChild(c);
      return c;
    });

    traceHead = document.createElementNS(NS, "circle");
    traceHead.setAttribute("r", narrow ? 3 : 3.5);
    traceHead.setAttribute("class", "trace-head");
    svg.appendChild(traceHead);

    updateTrace();
  }

  function updateTrace() {
    ticking = false;
    if (!svg || !traceGlow) return;

    const docH = document.documentElement.scrollHeight;
    const winH = window.innerHeight;
    const y = window.scrollY;
    const reach = y + winH * 0.55;
    const p = Math.min(1, Math.max(0, reach / (docH || 1)));

    traceGlow.style.strokeDashoffset = String(totalLen * (1 - p));

    if (traceHead) {
      const pt = traceGlow.getPointAtLength(totalLen * p);
      traceHead.setAttribute("cx", pt.x);
      traceHead.setAttribute("cy", pt.y);
    }

    nodeEls.forEach((n, i) => n.classList.toggle("is-lit", nodeYs[i] <= reach));

    // fim da página: o circuito fecha e o boot final é digitado uma vez
    if (p > 0.985) typeBoot(document.getElementById("boot-final"), 4000);

    const toTop = document.getElementById("to-top");
    if (toTop) toTop.hidden = y < 600;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateTrace);
      }
    },
    { passive: true }
  );

  let resizeTimer = 0;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildTrace, 150);
    },
    { passive: true }
  );

  window.addEventListener("load", buildTrace);
  buildTrace();

  /* ---------- surge: o sinal chega na faixa "Mesmo circuito, outra camada." ---------- */
  const drench = document.getElementById("drench");
  let surgeTimer = 0;

  if (drench && "IntersectionObserver" in window) {
    const surgeIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          drench.classList.add("is-surge");
          if (reduced.matches) return; // estado visual fica, sem pulso
          document.body.classList.add("surge");
          window.dispatchEvent(new CustomEvent("board:surge"));
          clearTimeout(surgeTimer);
          surgeTimer = setTimeout(() => document.body.classList.remove("surge"), 1900);
        }),
      { threshold: 0.35 }
    );
    surgeIO.observe(drench);
  } else if (drench) {
    drench.classList.add("is-surge");
  }

  /* ---------- to-top ---------- */
  document.getElementById("to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduced.matches ? "auto" : "smooth" });
  });

  /* ---------- ano no footer ---------- */
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
