/* ============================================================
   THE SILVER FACTORY — bootstrap, paged router, i18n.
   ============================================================ */
import { $, $$, on, pick, prefersReducedMotion, isFinePointer, rafThrottle, store, pad, INK_LIST } from './core/util.js';
import { AudioEngine } from './core/audio.js';
import { initCursor } from './core/cursor.js';
import { rack } from './core/gallery-store.js';
import { CONTENT } from './content.js';
import { STRINGS } from './i18n.js';

import { initPress } from './sections/press.js';
import { initWall } from './sections/wall.js';
import { initInkLab } from './sections/inklab.js';
import { initScreenTest } from './sections/screentest.js';
import { initEPI } from './sections/epi.js';
import { initCapsule } from './sections/capsule.js';
import { initWorks } from './sections/works.js';
import { initGallery } from './sections/gallery.js';

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add('rm');

function bus(){
  const m = new Map();
  return {
    on(ev, fn){ (m.get(ev) || m.set(ev,[]).get(ev)).push(fn); },
    emit(ev, data){ (m.get(ev)||[]).forEach(fn => { try{ fn(data); }catch(e){ console.warn(e); } }); }
  };
}

const ROOMS = ['press','wall','inklab','screentest','epi','capsule','works','gallery','about'];

const app = {
  audio: new AudioEngine(),
  reduced, fine: isFinePointer(),
  inks: INK_LIST.slice(),
  inkNames: new Map(),
  currentInk: '#FFE800',
  state: { seps:null, lastPrint:null },
  bus: bus(),
  rack,
  lang: store.get('sf_lang', 'en'),
  worker: store.get('sf_worker', null),
  _serial: store.get('sf_serial', 0),
  t(key){ const L = STRINGS[this.lang] || STRINGS.en; return (L[key] != null ? L[key] : STRINGS.en[key]) ?? key; },
  nextSerial(){ this._serial++; store.set('sf_serial', this._serial); return `${CONTENT.workers.serialPrefix}-${pad(this._serial,3)}`; },
  nextSerialPreview(){ return `${CONTENT.workers.serialPrefix}-${pad(this._serial+1,3)}`; },
  stamp(){
    const d = new Date();
    const mon = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()];
    return `${pad(d.getDate(),2)} ${mon} ${d.getFullYear()} · ${pad(d.getHours(),2)}:${pad(d.getMinutes(),2)}`;
  }
};

/* ---------- i18n ---------- */
function applyI18n(){
  document.documentElement.setAttribute('data-lang', app.lang);
  $$('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = app.t(key);
    if (val == null) return;
    el.textContent = val;
    if (el.hasAttribute('data-text')) el.setAttribute('data-text', val);
  });
}
function fillAbout(){
  const t = (k) => app.t(k);
  $('#aboutIntro').innerHTML = (t('about_intro')||[]).map(p => `<p>${p}</p>`).join('');
  $('#aboutFacts').innerHTML = (t('about_facts')||[]).map(f => `<li><b>${f.fact}</b><span>${f.detail}</span></li>`).join('');
  $('#aboutPhilo').innerHTML = (t('about_philosophy')||[]).map(p => `<p>${p}</p>`).join('');
  $('#aboutColophon').textContent = t('about_colophon');
  $('#aboutCredit').textContent = t('about_credit');
}
function setLang(lang){
  app.lang = lang; store.set('sf_lang', lang);
  applyI18n(); fillAbout();
  app.bus.emit('lang', lang);
}

