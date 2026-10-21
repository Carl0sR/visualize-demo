const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),D=JSON.parse(fs.readFileSync(path.join(root,'datos/poc-madrid/operativo.json'),'utf8'));
const api=require('../assets/madrid.js');
const original=JSON.parse(fs.readFileSync(path.join(root,'datos/poc-madrid/expedientes.json'),'utf8')).expedientes;
const allFacts=JSON.parse(fs.readFileSync(path.join(root,'datos/poc-madrid/hechos.json'),'utf8')).hechos;
assert.equal(D.casos.length,4800);assert.equal(new Set(D.casos.map(c=>c.id)).size,4800);
assert.deepEqual(Object.fromEntries(Object.entries(D.zonas).map(([k,v])=>[k,v.length])),{municipio:179,distrito:21,barrio:131});
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/madrid-data.js'),'utf8'),ctx);
assert.equal(JSON.stringify(ctx.window.MADRID_DEMO),JSON.stringify(D),'El recurso JS debe coincidir con el JSON');
for(const c of D.casos){assert.equal(c.sintetico,true);assert.ok(c.id.startsWith('DEMO-EXP-'));assert.ok(c.apertura<=D.metadata.fecha_corte);if(c.cierre)assert.ok(c.apertura<c.cierre&&c.cierre<=D.metadata.fecha_corte);assert.equal(Boolean(c.condenados),c.resultado==='sentencia_condenatoria');assert.equal(c.condenados&c.hechos,c.condenados);for(const kind of ['hecho_zona','residencia_zona'])for(const [i,level] of ['municipio','distrito','barrio'].entries()){if(c[kind][i])assert.ok(D.zonas[level].some(z=>z.properties.id===c[kind][i]));}if(c.localizacion==='sin_localizar')assert.deepEqual(c.hecho_zona,[null,null,null]);if(c.localizacion==='municipio')assert.equal(c.hecho_zona[2],null);}
const expectedAll={expedientes:4800,hechos:6361,pendientes:1979,sentencias:2058,infracciones:2532,medidas:2058};
assert.deepEqual(api.totals(D.casos,D,api.defaults),expectedAll);
for(const year of ['2024','2025']){
  const state={...api.defaults,year};const cohort=api.selection(D,state);assert.equal(cohort.length,year==='2024'?2200:2600);
  const sum=api.aggregate(D,state,cohort);assert.equal([...sum.values()].reduce((n,r)=>n+r.expedientes,0),cohort.filter(c=>c.localizacion!=='sin_localizar').length);
  const byQuarter=[1,2,3,4].reduce((n,q)=>n+api.selection(D,{...state,quarter:String(q)}).length,0);assert.equal(byQuarter,cohort.length);
  for(const category of D.categorias){
    const filtered={...state,category:category.id},cases=api.selection(D,filtered),ids=new Set(cases.map(c=>c.id));
    const expected=allFacts.filter(f=>f.categoria_id===category.id&&original.find(c=>c.id===f.expediente_id).fecha_apertura.startsWith(year));
    assert.equal(cases.length,new Set(expected.map(f=>f.expediente_id)).size);
    assert.equal(api.totals(cases,D,filtered).infracciones,expected.filter(f=>f.condena_simulada).length);
  }
  const residence={...state,geo:'residencia'};const sums=api.aggregate(D,residence,api.selection(D,residence));assert.equal([...sums.values()].reduce((n,r)=>n+r.expedientes,0),cohort.length);
}
const threats={...api.defaults,category:'6.2',level:'barrio'};const threatCases=api.selection(D,threats);
assert.ok(api.totals(threatCases,D,threats).hechos>=api.totals(threatCases,D,threats).infracciones);
assert.equal(api.selection(D,{...api.defaults,zone:'28079'},null,true).every(c=>c.hecho_zona[0]==='28079'),true);
assert.equal(api.selection(D,{...api.defaults,phase:'pendiente'}).every(c=>c.estado!=='cerrado'),true);
assert.equal(api.selection(D,{...api.defaults,measure:'Libertad vigilada'}).every(c=>c.medida==='Libertad vigilada'),true);
assert.equal(api.selection(D,{...api.defaults,category:'13.1'},'2023').length,0);
const html=fs.readFileSync(path.join(root,'madrid.html'),'utf8');assert.doesNotMatch(html,/<script[^>]+src="https?:/i);assert.doesNotMatch(html,/type="file"/i);assert.match(html,/DATOS JUDICIALES FICTICIOS/);
new vm.Script(fs.readFileSync(path.join(root,'assets/madrid.js'),'utf8'));
console.log('OK: 4.800 expedientes ficticios, unidades, categorías, cohortes, pendientes, referencias territoriales, ausencias y conservación de totales por residencia.');
