(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JoberCircuit = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function progress(scrollY, viewportHeight, documentHeight) {
    var range = documentHeight - viewportHeight;
    return range <= 0 ? 1 : clamp(scrollY / range, 0, 1);
  }

  function stageIndex(value, thresholds) {
    var index = 0;
    for (var current = 0; current < thresholds.length; current += 1) {
      if (value >= thresholds[current]) index = current;
    }
    return index;
  }

  function mount(options) {
    options = options || {};
    var documentRef = options.document || (typeof document !== 'undefined' ? document : null);
    var windowRef = options.window || (typeof window !== 'undefined' ? window : null);
    if (!documentRef || !windowRef) return { update: function () {}, destroy: function () {} };

    var rootElement = options.root || documentRef.documentElement;
    var path = options.path || documentRef.querySelector('[data-circuit-path]');
    var stages = options.stages || Array.prototype.slice.call(documentRef.querySelectorAll('[data-circuit-stage]'));
    var progressElement = options.progressElement || documentRef.querySelector('[data-scroll-progress]');
    var progressText = progressElement && progressElement.querySelector('span');
    var mediaQuery = options.mediaQuery || windowRef.matchMedia('(prefers-reduced-motion: reduce)');
    var pathLength = 0;
    var frameId = null;
    var resizeTimer = null;
    var destroyed = false;
    var scrolling = false;
    var thresholds = options.thresholds || stages.map(function (_, index) {
      return stages.length <= 1 ? 0 : index / (stages.length - 1);
    });

    function documentHeight() {
      var body = documentRef.body || {};
      var documentElement = documentRef.documentElement || {};
      return Math.max(body.scrollHeight || 0, documentElement.scrollHeight || 0, documentElement.offsetHeight || 0);
    }

    function measure() {
      pathLength = path && typeof path.getTotalLength === 'function' ? path.getTotalLength() : 0;
      if (path && pathLength > 0) path.style.strokeDasharray = String(pathLength);
    }

    function render(value) {
      var safeProgress = clamp(value, 0, 1);
      rootElement.style.setProperty('--scroll-progress', String(safeProgress));
      rootElement.style.setProperty('--circuit-progress', String(safeProgress));
      if (path && pathLength > 0) path.style.strokeDashoffset = String(pathLength * (1 - safeProgress));
      if (progressText) progressText.textContent = 'Decisões em percurso · ' + Math.round(safeProgress * 100) + '%';
      var active = stageIndex(safeProgress, thresholds);
      stages.forEach(function (stage, index) { stage.classList.toggle('is-current', index === active); });
    }

    function currentProgress() {
      return progress(windowRef.scrollY || windowRef.pageYOffset || 0, windowRef.innerHeight || 0, documentHeight());
    }

    function update() {
      if (destroyed) return;
      render(mediaQuery.matches ? 1 : currentProgress());
    }

    function cancelFrame() {
      if (frameId !== null) {
        windowRef.cancelAnimationFrame(frameId);
        frameId = null;
      }
    }

    function onScroll() {
      if (destroyed || mediaQuery.matches || documentRef.visibilityState === 'hidden' || frameId !== null) return;
      frameId = windowRef.requestAnimationFrame(function () {
        frameId = null;
        if (documentRef.visibilityState !== 'hidden') update();
      });
    }

    function removeScroll() {
      if (!scrolling) return;
      windowRef.removeEventListener('scroll', onScroll);
      scrolling = false;
      cancelFrame();
    }

    function addScroll() {
      if (scrolling || destroyed || mediaQuery.matches) return;
      windowRef.addEventListener('scroll', onScroll, { passive: true });
      scrolling = true;
    }

    function onResize() {
      if (resizeTimer !== null) windowRef.clearTimeout(resizeTimer);
      resizeTimer = windowRef.setTimeout(function () {
        resizeTimer = null;
        if (!destroyed) {
          measure();
          update();
        }
      }, 100);
    }

    function onVisibilityChange() {
      if (documentRef.visibilityState === 'hidden') cancelFrame();
    }

    function onMotionChange() {
      if (destroyed) return;
      if (mediaQuery.matches) {
        removeScroll();
        rootElement.classList.add('is-static');
      } else {
        rootElement.classList.remove('is-static');
        addScroll();
      }
      update();
    }

    measure();
    if (mediaQuery.matches) rootElement.classList.add('is-static');
    else addScroll();
    windowRef.addEventListener('resize', onResize);
    documentRef.addEventListener('visibilitychange', onVisibilityChange);
    if (typeof mediaQuery.addEventListener === 'function') mediaQuery.addEventListener('change', onMotionChange);
    else if (typeof mediaQuery.addListener === 'function') mediaQuery.addListener(onMotionChange);
    update();
    rootElement.classList.add('circuit-ready');

    return {
      update: update,
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        removeScroll();
        windowRef.removeEventListener('resize', onResize);
        documentRef.removeEventListener('visibilitychange', onVisibilityChange);
        if (resizeTimer !== null) windowRef.clearTimeout(resizeTimer);
        if (typeof mediaQuery.removeEventListener === 'function') mediaQuery.removeEventListener('change', onMotionChange);
        else if (typeof mediaQuery.removeListener === 'function') mediaQuery.removeListener(onMotionChange);
        rootElement.classList.remove('circuit-ready');
        rootElement.classList.remove('is-static');
      },
    };
  }

  return { clamp: clamp, progress: progress, stageIndex: stageIndex, mount: mount };
}));
