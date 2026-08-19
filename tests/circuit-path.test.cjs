'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const circuit = require('../site/js/circuit-path.js');

function createClassList(onAdd) {
  const values = new Set();
  return {
    add(value) {
      if (onAdd) onAdd(value);
      values.add(value);
    },
    remove(value) { values.delete(value); },
    toggle(value, force) {
      if (force) values.add(value);
      else values.delete(value);
    },
    contains(value) { return values.has(value); },
  };
}

function createHarness({ reduced = false, legacyMedia = false } = {}) {
  const windowListeners = new Map();
  const documentListeners = new Map();
  const windowAdds = [];
  const windowRemoves = [];
  const documentRemoves = [];
  const frames = new Map();
  const cancelledFrames = [];
  const timers = new Map();
  const clearedTimers = [];
  let nextFrame = 1;
  let nextTimer = 1;
  let readyState;
  const root = {
    scrollHeight: 2400,
    offsetHeight: 2400,
    style: {
      values: new Map(),
      setProperty(name, value) { this.values.set(name, value); },
    },
  };
  const path = {
    measures: 0,
    style: {},
    getTotalLength() { this.measures += 1; return 760; },
  };
  const stages = Array.from({ length: 5 }, () => ({ classList: createClassList() }));
  const span = { textContent: 'Decisões em percurso' };
  const progressElement = { querySelector(selector) { return selector === 'span' ? span : null; } };
  root.classList = createClassList((value) => {
    if (value === 'circuit-ready') {
      readyState = {
        dasharray: path.style.strokeDasharray,
        dashoffset: path.style.strokeDashoffset,
        circuitProgress: root.style.values.get('--circuit-progress'),
        scrollProgress: root.style.values.get('--scroll-progress'),
        label: span.textContent,
      };
    }
  });
  const mediaListeners = new Set();
  const mediaQuery = { matches: reduced };
  if (legacyMedia) {
    mediaQuery.addListener = (listener) => mediaListeners.add(listener);
    mediaQuery.removeListener = (listener) => mediaListeners.delete(listener);
  } else {
    mediaQuery.addEventListener = (type, listener) => { if (type === 'change') mediaListeners.add(listener); };
    mediaQuery.removeEventListener = (type, listener) => { if (type === 'change') mediaListeners.delete(listener); };
  }
  const windowRef = {
    scrollY: 400,
    innerHeight: 800,
    addEventListener(type, listener, options) {
      windowAdds.push({ type, listener, options });
      windowListeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      windowRemoves.push({ type, listener });
      if (windowListeners.get(type) === listener) windowListeners.delete(type);
    },
    requestAnimationFrame(callback) {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) { cancelledFrames.push(id); frames.delete(id); },
    setTimeout(callback) {
      const id = nextTimer++;
      timers.set(id, callback);
      return id;
    },
    clearTimeout(id) { clearedTimers.push(id); timers.delete(id); },
  };
  const documentRef = {
    body: { scrollHeight: 2400 },
    documentElement: root,
    visibilityState: 'visible',
    addEventListener(type, listener) { documentListeners.set(type, listener); },
    removeEventListener(type, listener) {
      documentRemoves.push({ type, listener });
      if (documentListeners.get(type) === listener) documentListeners.delete(type);
    },
  };
  function dispatchWindow(type) { windowListeners.get(type)(); }
  function dispatchDocument(type) { documentListeners.get(type)(); }
  function changeMotion(matches) {
    mediaQuery.matches = matches;
    mediaListeners.forEach((listener) => listener({ matches }));
  }
  function runTimers() {
    [...timers.entries()].forEach(([id, callback]) => { timers.delete(id); callback(); });
  }
  return {
    documentRef, windowRef, root, path, stages, span, progressElement, mediaQuery,
    windowAdds, windowRemoves, documentRemoves, frames, cancelledFrames, timers, clearedTimers,
    get readyState() { return readyState; }, dispatchWindow, dispatchDocument, changeMotion, runTimers,
    mediaListenerCount() { return mediaListeners.size; },
  };
}

test('clamp constrains values to its inclusive bounds', () => {
  assert.equal(circuit.clamp(-4, 0, 1), 0);
  assert.equal(circuit.clamp(0.4, 0, 1), 0.4);
  assert.equal(circuit.clamp(8, 0, 1), 1);
});

test('progress is clamped across the scroll range', () => {
  assert.equal(circuit.progress(-20, 800, 2400), 0);
  assert.equal(circuit.progress(800, 800, 2400), 0.5);
  assert.equal(circuit.progress(4000, 800, 2400), 1);
  assert.equal(circuit.progress(20, 800, 800), 1);
});

test('stageIndex selects the last reached threshold', () => {
  const thresholds = [0, 0.25, 0.5, 0.75, 1];
  assert.equal(circuit.stageIndex(0, thresholds), 0);
  assert.equal(circuit.stageIndex(0.499, thresholds), 1);
  assert.equal(circuit.stageIndex(0.5, thresholds), 2);
  assert.equal(circuit.stageIndex(4, thresholds), 4);
});

