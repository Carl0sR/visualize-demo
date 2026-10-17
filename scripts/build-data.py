"""Regenera el JS estático a partir de los JSON versionados. No accede a la red."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'datos/justicia-juvenil.json').read_text())
original = json.loads((root / 'datos/original-pptx.json').read_text())
(root / 'assets/data.js').write_text('window.JUSTICIA_DATA = ' + json.dumps(data, ensure_ascii=False) + ';\nwindow.ORIGINAL_DATA = ' + json.dumps(original, ensure_ascii=False) + ';\n')
print('assets/data.js actualizado')
