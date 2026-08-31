/* NETVISION PERFILES v4 — perfiles, avatares, fondos y gestión desde ajustes */
'use strict';
const PKEY='netvision_profiles_v7';
let editingId=null,creating=false,avatar='',background='';
const AVATARS=[
 'https://api.dicebear.com/10.x/adventurer/svg?seed=Alex&backgroundColor=111827',
 'https://api.dicebear.com/10.x/adventurer/svg?seed=Laura&backgroundColor=1d2440',
 'https://api.dicebear.com/10.x/lorelei/svg?seed=Diego&backgroundColor=171b31',
 'https://api.dicebear.com/10.x/lorelei/svg?seed=Kids&backgroundColor=241b36',
 'https://api.dicebear.com/10.x/bottts/svg?seed=Neo&backgroundColor=101a2d',
 'https://api.dicebear.com/10.x/personas/svg?seed=Nova&backgroundColor=20182f',
 'https://api.dicebear.com/10.x/pixel-art/svg?seed=Pixel&backgroundColor=111827',
 'https://api.dicebear.com/10.x/fun-emoji/svg?seed=Fun&backgroundColor=281d2e',
 'https://api.dicebear.com/10.x/thumbs/svg?seed=Star&backgroundColor=14202b',
 'https://api.dicebear.com/10.x/avataaars/svg?seed=Sky&backgroundColor=191d30',
 'https://api.dicebear.com/10.x/adventurer/svg?seed=Nova&backgroundColor=17233b',
 'https://api.dicebear.com/10.x/lorelei/svg?seed=Max&backgroundColor=211a35'
];
const BACKGROUNDS=[
 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=85',
 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1800&q=85'
];
function save(){localStorage.setItem(PKEY,JSON.stringify(NV.state.profiles))}
function img(u){return `<img src="${NV.esc(u)}" alt="Avatar">`}
function applyBackground(url){
 const safe=String(url||'').replace(/"/g,'&quot;');
 document.documentElement.style.setProperty('--profile-bg',safe?`url("${safe}")`:'none');
 document.documentElement.style.setProperty('--profile-bg-opacity',safe?'0.34':'0');
 document.body.style.setProperty('--profile-bg',safe?`url("${safe}")`:'none');
 document.body.style.backgroundImage=safe
   ? `linear-gradient(135deg,rgba(3,6,15,.78),rgba(5,8,18,.68) 48%,rgba(3,5,12,.84)),url("${safe}")`
   : 'radial-gradient(circle at 20% 10%,#18213e 0,#070a12 38%,#05070c 100%)';
 document.body.style.backgroundSize='cover';
 document.body.style.backgroundPosition='center';
 document.body.style.backgroundAttachment='fixed';
 const gate=NV.$('#profileGate');
 if(gate) gate.style.backgroundImage=safe
   ? `linear-gradient(135deg,rgba(3,6,15,.78),rgba(5,8,18,.72)),url("${safe}")`
   : '';
}
NV.renderProfiles=()=>{
 const box=NV.$('#profileList'); if(!box)return;
 box.innerHTML='';
 NV.state.profiles.forEach((p,i)=>{
   const b=document.createElement('button'); b.className='profile-choice';
   b.innerHTML=`<div class="profile-avatar">${img(p.avatar)}</div><strong>${NV.esc(p.name)}</strong><small>Entrar</small>`;
   b.onclick=()=>NV.enter(i); box.appendChild(b);
 });
 const add=document.createElement('button'); add.className='profile-choice add-profile';
 add.innerHTML='<div class="profile-avatar plus">+</div><strong>Agregar perfil</strong><small>Nuevo usuario</small>';
 add.onclick=()=>NV.openProfile(null,true); box.appendChild(add);
};
NV.openProfile=(id,force=false)=>{
 creating=!!force; editingId=force?null:(id||null);
 const p=editingId?NV.state.profiles.find(x=>x.id===editingId):null;
 avatar=p?.avatar||AVATARS[0]; background=p?.background||BACKGROUNDS[0];
 NV.$('#profileModalTitle').textContent=p?'Editar perfil':'Crear perfil';
 NV.$('#profileName').value=p?.name||'';
 NV.$('#deleteProfile').classList.toggle('hidden',!p);
 renderPicker(); NV.$('#profileModal').classList.remove('hidden');
};
function renderPicker(){
 NV.$('#editAvatar').innerHTML=img(avatar);
 NV.$('#avatarPicker').innerHTML=AVATARS.map((u,i)=>`<button type="button" class="avatar-option ${u===avatar?'active':''}" data-i="${i}">${img(u)}</button>`).join('');
 NV.$$('#avatarPicker .avatar-option').forEach(b=>b.onclick=()=>{avatar=AVATARS[+b.dataset.i];renderPicker()});
 NV.$('#backgroundPicker').innerHTML=BACKGROUNDS.map((u,i)=>`<button type="button" class="background-option ${u===background?'active':''}" data-i="${i}" style="background-image:linear-gradient(180deg,transparent,#050812aa),url('${u}')"><span>Fondo ${i+1}</span></button>`).join('');
 NV.$$('#backgroundPicker .background-option').forEach(b=>b.onclick=()=>{background=BACKGROUNDS[+b.dataset.i];applyBackground(background);renderPicker()});
 applyBackground(background);
}
NV.applyProfile=p=>{
 if(!p)return;
 NV.$('#hello').textContent=`Hola, ${p.name}`;
 NV.$('#profileMiniName').textContent=p.name;
 NV.$('#profileMiniAvatar').innerHTML=img(p.avatar);
 applyBackground(p.background||BACKGROUNDS[0]);
};
NV.$('#saveProfile').onclick=()=>{
 const name=NV.$('#profileName').value.trim(); if(!name){NV.toast('Escribe un nombre');return}
 if(editingId){
   const p=NV.state.profiles.find(x=>x.id===editingId); if(!p)return;
   Object.assign(p,{name,avatar,background}); NV.state.activeProfile=p; localStorage.setItem('netvision_active_v7',p.id);
   save(); NV.applyProfile(p); NV.renderProfiles(); NV.$('#profileModal').classList.add('hidden'); NV.toast('Perfil actualizado');
 }else{
   const p={id:crypto.randomUUID?.()||String(Date.now()),name,avatar,background};
   NV.state.profiles.push(p); save(); NV.renderProfiles(); NV.$('#profileModal').classList.add('hidden');
   if(creating) NV.enter(NV.state.profiles.length-1); else NV.toast('Perfil creado');
 }
};
NV.$('#deleteProfile').onclick=()=>{
 if(!editingId)return;
 if(!confirm('¿Eliminar este perfil?'))return;
 NV.state.profiles=NV.state.profiles.filter(p=>p.id!==editingId); save();
 if(NV.state.activeProfile?.id===editingId){NV.state.activeProfile=null;localStorage.removeItem('netvision_active_v7');applyBackground('');}
 NV.$('#profileModal').classList.add('hidden'); NV.renderProfiles();
 if(!NV.state.profiles.length){NV.$('#app').classList.add('hidden');NV.$('#profileGate').classList.remove('hidden');}
 else if(!NV.state.activeProfile){NV.$('#app').classList.add('hidden');NV.$('#profileGate').classList.remove('hidden');}
};
NV.$('#addProfileFromSettings').onclick=()=>NV.openProfile(null,true);
NV.$$('#profileModal [data-close]').forEach(b=>b.onclick=()=>NV.$('#profileModal').classList.add('hidden'));
