(function () {
  'use strict';
  const metrics={expedientes:'Expedientes únicos',hechos:'Hechos registrados',pendientes:'Expedientes pendientes',sentencias:'Sentencias condenatorias',infracciones:'Infracciones con condena',medidas:'Medidas simuladas'};
  const levelIndex={municipio:0,distrito:1,barrio:2};
  const defaults={geo:'hecho',level:'municipio',year:'2025',quarter:'todos',category:'todos',phase:'todos',measure:'todos',metric:'expedientes',zone:'todos',view:'territorio'};
  const popcount=n=>{let v=0;while(n){n&=n-1;v++;}return v;};
  function categoryMask(data,state){return state.category==='todos'?1023:1<<data.categorias.findIndex(c=>c.id===state.category);}
  function zoneOf(c,state){return c[state.geo==='residencia'?'residencia_zona':'hecho_zona'];}
  function matches(c,data,state,year){
    const mask=categoryMask(data,state),month=Number(c.apertura.slice(5,7));
    return c.apertura.startsWith(String(year||state.year)) && (state.quarter==='todos'||Math.ceil(month/3)===Number(state.quarter)) && Boolean(c.hechos&mask)
      && (state.phase==='todos'||(state.phase==='pendiente'&&c.estado!=='cerrado')||(state.phase==='cerrado'&&c.estado==='cerrado')||(state.phase==='condenatoria'&&c.resultado==='sentencia_condenatoria'))
      && (state.measure==='todos'||c.medida===state.measure)
      && (state.level==='municipio'||zoneOf(c,state)[0]==='28079');
  }
  function selection(data,state,year,withZone){return data.casos.filter(c=>matches(c,data,state,year)&&(!withZone||state.zone==='todos'||zoneOf(c,state)[levelIndex[state.level]]===state.zone));}
  function totals(cases,data,state){
    const mask=categoryMask(data,state),t={expedientes:0,hechos:0,pendientes:0,sentencias:0,infracciones:0,medidas:0};
    for(const c of cases){t.expedientes++;t.hechos+=popcount(c.hechos&mask);t.pendientes+=Number(c.estado!=='cerrado');t.sentencias+=Number(Boolean(c.condenados&mask));t.infracciones+=popcount(c.condenados&mask);t.medidas+=Number(Boolean((c.condenados&mask)&&c.medida));}
    return t;
  }
  function aggregate(data,state,cases){
    const result=new Map(data.zonas[state.level].map(f=>[f.properties.id,{id:f.properties.id,nombre:f.properties.nombre,cases:[],...totals([],data,state)}]));
    for(const c of cases){const z=result.get(zoneOf(c,state)[levelIndex[state.level]]);if(z)z.cases.push(c);}
    for(const row of result.values())Object.assign(row,totals(row.cases,data,state));
    return result;
  }
  const API={metrics,defaults,popcount,zoneOf,matches,selection,totals,aggregate};
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
  if(typeof document==='undefined')return;
  const D=window.MADRID_DEMO,$=id=>document.getElementById(id),nf=new Intl.NumberFormat('es-ES',{useGrouping:'always'}),fmt=n=>nf.format(n);
  if(!D||!window.d3){$('workspace').innerHTML='<h1>No se pudo cargar la demostración</h1><p>Comprueba que los recursos locales se han descargado completos.</p>';return;}
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={registro:'Registro',tramitacion:'Tramitación',pendiente_audiencia:'Pendiente de audiencia',cerrado:'Cerrado'};
  const quality={validada:'Zona validada (simulación)',municipio:'Solo municipio',sin_localizar:'Sin localizar'};
  const tasks={completa:'Documentación completa',revision_ocr:'Revisar extracción OCR',falta_indice:'Completar índice documental'};
  let state={...defaults},rows=new Map(),pool=[],pageSize=25;
  const filters=['geo','level','year','quarter','category','phase','measure','metric'];
  for(const c of D.categorias){const o=document.createElement('option');o.value=c.id;o.textContent=c.nombre;$('category').append(o);}
  // d3-geo utiliza anillos exteriores horarios para la proyección esférica.
  for(const fs of Object.values(D.zonas))for(const f of fs)if(d3.geoArea(f)>2*Math.PI){const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const p of polys)for(const ring of p)ring.reverse();}
  const zoneName=(level,id)=>D.zonas[level].find(f=>f.properties.id===id)?.properties.nombre||'Sin localizar';
  function scopeName(){return state.zone==='todos'?(state.level==='municipio'?'Comunidad de Madrid':'Madrid capital'):zoneName(state.level,state.zone);}
  function categoryName(){return state.category==='todos'?'Todos los tipos de hecho':D.categorias.find(c=>c.id===state.category).nombre;}
  function periodName(){return state.year+' · '+(state.quarter==='todos'?'año completo':'trimestre '+state.quarter)+' de apertura';}
  function url(update){const u=new URL(location.href);for(const k of filters.concat('zone')){if(state[k]===defaults[k])u.searchParams.delete(k);else u.searchParams.set(k,state[k]);}u.hash=state.view;if(update)history.replaceState(null,'',u);return u.href;}
  function restore(){const u=new URL(location.href);for(const k of filters){const v=u.searchParams.get(k);if(v&&[...$(k).options].some(o=>o.value===v))state[k]=v;$(k).value=state[k];}const z=u.searchParams.get('zone');if(z&&D.zonas[state.level].some(f=>f.properties.id===z))state.zone=z;const v=u.hash.slice(1);if(['territorio','seguimiento','informe','fuentes'].includes(v))state.view=v;}
  function setView(view){state.view=view;for(const v of ['territorio','seguimiento','informe','fuentes'])$('view-'+v).hidden=v!==view;document.querySelectorAll('.tabs [data-view]').forEach(b=>{if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});url(true);if(view==='territorio')drawMap();if(view==='informe')renderReport();if(view==='seguimiento')renderQueue();}
  function mapScale(){const positive=[...rows.values()].map(r=>r[state.metric]).filter(n=>n>0).sort((a,b)=>a-b);const bounds=positive.length?Array.from(new Set([1,2,3,4,5].map(i=>positive[Math.ceil(positive.length*i/5)-1]))):[];return{bounds,color:n=>{if(!n)return'#e4e7e5';const i=bounds.findIndex(b=>n<=b);return d3.interpolateRgb('#c5dce6','#173c4e')(bounds.length===1?.7:i/(bounds.length-1));}};}
  function createMap(element,width,height,interactive){
    const fs=D.zonas[state.level],projection=d3.geoMercator().fitExtent([[12,12],[width-12,height-12]],{type:'FeatureCollection',features:fs}),path=d3.geoPath(projection),scale=mapScale();
    const svg=d3.select(element).selectAll('svg').data([null]).join('svg').attr('viewBox',`0 0 ${width} ${height}`).attr('role','img').attr('aria-label',`${metrics[state.metric]} por ${state.level}. Datos ficticios. Las zonas también se pueden consultar en el selector y la tabla.`);
    const paths=svg.selectAll('path').data(fs,f=>f.properties.id).join('path').attr('class',f=>'geo-zone'+(state.zone===f.properties.id?' active':''))
      .attr('data-map-zone',f=>f.properties.id).attr('d',path).attr('fill',f=>scale.color(rows.get(f.properties.id)[state.metric])).attr('stroke',f=>f.properties.id===state.zone?'#a34f36':'#fff').attr('stroke-width',f=>f.properties.id===state.zone?2:.65);
    paths.selectAll('title').data(f=>[f]).join('title').text(f=>`${f.properties.nombre}: ${fmt(rows.get(f.properties.id)[state.metric])} ${metrics[state.metric].toLowerCase()} de simulación`);
    if(interactive)paths.on('click',(event,f)=>chooseZone(f.properties.id));
    return svg.node();
  }
  function drawMap(){const w=$('map').clientWidth;if(w<1)return;createMap($('map'),w,Math.max(320,Math.min(510,w*.9)),true);const sc=mapScale();$('legend').innerHTML='<span>Escala de esta vista:</span><span><i style="background:#e4e7e5"></i>0</span>'+sc.bounds.map((b,i)=>{const a=i?sc.bounds[i-1]+1:1;return `<span><i style="background:${sc.color(b)}"></i>${a===b?fmt(b):fmt(a)+'–'+fmt(b)}</span>`;}).join('');}
  function chooseZone(id){state.zone=id;queuePage=1;$('zone').value=id;url(true);renderDetail();drawMap();renderMonthly();renderQueue();renderReport();renderWorkspace();}
  function details(cases){const t=totals(cases,D,state);return `<div class="detail-numbers">${Object.entries(metrics).map(([k,label])=>`<span>${label}</span><strong>${fmt(t[k])}</strong>`).join('')}</div>`;}
  function renderDetail(){
    const cases=selection(D,state,null,true),previous=selection(D,state,String(Number(state.year)-1),true);
    const old=totals(previous,D,state)[state.metric],now=totals(cases,D,state)[state.metric];
    const delta=old?`${now-old>0?'+':''}${new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format((now-old)/old*100)} %`:'Sin base comparable';
    $('zone-detail').innerHTML=`<h3>${escape(scopeName())}</h3>${details(cases)}<p class="comparison"><strong>${escape(delta)}</strong><br>frente a la cohorte ${Number(state.year)-1}, mismo trimestre y filtros.</p><p class="fine">${state.geo==='hecho'?'Lugar del hecho simulado':'Residencia simulada'}. Situación al corte. Las cohortes tienen distinto tiempo para alcanzar resolución.</p>`;
  }
  function renderMonthly(){
    const selected=selection(D,{...state,quarter:'todos'},null,true),months=Array(12).fill(0);for(const c of selected)months[Number(c.apertura.slice(5,7))-1]++;
    const el=$('monthly'),w=el.clientWidth;if(w<1)return;
    const h=165,margin={left:32,right:10,top:18,bottom:30},x=d3.scaleBand().domain(d3.range(12)).range([margin.left,w-margin.right]).padding(.24),y=d3.scaleLinear().domain([0,Math.max(1,...months)]).nice().range([h-margin.bottom,margin.top]);
    const svg=d3.select(el).selectAll('svg').data([null]).join('svg').attr('viewBox',`0 0 ${w} ${h}`).attr('role','img').attr('aria-label','Expedientes abiertos cada mes de '+state.year+': '+months.join(', '));
    svg.selectAll('*').remove();
    svg.append('g').attr('transform',`translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(3).tickSize(0)).call(g=>g.select('.domain').remove());
    const names=['E','F','M','A','M','J','J','A','S','O','N','D'];
    svg.append('g').attr('transform',`translate(0,${h-margin.bottom})`).call(d3.axisBottom(x).tickFormat(i=>names[i]).tickSize(0)).call(g=>g.select('.domain').remove());
    svg.selectAll('rect').data(months).join('rect').attr('x',(d,i)=>x(i)).attr('y',d=>y(d)).attr('width',x.bandwidth()).attr('height',d=>y(0)-y(d)).attr('opacity',(d,i)=>state.quarter==='todos'||Math.ceil((i+1)/3)===Number(state.quarter)?1:.25).append('title').text((d,i)=>`${i+1}/${state.year}: ${d} expedientes ficticios`);
  }
  function table(headers,body){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${body.map(row=>`<tr>${row.map((c,i)=>i===0?`<th scope="row">${escape(c)}</th>`:`<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
  function renderQueue(){
    const cases=selection(D,state,null,true),pending=cases.filter(c=>c.estado!=='cerrado'),overdue=pending.filter(c=>c.proxima_revision<D.metadata.fecha_corte),unmapped=cases.filter(c=>!zoneOf(c,state)[levelIndex[state.level]]),docs=cases.filter(c=>c.documentacion!=='completa');
    $('follow-summary').innerHTML=`<div><span>Revisiones operativas pendientes</span><strong>${fmt(overdue.length)}</strong><span>de ${fmt(pending.length)} expedientes abiertos</span></div><div><span>Localización por completar</span><strong>${fmt(unmapped.length)}</strong><span>para la escala y referencia elegidas</span></div><div><span>Documento por revisar</span><strong>${fmt(docs.length)}</strong><span>OCR o índice documental ficticios</span></div>`;
    const mode=$('queue').value,q=$('search').value.trim().toLocaleLowerCase('es');
    const filtered=cases.filter(c=>(!q||(c.id+' '+zoneName(state.level,zoneOf(c,state)[levelIndex[state.level]])).toLocaleLowerCase('es').includes(q))&&(mode==='todos'||mode==='revision'&&(c.estado!=='cerrado'&&c.proxima_revision<D.metadata.fecha_corte)||mode==='localizacion'&&!zoneOf(c,state)[levelIndex[state.level]]||mode==='documentacion'&&c.documentacion!=='completa'||mode==='inicio'&&c.medida_estado==='pendiente_inicio')).sort((a,b)=>compare(sortValue(a,queueSort.key),sortValue(b,queueSort.key),queueSort.dir)||a.id.localeCompare(b.id));
    const pages=Math.max(1,Math.ceil(filtered.length/pageSize));queuePage=Math.min(Math.max(1,queuePage),pages);const start=(queuePage-1)*pageSize,shown=filtered.slice(start,start+pageSize),cols=columns.filter(([k])=>visibleColumns.has(k));
    $('queue-count').textContent=`${scopeName()} · ${fmt(filtered.length)} expedientes ficticios · ${filtered.length?start+1:0}–${Math.min(start+pageSize,filtered.length)} visibles`;
    $('queue-table').innerHTML=shown.length?`<table><caption class="sr-only">Expedientes ficticios de la selección. Pulsa el identificador para abrir la ficha.</caption><thead><tr>${cols.map(([k,l])=>sortHeader(k,l,queueSort,'queue')).join('')}</tr></thead><tbody>${shown.map(c=>`<tr>${cols.map(([k])=>k==='id'?`<th scope="row"><button data-case="${c.id}">${c.id}</button></th>`:k==='estado'?`<td><span class="status status-${c.estado}">${escape(labels[c.estado])}</span></td>`:`<td class="${k==='dias'?'num':''}">${escape(k==='revision'?dateLabel(c.proxima_revision)+(c.proxima_revision&&c.proxima_revision<c.apertura?' · por validar':''):k==='dias'?(c.dias_abierto===null?'—':fmt(c.dias_abierto)):sortValue(c,k))}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'<p class="empty-state">No hay expedientes con esta selección. Prueba otra búsqueda o restablece los filtros.</p>';
    $('queue-page').textContent=`Página ${queuePage} de ${pages}`;$('queue-prev').disabled=queuePage<=1;$('queue-next').disabled=queuePage>=pages;
  }

  function reportMarkup(){
    const selected=selection(D,state,null,true),t=totals(selected,D,state),suppress=$('suppress').checked;
    const selectedRows=[...rows.values()].filter(r=>(state.zone==='todos'||r.id===state.zone)&&r.expedientes>0).sort((a,b)=>b[state.metric]-a[state.metric]);
    const cell=n=>suppress&&n>0&&n<5?'<5':fmt(n);
    const note=$('analyst-note').value.trim();const reportTitle=$('report-title').value.trim()||'Expedientes abiertos · '+categoryName()+' · '+scopeName()+' · '+state.year;const reportScale=mapScale();
    const missing=selected.filter(c=>!zoneOf(c,state)[levelIndex[state.level]]).length;
    const box=document.createElement('div');createMap(box,600,420,false);
    return `<p class="report-tag">DEMOSTRACIÓN · TODOS LOS REGISTROS JUDICIALES SON FICTICIOS</p><h3>${escape(reportTitle)}</h3><p><strong>${escape(scopeName())} · ${escape(periodName())}</strong> · situación al 31/12/2025<br>${escape(categoryName())} · ${escape(state.geo==='hecho'?'Lugar del hecho simulado':'Residencia simulada')}<br>Estado: ${escape($('phase').selectedOptions[0].textContent)} · Medida: ${escape(state.measure==='todos'?'todas / sin medida':state.measure)}</p><h4>Actividad seleccionada</h4><p>${fmt(t.expedientes)} expedientes · ${fmt(t.hechos)} hechos registrados · ${fmt(t.pendientes)} pendientes · ${fmt(t.sentencias)} sentencias condenatorias · ${fmt(t.infracciones)} infracciones con condena.</p><p>Unidad del mapa: ${escape(metrics[state.metric])}. Ámbito del mapa: ${state.level==='municipio'?'Comunidad de Madrid':'Madrid capital'}; la zona seleccionada se resalta.</p><div class="report-map">${box.innerHTML}</div><p>Intervalos del mapa: 0${reportScale.bounds.map((n,i)=>'; '+(i?reportScale.bounds[i-1]+1:1)+'–'+n).join('')}. Escala ajustada a esta consulta.</p><h4>${escape(metrics[state.metric])} por zona</h4>${selectedRows.length?table(['Zona',metrics[state.metric],'Expedientes','Pendientes'],selectedRows.slice(0,15).map(r=>[r.nombre,cell(r[state.metric]),cell(r.expedientes),cell(r.pendientes)])):'<p>Sin registros en esta selección.</p>'}<p>${selectedRows.length>15?'Se muestran las quince zonas con mayor volumen. ':''}${fmt(missing)} expedientes no localizables a esta escala dentro del ámbito seleccionado.</p>${note?`<h4>Contexto del analista</h4><p>${escape(note).replace(/\n/g,'<br>')}</p>`:''}<h4>Lectura y límites</h4><ul><li>Los recuentos describen la simulación: no estiman hechos reales ni señalan zonas peligrosas.</li><li>La cohorte se define por apertura; hechos y sentencias pueden corresponder a fechas diferentes. No se cuentan personas.</li><li>El reparto usa población total municipal y población adolescente por barrio en la capital. No son tasas comparables de delincuencia.</li><li>${suppress?'Las celdas de 1 a 4 se muestran como &lt;5. Los totales y el mapa no se suprimen: esto no garantiza anonimización.':'Se muestran los recuentos completos porque los registros son ficticios.'}</li></ul><h4>Fuentes y trazabilidad</h4><p>Población: INE, tabla 2881, y padrón de Madrid de enero de 2025. Geometría: IGN vía ArcGIS y Ayuntamiento de Madrid. Flujo de trabajo inspirado en Memoria ARRMI 2024, pp. 49 y 58. Expedientes, resultados, residencias y tareas generados para demostración.</p><p>Versión ${escape(D.version)} · <a href="${escape(new URL('madrid.html',location.href).href)}">Laboratorio territorial</a> · <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=2881">INE</a> · <a href="https://gestiona3.madrid.org/bvirtual/BVCM051678.pdf">Memoria ARRMI 2024</a></p>`;
  }
  function renderReport(){$('report-preview').innerHTML=reportMarkup();}
  function download(name,content,type){const link=document.createElement('a'),u=URL.createObjectURL(new Blob([content],{type}));link.href=u;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(u),1000);$('announcement').textContent='Descarga preparada: '+name;}
  function exportGeo(){
    const features=D.zonas[state.level].filter(f=>state.zone==='todos'||f.properties.id===state.zone).map(f=>{const row=rows.get(f.properties.id),geometry=JSON.parse(JSON.stringify(f.geometry));const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;for(const polygon of polygons)for(const ring of polygon)ring.reverse();return{type:'Feature',geometry,properties:{sintetico:true,zona_id:row.id,zona:row.nombre,...Object.fromEntries(Object.keys(metrics).map(k=>[k,row[k]]))}};});
    download('madrid-demo-'+state.level+'.geojson',JSON.stringify({type:'FeatureCollection',metadata:{...D.metadata,seleccion:{...state},unidad:'Agregados; no personas'},features},null,2),'application/geo+json');
  }
  function exportCSV(){const cols=['zona','expedientes','hechos','pendientes','sentencias','infracciones','medidas','sintetico','referencia_geografica','nivel','cohorte_apertura','trimestre_apertura','categoria_id','estado','medida','fecha_corte','version'];const cell=v=>'"'+String(v).replace(/"/g,'""')+'"';const lines=[cols,...[...rows.values()].filter(r=>state.zone==='todos'||r.id===state.zone).map(r=>[r.nombre,...Object.keys(metrics).map(k=>r[k]),true,state.geo,state.level,state.year,state.quarter,state.category,state.phase,state.measure,D.metadata.fecha_corte,D.version])];download('madrid-demo-'+state.level+'-'+state.year+'-agregado.csv','\ufeff'+lines.map(row=>row.map(cell).join(';')).join('\r\n'),'text/csv;charset=utf-8');}
  function update(){
    pool=selection(D,state);rows=aggregate(D,state,pool);
    if(!rows.has(state.zone)&&state.zone!=='todos')state.zone='todos';
    $('zone').innerHTML='<option value="todos">Todo el ámbito</option>'+[...rows.values()].sort((a,b)=>a.nombre.localeCompare(b.nombre,'es')).map(r=>`<option value="${r.id}">${escape(r.nombre)}</option>`).join('');$('zone').value=state.zone;
    const t=totals(pool,D,state),mapped=[...rows.values()].reduce((n,r)=>n+r[state.metric],0),missing=pool.filter(c=>!zoneOf(c,state)[levelIndex[state.level]]).length;
    $('summary').innerHTML=`<div><span>Expedientes del ámbito</span><strong>${fmt(t.expedientes)}</strong><span>${escape(periodName())}</span></div><div><span>${escape(metrics[state.metric])} en el mapa</span><strong>${fmt(mapped)}</strong><span>solo registros localizables a esta escala</span></div><div><span>Expedientes pendientes al corte</span><strong>${fmt(t.pendientes)}</strong><span>no es un plazo legal ni un indicador de riesgo</span></div>`;
    $('coverage').textContent=`${fmt(pool.length-missing)} de ${fmt(pool.length)} expedientes del ámbito se pueden representar a esta escala. ${fmt(missing)} quedan fuera del mapa y siguen visibles en Seguimiento. ${state.geo==='residencia'?'Las residencias son ficticias.':'No se representan domicilios.'}${state.level!=='municipio'?' Capital excluye los casos sin municipio conocido.':''}`;
    $('ranking').innerHTML=[...rows.values()].sort((a,b)=>b[state.metric]-a[state.metric]).slice(0,5).map(r=>`<div class="rank-row"><button type="button" data-zone="${r.id}">${escape(r.nombre)}</button><strong>${fmt(r[state.metric])}</strong></div>`).join('');
    renderDetail();drawMap();renderMonthly();renderQueue();if(state.view==='informe')renderReport();renderWorkspace();url(true);
  }
  filters.forEach(k=>$(k).addEventListener('change',()=>{state[k]=$(k).value;if(k==='geo'||k==='level')state.zone='todos';if(k==='metric')territorySort={key:state.metric,dir:-1};queuePage=territoryPage=1;update();}));
  document.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b){e.preventDefault();setView(b.dataset.view);}const z=e.target.closest('[data-zone]');if(z)chooseZone(z.dataset.zone);});
  $('zone').addEventListener('change',()=>chooseZone($('zone').value));
  $('zone-report').addEventListener('click',()=>{setView('informe');$('report-heading').scrollIntoView({block:'start'});});
  $('reset').addEventListener('click',()=>{state={...defaults};filters.forEach(k=>$(k).value=state[k]);$('search').value='';queuePage=territoryPage=1;update();setView('territorio');});
  $('queue').addEventListener('change',()=>{queuePage=1;renderQueue();});$('search').addEventListener('input',()=>{queuePage=1;renderQueue();});
  $('analyst-note').addEventListener('input',renderReport);$('suppress').addEventListener('change',renderReport);
  $('download-geojson').addEventListener('click',exportGeo);$('download-csv').addEventListener('click',exportCSV);
  $('report-download').addEventListener('click',()=>download('informe-madrid-demo.html','<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe territorial ficticio · Madrid</title><style>body{font:16px/1.6 system-ui;color:#18333f;max-width:900px;margin:32px auto;padding:0 24px}h3{font:36px Georgia}table{border-collapse:collapse;width:100%;font-size:13px}td,th{text-align:left;padding:8px;border-bottom:1px solid #ccd5d6}a{color:#173c4e}.report-tag{color:#a34f36;font-weight:700}.report-map{max-width:560px}.report-map svg{width:100%;height:auto}@media print{body{margin:0}tr{break-inside:avoid}}</style><body>'+reportMarkup()+'</body></html>','text/html;charset=utf-8'));
  $('report-print').addEventListener('click',()=>{renderReport();window.print();});
  window.addEventListener('beforeprint',renderReport);
  window.addEventListener('popstate',()=>{state={...defaults};restore();update();setView(state.view);});
  new ResizeObserver(()=>{drawMap();renderMonthly();}).observe($('map'));
  // Controles de consulta: solo preferencias y filtros; nunca documentos ni notas.
  let queuePage=1, queueSort={key:'revision',dir:1}, territoryPage=1, territorySort={key:'expedientes',dir:-1};
  const columns=[['id','Expediente'],['zona','Zona de referencia'],['estado','Estado'],['tarea','Tarea pendiente'],['revision','Fecha de revisión'],['dias','Días abierto']];
  const visibleColumns=new Set(columns.map(c=>c[0]));
  const dateFormat=new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const dateLabel=value=>value?dateFormat.format(new Date(value+'T12:00:00Z')):'—';
  const taskLabel=c=>c.documentacion!=='completa'?tasks[c.documentacion]:(c.medida_estado==='pendiente_inicio'?'Revisar inicio de medida':c.estado!=='cerrado'?'Revisión operativa':'Sin tarea documental');
  function sortValue(c,key){return key==='zona'?zoneName(state.level,zoneOf(c,state)[levelIndex[state.level]]):key==='estado'?labels[c.estado]:key==='tarea'?taskLabel(c):key==='revision'?c.proxima_revision:key==='dias'?c.dias_abierto:c.id;}
  function compare(a,b,dir){if(a==null)return b==null?0:1;if(b==null)return-1;return dir*(typeof a==='number'?a-b:String(a).localeCompare(String(b),'es',{numeric:true}));}
  function sortHeader(key,label,sort,kind){return `<th scope="col" aria-sort="${sort.key===key?(sort.dir===1?'ascending':'descending'):'none'}"><button data-${kind}-sort="${key}">${escape(label)} <span aria-hidden="true">${sort.key===key?(sort.dir===1?'↑':'↓'):'↕'}</span></button></th>`;}
  function renderTerritoryTable(){
    const q=$('territory-search').value.trim().toLocaleLowerCase('es'),all=[...rows.values()].filter(r=>r.nombre.toLocaleLowerCase('es').includes(q)).sort((a,b)=>compare(a[territorySort.key],b[territorySort.key],territorySort.dir)||a.nombre.localeCompare(b.nombre,'es'));
    const pages=Math.max(1,Math.ceil(all.length/15));territoryPage=Math.min(territoryPage,pages);
    const start=(territoryPage-1)*15,shown=all.slice(start,start+15),fields=[['nombre','Zona'],[state.metric,metrics[state.metric]]];if(state.metric!=='pendientes')fields.push(['pendientes','Pendientes']);
    $('territory-table').innerHTML=shown.length?`<table><caption class="sr-only">Recuentos ficticios por zona, selección ${escape(periodName())}</caption><thead><tr>${fields.map(([k,l])=>sortHeader(k,l,territorySort,'territory')).join('')}</tr></thead><tbody>${shown.map(r=>`<tr class="${state.zone===r.id?'selected-row':''}"><th scope="row"><button data-zone="${r.id}" aria-pressed="${state.zone===r.id}">${escape(r.nombre)}</button></th>${fields.slice(1).map(([k])=>`<td class="num">${fmt(r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'<p class="empty-state">No hay zonas con ese nombre. Prueba otra búsqueda.</p>';
    $('territory-count').textContent=`${all.length?start+1:0}–${Math.min(start+15,all.length)} de ${fmt(all.length)} zonas`;
    $('territory-prev').disabled=territoryPage<=1;$('territory-next').disabled=territoryPage>=pages;
  }
  function renderActiveFilters(){
    const labels={geo:'Referencia',level:'Escala',year:'Apertura',quarter:'Periodo',category:'Tipo',phase:'Estado',measure:'Medida'};
    $('active-filters').innerHTML=Object.entries(labels).filter(([k])=>!['category','phase','measure','quarter'].includes(k)||state[k]!=='todos').map(([k,l])=>`<span class="filter-chip">${l}: ${escape($(k).selectedOptions[0].textContent)}${state[k]!==defaults[k]?`<button data-reset-filter="${k}" aria-label="Restablecer ${l}">×</button>`:''}</span>`).join('')+(state.zone!=='todos'?`<span class="filter-chip selected">Zona: ${escape(scopeName())}<button data-reset-filter="zone" aria-label="Quitar zona">×</button></span>`:'');
    $('clear-zone').disabled=state.zone==='todos';
  }
  function renderWorkspace(){renderActiveFilters();renderTerritoryTable();}
  function openCase(id){
    const c=D.casos.find(c=>c.id===id);if(!c)return;
    const facts=D.categorias.filter((_,i)=>c.hechos&(1<<i)).map(x=>x.nombre),convicted=D.categorias.filter((_,i)=>c.condenados&(1<<i)).map(x=>x.nombre);
    const results={sentencia_condenatoria:'Sentencia condenatoria',sentencia_absolutoria:'Sentencia absolutoria',archivo:'Archivo',pendiente:'Pendiente',sin_resolucion:'Sin resolución',archivo_desistimiento:'Archivo o desistimiento'};
    const outcome=results[c.resultado]||String(c.resultado).replace(/_/g,' ');
    const locationLabel=z=>!z[0]?'Sin localizar':z[0]!=='28079'?zoneName('municipio',z[0]):[zoneName('municipio',z[0]),z[1]?zoneName('distrito',z[1]):'Distrito por completar',z[2]?zoneName('barrio',z[2]):'Barrio por completar'].join(' · ');
    const line=(label,value)=>`<dt>${escape(label)}</dt><dd>${escape(value??'—')}</dd>`;
    $('case-title').textContent=c.id;
    $('case-content').innerHTML=`<p class="notice">Todos los datos de esta ficha son inventados. Situación al 31 dic 2025.</p><h3>Situación y seguimiento</h3><dl>${line('Estado',labels[c.estado])}${line('Apertura',dateLabel(c.apertura))}${line('Cierre',dateLabel(c.cierre))}${line('Tarea pendiente',taskLabel(c))}${line('Fecha de revisión',dateLabel(c.proxima_revision)+(c.proxima_revision&&c.proxima_revision<c.apertura?' · fecha anterior a la apertura: por validar':''))}${line('Días abierto',c.dias_abierto===null?'Cerrado':fmt(c.dias_abierto))}</dl><h3>Referencia territorial</h3><dl>${line('Lugar del hecho',locationLabel(c.hecho_zona))}${line('Residencia',locationLabel(c.residencia_zona))}${line('Localización del hecho',quality[c.localizacion])}</dl><h3>Hechos y resolución</h3><dl>${line('Tipos de hecho',facts.join(', '))}${line('Resultado',outcome)}${line('Fecha de sentencia',dateLabel(c.sentencia_fecha))}${line('Infracciones con condena',convicted.join(', ')||'Ninguna registrada')}${line('Medida simulada',c.medida||'Sin medida')}${line('Estado de la medida',c.medida_estado?c.medida_estado.replace(/_/g,' '):'Sin medida')}</dl><h3>Documentación</h3><dl>${line('Soporte',({digital:'Digital',escaneado:'Escaneado',papel:'Papel'})[c.soporte]||c.soporte)}${line('Revisión documental',tasks[c.documentacion])}</dl><p class="fine">Las revisiones son tareas operativas ficticias, no plazos legales. Esta ficha es de consulta y no modifica expedientes.</p>`;
    $('case-dialog').showModal();
  }
  const storageKey='madrid-demo-consultas-v1';let savedQueries=[];
  try{const stored=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(stored))savedQueries=stored.filter(x=>x&&typeof x.name==='string'&&typeof x.id==='string'&&x.state&&typeof x.state==='object').slice(0,20);}catch{}
  function renderSaved(){const selected=$('saved-query').value;$('saved-query').innerHTML='<option value="">Consultas guardadas</option>'+savedQueries.map(q=>`<option value="${escape(q.id)}">${escape(q.name)}</option>`).join('');$('saved-query').value=savedQueries.some(q=>q.id===selected)?selected:'';$('delete-query').disabled=!$('saved-query').value;}
  function persistQueries(next){try{localStorage.setItem(storageKey,JSON.stringify(next));savedQueries=next;renderSaved();return true;}catch{$('save-status').textContent='Este navegador no permite guardar consultas. Puedes copiar la dirección de la página para conservar la selección.';return false;}}
  function applySaved(q){state={...defaults};for(const k of filters)if([...$(k).options].some(o=>o.value===q.state[k]))state[k]=q.state[k];if(D.zonas[state.level].some(f=>f.properties.id===q.state.zone))state.zone=q.state.zone;if(['territorio','seguimiento','informe','fuentes'].includes(q.state.view))state.view=q.state.view;filters.forEach(k=>$(k).value=state[k]);$('queue').value=[...$('queue').options].some(o=>o.value===q.queue)?q.queue:'revision';$('search').value='';queuePage=territoryPage=1;$('more-filters').open=['category','phase','measure'].some(k=>state[k]!=='todos');update();setView(state.view);}
  $('toggle-filters').addEventListener('click',()=>{const expanded=$('toggle-filters').getAttribute('aria-expanded')==='true';$('filter-panel').hidden=expanded;document.querySelector('.work-layout').classList.toggle('filters-collapsed',expanded);$('toggle-filters').setAttribute('aria-expanded',String(!expanded));$('toggle-filters').textContent=expanded?'Mostrar filtros':'Ocultar filtros';});
  $('density').addEventListener('change',()=>document.body.dataset.density=$('density').value);
  $('close-case').addEventListener('click',()=>$('case-dialog').close());
  $('save-query').addEventListener('click',()=>{$('query-name').value=scopeName()+' · '+state.year;$('save-dialog').showModal();$('query-name').focus();});
  $('cancel-save').addEventListener('click',()=>$('save-dialog').close());
  $('save-form').addEventListener('submit',e=>{e.preventDefault();const name=$('query-name').value.trim();if(!name)return;const q={id:String(Date.now()),name,state:{...state},queue:$('queue').value};if(savedQueries.length>=20){$('save-status').textContent='Puedes guardar hasta 20 consultas. Elimina una antes de añadir otra.';$('save-dialog').close();return;}if(persistQueries([...savedQueries,q])){$('saved-query').value=q.id;$('delete-query').disabled=false;$('save-status').textContent='Consulta guardada en este navegador: '+name;}$('save-dialog').close();});
  $('saved-query').addEventListener('change',()=>{const q=savedQueries.find(x=>x.id===$('saved-query').value);$('delete-query').disabled=!q;if(q){applySaved(q);$('save-status').textContent='Consulta aplicada: '+q.name;}});
  $('delete-query').addEventListener('click',()=>{if(persistQueries(savedQueries.filter(q=>q.id!==$('saved-query').value)))$('save-status').textContent='Consulta eliminada de este navegador.';});
  $('column-options').innerHTML=columns.slice(1).map(([k,l])=>`<label><input type="checkbox" data-column="${k}" checked> ${l}</label>`).join('');
  $('column-options').addEventListener('change',e=>{const k=e.target.dataset.column;if(!k)return;e.target.checked?visibleColumns.add(k):visibleColumns.delete(k);renderQueue();});
  $('rows-per-page').addEventListener('change',()=>{pageSize=Number($('rows-per-page').value);queuePage=1;renderQueue();});
  $('queue-prev').addEventListener('click',()=>{queuePage--;renderQueue();});$('queue-next').addEventListener('click',()=>{queuePage++;renderQueue();});
  $('territory-prev').addEventListener('click',()=>{territoryPage--;renderTerritoryTable();});$('territory-next').addEventListener('click',()=>{territoryPage++;renderTerritoryTable();});
  $('territory-search').addEventListener('input',()=>{territoryPage=1;renderTerritoryTable();});$('clear-zone').addEventListener('click',()=>chooseZone('todos'));
  document.addEventListener('click',e=>{
    const layout=e.target.closest('[data-layout]');if(layout?.tagName==='BUTTON'){$('territory-workspace').dataset.layout=layout.dataset.layout;document.querySelectorAll('button[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b===layout)));drawMap();}
    const sort=e.target.closest('[data-queue-sort]');if(sort){const key=sort.dataset.queueSort;queueSort={key,dir:queueSort.key===key?-queueSort.dir:1};queuePage=1;renderQueue();document.querySelector('[data-queue-sort="'+key+'"]').focus();}
    const ts=e.target.closest('[data-territory-sort]');if(ts){const key=ts.dataset.territorySort;territorySort={key,dir:territorySort.key===key?-territorySort.dir:key==='nombre'?1:-1};territoryPage=1;renderTerritoryTable();document.querySelector('[data-territory-sort="'+key+'"]').focus();}
    const record=e.target.closest('[data-case]');if(record)openCase(record.dataset.case);
    const reset=e.target.closest('[data-reset-filter]');if(reset){const k=reset.dataset.resetFilter;state[k]=defaults[k];if(k!=='zone')$(k).value=state[k];if(['geo','level'].includes(k))state.zone='todos';queuePage=territoryPage=1;update();}
  });
  $('report-title').addEventListener('input',renderReport);
  renderSaved();

  restore();$('more-filters').open=['category','phase','measure'].some(k=>state[k]!=='todos');update();setView(state.view);
  window.__MADRID__={get state(){return{...state};},get totals(){return totals(pool,D,state);},get rows(){return[...rows.values()].map(({cases,...r})=>r);},API};
})();
