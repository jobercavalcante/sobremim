'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const Sonar = require('../site/js/sonar-field.js');

test('Sonar profile bounds animation population and device pixel ratio', () => {
  assert.deepEqual(Sonar.profile({ width: 1440, coarse: false, hardwareConcurrency: 8, reducedMotion: true }), { signals: 0, dprCap: 2 });
  assert.deepEqual(Sonar.profile({ width: 900, coarse: false, hardwareConcurrency: 8, reducedMotion: false }), { signals: 0, dprCap: 2 });
  assert.deepEqual(Sonar.profile({ width: 1440, coarse: false, hardwareConcurrency: 2, reducedMotion: false }), { signals: 12, dprCap: 2 });
  const strong = Sonar.profile({ width: 1440, coarse: false, hardwareConcurrency: 8, reducedMotion: false });
  assert.ok(strong.signals > 12 && strong.signals <= 24);
  assert.equal(strong.dprCap, 2);
  assert.equal(Sonar.profile({ width: 1440, coarse: true, hardwareConcurrency: 8, reducedMotion: false }).dprCap, 1.5);
});

test('Sonar signals are deterministic and always start in the supplied bounds', () => {
  const bounds = { width: 320, height: 70 };
  const first = Sonar.createSignal(42, bounds);
  const second = Sonar.createSignal(42, bounds);
  assert.deepEqual(first, second);
  assert.ok(first.x >= 0 && first.x <= bounds.width);
  assert.ok(first.y >= 0 && first.y <= bounds.height);
});

test('Sonar cancels its animation when ResizeObserver crosses into mobile and never requeues it', () => {
  let viewportWidth = 1440;
  let resizeCallback;
  let intersectionCallback;
  let nextFrame = 0;
  let removedDocumentListeners = 0;
  let removedMediaListeners = 0;
  let disconnectedObservers = 0;
  const frames = new Map();
  const cancelled = [];
  const context = { clearRect() {}, setLineDash() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, arc() {}, fill() {}, setTransform() {} };
  const canvas = { style: {}, setAttribute() {}, getContext: () => context, remove() { this.removed = true; } };
  const documentRef = {
    visibilityState: 'visible',
    addEventListener() {}, removeEventListener() { removedDocumentListeners += 1; },
    createElement: () => canvas,
  };
  const media = { matches: false, addEventListener() {}, removeEventListener() { removedMediaListeners += 1; } };
  const coarse = { matches: false };
  const windowRef = {
    get innerWidth() { return viewportWidth; }, devicePixelRatio: 1, navigator: { hardwareConcurrency: 8 },
    matchMedia: () => media,
    requestAnimationFrame(callback) { nextFrame += 1; frames.set(nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { cancelled.push(id); frames.delete(id); },
    ResizeObserver: class { constructor(callback) { resizeCallback = callback; } observe() {} disconnect() { disconnectedObservers += 1; } },
    IntersectionObserver: class { constructor(callback) { intersectionCallback = callback; } observe() {} disconnect() { disconnectedObservers += 1; } },
  };
  documentRef.defaultView = windowRef;
  const container = { ownerDocument: documentRef, appendChild() {}, getBoundingClientRect: () => ({ width: 320, height: 70 }) };
  const controller = Sonar.mount(container, { mediaQuery: media, coarseMediaQuery: coarse });

  intersectionCallback([{ isIntersecting: true }]);
  const firstId = nextFrame;
  const firstTick = frames.get(firstId);
  frames.delete(firstId);
  firstTick(16);
  const runningId = nextFrame;
  assert.ok(frames.has(runningId), 'desktop schedules a follow-up frame');

  viewportWidth = 900;
  resizeCallback();
  assert.ok(cancelled.includes(runningId), 'mobile resize cancels the outstanding frame');
  assert.equal(frames.size, 0, 'mobile resize leaves no animation frame pending');
  firstTick(32);
  assert.equal(frames.size, 0, 'a stale desktop callback cannot restart animation on mobile');

  controller.destroy();
  assert.equal(canvas.removed, true, 'destroy removes the canvas after lifecycle changes');
  assert.equal(disconnectedObservers, 2, 'destroy disconnects both observers');
  assert.equal(removedDocumentListeners, 1, 'destroy removes the visibility listener');
  assert.equal(removedMediaListeners, 1, 'destroy removes the motion listener');
});
