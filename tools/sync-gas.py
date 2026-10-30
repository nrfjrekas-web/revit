#!/usr/bin/env python3
"""Salin backend/Code.gs ke js/features/gas-code.js (isi tombol 'Salin kode Apps Script')."""
import pathlib,re
r=pathlib.Path(__file__).resolve().parent.parent
gs=(r/'backend/Code.gs').read_text(encoding='utf-8').rstrip('\n')
assert not re.search(r'`|\$\{|\\',gs),'Code.gs tidak boleh berisi backtick, ${ atau backslash'
(r/'js/features/gas-code.js').write_text('/* Salinan backend/Code.gs untuk tombol "Salin kode Apps Script". Perbarui dengan: python3 tools/sync-gas.py */\nconst GAS=`'+gs+'`;\n',encoding='utf-8')
print('OK')
