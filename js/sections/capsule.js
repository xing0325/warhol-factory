/* ============================================================
   06 · TIME CAPSULE — tear the tape, rummage the junk.
   ============================================================ */
import { $, on, clamp, shuffle, prefersReducedMotion } from '../core/util.js';
import { CONTENT } from '../content.js';

export function initCapsule(app){
  const box = $('#capBox');
  const tape = $('#tapePath');
  const spill = $('#capSpill');
  const card = $('#capCard');
  const cardGlyph = $('#capCardGlyph');
  const cardName = $('#capCardName');
  const cardProv = $('#capCardProv');
  const reseal = $('#capReseal');
  const taphint = box.querySelector('.capsule__taphint');
  const reduced = prefersReducedMotion();

  const LEN = (() => { try { return tape.getTotalLength(); } catch { return 388; } })();
  tape.style.strokeDasharray = LEN;
  tape.style.strokeDashoffset = 0;

  let p = 0, tearing = false, opened = false, lastRip = 0;

  function setTear(np){
    p = clamp(np, 0, 1);
    tape.style.strokeDashoffset = (p*LEN).toFixed(1);
    const now = performance.now();
    if (now - lastRip > 120 && p < 1){ app.audio.rrrip(0.18); lastRip = now; }
    if (p > 0.85 && !opened) openBox();
  }

  on(box, 'pointerdown', (e) => { if (opened) return; tearing = true; box.setPointerCapture?.(e.pointerId); app.audio.unlock(); });
  on(window, 'pointermove', (e) => {
    if (!tearing) return;
    if (e.cancelable) e.preventDefault();
    const r = box.getBoundingClientRect();
    setTear((e.clientX - r.left) / r.width);
  });
  on(window, 'pointerup', () => { tearing = false; });
  on(box, 'keydown', (e) => { if ((e.key==='Enter'||e.key===' ') && !opened){ e.preventDefault(); setTear(1); } });
  box.tabIndex = 0; box.setAttribute('role','button'); box.setAttribute('aria-label','Tear the tape to open the time capsule');

  function openBox(){
    opened = true;
    box.classList.add('is-open');
    taphint.style.display = 'none';
    app.audio.thunk();
    renderItems();
    reseal.hidden = false;
  }

  function renderItems(){
    spill.innerHTML = '';
    const items = shuffle(CONTENT.capsule.items);
    items.forEach((it, i) => {
      const el = document.createElement('button');
      el.className = 'capsule__item'; el.textContent = it.glyph;
      el.title = it.name; el.setAttribute('aria-label', it.name);
      el.dataset.id = it.id;
      on(el, 'click', () => showCard(it));
      makeDraggable(el);
      spill.appendChild(el);
      if (window.gsap && !reduced){
        window.gsap.from(el, { y:-160, rotate:(Math.random()*60-30), opacity:0, duration:0.6,
          delay: i*0.06, ease:'bounce.out' });
      }
    });
  }

  function showCard(it){
    cardGlyph.textContent = it.glyph;
    cardName.textContent = it.name;
    cardProv.textContent = '“' + it.prov + '”';
    card.hidden = false;
    app.audio.plip();
    if (window.gsap && !reduced) window.gsap.fromTo(card, { y:14, opacity:0 }, { y:0, opacity:1, duration:0.3 });
  }

  function makeDraggable(el){
    let dragging=false, sx=0, sy=0, ox=0, oy=0;
    on(el, 'pointerdown', (e) => { dragging=true; sx=e.clientX; sy=e.clientY;
      const m=(el.style.transform||'').match(/-?\d+\.?\d*/g); ox = m?+m[0]:0; oy = m?+m[1]:0;
      el.setPointerCapture?.(e.pointerId); e.stopPropagation(); });
    on(el, 'pointermove', (e) => { if(!dragging) return; if (e.cancelable) e.preventDefault(); el.style.transform = `translate(${ox+e.clientX-sx}px,${oy+e.clientY-sy}px) rotate(-3deg)`; });
    on(el, 'pointerup', () => dragging=false);
  }

  on(reseal, 'click', () => {
    opened = false; p = 0;
    tape.style.strokeDashoffset = 0;
    box.classList.remove('is-open');
    taphint.style.display = '';
    spill.innerHTML = ''; card.hidden = true; reseal.hidden = true;
    app.audio.kachunk();
  });

  return {};
}
