/* ==========================================================================
   script.js · nav, reveals, boot typewriter, decode, trace scroll-driven,
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
  function typeBoot(el, failsafe, onDone) {
    if (!el || el.dataset.typed) return;
    el.dataset.typed = "1";
    const lines = [...el.querySelectorAll(".boot__line")];
    const texts = lines.map((l) => l.textContent);
    let fired = false;
    const finish = () => {
      if (fired) return;
      fired = true;
      lines.forEach((l, i) => (l.textContent = texts[i]));
      onDone?.();
    };
    if (reduced.matches) { finish(); return; } // texto completo, sem animação
    lines.forEach((l) => (l.textContent = ""));
    let li = 0;
    let ci = 0;
    const tick = () => {
      if (li >= lines.length) { finish(); return; }
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
    // garantia: texto completo (e circuito fechado) mesmo se algo interromper
    setTimeout(finish, failsafe);
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
  const stops = ["topo", "metodo", "fundacao", "bancada", "ia", "quem", "contato"];

  let tracePath = null;
  let traceGlow = null;
  let traceHead = null;
  let nodeEls = [];
  let nodeYs = [];
  let totalLen = 0;
  let ticking = false;
  let lastP = 0;         // progresso atual do sinal (usado pelo pulso final)
  let circuitDone = false; // circuito fechado: estado permanente

  const NS = "http://www.w3.org/2000/svg";

  function buildTrace() {
    if (!svg) return;
    const docH = document.documentElement.scrollHeight;
    const narrow = window.innerWidth <= 900;
    const xA = narrow ? 8 : 56;
    const xB = narrow ? window.innerWidth - 8 : 112;

    svg.setAttribute("width", narrow ? String(window.innerWidth) : "160");
    svg.setAttribute("height", docH);
    svg.style.height = `${docH}px`;
    svg.innerHTML = "";

    // topo e fim de cada seção: no mobile as travessias usam a folga
    // entre seções (nunca dentro de caixas ou sobre textos)
    const secTop = stops.map((id) => document.getElementById(id)?.offsetTop ?? 0);
    const secBot = stops.map((id) => {
      const el = document.getElementById(id);
      return el ? el.offsetTop + el.offsetHeight : 0;
    });

    nodeYs = stops.map((id) => {
      const el = document.getElementById(id);
      if (!el) return 0;
      return Math.round(el.offsetTop + Math.min(240, el.offsetHeight * 0.3));
    });

    // caminho estilo PCB: colunas alternadas com cantos de 45°
    // (mobile: bordas da tela, travessia reta na folga entre seções)
    let d = `M ${xA} 72`;
    let cur = xA;
    nodeYs.forEach((y, i) => {
      const target = i % 2 === 0 ? xA : xB;
      if (target !== cur) {
        const dx = Math.abs(target - cur);
        if (narrow) {
          const yMid = Math.max(72, Math.round((secBot[i - 1] + secTop[i]) / 2));
          d += ` L ${cur} ${yMid} L ${target} ${yMid}`;
        } else {
          const yCorner = Math.max(72, y - 140);
          d += ` L ${cur} ${yCorner} L ${target} ${yCorner + dx}`;
        }
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
    lastP = circuitDone ? 1 : p; // depois de fechado, o traço fica completo

    traceGlow.style.strokeDashoffset = String(totalLen * (1 - lastP));

    if (traceHead) {
      const pt = traceGlow.getPointAtLength(totalLen * lastP);
      traceHead.setAttribute("cx", pt.x);
      traceHead.setAttribute("cy", pt.y);
    }

    nodeEls.forEach((n, i) =>
      n.classList.toggle("is-lit", circuitDone || nodeYs[i] <= reach)
    );

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

  /* ---------- circuito fechado: o sinal chega ao conector (#contato) ---------- */
  function completeCircuit() {
    if (circuitDone) return;
    if (!svg || !traceGlow) {
      // traço ainda não construído (âncora direta no load): tenta de novo
      window.addEventListener("load", () => completeCircuit(), { once: true });
      return;
    }
    circuitDone = true;
    svg.classList.add("is-complete");
    document.body.classList.add("circuit-closed");
    nodeEls.forEach((n) => n.classList.add("is-lit"));

    // reduced-motion: estado instantâneo, sem pulso viajando
    if (reduced.matches) {
      traceGlow.style.strokeDashoffset = "0";
      if (traceHead) {
        const pt = traceGlow.getPointAtLength(totalLen);
        traceHead.setAttribute("cx", pt.x);
        traceHead.setAttribute("cy", pt.y);
      }
      return;
    }

    // pulso ciano viaja da posição atual do sinal até o último nó
    const pulse = document.createElementNS(NS, "circle");
    pulse.setAttribute("class", "trace-pulse");
    pulse.setAttribute("r", window.innerWidth <= 900 ? "4" : "5");
    svg.appendChild(pulse);

    const from = totalLen * lastP;
    const dur = 900;
    const t0 = performance.now();

    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3); // ease-out
      const len = from + (totalLen - from) * e;
      traceGlow.style.strokeDashoffset = String(totalLen - len);
      const pt = traceGlow.getPointAtLength(len);
      pulse.setAttribute("cx", pt.x);
      pulse.setAttribute("cy", pt.y);
      if (traceHead) {
        traceHead.setAttribute("cx", pt.x);
        traceHead.setAttribute("cy", pt.y);
      }
      if (k < 1) {
        requestAnimationFrame(step);
      } else {
        pulse.remove();
        window.dispatchEvent(new CustomEvent("board:surge")); // placa responde
        updateTrace();
      }
    };
    requestAnimationFrame(step);
  }

  const contato = document.getElementById("contato");

  // cta-chip: o co-processador do conector acorda e responde no prompt jober.os
  function wakeCtaChip() {
    const ctaChip = document.getElementById("cta-chip");
    if (!ctaChip || ctaChip.dataset.live) return;
    ctaChip.dataset.live = "1";
    ctaChip.classList.add("is-live");
    const txt = ctaChip.querySelector(".cta-chip__text");
    if (!txt) return;
    const msgs = ["sinal recebido", "processando problema", "pronto para o próximo"];
    if (reduced.matches) {
      txt.textContent = msgs[msgs.length - 1];
      return;
    }
    const type = (msg, cb) => {
      txt.textContent = "";
      let ci = 0;
      const t = setInterval(() => {
        ci++;
        txt.textContent = msg.slice(0, ci);
        if (ci >= msg.length) {
          clearInterval(t);
          setTimeout(cb, 600);
        }
      }, 42);
    };
    let phase = 0;
    const run = () => {
      if (phase >= msgs.length) return;
      type(msgs[phase], () => { phase++; run(); });
    };
    // o boot final começa a digitar primeiro; o CI responde em seguida
    setTimeout(run, 900);
  }

  if (contato && "IntersectionObserver" in window) {
    const contatoIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          wakeCtaChip();
          // boot final digita; o circuito fecha no instante em que termina
          typeBoot(document.getElementById("boot-final"), 4000, completeCircuit);
          contatoIO.disconnect();
        }),
      { threshold: 0.2 }
    );
    contatoIO.observe(contato);
  } else {
    wakeCtaChip();
    typeBoot(document.getElementById("boot-final"), 4000, completeCircuit);
  }

  /* ---------- to-top ---------- */
  document.getElementById("to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduced.matches ? "auto" : "smooth" });
  });

  /* ---------- ano no footer ---------- */
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
