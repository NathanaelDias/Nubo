/* Nubo Kit: base común de todos los juegos.
   Pantalla de inicio con nivel actual + mapa de niveles (estrellas), pantalla de partida,
   diálogo de victoria, monedas y puntos de pase compartidos, temas (botón 🎨 de Nubo) y reto diario. */
(function () {
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const today = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const shuffle = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const $ = (s, el = document) => el.querySelector(s);
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
const emb = window.self !== window.top;

const CSS = `
:root{--bg:#EEF1FB;--fg:#1D2340;--muted:#626A8C;--line:#CBD2EC;--card:#fff;--accent:#3E5BD8;--gold:#F2A516;--ok:#2DB57A;--bad:#E5484D;
 --display:"Lilita One","Arial Rounded MT Bold",system-ui,sans-serif;--body:"Nunito",system-ui,sans-serif}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;height:100%;background:var(--bg);color:var(--fg);font-family:var(--body);overflow:hidden;user-select:none;-webkit-user-select:none}
button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;padding:0}
.k-scr{position:absolute;inset:0;display:flex;flex-direction:column;max-width:560px;margin:0 auto}
.k-scr[hidden]{display:none}
.k-head{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top) + 10px) 16px 0}
.k-head h1{font-family:var(--display);font-weight:400;font-size:28px;margin:0;flex:1}
.k-pill{display:inline-flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-weight:800;font-size:14px}
.k-coin{display:inline-block;width:15px;height:15px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#FFE38A,var(--gold) 60%,#C57E00);vertical-align:-2px}
.k-hero{margin:10px 16px 0;border-radius:24px;padding:16px 18px;color:#fff;position:relative;overflow:hidden;box-shadow:inset 0 -6px 0 rgba(0,0,0,.15)}
.k-hero h2{font-family:var(--display);font-weight:400;font-size:28px;margin:0}
.k-hero p{margin:2px 0 12px;font-weight:700;opacity:.92;font-size:14px;max-width:78%}
.k-hero .art{position:absolute;right:12px;top:12px;width:74px;height:74px;opacity:.95}
.k-hero .art svg{width:100%;height:100%}
.k-play{background:#fff;color:var(--fg);font-family:var(--display);font-size:21px;padding:11px 24px;border-radius:16px;box-shadow:0 5px 0 rgba(0,0,0,.18)}
.k-play:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.18)}
.k-modes{display:flex;gap:6px;margin-top:12px;flex-wrap:wrap}
.k-modes button{background:rgba(255,255,255,.22);color:#fff;border-radius:12px;padding:7px 11px;font-weight:900;font-size:13px}
.k-modes button.on{background:#fff;color:var(--fg)}
.k-map{flex:1;overflow-y:auto;overflow-x:hidden;position:relative;margin-top:12px;border-radius:26px 26px 0 0}
.k-map .inner{position:relative;margin:0 auto}
.k-map svg.path{position:absolute;inset:0;pointer-events:none}
.k-node{position:absolute;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;display:grid;place-items:center;
 font-family:var(--display);font-size:22px;color:#fff;background:var(--accent);box-shadow:0 5px 0 rgba(0,0,0,.25),inset 0 3px 0 rgba(255,255,255,.35);z-index:2}
.k-node.done{background:linear-gradient(#FFC94D,#F2A516)}
.k-node.lock{background:#B8BED8;color:#fff;box-shadow:0 4px 0 rgba(0,0,0,.15)}
.k-node.cur{width:70px;height:70px;margin:-35px 0 0 -35px;font-size:26px;animation:kpulse 1.4s ease-in-out infinite}
@keyframes kpulse{50%{transform:scale(1.08)}}
.k-node .st{position:absolute;bottom:-17px;left:50%;transform:translateX(-50%);font-size:13px;letter-spacing:-1px;white-space:nowrap;color:#C9CDE0;font-family:var(--body);text-shadow:0 1px 0 rgba(0,0,0,.25)}
.k-node .st b{color:#FFD23F;font-weight:400}
.k-deco{position:absolute;z-index:1;pointer-events:none}
.k-end{position:absolute;left:50%;transform:translateX(-50%);font-weight:900;color:#fff;background:rgba(0,0,0,.25);padding:6px 12px;border-radius:12px;font-size:13px;white-space:nowrap}
/* movimiento y efectos */
button{transition:transform .12s}button:active{transform:scale(.94)}
.k-scr.in{animation:kin .38s cubic-bezier(.2,.9,.3,1.2)}@keyframes kin{from{opacity:0;transform:translateY(18px) scale(.98)}}
.k-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.28) 45%,transparent 60%);transform:translateX(-100%);animation:kshine 4.5s ease-in-out infinite;pointer-events:none}
@keyframes kshine{0%,55%{transform:translateX(-100%)}80%,100%{transform:translateX(100%)}}
.k-hero .art{animation:kfloat 3.2s ease-in-out infinite}@keyframes kfloat{50%{transform:translateY(-6px) rotate(-4deg)}}
.k-play{animation:kbeat 2s ease-in-out infinite}@keyframes kbeat{50%{transform:scale(1.06)}}
.k-node{animation:knode .5s cubic-bezier(.3,1.6,.6,1) backwards}@keyframes knode{from{transform:scale(0)}}
.k-node.cur::before{content:"";position:absolute;inset:-10px;border-radius:50%;border:4px solid rgba(255,255,255,.75);animation:kring 1.6s ease-out infinite}
@keyframes kring{from{transform:scale(.8);opacity:1}to{transform:scale(1.35);opacity:0}}
.k-node.done::after{content:"";position:absolute;inset:6px 10px auto auto;width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.7)}
.k-pt{position:absolute;pointer-events:none;z-index:1;animation:kdrift linear infinite;opacity:.7}
@keyframes kdrift{from{transform:translate(0,0) rotate(0)}50%{transform:translate(var(--dx),-40px) rotate(180deg)}to{transform:translate(0,-80px) rotate(360deg);opacity:0}}
.k-rip{position:fixed;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:3px solid rgba(62,91,216,.55);pointer-events:none;z-index:40;animation:krip .45s ease-out forwards}
@keyframes krip{to{transform:scale(4);opacity:0}}
.k-card .stars span{display:inline-block;animation:kstar .45s cubic-bezier(.3,1.8,.5,1) backwards}@keyframes kstar{from{transform:scale(0) rotate(-90deg)}}
.k-mus{width:40px;height:40px;border-radius:13px;background:var(--card);border:1px solid var(--line);font-size:17px;display:grid;place-items:center}
.k-mus.off{opacity:.45}
/* partida */
.k-hud{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top) + 10px) 14px 6px}
.k-back{width:40px;height:40px;border-radius:13px;background:var(--card);border:1px solid var(--line);font-size:20px;font-weight:900;display:grid;place-items:center}
.k-ttl{flex:1;line-height:1.1}.k-ttl b{font-family:var(--display);font-weight:400;font-size:22px;display:block}.k-ttl span{font-size:12px;color:var(--muted);font-weight:800}
.k-stage{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;padding:6px 12px}
.k-tools{display:flex;gap:8px;justify-content:center;padding:6px 12px calc(env(safe-area-inset-bottom) + 14px);flex-wrap:wrap}
.k-tools button{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:11px 14px;font-weight:800;font-size:14px}
.k-tools button:disabled{opacity:.45}
/* diálogos */
.k-ov{position:fixed;inset:0;background:rgba(29,35,64,.55);display:flex;align-items:center;justify-content:center;z-index:20}
.k-card{background:var(--card);border-radius:24px;padding:24px 22px;text-align:center;width:min(86vw,340px);animation:kpop .3s cubic-bezier(.3,1.5,.6,1)}
@keyframes kpop{from{transform:scale(.7);opacity:0}}
.k-card h2{font-family:var(--display);font-weight:400;font-size:30px;margin:0}
.k-card .stars{font-size:38px;color:var(--gold);letter-spacing:4px;margin:6px 0}.k-card .stars i{color:#D8DCEC;font-style:normal}
.k-card p{color:var(--muted);font-weight:700;margin:6px 0 16px}
.k-card .rw{display:inline-flex;gap:6px;align-items:center;font-weight:900;font-size:20px;margin-bottom:14px}
.k-card button{display:block;width:100%;border-radius:14px;padding:13px;font-weight:900;font-size:16px;margin-top:8px}
.k-card button.pri{background:var(--accent);color:#fff}.k-card button.sec{color:var(--muted)}
.k-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:var(--fg);color:#fff;padding:10px 16px;border-radius:14px;font-weight:800;font-size:14px;z-index:30;max-width:86vw;text-align:center}
.k-fx{position:fixed;inset:0;pointer-events:none;z-index:25}
/* temas */
.k-sheet{position:fixed;inset:0;background:rgba(29,35,64,.5);display:flex;align-items:flex-end;justify-content:center;z-index:22}
.k-sheet>div{background:var(--card);border-radius:24px 24px 0 0;padding:18px 16px calc(env(safe-area-inset-bottom) + 18px);width:min(100%,560px);max-height:80vh;overflow:auto}
.k-sheet h3{font-family:var(--display);font-weight:400;font-size:24px;margin:0 0 4px;display:flex;justify-content:space-between}
.k-sheet p{margin:0 0 12px;color:var(--muted);font-weight:700;font-size:13px}
.k-tg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.k-tg button{display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px;border-radius:16px;border:2px solid var(--line);font-weight:800;font-size:12px}
.k-tg button.on{border-color:var(--accent)}.k-tg button.lock{opacity:.6}
.k-tg .pv{width:100%;aspect-ratio:1.2;border-radius:12px;display:grid;place-items:center;font-size:26px;overflow:hidden}
.k-tg small{font-size:11px;color:var(--muted)}
`;

const SAFE_CSS = `
.k-ov{position:fixed;inset:0;background:rgba(29,35,64,.55);display:flex;align-items:center;justify-content:center;z-index:60;font-family:"Nunito",system-ui,sans-serif}
.k-card{background:#fff;color:#1D2340;border-radius:24px;padding:24px 22px;text-align:center;width:min(86vw,340px);animation:kpop .3s cubic-bezier(.3,1.5,.6,1)}
@keyframes kpop{from{transform:scale(.7);opacity:0}}
.k-card h2{font-family:"Lilita One","Arial Rounded MT Bold",system-ui,sans-serif;font-weight:400;font-size:26px;margin:4px 0}
.k-card p{color:#626A8C;font-weight:700;margin:6px 0 14px;font-size:15px;line-height:1.35}
.k-card button{display:block;width:100%;border:0;border-radius:14px;padding:13px;font:inherit;font-weight:900;font-size:16px;margin-top:8px;cursor:pointer}
.k-card button.pri{background:#3E5BD8;color:#fff}.k-card button.sec{background:none;color:#626A8C}
.k-tut .big{font-size:64px;line-height:1;animation:ktb 1.4s ease-in-out infinite;display:inline-block}
@keyframes ktb{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(4deg)}}
.k-tut .demo{height:74px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:30px;margin:4px 0}
.k-tut .demo span{display:inline-block;animation:kdemo 1.6s ease-in-out infinite}
@keyframes kdemo{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
.k-tut .dots{display:flex;gap:6px;justify-content:center;margin:2px 0 6px}.k-tut .dots i{width:8px;height:8px;border-radius:4px;background:#CBD2EC;transition:all .3s}.k-tut .dots i.on{width:22px;background:#3E5BD8}
.k-ach{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 12px);transform:translate(-50%,-140%);z-index:70;display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#1D2340,#3B4380);color:#fff;
  padding:10px 16px 10px 10px;border-radius:20px;box-shadow:0 12px 30px rgba(29,35,64,.4);min-width:260px;max-width:92vw;font-family:"Nunito",system-ui,sans-serif;transition:transform .55s cubic-bezier(.3,1.5,.5,1)}
.k-ach.in{transform:translate(-50%,0)}
.k-ach .md{width:50px;height:50px;border-radius:16px;background:radial-gradient(circle at 35% 30%,#FFE38A,#F2A516 60%,#C57E00);display:grid;place-items:center;font-size:26px;animation:kmd 1s ease-out;box-shadow:0 0 0 4px rgba(255,227,138,.35)}
@keyframes kmd{0%{transform:rotateY(0) scale(.4)}60%{transform:rotateY(540deg) scale(1.15)}100%{transform:rotateY(720deg) scale(1)}}
.k-ach small{display:block;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#FFD23F}.k-ach b{font-size:16px;display:block}.k-ach span{font-size:12px;opacity:.85;font-weight:700}
.k-ach .rw{margin-left:auto;background:rgba(255,255,255,.15);border-radius:12px;padding:6px 9px;font-weight:900;font-size:13px;white-space:nowrap}
.k-ach::after{content:"";position:absolute;inset:0;border-radius:20px;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.25) 50%,transparent 65%);animation:kshine2 1.6s .4s ease-in-out}
@keyframes kshine2{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
`;
let safeDone = false;
function injectSafe() { if (safeDone) return; safeDone = true; document.head.appendChild(h(`<style>${SAFE_CSS}</style>`)); }

const MAPS = {
  camino: { bg: 'linear-gradient(#9BE38C,#5FBF6A)', path: '#F5E6C4', w: 22 },
  escalera: { bg: 'linear-gradient(#C9B6FF,#8E76E8)', path: 'rgba(255,255,255,.0)', w: 0 },
  islas: { bg: 'linear-gradient(#7FD3FF,#2F8BE0)', path: 'rgba(255,255,255,.8)', w: 4, dash: '2 10' },
  torre: { bg: 'linear-gradient(#2B2F5E,#4B3C8C)', path: 'rgba(255,255,255,.0)', w: 0 },
  nubes: { bg: 'linear-gradient(#FFD9A8,#FF9F8C 60%,#B47CFF)', path: 'rgba(255,255,255,.85)', w: 6, dash: '1 12' }
};

const Kit = { ls, rng, today, shuffle, h, emb };
let cssDone = false;
function injectCSS(extra) { injectSafe(); if (cssDone) return; cssDone = true; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@500;700;800;900&display=swap'; document.head.appendChild(l);
  document.head.appendChild(h(`<style>${CSS}${extra || ''}</style>`)); }
let ac;
Kit.tone = (f, d = .08, type = 'sine', vol = .1) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + d); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d); } catch (e) {} };
Kit.buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
Kit.coins = () => ls.get('mj-coins', 0);
Kit.addCoins = n => ls.set('mj-coins', Kit.coins() + n);
Kit.addPP = n => ls.set('mj-pp', ls.get('mj-pp', 0) + n);
Kit.toast = t => { const e = h(`<div class="k-toast">${t}</div>`); document.body.appendChild(e); setTimeout(() => e.remove(), 1800); };

