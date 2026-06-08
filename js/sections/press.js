/* ============================================================
   01 · THE PRESS — hand-pull your own silkscreen.
   State machine: IDLE -> PULLING -> LAYER_DONE -> ... -> COMPLETE
   ============================================================ */
import { $, $$, clamp, map, pick, on, prefersReducedMotion, store, INK_LIST, readableInk } from '../core/util.js';
import { SUBJECTS, drawSubject, buildSeparations, prepareFromImage, tint, SEP, makeCanvas, toThumb } from '../core/halftone.js';
import { CONTENT } from '../content.js';

export function initPress(app){
  const frame   = $('#pressFrame');
  const canvas  = $('#pressCanvas');
  const squeegee= $('#squeegee');
  const ghost   = $('#ghostHand');
  const statusEl= $('#pressStatus');
  const quoteEl = $('#pressQuote');
  const subjectRow = $('#subjectRow');
  const inkRack = $('#inkRack');
  const dlBtn   = $('#downloadBtn');
  const rackBtn = $('#rackBtn');
  const clearBtn= $('#clearBtn');
  const autoBtn = $('#autoPullBtn');
  const uploadInput = $('#uploadInput');
  const webcamBtn = $('#webcamBtn');

  canvas.width = SEP; canvas.height = SEP;
  const ctx = canvas.getContext('2d');

  // committed print
  const print = makeCanvas(SEP, SEP);
  const pctx = print.getContext('2d');

  let seps = null;
  let layerIndex = 0;
  let pulling = false;
  let complete = false;
  let misSum = 0;          // accumulated misregistration (for the quote)
  let covSum = 0, covN = 0;
  let curMis = {x:0,y:0};
  const reduced = prefersReducedMotion();

  // layer suggested inks (the default Warhol-ish run)
  const LAYER_INK = ['#FFE800', '#FF2D95', '#00E5FF', '#0A0A0A'];

  /* ---------- inks ---------- */
  function renderInks(){
    inkRack.innerHTML = '';
    app.inks.forEach((hex) => {
      const pot = document.createElement('button');
      pot.className = 'inkpot';
      pot.style.background = hex;
      pot.dataset.active = (hex === app.currentInk) ? 'true' : 'false';
      pot.title = hex;
      pot.setAttribute('aria-label', 'Ink ' + hex);
      const nm = document.createElement('span'); nm.className='inkpot__name'; nm.textContent = inkLabel(hex);
      nm.style.color = readableInk(hex);
      pot.appendChild(nm);
      on(pot, 'click', () => { setInk(hex); app.audio.plip(); });
      inkRack.appendChild(pot);
    });
  }
  function inkLabel(hex){
    const named = { '#FFE800':'YELLOW','#FF2D95':'PINK','#00E5FF':'CYAN','#FF5A00':'ORANGE','#A6FF00':'LIME','#7A00FF':'VIOLET','#FF003C':'RED','#0A0A0A':'BLACK' };
    return named[hex.toUpperCase()] || (app.inkNames.get(hex) || '');
  }
  function setInk(hex){
    app.currentInk = hex;
    $$('.inkpot', inkRack).forEach(p => p.dataset.active = (p.style.background && rgbEq(p.style.background, hex)) ? 'true':'false');
  }
  function rgbEq(a, hex){ // compare a computed rgb() to hex
    const m = a.match(/\d+/g); if (!m) return false;
    const h = hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
    return +m[0]===r && +m[1]===g && +m[2]===b;
  }
  app.bus.on('ink-added', () => renderInks());

  /* ---------- subjects ---------- */
  function renderSubjects(active){
    subjectRow.innerHTML = '';
    SUBJECTS.forEach(s => {
      const b = document.createElement('button');
      b.className = 'subjectchip' + (s.id===active?' is-active':'');
      b.title = s.label; b.setAttribute('aria-label', 'Subject: ' + s.label);
      const mini = drawSubject(s.id, 120);
      const c = document.createElement('canvas'); c.width=92; c.height=92;
      c.getContext('2d').drawImage(mini,0,0,92,92);
      b.appendChild(c);
      on(b, 'click', () => { loadSubject(s.id); app.audio.plip(); });
      subjectRow.appendChild(b);
    });
  }

  function loadSeps(newSeps, subjectId){
    seps = newSeps;
    app.state.seps = seps;
    freshPaper();
    if (subjectId) $$('.subjectchip', subjectRow).forEach((b,i)=>b.classList.toggle('is-active', SUBJECTS[i].id===subjectId));
    else $$('.subjectchip', subjectRow).forEach(b=>b.classList.remove('is-active'));
    app.bus.emit('seps', seps);
  }
  function loadSubject(id){ loadSeps(buildSeparations(drawSubject(id, SEP)), id); }

  /* ---------- fresh paper / reset ---------- */
  function freshPaper(){
    pctx.clearRect(0,0,SEP,SEP);
    pctx.fillStyle = '#FBF6E9'; pctx.fillRect(0,0,SEP,SEP);
    layerIndex = 0; complete = false; misSum = 0; covSum = 0; covN = 0;
    quoteEl.textContent = '';
    drawGuide();
    composite();
    setInk(LAYER_INK[0]);
    updateStatus();
    setSqueegee(0);
    dlBtn.disabled = false; rackBtn.disabled = false;
  }

  // faint ghost of the subject so you know what you're printing
  function drawGuide(){
    if (!seps) return;
    const g = tint(seps.layers[3].mask || seps.layers[1].mask, '#7a7a7a', SEP);
    pctx.globalAlpha = 0.12; pctx.drawImage(g, 0, 0); pctx.globalAlpha = 1;
  }

  function composite(extra){
    ctx.clearRect(0,0,SEP,SEP);
    ctx.drawImage(print, 0, 0);
    if (extra) ctx.drawImage(extra, 0, 0);
  }

  function updateStatus(){
    if (complete){ statusEl.textContent = 'PRINT COMPLETE'; return; }
    const names = ['1','2','3','4'];
    statusEl.textContent = `PULL ${names[layerIndex]} / 4 — drag down`;
  }

  /* ---------- the pull ---------- */
  let wet = makeCanvas(SEP, SEP);       // current layer fully tinted
  let wctx = wet.getContext('2d');
  const reveal = makeCanvas(SEP, SEP);  // reusable wet-reveal buffer
  const rc = reveal.getContext('2d');
  let maxY = 0, lastT = 0, lastClientY = 0, covSmooth = 1, pullInk = '#000';

  function frameRect(){ return frame.getBoundingClientRect(); }
  function setSqueegee(t){ // t in 0..1
    squeegee.style.top = (t*100) + '%';
    squeegee.setAttribute('aria-valuenow', Math.round(t*100));
  }

  function startPull(clientY){
    if (complete || !seps) return;
    pulling = true;
    squeegee.classList.add('is-grabbing');
    pullInk = app.currentInk;
    curMis = layerIndex===0 ? {x:0,y:0} : { x:(Math.random()*2-1)*8, y:(Math.random()*2-1)*8 };
    // pre-tint the whole current layer
    const layer = seps.layers[layerIndex];
    wet = tint(layer.mask, pullInk, SEP);
    wctx = wet.getContext('2d');
    maxY = 0; covSmooth = 1; lastT = performance.now();
    const r = frameRect(); lastClientY = clientY;
    hideGhost();
  }

  function movePull(clientY){
    if (!pulling) return;
    const r = frameRect();
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    const dy = Math.abs(clientY - lastClientY);
    const speed = dy / dt; // px per ms (screen)
    const covInstant = clamp(map(speed, 0.05, 2.2, 1.0, 0.40), 0.40, 1.0);
    covSmooth = covSmooth*0.7 + covInstant*0.3;
    lastT = now; lastClientY = clientY;
    let t = clamp((clientY - r.top) / r.height, 0, 1);
    if (t > maxY) maxY = t;
    setSqueegee(t);
    renderWet();
  }

  function renderWet(){
    // committed print + current layer revealed to maxY with coverage + misreg
    rc.clearRect(0, 0, SEP, SEP);
    rc.save();
    rc.beginPath(); rc.rect(0, 0, SEP, maxY*SEP); rc.clip();
    rc.globalAlpha = covSmooth;
    rc.drawImage(wet, curMis.x, curMis.y);
    // streaks for fast pulls
    if (covSmooth < 0.8){
      rc.globalAlpha = (0.8 - covSmooth);
      rc.globalCompositeOperation = 'destination-out';
      for (let i=0;i<14;i++){ const x=Math.random()*SEP; rc.fillRect(x, 0, 1+Math.random()*2, maxY*SEP); }
      rc.globalCompositeOperation = 'source-over';
    }
    rc.restore();
    composite(reveal);
  }

  function endPull(){
    if (!pulling) return;
    pulling = false;
    squeegee.classList.remove('is-grabbing');
    if (maxY < 0.04){ updateStatus(); return; } // barely moved -> ignore
    // commit
    pctx.save();
    pctx.beginPath(); pctx.rect(0,0,SEP,maxY*SEP); pctx.clip();
    pctx.globalAlpha = covSmooth;
    pctx.drawImage(wet, curMis.x, curMis.y);
    if (covSmooth < 0.8){
      pctx.globalAlpha = (0.8 - covSmooth);
      pctx.globalCompositeOperation = 'destination-out';
      for (let i=0;i<14;i++){ const x=Math.random()*SEP; pctx.fillRect(x,0,1+Math.random()*2,maxY*SEP); }
      pctx.globalCompositeOperation = 'source-over';
    }
    pctx.restore();
    composite();
    app.audio.squeegee(1 - covSmooth);
    // accounting
    misSum += Math.hypot(curMis.x, curMis.y);
    covSum += covSmooth; covN++;
    store.set('sf_pulled', true);

    layerIndex++;
    if (layerIndex >= seps.layers.length){ finishPrint(); }
    else { setInk(LAYER_INK[layerIndex]); setSqueegee(0); updateStatus(); }
  }

  function finishPrint(){
    complete = true;
    setSqueegee(0);
    updateStatus();
    app.audio.thunk();
    if (window.gsap && !reduced) window.gsap.fromTo(frame, { x:-4 }, { x:0, duration:0.4, ease:'elastic.out(1,0.3)' });
    // misregistration score -> quote bucket
    const avgCov = covN ? covSum/covN : 1;
    const score = misSum/4 + (1-avgCov)*16;     // 0 clean .. larger smeared
    let bucket = 'pull_clean';
    if (score > 9) bucket = 'pull_smeared'; else if (score > 4) bucket = 'pull_slight';
    const q = pick(CONTENT.quotes[bucket]);
    quoteEl.textContent = '“' + q.text + '”';
    app.state.lastPrint = print;
    app.bus.emit('print', { canvas: print, score, bucket });
    flashComplete();
  }

  function flashComplete(){
    statusEl.style.background = '#FF2D95'; statusEl.style.color = '#FBF6E9';
    setTimeout(()=>{ statusEl.style.background=''; statusEl.style.color=''; }, 700);
  }

  function hideGhost(){ if (ghost) ghost.classList.add('is-hidden'); }
  if (store.get('sf_pulled', false)) hideGhost();

  /* ---------- pointer + keyboard ---------- */
  on(squeegee, 'pointerdown', (e) => { squeegee.setPointerCapture?.(e.pointerId); startPull(e.clientY); });
  on(window, 'pointermove', (e) => { if (pulling){ if (e.cancelable) e.preventDefault(); movePull(e.clientY); } }, { passive:false });
  on(window, 'pointerup', () => endPull());
  on(squeegee, 'lostpointercapture', () => endPull());
  // keyboard: arrow/page to nudge the pull, Home/End to jump, Enter to let the machine finish this layer
  on(squeegee, 'keydown', (e) => {
    if (complete || !seps) return;
    const r = frameRect();
    const cur = (parseFloat(squeegee.style.top)||0)/100;
    const nudge = (amt) => {
      e.preventDefault();
      if (!pulling) startPull(r.top);
      movePull(r.top + clamp(cur+amt,0,1)*r.height);
      if ((parseFloat(squeegee.style.top)||0) >= 99) endPull();
    };
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nudge(0.05);
    else if (e.key === 'PageDown') nudge(0.2);
    else if (e.key === 'End') nudge(1);
    else if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); autoLayer(LAYER_INK[layerIndex]); }
  });

  /* ---------- machine pull (auto) ---------- */
  function autoLayer(color){
    return new Promise((resolve) => {
      if (complete || !seps) return resolve();
      app.currentInk = color || LAYER_INK[layerIndex];
      startPull(frameRect().top);
      const dur = reduced ? 0 : 520;
      const t0 = performance.now();
      const r = frameRect();
      const step = () => {
        const k = dur ? clamp((performance.now()-t0)/dur, 0, 1) : 1;
        // simulate slow firm pull (high coverage)
        lastClientY = r.top; lastT = performance.now()-16;
        movePull(r.top + k*r.height);
        covSmooth = 0.95;
        if (k < 1) requestAnimationFrame(step); else { endPull(); resolve(); }
      };
      requestAnimationFrame(step);
    });
  }
  async function machinePull(){
    if (complete) freshPaper();
    while (!complete && seps){ await autoLayer(LAYER_INK[layerIndex]); }
  }
  on(autoBtn, 'click', () => { app.audio.unlock(); machinePull(); });

  /* ---------- buttons ---------- */
  on(clearBtn, 'click', () => { freshPaper(); app.audio.plip(); });
  on(dlBtn, 'click', () => downloadPNG());
  on(rackBtn, 'click', () => pinToRack());

  function exportCanvas(){
    // compose on a clean paper bg with a small border + serial stamp
    const pad = 40, W = SEP + pad*2;
    const out = makeCanvas(W, W + 60);
    const c = out.getContext('2d');
    c.fillStyle = '#FBF6E9'; c.fillRect(0,0,out.width,out.height);
    c.drawImage(print, pad, pad);
    c.strokeStyle='#0A0A0A'; c.lineWidth=8; c.strokeRect(pad,pad,SEP,SEP);
    c.fillStyle='#0A0A0A'; c.font="600 26px 'Courier Prime',monospace"; c.textAlign='left';
    c.fillText(`THE SILVER FACTORY`, pad, SEP+pad+44);
    c.textAlign='right';
    c.fillText(app.nextSerialPreview(), W-pad, SEP+pad+44);
    return out;
  }
  function downloadPNG(){
    const out = exportCanvas();
    out.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `silver-factory-${app.worker.serial||'print'}.png`;
      a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
    app.audio.chaching();
  }
  function pinToRack(){
    const serial = app.nextSerial();
    const thumb = toThumb(print, 260);
    app.rack.add({ kind:'print', src:thumb, title:'Silkscreen', serial, ts: app.stamp() });
    app.audio.kachunk();
    rackBtn.textContent = '✓ PINNED';
    setTimeout(()=> rackBtn.textContent = app.t('press_pin'), 1200);
  }

  /* ---------- upload / webcam ---------- */
  on(uploadInput, 'change', (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const img = new Image();
    img.onload = () => { loadSeps(buildSeparations(prepareFromImage(img, SEP))); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(file);
    app.audio.plip();
  });
  let webcamArmed = false;
  on(webcamBtn, 'click', async () => {
    if (webcamArmed) return;            // the grab() handler takes the second click
    app.audio.unlock();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user' }, audio:false });
      const v = document.createElement('video');
      v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
      v.srcObject = stream; v.playsInline = true; v.muted = true;
      await v.play();
      webcamArmed = true;
      webcamBtn.textContent = app.t('press_snap');
      const grab = () => {
        webcamArmed = false;
        loadSeps(buildSeparations(prepareFromImage(v, SEP)));
        stream.getTracks().forEach(t=>t.stop());
        webcamBtn.textContent = app.t('press_webcam');
        webcamBtn.removeEventListener('click', grab);
      };
      webcamBtn.addEventListener('click', grab, { once:true });
    } catch(err){
      webcamArmed = false;
      webcamBtn.textContent = app.t(
        err && err.name === 'NotAllowedError' ? 'cam_denied'
        : err && err.name === 'NotFoundError' ? 'cam_notfound'
        : err && err.name === 'NotReadableError' ? 'cam_inuse' : 'cam_none');
      setTimeout(()=> webcamBtn.textContent = app.t('press_webcam'), 2000);
    }
  });

  // re-localise stateful labels when the language switches
  app.bus.on('lang', () => { if (webcamArmed) webcamBtn.textContent = app.t('press_snap'); updateStatus(); });

  /* ---------- boot ---------- */
  renderSubjects('soup');
  renderInks();
  loadSubject('soup');

  return { loadSubject, get seps(){ return seps; } };
}
