'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../../assets/madrid.js');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '../../datos/poc-madrid/operativo.json'), 'utf8'));

const state2099 = () => ({ ...api.defaults, year: '2099' });

test('la cohorte inexistente 2099 devuelve una selección vacía', () => {
  const cohort = api.selection(D, state2099());
  assert.strictEqual(Array.isArray(cohort), true);
  assert.deepStrictEqual(cohort, []);
});

test('los totales sobre una selección vacía son los seis contadores a cero', () => {
  const state = state2099();
  const esperado = {
    expedientes: 0,
    hechos: 0,
    pendientes: 0,
    sentencias: 0,
    infracciones: 0,
    medidas: 0
  };
  const vacios = [api.totals([], D, state)];
  const cohort = api.selection(D, state);
  assert.deepStrictEqual(cohort, []);
  vacios.push(api.totals(cohort, D, state));
  assert.deepStrictEqual(vacios[0], esperado);
  assert.deepStrictEqual(vacios[1], esperado);
  for (const clave of Object.keys(esperado)) {
    assert.strictEqual(vacios[0][clave], 0, `contador ${clave} debe ser 0`);
    assert.strictEqual(vacios[1][clave], 0, `contador ${clave} debe ser 0`);
  }
});

test('selection y totals no modifican sus entradas ni el estado', () => {
  const state = state2099();
  const snapshotDatos = structuredClone(D);
  const snapshotEstado = structuredClone(state);
  const snapshotCasos = structuredClone(D.casos);

  api.selection(D, state);
  api.totals([], D, state);
  api.totals(api.selection(D, state), D, state);

  assert.deepStrictEqual(D, snapshotDatos, 'los datos no deben mutarse');
  assert.deepStrictEqual(state, snapshotEstado, 'el estado no debe mutarse');
  assert.deepStrictEqual(D.casos, snapshotCasos, 'cada caso debe quedar intacto');
});
