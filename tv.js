/* NETVISION TV v4 — M3U, categorías visibles, cambio de canal y fullscreen */
'use strict';
function parseM3U(text){
 const out=[]; let meta=null;
 for(const raw of text.split(/\r?\n/)){
  const line=raw.trim(); if(!line)continue;
  if(line.startsWith('#EXTINF')){
   const comma=line.indexOf(','); const info=comma>=0?line.slice(0,comma):line; const name=comma>=0?line.slice(comma+1).trim():'Canal'; const a={};
   for(const m of info.matchAll(/([\w-]+)="([^"]*)"/g))a[m[1]]=m[2];
   meta={name,group:a['group-title']||'Otros',logo:a['tvg-logo']||'',id:a['tvg-id']||name};
  }else if(!line.startsWith('#')&&meta){out.push({...meta,url:line});meta=null}
 }
 return out;
}
async function loadM3U(){
 try{const r=await fetch('canales.m3u?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error(r.status);NV.state.channels=parseM3U(await r.text());NV.state.filteredChannels=NV.state.channels.slice();NV.state.category='Todos';renderCategories();renderChannels();}
 catch(e){console.error(e);NV.toast('No se pudo cargar canales.m3u')}
}
function groups(){return ['Todos',...new Set(NV.state.channels.map(c=>c.group||'Otros').filter(Boolean))]}
function categoryButtons(){return groups().map(g=>`<button class="category-tab ${g===NV.state.category?'active':''}" data-group="${NV.esc(g)}"><span>${NV.esc(g)}</span><b>${g==='Todos'?NV.state.channels.length:NV.state.channels.filter(c=>c.group===g).length}</b></button>`).join('')}
function renderCategories(){
 const html=categoryButtons();
 const side=NV.$('#categoryTabs');
 if(side){
   side.innerHTML=html;
   NV.$$('#categoryTabs .category-tab').forEach(b=>b.onclick=()=>{
     NV.state.category=b.dataset.group;
     renderCategories();
     renderChannels();
   });
 }
}
function renderChannels(){
 const q=NV.norm(NV.$('#channelSearch')?.value); let a=NV.state.channels.filter(c=>NV.state.category==='Todos'||c.group===NV.state.category); if(q)a=a.filter(c=>NV.norm(c.name).includes(q)||NV.norm(c.group).includes(q));
 NV.state.filteredChannels=a; NV.$('#categoryTitle').textContent=NV.state.category==='Todos'?'Todos los canales':NV.state.category;
 NV.$('#channelList').innerHTML=a.map((c,i)=>`<button class="channel-item ${NV.state.channelIndex===NV.state.channels.indexOf(c)?'active':''}" data-i="${i}"><span class="channel-logo">${c.logo?`<img src="${NV.esc(c.logo)}" alt="">`:'<i class="fa-solid fa-tv"></i>'}</span><span><strong>${NV.esc(c.name)}</strong><small>${NV.esc(c.group)}</small></span><i class="fa-regular fa-star"></i></button>`).join('');
 NV.$$('#channelList .channel-item').forEach(b=>b.onclick=()=>playChannel(+b.dataset.i));
}
function playChannel(i){
 const c=NV.state.filteredChannels[i]; if(!c)return; NV.state.channelIndex=NV.state.channels.indexOf(c); const v=NV.$('#tvVideo');
 NV.hide('#tvEmpty'); NV.$('#tvCurrentName').textContent=c.name;NV.$('#tvCurrentGroup').textContent=c.group;NV.$('#tvNowName').textContent=c.name;NV.$('#tvNowGroup').textContent=c.group;NV.$('#tvLogo').innerHTML=c.logo?`<img src="${NV.esc(c.logo)}">`:'<i class="fa-solid fa-tv"></i>';
 if(NV.state.tvHls){try{NV.state.tvHls.destroy()}catch{}NV.state.tvHls=null} v.pause();v.removeAttribute('src');v.load();
 if(/\.m3u8($|\?)/i.test(c.url)&&window.Hls&&Hls.isSupported()){NV.state.tvHls=new Hls({enableWorker:true,lowLatencyMode:true});NV.state.tvHls.loadSource(c.url);NV.state.tvHls.attachMedia(v);NV.state.tvHls.on(Hls.Events.MANIFEST_PARSED,()=>v.play().catch(()=>{}))}else{v.src=c.url;v.play().catch(()=>{})}
 renderChannels();
}
NV.changeChannel=dir=>{const a=NV.state.filteredChannels;if(!a.length)return;let p=a.findIndex(c=>NV.state.channels.indexOf(c)===NV.state.channelIndex);if(p<0)p=0;playChannel((p+dir+a.length)%a.length)};
NV.$('#channelSearch').oninput=renderChannels;NV.$('#openSidebar').onclick=()=>NV.$('#channelSidebar').classList.add('open');NV.$('#closeSidebar').onclick=()=>NV.$('#channelSidebar').classList.remove('open');NV.$('#tvPrev').onclick=()=>NV.changeChannel(-1);NV.$('#tvNext').onclick=()=>NV.changeChannel(1);NV.$('#fsPrev').onclick=()=>NV.changeChannel(-1);NV.$('#fsNext').onclick=()=>NV.changeChannel(1);NV.$('#fsClose').onclick=()=>document.exitFullscreen?.();
NV.$('#tvFullscreen').onclick=async()=>{const p=NV.$('#tvPlayer');if(!document.fullscreenElement){try{await p.requestFullscreen({navigationUI:'hide'})}catch{p.classList.add('pseudo-fullscreen')}}else document.exitFullscreen?.()};
document.addEventListener('fullscreenchange',()=>{const p=NV.$('#tvPlayer');const fs=document.fullscreenElement===p;p.classList.toggle('is-fullscreen',fs);});
const old=NV.setView;NV.setView=view=>{if(NV.state.view==='tv'&&view!=='tv')NV.stopTV();old(view);if(view==='tv'&&!NV.state.channels.length)loadM3U()};
loadM3U();
