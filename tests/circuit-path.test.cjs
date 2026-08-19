'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const circuit = require('../site/js/circuit-path.js');

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
