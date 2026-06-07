/* ============================================================
   UTIL — tiny helpers shared across the Factory.
   ============================================================ */
export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
export const lerp  = (a, b, t) => a + (b - a) * t;
export const map   = (v, a, b, c, d) => c + (d - c) * ((v - a) / (b - a));
export const round = (v, n = 0) => { const p = 10 ** n; return Math.round(v * p) / p; };

// seedless but varied-enough randomness
export const rand  = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isTouch = () => window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

// rAF-throttle a function so it runs at most once per frame
export function rafThrottle(fn){
  let queued = false, lastArgs;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(...lastArgs); });
  };
}

export const hexToRgb = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
export const rgbToHex = (r, g, b) =>
  '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

export const relLuma = ({ r, g, b }) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

// pick black or white text for contrast on a given bg color
export const readableInk = (hex) => relLuma(hexToRgb(hex)) > 0.55 ? '#0A0A0A' : '#FBF6E9';

// pad a number with leading zeros
export const pad = (n, len = 3) => String(n).padStart(len, '0');

// safe localStorage
export const store = {
  get(key, fallback){ try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, val){ try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } },
  del(key){ try { localStorage.removeItem(key); } catch {} }
};

// the fluorescent ink set
export const INKS = {
  pink:'#FF2D95', cyan:'#00E5FF', yellow:'#FFE800', orange:'#FF5A00',
  lime:'#A6FF00', violet:'#7A00FF', red:'#FF003C', soup:'#E4002B',
  gold:'#C9A227', ink:'#0A0A0A'
};
export const INK_LIST = ['#FF2D95','#00E5FF','#FFE800','#FF5A00','#A6FF00','#7A00FF','#FF003C','#0A0A0A'];

// Warhol-style colourways for the wall (background, midtone, accent, key)
export const COLORWAYS = [
  ['#FFE800','#FF2D95','#00E5FF','#0A0A0A'],
  ['#FF5A00','#7A00FF','#A6FF00','#0A0A0A'],
  ['#00E5FF','#FF003C','#FFE800','#0A0A0A'],
  ['#A6FF00','#FF2D95','#7A00FF','#0A0A0A'],
  ['#FF2D95','#FFE800','#0A0A0A','#0A0A0A'],
  ['#0A0A0A','#FFE800','#FF003C','#0A0A0A'],
  ['#7A00FF','#00E5FF','#FF5A00','#0A0A0A'],
  ['#E4002B','#FFE800','#0A0A0A','#FBF6E9'],
  ['#00E5FF','#0A0A0A','#FF2D95','#0A0A0A'],
  ['#FBF6E9','#FF2D95','#00E5FF','#0A0A0A']
];

// tiny event helper that respects passive where useful
export const on = (el, ev, fn, opts) => { el.addEventListener(ev, fn, opts); return () => el.removeEventListener(ev, fn, opts); };
