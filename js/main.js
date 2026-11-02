/* Mulai aplikasi: pengaturan awal bila belum ada PIN, login bila belum masuk, atau pulihkan sesi */
function boot(){
 load();recalc();pin='';buildPad();drawPin();loginInfo();
 $('main').hidden=true;$('setup').hidden=true;$('login').hidden=true;
 if(!C().pin_sekretaris){if(GAS_URL)$('login').hidden=false;else showSetup();return}
 const r=ls.get(K+'_u');
 if(r&&ROLES[r]){user={role:r,nama:ROLES[r].nama};enter()}else $('login').hidden=false;
}
boot();

document.addEventListener('keydown',e=>{if($('login').hidden||e.ctrlKey||e.metaKey||e.altKey)return;if(/^[0-9]$/.test(e.key))pressPin(e.key);else if(e.key==='Backspace')pressPin('<')});