/* ---------- música de concentración: generada en el momento, en bucle ---------- */
const MOODS = {
  calma: { ch: [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 55]], sc: [72, 74, 76, 79, 81, 84], bar: 7, pl: .55 },
  misterio: { ch: [[45, 48, 52, 55], [41, 45, 48, 52], [43, 46, 50, 53], [40, 44, 47, 50]], sc: [69, 72, 74, 76, 79, 81], bar: 8, pl: .4 },
  alegre: { ch: [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 58]], sc: [77, 79, 81, 84, 86, 89], bar: 5, pl: .7 },
  espacio: { ch: [[50, 57, 62, 64], [48, 55, 60, 62], [46, 53, 58, 62], [45, 52, 57, 59]], sc: [74, 76, 81, 83, 86, 88], bar: 9, pl: .35 } };
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
let mus = null;
Kit.musicOn = () => { const p = ls.get('mj-prefs', {}); return p.music !== false && p.sound !== false; };
Kit.setMusic = on => { const p = ls.get('mj-prefs', {}); p.music = on; ls.set('mj-prefs', p); if (!on) Kit.stopAmbient(); };
Kit.stopAmbient = () => { if (!mus) return; mus.alive = false; try { mus.out.gain.setTargetAtTime(0, ac.currentTime, .4); } catch (e) {} mus = null; };
Kit.ambient = (mood = 'calma') => {
  if (!Kit.musicOn() || mus) return;
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { return; }
  const M = MOODS[mood] || MOODS.calma, out = ac.createGain(), lp = ac.createBiquadFilter(), dl = ac.createDelay(), fb = ac.createGain();
  out.gain.value = 0; out.gain.setTargetAtTime(.05, ac.currentTime, 2); lp.type = 'lowpass'; lp.frequency.value = 1100;
  dl.delayTime.value = .38; fb.gain.value = .32; dl.connect(fb).connect(dl); dl.connect(out); lp.connect(out); out.connect(ac.destination);
  mus = { alive: true, out }; const me = mus; let i = 0;
  const pad = () => { if (!me.alive) return; const t = ac.currentTime, dur = M.bar;
    M.ch[i++ % M.ch.length].forEach(n => [0, 7].forEach(det => { const o = ac.createOscillator(), g = ac.createGain(); o.type = det ? 'triangle' : 'sine'; o.frequency.value = midi(n); o.detune.value = det;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + 2); g.gain.setValueAtTime(.22, t + dur - 1); g.gain.linearRampToValueAtTime(0, t + dur + 2);
      o.connect(g).connect(lp); o.start(t); o.stop(t + dur + 2.2); }));
    setTimeout(pad, dur * 1000); };
  const pluck = () => { if (!me.alive) return; if (Math.random() < M.pl) { const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = midi(M.sc[Math.floor(Math.random() * M.sc.length)]); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
      o.connect(g); g.connect(out); g.connect(dl); o.start(t); o.stop(t + 1.7); }
    setTimeout(pluck, 450 + Math.random() * 900); };
  pad(); setTimeout(pluck, 1500);
};
document.addEventListener('visibilitychange', () => { if (document.hidden) Kit.stopAmbient(); });

