/* ============================================================
   CURSOR — a Factory tool that morphs by zone, leaving a faint
   fluorescent ink trail. Fine-pointer only; disabled on touch
   and prefers-reduced-motion (native cursor returns).
   ============================================================ */
import { $, isFinePointer, prefersReducedMotion, rafThrottle } from './util.js';

export function initCursor(getInk){
  if (!isFinePointer() || prefersReducedMotion()) return { destroy(){} };

  const cur = $('#cursor');
  const tool = $('#cursorTool');
  const trail = $('#cursorTrail');
  if (!cur || !trail) return { destroy(){} };

  document.body.classList.add('cursor-on');
  const tctx = trail.getContext('2d');
  let W, H, dpr = Math.min(2, window.devicePixelRatio || 1);
  const resize = () => {
    W = trail.width = Math.floor(innerWidth * dpr);
    H = trail.height = Math.floor(innerHeight * dpr);
    trail.style.width = innerWidth + 'px'; trail.style.height = innerHeight + 'px';
  };
  resize();
  addEventListener('resize', resize);

  let x = innerWidth/2, y = innerHeight/2, px = x, py = y;
  let trailVisible = true;
  const dots = [];

  // keyboard users: restore the native cursor so focus is visible
  addEventListener('keydown', (e) => { if (e.key === 'Tab') document.body.classList.add('using-kbd'); }, { passive:true });

  const move = (e) => {
    x = e.clientX; y = e.clientY;
  };
  const update = rafThrottle(() => {
    cur.style.transform = `translate3d(${x}px,${y}px,0)`;
    cur.style.setProperty('--ink-color', getInk ? getInk() : '#FF2D95');
  });
  addEventListener('pointermove', (e) => { document.body.classList.remove('using-kbd'); move(e); update(); }, { passive:true });

  // hot state over interactive targets
  addEventListener('pointerover', (e) => {
    const hot = e.target.closest('a,button,input,label,select,[role="slider"],[role="button"],.subjectchip,.inkpot,.inkswatch,.capsule__item');
    cur.classList.toggle('is-hot', !!hot);
  }, { passive:true });

  // ink trail loop
  let raf;
  const tick = () => {
    if (!trailVisible){
      if (dots.length){ dots.length = 0; tctx.clearRect(0,0,W,H); }
      raf = requestAnimationFrame(tick); return;
    }
    const dx = x - px, dy = y - py;
    const speed = Math.hypot(dx, dy);
    px += dx*0.35; py += dy*0.35;
    if (speed > 4){
      dots.push({ x:px*dpr, y:py*dpr, r:(2+Math.random()*2)*dpr, life:1, c:getInk?getInk():'#FF2D95' });
      if (dots.length > 60) dots.shift();
    }
    tctx.clearRect(0,0,W,H);
    for (let i=dots.length-1;i>=0;i--){
      const d = dots[i]; d.life -= 0.04;
      if (d.life <= 0){ dots.splice(i,1); continue; }
      tctx.globalAlpha = d.life*0.5;
      tctx.fillStyle = d.c;
      tctx.beginPath(); tctx.arc(d.x, d.y, d.r*d.life, 0, 7); tctx.fill();
    }
    tctx.globalAlpha = 1;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  // hide when leaving the window (and pause the trail loop)
  addEventListener('pointerleave', () => { cur.style.opacity = '0'; trailVisible = false; });
  addEventListener('pointerenter', () => { cur.style.opacity = '1'; trailVisible = true; });
  document.addEventListener('visibilitychange', () => { trailVisible = !document.hidden; });

  return { destroy(){ cancelAnimationFrame(raf); document.body.classList.remove('cursor-on'); } };
}