test('mount establishes a valid circuit state before ready, throttles scroll, debounces resize, and tears down', () => {
  const harness = createHarness();
  const controller = circuit.mount({
    document: harness.documentRef,
    window: harness.windowRef,
    root: harness.root,
    path: harness.path,
    stages: harness.stages,
    progressElement: harness.progressElement,
    mediaQuery: harness.mediaQuery,
  });

  assert.deepEqual(harness.readyState, {
    dasharray: '760', dashoffset: '570', circuitProgress: '0.25', scrollProgress: '0.25', label: 'Decisões em percurso · 25%',
  }, 'ready gate follows a complete initial render');
  assert.equal(harness.root.classList.contains('circuit-ready'), true);
  const scrollAdd = harness.windowAdds.find((entry) => entry.type === 'scroll');
  assert.deepEqual(scrollAdd.options, { passive: true }, 'scroll listener must be passive');

  harness.dispatchWindow('scroll');
  harness.dispatchWindow('scroll');
  assert.equal(harness.frames.size, 1, 'multiple scrolls queue only one frame');
  harness.documentRef.visibilityState = 'hidden';
  harness.dispatchDocument('visibilitychange');
  assert.equal(harness.frames.size, 0, 'visibility change cancels queued work');
  harness.dispatchWindow('scroll');
  assert.equal(harness.frames.size, 0, 'hidden tabs do not queue scroll work');
  harness.documentRef.visibilityState = 'visible';

  harness.dispatchWindow('resize');
  harness.dispatchWindow('resize');
  assert.equal(harness.timers.size, 1, 'resize work is debounced');
  assert.equal(harness.clearedTimers.length, 1, 'superseded resize timeout is cleared');
  harness.windowRef.scrollY = 800;
  harness.runTimers();
  assert.equal(harness.path.measures, 2, 'resize remeasures the path once');
  assert.equal(harness.root.style.values.get('--circuit-progress'), '0.5', 'resize updates the rendered progress');

  harness.dispatchWindow('scroll');
  harness.dispatchWindow('resize');
  const queuedFrame = [...harness.frames.keys()][0];
  const queuedTimer = [...harness.timers.keys()][0];
  controller.destroy();
  assert.ok(harness.cancelledFrames.includes(queuedFrame), 'destroy cancels a pending animation frame');
  assert.ok(harness.clearedTimers.includes(queuedTimer), 'destroy cancels a pending resize timeout');
  assert.deepEqual(harness.windowRemoves.map((entry) => entry.type).sort(), ['resize', 'scroll']);
  assert.deepEqual(harness.documentRemoves.map((entry) => entry.type), ['visibilitychange']);
  assert.equal(harness.mediaListenerCount(), 0, 'destroy removes the media-query listener');
  assert.equal(harness.root.classList.contains('circuit-ready'), false);
  assert.equal(harness.root.classList.contains('is-static'), false);
});

test('reduced motion uses the static final state and modern media changes manage scroll listeners', () => {
  const harness = createHarness({ reduced: true });
  const controller = circuit.mount({
    document: harness.documentRef, window: harness.windowRef, root: harness.root, path: harness.path,
    stages: harness.stages, progressElement: harness.progressElement, mediaQuery: harness.mediaQuery,
  });

  assert.equal(harness.windowAdds.some((entry) => entry.type === 'scroll'), false, 'reduced motion does not register scrolling');
  assert.equal(harness.root.style.values.get('--circuit-progress'), '1');
  assert.equal(harness.path.style.strokeDashoffset, '0');
  assert.equal(harness.root.classList.contains('is-static'), true);
  harness.changeMotion(false);
  assert.equal(harness.windowAdds.filter((entry) => entry.type === 'scroll').length, 1, 'motion enabled adds one scroll listener');
  assert.equal(harness.root.classList.contains('is-static'), false);
  harness.changeMotion(true);
  assert.equal(harness.windowRemoves.filter((entry) => entry.type === 'scroll').length, 1, 'reduced motion removes scrolling');
  assert.equal(harness.root.classList.contains('is-static'), true);
  controller.destroy();
});

test('legacy media-query listeners are removed during destroy', () => {
  const harness = createHarness({ legacyMedia: true });
  const controller = circuit.mount({
    document: harness.documentRef, window: harness.windowRef, root: harness.root, path: harness.path,
    stages: harness.stages, progressElement: harness.progressElement, mediaQuery: harness.mediaQuery,
  });

  assert.equal(harness.mediaListenerCount(), 1);
  harness.changeMotion(true);
  assert.equal(harness.root.classList.contains('is-static'), true);
  controller.destroy();
  assert.equal(harness.mediaListenerCount(), 0);
});
