"""Regenera una prueba sintética local. No descarga datos ni usa cifras judiciales reales."""
from pathlib import Path
from datetime import date, timedelta
from collections import Counter, defaultdict
import json, random, math, hashlib
from shapely.geometry import shape, mapping, Point
from shapely import make_valid
from shapely.ops import unary_union
from shapely.geometry.polygon import orient

ROOT = Path(__file__).resolve().parent
SEED = 20261021
R = random.Random(SEED)
CUTOFF = date(2025, 12, 31)
NOTICE = 'DATOS JUDICIALES 100 % FICTICIOS. No describen incidentes, personas ni condenas reales.'

def read(name):
    return json.loads((ROOT/name).read_text())

def write(name, value):
    text = json.dumps(value,ensure_ascii=False,indent=2)
    if len(text)>100000:
        text = json.dumps(value,ensure_ascii=False,separators=(',',':'))
    (ROOT/name).write_text(text+'\n')

catalog = read('catalogo.json')
categories = catalog['categorias']
catids = [c['id'] for c in categories]
catnames = {c['id']:c['nombre'] for c in categories}
municipalities = read('municipios-madrid.geojson')['features']
districts = read('distritos-madrid.geojson')['features']
neighborhoods = read('barrios-madrid.geojson')['features']
pop_m = {p['codigo']:p for p in read('poblacion-municipios-2025.json')['datos']}
pop_b = {int(p['COD_DIST_BARRIO']):p for p in read('poblacion-barrios-2025.json')['datos']}
assert len(pop_m)==179 and len(pop_b)==131

def polygonal(g):
    if g.geom_type in ['Polygon','MultiPolygon']:
        return g
    parts = []
    for part in getattr(g,'geoms',[]):
        p = polygonal(part)
        if not p.is_empty:
            parts.append(p)
    return unary_union(parts)

def valid_geom(feature):
    g = shape(feature['geometry'])
    return polygonal(make_valid(g) if not g.is_valid else g)

mun = {}
for f in municipalities:
    code = f['properties']['NATCODE'][-5:]
    assert code in pop_m
    mun[code] = {'id':code,'nombre':f['properties']['NAMEUNIT'],'geom':valid_geom(f),
                 'poblacion_total':pop_m[code]['poblacion_total']}
dist = {}
for f in districts:
    code = str(f['properties']['COD_DIS']).zfill(2)
    dist[code] = {'id':code,'nombre':f['properties']['NOMBRE'],'geom':valid_geom(f),'poblacion_14_17':0}
bar = {}
for f in neighborhoods:
    p = f['properties']
    d = str(p['CODDIS']).zfill(2)
    # COD_DISB conserva la pareja distrito-barrio; NUM_BAR de Sol difiere en la capa.
    source_code = int(d)*100+int(p['COD_DISB'].split('-')[1])
    assert source_code in pop_b
    code = str(source_code).zfill(4)
    g = polygonal(valid_geom(f).intersection(mun['28079']['geom']).intersection(dist[d]['geom']))
    assert not g.is_empty
    bar[code] = {'id':code,'nombre':p['NOMBRE'],'distrito_id':d,'geom':g,
                 'poblacion_14_17':int(pop_b[source_code]['poblacion_14_17'])}
    dist[d]['poblacion_14_17'] += bar[code]['poblacion_14_17']
assert set(pop_b)=={int(b) for b in bar}

# Variaciones de demostración independientes de renta, nacionalidad, sexo o criminalidad.
factors_m = {code:R.uniform(.85,1.15) for code in sorted(mun)}
factors_b = {code:R.uniform(.85,1.15) for code in sorted(bar)}
focus_b = R.sample(sorted(bar),3)
focus_m = R.sample(sorted(set(mun)-{'28079'}),3)
profiles = {('m',k):R.sample(catids,2) for k in sorted(mun)}
profiles.update({('b',k):R.sample(catids,2) for k in sorted(bar)})

def pick(items, weights):
    return R.choices(items, weights=weights, k=1)[0]

def random_point(g):
    x0,y0,x1,y1 = g.bounds
    anchor = g.representative_point()
    for _ in range(10000):
        # Mezcla local: los puntos son ficticios, no siguen edificios ni domicilios.
        if R.random()<.7:
            x = R.gauss(anchor.x,(x1-x0)/8)
            y = R.gauss(anchor.y,(y1-y0)/8)
        else:
            x,y = R.uniform(x0,x1),R.uniform(y0,y1)
        p = Point(round(x,5),round(y,5))
        if g.contains(p):
            return p
    raise RuntimeError('No se pudo generar un punto interior')

