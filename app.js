/* ГОРТИГ — бие даан сурах апп (6–12-р анги) */
'use strict';

/* ── хадгалалт: анги тус бүрд тусдаа ахиц ── */
const KEY = 'gortig_v2', OLDKEY = 'gortig_v1';
const blank = () => ({ seen: {}, ang: 0, order: 0, spot: 0, name: 0, next: 0, test: 0, tries: 0 });
const ALLG = [6, 7, 8, 9, 10, 11, 12];
let ST = { g: 6, p: {} };
ALLG.forEach(k => ST.p[k] = blank());
try {
  const r = localStorage.getItem(KEY);
  if (r) {
    const o = JSON.parse(r);
    ST.g = o.g || 6;
    for (const k of ALLG) ST.p[k] = Object.assign(blank(), (o.p && o.p[k]) || {});
  } else {
    /* хуучин 6-р ангийн ахицыг нүүлгэнэ */
    const old = localStorage.getItem(OLDKEY);
    if (old) ST.p[6] = Object.assign(blank(), JSON.parse(old));
  }
} catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} }
const PR = () => ST.p[ST.g];

/* ── туслах ── */
const $ = s => document.querySelector(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h !== undefined) e.innerHTML = h; return e; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const view = $('#view');
let CUR = 'learn';
function go(name) {
  CUR = name;
  document.querySelectorAll('nav.bot button').forEach(b => b.classList.toggle('on', b.dataset.go === name));
  view.scrollTop = 0; window.scrollTo(0, 0);
  SCREENS[name]();
}

/* ── анги сонгох ── */
function applyGrade(g) {
  ST.g = g; save();
  setGrade(g);
  $('#sub').textContent = g + '-р анги · ' + GRADES[g].unit;
  document.querySelectorAll('#gpick button').forEach(b => b.classList.toggle('on', +b.dataset.g === g));
  go(CUR === 'learn' ? 'learn' : CUR);
}
document.querySelectorAll('#gpick button').forEach(b => {
  b.onclick = () => applyGrade(+b.dataset.g);
});

/* ══════════ 1. СУРАХ ══════════ */
function scrLearn() {
  view.innerHTML = '';
  view.appendChild(el('h1', null, '📐 Байгуулалт сурах'));
  view.appendChild(el('p', 'sub', 'Алхам бүрийг дараад үзнэ. Бүгдийг үзвэл од авна.'));
  const list = el('div', 'list');
  CONS.forEach(c => {
    const done = PR().seen[c.id];
    const card = el('button', 'row' + (done ? ' done' : ''));
    card.innerHTML = `<span class="rowicon">${done ? '★' : '○'}</span>
      <span class="rowtxt"><b>${esc(c.name)}</b><i>${esc(c.book)}</i></span>
      <span class="rowgo">›</span>`;
    card.onclick = () => learnOne(c);
    list.appendChild(card);
  });
  view.appendChild(list);
}

function learnOne(c) {
  let step = 0, timer = null;
  view.innerHTML = '';
  const back = el('button', 'back', '‹ Буцах'); back.onclick = () => { if (timer) clearInterval(timer); go('learn'); };
  view.appendChild(back);
  view.appendChild(el('h2', null, esc(c.name)));
  view.appendChild(el('p', 'sub', esc(c.book)));
  const box = el('div', 'draw'); view.appendChild(box);
  const cap = el('div', 'cap'); view.appendChild(cap);
  const bar = el('div', 'dots'); view.appendChild(bar);
  const ctl = el('div', 'ctl');
  const bPrev = el('button', 'btn ghost', '‹');
  const bAuto = el('button', 'btn ghost', '▶ Автомат');
  const bNext = el('button', 'btn', 'Дараагийн ›');
  ctl.append(bPrev, bAuto, bNext); view.appendChild(ctl);

  function render() {
    box.innerHTML = drawCon(c, step);
    cap.innerHTML = `<span class="num">${step + 1}</span> ${esc(c.steps[step])}`;
    bar.innerHTML = c.steps.map((_, i) => `<i class="${i === step ? 'on' : (i < step ? 'past' : '')}"></i>`).join('');
    bPrev.disabled = step === 0;
    bNext.textContent = step >= c.steps.length - 1 ? 'Дууслаа ✓' : 'Дараагийн ›';
    if (step >= c.steps.length - 1 && !PR().seen[c.id]) { PR().seen[c.id] = 1; save(); }
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; bAuto.textContent = '▶ Автомат'; } }
  bNext.onclick = () => { stop(); if (step < c.steps.length - 1) { step++; render(); } else go('learn'); };
  bPrev.onclick = () => { stop(); if (step > 0) { step--; render(); } };
  bAuto.onclick = () => {
    if (timer) { stop(); return; }
    if (step >= c.steps.length - 1) step = 0;
    bAuto.textContent = '❚❚ Зогс';
    timer = setInterval(() => { if (step >= c.steps.length - 1) { stop(); return; } step++; render(); }, 1800);
    render();
  };
  box.onclick = () => { stop(); if (step < c.steps.length - 1) { step++; render(); } };
  render();
}