/* ---------- tutorial de la primera partida ---------- */
Kit.tutorial = (id, name, steps, done) => {
  injectSafe(); if (ls.get('k-' + id + '-tuto', 0)) { done && done(); return; }
  let i = 0; const ov = h('<div class="k-ov"><div class="k-card k-tut"></div></div>'), card = ov.firstChild;
  const show = () => { const [e, t, d, demo] = steps[i];
    card.innerHTML = `<small style="font-weight:900;color:#3E5BD8;letter-spacing:.08em;text-transform:uppercase;font-size:11px">Cómo se juega · ${name}</small>
      ${demo ? `<div class="demo">${demo.split(' ').map((x, k) => `<span style="animation-delay:${k * .25}s">${x}</span>`).join('')}</div>` : `<div class="big">${e}</div>`}
      <h2>${t}</h2><p>${d}</p><div class="dots">${steps.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
      <button class="pri">${i < steps.length - 1 ? 'Siguiente' : '¡A jugar!'}</button>${i < steps.length - 1 ? '<button class="sec">Saltar</button>' : ''}`;
    card.querySelector('.pri').onclick = () => { Kit.tone(600 + i * 80, .06, 'triangle'); i++; if (i < steps.length) show(); else end(); };
    const sk = card.querySelector('.sec'); if (sk) sk.onclick = end; };
  const end = () => { ls.set('k-' + id + '-tuto', 1); ov.remove(); done && done(); };
  show(); document.body.appendChild(ov);
};

