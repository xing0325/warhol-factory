/* ============================================================
   THE SILVER FACTORY — bootstrap & integration.
   ============================================================ */
import { $, $$, on, pick, prefersReducedMotion, isFinePointer, rafThrottle, store, pad, INK_LIST } from './core/util.js';
import { AudioEngine } from './core/audio.js';
import { initCursor } from './core/cursor.js';
import { rack } from './core/gallery-store.js';
import { CONTENT } from './content.js';

import { initPress } from './sections/press.js';
import { initWall } from './sections/wall.js';
import { initInkLab } from './sections/inklab.js';
import { initScreenTest } from './sections/screentest.js';
import { initEPI } from './sections/epi.js';
import { initCapsule } from './sections/capsule.js';
import { initGallery } from './sections/gallery.js';

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add('rm');

/* ---------- tiny event bus ---------- */
function bus(){
  const m = new Map();
  return {
    on(ev, fn){ (m.get(ev) || m.set(ev,[]).get(ev)).push(fn); },
    emit(ev, data){ (m.get(ev)||[]).forEach(fn => { try{ fn(data); }catch(e){ console.warn(e); } }); }
  };
}

/* ---------- the app context shared with sections ---------- */
const app = {
  audio: new AudioEngine(),
  reduced, fine: isFinePointer(),
  inks: INK_LIST.slice(),
  inkNames: new Map(),
  currentInk: '#FFE800',
  state: { seps:null, lastPrint:null },
  bus: bus(),
  rack,
  worker: store.get('sf_worker', null),
  _serial: store.get('sf_serial', 0),
  nextSerial(){ this._serial++; store.set('sf_serial', this._serial); return `${CONTENT.workers.serialPrefix}-${pad(this._serial,3)}`; },
  nextSerialPreview(){ return `${CONTENT.workers.serialPrefix}-${pad(this._serial+1,3)}`; },
  stamp(){
    const d = new Date();
    const mon = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()];
    return `${pad(d.getDate(),2)} ${mon} ${d.getFullYear()} · ${pad(d.getHours(),2)}:${pad(d.getMinutes(),2)}`;
  }
};

/* ---------- apply copy ---------- */
function applyCopy(){
  $$('[data-copy]').forEach(el => {
    if (el.hasAttribute('data-text')) return;        // leave misregistered titles to the HTML
    const key = el.getAttribute('data-copy');
    if (CONTENT.copy[key] != null) el.textContent = CONTENT.copy[key];
  });
  // dot nav labels for the ::before tooltips + screen-reader names
  $$('#dotnav a').forEach(a => {
    const label = a.textContent.trim();
    a.setAttribute('data-label', label);
    a.setAttribute('aria-label', 'Go to ' + label);
  });
}

/* ---------- about ---------- */
function fillAbout(){
  const A = CONTENT.about;
  $('#aboutIntro').innerHTML = A.intro.map(p => `<p>${p}</p>`).join('');
  $('#aboutFacts').innerHTML = A.facts.map(f => `<li><b>${f.fact}</b><span>${f.detail}</span></li>`).join('');
  $('#aboutPhilo').innerHTML = A.philosophy.map(p => `<p>${p}</p>`).join('');
  $('#aboutColophon').textContent = A.colophon;
  $('#aboutCredit').textContent = A.credit;
}

/* ---------- marquee ---------- */
function initMarquee(){
  const track = $('#marqueeTrack');
  const items = CONTENT.quotes.marquee;
  const html = items.map(t => `<span class="marquee__item">${t}</span>`).join('');
  track.innerHTML = html + html;   // duplicate for seamless wrap
  if (reduced) return;
  let x = 0, raf = null, visible = false;
  const speed = 0.6;
  const step = () => {
    if (!visible){ raf = null; return; }   // pause when off-screen
    x -= speed;
    const half = track.scrollWidth / 2;
    if (-x >= half) x += half;
    track.style.transform = `translateX(${x}px)`;
    raf = requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((ents) => {
    visible = ents[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(step);
  }, { threshold: 0 });
  io.observe($('#marquee'));
}

/* ---------- foil specular follows the pointer ---------- */
function initFoil(){
  const spec = $('#foilSpec');
  if (!spec || reduced) return;
  const set = rafThrottle((x,y) => { spec.style.transform = `translate3d(${x}px,${y}px,0)`; });
  on(window, 'pointermove', (e) => set(e.clientX - innerWidth/2, e.clientY - innerHeight/2), { passive:true });
  // parallax on scroll
  on(window, 'scroll', rafThrottle(() => {
    const y = scrollY * 0.04;
    $('.foil__base').style.transform = `translateY(${y}px)`;
  }), { passive:true });
}

/* ---------- zone tracking + dot nav spy + title reveals ---------- */
function initSpy(){
  const sections = $$('.section');
  const links = $$('#dotnav a');
  const byId = {}; links.forEach(a => byId[a.getAttribute('href').slice(1)] = a);
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      document.body.dataset.zone = e.target.dataset.zone || 'default';
      links.forEach(a => a.classList.remove('is-active'));
      if (byId[id]) byId[id].classList.add('is-active');
    });
  }, { threshold: 0.5 });
  sections.forEach(s => io.observe(s));

  // title misregistration snaps toward register on enter
  if (window.gsap && window.ScrollTrigger && !reduced){
    window.gsap.registerPlugin(window.ScrollTrigger);
    $$('.sec-title[data-mis], .megatitle__line').forEach(el => {
      window.gsap.fromTo(el,
        { '--mx':'16px', '--my':'14px' },
        { '--mx':'5px', '--my':'4px', duration:0.9, ease:'elastic.out(1,0.5)',
          scrollTrigger:{ trigger: el, start:'top 85%' } });
    });
  }
}

