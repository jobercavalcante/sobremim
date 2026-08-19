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