/* ══════════ 2. ТОГЛООМ ══════════ */
function gameList() {
  const g = [];
  if (ST.g === 6) {
    g.push(['Хэдэн градус?', 'Төв өнцгийг хурдан бод', 'ang', gameAngle]);
    g.push(['Аль нь зөв бэ?', 'Жигд байгуулсныг нь ол', 'spot', gameSpot]);
  }
  g.push(['Алхмаа эмхл', 'Байгуулалтын алхмыг дараалалд оруул', 'order', gameOrder]);
  g.push(['Ямар байгуулалт вэ?', 'Зургаар нь байгуулалтыг тань', 'name', gameName]);
  if (ST.g !== 6) g.push(['Дараагийн алхам аль нь?', 'Зургийг хараад дараагийн алхмыг сонго', 'next', gameNext]);
  return g;
}
function scrPlay() {
  view.innerHTML = '';
  view.appendChild(el('h1', null, '🎮 Тоглоом'));
  view.appendChild(el('p', 'sub', 'Тоглоомоор бататга. Дээд оноо хадгалагдана.'));
  const list = el('div', 'list');
  gameList().forEach(([n, d, key, fn]) => {
    const hs = PR()[key];
    const b = el('button', 'row');
    b.innerHTML = `<span class="rowicon">▶</span><span class="rowtxt"><b>${n}</b><i>${d}</i></span>
      <span class="rowbadge">${hs ? '★ ' + hs : '—'}</span>`;
    b.onclick = fn; list.appendChild(b);
  });
  view.appendChild(list);
}

function gameShell(title, sub) {
  view.innerHTML = '';
  const back = el('button', 'back', '‹ Буцах'); back.onclick = () => go('play');
  view.appendChild(back);
  view.appendChild(el('h2', null, title));
  view.appendChild(el('p', 'sub', sub));
  const sc = el('div', 'score'); view.appendChild(sc);
  const body = el('div', 'gbody'); view.appendChild(body);
  return { sc, body };
}
function finish(sc, body, right, total, key, again) {
  if (right > PR()[key]) { PR()[key] = right; save(); }
  sc.innerHTML = `Дууслаа · Зөв <b>${right}</b> / ${total}`;
  const good = right >= Math.ceil(total * 0.85), ok = right >= Math.ceil(total * 0.6);
  body.innerHTML = `<div class="big">${good ? '🏆' : ok ? '👍' : '🔁'}</div>
    <p class="sub" style="text-align:center">${good ? 'Маш сайн!' : ok ? 'Сайн байна.' : 'Дахин туршиж үз.'}</p>`;
  const b = el('button', 'btn wide', '↺ Дахин'); b.onclick = again; body.appendChild(b);
}
/* 4 хувилбарын нэгийг зөв болгож үзүүлэх нийтлэг блок */
function quizRound(body, opts, ansIdx, onDone, col) {
  const wrap = el('div', 'opts' + (col ? ' col' : ''));
  opts.forEach((v, k) => {
    const b = el('button', 'opt', esc(v));
    b.onclick = () => {
      if (wrap.dataset.lock) return; wrap.dataset.lock = '1';
      wrap.children[ansIdx].classList.add('good');
      if (k !== ansIdx) b.classList.add('bad');
      setTimeout(() => onDone(k === ansIdx), 750);
    };
    wrap.appendChild(b);
  });
  body.appendChild(wrap);
}

