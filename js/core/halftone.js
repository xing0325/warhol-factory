/* ============================================================
   HALFTONE / SEPARATIONS — the silkscreen engine.

   buildSeparations(src) turns any image into Warhol-style plates:
     - flat tonal colour layers (the Marilyn-poster look)
     - a photographic HALFTONE KEY screened at 45 degrees
   The press reveals these layers one squeegee-pull at a time;
   the wall renders them in a colourway. No per-frame pixel math.
   ============================================================ */

export const SEP = 600;            // working/print resolution
const KEY_ANGLE = 45 * Math.PI / 180;
const KEY_CELL  = 6;               // halftone dot pitch (px @ SEP)

export function makeCanvas(w, h){
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

/* ---------- subject drawings (transparent background) ---------- */
function base(ctx, s){ ctx.clearRect(0,0,s,s); }

function drawSoup(ctx, s){
  base(ctx, s);
  const x = s*0.26, w = s*0.48, y = s*0.10, h = s*0.80;
  // body with cylinder shading (gives tone)
  const g = ctx.createLinearGradient(x,0,x+w,0);
  g.addColorStop(0,'#9b0020'); g.addColorStop(.18,'#E4002B'); g.addColorStop(.5,'#ff2b46');
  g.addColorStop(.82,'#E4002B'); g.addColorStop(1,'#8c001c');
  ctx.fillStyle = g; ctx.fillRect(x,y,w,h*0.5);
  const gw = ctx.createLinearGradient(x,0,x+w,0);
  gw.addColorStop(0,'#cfc7b0'); gw.addColorStop(.2,'#FBF6E9'); gw.addColorStop(.5,'#ffffff');
  gw.addColorStop(.8,'#FBF6E9'); gw.addColorStop(1,'#cfc7b0');
  ctx.fillStyle = gw; ctx.fillRect(x,y+h*0.5,w,h*0.5);
  // gold bands
  ctx.fillStyle = '#C9A227';
  ctx.fillRect(x, y+h*0.48, w, h*0.04);
  ctx.fillRect(x, y+h*0.46, w, h*0.012);
  ctx.fillRect(x, y+h*0.54, w, h*0.012);
  // medallion
  ctx.beginPath(); ctx.arc(s/2, y+h*0.74, w*0.16, 0, 7); ctx.fillStyle='#C9A227'; ctx.fill();
  ctx.beginPath(); ctx.arc(s/2, y+h*0.74, w*0.115, 0, 7); ctx.fillStyle='#9c0019'; ctx.fill();
  // type
  ctx.fillStyle = '#FBF6E9'; ctx.textAlign='center'; ctx.font = `700 ${s*0.052}px 'Archivo Black',sans-serif`;
  ctx.fillText("FACTORY'S", s/2, y+h*0.16);
  ctx.fillStyle = '#9c0019'; ctx.font = `700 ${s*0.05}px 'Archivo Black',sans-serif`;
  ctx.fillText('CONDENSED', s/2, y+h*0.78);
  ctx.fillText('POP ART SOUP', s/2, y+h*0.86);
  // outline + lid
  ctx.lineWidth = s*0.012; ctx.strokeStyle = '#0A0A0A';
  ctx.strokeRect(x,y,w,h);
  ctx.beginPath(); ctx.ellipse(s/2, y, w/2, h*0.03, 0, 0, 7); ctx.fillStyle='#b9b9bf'; ctx.fill(); ctx.stroke();
}

function drawBanana(ctx, s){
  base(ctx, s);
  ctx.save(); ctx.translate(s*0.5, s*0.5); ctx.scale(s/220, s/220); ctx.translate(-110,-180);
  const skin = new Path2D('M150 20 C200 90 205 230 120 330 C70 388 18 330 40 300 C120 250 150 150 120 70 C110 40 130 18 150 20 Z');
  const g = ctx.createLinearGradient(20,0,200,0);
  g.addColorStop(0,'#caa400'); g.addColorStop(.4,'#FFE800'); g.addColorStop(.7,'#fff27a'); g.addColorStop(1,'#caa400');
  ctx.fillStyle = g; ctx.fill(skin);
  ctx.lineWidth = 6; ctx.strokeStyle = '#0A0A0A'; ctx.stroke(skin);
  // tip
  ctx.beginPath(); ctx.ellipse(150,24,15,11,0,0,7); ctx.fillStyle='#5a3d10'; ctx.fill(); ctx.stroke();
  // seam shadow
  ctx.beginPath(); ctx.moveTo(150,30); ctx.bezierCurveTo(192,96,196,225,120,322);
  ctx.lineWidth=8; ctx.strokeStyle='rgba(90,61,16,.5)'; ctx.stroke();
  ctx.restore();
}

function drawFlower(ctx, s){
  base(ctx, s);
  // grass patch (dark)
  ctx.fillStyle = '#0d2b12';
  for(let i=0;i<260;i++){ const a=Math.random()*7,r=s*0.42*Math.random(); const x=s/2+Math.cos(a)*r, y=s/2+Math.sin(a)*r*0.8; ctx.fillRect(x,y,2.5,2.5); }
  ctx.beginPath(); ctx.arc(s/2,s/2,s*0.46,0,7); ctx.fillStyle='rgba(13,43,18,.55)'; ctx.fill();
  // 4 petals
  const cx=s/2, cy=s/2, R=s*0.30;
  const petalCols=['#FF2D95','#FF2D95','#FF2D95','#FF2D95'];
  for(let i=0;i<4;i++){
    const a = i*Math.PI/2 + Math.PI/4;
    const px = cx+Math.cos(a)*R*0.62, py = cy+Math.sin(a)*R*0.62;
    const g = ctx.createRadialGradient(px,py,4,px,py,R*0.8);
    g.addColorStop(0,'#ff7ac0'); g.addColorStop(.6,petalCols[i]); g.addColorStop(1,'#c11a6e');
    ctx.beginPath(); ctx.ellipse(px,py,R*0.7,R*0.62,a,0,7); ctx.fillStyle=g; ctx.fill();
    ctx.lineWidth=s*0.01; ctx.strokeStyle='#0A0A0A'; ctx.stroke();
  }
  // center
  ctx.beginPath(); ctx.arc(cx,cy,R*0.32,0,7); ctx.fillStyle='#FFE800'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,R*0.20,0,7); ctx.fillStyle='#FF5A00'; ctx.fill();
}