/* ---------- marquee (English slogans, always) ---------- */
function initMarquee(){
  const track = $('#marqueeTrack');
  const html = CONTENT.quotes.marquee.map(t => `<span class="marquee__item">${t}</span>`).join('');
  track.innerHTML = html + html;
  if (reduced) return;
  let x = 0, raf = null, visible = true;
  const step = () => {
    if (!visible){ raf = null; return; }
    x -= 0.6;
    const half = track.scrollWidth / 2;
    if (-x >= half) x += half;
    track.style.transform = `translateX(${x}px)`;
    raf = requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((ents) => { visible = ents[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(step); }, { threshold:0 });
  io.observe($('#marquee'));
  raf = requestAnimationFrame(step);
}

/* ---------- keep --topbar-h matched to the real topbar height ---------- */
function measureTopbar(){
  const tb = $('#topbar'); if (!tb) return;
  const h = Math.round(tb.getBoundingClientRect().height);
  if (h > 0) document.documentElement.style.setProperty('--topbar-h', h + 'px');
}

/* ---------- foil specular ---------- */
function initFoil(){
  const spec = $('#foilSpec');
  if (!spec || reduced) return;
  const set = rafThrottle((x,y) => { spec.style.transform = `translate3d(${x}px,${y}px,0)`; });
  on(window, 'pointermove', (e) => set(e.clientX - innerWidth/2, e.clientY - innerHeight/2), { passive:true });
}

/* ---------- the paged router ---------- */
let current = null;
function viewEl(id){ return document.getElementById(id); }
function go(id, push = true){
  if (!viewEl(id)) id = app.entered ? 'press' : 'clockin';
  if (id === current) return;
  const prev = current;
  if (prev){ const pv = viewEl(prev); if (pv) pv.classList.remove('is-active'); app.bus.emit('view:hide', prev); }
  const v = viewEl(id);
  v.classList.add('is-active');
  v.scrollTop = 0;
  current = id;
  document.body.dataset.zone = v.dataset.zone || 'default';
  // nav highlight
  $$('#rooms a').forEach(a => a.classList.toggle('is-active', a.dataset.room === id));
  // tall?
  requestAnimationFrame(() => { v.classList.toggle('is-tall', v.scrollHeight > v.clientHeight + 4); });
  // title flourish
  const title = v.querySelector('.view-title');
  if (title && window.gsap && !reduced){
    window.gsap.fromTo(title, { '--mx':'15px','--my':'13px' }, { '--mx':'5px','--my':'4px', duration:.8, ease:'elastic.out(1,.5)' });
  }
  app.bus.emit('view:show', id);
  if (push){ const h = '#/' + id; if (location.hash !== h) history.replaceState(null,'',h); }
  updateArrows();
}
function updateArrows(){
  const i = ROOMS.indexOf(current);
  const prevBtn = $('#prevRoom'), nextBtn = $('#nextRoom');
  if (i < 0){ prevBtn.style.visibility='hidden'; nextBtn.style.visibility='hidden'; return; }
  prevBtn.style.visibility = nextBtn.style.visibility = 'visible';
  prevBtn.dataset.target = ROOMS[(i - 1 + ROOMS.length) % ROOMS.length];
  nextBtn.dataset.target = ROOMS[(i + 1) % ROOMS.length];
}
function parseHash(){ const m = (location.hash||'').match(/^#\/(\w+)/); return m ? m[1] : null; }

function enter(){
  if (app.entered) return;
  app.entered = true;
  document.body.classList.add('entered');
  if (!app.worker){
    app.worker = { name: pick(CONTENT.workers.names), title: pick(CONTENT.workers.titles), serial: app.nextSerial() };
    store.set('sf_worker', app.worker);
  }
  showTimecard();
}
function showTimecard(){
  const w = app.worker; if (!w) return;
  $('#tcName').textContent = w.name; $('#tcTitle').textContent = w.title; $('#tcSerial').textContent = w.serial;
  $('#timecard').hidden = false;
  if (window.gsap && !reduced) window.gsap.fromTo('#timecard', { x:-180, rotate:-12, opacity:0 }, { x:0, rotate:-2, opacity:1, duration:.6, ease:'back.out(1.5)' });
}

function initRouter(){
  current = 'clockin';   // matches the is-active view in the HTML
  const tick = () => { const d=new Date(); $('#punchTime').textContent = `${pad(d.getHours(),2)}:${pad(d.getMinutes(),2)}`; };
  tick(); setInterval(tick, 1000*20);

  on($('#punchclock'), 'click', () => { app.audio.unlock(); app.audio.kachunk(); enter(); go('press'); });

  // nav + brand
  $$('#rooms a, .topbar__brand').forEach(a => on(a, 'click', (e) => {
    const id = a.dataset.room || parseHashFrom(a.getAttribute('href'));
    if (!id) return; e.preventDefault(); enter(); go(id);
  }));
  function parseHashFrom(href){ const m=(href||'').match(/#\/(\w+)/); return m?m[1]:null; }

  on($('#prevRoom'), 'click', () => { app.audio.tick(); go($('#prevRoom').dataset.target); });
  on($('#nextRoom'), 'click', () => { app.audio.tick(); go($('#nextRoom').dataset.target); });
  on(window, 'keydown', (e) => {
    if (!app.entered) return;
    if (e.target.matches && e.target.matches('input,textarea,[role="slider"]')) return;
    if (e.key === 'ArrowLeft' && current !== 'press') {}
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.key === '[') go($('#prevRoom').dataset.target);
    else if (e.key === ']') go($('#nextRoom').dataset.target);
  });

  on(window, 'hashchange', () => {
    const id = parseHash();
    if (id && viewEl(id)){ if (ROOMS.includes(id)) enter(); go(id, false); }
  });

  // initial route
  const start = parseHash();
  if (app.worker){ enter(); go(start && viewEl(start) ? start : 'press', false); }
  else if (start && ROOMS.includes(start)){ enter(); go(start, false); }
  else go('clockin', false);
}

/* ---------- controls ---------- */
function initControls(){
  const sound = $('#soundToggle'), flash = $('#flashToggle'), lang = $('#langToggle'), epiFlash = $('#epiReduceFlash');
  const syncSound = () => { sound.setAttribute('aria-pressed', String(app.audio.on)); sound.querySelector('.ctl__label').textContent = app.audio.on ? app.t('sound_on') : app.t('sound_off'); };
  let reduceFlash = store.get('sf_flash', false);
  const syncFlash = () => { document.body.classList.toggle('reduce-flash', reduceFlash); flash.setAttribute('aria-pressed', String(reduceFlash)); flash.querySelector('.ctl__label').textContent = reduceFlash ? app.t('flash_low') : app.t('flash_ok'); if (epiFlash) epiFlash.checked = reduceFlash; };
  syncSound(); syncFlash();
  on(sound, 'click', () => { app.audio.toggle(); syncSound(); if (app.audio.on) app.audio.plip(); });
  on(flash, 'click', () => { reduceFlash = !reduceFlash; store.set('sf_flash', reduceFlash); syncFlash(); });
  if (epiFlash) on(epiFlash, 'change', () => { reduceFlash = epiFlash.checked; store.set('sf_flash', reduceFlash); syncFlash(); });
  on(lang, 'click', () => { setLang(app.lang === 'en' ? 'zh' : 'en'); syncSound(); syncFlash(); });
  app.bus.on('lang', () => { syncSound(); syncFlash(); });
}

/* ---------- boot ---------- */
function boot(){
  applyI18n();
  fillAbout();
  initMarquee();
  initFoil();
  initControls();
  initCursor(() => app.currentInk);

  try { initPress(app); } catch(e){ console.error('press', e); }
  try { initWall(app); } catch(e){ console.error('wall', e); }
  try { initInkLab(app); } catch(e){ console.error('inklab', e); }
  try { initScreenTest(app); } catch(e){ console.error('screentest', e); }
  try { initEPI(app); } catch(e){ console.error('epi', e); }
  try { initCapsule(app); } catch(e){ console.error('capsule', e); }
  try { initWorks(app); } catch(e){ console.error('works', e); }
  try { initGallery(app); } catch(e){ console.error('gallery', e); }

  initRouter();
  measureTopbar();
  on(window, 'resize', rafThrottle(measureTopbar), { passive:true });
  // re-measure once webfonts settle (can change topbar height)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureTopbar);
  app.bus.on('lang', () => requestAnimationFrame(measureTopbar));
  document.documentElement.classList.add('ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