/* 2.1 Хэдэн градус? (зөвхөн 6-р анги) */
function gameAngle() {
  const { sc, body } = gameShell('Хэдэн градус?', 'Тойргийг тэнцүү хуваавал нэг хэсгийн төв өнцөг хэд вэ?');
  let i = 0, right = 0; const TOTAL = 10;
  const qs = shuffle(ANG_N).slice(0, TOTAL);
  function step() {
    if (i >= TOTAL) return finish(sc, body, right, TOTAL, 'ang', gameAngle);
    const n = qs[i], ans = 360 / n;
    const pool = shuffle(ANG_N.map(v => 360 / v).filter(v => v !== ans));
    const opts = shuffle([ans, pool[0], pool[1], pool[2]]);
    sc.innerHTML = `Асуулт <b>${i + 1}</b> / ${TOTAL} · Зөв <b>${right}</b>`;
    body.innerHTML = `<div class="big">360° : ${n} = ?</div>`;
    quizRound(body, opts.map(v => v + '°'), opts.indexOf(ans), ok => { if (ok) right++; i++; step(); });
  }
  step();
}

/* 2.2 Алхмаа эмхл (бүх анги) */
function gameOrder() {
  const { sc, body } = gameShell('Алхмаа эмхл', 'Алхмуудыг зөв дараалалд нь дарж оруул.');
  const c = CONS[Math.floor(Math.random() * CONS.length)];
  const order = shuffle(c.steps.map((s, i) => [s, i]));
  let next = 0, wrong = 0;
  sc.innerHTML = `<b>${esc(c.name)}</b>`;
  const list = el('div', 'list');
  order.forEach(([s, idx]) => {
    const b = el('button', 'row step');
    b.innerHTML = `<span class="rowicon">?</span><span class="rowtxt">${esc(s)}</span>`;
    b.onclick = () => {
      if (b.classList.contains('good')) return;
      if (idx === next) {
        b.classList.add('good'); b.querySelector('.rowicon').textContent = next + 1; next++;
        if (next >= c.steps.length) {
          const pts = Math.max(0, c.steps.length - wrong);
          if (pts > PR().order) { PR().order = pts; save(); }
          sc.innerHTML = `Дууслаа · Оноо <b>${pts}</b> (алдаа ${wrong})`;
          const nb = el('button', 'btn wide', '↺ Өөр байгуулалт'); nb.onclick = gameOrder; body.appendChild(nb);
        }
      } else {
        wrong++; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 450);
      }
    };
    list.appendChild(b);
  });
  body.appendChild(list);
}

/* 2.3 Аль нь зөв бэ? (зөвхөн 6-р анги) */
function gameSpot() {
  const { sc, body } = gameShell('Аль нь зөв бэ?', 'Гортигоор жигд байгуулсан дүрсийг ол.');
  let i = 0, right = 0; const TOTAL = 8;
  function step() {
    if (i >= TOTAL) {
      if (right > PR().spot) { PR().spot = right; save(); }
      sc.innerHTML = `Дууслаа · Зөв <b>${right}</b> / ${TOTAL}`;
      body.innerHTML = `<div class="big">${right >= 7 ? '🏆' : right >= 5 ? '👍' : '🔁'}</div>
        <p class="sub" style="text-align:center">Жигд бус дүрсэд дэлбээний зай, хэмжээ зөрдөг.</p>`;
      const b = el('button', 'btn wide', '↺ Дахин'); b.onclick = gameSpot; body.appendChild(b);
      return;
    }
    const n = [4, 6, 8, 12][Math.floor(Math.random() * 4)];
    const good = Math.random() < 0.5 ? 0 : 1;
    sc.innerHTML = `Тойрог <b>${i + 1}</b> / ${TOTAL} · Зөв <b>${right}</b>`;
    body.innerHTML = '';
    const pair = el('div', 'pair');
    for (let k = 0; k < 2; k++) {
      const d = el('button', 'pick');
      d.innerHTML = rosette(n, k !== good, 200) + `<b>${k === 0 ? 'А' : 'Б'}</b>`;
      d.onclick = () => {
        if (pair.dataset.lock) return; pair.dataset.lock = '1';
        pair.children[good].classList.add('good');
        if (k !== good) d.classList.add('bad'); else right++;
        setTimeout(() => { i++; step(); }, 800);
      };
      pair.appendChild(d);
    }
    body.appendChild(pair);
  }
  step();
}

