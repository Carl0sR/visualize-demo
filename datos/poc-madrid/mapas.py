"""Genera una lámina estática para presentar la POC. Requiere requirements.txt."""
from pathlib import Path
import json, math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import PathPatch
from matplotlib.path import Path as MPath
from matplotlib.colors import LogNorm
from matplotlib.cm import ScalarMappable
from shapely.geometry import shape
from shapely.geometry.polygon import orient

ROOT=Path(__file__).resolve().parent
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'svg.fonttype':'none'})
fig,axes=plt.subplots(1,2,figsize=(15,9),facecolor='#fafaf7')
fig.subplots_adjust(top=.72,bottom=.20,wspace=.12,left=.04,right=.97)
fig.text(.045,.94,'MADRID / EXPLORACIÓN TERRITORIAL',fontsize=11,color='#486065')
fig.text(.045,.885,'Dónde se concentra la actividad registrada',fontsize=25,color='#173c44',weight='bold')
fig.text(.045,.84,'DATOS JUDICIALES FICTICIOS · Cohorte de apertura 2025 · Situación al 31/12/2025',fontsize=11,color='#8c451d')

def project(x,y):
    return 6378.137*math.radians(x),6378.137*math.log(math.tan(math.pi/4+math.radians(y)/2))

def patch(poly,fill):
    vertices,codes=[],[]
    poly=orient(poly,sign=1)
    for ring in [poly.exterior,*poly.interiors]:
        xy=[project(x,y) for x,y in ring.coords]
        vertices.extend(xy)
        codes.extend([MPath.MOVETO]+[MPath.LINETO]*(len(xy)-2)+[MPath.CLOSEPOLY])
    return PathPatch(MPath(vertices,codes),facecolor=fill,edgecolor='#fafaf7',linewidth=.4)

for ax,file,title,total in zip(axes,['municipios-resumen-2025.geojson','barrios-resumen-2025.geojson'],['Comunidad de Madrid · 179 municipios','Madrid capital · 131 barrios'],[2600,1299]):
    features=json.loads((ROOT/file).read_text())['features']
    maximum=max(f['properties']['expedientes'] for f in features)
    norm=LogNorm(vmin=1,vmax=maximum)
    for f in features:
        n=f['properties']['expedientes']; geom=shape(f['geometry'])
        parts=list(geom.geoms) if geom.geom_type=='MultiPolygon' else [geom]
        for p in parts:
            ax.add_patch(patch(p,plt.cm.Blues(norm(n)) if n else '#e1e4e3'))
    ax.autoscale_view();ax.set_aspect('equal');ax.set_axis_off()
    ax.set_title(title+'\n'+f'{total:,}'.replace(',','.')+' expedientes ficticios',loc='left',fontsize=13,color='#173c44',pad=16)
    colorbar=fig.colorbar(ScalarMappable(norm=norm,cmap='Blues'),ax=ax,orientation='horizontal',fraction=.04,pad=.045,shrink=.75)
    colorbar.set_label('Expedientes por zona · escala logarítmica',fontsize=9)
    colorbar.outline.set_visible(False)
fig.text(.045,.105,'El tamaño poblacional orienta el reparto; las diferencias por zona y tipo de hecho son simuladas.',fontsize=11,color='#173c44')
fig.text(.045,.14,'Gris: 0 expedientes en la muestra ficticia. Las escalas de ambos mapas son independientes.',fontsize=9,color='#486065')
fig.text(.045,.075,'No representa tasas de delincuencia ni evalúa riesgos individuales. El lugar del hecho está inventado.',fontsize=10,color='#486065')
fig.text(.045,.037,'Geometría: IGN vía ArcGIS y Ayuntamiento de Madrid · Población: INE y padrón municipal, 01/01/2025.',fontsize=9,color='#486065')
fig.savefig(ROOT/'mapas-madrid.png',dpi=180,facecolor=fig.get_facecolor())
fig.savefig(ROOT/'mapas-madrid.svg',facecolor=fig.get_facecolor())
svg_path=ROOT/'mapas-madrid.svg'
svg_path.write_text('\n'.join(line.rstrip() for line in svg_path.read_text().splitlines())+'\n')
print('Lámina PNG y SVG creada.')
