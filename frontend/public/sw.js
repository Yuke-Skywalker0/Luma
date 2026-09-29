const CACHE='luma-shell-v690';
const SHELL=['./','./manifest.webmanifest','./update.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url); if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/update.json')||url.pathname.endsWith('/sw.js')){
  event.respondWith(fetch(new Request(event.request,{cache:'no-store'})).catch(()=>caches.match(event.request))); return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return response;}).catch(()=>cached)));
});