/* ---------- logros con aviso ---------- */
const ACHQ = []; let achBusy = false;
Kit.notifyAch = (title, name, desc, reward, icon = '🏅') => { ACHQ.push({ title, name, desc, reward, icon }); nextAch(); };
function nextAch() { if (achBusy || !ACHQ.length) return; injectSafe(); achBusy = true; const a = ACHQ.shift();
  const e = h(`<div class="k-ach"><div class="md">${a.icon}</div><div><small>${a.title}</small><b>${a.name}</b><span>${a.desc}</span></div>${a.reward ? `<div class="rw">+${a.reward} 🪙</div>` : ''}</div>`);
  document.body.appendChild(e); requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add('in')));
  [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => Kit.tone(f, .18, 'triangle', .09), 120 + i * 110)); Kit.buzz([20, 40, 20]);
  if (fx) for (let i = 0; i < 40; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: 60, vx: (Math.random() - .5) * 8, vy: Math.random() * 4, g: .2, l: 60, c: ['#FFD23F', '#F2A516', '#fff'][i % 3], s: 5 });
  setTimeout(() => { e.classList.remove('in'); setTimeout(() => { e.remove(); achBusy = false; nextAch(); }, 600); }, 3200); }
Kit.ACH = [
  { id: 'w1', icon: '🎉', name: 'Primera victoria', desc: 'Supera tu primer nivel', t: d => Object.keys(d.stars).length >= 1 },
  { id: 's3', icon: '⭐', name: 'Perfecto', desc: 'Consigue 3 estrellas en un nivel', t: d => Object.values(d.stars).some(x => x >= 3) },
  { id: 'w5', icon: '🔥', name: 'En racha', desc: 'Supera 5 niveles', t: d => Object.keys(d.stars).length >= 5 },
  { id: 'w15', icon: '🧠', name: 'Experto', desc: 'Supera 15 niveles', t: d => Object.keys(d.stars).length >= 15 },
  { id: 's30', icon: '🌌', name: 'Constelación', desc: 'Reúne 30 estrellas', t: d => Object.values(d.stars).reduce((a, b) => a + b, 0) >= 30 },
  { id: 'd1', icon: '📅', name: 'Madrugador', desc: 'Supera un reto diario', t: (d, id) => !!ls.get('mj-daily-' + id, 0) }];
