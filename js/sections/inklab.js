/* ============================================================
   03 · INK LAB — drag two inks together, blend a new fluorescent.
   ============================================================ */
import { $, $$, on, clamp, hexToRgb, rgbToHex, INK_LIST, readableInk } from '../core/util.js';
import { CONTENT } from '../content.js';

export function initInkLab(app){
  const slab = $('#inkSlab');
  const blobA = $('#inkBlobA');
  const blobB = $('#inkBlobB');
  const smear = $('#inkSmear');
  const result = $('#inkResult');
  const chip = $('#inkChip');
  const nameEl = $('#inkName');
  const addBtn = $('#inkAddBtn');
  const swatches = $('#inkSwatches');

  const sctx = smear.getContext('2d');
  let nameIdx = 0;
  let mixed = null;

  const colors = { a:'#00E5FF', b:'#FFE800' };

  function renderSwatches(){
    swatches.innerHTML = '';
    INK_LIST.filter(h=>h!=='#0A0A0A').concat(app.inks.filter(h=>!INK_LIST.includes(h))).forEach((hex) => {
      const b = document.createElement('button');
      b.className = 'inkswatch'; b.style.background = hex; b.title = hex;
      on(b, 'click', () => { assignSwatch(hex); app.audio.plip(); });
      swatches.appendChild(b);
    });
  }
  let assignTo = 'a';
  function assignSwatch(hex){
    colors[assignTo] = hex;
    (assignTo==='a'?blobA:blobB).style.background = hex;
    assignTo = assignTo==='a' ? 'b' : 'a';
  }

  function blend(h1, h2){
    const a = hexToRgb(h1), b = hexToRgb(h2);
    let r=(a.r+b.r)/2, g=(a.g+b.g)/2, bl=(a.b+b.b)/2;
    // push away from grey toward the dominant channel = fluorescent
    const mx = Math.max(r,g,bl), mn = Math.min(r,g,bl);
    const boost = 1.18;
    r = clamp((r-mn)*boost+mn,0,255); g = clamp((g-mn)*boost+mn,0,255); bl = clamp((bl-mn)*boost+mn,0,255);
    return rgbToHex(r,g,bl);
  }

  // dragging
  function makeDrag(blob, which){
    let dragging = false, ox=0, oy=0;
    on(blob, 'pointerdown', (e) => {
      dragging = true; blob.classList.add('is-grabbing'); blob.setPointerCapture?.(e.pointerId);
      const r = blob.getBoundingClientRect(); ox = e.clientX - r.left - r.width/2; oy = e.clientY - r.top - r.height/2;
    });
    on(window, 'pointermove', (e) => {
      if (!dragging) return;
      if (e.cancelable) e.preventDefault();
      const sr = slab.getBoundingClientRect();
      let x = e.clientX - sr.left - ox, y = e.clientY - sr.top - oy;
      x = clamp(x, 0, sr.width - blob.offsetWidth);
      y = clamp(y, 0, sr.height - blob.offsetHeight);
      blob.style.left = x + 'px'; blob.style.top = y + 'px'; blob.style.right='auto';
      // smear trail
      const cx = (x + blob.offsetWidth/2) / sr.width * smear.width;
      const cy = (y + blob.offsetHeight/2) / sr.height * smear.height;
      sctx.globalAlpha = 0.5; sctx.fillStyle = colors[which];
      sctx.beginPath(); sctx.arc(cx, cy, 26, 0, 7); sctx.fill(); sctx.globalAlpha = 1;
      checkOverlap();
    });
    const stop = () => { if (dragging){ dragging=false; blob.classList.remove('is-grabbing'); } };
    on(window, 'pointerup', stop);
    on(blob, 'lostpointercapture', stop);
  }

  function center(el){ const r=el.getBoundingClientRect(); return { x:r.left+r.width/2, y:r.top+r.height/2, r:r.width/2 }; }
  function checkOverlap(){
    const ca = center(blobA), cb = center(blobB);
    const d = Math.hypot(ca.x-cb.x, ca.y-cb.y);
    if (d < ca.r + cb.r){
      mixed = blend(colors.a, colors.b);
      chip.style.background = mixed;
      nameEl.textContent = pickName();
      result.hidden = false;
      // a little splash where they meet
      const sr = slab.getBoundingClientRect();
      const mx = ((ca.x+cb.x)/2 - sr.left)/sr.width*smear.width;
      const my = ((ca.y+cb.y)/2 - sr.top)/sr.height*smear.height;
      sctx.globalAlpha=0.8; sctx.fillStyle=mixed; sctx.beginPath(); sctx.arc(mx,my,38,0,7); sctx.fill(); sctx.globalAlpha=1;
    }
  }
  let lastName = '';
  function pickName(){
    if (lastName) return lastName; // keep stable until added
    lastName = CONTENT.inkNames[nameIdx % CONTENT.inkNames.length]; nameIdx++;
    return lastName;
  }

  on(addBtn, 'click', () => {
    if (!mixed) return;
    if (!app.inks.includes(mixed)) app.inks.push(mixed);
    app.inkNames.set(mixed, (lastName||'CUSTOM').replace(/^FACTORY \d+ — /,''));
    app.bus.emit('ink-added', mixed);
    renderSwatches();
    addBtn.textContent = '✓ ON THE RACK';
    app.audio.chaching();
    setTimeout(()=>{ addBtn.textContent='＋ ADD TO RACK'; result.hidden = true; mixed=null; lastName=''; sctx.clearRect(0,0,smear.width,smear.height); }, 1100);
  });

  function makeKeys(blob, which){
    on(blob, 'keydown', (e) => {
      const sr = slab.getBoundingClientRect();
      let x = blob.offsetLeft, y = blob.offsetTop;
      const stepK = 18;
      if (e.key === 'ArrowLeft')  x -= stepK;
      else if (e.key === 'ArrowRight') x += stepK;
      else if (e.key === 'ArrowUp')    y -= stepK;
      else if (e.key === 'ArrowDown')  y += stepK;
      else if (e.key === 'Enter' || e.key === ' '){ // bring this blob onto the other to mix
        e.preventDefault();
        const other = which==='a' ? blobB : blobA;
        x = other.offsetLeft; y = other.offsetTop;
        blob.style.left = x+'px'; blob.style.top = y+'px'; blob.style.right='auto';
        checkOverlap(); return;
      } else return;
      e.preventDefault();
      x = clamp(x, 0, sr.width - blob.offsetWidth); y = clamp(y, 0, sr.height - blob.offsetHeight);
      blob.style.left = x+'px'; blob.style.top = y+'px'; blob.style.right='auto';
      checkOverlap();
    });
  }

  makeDrag(blobA, 'a'); makeDrag(blobB, 'b');
  makeKeys(blobA, 'a'); makeKeys(blobB, 'b');
  renderSwatches();

  return {};
}