/* ---------- clock in ---------- */
function initClockIn(){
  const btn = $('#punchclock');
  const timecard = $('#timecard');
  const tcName = $('#tcName'), tcTitle = $('#tcTitle'), tcSerial = $('#tcSerial');
  const punchTime = $('#punchTime');

  const tick = () => { const d=new Date(); punchTime.textContent = `${pad(d.getHours(),2)}:${pad(d.getMinutes(),2)}`; };
  tick(); setInterval(tick, 1000*20);

  function showCard(w){
    tcName.textContent = w.name; tcTitle.textContent = w.title; tcSerial.textContent = w.serial;
    timecard.hidden = false;
    if (window.gsap && !reduced) window.gsap.fromTo(timecard, { x:-180, rotate:-12, opacity:0 }, { x:0, rotate:-2, opacity:1, duration:0.6, ease:'back.out(1.5)' });
  }
  if (app.worker) showCard(app.worker);

  on(btn, 'click', () => {
    app.audio.unlock();
    if (!app.worker){
      app.worker = { name: pick(CONTENT.workers.names), title: pick(CONTENT.workers.titles), serial: app.nextSerial() };
      store.set('sf_worker', app.worker);
      showCard(app.worker);
    }
    app.audio.kachunk();
    const press = document.getElementById('press');
    press.scrollIntoView({ behavior: reduced ? 'auto':'smooth' });
  });
}

/* ---------- controls: sound + flashing ---------- */
function initControls(){
  const sound = $('#soundToggle');
  const flash = $('#flashToggle');
  const epiFlash = $('#epiReduceFlash');

  const syncSound = () => {
    sound.setAttribute('aria-pressed', String(app.audio.on));
    sound.querySelector('.ctl__label').textContent = app.audio.on ? CONTENT.copy.sound_on : CONTENT.copy.sound_off;
  };
  syncSound();
  on(sound, 'click', () => { app.audio.toggle(); syncSound(); if (app.audio.on) app.audio.plip(); });

  let reduceFlash = store.get('sf_flash', false);
  const syncFlash = () => {
    document.body.classList.toggle('reduce-flash', reduceFlash);
    flash.setAttribute('aria-pressed', String(reduceFlash));
    flash.querySelector('.ctl__label').textContent = reduceFlash ? 'FLASH LOW' : 'FLASH OK';
    if (epiFlash) epiFlash.checked = reduceFlash;
  };
  syncFlash();
  on(flash, 'click', () => { reduceFlash = !reduceFlash; store.set('sf_flash', reduceFlash); syncFlash(); });
  if (epiFlash) on(epiFlash, 'change', () => { reduceFlash = epiFlash.checked; store.set('sf_flash', reduceFlash); syncFlash(); });
}

/* ---------- boot ---------- */
function boot(){
  applyCopy();
  fillAbout();
  initMarquee();
  initFoil();
  initClockIn();
  initControls();
  initSpy();
  initCursor(() => app.currentInk);

  // sections
  try { initPress(app); } catch(e){ console.error('press', e); }
  try { initWall(app); } catch(e){ console.error('wall', e); }
  try { initInkLab(app); } catch(e){ console.error('inklab', e); }
  try { initScreenTest(app); } catch(e){ console.error('screentest', e); }
  try { initEPI(app); } catch(e){ console.error('epi', e); }
  try { initCapsule(app); } catch(e){ console.error('capsule', e); }
  try { initGallery(app); } catch(e){ console.error('gallery', e); }

  document.documentElement.classList.add('ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
