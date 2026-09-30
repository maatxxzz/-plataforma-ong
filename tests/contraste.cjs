const { chromium } = require('playwright');
const assert = require('node:assert/strict');
function luminance(rgb) {
  return rgb.map(v=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[0.2126,0.7152,0.0722][i],0);
}
function ratio(a,b) {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
function hex(rgb) {return '#'+rgb.map(x=>x.toString(16).padStart(2,'0')).join('');}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  const p=await browser.newPage();await p.route('https://**/*',r=>r.abort());
  await p.goto((process.env.SPA_BASE_URL||'http://127.0.0.1:8000')+'/#/cadastro');await p.waitForFunction(()=>document.title.startsWith('Participe'));
  for(const mode of ['normal','alto']) {
   if(mode==='alto'){await p.locator('#alternar-contraste').focus();await p.keyboard.press('Enter');}
   assert.equal(await p.locator('html').getAttribute('data-contraste'),mode);
   if(mode==='alto') {
    // Verifica a entrada imediata, sem esperar o fim de uma animação.
    assert.deepEqual(await p.locator('#d-nome').evaluate(e=>({
      text:getComputedStyle(e).color, bg:getComputedStyle(e).backgroundColor
    })), {text:'rgb(255, 255, 255)', bg:'rgb(0, 0, 0)'});
   }
   for(const selector of ['body','header .marca','#alternar-contraste','main > .dica','#d-nome']) {
    const colors=await p.locator(selector).evaluate(e=>{
     const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
     let bg=getComputedStyle(e).backgroundColor;let parent=e;
     while((bg==='rgba(0, 0, 0, 0)'||bg==='transparent')&&parent.parentElement){parent=parent.parentElement;bg=getComputedStyle(parent).backgroundColor;}
     return {text:rgb(getComputedStyle(e).color),bg:rgb(bg)};
    });
    const value=ratio(colors.text,colors.bg);assert(value>=4.5,`${selector} ${mode}: ${value}`);
    console.log(`${mode} | ${selector} | ${hex(colors.text)} / ${hex(colors.bg)} | ${value.toFixed(2)}:1`);
   }
  }
  await p.reload();await p.waitForFunction(()=>document.title.startsWith('Participe'));assert.equal(await p.locator('#alternar-contraste').getAttribute('aria-pressed'),'true');
  await p.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked')};});await p.locator('#alternar-contraste').click();assert.equal(await p.locator('html').getAttribute('data-contraste'),'normal');
  const system=await browser.newContext({contrast:'more'});const q=await system.newPage();await q.route('https://**/*',r=>r.abort());await q.goto((process.env.SPA_BASE_URL||'http://127.0.0.1:8000')+'/');await q.waitForFunction(()=>document.documentElement.dataset.contraste==='alto');await system.close();
  console.log('PASS contraste >=4.5, teclado, persistência, falha de storage e preferência do sistema');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
