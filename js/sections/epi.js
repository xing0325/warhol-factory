/* ============================================================
   05 · E.P.I. — peel the banana, start the drone, the room reacts.
   Photosensitivity-safe: flashes hard-capped < 3/sec, plus a
   "reduce flashing" toggle and prefers-reduced-motion respect.
   ============================================================ */
import { $, on, clamp, prefersReducedMotion, INK_LIST } from '../core/util.js';

export function initEPI(app){
  const section = $('#epi');
  const viz = $('#epiViz');
  const banana = $('#banana');
  const peelRect = $('#peelRect');
  const toggle = $('#epiToggle');
  const reduceFlash = $('#epiReduceFlash');
  const reduced = prefersReducedMotion();

  const ctx = viz.getContext('2d');
  let W=0, H=0, dpr = Math.min(2, devicePixelRatio||1);
  function resize(){ const r=section.getBoundingClientRect(); W=viz.width=Math.max(1,r.width*dpr); H=viz.height=Math.max(1,(r.height||600)*dpr); viz.style.width=r.width+'px'; viz.style.height=(r.height||600)+'px'; }
  resize(); addEventListener('resize', resize);

  let analyser = null, freq = null;
  let visible = false, raf = null;
  let lastFlash = 0;
  let noFlash = reduced;

  on(reduceFlash, 'change', () => { noFlash = reduceFlash.checked || reduced; document.body.classList.toggle('reduce-flash', reduceFlash.checked); });

  /* ----- banana peel ----- */
  let peel = 0, dragging = false, startY = 0;
  function setPeel(p){
    peel = clamp(p, 0, 1);
    peelRect.setAttribute('y', (peel*360).toFixed(1));
    peelRect.setAttribute('height', (360 - peel*360).toFixed(1));
    if (peel > 0.6 && !app.audio.isDroning()) start();
  }
  on(banana, 'pointerdown', (e) => { dragging=true; startY=e.clientY; banana.setPointerCapture?.(e.pointerId); app.audio.unlock(); });
  on(window, 'pointermove', (e) => { if(!dragging) return; if (e.cancelable) e.preventDefault(); const dy = startY - e.clientY; setPeel(dy/180); });
  on(window, 'pointerup', () => { dragging=false; });
  on(banana, 'keydown', (e) => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setPeel(1); } });

  function start(){
    analyser = app.audio.startDrone();
    if (analyser) freq = new Uint8Array(analyser.frequencyBinCount);
    toggle.textContent = app.t('epi_stop');
    banana.querySelector('.banana__hint').textContent = '♪ playing ♪';
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function stop(){
    app.audio.stopDrone();
    toggle.textContent = app.t('epi_toggle');
    banana.querySelector('.banana__hint').textContent = '↑ peel ↑';
  }
  on(toggle, 'click', () => { app.audio.unlock(); if (app.audio.isDroning()) stop(); else { setPeel(1); } });

  /* ----- the light show ----- */
  const blobs = Array.from({length:7}, (_,i)=>({ x:Math.random(), y:Math.random(), c: INK_LIST[i%INK_LIST.length], ph:Math.random()*7 }));
  let t = 0;
  function loop(){
    if (!visible){ raf = null; return; }
    raf = requestAnimationFrame(loop);
    t += 0.016;
    let energy = 0;
    if (analyser && freq){ analyser.getByteFrequencyData(freq); for (let i=0;i<freq.length;i++) energy += freq[i]; energy /= (freq.length*255); }
    // background
    ctx.fillStyle = '#0A0A0A'; ctx.fillRect(0,0,W,H);
    // capped flash on strong beats
    const now = performance.now();
    if (!noFlash && energy > 0.42 && now - lastFlash > 400){
      lastFlash = now;
      ctx.fillStyle = INK_LIST[(now/120|0)%INK_LIST.length];
      ctx.globalAlpha = 0.22; ctx.fillRect(0,0,W,H); ctx.globalAlpha = 1;
    }
    // liquid-light blobs
    ctx.globalCompositeOperation = 'screen';
    blobs.forEach((b,i) => {
      const band = analyser ? freq[(i*7)%freq.length]/255 : (0.4+0.3*Math.sin(t*2+b.ph));
      const r = (0.10 + band*0.5 + 0.05*Math.sin(t+b.ph)) * Math.min(W,H);
      const x = (b.x*0.8+0.1)*W + Math.sin(t*0.7+b.ph)*W*0.06;
      const y = (b.y*0.8+0.1)*H + Math.cos(t*0.6+b.ph)*H*0.06;
      const g = ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0, b.c); g.addColorStop(0.5, b.c+'66'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    // halftone strobe dots (gentle when noFlash)
    const dotAlpha = noFlash ? 0.06 : (0.06 + energy*0.25);
    ctx.fillStyle = `rgba(255,255,255,${dotAlpha})`;
    const cell = 26*dpr, rad = (noFlash?2:2+energy*6)*dpr;
    const off = (t*30*(noFlash?0.2:1))% cell;
    for (let y=-cell; y<H+cell; y+=cell){ for (let x=-cell; x<W+cell; x+=cell){
      ctx.beginPath(); ctx.arc(x+off, y+off, rad, 0, 7); ctx.fill();
    } }
  }

  app.bus.on('view:show', (id) => {
    if (id !== 'epi') return;
    visible = true; resize();
    if (!raf) raf = requestAnimationFrame(loop);
  });
  app.bus.on('view:hide', (id) => { if (id === 'epi'){ visible = false; if (raf){ cancelAnimationFrame(raf); raf = null; } } });

  // keep the toggle label in the right language while the drone plays
  app.bus.on('lang', () => { toggle.textContent = app.audio.isDroning() ? app.t('epi_stop') : app.t('epi_toggle'); });

  return {};
}
