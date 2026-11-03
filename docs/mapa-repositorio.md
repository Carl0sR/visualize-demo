# Mapa del repositorio

Guía breve para orientarse en el proyecto. Toma como referencia de solo lectura `README.md` y `package.json`.

## Entradas

- `index.html`: entrada principal del dossier interactivo.
- `madrid.html`: laboratorio territorial de Madrid con expedientes ficticios.
- `presentacion.html`: modo presentación de siete diapositivas.

## Datos oficiales y datos ficticios

Los datos oficiales viven en `datos/justicia-juvenil.json`, `datos/original-pptx.json` y los extractos `datos/origen/ine-26027-2025.csv` a `datos/origen/ine-26030-2025.csv`.

Los expedientes sintéticos del laboratorio de Madrid se guardan solo en `datos/poc-madrid/`. No se mezclan con las estadísticas oficiales.

## Recursos generados

No editar a mano estos archivos; se generan con los scripts indicados:

- `assets/data.js`: generado con `python3 scripts/build-data.py`.
- `assets/madrid-data.js`: generado con `python3 scripts/build-madrid.py`.

## Comprobaciones

- `node scripts/check-data.cjs` (o `npm test`): integridad de los datos del dossier.
- `node scripts/check-deck.cjs` (o `npm run test:deck`): coherencia de la presentación.
- `node scripts/check-madrid.cjs` (o `npm run test:madrid`): comprobaciones del laboratorio de Madrid.

## Servidor local

Desde la raíz del repositorio:

```sh
python3 -m http.server 8000
```

Abrir `http://localhost:8000` para el dossier, `http://localhost:8000/madrid.html` para el laboratorio y `http://localhost:8000/presentacion.html` para la presentación.
