const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.APOD_NODE_MODULES ? path.join(process.env.APOD_NODE_MODULES, 'playwright') : 'playwright');
(async () => {
 const browser = await chromium.launch({headless:true, channel:'msedge'});
 try {
  const page = await browser.newPage();
  await page.route('https://app.test/**', r => r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));
  await page.route(/https:\/\/(cdn.tailwindcss.com|fonts.googleapis.com).*/,r=>r.abort());
  await page.route('https://science.nasa.gov/**',r=>r.fulfill({json:[]}));
  await page.goto('https://app.test/');
  const result = await page.evaluate(async () => {
   const assert = (x,m) => {if(!x) throw new Error(m)};
   const article='https://science.nasa.gov/image-article/apod-example/';
   const fixture={date:'2026-09-10',title:'NASA Science',media_type:'image',permalink:article,url:article,hdurl:'https://assets.science.nasa.gov/apod/broken.jpg',explanation:'<strong>Explanation:</strong> A &amp; B<br>stars',basic_html:'<title>APOD: 2026 September 10 - Giraffe Nebula</title><body><a href="https://assets.science.nasa.gov/apod/full.jpg"><img src="https://assets.science.nasa.gov/apod/small.jpg"></a><img src="https://science.nasa.gov/nasa-logo.png"></body>'};
   const data=normalizeApod([fixture]);
   assert(data.title==='Giraffe Nebula','title fallback');
   assert(data.explanation==='Explanation: A & B\nstars','HTML decoding');
   assert(data.candidates.length===3 && !data.candidates.includes(article),'image candidates');
   assert(normalizeApod({...fixture,hdurl:null,basic_html:''}).candidates.length===0,'article must not be image');
   let empty=false;try{normalizeApod([])}catch{empty=true} assert(empty,'empty API');
   window.fetch=async (url,options)=> url.startsWith(APOD_ENDPOINT.split('?')[0]) ? {ok:true,json:async()=>[fixture]} : {ok:true,json:async()=>({candidates:[{content:{parts:[{text:'翻訳成功'}]}}]})};
   await fetchApod('saved-nasa','gemini');
   const img=document.getElementById('apod-img');
   img.onerror(); assert(img.src.endsWith('/full.jpg'),'HD fallback');
   img.onerror(); assert(img.src.endsWith('/small.jpg'),'small fallback');
   img.onload(); assert(currentImgUrl.endsWith('/small.jpg'),'successful image');
   img.onerror(); assert(!currentImgUrl && !document.getElementById('media-error').classList.contains('hidden'),'exhausted fallback');
   assert(document.getElementById('explanation-ja').textContent==='翻訳成功','translation preserved');
   fixture.media_type='video';await fetchApod('saved-nasa','gemini');
   assert(document.getElementById('apod-title').textContent==='Giraffe Nebula','video title');
   assert(document.getElementById('media-error').textContent.includes('静止画'),'video message');
   fixture.media_type='image';await fetchApod('saved-nasa','gemini');
   assert(document.getElementById('media-error').classList.contains('hidden'),'reset media error');
   document.getElementById('nasa-key').value='old-key';document.getElementById('gemini-key').value='translation-key';
   persistConfigKeys();assert(localStorage.getItem(STORAGE.NASA)==='old-key' && localStorage.getItem(STORAGE.GEMINI)==='translation-key','settings persisted');
   window.fetch=async()=>({ok:false,status:503,json:async()=>({message:'Unavailable'})});
   await fetchApod('old-key','translation-key');
   assert(document.getElementById('error-display').textContent.includes('Unavailable'),'API error');
   return 'PASS: normalization, image fallbacks, media reset, translation, settings, API errors';
  });
  console.log(result);
  const live=JSON.parse(fs.readFileSync('tests/fixtures/apod.json','utf8').replace(/^\uFEFF/,''));
  console.log(await page.evaluate(d=>{const n=normalizeApod(d);if(!n.candidates.length || n.title==='NASA Science')throw Error('live normalization');return 'PASS: real NASA response: '+n.title},live));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
