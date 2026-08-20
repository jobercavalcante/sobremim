/* ==========================================================================
   glitch-fx.js · resposta visual ao evento "screen:glitch" (terminal jober.os).
   Tilt de tela + fringes RGB + ruído ~850ms; reduced-motion → 1 frame estático.
   Regras: zero deps · ignora aba oculta · mesmo padrão de evento do board-fx.js
   ========================================================================== */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const DUR = 850;

  // ruído procedural em data URI (zero deps) — textura dos cortes RGB
  const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

  let active = false;

  window.addEventListener("screen:glitch", () => {
    if (active || document.hidden) return;
    active = true;

    const overlay = document.createElement("div");
    overlay.id = "glitch-overlay";
    overlay.style.backgroundImage = NOISE;
    document.body.appendChild(overlay);

    if (reduced.matches) {
      // reduced-motion: estado estático por 1 frame, sem animação
      overlay.classList.add("is-static");
      window.setTimeout(() => overlay.classList.remove("is-static"), 450);
    } else {
      document.body.classList.add("is-glitching");
      window.setTimeout(() => document.body.classList.remove("is-glitching"), DUR);
    }

    window.setTimeout(() => {
      overlay.remove();
      active = false;
    }, DUR);
  });
})();
