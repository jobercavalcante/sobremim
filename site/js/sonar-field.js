(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JoberSonar = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function profile(options) {
    options = options || {};
    var width = Number(options.width) || 0;
    var coarse = Boolean(options.coarse);
    var cores = Number(options.hardwareConcurrency) || 2;
    var disabled = Boolean(options.reducedMotion) || width <= 900;
    return { signals: disabled ? 0 : (cores <= 4 ? 12 : Math.min(24, 12 + Math.floor(cores * 1.5))), dprCap: coarse ? 1.5 : 2 };
  }

  function random(seed) {
    var value = (Number(seed) || 1) >>> 0;
    return function () {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function createSignal(seed, bounds) {
    bounds = bounds || {};
    var width = Math.max(0, Number(bounds.width) || 0);
    var height = Math.max(0, Number(bounds.height) || 0);
    var next = random(seed);
    return { x: next() * width, y: next() * height, speed: 16 + next() * 26, size: 1.5 + next() * 2.5, phase: next() * Math.PI * 2 };
  }

  function mount(container, options) {
    options = options || {};
    if (!container || !container.ownerDocument) return { destroy: function () {} };
    var documentRef = container.ownerDocument;
    var windowRef = documentRef.defaultView;
    if (!windowRef) return { destroy: function () {} };
    var media = options.mediaQuery || windowRef.matchMedia('(prefers-reduced-motion: reduce)');
    var coarseMedia = options.coarseMediaQuery || windowRef.matchMedia('(pointer: coarse)');
    var canvas = documentRef.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-sonar-canvas', '');
    container.appendChild(canvas);
    var context = canvas.getContext('2d');
    var signals = [];
    var frame = null;
    var visible = false;
    var destroyed = false;
    var lastTime = 0;
    var resizeObserver = null;
    var intersectionObserver = null;
    var width = 1;
    var height = 1;
    var dpr = 1;

    function isReduced() { return media.matches; }
    function animationCount() { return profile({ width: windowRef.innerWidth, coarse: coarseMedia.matches, hardwareConcurrency: windowRef.navigator.hardwareConcurrency, reducedMotion: isReduced() }).signals; }

    function resize() {
      var rect = container.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(windowRef.devicePixelRatio || 1, profile({ width: windowRef.innerWidth, coarse: coarseMedia.matches }).dprCap);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = animationCount();
      signals = Array.from({ length: count || 1 }, function (_, index) {
        var signal = createSignal(index + 1, { width: width, height: height });
        signal.match = index === 0;
        if (signal.match) signal.y = height / 2;
        return signal;
      });
      draw(0);
    }

    function draw(time) {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      context.strokeStyle = 'rgba(229, 189, 88, .35)';
      context.setLineDash([3, 5]);
      context.beginPath();
      context.moveTo(width * .05, height / 2);
      context.lineTo(width * .87, height / 2);
      context.stroke();
      context.setLineDash([]);
      var band = Math.max(5, height * .12);
      signals.forEach(function (signal) {
        var match = signal.match && Math.abs(signal.y - height / 2) <= band;
        context.fillStyle = match ? '#E5BD58' : 'rgba(26, 227, 231, .75)';
        context.beginPath();
        context.arc(signal.x, signal.y, signal.size + (match ? 1 : 0), 0, Math.PI * 2);
        context.fill();
      });
    }

    function stop() {
      if (frame !== null) windowRef.cancelAnimationFrame(frame);
      frame = null;
      lastTime = 0;
    }

    function tick(time) {
      frame = null;
      if (destroyed || !visible || documentRef.visibilityState === 'hidden' || isReduced()) return;
      var elapsed = lastTime ? Math.min((time - lastTime) / 1000, .1) : 0;
      lastTime = time;
      signals.forEach(function (signal, index) {
        signal.x += signal.speed * elapsed;
        signal.y += Math.sin(time / 700 + signal.phase) * elapsed * 8;
        if (signal.x > width + signal.size) {
          signals[index] = createSignal(index + 101 + Math.floor(time), { width: width, height: height });
          signals[index].match = index === 0;
          if (signals[index].match) signals[index].y = height / 2;
        }
      });
      draw(time);
      frame = windowRef.requestAnimationFrame(tick);
    }

    function start() {
      if (destroyed || !visible || isReduced() || documentRef.visibilityState === 'hidden' || frame !== null) return;
      frame = windowRef.requestAnimationFrame(tick);
    }

    function onVisibility() { if (documentRef.visibilityState === 'hidden') stop(); else start(); }
    function onMotionChange() { resize(); if (isReduced()) stop(); else start(); }
    function onIntersection(entries) { visible = entries[0] && entries[0].isIntersecting; if (visible) start(); else stop(); }

    resize();
    if (typeof windowRef.ResizeObserver === 'function') { resizeObserver = new windowRef.ResizeObserver(resize); resizeObserver.observe(container); }
    if (typeof windowRef.IntersectionObserver === 'function') { intersectionObserver = new windowRef.IntersectionObserver(onIntersection, { threshold: 0.01 }); intersectionObserver.observe(container); } else { visible = true; start(); }
    documentRef.addEventListener('visibilitychange', onVisibility);
    if (typeof media.addEventListener === 'function') media.addEventListener('change', onMotionChange); else if (typeof media.addListener === 'function') media.addListener(onMotionChange);

    return { canvas: canvas, destroy: function () {
      if (destroyed) return;
      destroyed = true;
      stop();
      documentRef.removeEventListener('visibilitychange', onVisibility);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (typeof media.removeEventListener === 'function') media.removeEventListener('change', onMotionChange); else if (typeof media.removeListener === 'function') media.removeListener(onMotionChange);
      canvas.remove();
    } };
  }

  return { profile: profile, createSignal: createSignal, mount: mount };
}));