cases, facts, sentences = [], [], []
features = []
for year,number in [(2024,2200),(2025,2600)]:
    codes = sorted(mun)
    weights = [mun[c]['poblacion_total']*factors_m[c]*(1.3 if year==2025 and c in focus_m else 1) for c in codes]
    for _ in range(number):
        code = pick(codes,weights)
        bairro = district = None
        g = mun[code]['geom']
        preferred = profiles[('m',code)]
        if code=='28079':
            bc = sorted(bar)
            bw = [bar[b]['poblacion_14_17']*factors_b[b]*(1.4 if year==2025 and b in focus_b else 1) for b in bc]
            bairro = pick(bc,bw)
            district = bar[bairro]['distrito_id']
            g = bar[bairro]['geom']
            preferred = profiles[('b',bairro)]
        p = random_point(g)
        caseid = f'DEMO-EXP-{len(cases)+1:05d}'
        month = pick(list(range(1,13)),[1,1,1,1,1,1.12,1.1,.8,1.15,1.12,1.05,.9])
        opened = date(year,month,R.randint(1,28))
        happened = opened-timedelta(days=R.randint(1,35))
        available = (CUTOFF-opened).days
        close_delay = R.randint(30,300)
        closed = available>=close_delay and R.random()<.76
        close_date = opened+timedelta(days=close_delay) if closed else None
        state = 'cerrado' if closed else pick(['registro','tramitacion','pendiente_audiencia'],[.12,.66,.22])
        outcome = pick(['sentencia_condenatoria','sentencia_absolutoria','archivo'],[.72,.12,.16]) if closed else 'sin_resolucion'
        count = pick([1,2,3],[.72,.23,.05])
        chosen = []
        while len(chosen)<count:
            cat = pick(catids,[2.5 if c in preferred else 1 for c in catids])
            if cat not in chosen:
                chosen.append(cat)
        factids = []
        convicted = []
        for index,cat in enumerate(chosen):
            factid = f'DEMO-HECHO-{len(facts)+1:05d}'
            factids.append(factid)
            is_convicted = outcome=='sentencia_condenatoria' and (index==0 or R.random()<.7)
            if is_convicted:
                convicted.append(factid)
            facts.append({'id':factid,'expediente_id':caseid,'fecha_hecho_simulada':happened.isoformat(),
                          'categoria_id':cat,'categoria_simulada':catnames[cat],
                          'condena_simulada':is_convicted,'sintetico':True})
        sentenceid = None
        if outcome.startswith('sentencia_'):
            sentenceid = f'DEMO-SENT-{len(sentences)+1:05d}'
            sentences.append({'id':sentenceid,'expediente_id':caseid,'fecha_sentencia_simulada':close_date.isoformat(),
                              'resultado_simulado':outcome,'hechos_condenados_ids':convicted,
                              'firmeza_simulada':'firme','sintetico':True})
        row = {'id':caseid,'sintetico':True,'tipo_expediente':'reforma_simulada',
               'unidad_tramitadora_id':'UNIDAD-DEMO-MADRID','fecha_apertura':opened.isoformat(),
               'fecha_cierre':close_date.isoformat() if close_date else None,'fecha_corte':CUTOFF.isoformat(),
               'estado':state,'resultado_simulado':outcome,'sentencia_id':sentenceid,'hechos_ids':factids,
               'municipio_codigo':code,'municipio':mun[code]['nombre'],
               'distrito_codigo':district,'distrito':dist[district]['nombre'] if district else None,
               'barrio_codigo':bairro,'barrio':bar[bairro]['nombre'] if bairro else None,
               'longitud':p.x,'latitud':p.y,'referencia_espacial':'lugar_del_hecho_simulado',
               'origen_documental_simulado':pick(['papel','escaneado','digital'],[.5,.4,.1])}
        cases.append(row)
        features.append({'type':'Feature','geometry':mapping(p),'properties':{
            **{k:row[k] for k in ['id','sintetico','municipio_codigo','municipio','distrito_codigo','barrio_codigo','fecha_apertura','estado','resultado_simulado','referencia_espacial']},
            'categoria_principal_id':chosen[0],'categoria_principal':catnames[chosen[0]],
            'hechos_registrados':count,'infracciones_condenadas':len(convicted),
            'sentencia_condenatoria':int(outcome=='sentencia_condenatoria')}})