/* 2.4 Ямар байгуулалт вэ? (бүх анги) */
function gameName() {
  const { sc, body } = gameShell('Ямар байгуулалт вэ?', 'Бэлэн зургийг хараад байгуулалтын нэрийг сонго.');
  const TOTAL = Math.min(8, CONS.length * 2);
  let i = 0, right = 0;
  let bag = shuffle(CONS);
  function step() {
    if (i >= TOTAL) return finish(sc, body, right, TOTAL, 'name', gameName);
    if (!bag.length) bag = shuffle(CONS);
    const c = bag.pop();
    const others = shuffle(CONS.filter(x => x.id !== c.id)).slice(0, 3);
    const opts = shuffle([c, ...others]);
    sc.innerHTML = `Зураг <b>${i + 1}</b> / ${TOTAL} · Зөв <b>${right}</b>`;
    body.innerHTML = `<div class="draw sm">${drawCon(c, c.steps.length - 1)}</div>`;
    quizRound(body, opts.map(o => o.name), opts.findIndex(o => o.id === c.id),
      ok => { if (ok) right++; i++; step(); }, true);
  }
  step();
}

/* 2.5 Дараагийн алхам аль нь? (7–9-р анги) */
function gameNext() {
  const { sc, body } = gameShell('Дараагийн алхам аль нь?', 'Зураг хаана хүрснийг хараад дараагийн зааврыг сонго.');
  const TOTAL = 8;
  let i = 0, right = 0;
  function step() {
    if (i >= TOTAL) return finish(sc, body, right, TOTAL, 'next', gameNext);
    const c = CONS[Math.floor(Math.random() * CONS.length)];
    const k = Math.floor(Math.random() * (c.steps.length - 1));   /* 0 … n-2 */
    const ansTxt = c.steps[k + 1];
    /* сарниулагч: тухайн ба бусад байгуулалтын өөр алхмууд */
    const pool = [];
    CONS.forEach(x => x.steps.forEach((s, j) => { if (s !== ansTxt && !(x.id === c.id && j === k)) pool.push(s); }));
    const opts = shuffle([ansTxt, ...shuffle(pool).slice(0, 3)]);
    sc.innerHTML = `Асуулт <b>${i + 1}</b> / ${TOTAL} · Зөв <b>${right}</b>`;
    body.innerHTML = `<div class="sub" style="margin:0 0 6px"><b>${esc(c.name)}</b> — ${k + 1}-р алхам хийгдсэн</div>
      <div class="draw sm">${drawCon(c, k)}</div>`;
    quizRound(body, opts, opts.indexOf(ansTxt), ok => { if (ok) right++; i++; step(); }, true);
  }
  step();
}

/* ══════════ 3. ТЕСТ ══════════ */
function scrTest() {
  view.innerHTML = '';
  view.appendChild(el('h1', null, '✍ Тест'));
  view.appendChild(el('p', 'sub', `${TEST.length} асуулт. Хариултаа сонгоод шалгана.`));
  if (PR().test) view.appendChild(el('div', 'score', `Дээд оноо: <b>${PR().test}</b> / ${TEST.length}`));
  const b = el('button', 'btn wide', 'Тест эхлүүлэх'); b.onclick = runTest;
  view.appendChild(b);
}

