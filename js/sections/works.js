/* ============================================================
   07 · THE WORKS — a study gallery of the real pieces.
   Real images hotlinked from public archives; generated
   stand-ins where no free image exists. Educational use.
   ============================================================ */
import { $, on, pick, COLORWAYS } from '../core/util.js';
import { drawSubject, buildSeparations, renderColorway } from '../core/halftone.js';
import { WORKS } from '../works-data.js';

export function initWorks(app){
  const grid = $('#worksGrid');
  const modal = $('#workModal');
  const mImg = $('#workModalImg');
  const mTitle = $('#workModalTitle');
  const mSub = $('#workModalSub');
  const mNote = $('#workModalNote');
  const mSrc = $('#workModalSrc');
  const mClose = $('#workModalClose');
  const mBackdrop = $('#workModalBackdrop');

  const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='360'%3E%3Crect width='360' height='360' fill='%23F4ECD8'/%3E%3Crect x='8' y='8' width='344' height='344' fill='none' stroke='%230A0A0A' stroke-width='6'/%3E%3Ctext x='180' y='190' font-family='monospace' font-size='22' text-anchor='middle' fill='%230A0A0A'%3EWARHOL%3C/text%3E%3C/svg%3E";
  const fallbackCache = new Map();
  function fallbackURL(work, i){
    if (fallbackCache.has(work.id)) return fallbackCache.get(work.id);
    let url;
    try {
      const seps = buildSeparations(drawSubject(work.fallback || 'soup', 360), 360);
      const cv = renderColorway(seps, COLORWAYS[i % COLORWAYS.length], { misreg:4, size:360 });
      url = cv.toDataURL('image/jpeg', 0.85);
    } catch(e){ url = PLACEHOLDER; }
    fallbackCache.set(work.id, url);
    return url;
  }

  let built = false;
  function build(){
    if (built) return; built = true;
    grid.innerHTML = '';
    WORKS.forEach((w, i) => {
      const card = document.createElement('button');
      card.className = 'workcard'; card.type = 'button';
      card.setAttribute('aria-label', `${w.title}, ${w.year}`);

      const frame = document.createElement('div'); frame.className = 'workcard__frame';
      const img = document.createElement('img');
      img.loading = 'lazy'; img.alt = w.title;
      img.referrerPolicy = 'no-referrer';
      const tag = document.createElement('span'); tag.className = 'workcard__tag'; tag.textContent = w.year;
      frame.append(img, tag);

      const cap = document.createElement('div'); cap.className = 'workcard__cap';
      cap.innerHTML = `<b></b><span></span>`;
      cap.querySelector('b').textContent = w.title;
      cap.querySelector('span').textContent = shortCollection(w.collection);

      card.append(frame, cap);
      // set image after the card is assembled so markRepr can find the frame
      img.src = w.img || fallbackURL(w, i);
      if (w.img){ img.onerror = () => { img.onerror = null; img.src = fallbackURL(w, i); markRepr(card); }; }
      else markRepr(card);

      on(card, 'click', () => openModal(w, i));
      grid.appendChild(card);
    });
  }
  function markRepr(card){
    if (card.querySelector('.workcard__repr')) return;
    const r = document.createElement('span');
    r.className = 'workcard__tag workcard__repr';
    r.style.cssText = 'left:auto;right:6px;background:#7A00FF';
    r.textContent = app.t('works_repr');
    card.querySelector('.workcard__frame').appendChild(r);
  }
  function shortCollection(c){ return (c || '').split(/[(·]/)[0].trim().slice(0, 42); }

  const BG = ['#topbar','#marquee','#prevRoom','#nextRoom','#stage'].map(s=>$(s)).filter(Boolean);
  function setBgInert(on){ BG.forEach(el => { if (on){ el.setAttribute('inert',''); el.setAttribute('aria-hidden','true'); } else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); } }); }
  let lastFocus = null;

  function addModalRepr(){
    if (mImg.querySelector('.workcard__repr')) return;
    const r = document.createElement('span');
    r.className = 'workcard__tag workcard__repr';
    r.style.cssText = 'left:auto;right:8px;top:8px;background:#7A00FF';
    r.textContent = app.t('works_repr');
    mImg.appendChild(r);
  }
  function openModal(w, i){
    lastFocus = document.activeElement;
    mImg.innerHTML = '';
    const isRepr = !w.img;
    const img = document.createElement('img');
    img.referrerPolicy = 'no-referrer';
    img.alt = isRepr ? `${w.title} — ${app.t('works_repr')}` : w.title;
    img.src = w.img || fallbackURL(w, i);
    if (w.img) img.onerror = () => { img.onerror=null; img.src = fallbackURL(w, i); img.alt = `${w.title} — ${app.t('works_repr')}`; addModalRepr(); };
    mImg.appendChild(img);
    if (isRepr) addModalRepr();
    mTitle.textContent = w.title;
    mSub.textContent = `${w.year} · ${w.medium} · ${w.collection}`;
    mNote.textContent = w.note;
    mSrc.href = w.src || '#';
    mSrc.style.display = w.src ? '' : 'none';
    modal.hidden = false;
    document.body.classList.add('modal-open');
    setBgInert(true);
    mClose.focus();
    app.audio && app.audio.plip();
  }
  function closeModal(){
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    setBgInert(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  on(mClose, 'click', closeModal);
  on(mBackdrop, 'click', closeModal);
  on(document, 'keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape'){ closeModal(); return; }
    if (e.key === 'Tab'){ // trap focus inside the modal
      const focusables = [mClose, (mSrc.style.display !== 'none' ? mSrc : null)].filter(Boolean);
      const first = focusables[0], last = focusables[focusables.length-1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      else if (!focusables.includes(document.activeElement)){ e.preventDefault(); first.focus(); }
    }
  });

  // build when the room is first shown
  app.bus.on('view:show', (id) => { if (id === 'works') build(); });

  return { build };
}
