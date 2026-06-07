/* ============================================================
   02 · THE WALL — repetition grid, each cell a new colourway.
   ============================================================ */
import { $, $$, on, shuffle, COLORWAYS, prefersReducedMotion } from '../core/util.js';
import { renderColorway, makeCanvas } from '../core/halftone.js';

export function initWall(app){
  const grid = $('#wallGrid');
  const dens = $('#wallDensity');
  const densOut = $('#wallDensityOut');
  const shuffleBtn = $('#wallShuffle');
  const usePrintBtn = $('#wallUsePrint');
  const reduced = prefersReducedMotion();

  let usePrint = false;
  const CELL = 220;

  function build(){
    const seps = app.state.seps;
    if (!seps){ grid.innerHTML = '<p class="mono" style="padding:20px">Pull a print first.</p>'; return; }
    // keep tiles a usable size on small screens
    const maxN = innerWidth < 520 ? 3 : innerWidth < 860 ? 4 : 6;
    dens.max = String(maxN);
    if (+dens.value > maxN) dens.value = String(maxN);
    const n = +dens.value;
    densOut.textContent = `${n} × ${n}`;
    grid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    grid.innerHTML = '';
    const ways = shuffle(COLORWAYS);
    const total = n*n;
    const cells = [];
    for (let i=0;i<total;i++){
      const cell = document.createElement('button');
      cell.className = 'wall__cell';
      cell.type = 'button';
      cell.setAttribute('aria-label', `Tile ${i+1} — click to recolour`);
      const c = document.createElement('canvas'); c.width=CELL; c.height=CELL;
      const cc = c.getContext('2d');
      if (usePrint && app.state.lastPrint){
        cc.drawImage(app.state.lastPrint, 0, 0, CELL, CELL);
      } else {
        const way = ways[i % ways.length];
        const rc = renderColorway(seps, way, { misreg: 3, size: CELL });
        cc.drawImage(rc, 0, 0, CELL, CELL);
      }
      cell.appendChild(c);
      on(cell, 'mouseenter', () => app.audio.tick());
      on(cell, 'click', () => { recolorCell(cc, seps); app.audio.plip(); });
      grid.appendChild(cell);
      cells.push(cell);
    }
    if (window.gsap && !reduced){
      window.gsap.from(cells, { opacity:0, scale:0.6, duration:0.4, ease:'back.out(1.6)',
        stagger:{ each:0.025, grid:[n,n], from:'start' } });
    }
  }
  function recolorCell(cc, seps){
    const way = shuffle(COLORWAYS)[0];
    const rc = renderColorway(seps, way, { misreg: 4, size: CELL });
    cc.clearRect(0,0,CELL,CELL); cc.drawImage(rc, 0, 0, CELL, CELL);
  }

  on(dens, 'input', build);
  on(shuffleBtn, 'click', () => { usePrint=false; usePrintBtn.classList.remove('is-active'); build(); app.audio.kachunk(); });
  on(usePrintBtn, 'click', () => {
    if (!app.state.lastPrint){ usePrintBtn.textContent='⮌ PULL ONE FIRST'; setTimeout(()=>usePrintBtn.textContent='⮌ USE MY PRINT',1400); return; }
    usePrint = !usePrint; usePrintBtn.classList.toggle('is-active', usePrint); build(); app.audio.plip();
  });

  app.bus.on('seps', build);
  app.bus.on('print', () => { /* keep current view; user can opt-in */ });

  // build when first scrolled into view (cheaper) or immediately if seps exist
  let built = false;
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting && !built){ built = true; build(); } });
  }, { rootMargin:'200px' });
  io.observe(grid);

  return { build };
}
