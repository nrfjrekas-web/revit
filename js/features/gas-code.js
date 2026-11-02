/* Salinan backend/Code.gs untuk tombol "Salin kode Apps Script". Perbarui dengan: python3 tools/sync-gas.py */
const GAS=`// SI-REVITAL LITE - Backend Google Apps Script (v2)
// 1) Ganti TOKEN di bawah dengan kata sandi sinkron buatan Anda sendiri.
// 2) Jalankan fungsi izinkan() sekali, setujui izin Drive dan Sheet.
// 3) Deploy > Aplikasi web: jalankan sebagai Saya, akses Siapa saja.

const TOKEN = 'GANTI-DENGAN-KATA-RAHASIA';
const FOLDER = 'SI-REVITAL';
const TABLES = ['CONFIG', 'DB_RAB', 'DB_MATERIAL', 'DB_PEKERJA', 'TRX_MASUK', 'TRX_KELUAR', 'TRX_PROGRES', 'TRX_ABSEN', 'TRX_KEUANGAN', 'LOG_AKTIVITAS'];
const TEXT_COLS = ['no_nota', 'supplier', 'nip_kepsek', 'kode_desa', 'tahun_anggaran', 'pin_sekretaris', 'pin_mandor', 'pin_kepsek'];
const SKIP_KEYS = ['gas_url', 'gas_token', 'gas_ver'];
const SS = SpreadsheetApp.getActiveSpreadsheet();
const PROP = PropertiesService.getScriptProperties();
let folderCache = null;

function izinkan() {
  DriveApp.getRootFolder();
  SS.getName();
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function version() {
  return Number(PROP.getProperty('VER') || 0);
}

// Akses: kata sandi admin (TOKEN) atau PIN 4 angka milik salah satu peran yang tersimpan di sheet CONFIG.
// Percobaan PIN salah dibatasi: 10 kali salah mengunci semua login PIN selama 15 menit.
function readConfig() {
  const sh = SS.getSheetByName('CONFIG');
  const c = {};
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(r => { c[r[0]] = String(r[1]); });
  return c;
}

function auth(token, pin) {
  if (token && token === TOKEN) return 'admin';
  if (!pin) return null;
  if (Date.now() < Number(PROP.getProperty('LOCK') || 0)) return 'lock';
  const c = readConfig();
  if (!c.pin_sekretaris) return 'kosong';
  const roles = { sek: c.pin_sekretaris, mandor: c.pin_mandor, kepsek: c.pin_kepsek };
  const p = String(pin);
  for (const r in roles) {
    if (roles[r] && roles[r] === p) { PROP.deleteProperty('FAIL'); return r; }
  }
  const f = Number(PROP.getProperty('FAIL') || 0) + 1;
  if (f >= 10) { PROP.setProperty('LOCK', String(Date.now() + 15 * 60000)); PROP.deleteProperty('FAIL'); }
  else PROP.setProperty('FAIL', String(f));
  return null;
}

function denied(a, token) {
  if (a === 'lock') return out({ error: 'lock' });
  if (a === 'kosong') return out({ error: 'kosong' });
  return out({ error: token ? 'token' : 'pin' });
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const a = auth(p.token, p.pin);
  if (!a || a === 'lock' || a === 'kosong') return denied(a, p.token);
  if (p.action === 'ver') return out({ ver: version() });
  const d = readAll();
  d.ver = version();
  d.role = a;
  return out(d);
}

function doPost(e) {
  let req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (x) {
    return out({ error: 'format' });
  }
  const a = auth(req.token, req.pin);
  if (a === 'kosong') return out({ error: 'token' });
  if (!a || a === 'lock') return denied(a, req.token);
  if (!req.data) return out({ error: 'format' });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return out({ error: 'sibuk' });
  try {
    const cur = version();
    if (cur > 0 && Number(req.base) !== cur && !req.force) return out({ ok: false, conflict: true, ver: cur });
    let photos = [];
    TABLES.forEach(t => {
      if (req.data[t] !== undefined) photos = photos.concat(write(t, req.data[t]));
    });
    const ver = cur + 1;
    PROP.setProperty('VER', String(ver));
    return out({ ok: true, ver: ver, photos: photos });
  } finally {
    lock.releaseLock();
  }
}

function write(name, data) {
  const found = [];
  const rows = Array.isArray(data)
    ? data
    : Object.keys(data).filter(k => SKIP_KEYS.indexOf(k) < 0).map(k => ({ key: k, value: data[k] }));
  const sh = SS.getSheetByName(name) || SS.insertSheet(name);
  sh.clear();
  if (!rows.length) return found;
  const cols = [];
  rows.forEach(r => Object.keys(r).forEach(c => { if (cols.indexOf(c) < 0) cols.push(c); }));
  const vals = rows.map((r, i) => cols.map(c => {
    const v = r[c];
    if (v === undefined || v === null) return '';
    if (typeof v === 'string' && v.indexOf('data:image') === 0) {
      try {
        const u = photo(v, name + '_' + c);
        found.push({ t: name, i: i, c: c, url: u });
        return u;
      } catch (err) {
        return '';
      }
    }
    return v;
  }));
  cols.forEach((c, j) => {
    if (TEXT_COLS.indexOf(c) >= 0) sh.getRange(2, j + 1, vals.length, 1).setNumberFormat('@');
  });
  if (name === 'CONFIG') {
    rows.forEach((r, i) => {
      if (TEXT_COLS.indexOf(r.key) >= 0) sh.getRange(i + 2, 2).setNumberFormat('@');
    });
  }
  sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
  sh.getRange(2, 1, vals.length, cols.length).setValues(vals);
  sh.setFrozenRows(1);
  return found;
}

function getFolder() {
  if (folderCache) return folderCache;
  const it = DriveApp.getFoldersByName(FOLDER);
  folderCache = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
  return folderCache;
}

function photo(v, tag) {
  const bytes = Utilities.base64Decode(v.substring(v.indexOf(',') + 1));
  const hash = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bytes)).substring(0, 10);
  const name = tag + '_' + hash + '.jpg';
  const folder = getFolder();
  const it = folder.getFilesByName(name);
  const f = it.hasNext() ? it.next() : folder.createFile(Utilities.newBlob(bytes, 'image/jpeg', name));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w900';
}

function readAll() {
  const o = {};
  TABLES.forEach(name => {
    const sh = SS.getSheetByName(name);
    if (!sh || sh.getLastRow() < 1) return;
    const v = sh.getDataRange().getValues();
    const h = v[0];
    const rows = v.slice(1).map(r => {
      const x = {};
      h.forEach((c, i) => {
        let val = r[i];
        if (val instanceof Date) val = Utilities.formatDate(val, 'Asia/Jakarta', 'yyyy-MM-dd');
        if (TEXT_COLS.indexOf(c) >= 0 && val !== '') val = String(val);
        x[c] = val;
      });
      return x;
    });
    if (name === 'CONFIG') {
      o[name] = rows.reduce((a, r) => {
        a[r.key] = TEXT_COLS.indexOf(r.key) >= 0 && r.value !== '' ? String(r.value) : r.value;
        return a;
      }, {});
    } else {
      o[name] = rows;
    }
  });
  return o;
}`;
