const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
for(const file of ['scripts/check-data.cjs','scripts/check-deck.cjs','scripts/check-madrid.cjs']){
 const r=spawnSync(process.execPath,[file],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
const tests=fs.readdirSync('scripts/pilot').filter(f=>f.endsWith('.test.cjs')).map(f=>'scripts/pilot/'+f);
if(tests.length){const r=spawnSync(process.execPath,['--test',...tests],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