Kit.checkAch = (id, name) => { const d = ls.get('k-' + id, { stars: {}, cur: 1 }), got = ls.get('k-' + id + '-ach', {}); let any = false;
  Kit.ACH.forEach(a => { if (!got[a.id] && a.t(d, id)) { got[a.id] = Date.now(); any = true; Kit.addCoins(20); Kit.notifyAch('¡Logro desbloqueado! · ' + name, a.name, a.desc, 20, a.icon); } });
  if (any) ls.set('k-' + id + '-ach', got); };

/* toque con onda */
addEventListener('pointerdown', e => { if (!document.body) return; const r = document.createElement('div'); r.className = 'k-rip'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 460); }, true);

/* confeti */
let fx, cx, parts = [];
function fxInit() { fx = h('<canvas class="k-fx"></canvas>'); document.body.appendChild(fx); cx = fx.getContext('2d');
  const sz = () => { fx.width = innerWidth * devicePixelRatio; fx.height = innerHeight * devicePixelRatio; cx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); }; sz(); addEventListener('resize', sz);
  (function loop() { cx.clearRect(0, 0, innerWidth, innerHeight); parts = parts.filter(p => p.l-- > 0);
    for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g; cx.globalAlpha = Math.min(1, p.l / 30); cx.fillStyle = p.c; cx.fillRect(p.x, p.y, p.s, p.s * 1.4); } cx.globalAlpha = 1; requestAnimationFrame(loop); })(); }
Kit.confetti = () => { const cs = ['#E5484D', '#3E7BFA', '#F5B82E', '#2DB57A', '#8E5CF7']; for (let i = 0; i < 130; i++) parts.push({ x: innerWidth / 2, y: innerHeight * .4, vx: (Math.random() - .5) * 15, vy: -Math.random() * 12 - 2, g: .3, l: 90 + Math.random() * 30, c: cs[i % 5], s: 5 + Math.random() * 3 });
  [660, 880, 1100].forEach((f, i) => setTimeout(() => Kit.tone(f, .14, 'triangle'), i * 110)); };
Kit.burst = (x, y, c = '#F2A516') => { for (let i = 0; i < 14; i++) parts.push({ x, y, vx: (Math.random() - .5) * 7, vy: (Math.random() - .5) * 7, g: .1, l: 30, c, s: 5 }); };

Kit.dialog = ({ title, stars, text, reward, buttons }) => {
  const ov = h(`<div class="k-ov"><div class="k-card"><h2>${title}</h2>${stars != null ? `<div class="stars">${[0, 1, 2].map(i => i < stars ? `<span style="animation-delay:${.15 + i * .2}s">★</span>` : `<i>★</i>`).join('')}</div>` : ''}
    ${text ? `<p>${text}</p>` : ''}${reward ? `<div class="rw"><i class="k-coin"></i>+${reward}</div>` : ''}</div></div>`);
  const card = $('.k-card', ov);
  buttons.forEach(b => { const e = h(`<button class="${b.pri ? 'pri' : 'sec'}">${b.t}</button>`); e.onclick = () => { ov.remove(); b.fn && b.fn(); }; card.appendChild(e); });
  document.body.appendChild(ov); if (stars) for (let i = 0; i < stars; i++) setTimeout(() => Kit.tone(700 + i * 180, .15, 'triangle'), 150 + i * 200); return ov;
};

