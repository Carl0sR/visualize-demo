"""Prepara la demo operativa a partir de los registros 100 % sintéticos de la POC."""
from pathlib import Path
from datetime import date, timedelta
import json, random, math
from collections import Counter

root = Path(__file__).resolve().parent.parent
folder = root/'datos/poc-madrid'
read = lambda n: json.loads((folder/n).read_text())
base = read('explorador-datos.json')
original = read('expedientes.json')['expedientes']
sentences = {s['expediente_id']:s for s in read('sentencias.json')['sentencias']}
facts = {f['id']:f for f in read('hechos.json')['hechos']}
rng = random.Random(20261022)
cut = date(2025,12,31)
zones = base['zonas']

def center(f):
    g=f['geometry']; coords=[]
    def collect(a):
        if isinstance(a[0],(float,int)):coords.append(a)
        else:
            for x in a:collect(x)
    collect(g['coordinates'])
    return [sum(x[i] for x in coords)/len(coords) for i in [0,1]]

centers={level:{f['properties']['id']:center(f) for f in fs} for level,fs in zones.items()}
barrio_distrito={f['properties']['id']:str(int(f['properties']['id'])//100).zfill(2) for f in zones['barrio']}
codes_pop={p['codigo']:p['poblacion_total'] for p in read('poblacion-municipios-2025.json')['datos']}
pop_city=sum(codes_pop.values())

def nearby(level,code):
    a=centers[level][code]
    options=sorted(centers[level],key=lambda c:sum((centers[level][c][i]-a[i])**2 for i in [0,1]))[:7]
    return rng.choice(options)

cases=[]
for index,c in enumerate(original):
    compact=base['casos'][index]
    assert compact[0]==c['municipio_codigo']
    incident=[compact[0],compact[1],compact[2]]
    residence=list(incident)
    if rng.random()<.22:
        if incident[0]=='28079':
            residence[2]=nearby('barrio',incident[2]);residence[1]=barrio_distrito[residence[2]]
        else:
            residence=[nearby('municipio',incident[0]),None,None]
            if residence[0]=='28079':
                residence[2]=rng.choice(sorted(barrio_distrito));residence[1]=barrio_distrito[residence[2]]
    precision=rng.choices(['validada','municipio','sin_localizar'],[.85,.1,.05])[0]
    if precision=='municipio':incident=[incident[0],None,None]
    if precision=='sin_localizar':incident=[None,None,None]
    opened=date.fromisoformat(c['fecha_apertura'])
    duration=(cut-opened).days
    pending=c['estado']!='cerrado'
    review_delay=rng.randint(0,min(duration,90)) if pending else None
    review_due=(cut+timedelta(days=rng.randint(-20,25))).isoformat() if pending else None
    resolved=date.fromisoformat(c['fecha_cierre']) if c['fecha_cierre'] else None
    measure=rng.choice(['Libertad vigilada','Tareas socioeducativas','Prestaciones en beneficio de la comunidad']) if c['resultado_simulado']=='sentencia_condenatoria' else None
    measure_state=rng.choices(['pendiente_inicio','en_curso','finalizada'],[.15,.4,.45])[0] if measure else None
    cases.append({'id':c['id'],'sintetico':True,'apertura':c['fecha_apertura'],'cierre':c['fecha_cierre'],
        'estado':c['estado'],'resultado':c['resultado_simulado'],'sentencia_fecha':sentences.get(c['id'],{}).get('fecha_sentencia_simulada'),
        'hechos':compact[4],'condenados':compact[5],'hecho_zona':incident,'residencia_zona':residence,
        'localizacion':precision,'soporte':c['origen_documental_simulado'],
        'documentacion':rng.choices(['completa','revision_ocr','falta_indice'],[.81,.13,.06])[0],
        'dias_abierto':duration if pending else None,'dias_tramitacion':(resolved-opened).days if resolved else None,
        'dias_sin_revision':review_delay,'proxima_revision':review_due,'medida':measure,'medida_estado':measure_state})

data={'version':'20261021-1','metadata':{'sintetico':True,'semilla':20261022,'fecha_corte':'2025-12-31',
      'aviso':'Todos los expedientes, hechos, residencias, sentencias, medidas e incidencias de extracción son ficticios.',
      'periodo':'Cohortes por fecha de apertura; situación al corte. No es una serie de hechos ocurridos ni de sentencias dictadas cada año.',
      'revision':'Las fechas de revisión son tareas de demostración, no plazos legales. Una medida ficticia por sentencia condenatoria; no se modela toda la ejecución.'},
      'categorias':base['categorias'],'zonas':zones,'casos':cases,
      'poblacion_municipios':codes_pop,'poblacion_14_17_barrios':{str(int(b['COD_DIST_BARRIO'])).zfill(4):b['poblacion_14_17'] for b in read('poblacion-barrios-2025.json')['datos']}}
(folder/'operativo.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
(root/'assets/madrid-data.js').write_text('// Generado con scripts/build-madrid.py. No editar a mano.\nwindow.MADRID_DEMO='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print('Demo operativa:',len(cases),'expedientes;',dict(Counter(c['localizacion'] for c in cases)))