function drawDollar(ctx, s){
  base(ctx, s);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  // soft shadow gives a midtone
  ctx.fillStyle = 'rgba(10,10,10,.28)';
  ctx.font = `400 ${s*0.92}px 'Anton',Impact,sans-serif`;
  ctx.fillText('$', s/2 + s*0.03, s/2 + s*0.03);
  // green body for tone
  const g = ctx.createLinearGradient(0,s*0.1,0,s*0.9);
  g.addColorStop(0,'#1aae4e'); g.addColorStop(1,'#0b5a28');
  ctx.fillStyle = g; ctx.fillText('$', s/2, s/2);
  ctx.lineWidth = s*0.02; ctx.strokeStyle = '#0A0A0A'; ctx.strokeText('$', s/2, s/2);
}

function drawFace(ctx, s){
  base(ctx, s);
  const cx=s/2;
  // hair (flat region behind)
  ctx.fillStyle = '#caa400';
  ctx.beginPath();
  ctx.moveTo(cx-s*0.30, s*0.42);
  ctx.bezierCurveTo(cx-s*0.40, s*0.10, cx+s*0.42, s*0.04, cx+s*0.34, s*0.40);
  ctx.bezierCurveTo(cx+s*0.30, s*0.30, cx+s*0.20, s*0.24, cx+s*0.16, s*0.30);
  ctx.bezierCurveTo(cx+s*0.10, s*0.16, cx-s*0.18, s*0.16, cx-s*0.22, s*0.34);
  ctx.bezierCurveTo(cx-s*0.26, s*0.26, cx-s*0.30, s*0.30, cx-s*0.30, s*0.42);
  ctx.closePath(); ctx.fill();
  // face oval with shading
  const fg = ctx.createRadialGradient(cx-s*0.05, s*0.46, s*0.04, cx, s*0.52, s*0.34);
  fg.addColorStop(0,'#fff0e6'); fg.addColorStop(.6,'#f3cdb0'); fg.addColorStop(1,'#c99277');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.ellipse(cx, s*0.54, s*0.22, s*0.28, 0, 0, 7); ctx.fill();
  // cheeks shadow
  ctx.fillStyle='rgba(120,70,50,.25)';
  ctx.beginPath(); ctx.ellipse(cx-s*0.15,s*0.58,s*0.05,s*0.10,0,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+s*0.15,s*0.58,s*0.05,s*0.10,0,0,7); ctx.fill();
  // eyes
  ctx.fillStyle='#0A0A0A';
  ctx.beginPath(); ctx.ellipse(cx-s*0.09,s*0.50,s*0.035,s*0.02,0,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+s*0.09,s*0.50,s*0.035,s*0.02,0,0,7); ctx.fill();
  // brows
  ctx.lineWidth=s*0.012; ctx.strokeStyle='#0A0A0A';
  ctx.beginPath(); ctx.moveTo(cx-s*0.14,s*0.455); ctx.quadraticCurveTo(cx-s*0.09,s*0.435,cx-s*0.04,s*0.455); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+s*0.04,s*0.455); ctx.quadraticCurveTo(cx+s*0.09,s*0.435,cx+s*0.14,s*0.455); ctx.stroke();
  // nose
  ctx.beginPath(); ctx.moveTo(cx,s*0.52); ctx.lineTo(cx-s*0.02,s*0.60); ctx.lineTo(cx+s*0.02,s*0.60); ctx.strokeStyle='rgba(120,70,50,.5)'; ctx.stroke();
  // lips
  ctx.fillStyle='#d11e3f';
  ctx.beginPath(); ctx.ellipse(cx,s*0.66,s*0.075,s*0.03,0,0,7); ctx.fill();
  ctx.strokeStyle='#7a0f22'; ctx.lineWidth=s*0.006;
  ctx.beginPath(); ctx.moveTo(cx-s*0.075,s*0.66); ctx.lineTo(cx+s*0.075,s*0.66); ctx.stroke();
  // beauty mark
  ctx.beginPath(); ctx.arc(cx+s*0.10,s*0.62,s*0.008,0,7); ctx.fillStyle='#0A0A0A'; ctx.fill();
}