/* ---------- mapa de niveles ---------- */
function mapPositions(style, n, W) {
  const P = [], sp = style === 'escalera' ? 78 : style === 'torre' ? 92 : 88, H = n * sp + 140;
  for (let i = 0; i < n; i++) { const y = H - 80 - i * sp; let x;
    if (style === 'camino') x = W / 2 + Math.sin(i * .85) * W * .3;
    else if (style === 'escalera') { const k = i % 6, c = k < 3 ? k : 5 - k; x = W * .2 + c * W * .3; }
    else if (style === 'islas') { const isl = Math.floor(i / 3), side = isl % 2 ? 1 : -1, j = i % 3; x = W / 2 + side * W * .18 + (j - 1) * W * .17 * side; }
    else if (style === 'torre') x = W / 2 + (i % 2 ? 1 : -1) * W * .17;
    else x = W / 2 + Math.sin(i * 1.3) * W * .32 + Math.cos(i * .5) * 12;
    P.push({ x, y }); }
  return { P, H };
}
function drawMap(el, { style, count, stars, cur, onPick }) {
  const M = MAPS[style] || MAPS.camino; el.style.background = M.bg; el.innerHTML = '';
  const W = Math.min(el.clientWidth || 360, 520), { P, H } = mapPositions(style, count, W);
  const inner = h(`<div class="inner" style="width:${W}px;height:${H}px"></div>`); el.appendChild(inner);
  let deco = '';
  if (style === 'escalera') P.forEach((p, i) => { deco += `<div class="k-deco" style="left:${p.x - 44}px;top:${p.y + 8}px;width:88px;height:${H - p.y}px;background:linear-gradient(${i % 2 ? '#B09BF5' : '#A28AF0'},#7D64DB);border-radius:12px 12px 0 0;box-shadow:inset 0 5px 0 rgba(255,255,255,.35)"></div>`; });
  if (style === 'islas') for (let k = 0; k * 3 < count; k++) { const a = P[k * 3], c = P[Math.min(count - 1, k * 3 + 2)]; const x = (a.x + c.x) / 2, y = (a.y + c.y) / 2;
    deco += `<div class="k-deco" style="left:${x - 120}px;top:${y - 70}px;width:240px;height:140px;border-radius:50%;background:radial-gradient(#9BE38C 55%,#F5E0A8 57% 66%,transparent 68%)"></div><div class="k-deco" style="left:${x + (k % 2 ? -110 : 80)}px;top:${y - 64}px;font-size:30px">🌴</div>`; }
  if (style === 'torre') { deco += `<div class="k-deco" style="left:${W / 2 - W * .32}px;top:30px;width:${W * .64}px;height:${H}px;background:repeating-linear-gradient(#5B4BA6 0 88px,#4D3F93 88px 92px);border-radius:24px 24px 0 0;box-shadow:inset 0 0 0 6px rgba(255,255,255,.08)"></div>`;
    P.forEach((p, i) => { deco += `<div class="k-deco" style="left:${(i % 2 ? W / 2 - W * .24 : W / 2 + W * .14)}px;top:${p.y - 22}px;width:${W * .1}px;height:44px;border-radius:10px 10px 4px 4px;background:${i <= cur ? '#FFE38A' : '#2B2F5E'};opacity:.9"></div>`; });
    deco += `<div class="k-deco" style="left:${W / 2 - 40}px;top:0;font-size:56px">🏰</div>`; }
  if (style === 'camino') for (let i = 0; i < count; i += 2) deco += `<div class="k-deco" style="left:${(i % 4 ? 10 : W - 46)}px;top:${P[i].y - 20}px;font-size:28px">${['🌳', '🌼', '🍄', '🌲'][(i / 2) % 4]}</div>`;
  if (style === 'nubes') for (let i = 0; i < count; i += 3) deco += `<div class="k-deco" style="left:${(i % 2 ? 6 : W - 70)}px;top:${P[i].y - 30}px;font-size:40px;opacity:.85">☁️</div>`;
  inner.insertAdjacentHTML('beforeend', deco);
  if (M.w) { const d = P.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
    inner.insertAdjacentHTML('beforeend', `<svg class="path" width="${W}" height="${H}"><path d="${d}" fill="none" stroke="${M.path}" stroke-width="${M.w}" stroke-linecap="round" stroke-linejoin="round" ${M.dash ? `stroke-dasharray="${M.dash}"` : ''}/></svg>`); }
  P.forEach((p, i) => { const n = i + 1, s = stars[n] || 0, st = n < cur ? 'done' : n === cur ? 'cur' : 'lock';
    const b = h(`<button class="k-node ${st}" style="left:${p.x}px;top:${p.y}px">${st === 'lock' ? '🔒' : n}${st !== 'lock' ? `<span class="st"><b>${'★'.repeat(s)}</b>${'★'.repeat(3 - s)}</span>` : ''}</button>`);
    b.onclick = () => st === 'lock' ? Kit.toast('Supera el nivel ' + (cur) + ' para desbloquearlo') : onPick(n); inner.appendChild(b); });
  inner.insertAdjacentHTML('beforeend', `<div class="k-end" style="top:20px">Más niveles cada temporada ✨</div>`);
  const PT = { camino: ['🍃', '🦋', '🌸'], escalera: ['✨', '⭐', '💫'], islas: ['🫧', '🐟', '🫧'], torre: ['✨', '🌙', '⭐'], nubes: ['☁️', '✨', '🎈'] }[style] || ['✨'];
  for (let i = 0; i < Math.min(40, count); i++) { const y = Math.random() * H, d = 6 + Math.random() * 8;
    inner.insertAdjacentHTML('beforeend', `<span class="k-pt" style="left:${Math.random() * W}px;top:${y}px;font-size:${12 + Math.random() * 12}px;--dx:${(Math.random() - .5) * 60}px;animation-duration:${d}s;animation-delay:-${Math.random() * d}s">${PT[i % PT.length]}</span>`); }
  inner.querySelectorAll('.k-node').forEach((b, i) => { const dist = Math.abs(i + 1 - cur); b.style.animationDelay = Math.min(dist * .04, .6) + 's'; });
  requestAnimationFrame(() => { const p = P[Math.min(count, cur) - 1]; if (p) el.scrollTop = p.y - el.clientHeight * .6; });
}

