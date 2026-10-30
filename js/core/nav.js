/* ===== NAVIGASI ===== */
function back(){const t=$('bk').dataset.to;if(t)go(t)}
function go(p){
 const R=ROLES[user.role];if(!R.pages.includes(p)&&p!=='menu'&&!(/^set\d$/.test(p)&&R.pages.includes('setting'))&&!(p==='mingguan'&&R.pages.includes('laporan')))return;
 if(KEEP)KEEP=false;else EDIT=null;
 page=p;$('ttl').textContent=PG[p];$('view').dataset.p=p;
 $('view').innerHTML=V[p]();if(A[p])A[p]();
 const bt=/^set\d$/.test(p)?'setting':p==='mingguan'?'laporan':(!R.nav.includes(p)&&p!=='menu')?'menu':'';$('bk').hidden=!bt;$('bk').dataset.to=bt;
 const items=R.nav.map(n=>`<button class="nv" onclick="go('${n}')" ${n===(p==='mingguan'?'laporan':p)?'aria-current="page"':''}>${ic(n)}<span>${NL[n]||PG[n]}</span></button>`);
 if(R.pages.length>R.nav.length)items.push(`<button class="nv" onclick="go('menu')" ${!R.nav.includes(p)?'aria-current="page"':''}>${ic('menu')}<span>Menu</span></button>`);
 $('nav').innerHTML=items.join('');sideBuild(p);scrollTo(0,0);
}

/* Sidebar desktop: semua halaman milik peran, tanpa perlu halaman Menu */
function sideBuild(p){
 const R=ROLES[user.role],cur=/^set\d$/.test(p)?'setting':p==='mingguan'?'laporan':p,sch=String(C().nama_sekolah||'').replace('UPTD Satuan Pendidikan ','');
 $('side').innerHTML=`<div class="sd-brand"><b>SI-REVITAL LITE</b><span>${esc(sch)}</span></div><div class="sd-list">${R.pages.map(n=>`<button class="sd" onclick="go('${n}')" ${n===cur?'aria-current="page"':''}>${ic(n)}<span>${PG[n]}</span></button>`).join('')}</div><p class="sd-foot">Program Revitalisasi Satuan Pendidikan SD, Swakelola P2SP</p>`;
}

/* ===== KOMPONEN KECIL ===== */
const F=(l,h,hint)=>`<label class="block mb-4"><span class="lb">${l}</span>${h}${hint?`<span class="hint">${hint}</span>`:''}</label>`;
const matOpts=()=>db.DB_MATERIAL.map(m=>`<option value="${m.id_material}">${esc(m.nama_material)}</option>`).join('');
const rabOpts=()=>db.DB_RAB.map(r=>`<option value="${r.id_rab}">${esc(r.uraian_pekerjaan)}</option>`).join('');
const empty=(t,a)=>`<div class="py-8 text-center"><p class="mu">${t}</p>${a||''}</div>`;
const H2=t=>`<h2 class="text-[17px] font-bold mt-6 mb-2">${t}</h2>`;
const bar=(p,dk)=>`<div class="ruler ${dk?'dk':''}" role="img" aria-label="${fmt(p)} persen"><i style="width:${Math.min(100,p)}%"></i></div>`;
