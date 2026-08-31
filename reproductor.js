/* NETVISION REPRODUCTOR v6 — resolución robusta de MP4/HLS y proxy_url */
'use strict';
function setMedia(item,mode){
 NV.$('#mediaTypeLabel').textContent=mode==='series'?'SERIE':'PELÍCULA';
 NV.$('#mediaTitle').textContent=item.title||'Sin título';
 NV.$('#mediaPoster').src=item.image||item.banner||'';
 NV.$('#mediaMeta').textContent=[item.year,item.rating?`★ ${item.rating}`:'',mode==='series'?'Serie':'Película'].filter(Boolean).join(' · ');
 NV.$('#mediaDescription').textContent=item.description||'Información entregada por la API.';
}
function resetMedia(){
 const v=NV.$('#mediaVideo'),f=NV.$('#mediaFrame');
 if(NV.state.mediaHls){try{NV.state.mediaHls.destroy()}catch{}NV.state.mediaHls=null}
 v.pause();v.removeAttribute('src');v.load();f.src='about:blank';
}
async function playSource(u){
 const v=NV.$('#mediaVideo'),f=NV.$('#mediaFrame');
 if(!u)return false;
 NV.hide('#mediaEmpty');f.classList.add('hidden');v.classList.remove('hidden');
 if(NV.state.mediaHls){try{NV.state.mediaHls.destroy()}catch{}NV.state.mediaHls=null}
 if(/\.m3u8($|\?)/i.test(u)&&window.Hls&&Hls.isSupported()){
   return await new Promise(resolve=>{
     const h=new Hls({enableWorker:true,maxBufferLength:30});NV.state.mediaHls=h;let done=false;
     const finish=ok=>{if(done)return;done=true; if(!ok){try{h.destroy()}catch{}NV.state.mediaHls=null} resolve(ok)};
     h.loadSource(u);h.attachMedia(v);
     h.on(Hls.Events.MANIFEST_PARSED,()=>{v.play().then(()=>finish(true)).catch(()=>finish(true))});
     h.on(Hls.Events.ERROR,(_,data)=>{if(data?.fatal)finish(false)});
     setTimeout(()=>finish(false),12000);
   });
 }
 if(/\.(mp4|webm|ogg)(\?|$)/i.test(u)){
   return await new Promise(resolve=>{
     let done=false;const finish=ok=>{if(done)return;done=true;resolve(ok)};
     v.src=u;v.onloadedmetadata=()=>{v.play().catch(()=>{});finish(true)};v.onerror=()=>finish(false);setTimeout(()=>finish(false),10000);
   });
 }
 if(/^https?:\/\//i.test(u)){
   v.classList.add('hidden');f.classList.remove('hidden');f.src=u;return true;
 }
 return false;
}
async function playSources(urls){
 const ordered=[...new Set((urls||[]).filter(Boolean))];
 for(const u of ordered){
   console.log('[NETVISION] Probando fuente:',u);
   const ok=await playSource(u);
   if(ok)return true;
 }
 return false;
}
function renderEpisodes(episodes){
 const p=NV.$('#episodesPanel');
 if(!episodes.length){p.classList.add('hidden');return}
 p.classList.remove('hidden');
 const groups={};episodes.forEach(e=>(groups[e.season||'1']??=[]).push(e));
 const seasons=Object.keys(groups).sort((a,b)=>Number(a)-Number(b));
 NV.$('#seasonTitle').textContent=seasons.length>1?`Temporadas (${seasons.length})`:`Temporada ${seasons[0]}`;
 NV.$('#episodeList').innerHTML=seasons.map(season=>`<div class="season-block"><h3>Temporada ${NV.esc(season)}</h3>${groups[season].map((e,i)=>`<button class="episode-item" data-season="${NV.esc(season)}" data-idx="${i}"><span>${NV.esc(e.number)}</span><strong>${NV.esc(e.title)}</strong><i class="fa-solid fa-play"></i></button>`).join('')}</div>`).join('');
 NV.$$('#episodeList .episode-item').forEach(b=>b.onclick=async()=>{
   const season=b.dataset.season,idx=+b.dataset.idx,e=groups[season][idx];
   NV.show('#mediaLoading');NV.hide('#mediaEmpty');
   try{
     const ex=await NVApi.resolveEpisode(e);
     const urls=[...(ex.urls||[]),...(ex.embeds||[])];
     const ok=await playSources(urls);
     if(!ok){NV.show('#mediaEmpty');NV.$('#mediaEmpty strong').textContent='No se encontró una fuente reproducible para este episodio';}
   }catch(err){console.error(err);NV.show('#mediaEmpty')}
   finally{NV.hide('#mediaLoading')}
 });
}
NV.openMedia=async(item,mode)=>{
 NV.stopMedia();NV.state.currentMedia={item,mode};NV.setView('media');setMedia(item,mode);NV.show('#mediaLoading');NV.hide('#mediaEmpty');
 try{
   const ex=await NVApi.resolve(item,mode);
   if(mode==='series')renderEpisodes(ex.episodes||[]);
   const urls=[...(ex.urls||[]),...(ex.embeds||[])];
   NV.hide('#mediaLoading');
   if(mode==='series' && !(ex.episodes||[]).length){
     const ok=await playSources(urls);
     if(!ok){NV.show('#mediaEmpty');NV.$('#mediaEmpty strong').textContent='No se encontraron episodios ni una fuente reproducible';}
     return;
   }
   const ok=await playSources(urls);
   if(!ok){NV.show('#mediaEmpty');NV.$('#mediaEmpty strong').textContent=mode==='series'?'Selecciona un episodio para reproducir':'No se encontró una fuente reproducible';NV.$('#mediaEmpty small').textContent='La API no entregó una fuente compatible con el navegador.';}
 }catch(e){console.error(e);NV.hide('#mediaLoading');NV.show('#mediaEmpty');NV.$('#mediaEmpty strong').textContent='No se pudo consultar la fuente';NV.$('#mediaEmpty small').textContent=e.message||'Error de conexión';}
};
NV.$('#mediaRetry').onclick=()=>{const m=NV.state.currentMedia;if(m)NV.openMedia(m.item,m.mode)};
NV.$('#mediaBack').onclick=()=>{const m=NV.state.currentMedia;NV.stopMedia();NV.setView(m?.mode||'home')};
NV.$('#closeEpisodes').onclick=()=>NV.$('#episodesPanel').classList.add('hidden');
NV.$('#mediaFullscreen').onclick=async()=>{const p=NV.$('#mediaPlayer');if(!document.fullscreenElement){try{await p.requestFullscreen({navigationUI:'hide'})}catch{p.classList.add('pseudo-fullscreen')}}else document.exitFullscreen?.()};
document.addEventListener('fullscreenchange',()=>NV.$('#mediaPlayer')?.classList.toggle('is-fullscreen',document.fullscreenElement===NV.$('#mediaPlayer')));
NV.openSearch=()=>{NV.$('#searchModal').classList.remove('hidden');NV.$('#globalSearch').focus()};
NV.$$('#searchModal [data-close-search]').forEach(b=>b.onclick=()=>NV.$('#searchModal').classList.add('hidden'));
