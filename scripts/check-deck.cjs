const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const dataPath = path.join(root, "datos/justicia-juvenil.json");
const htmlPath = path.join(root, "presentacion.html");
const cssPath = path.join(root, "assets/presentacion.css");
const jsPath = path.join(root, "assets/presentacion.js");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");

const sum = (values) => values.reduce((total, value) => total + value, 0);
const total = data.categories.find((category) => category.id === "total");
const fiscalia = data.fiscalia || {};
const activity = Array.isArray(fiscalia.activity) ? fiscalia.activity : [];
const byActivity = new Map(activity.map((item) => [item.id, item]));
const territory = (id) => data.territories.find((item) => item.id === id);

assert.equal(total.total, 24279, "El total de infracciones debe ser 24.279");
assert.equal(data.territories.length, 19, "Deben existir 19 territorios");
assert.equal(sum(data.territories.map((item) => item.total)), 24279, "Los territorios deben sumar 24.279");
assert.equal(
  sum(data.territories.filter((item) => item.subset).map((item) => item.total)),
  7229,
  "El foco editorial de ocho territorios debe sumar 7.229"
);

assert.equal(fiscalia.year, 2025, "El bloque fiscalia debe declarar 2025");
assert.equal(fiscalia.source, "fge", "El bloque fiscalia debe apuntar a la fuente FGE");
assert.ok(data.sources[fiscalia.source], "La fuente FGE debe existir en sources");
assert.equal(activity.length, 3, "Deben existir tres macrocifras de Fiscalía");

const expectedActivity = [
  ["diligencias", 74538, 10.6, "diligencias"],
  ["reforma", 26084, 5.4, "expedientes"],
  ["ejecucion", 14072, 4.2, "expedientes"]
];

for (const [id, value, changePct, unit] of expectedActivity) {
  const item = byActivity.get(id);
  assert.ok(item, "Falta la actividad de Fiscalía: " + id);
  assert.equal(item.value, value, "Valor inesperado para " + id);
  assert.equal(item.changePct, changePct, "Variación inesperada para " + id);
  assert.equal(item.unit, unit, "Unidad inesperada para " + id);
}

assert.match(
  fiscalia.scope || "",
  /unidades distintas/i,
  "El bloque fiscalia debe advertir que las unidades son distintas"
);
assert.match(
  fiscalia.scope || "",
  /no sumar/i,
  "El bloque fiscalia debe advertir que no se suman"
);

const expectedTerritories = [
  [1, 4028, 10.0],
  [9, 3884, 10.6],
  [13, 2148, 6.9],
  [7, 1534, 17.1]
];

for (const [id, count, rate] of expectedTerritories) {
  const item = territory(id);
  assert.ok(item, "Falta el territorio " + id);
  assert.equal(item.total, count, "Recuento inesperado para el territorio " + id);
  assert.equal(item.rate, rate, "Tasa inesperada para el territorio " + id);
}

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/data.js"), "utf8"), context);
assert.equal(
  JSON.stringify(context.window.JUSTICIA_DATA),
  JSON.stringify(data),
  "assets/data.js debe coincidir con el JSON"
);

const slideCount = (html.match(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"/g) || []).length;
assert.equal(slideCount, 7, "La presentación debe contener siete diapositivas");
assert.match(html, /href="madrid\.html"/, "La presentación debe enlazar la demo de Madrid");
assert.match(html, /Datos ficticios/, "La demostración debe identificar su naturaleza");
assert.match(html, /lang="es"/, "El documento debe declarar español");
assert.match(html, /id="deck"/, "Falta el contenedor de la presentación");
assert.match(html, /id="prev"/, "Falta el control anterior");
assert.match(html, /id="next"/, "Falta el control siguiente");
assert.match(html, /id="fullscreen"/, "Falta el control de pantalla completa");
assert.match(html, /href="index\.html"/, "Falta el enlace local al dossier");
assert.match(html, /id="fiscalia-metrics"/, "Falta el contenedor de Fiscalía");
assert.match(html, /id="bars-count"/, "Falta el panel de recuentos");
assert.match(html, /id="bars-rate"/, "Falta el panel de tasas");
assert.match(html, /Expedientes de ejecución/, "Debe usarse la denominación expedientes de ejecución");
assert.doesNotMatch(html, /Medidas\s+en\s+Ejecución/i, "No debe usarse la denominación medidas en ejecución");
assert.match(html, /No se suman ni forman un embudo/, "Falta la advertencia de no sumar");
assert.match(html, /Lugar de condena; no residencia ni lugar de comisión/, "Falta el alcance territorial");
assert.ok((html.match(/data-total/g) || []).length >= 2, "El total debe ser un dato compartido, no una cifra suelta");
assert.doesNotMatch(html, /74\.538|26\.084|14\.072/, "Las cifras de Fiscalía deben proceder del JSON, no del HTML");
assert.doesNotMatch(
  html,
  /<script[^>]+src="https?:|<link[^>]+href="https?:/i,
  "La presentación no debe cargar recursos remotos"
);

assert.match(js, /data\.fiscalia\.activity/, "El guion debe leer la actividad de Fiscalía del JSON");
assert.match(js, /data\.territories/, "El guion debe leer los territorios del JSON");
assert.match(js, /requestFullscreen/, "Falta la activación de pantalla completa");
assert.match(js, /pushState/, "Falta el estado de navegación por URL");
assert.match(js, /ArrowRight/, "Falta la navegación por teclado");
assert.match(js, /__DECK__/, "Falta el punto de inspección para pruebas");

assert.match(css, /\.deck\s*\{/, "Falta el escenario fijo de la presentación");
assert.match(css, /transform:\s*translate\(-50%,\s*-50%\)\s*scale/, "El escenario debe escalar sin reflow");
assert.match(css, /@media\s+print/, "Falta la adaptación de impresión");
assert.match(css, /prefers-reduced-motion/, "Falta la preferencia de movimiento reducido");

new vm.Script(js);

console.log(
  "OK: presentación de 7 diapositivas, contexto público y demostración ficticia, Fiscalía 74.538/26.084/14.072, " +
  "territorios 4.028/3.884/2.148/1.534 y tasas 10,0/10,6/6,9/17,1."
);
