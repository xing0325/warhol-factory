/* ============================================================
   07 · DRYING RACK — your output, kept locally; export a sheet.
   ============================================================ */
import { $, on } from '../core/util.js';
import { makeCanvas } from '../core/halftone.js';
import { rack } from '../core/gallery-store.js';

export function initGallery(app){
  const rackEl = $('#galleryRack');
  const empty = $('#galleryEmpty');
  const clockout = $('#clockoutBtn');
  const clearBtn = $('#galleryClear');

  function render(items){
    rackEl.innerHTML = '';
    empty.classList.toggle('is-hidden', items.length > 0);
    items.slice().reverse().forEach(it => {
      const fig = document.createElement('figure');
      fig.className = 'rackprint';
      fig.style.setProperty('--r', (Math.random()*4-2)+'deg');
      fig.style.transform = `rotate(${Math.random()*4-2}deg)`;
      const img = new Image(); img.src = it.src; img.alt = it.title;
      const meta = document.createElement('figcaption'); meta.className='rackprint__meta';
      meta.textContent = `${it.title}\n${it.serial||''} ${it.ts||''}`;
      const del = document.createElement('button'); del.className='rackprint__del'; del.textContent='✕'; del.title='Take down';
      on(del, 'click', () => { rack.remove(it.id); app.audio.plip(); });
      fig.append(img, meta, del);
      rackEl.appendChild(fig);
    });
  }
  rack.subscribe(render);

  on(clearBtn, 'click', () => { if (rack.count() && confirm('Strip everything off the rack?')){ rack.clear(); app.audio.kachunk(); } });

  on(clockout, 'click', () => exportSheet());

  function exportSheet(){
    const items = rack.all();
    if (!items.length){ clockout.textContent='NOTHING TO EXPORT'; setTimeout(()=>clockout.textContent='⬇ CLOCK OUT — EXPORT CONTACT SHEET',1500); return; }
    const cols = Math.min(4, Math.ceil(Math.sqrt(items.length)));
    const rows = Math.ceil(items.length/cols);
    const cw = 300, pad = 24, header = 150;
    const W = cols*cw + pad*(cols+1);
    const Hh = header + rows*(cw+50) + pad;
    const out = makeCanvas(W, Hh);
    const c = out.getContext('2d');
    c.fillStyle = '#FBF6E9'; c.fillRect(0,0,W,Hh);
    // header
    c.fillStyle = '#0A0A0A';
    c.font = "400 64px 'Anton',Impact,sans-serif"; c.textAlign='left';
    c.fillText('THE SILVER FACTORY', pad, 70);
    c.font = "700 22px 'Courier Prime',monospace"; c.fillStyle='#E4002B';
    c.fillText(`CONTACT SHEET · ${app.worker.name} — ${app.worker.title}`, pad, 104);
    c.fillStyle='#0A0A0A'; c.fillText(`${app.worker.serial} · ${app.stamp()} · ${items.length} works`, pad, 132);
    c.fillStyle='#0A0A0A'; c.fillRect(pad, header-16, W-pad*2, 4);

    let loaded = 0;
    items.forEach((it, i) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        const col = i % cols, row = (i/cols)|0;
        const x = pad + col*(cw+pad), y = header + row*(cw+50);
        c.fillStyle='#FBF6E9'; c.fillRect(x,y,cw,cw);
        if (img.complete && img.naturalWidth) c.drawImage(img, x, y, cw, cw);
        c.strokeStyle='#0A0A0A'; c.lineWidth=5; c.strokeRect(x,y,cw,cw);
        c.fillStyle='#0A0A0A'; c.font="700 15px 'Courier Prime',monospace"; c.textAlign='left';
        c.fillText(`${it.serial||''}  ${it.title}`, x, y+cw+24);
        if (++loaded === items.length) save();
      };
      img.src = it.src;
    });
    function save(){
      out.toBlob((blob) => {
        const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
        a.download=`silver-factory-contact-sheet-${app.worker.serial||''}.png`; a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href),4000);
      }, 'image/png');
      app.audio.chaching();
      clockout.textContent='✓ CLOCKED OUT'; setTimeout(()=>clockout.textContent='⬇ CLOCK OUT — EXPORT CONTACT SHEET',1500);
    }
  }

  return {};
}
