/* ============================================================
   GALLERY STORE — the drying rack.
   Downscaled thumbnails in localStorage, FIFO-capped so we never
   blow the ~5MB quota. Tiny pub/sub so the UI re-renders.
   ============================================================ */
import { store } from './util.js';

const KEY = 'sf_rack';
const CAP = 24;

let items = store.get(KEY, []);
let seq = store.get('sf_rack_seq', items.reduce((m,i)=>Math.max(m, +(String(i.id).match(/\d+/)?.[0]||0)), 0));
const subs = new Set();

function persist(){
  // try to save; if quota fails, drop oldest until it fits
  let ok = store.set(KEY, items);
  while (!ok && items.length){ items.shift(); ok = store.set(KEY, items); }
  emit();
}
function emit(){ subs.forEach(fn => fn(items)); }

export const rack = {
  all(){ return items.slice(); },
  count(){ return items.length; },
  subscribe(fn){ subs.add(fn); fn(items); return () => subs.delete(fn); },
  add(item){
    seq += 1; store.set('sf_rack_seq', seq);
    const rec = {
      id: 'p' + seq,
      kind: item.kind || 'print',
      src: item.src,
      title: item.title || 'Untitled',
      serial: item.serial || '',
      ts: item.ts || ''
    };
    items.push(rec);
    while (items.length > CAP) items.shift();
    persist();
    return rec;
  },
  remove(id){ items = items.filter(i => i.id !== id); persist(); },
  clear(){ items = []; persist(); }
};
