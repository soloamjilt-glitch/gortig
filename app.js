/* ГОРТИГ — бие даан сурах апп */
'use strict';

/* ── хадгалалт ── */
const KEY = 'gortig_v1';
let ST = { seen: {}, ang: 0, order: 0, spot: 0, test: 0, tries: 0 };
try { const r = localStorage.getItem(KEY); if (r) ST = Object.assign(ST, JSON.parse(r)); } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} }

/* ── туслах ── */
const $ = s => document.querySelector(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h !== undefined) e.innerHTML = h; return e; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const view = $('#view');
function go(name) {
  document.querySelectorAll('nav.bot button').forEach(b => b.classList.toggle('on', b.dataset.go === name));
  view.scrollTop = 0; window.scrollTo(0, 0);
  SCREENS[name]();
}

/* ══════════ 1. СУРАХ ══════════ */
function scrLearn() {
  view.innerHTML = '';
  view.appendChild(el('h1', null, '📐 Байгуулалт сурах'));
  view.appendChild(el('p', 'sub', 'Алхам бүрийг дараад үзнэ. Бүгдийг үзвэл од авна.'));
  const list = el('div', 'list');
  CONS.forEach(c => {
    const done = ST.seen[c.id];
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
  const bk = el('p', 'sub', esc(c.book)); view.appendChild(bk);
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
    if (step >= c.steps.length - 1 && !ST.seen[c.id]) { ST.seen[c.id] = 1; save(); }
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
function scrPlay() {
  view.innerHTML = '';
  view.appendChild(el('h1', null, '🎮 Тоглоом'));
  view.appendChild(el('p', 'sub', 'Гурван тоглоомоор бататга. Дээд оноо хадгалагдана.'));
  const g = [
    ['Хэдэн градус?', 'Төв өнцгийг хурдан бод', ST.ang, gameAngle],
    ['Алхмаа эмхл', 'Байгуулалтын алхмыг дараалалд оруул', ST.order, gameOrder],
    ['Аль нь зөв бэ?', 'Жигд байгуулсныг нь ол', ST.spot, gameSpot]
  ];
  const list = el('div', 'list');
  g.forEach(([n, d, hs, fn]) => {
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

/* 2.1 Хэдэн градус? */
function gameAngle() {
  const { sc, body } = gameShell('Хэдэн градус?', 'Тойргийг тэнцүү хуваавал нэг хэсгийн төв өнцөг хэд вэ?');
  let i = 0, right = 0; const TOTAL = 10;
  const qs = shuffle(ANG_N).slice(0, TOTAL);
  function step() {
    if (i >= TOTAL) return done();
    const n = qs[i], ans = 360 / n;
    /* сарниулагчийг мөн 360:n олонлогоос авна — бүгд бүхэл тоо */
    const pool = shuffle(ANG_N.map(v => 360 / v).filter(v => v !== ans));
    const opts = shuffle([ans, pool[0], pool[1], pool[2]]);
    const ansIdx = opts.indexOf(ans);
    sc.innerHTML = `Асуулт <b>${i + 1}</b> / ${TOTAL} · Зөв <b>${right}</b>`;
    body.innerHTML = `<div class="big">360° : ${n} = ?</div>`;
    const wrap = el('div', 'opts');
    opts.forEach((v, k) => {
      const b = el('button', 'opt', v + '°');
      b.onclick = () => {
        if (wrap.dataset.lock) return; wrap.dataset.lock = '1';
        wrap.children[ansIdx].classList.add('good');
        if (k !== ansIdx) b.classList.add('bad'); else right++;
        setTimeout(() => { i++; step(); }, 700);
      };
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  }
  function done() {
    if (right > ST.ang) { ST.ang = right; save(); }
    sc.innerHTML = `Дууслаа · Зөв <b>${right}</b> / ${TOTAL}`;
    body.innerHTML = `<div class="big">${right >= 9 ? '🏆' : right >= 6 ? '👍' : '🔁'}</div>
      <p class="sub" style="text-align:center">${right >= 9 ? 'Маш сайн!' : right >= 6 ? 'Сайн байна.' : 'Дахин туршиж үз.'}</p>`;
    const b = el('button', 'btn wide', '↺ Дахин'); b.onclick = gameAngle; body.appendChild(b);
  }
  step();
}

/* 2.2 Алхмаа эмхл */
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
          if (pts > ST.order) { ST.order = pts; save(); }
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

/* 2.3 Аль нь зөв бэ? */
function gameSpot() {
  const { sc, body } = gameShell('Аль нь зөв бэ?', 'Гортигоор жигд байгуулсан дүрсийг ол.');
  let i = 0, right = 0; const TOTAL = 8;
  function step() {
    if (i >= TOTAL) return done();
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
  function done() {
    if (right > ST.spot) { ST.spot = right; save(); }
    sc.innerHTML = `Дууслаа · Зөв <b>${right}</b> / ${TOTAL}`;
    body.innerHTML = `<div class="big">${right >= 7 ? '🏆' : right >= 5 ? '👍' : '🔁'}</div>
      <p class="sub" style="text-align:center">Жигд бус дүрсэд дэлбээний зай, хэмжээ зөрдөг.</p>`;
    const b = el('button', 'btn wide', '↺ Дахин'); b.onclick = gameSpot; body.appendChild(b);
  }
  step();
}

/* ══════════ 3. ТЕСТ ══════════ */
function scrTest() {
  view.innerHTML = '';
  view.appendChild(el('h1', null, '✍ Тест'));
  view.appendChild(el('p', 'sub', `${TEST.length} асуулт. Хариултаа сонгоод шалгана.`));
  if (ST.test) view.appendChild(el('div', 'score', `Дээд оноо: <b>${ST.test}</b> / ${TEST.length}`));
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
    const wrap = el('div', 'opts col');
    opts.forEach((t, k) => {
      const b = el('button', 'opt', esc(t));
      b.onclick = () => {
        if (wrap.dataset.lock) return; wrap.dataset.lock = '1';
        wrap.children[ans].classList.add('good');
        if (k !== ans) b.classList.add('bad'); else right++;
        setTimeout(() => { i++; step(); }, 750);
      };
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  }
  function done() {
    ST.tries++; if (right > ST.test) ST.test = right; save();
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
  const seen = Object.keys(ST.seen).length;
  const pct = Math.round(seen / CONS.length * 100);
  view.appendChild(el('div', 'ring', `<div class="rv">${pct}%</div><div class="rl">байгуулалт үзсэн</div>`));
  const g = el('div', 'grid');
  [['Үзсэн байгуулалт', seen + ' / ' + CONS.length],
   ['Хэдэн градус?', ST.ang + ' / 10'],
   ['Алхмаа эмхл', ST.order ? '★ ' + ST.order : '—'],
   ['Аль нь зөв бэ?', ST.spot + ' / 8'],
   ['Тестийн дээд оноо', ST.test + ' / ' + TEST.length],
   ['Тест өгсөн тоо', String(ST.tries)]
  ].forEach(([k, v]) => g.appendChild(el('div', 'stat', `<b>${v}</b><i>${k}</i>`)));
  view.appendChild(g);
  const list = el('div', 'list');
  CONS.forEach(c => {
    const d = ST.seen[c.id];
    list.appendChild(el('div', 'row' + (d ? ' done' : ''),
      `<span class="rowicon">${d ? '★' : '○'}</span><span class="rowtxt">${esc(c.short)}</span>`));
  });
  view.appendChild(list);
  const b = el('button', 'btn ghost wide', 'Ахицаа устгах');
  b.onclick = () => { if (confirm('Бүх ахицыг устгах уу?')) { ST = { seen: {}, ang: 0, order: 0, spot: 0, test: 0, tries: 0 }; save(); go('stat'); } };
  view.appendChild(b);
}

const SCREENS = { learn: scrLearn, play: scrPlay, test: scrTest, stat: scrStat };
document.querySelectorAll('nav.bot button').forEach(b => { b.onclick = () => go(b.dataset.go); });
go('learn');

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