export const SUBJECTS = [
  { id:'soup',   label:'Soup',   draw:drawSoup },
  { id:'banana', label:'Banana', draw:drawBanana },
  { id:'flower', label:'Flower', draw:drawFlower },
  { id:'dollar', label:'Dollar', draw:drawDollar },
  { id:'face',   label:'Face',   draw:drawFace }
];

export function drawSubject(id, size = SEP){
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const subj = SUBJECTS.find(s => s.id === id) || SUBJECTS[0];
  subj.draw(ctx, size);
  return c;
}

/* fit an image/video into a square canvas with a slight contrast boost */
export function prepareFromImage(media, size = SEP){
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const mw = media.videoWidth || media.naturalWidth || media.width;
  const mh = media.videoHeight || media.naturalHeight || media.height;
  if (!mw || !mh){ ctx.fillStyle = '#888'; ctx.fillRect(0,0,size,size); return c; }
  const scale = Math.max(size/mw, size/mh);
  const dw = mw*scale, dh = mh*scale;
  ctx.filter = 'contrast(1.25) saturate(1.1)';
  ctx.drawImage(media, (size-dw)/2, (size-dh)/2, dw, dh);
  ctx.filter = 'none';
  return c;
}

/* ---------- the separation builder ---------- */
export function buildSeparations(src, size = SEP){
  const work = makeCanvas(size, size);
  const wctx = work.getContext('2d', { willReadFrequently:true });
  wctx.drawImage(src, 0, 0, size, size);
  const img = wctx.getImageData(0,0,size,size);
  const d = img.data;
  const N = size*size;

  // darkness + alpha
  const dark = new Float32Array(N);
  const isSubject = new Uint8Array(N);
  let anyAlpha = false;
  for (let i=0;i<N;i++){
    const a = d[i*4+3];
    if (a < 128){ dark[i] = 0; isSubject[i] = 0; anyAlpha = true; continue; }
    isSubject[i] = 1;
    const r=d[i*4], g=d[i*4+1], b=d[i*4+2];
    dark[i] = 1 - (0.2126*r + 0.7152*g + 0.0722*b)/255;
  }

  // tonal thresholds
  const T1 = 0.18, T2 = 0.46, T3 = 0.70;

  // cumulative masks: tone1 = darkness >= T1, tone2 = darkness >= T2
  const mask1 = makeMask(size, (i)=> isSubject[i] && dark[i] >= T1);
  const mask2 = makeMask(size, (i)=> isSubject[i] && dark[i] >= T2);

  // KEY = photographic halftone of the darkest detail, screened at 45°
  const cov = new Float32Array(N);
  for (let i=0;i<N;i++){
    cov[i] = isSubject[i] ? Math.max(0, Math.min(1, (dark[i]-T3)/(1-T3))) : 0;
  }
  const keyMask = halftoneDots(cov, size, KEY_CELL, KEY_ANGLE);

  return {
    size,
    hasAlpha: anyAlpha,
    layers: [
      { role:'fill', mask:null,    angle:0,  defaultColor:'#FFE800' },
      { role:'tone1', mask:mask1,  angle:15, defaultColor:'#FF2D95' },
      { role:'tone2', mask:mask2,  angle:75, defaultColor:'#00E5FF' },
      { role:'key',   mask:keyMask, angle:45, defaultColor:'#0A0A0A' }
    ]
  };
}

