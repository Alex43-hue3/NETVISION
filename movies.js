/* NETVISION CATALOG — Películas y Series desde las APIs reales */
'use strict';
(function(){
  const C={mode:'movies',page:1,items:[],hasNext:false,busy:false};
  function setText(id,v){const e=NV.$(id);if(e)e.textContent=v||''}
  function placeholder(title){return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750"><rect width="100%" height="100%" fill="#101827"/><text x="50%" y="50%" fill="#7481ff" font-size="32" text-anchor="middle" font-family="Arial">${title}</text></svg>`)}
  function render(items,mode){
    const g=NV.$('#catalogGrid'); if(!g)return; g.innerHTML='';
    if(!items.length){g.innerHTML=`<div class="empty-catalog"><i class="fa-solid fa-film"></i><h2>No se encontró contenido</h2><p>La API no devolvió contenido. Revisa la conexión o intenta actualizar.</p><button id="retryCatalog" class="primary-btn">Reintentar</button></div>`;NV.$('#retryCatalog').onclick=()=>NVCatalog.load(mode);return;}
    items.forEach(item=>{
      const c=document.createElement('article'); c.className='catalog-card';
      const img=item.image||item.banner||placeholder('NETVISION');
      c.innerHTML=`<div class="catalog-poster"><img src="${NV.esc(img)}" alt="${NV.esc(item.title)}" loading="lazy"><span class="rating">★ ${NV.esc(item.rating||'—')}</span><button class="play-card" aria-label="Abrir"><i class="fa-solid fa-play"></i></button></div><div class="catalog-info"><h3>${NV.esc(item.title)}</h3><span>${NV.esc(item.year||'')} · ${mode==='movies'?'Película':'Serie'}</span></div>`;
      c.onclick=()=>NV.openMedia(item,mode); c.querySelector('.play-card').onclick=e=>{e.stopPropagation();NV.openMedia(item,mode)}; g.appendChild(c);
    });
  }
  window.NVCatalog={...C,async load(mode){this.mode=mode;this.page=1;this.items=[];setText('#catalogTitle',mode==='movies'?'Películas':'Series');setText('#catalogEyebrow',mode==='movies'?'PELÍCULAS':'SERIES');setText('#catalogSubtitle',mode==='movies'?'Contenido obtenido desde PelisPlusHD / LaMovie.':'Series, temporadas y episodios desde PelisPlusHD / LaMovie.');await this.more(true)},async more(first=false){if(this.busy)return;this.busy=true;NV.show('#catalogLoading');try{const r=await NVApi.list(this.mode,this.page);if(first)this.items=[];this.items.push(...r.items);this.hasNext=r.hasNext;render(this.items,this.mode);const more=NV.$('#catalogMore');more?.classList.toggle('hidden',!this.hasNext);if(r.errors?.length && !r.items.length)NV.toast('Las APIs no respondieron correctamente.');if(r.items.length)this.page++;}catch(e){console.error(e);NV.toast('Error consultando el catálogo');}finally{this.busy=false;NV.hide('#catalogLoading')}}};
  window.NVCatalog.load=NVCatalog.load.bind(NVCatalog);window.NVCatalog.more=NVCatalog.more.bind(NVCatalog);
  NV.$('#catalogMore')?.addEventListener('click',()=>NVCatalog.more());
})();
