/* ============================================================
   04 · SCREEN TEST — do nothing, and you bloom into colour.
   ============================================================ */
import { $, on, pick, prefersReducedMotion, store, pad } from '../core/util.js';
import { drawSubject, prepareFromImage, buildSeparations, renderColorway, makeCanvas, toThumb, SEP } from '../core/halftone.js';
import { COLORWAYS } from '../core/util.js';
import { CONTENT } from '../content.js';

export function initScreenTest(app){
  const reel = $('#stReel');
  const canvas = $('#stCanvas');
  const cap = $('#stCap');
  const idleEl = $('#stIdle');
  const webcamBtn = $('#stWebcam');
  const uploadInput = $('#stUpload');
  const saveBtn = $('#stSave');
  const reduced = prefersReducedMotion();

  const S = 512; canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');

  let live = drawSubject('face', SEP);   // default sitter
  let video = null;
  let bloom = reduced ? 1 : 0;           // 0 = cold B&W, 1 = colour
  let target = reduced ? 1 : 0;
  let coloredStill = null;
  let curQuote = '';
  let lastActivity = performance.now();
  let visible = false;
  let raf = null;

  // grain tile
  const grain = makeCanvas(128,128);
  function regrain(){
    const g = grain.getContext('2d');
    const id = g.createImageData(128,128);
    for (let i=0;i<id.data.length;i+=4){ const v=Math.random()*255; id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=26; }
    g.putImageData(id,0,0);
  }
  regrain();

  let reelNo = store.get('sf_reel', 0);
  function nextReel(){ reelNo++; store.set('sf_reel', reelNo); return reelNo; }
  cap.textContent = `REEL ${pad(reelNo||1,3)} — STAND BY`;

  function snapColour(){
    const src = video || live;
    const frame = (video) ? prepareFromImage(video, SEP) : live;
    const seps = buildSeparations(frame, SEP);
    coloredStill = renderColorway(seps, pick(COLORWAYS), { misreg: 4 });
    curQuote = pick(CONTENT.quotes.idle).text;
  }

  function draw(){
    raf = requestAnimationFrame(draw);
    if (!visible) return;
    // ease bloom
    bloom += (target - bloom) * 0.06;
    // base: cold B&W of the live source
    ctx.save();
    ctx.filter = 'grayscale(1) contrast(1.7) brightness(0.9)';
    drawCover(ctx, video || live, S, S);
    ctx.restore();
    // colour bloom on top
    if (bloom > 0.01 && coloredStill){
      ctx.globalAlpha = bloom;
      drawCover(ctx, coloredStill, S, S);
      ctx.globalAlpha = 1;
    }
    // grain + flicker (skip when reduced)
    if (!reduced){
      if (Math.random() < 0.5) regrain();
      ctx.globalAlpha = 0.5 + Math.random()*0.2;
      const p = (performance.now()/30)%128;
      ctx.drawImage(grain, 0, -p); ctx.drawImage(grain, 0, 128-p);
      for (let x=0;x<S;x+=128){ for (let y=-128;y<S;y+=128){ ctx.drawImage(grain,x,y+ (p|0)%128); } }
      ctx.globalAlpha = 1;
      // gate weave
      ctx.save(); ctx.translate(Math.sin(performance.now()/700)*1.5, 0); ctx.restore();
    }
    // vignette
    const vg = ctx.createRadialGradient(S/2,S/2,S*0.3,S/2,S/2,S*0.72);
    vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg; ctx.fillRect(0,0,S,S);
    // quote when bloomed
    if (bloom > 0.6 && curQuote){
      ctx.fillStyle = `rgba(251,246,233,${(bloom-0.6)/0.4})`;
      ctx.font = "600 18px 'Courier Prime',monospace"; ctx.textAlign='center';
      wrapText(ctx, '“'+curQuote+'”', S/2, S*0.82, S*0.8, 22);
    }
  }

  function wrapText(c, text, x, y, maxW, lh){
    const words = text.split(' '); let line=''; const lines=[];
    for (const w of words){ const test=line+w+' '; if (c.measureText(test).width>maxW && line){ lines.push(line); line=w+' '; } else line=test; }
    lines.push(line);
    const start = y - (lines.length-1)*lh;
    lines.forEach((l,i)=> c.fillText(l.trim(), x, start+i*lh));
  }
  function drawCover(c, src, w, h){
    const sw = src.videoWidth||src.width, sh = src.videoHeight||src.height;
    const sc = Math.max(w/sw, h/sh); const dw=sw*sc, dh=sh*sc;
    c.drawImage(src, (w-dw)/2, (h-dh)/2, dw, dh);
  }

  // idle detection
  function activity(){
    lastActivity = performance.now();
    if (!reduced && target === 1){ target = 0; reel.classList.remove('show-idle'); coloredStill=null; curQuote=''; cap.textContent=`REEL ${pad(reelNo||1,3)} — ROLLING`; }
  }
  ['pointermove','pointerdown','scroll','keydown','wheel','touchstart'].forEach(ev =>
    on(window, ev, activity, { passive:true }));

  let idleTimer = null;
  function checkIdle(){
    if (reduced || !visible) return;
    if (target === 0 && performance.now() - lastActivity > 4000){
      target = 1; reel.classList.add('show-idle');
      const r = nextReel();
      cap.textContent = `REEL ${pad(r,3)} — ${app.stamp()}`;
      snapColour();
      app.audio.tick();
    }
  }

  // visibility -> run the draw loop and idle timer only when on screen
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      visible = e.isIntersecting;
      lastActivity = performance.now();
      if (visible){
        if (!raf) raf = requestAnimationFrame(draw);
        if (!idleTimer && !reduced) idleTimer = setInterval(checkIdle, 500);
      } else if (idleTimer){
        clearInterval(idleTimer); idleTimer = null;
      }
    });
  }, { threshold: 0.15 });
  io.observe(reel);

  // webcam
  on(webcamBtn, 'click', async () => {
    app.audio.unlock();
    if (video){ // stop
      video.srcObject.getTracks().forEach(t=>t.stop()); video=null; webcamBtn.textContent='◉ ROLL CAMERA'; return;
    }
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user' }, audio:false });
      const v = document.createElement('video');
      v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
      v.srcObject=stream; v.playsInline=true; v.muted=true; await v.play();
      video = v; webcamBtn.textContent='◼ STOP CAMERA';
    }catch(err){
      const msg = err && err.name==='NotAllowedError' ? '✕ PERMISSION DENIED'
                : err && err.name==='NotFoundError' ? '✕ NO CAMERA FOUND'
                : err && err.name==='NotReadableError' ? '✕ CAMERA IN USE' : '✕ NO CAMERA';
      webcamBtn.textContent=msg; setTimeout(()=>webcamBtn.textContent='◉ ROLL CAMERA',2000);
    }
  });
  on(uploadInput, 'change', (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const img = new Image();
    img.onload = () => { live = prepareFromImage(img, SEP); coloredStill=null; URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(f); app.audio.plip();
  });
  on(saveBtn, 'click', () => {
    if (!coloredStill){ snapColour(); target=1; bloom=1; }
    const out = makeCanvas(S,S); const c=out.getContext('2d');
    c.drawImage(coloredStill || live, 0,0,S,S);
    const serial = app.nextSerial();
    app.rack.add({ kind:'screentest', src: toThumb(out,260), title:'Screen Test', serial, ts: app.stamp() });
    app.audio.kachunk();
    saveBtn.textContent='★ KEPT'; setTimeout(()=>saveBtn.textContent='★ KEEP THE STILL',1100);
  });

  return {};
}
