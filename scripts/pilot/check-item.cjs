const fs=require('node:fs'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const mode=process.argv[2];
if(mode==='readme'){
 const s=fs.readFileSync('README.md','utf8');
 assert.doesNotMatch(s,/cuatro diapositivas/i,'README conserva la referencia obsoleta a cuatro diapositivas');
 assert.match(s,/siete diapositivas/i);assert.match(s,/docs\/presentacion\.md/);assert.match(s,/docs\/piloto-madrid\.md/);
}else if(mode==='mapa'){
 const s=fs.readFileSync('docs/mapa-repositorio.md','utf8');
 for(const name of ['index.html','madrid.html','presentacion.html','scripts/check-data.cjs','scripts/check-deck.cjs','scripts/check-madrid.cjs','assets/data.js','assets/madrid-data.js']) assert.ok(s.includes(name),'Falta '+name);
 assert.match(s,/fictici|sintétic/i);assert.match(s,/generad/i);assert.match(s,/python3 -m http.server/);
}else if(mode==='empty'){
 const file='scripts/pilot/empty-selection.test.cjs';assert.ok(fs.existsSync(file),'Falta prueba de selección vacía');
 const s=fs.readFileSync(file,'utf8');assert.match(s,/selection/);assert.match(s,/totals/);assert.match(s,/deepEqual|deepStrictEqual/);
 const r=spawnSync(process.execPath,['--test',file],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}else throw Error('Comprobación desconocida');
console.log('OK: criterio del piloto '+mode);