metadata = {'schema_version':'1.0','sintetico':True,'aviso':NOTICE,'semilla':SEED,
            'periodo_aperturas':['2024-01-01','2025-12-31'],'fecha_corte':CUTOFF.isoformat(),
            'unidad_expedientes':'expedientes de reforma simulados; no personas',
            'localizacion':'Lugar ficticio del hecho. Los hechos de un expediente comparten ubicación para esta POC.',
            'base_reparto':'Población total municipal INE 2025; dentro de Madrid capital, población de 14–17 años por barrio del padrón a 01/01/2025.',
            'limitacion':'No se conocen tasas ni perfiles delictivos reales por zona; pesos por categoría, estados y resultados son inventados.',
            'focos_demostrativos_2025':{'municipios':focus_m,'barrios':focus_b},
            'categorias':categories,'fuente_vocabulario':catalog['source']}
write('expedientes.json',{'metadata':metadata,'expedientes':cases})
write('hechos.json',{'metadata':{'sintetico':True,'aviso':NOTICE,'unidad':'hechos registrados ficticios; no condenas'},'hechos':facts})
write('sentencias.json',{'metadata':{'sintetico':True,'aviso':NOTICE,'unidad':'sentencias simuladas; una por expediente resuelto por sentencia en esta POC'},'sentencias':sentences})
write('expedientes-puntos.geojson',{'type':'FeatureCollection','metadata':metadata,'features':features})
case_by_id = {c['id']:c for c in cases}
write('hechos-puntos.geojson',{'type':'FeatureCollection','metadata':{**metadata,'unidad':'Un punto por hecho; varios puntos pueden compartir expediente y coordenadas.'},'features':[
    {'type':'Feature','geometry':{'type':'Point','coordinates':[case_by_id[f['expediente_id']]['longitud'],case_by_id[f['expediente_id']]['latitud']]},
     'properties':{**f,**{k:case_by_id[f['expediente_id']][k] for k in ['municipio_codigo','distrito_codigo','barrio_codigo','fecha_apertura','estado']}}}
    for f in facts]})

fbycase = defaultdict(list)
for fact in facts:
    fbycase[fact['expediente_id']].append(fact)

# Agregados coherentes; no sumar categorías para obtener expedientes únicos.
aggregate_rows = []
for level,zones,key in [('municipio',mun,'municipio_codigo'),('distrito',dist,'distrito_codigo'),('barrio',bar,'barrio_codigo')]:
    for zoneid,zone in sorted(zones.items()):
        for year in [2024,2025]:
            selected = [c for c in cases if c[key]==zoneid and c['fecha_apertura'].startswith(str(year))]
            for cat in ['todos']+catids:
                selected_cat = [(c,[f for f in fbycase[c['id']] if cat=='todos' or f['categoria_id']==cat]) for c in selected]
                selected_cat = [(c,fs) for c,fs in selected_cat if fs]
                aggregate_rows.append({'nivel':level,'zona_id':zoneid,'zona':zone['nombre'],'cohorte_apertura':year,'categoria_id':cat,
                    'expedientes':len(selected_cat),'hechos':sum(len(fs) for c,fs in selected_cat),
                    'pendientes':sum(c['estado']!='cerrado' for c,fs in selected_cat),
                    'sentencias_condenatorias':sum(any(f['condena_simulada'] for f in fs) for c,fs in selected_cat),
                    'infracciones_condenadas':sum(sum(f['condena_simulada'] for f in fs) for c,fs in selected_cat),
                    'sintetico':True})
write('agregados.json',{'metadata':metadata,'filas':aggregate_rows})
for level,zones in [('municipio',mun),('distrito',dist),('barrio',bar)]:
    agg = {(r['zona_id']):r for r in aggregate_rows if r['nivel']==level and r['cohorte_apertura']==2025 and r['categoria_id']=='todos'}
    outfeatures = []
    for code,z in sorted(zones.items()):
        props = {k:v for k,v in z.items() if k!='geom'}
        props.update(agg[code])
        outfeatures.append({'type':'Feature','geometry':mapping(z['geom']),'properties':props})
    write(level+'s-resumen-2025.geojson',{'type':'FeatureCollection','metadata':metadata,'features':outfeatures})

