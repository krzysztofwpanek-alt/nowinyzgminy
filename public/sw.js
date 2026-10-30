// Service worker: sieć najpierw, w razie braku internetu – ostatnio widziana kopia.
const C="nowiny-v1";
self.addEventListener("install",e=>{self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("message",e=>{if(e.data==="clear")caches.delete(C)});
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=="GET"||u.origin!==location.origin||u.pathname.startsWith("/api/"))return;
  e.respondWith(fetch(r).then(res=>{
    if(res.ok&&res.type==="basic"&&!res.redirected){const c=res.clone();caches.open(C).then(x=>x.put(r,c))}
    return res;
  }).catch(()=>caches.match(r).then(m=>m||(r.mode==="navigate"?caches.match("/"):undefined)||new Response("Brak połączenia",{status:503}))));
});
