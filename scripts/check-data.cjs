const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.join(__dirname,'..'),D=JSON.parse(fs.readFileSync(path.join(root,'datos/justicia-juvenil.json'),'utf8'));
const sum=a=>a.reduce((x,y)=>x+y,0),total=D.categories.find(c=>c.id==='total');
assert.equal(total.total,24279);assert.equal(sum(D.territories.map(t=>t.total)),total.total);assert.equal(D.territories.length,19);
assert.equal(sum(D.territories.filter(t=>t.subset).map(t=>t.total)),7229);
assert.equal(sum(D.categories.filter(c=>c.id!=='total'&&!c.id.includes('.')).map(c=>c.total)),total.total);
for(const c of D.categories){assert.equal(sum(Object.values(c.age)),c.total,'Edad: '+c.name);assert.equal(sum(Object.values(c.sex)),c.total,'Sexo: '+c.name);assert.equal(sum(Object.values(c.nationality)),c.total,'Nacionalidad: '+c.name);assert.ok(c.total>=0);}
for(const row of D.trends){assert.ok(row.values['2024']>0);assert.ok(row.values['2025']>=0);}
assert.equal(D.trends.find(t=>t.name==='Acoso escolar').values['2021'],null);
assert.equal(D.territories.find(t=>t.id===13).total,2148);
assert.equal(D.categories.find(c=>c.id==='13').total,7945);
assert.equal(D.categories.find(c=>c.id==='13.6').total,491);
const archived=fs.readFileSync(path.join(root,'archivo/decision-studio.html'));
assert.equal(crypto.createHash('sha256').update(archived).digest('hex'),'7dace552af35222a67e4d58a22ef9525b50d7afeacfc992093d6a46887cb2f39');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/data.js'),'utf8'),ctx);assert.equal(JSON.stringify(ctx.window.JUSTICIA_DATA),JSON.stringify(D));
new vm.Script(fs.readFileSync(path.join(root,'assets/app.js'),'utf8'));
console.log('OK: 46 categorías, 19 territorios, desgloses, series, datos JS y archivo original íntegro.');
