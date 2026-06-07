/* ============================================================
   AUDIO — everything synthesised, zero files.
   Opt-in, created/resumed only on a user gesture, mute persists,
   ducks on tab-blur. SFX + a Velvet-Underground-flavoured drone
   with an AnalyserNode for the E.P.I. visuals.
   ============================================================ */
import { store, clamp } from './util.js';

export class AudioEngine {
  constructor(){
    this.ctx = null;
    this.master = null;
    this.sfxGain = null;
    this.droneGain = null;
    this.analyser = null;
    this.on = store.get('sf_sound', false);
    this.noiseBuf = null;
    this.drone = null;       // running drone handle
    this._seqTimer = null;
    this._duck = 1;
    document.addEventListener('visibilitychange', () => {
      this._duck = document.hidden ? 0 : 1;
      this._applyGain();
    });
  }

  _ctx(){
    if (this.ctx) return this.ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.droneGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.sfxGain.gain.value = 0.9;
      this.droneGain.gain.value = 0.0;
      this.sfxGain.connect(this.master);
      this.droneGain.connect(this.analyser);
      this.analyser.connect(this.master);
      this.master.connect(this.ctx.destination);
      // noise buffer
      const len = this.ctx.sampleRate * 1.2;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = this.noiseBuf.getChannelData(0);
      for (let i=0;i<len;i++) ch[i] = Math.random()*2 - 1;
      this._applyGain();
    } catch(e){ this.ctx = null; }
    return this.ctx;
  }

  _applyGain(){
    if (!this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime((this.on ? 1 : 0) * this._duck, t, 0.02);
  }

  // called from a user gesture
  unlock(){
    const c = this._ctx();
    if (c && c.state === 'suspended') c.resume();
    return c;
  }

  setOn(v){
    this.on = v;
    store.set('sf_sound', v);
    if (v) this.unlock();
    this._applyGain();
    return this.on;
  }
  toggle(){ return this.setOn(!this.on); }

  _noise(){ const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; return s; }

  // ---- SFX ----
  squeegee(intensity = 0.6){
    if (!this.on || !this._ctx()) return;
    const c = this.ctx, t = c.currentTime;
    const src = this._noise(); src.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = 320 + intensity*1400; bp.Q.value = 0.7;
    const lp = c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 2200 + intensity*3000;
    const g = c.createGain();
    const dur = clamp(0.12 + (1-intensity)*0.22, 0.08, 0.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.18 + intensity*0.18, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0008, t+dur);
    src.connect(bp); bp.connect(lp); lp.connect(g); g.connect(this.sfxGain);
    src.start(t); src.stop(t+dur+0.05);
  }
  thunk(){
    if (!this.on || !this._ctx()) return;
    const c=this.ctx, t=c.currentTime;
    const o=c.createOscillator(); o.type='square'; o.frequency.setValueAtTime(120,t); o.frequency.exponentialRampToValueAtTime(48,t+0.16);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.5,t+0.01); g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
    o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t+0.26);
    // click
    const n=this._noise(); const ng=c.createGain(); ng.gain.setValueAtTime(0.25,t); ng.gain.exponentialRampToValueAtTime(0.001,t+0.04);
    const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1500;
    n.connect(hp); hp.connect(ng); ng.connect(this.sfxGain); n.start(t); n.stop(t+0.05);
  }
  plip(){
    if (!this.on || !this._ctx()) return;
    const c=this.ctx,t=c.currentTime; const o=c.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(900,t); o.frequency.exponentialRampToValueAtTime(220,t+0.09);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.3,t+0.005); g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t+0.14);
  }
  kachunk(){ this.thunk(); setTimeout(()=>this.thunk(), 90); }
  rrrip(dur = 0.4){
    if (!this.on || !this._ctx()) return;
    const c=this.ctx,t=c.currentTime; const src=this._noise(); src.loop=true;
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=1.2;
    bp.frequency.setValueAtTime(1800,t); bp.frequency.exponentialRampToValueAtTime(500,t+dur);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.22,t+0.03); g.gain.setValueAtTime(0.22,t+dur*0.7); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    src.connect(bp); bp.connect(g); g.connect(this.sfxGain); src.start(t); src.stop(t+dur+0.05);
  }
  chaching(){
    if (!this.on || !this._ctx()) return;
    const c=this.ctx,t=c.currentTime;
    [0,0.08].forEach((dt,i)=>{ const o=c.createOscillator(); o.type='triangle'; o.frequency.value = i?1320:990;
      const g=c.createGain(); g.gain.setValueAtTime(0.0001,t+dt); g.gain.linearRampToValueAtTime(0.25,t+dt+0.01); g.gain.exponentialRampToValueAtTime(0.001,t+dt+0.18);
      o.connect(g); g.connect(this.sfxGain); o.start(t+dt); o.stop(t+dt+0.2); });
  }
  tick(){
    if (!this.on || !this._ctx()) return;
    const c=this.ctx,t=c.currentTime; const o=c.createOscillator(); o.type='square'; o.frequency.value=1600;
    const g=c.createGain(); g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.03);
    o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t+0.04);
  }

  // ---- E.P.I. drone ----
  startDrone(){
    if (!this._ctx()) return null;
    this.unlock();
    if (!this.on) this.setOn(true);
    if (this.drone) return this.analyser;
    const c=this.ctx, t=c.currentTime;
    const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=600; lp.Q.value=6;
    // slow filter LFO
    const lfo=c.createOscillator(); lfo.frequency.value=0.06; const lfoG=c.createGain(); lfoG.gain.value=420;
    lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start(t);
    // detuned drone (the VU viola-ish drone)
    const oscs=[];
    [55, 55.4, 82.5, 110].forEach((f,i)=>{ const o=c.createOscillator(); o.type=i<2?'sawtooth':'triangle'; o.frequency.value=f;
      const g=c.createGain(); g.gain.value=i<2?0.12:0.05; o.connect(g); g.connect(lp); o.start(t); oscs.push(o); });
    lp.connect(this.droneGain);
    this.droneGain.gain.setTargetAtTime(0.7, t, 0.4);
    // step sequencer — a hypnotic two-chord motif + noise hat
    const scale=[110,164.81,146.83,110, 130.81,196,164.81,130.81];
    let step=0;
    const seq=()=>{
      if (!this.drone) return;
      const tt=this.ctx.currentTime;
      const f=scale[step % scale.length];
      const o=this.ctx.createOscillator(); o.type='square'; o.frequency.value=f;
      const g=this.ctx.createGain(); g.gain.setValueAtTime(0.0001,tt); g.gain.linearRampToValueAtTime(0.10,tt+0.01); g.gain.exponentialRampToValueAtTime(0.001,tt+0.18);
      o.connect(g); g.connect(this.droneGain); o.start(tt); o.stop(tt+0.2);
      // hat on offbeats
      if (step%2===1){ const n=this._noise(); const hp=this.ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=6000;
        const ng=this.ctx.createGain(); ng.gain.setValueAtTime(0.06,tt); ng.gain.exponentialRampToValueAtTime(0.001,tt+0.05);
        n.connect(hp); hp.connect(ng); ng.connect(this.droneGain); n.start(tt); n.stop(tt+0.06); }
      step++;
    };
    this._seqTimer = setInterval(seq, 250);
    this.drone = { oscs, lp, lfo };
    return this.analyser;
  }
  stopDrone(){
    if (!this.drone || !this.ctx) return;
    const t=this.ctx.currentTime;
    this.droneGain.gain.setTargetAtTime(0.0001, t, 0.2);
    clearInterval(this._seqTimer); this._seqTimer=null;
    const d=this.drone; this.drone=null;
    setTimeout(()=>{ try{ d.oscs.forEach(o=>o.stop()); d.lfo.stop(); }catch(e){} }, 600);
  }
  isDroning(){ return !!this.drone; }
}