function runTest() {
  const qs = shuffle(TEST).map(q => {
    const pairs = q[1].map((t, i) => [t, i === q[2]]);
    const mixed = shuffle(pairs);
    return [q[0], mixed.map(p => p[0]), mixed.findIndex(p => p[1])];
  });
  let i = 0, right = 0;
  view.innerHTML = '';
  const back = el('button', 'back', '‹ Гарах'); back.onclick = () => go('test'); view.appendChild(back);
  const sc = el('div', 'score'); view.appendChild(sc);
  const body = el('div', 'gbody'); view.appendChild(body);
  function step() {
    if (i >= qs.length) return done();
    const [q, opts, ans] = qs[i];
    sc.innerHTML = `Асуулт <b>${i + 1}</b> / ${qs.length} · Зөв <b>${right}</b>`;
    body.innerHTML = `<div class="qq">${esc(q)}</div>`;
    quizRound(body, opts, ans, ok => { if (ok) right++; i++; step(); }, true);
  }
  function done() {
    PR().tries++; if (right > PR().test) PR().test = right; save();
    const pct = Math.round(right / qs.length * 100), lv = level(pct);
    sc.innerHTML = `Дүн: <b>${right}</b> / ${qs.length} — ${pct}%`;
    body.innerHTML = `<div class="lvl"><span>${lv[0]}</span><i>${lv[1]}</i></div>`;
    const b = el('button', 'btn wide', '↺ Дахин өгөх'); b.onclick = runTest; body.appendChild(b);
    const b2 = el('button', 'btn ghost wide', 'Байгуулалт давтах'); b2.onclick = () => go('learn'); body.appendChild(b2);
  }
  step();
}

/* ══════════ 4. АХИЦ ══════════ */
function scrStat() {
  view.innerHTML = '';
  view.appendChild(el('h1', null, '⭐ Миний ахиц'));
  view.appendChild(el('p', 'sub', ST.g + '-р анги · ' + GRADES[ST.g].unit));
  const seen = CONS.filter(c => PR().seen[c.id]).length;
  const pct = Math.round(seen / CONS.length * 100);
  view.appendChild(el('div', 'ring', `<div class="rv">${pct}%</div><div class="rl">байгуулалт үзсэн</div>`));
  const rows = [['Үзсэн байгуулалт', seen + ' / ' + CONS.length]];
  gameList().forEach(([n, , key]) => rows.push([n, PR()[key] ? '★ ' + PR()[key] : '—']));
  rows.push(['Тестийн дээд оноо', PR().test + ' / ' + TEST.length]);
  rows.push(['Тест өгсөн тоо', String(PR().tries)]);
  const g = el('div', 'grid');
  rows.forEach(([k, v]) => g.appendChild(el('div', 'stat', `<b>${v}</b><i>${k}</i>`)));
  view.appendChild(g);

  /* бүх ангийн тойм */
  const all = el('div', 'list');
  ALLG.forEach(n => {
    const s = GRADES[n].cons.filter(c => ST.p[n].seen[c.id]).length;
    const b = el('button', 'row' + (n === ST.g ? ' done' : ''));
    b.innerHTML = `<span class="rowicon">${n}</span>
      <span class="rowtxt"><b>${GRADES[n].unit}</b><i>${s} / ${GRADES[n].cons.length} байгуулалт · тест ${ST.p[n].test}/${GRADES[n].test.length}</i></span>
      <span class="rowgo">›</span>`;
    b.onclick = () => applyGrade(n);
    all.appendChild(b);
  });
  view.appendChild(el('h2', null, 'Бүх анги'));
  view.appendChild(all);

  const b = el('button', 'btn ghost wide', ST.g + '-р ангийн ахицыг устгах');
  b.onclick = () => { if (confirm(ST.g + '-р ангийн бүх ахицыг устгах уу?')) { ST.p[ST.g] = blank(); save(); go('stat'); } };
  view.appendChild(b);

  /* ── зохиогчийн тэмдэг ── */
  const cr = el(`div`, `credit`,
    '<svg viewBox="0 0 90.92 120" width="30" height="30" aria-hidden="true"><g transform="translate(26 12) rotate(90)"><line x1="0" y1="0" x2="96" y2="0" stroke="#2E8B62" stroke-width="15" stroke-linecap="round"/><line x1="9.9" y1="6.68" x2="9.9" y2="-5.03" stroke="#FFFFFF" stroke-width="1.8"/><line x1="20.9" y1="6.68" x2="20.9" y2="0.67" stroke="#FFFFFF" stroke-width="1.28"/><line x1="31.9" y1="6.68" x2="31.9" y2="0.67" stroke="#FFFFFF" stroke-width="1.28"/><line x1="42.9" y1="6.68" x2="42.9" y2="0.67" stroke="#FFFFFF" stroke-width="1.28"/><line x1="53.9" y1="6.68" x2="53.9" y2="0.67" stroke="#FFFFFF" stroke-width="1.28"/><line x1="64.9" y1="6.68" x2="64.9" y2="-5.03" stroke="#FFFFFF" stroke-width="1.8"/><line x1="75.9" y1="6.68" x2="75.9" y2="0.67" stroke="#FFFFFF" stroke-width="1.28"/><line x1="86.9" y1="6.68" x2="86.9" y2="0.67" stroke="#FFFFFF" stroke-width="1.28"/></g><path d="M 26 12 A 23.04 23.04 0 0 1 26 58.08" fill="none" stroke="#2E8B62" stroke-width="15" stroke-linecap="round"/><line x1="33.52" y1="20.5" x2="38.9" y2="10.11" stroke="#FFFFFF" stroke-width="1.8"/><line x1="39.36" y1="25.59" x2="44.26" y2="22.12" stroke="#FFFFFF" stroke-width="1.28"/><line x1="42.21" y1="32.78" x2="48.15" y2="31.95" stroke="#FFFFFF" stroke-width="1.28"/><line x1="41.43" y1="40.48" x2="47.09" y2="42.48" stroke="#FFFFFF" stroke-width="1.28"/><line x1="37.21" y1="46.96" x2="41.32" y2="51.34" stroke="#FFFFFF" stroke-width="1.28"/><line x1="30.48" y1="50.78" x2="33.68" y2="62.04" stroke="#FFFFFF" stroke-width="1.8"/><path d="M 26 58.08 A 24.96 24.96 0 0 1 26 108" fill="none" stroke="#2E8B62" stroke-width="15" stroke-linecap="round"/><line x1="33.8" y1="66.5" x2="38.79" y2="55.92" stroke="#FFFFFF" stroke-width="1.8"/><line x1="40.11" y1="71.41" x2="44.74" y2="67.59" stroke="#FFFFFF" stroke-width="1.28"/><line x1="43.72" y1="78.54" x2="49.54" y2="77.06" stroke="#FFFFFF" stroke-width="1.28"/><line x1="43.95" y1="86.53" x2="49.84" y2="87.67" stroke="#FFFFFF" stroke-width="1.28"/><line x1="40.75" y1="93.85" x2="45.58" y2="97.4" stroke="#FFFFFF" stroke-width="1.28"/><line x1="34.72" y1="99.11" x2="40.31" y2="109.39" stroke="#FFFFFF" stroke-width="1.8"/></svg>' +
    '<span><b>Б.Солонгоо</b>Дизайн технологийн багш · Өвөрхангай, Бүрд сумын ЕБС</span>');
  view.appendChild(cr);
}

