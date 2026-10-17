const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.argv[2]||'http://localhost:8765';
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox']});
const errors=[],context=await browser.newContext({acceptDownloads:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
await page.goto(base);await page.waitForSelector('#chapter-inicio h1');
const ids=['inicio','fuentes','dimension','evolucion','edad','sexo','territorio','digital','acoso','intimidad','contexto','conclusiones'];
for(const width of [320,390,768,1024,1440]){
 await page.setViewportSize({width,height:1000});
 for(let i=0;i<ids.length;i++){
  if(width<=850)await page.selectOption('#chapter-select',String(i));else await page.click(`#chapter-nav [data-goto="${i}"]`);
  await page.waitForSelector('#chapter-'+ids[i]+':visible');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`${width}px / ${ids[i]}: desbordamiento`);
 }
 console.log('OK: 12 capítulos sin desbordamiento a '+width+'px');
}
await page.goto(base+'/#edad');await page.selectOption('#age-select','13.6');assert.match(await page.locator('#age-detail').innerText(),/491/);await page.click('#age-share');assert.equal(await page.locator('#age-share').getAttribute('aria-pressed'),'true');assert.match(await page.locator('#age-chart').innerText(),/33,4/);
await page.goto(base+'/#sexo');await page.selectOption('#sex-select','20.5');assert.match(await page.locator('#sex-detail').innerText(),/Base pequeña/);assert.match(await page.locator('#sex-detail').innerText(),/58,8/);
await page.goto(base+'/#territorio');await page.selectOption('#territory-scope','subset');await page.selectOption('#territory-select','13');assert.match(await page.locator('#territory-detail').innerText(),/7\.229/);assert.match(await page.locator('#territory-detail').innerText(),/2\.148/);await page.selectOption('#territory-measure','rate');assert.match(await page.locator('#territory-chart-title').innerText(),/1.000/);
await page.goto(base+'/#digital');await page.selectOption('#digital-select','10.1');assert.match(await page.locator('#digital-detail').innerText(),/203/);
await page.goto(base+'/#contexto');await page.click('[data-factor="desinhibicion"]');assert.match(await page.locator('#factor-content').innerText(),/Distancia y desinhibición/);
await page.goto(base+'/#fuentes');await page.click('[data-term="ejecucion"]');assert.match(await page.locator('#term-detail').innerText(),/única medida/);
await page.click('#open-library');await page.click('[data-library-tab="data"]');await page.fill('#data-search','lesiones');assert.equal(await page.locator('#library-table tbody tr').count(),1);
const downloadPromise=page.waitForEvent('download');await page.click('#download-csv');const download=await downloadPromise;const csv=fs.readFileSync(await download.path(),'utf8');assert.match(csv,/Lesiones/);assert.match(csv,/8104/);
await page.selectOption('#library-dataset','territories');await page.fill('#data-search','Madrid');assert.equal(await page.locator('#library-table tbody tr').count(),1);
await page.click('[data-library-tab="coverage"]');assert.equal(await page.locator('.coverage').count(),23);
for(const tab of ['sources','data','corrections','original','coverage']){await page.click(`[data-library-tab="${tab}"]`);for(const width of [320,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Biblioteca ${tab} ${width}`);}}
await page.goto(base+'/#edad');await page.selectOption('#age-select','10.1');await page.click('#next');await page.goBack();await page.waitForSelector('#chapter-edad:visible');
// Enlaces locales: comprueba que todos los ficheros y descargas existen.
const localPaths=['index.html','assets/app.js','assets/styles.css','assets/data.js','assets/favicon.svg','datos/justicia-juvenil.json','datos/original-pptx.json','docs/analisis-previo.md','docs/metodologia.md','archivo/decision-studio.html',...[26027,26028,26029,26030].map(id=>'datos/origen/ine-'+id+'-2025.csv')];
for(const p of localPaths){const r=await context.request.get(base.replace(/\/$/,'')+'/'+p);assert.equal(r.status(),200,p);}
// Teclado y movimiento reducido.
await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);await page.keyboard.press('Tab');assert.match(await page.locator(':focus').innerText(),/Saltar al contenido/);
await page.locator('h1').click();await page.setViewportSize({width:1440,height:1000});fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});await page.screenshot({path:path.join(__dirname,'../test-results/desktop.png'),fullPage:true});await page.goto(base+'/#territorio');await page.screenshot({path:path.join(__dirname,'../test-results/territorio.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.goto(base+'/#edad');await page.screenshot({path:path.join(__dirname,'../test-results/mobile.png'),fullPage:true});
assert.deepEqual(errors,[]);console.log('OK: selectores, denominadores, CSV, 23 diapositivas, biblioteca, historial, archivos y teclado; sin errores JS.');await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