# Compacto para explorar en la conversación: geometría simplificada solo para dibujar.
mini_zones = {}
for level,zones in [('municipio',mun),('distrito',dist),('barrio',bar)]:
    mini_zones[level] = [{'type':'Feature','geometry':mapping(z['geom'].simplify(.0006,preserve_topology=True)),
                          'properties':{'id':code,'nombre':z['nombre']}} for code,z in sorted(zones.items())]
mini_cases = []
for c in cases:
    fs = fbycase[c['id']]
    mask = sum(1<<catids.index(f['categoria_id']) for f in fs)
    convicted_mask = sum(1<<catids.index(f['categoria_id']) for f in fs if f['condena_simulada'])
    mini_cases.append([c['municipio_codigo'],c['distrito_codigo'],c['barrio_codigo'],int(c['fecha_apertura'][:4]),mask,convicted_mask,int(c['estado']!='cerrado')])
write('explorador-datos.json',{'zonas':mini_zones,'categorias':categories,'casos':mini_cases})

# Comprobaciones espaciales, temporales y relacionales sobre todas las filas.
assert len(cases)==4800 and len({c['id'] for c in cases})==4800
assert len({f['id'] for f in facts})==len(facts)
assert len({s['id'] for s in sentences})==len(sentences)
sbyid = {s['id']:s for s in sentences}
fbyid = {f['id']:f for f in facts}
for c in cases:
    point = Point(c['longitud'],c['latitud'])
    assert mun[c['municipio_codigo']]['geom'].contains(point)
    if c['barrio_codigo']:
        assert bar[c['barrio_codigo']]['geom'].contains(point)
        assert dist[c['distrito_codigo']]['geom'].contains(point)
    assert all(fbyid[f]['expediente_id']==c['id'] for f in c['hechos_ids'])
    assert all(fbyid[f]['fecha_hecho_simulada']<c['fecha_apertura'] for f in c['hechos_ids'])
    assert c['fecha_apertura']<=CUTOFF.isoformat()
    if c['fecha_cierre']:
        assert c['fecha_apertura']<c['fecha_cierre']<=CUTOFF.isoformat()
    if c['sentencia_id']:
        s = sbyid[c['sentencia_id']]
        assert s['expediente_id']==c['id'] and set(s['hechos_condenados_ids'])<=set(c['hechos_ids'])
        assert (s['resultado_simulado']=='sentencia_condenatoria')==bool(s['hechos_condenados_ids'])
for year in [2024,2025]:
    rows = [r for r in aggregate_rows if r['nivel']=='municipio' and r['categoria_id']=='todos' and r['cohorte_apertura']==year]
    assert sum(r['expedientes'] for r in rows)==(2200 if year==2024 else 2600)
    assert sum(r['hechos'] for r in rows)==sum(len(fbycase[c['id']]) for c in cases if c['fecha_apertura'].startswith(str(year)))
    capital = next(r for r in rows if r['zona_id']=='28079')
    for level in ['distrito','barrio']:
        for metric in ['expedientes','hechos','pendientes','sentencias_condenatorias','infracciones_condenadas']:
            assert sum(r[metric] for r in aggregate_rows if r['nivel']==level and r['categoria_id']=='todos' and r['cohorte_apertura']==year)==capital[metric]

summary = {'expedientes':len(cases),'hechos':len(facts),'sentencias':len(sentences),
           'sentencias_condenatorias':sum(s['resultado_simulado']=='sentencia_condenatoria' for s in sentences),
           'infracciones_condenadas':sum(f['condena_simulada'] for f in facts),
           'pendientes':sum(c['estado']!='cerrado' for c in cases),
           'municipios_capa':len(mun),'municipios_con_expedientes':len({c['municipio_codigo'] for c in cases}),
           'distritos_capa':len(dist),'barrios_capa':len(bar),'barrios_con_expedientes':len({c['barrio_codigo'] for c in cases if c['barrio_codigo']})}
write('validacion.json',{'resultado':'OK','controles':['IDs únicos','179 municipios enlazados con INE','131 barrios enlazados con padrón','100 % puntos en su municipio y, cuando procede, distrito y barrio','Referencias expediente–hecho–sentencia íntegras','Fechas ordenadas y anteriores al corte','Agregados municipales, distritales y de barrio conciliados'], 'totales':summary})
print(json.dumps(summary,ensure_ascii=False,indent=2))