const SCREENS = { learn: scrLearn, play: scrPlay, test: scrTest, stat: scrStat };
document.querySelectorAll('nav.bot button').forEach(b => { b.onclick = () => go(b.dataset.go); });
applyGrade(ST.g);

/* ── Офлайн бэлэн эсэхийг утсан дээр нүдэн харуулна ── */
const NEED = 9;                    /* sw.js-ийн FILES-ийн тоо */
const offl = document.getElementById('offl');
function offlShow(cls, txt) {
  offl.hidden = false;
  offl.className = 'offl ' + cls;
  offl.textContent = txt;
}
async function offlCheck() {
  try {
    if (!('caches' in window)) { offlShow('no', 'Офлайн: хөтөч дэмжихгүй'); return true; }
    const ks = await caches.keys();
    const k = ks.filter(x => x.indexOf('gortig-') === 0).sort().pop();
    const n = k ? (await (await caches.open(k)).keys()).length : 0;
    if (n >= NEED) { offlShow('ok', '✓ Офлайн бэлэн — интернэтгүй ажиллана'); return true; }
    if (navigator.onLine) offlShow('wait', 'Офлайн бэлтгэж байна… ' + n + '/' + NEED);
    else offlShow('no', 'Офлайн бэлэн БИШ — интернэттэй нэг удаа нээ');
  } catch (e) {
    offlShow('no', 'Офлайн кэш ажиллахгүй');
    return true;
  }
  return false;
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
  let t = 0;
  const tick = async () => { if (!(await offlCheck()) && ++t < 24) setTimeout(tick, 1500); };
  tick();
  offl.onclick = () => { t = 0; tick(); };
} else {
  offlShow('no', 'Офлайн: хөтөч дэмжихгүй');
}