function makeMask(size, test){
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const o = img.data;
  for (let i=0;i<size*size;i++){
    if (test(i)){ o[i*4]=255; o[i*4+1]=255; o[i*4+2]=255; o[i*4+3]=255; }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* draw filled dots on a rotated lattice; dot radius ∝ sqrt(coverage) */
function halftoneDots(cov, size, cell, angle){
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  const cs = Math.cos(angle), sn = Math.sin(angle);
  const cx = size/2, cy = size/2;
  const diag = size * 0.78;
  const sample = (x,y) => {
    const xi = x|0, yi = y|0;
    if (xi<0||yi<0||xi>=size||yi>=size) return 0;
    return cov[yi*size + xi];
  };
  for (let u=-diag; u<diag; u+=cell){
    for (let v=-diag; v<diag; v+=cell){
      const x = cx + u*cs - v*sn;
      const y = cy + u*sn + v*cs;
      if (x<-cell||y<-cell||x>size+cell||y>size+cell) continue;
      const k = sample(x,y);
      if (k <= 0.02) continue;
      const r = Math.sqrt(k) * cell * 0.72;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
  }
  return c;
}

/* ---------- tinting ---------- */
/* tint a white-on-transparent mask with a solid colour.
   mask === null means "fill the whole square". */
export function tint(mask, color, size = SEP){
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  if (!mask){ ctx.fillStyle = color; ctx.fillRect(0,0,size,size); return c; }
  ctx.drawImage(mask, 0, 0, size, size);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0,0,size,size);
  return c;
}

/* ---------- full colourway render (used by the wall + machine pull) ---------- */
export function renderColorway(seps, colors, { misreg = 0, paper = '#FBF6E9', size = seps.size } = {}){
  const out = makeCanvas(size, size);
  const ctx = out.getContext('2d');
  const scale = size / seps.size;
  ctx.fillStyle = paper; ctx.fillRect(0,0,size,size);
  seps.layers.forEach((layer, i) => {
    const color = colors[i] ?? layer.defaultColor;
    const tc = tint(layer.mask, color, size);
    let ox = 0, oy = 0;
    if (misreg){ ox = (Math.random()*2-1)*misreg*scale; oy = (Math.random()*2-1)*misreg*scale; }
    ctx.drawImage(tc, ox, oy);
  });
  return out;
}

/* downscale a canvas to a thumbnail dataURL (for the gallery / localStorage) */
export function toThumb(canvas, max = 240, type = 'image/jpeg', q = 0.82){
  const r = Math.min(1, max / Math.max(canvas.width, canvas.height));
  const t = makeCanvas(Math.round(canvas.width*r), Math.round(canvas.height*r));
  const ctx = t.getContext('2d');
  ctx.fillStyle = '#FBF6E9'; ctx.fillRect(0,0,t.width,t.height);
  ctx.drawImage(canvas, 0, 0, t.width, t.height);
  return t.toDataURL(type, q);
}
