'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../../assets/madrid.js');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '../../datos/poc-madrid/operativo.json'), 'utf8'));

test('la cohorte inexistente 2099 devuelve una selección vacía', () => {
  const state = { ...api.defaults, year: '2099' };
  const cohort = api.selection(D, state);
  assert.deepStrictEqual(cohort, []);
  assert.strictEqual(Array.isArray(cohort), true);
});

test('los totales sobre una selección vacía son los seis contadores a cero', () => {
  const state = { ...api.defaults, year: '2099' };
  assert.deepStrictEqual(api.totals([], D, state), {
    expedientes: 0,
    hechos: 0,
    pendientes: 0,
    sentencias: 0,
    infracciones: 0,
    medidas: 0
  });
  const cohort = api.selection(D, state);
  assert.deepStrictEqual(api.totals(cohort, D, state), api.totals([], D, state));
});

test('selection y totals no modifican sus entradas', () => {
  const state = { ...api.defaults, year: '2099' };
  const estadoInicial = JSON.stringify(D);
  api.selection(D, state);
  api.totals([], D, state);
  api.totals(api.selection(D, state), D, state);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(D)), JSON.parse(estadoInicial));
  const snapshot = D.casos.map(c => JSON.stringify(c));
  api.selection(D, state);
  api.totals([], D, state);
  assert.deepStrictEqual(D.casos.map(c => JSON.stringify(c)), snapshot);
});
