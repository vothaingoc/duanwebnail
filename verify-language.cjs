const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, CookieJar, VirtualConsole } = require('jsdom');
const languages = ['ja', 'en', 'vi', 'zh', 'ko', 'my', 'id'];
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
const pages = walk('dist').filter(f => f.endsWith('.html'));
let assertions = 0;
function check(value, message) { assertions++; assert.ok(value, message); }
async function load(file, scenario = {}) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => { if (!/navigation|scrollTo/.test(error.message)) errors.push(error.message); });
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    url: 'https://golynnail.jp' + (scenario.url || '/' + path.relative('dist', file).replace(/\\/g, '/').replace(/index.html$/, '')),
    runScripts: 'outside-only', pretendToBeVisual: true, cookieJar: scenario.cookieJar || new CookieJar(), virtualConsole: console
  });
  const w = dom.window;
  Object.defineProperty(w.navigator, 'languages', { value: scenario.languages === undefined ? ['ja-JP','en-US'] : scenario.languages });
  Object.defineProperty(w.navigator, 'language', { value: scenario.languages?.[0] || '' });
  w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  w.scrollTo = () => {};
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.fetch = async url => {
    const file = path.join('dist', new URL(url, w.location.href).pathname);
    const text = fs.existsSync(file) && fs.statSync(file).isFile() ? fs.readFileSync(file, 'utf8') : '{}';
    return { ok:true, json:async()=>JSON.parse(text), text:async()=>text };
  };
  for (const [key,value] of Object.entries(scenario.local || {})) w.localStorage.setItem(key,value);
  if (scenario.session) for(const [key,value] of Object.entries(scenario.session)) w.sessionStorage.setItem(key,value);
  if (scenario.blockLocal) Object.defineProperty(w, 'localStorage', {get(){throw new w.DOMException('Blocked','SecurityError');}});
  if (scenario.blockSession) Object.defineProperty(w, 'sessionStorage', {get(){throw new w.DOMException('Blocked','SecurityError');}});
  if (scenario.blockCookies) Object.defineProperty(w.document, 'cookie', {get(){return '';},set(){}});
  if (scenario.country) w.document.cookie = 'golynCountry=' + scenario.country;
  const transitions=[];
  const observer=new w.MutationObserver(records=>{for(const r of records) if(r.attributeName==='lang')transitions.push(w.document.documentElement.lang);});
  observer.observe(w.document.documentElement,{attributes:true});
  for (const script of [...w.document.scripts]) {
    if (script.type === 'application/ld+json' || script.type === 'module') continue;
    const src=script.getAttribute('src');
    try { w.eval(src ? fs.readFileSync(path.join('dist',src.split('?')[0]),'utf8') : script.textContent); }
    catch(error){errors.push(error.stack);}
  }
  await new Promise(resolve=>{if(w.document.readyState==='loading')w.document.addEventListener('DOMContentLoaded',resolve,{once:true});else resolve();});
  await new Promise(resolve=>setImmediate(resolve));
  return {dom,w,errors,transitions};
}
const scenarios = [
  {name:'Japanese first',languages:['ja-JP','en-US'],lang:'ja',prompt:false},
  {name:'English first, Japanese second',languages:['en-US','ja-JP'],lang:'ja',prompt:true,suggest:'en'},
  {name:'Vietnamese first',languages:['vi-VN','ja-JP'],lang:'ja',prompt:true,suggest:'vi'},
  {name:'Unsupported first, Japanese second',languages:['fr-FR','ja-JP','en-US'],lang:'ja',prompt:true},
  {name:'Browser language unavailable',languages:[],lang:'ja',prompt:false},
  {name:'Saved deliberate choice',languages:['ja-JP'],local:{golynLang:'vi',golynLangUserSet:'true'},lang:'vi',prompt:false},
  {name:'Ignore obsolete automatic choice',languages:['ja-JP'],local:{golynLang:'en',golynLangAutoSource:'browser'},lang:'ja',prompt:false},
  {name:'URL beats saved choice',url:'/?lang=ko',local:{golynLang:'vi',golynLangUserSet:'true'},lang:'ko',prompt:false},
  {name:'Japanese URL beats saved choice',url:'/?lang=ja',local:{golynLang:'vi',golynLangUserSet:'true'},lang:'ja',prompt:false},
  {name:'Unsupported URL ignored',url:'/?lang=fr',languages:['ja-JP'],lang:'ja',prompt:false},
  {name:'Country cookie ignored',languages:['en-GB','ja-JP'],country:'JP',lang:'ja',prompt:true,suggest:'en'},
  {name:'Storage unavailable',languages:['vi-VN'],blockLocal:true,blockSession:true,blockCookies:true,lang:'ja',prompt:true,suggest:'vi'},
  {name:'Dismissed in this session',languages:['en-US'],session:{golynLanguagePromptHandled:'true'},lang:'ja',prompt:false}
];
(async()=>{
 for(const file of pages){
  for(const scenario of scenarios){
   const {dom,w,errors,transitions}=await load(file,scenario);
   const prefix=`${file}: ${scenario.name}`;
   check(errors.length===0,prefix+' script errors: '+errors.join('\n'));
   check(w.document.documentElement.lang===scenario.lang,prefix+' language');
   const dialog=w.document.querySelector('dialog[open]');
   check(!!dialog===scenario.prompt,prefix+' prompt');
   if(scenario.lang==='ja')check(transitions.every(lang=>lang==='ja'),prefix+' no language flash');
   check([...w.document.querySelectorAll('.lang-current-label')].every(el=>el.textContent==='言語 / Language'),prefix+' visible language label');
   if(dialog){
    check([...dialog.querySelectorAll('[data-language]')].map(b=>b.dataset.language).join(',')===languages.join(','),prefix+' supported options only');
    check((dialog.querySelector('.suggested')?.dataset.language||'')===(scenario.suggest||''),prefix+' first browser language suggestion only');
    dialog.querySelector('.golyn-language-close').click();
    check(!dialog.hasAttribute('open')&&w.document.documentElement.lang==='ja',prefix+' dismiss keeps Japanese');
   }
   // Every language remains selectable even when all storage mechanisms throw.
   for(const lang of languages){
    w.chooseLang(lang);
    check(w.document.documentElement.lang===lang,prefix+' manual '+lang);
    check(w.GolynLanguage.get()===lang,prefix+' shared state '+lang);
    check(new URL(w.location.href).searchParams.get('lang')===lang,prefix+' URL '+lang);
   }
   dom.window.close();
  }
  console.log('PASS '+file+': '+scenarios.length+' scenarios, all 7 manual choices');
 }
 const cookieJar=new CookieJar();
 let first=await load('dist/index.html',{languages:['en-US'],cookieJar});
 first.w.document.querySelector('.golyn-language-dismiss').click();first.dom.window.close();
 const second=await load('dist/gallery/index.html',{languages:['en-US'],cookieJar});
 check(!second.w.document.querySelector('dialog[open]'),'Cross-page dismissal remembered');
 second.w.chooseLang('vi');second.dom.window.close();
 const third=await load('dist/price-detail/index.html',{languages:['ja-JP'],cookieJar,blockLocal:true});
 check(third.w.document.documentElement.lang==='vi','Explicit cookie preference survives navigation without localStorage');
 check(!third.w.document.querySelector('dialog[open]'),'No prompt after deliberate choice');
 third.dom.window.close();
 const noStorage=await load('dist/index.html',{languages:['en-US'],blockLocal:true,blockSession:true,blockCookies:true});
 noStorage.w.document.querySelector('.golyn-language-close').click();
 const link=noStorage.w.document.querySelector('a[href="/gallery/"]');
 link.addEventListener('click',event=>event.preventDefault());
 link.dispatchEvent(new noStorage.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 check(link.href.endsWith('/gallery/?lang=ja'),'URL navigation fallback when storage/cookies unavailable');
 noStorage.w.chooseLang('en');
 link.dispatchEvent(new noStorage.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 check(link.href.endsWith('/gallery/?lang=en'),'Previously followed link updates after a new manual choice');
 const explicitLink=noStorage.w.document.createElement('a');
 explicitLink.href='/services/?lang=ko';noStorage.w.document.body.appendChild(explicitLink);
 explicitLink.addEventListener('click',event=>event.preventDefault());
 explicitLink.dispatchEvent(new noStorage.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 check(explicitLink.href.endsWith('/services/?lang=ko'),'An authored language link retains its own explicit language');
 noStorage.dom.window.close();
 console.log(`PASS ${pages.length} pages × ${scenarios.length} scenarios; ${assertions} assertions including navigation and storage failure.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