/* ---------- juego ---------- */
Kit.game = (cfg) => {
  const id = cfg.id, K = 'k-' + id, count = cfg.levels || 60;
  const st = () => ls.get(K, { stars: {}, cur: 1 });
  let data = st(), mode = cfg.modes ? cfg.modes[0].id : null, theme = ls.get(K + '-theme', cfg.themes ? cfg.themes[0].id : null);
  injectCSS(cfg.css);
  if (!document.title) document.title = cfg.name;
  const home = h(`<section class="k-scr">
    ${emb ? '' : `<div class="k-head"><h1>${cfg.name}</h1><span class="k-pill"><i class="k-coin"></i><span class="kc">0</span></span></div>`}
    <div class="k-hero" style="background:${cfg.color}"><div class="art">${cfg.art || ''}</div><h2 class="lv"></h2><p>${cfg.tagline}</p>
      <button class="k-play">Jugar</button>${cfg.modes ? `<div class="k-modes">${cfg.modes.map(m => `<button data-m="${m.id}">${m.name}</button>`).join('')}</div>` : ''}</div>
    <div class="k-map"></div></section>`);
  const game = h(`<section class="k-scr" hidden><div class="k-hud"><button class="k-back" aria-label="Volver al mapa">‹</button><div class="k-ttl"><b></b><span></span></div><span class="k-pill info"></span><button class="k-mus" aria-label="Música">♪</button></div>
    <div class="k-stage"></div><div class="k-tools"></div></section>`);
  document.body.append(home, game); fxInit();
  const stage = $('.k-stage', game);
  const mb = $('.k-mus', game), syncM = () => mb.classList.toggle('off', !Kit.musicOn()); syncM();
  mb.onclick = () => { Kit.setMusic(!Kit.musicOn()); syncM(); if (Kit.musicOn()) Kit.ambient(cfg.mood || 'calma'); };
  addEventListener('pointerdown', () => Kit.ambient(cfg.mood || 'calma'), { once: true });
  const setMode = m => { mode = m; home.querySelectorAll('.k-modes button').forEach(b => b.classList.toggle('on', b.dataset.m === m)); };
  if (cfg.modes) { home.querySelectorAll('.k-modes button').forEach(b => b.onclick = () => setMode(b.dataset.m)); setMode(mode); }
  const showHome = () => { data = st(); game.hidden = true; home.hidden = false; home.classList.remove('in'); void home.offsetWidth; home.classList.add('in'); const kc = $('.kc', home); if (kc) kc.textContent = Kit.coins();
    $('.lv', home).textContent = cfg.noLevels ? cfg.name : `Nivel ${Math.min(data.cur, count)}`;
    if (cfg.noLevels) { const m = $('.k-map', home); m.style.background = MAPS[cfg.map || 'nubes'].bg; m.innerHTML = cfg.homeExtra ? cfg.homeExtra() : ''; }
    else drawMap($('.k-map', home), { style: cfg.map, count, stars: data.stars, cur: data.cur, onPick: n => play(n) }); };
  $('.k-play', home).onclick = () => play(cfg.noLevels ? 1 : Math.min(data.cur, count));
  $('.k-back', game).onclick = () => { cfg.stop && cfg.stop(); showHome(); };
  let ctx;
  function play(n, daily = false) {
    home.hidden = true; game.hidden = false; game.classList.remove('in'); void game.offsetWidth; game.classList.add('in'); stage.innerHTML = ''; $('.k-tools', game).innerHTML = ''; $('.info', game).textContent = '';
    const seed = daily ? today() * 7 + id.length : 1000 + n * 7919 + id.length * 31;
    $('.k-ttl b', game).textContent = daily ? 'Reto del día' : cfg.noLevels ? cfg.name : 'Nivel ' + n;
    $('.k-ttl span', game).textContent = daily ? new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : (cfg.modes ? cfg.modes.find(m => m.id === mode).name : cfg.sub || '');
    ctx = { n, daily, seed, r: rng(seed), mode, theme, stage, diff: daily ? Math.max(6, Math.min(count, data.cur + 4)) : n,
      info: t => $('.info', game).textContent = t, sub: t => $('.k-ttl span', game).textContent = t,
      tools: btns => { const tl = $('.k-tools', game); tl.innerHTML = ''; return btns.map(b => { const e = h(`<button>${b.t}</button>`); e.onclick = b.fn; tl.appendChild(e); return e; }); },
      win: (stars, extra = {}) => win(n, daily, stars, extra), lose: (t) => Kit.dialog({ title: 'Casi…', text: t || 'Inténtalo otra vez.', buttons: [{ t: 'Reintentar', pri: 1, fn: () => play(n, daily) }, { t: 'Volver al mapa', fn: showHome }] }),
      result: (title, text) => Kit.dialog({ title, text, buttons: [{ t: 'Otra partida', pri: 1, fn: () => play(n, daily) }, { t: 'Salir', fn: showHome }] }),
      replay: () => play(n, daily), home: showHome };
    if (cfg.tutorial && !ls.get(K + '-tuto', 0)) Kit.tutorial(id, cfg.name, cfg.tutorial, () => cfg.start(ctx)); else cfg.start(ctx);
  }
  function win(n, daily, stars, extra) {
    let reward = daily ? 40 : 8 + stars * 4; Kit.confetti();
    if (daily) { ls.set('mj-daily-' + id, today()); Kit.addPP(40); }
    else { data = st(); const prev = data.stars[n] || 0; if (prev) reward = Math.max(3, (stars - prev) * 6); data.stars[n] = Math.max(prev, stars); if (n >= data.cur) data.cur = n + 1; ls.set(K, data); Kit.addPP(5 + stars * 5); }
    Kit.addCoins(reward); setTimeout(() => Kit.checkAch(id, cfg.name), 1400);
    try { parent.nuboEvent && parent.nuboEvent('level_complete', { game: id, level: n, stars, daily }); } catch (e) {}
    setTimeout(() => Kit.dialog({ title: daily ? '¡Reto superado!' : extra.title || '¡Nivel superado!', stars, text: extra.text, reward,
      buttons: daily ? [{ t: 'Ir al mapa', pri: 1, fn: showHome }] : [{ t: 'Siguiente nivel', pri: 1, fn: () => play(n + 1) }, { t: 'Repetir', fn: () => play(n) }, { t: 'Mapa', fn: showHome }] }), 350);
  }
  /* temas */
  function themes() { if (!cfg.themes) { Kit.toast('Este juego aún no tiene temas'); return; }
    const owned = ls.get(K + '-owned', cfg.themes.filter(t => !t.cost && !t.pass).map(t => t.id));
    const sh = h(`<div class="k-sheet"><div><h3>Temas <button>✕</button></h3><p>Cambia el aspecto del juego. Los exclusivos se ganan con el pase de temporada.</p><div class="k-tg"></div></div></div>`);
    $('.k-tg', sh).innerHTML = cfg.themes.map(t => { const own = owned.includes(t.id); return `<button data-t="${t.id}" class="${t.id === theme ? 'on' : ''} ${own ? '' : 'lock'}"><div class="pv" style="background:${t.bg || '#EEF1FB'}">${t.pv}</div>${t.name}<small>${own ? (t.id === theme ? 'En uso' : 'Tuyo') : t.pass ? '★ Pase de temporada' : '🪙 ' + t.cost}</small></button>`; }).join('');
    sh.onclick = e => { if (e.target === sh || e.target.textContent === '✕') sh.remove(); };
    sh.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const t = cfg.themes.find(x => x.id === b.dataset.t);
      if (!owned.includes(t.id)) { if (t.pass) { Kit.toast('Exclusivo del pase de temporada'); return; } if (Kit.coins() < t.cost) { Kit.toast(`Te faltan ${t.cost - Kit.coins()} monedas`); return; }
        Kit.addCoins(-t.cost); owned.push(t.id); ls.set(K + '-owned', owned); }
      theme = t.id; ls.set(K + '-theme', theme); if (ctx) ctx.theme = theme; cfg.onTheme && cfg.onTheme(theme); sh.remove(); });
    document.body.appendChild(sh); }
  addEventListener('message', e => { if (e.data && e.data.t === 'themes') themes(); });
  Kit.theme = () => theme;
  window.nuboBack = () => { const ov = document.querySelector('.k-ov,.k-sheet'); if (ov) { ov.remove(); return true; } if (!game.hidden) { cfg.stop && cfg.stop(); showHome(); return true; } return false; };
  showHome();
  if (location.hash === '#daily') play(1, true);
};
/* Pantalla de inicio con mapa para juegos que ya tienen su propia partida (Flechas, Tubo) */
Kit.levelHome = (cfg) => {
  injectCSS('.k-lh{position:fixed;inset:0;background:var(--bg);z-index:15}.k-lh .k-scr{position:absolute}');
  const K = 'k-' + cfg.id, count = cfg.count || 60, get = () => ls.get(K, { stars: {}, cur: 1 });
  const wrap = h(`<div class="k-lh"><section class="k-scr">${emb ? '' : `<div class="k-head"><h1>${cfg.name}</h1></div>`}
    <div class="k-hero" style="background:${cfg.color}"><div class="art">${cfg.art || ''}</div><h2 class="lv"></h2><p>${cfg.tagline}</p><button class="k-play">Jugar</button></div><div class="k-map"></div></section></div>`);
  document.body.appendChild(wrap); fxInit();
  const api = {
    show() { const d = get(); wrap.style.display = 'block'; const sc = $('.k-scr', wrap); sc.classList.remove('in'); void sc.offsetWidth; sc.classList.add('in'); $('.lv', wrap).textContent = 'Nivel ' + Math.min(d.cur, count);
      $('.k-play', wrap).onclick = () => { api.hide(); cfg.onPlay(Math.min(d.cur, count)); };
      drawMap($('.k-map', wrap), { style: cfg.map, count, stars: d.stars, cur: d.cur, onPick: n => { api.hide(); cfg.onPlay(n); } }); },
    hide() { wrap.style.display = 'none'; },
    record(n, stars) { const d = get(); d.stars[n] = Math.max(d.stars[n] || 0, stars); if (n >= d.cur) d.cur = n + 1; ls.set(K, d); setTimeout(() => Kit.checkAch(cfg.id, cfg.name), 1400); },
    cur() { return get().cur; } };
  window.nuboBack = () => { const ov = document.querySelector('.k-ov,.k-sheet,.tsh.show,.ov.show'); if (ov) { ov.classList.contains('show') ? ov.classList.remove('show') : ov.remove(); return true; } if (wrap.style.display === 'none') { api.show(); return true; } return false; };
  return api;
};
window.Kit = Kit;
})();
