/* ГОРТИГ — байгуулалтын SVG зурагч.
   Огтлолцлыг томьёогоор бодно — цэг гараар байрлуулаагүй. */

const VB = 360, CX = 180, RR = 112;
const P = (cx, cy, r, deg) => { const a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
const DIST = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const OO = [CX, CX], TOP = P(CX, CX, RR, -90), BOT = P(CX, CX, RR, 90),
      LFT = P(CX, CX, RR, 180), RGT = P(CX, CX, RR, 0);

/* хоёр тойргийн огтлолцол; up=true бол нэг тал, false бол нөгөө */
function xs(c1, r1, c2, r2, up) {
  const d = DIST(c1, c2);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const m = [c1[0] + a * (c2[0] - c1[0]) / d, c1[1] + a * (c2[1] - c1[1]) / d];
  const ux = -(c2[1] - c1[1]) / d, uy = (c2[0] - c1[0]) / d;
  return up ? [m[0] + h * ux, m[1] + h * uy] : [m[0] - h * ux, m[1] - h * uy];
}
const AXH = { l: [CX - RR - 16, CX, CX + RR + 16, CX], dash: 1 };
const AXV = { l: [CX, CX - RR - 16, CX, CX + RR + 16], dash: 1 };

/* байгуулалт бүрийн алхам бүрд зурагдах элементүүд */
const GEO = {
 seg() {
  const A = [40, 250], B = [320, 250], r = 178;
  const Pp = xs(A, r, B, r, false), Qq = xs(A, r, B, r, true), M = [180, 250];
  return [[{ l: [...A, ...B] }, { p: [...A, 'A'] }, { p: [...B, 'B'] }],
          [{ arc: [...A, r, -52, 52] }],
          [{ arc: [...B, r, 128, 232] }, { p: [...Pp, 'P'] }, { p: [...Qq, 'Q'] }],
          [{ l: [...Pp, ...Qq], k: 1 }, { p: [...M, 'M'] }]];
 },
 segn() {
  const A = [38, 288], B = [326, 288], ang = -38, sp = 50;
  const pts = []; for (let i = 1; i <= 5; i++) pts.push(P(A[0], A[1], sp * i, ang));
  const onAB = []; for (let i = 1; i <= 4; i++) onAB.push([A[0] + (B[0] - A[0]) * i / 5, 288]);
  return [[{ l: [...A, ...B] }, { p: [...A, 'A'] }, { p: [...B, 'B'] }],
          [{ l: [...A, ...P(A[0], A[1], 290, ang)], dash: 1 }],
          pts.map((q, i) => ({ p: [...q, String(i + 1)] })),
          [{ l: [...pts[4], ...B], k: 1 }],
          pts.slice(0, 4).map((q, i) => ({ l: [...q, ...onAB[i]], dash: 1 }))
            .concat(onAB.map(q => ({ p: [...q, ''] })))];
 },
 c3() {
  const a = P(CX, CX, RR, 30), b = P(CX, CX, RR, 150);
  return [[{ c: [...OO, RR] }, AXH, AXV, { p: [...OO, 'O'] }],
          [{ p: [...TOP, 'E'] }, { p: [...BOT, 'F'] }],
          [{ arc: [...BOT, RR, -150, -30], k: 1 }],
          [{ p: [...a, '1'] }, { p: [...b, '2'] }],
          [{ poly: [TOP, a, b], k: 1 }]];
 },
 c6() {
  const q = [-90, -30, 30, 90, 150, 210].map(d => P(CX, CX, RR, d));
  return [[{ c: [...OO, RR] }, AXH, AXV, { p: [...OO, 'O'] }],
          [{ arc: [...BOT, RR, -150, -30], k: 1 }, { p: [...q[2], ''] }, { p: [...q[4], ''] }],
          [{ arc: [...TOP, RR, 30, 150], k: 1 }, { p: [...q[1], ''] }, { p: [...q[5], ''] }],
          [{ p: [...q[0], ''] }, { p: [...q[3], ''] }],
          [{ poly: q, k: 1 }]];
 },
 c12() {
  const q = []; for (let i = 0; i < 12; i++) q.push(P(CX, CX, RR, -90 + i * 30));
  return [[{ c: [...OO, RR] }, AXH, AXV, { p: [...TOP, ''] }, { p: [...BOT, ''] }, { p: [...LFT, ''] }, { p: [...RGT, ''] }],
          [{ arc: [...BOT, RR, -150, -30], k: 1 }],
          [{ arc: [...TOP, RR, 30, 150], k: 1 }],
          [{ arc: [...LFT, RR, -60, 60], k: 1 }],
          [{ arc: [...RGT, RR, 120, 240], k: 1 }].concat(q.map(x => ({ p: [...x, ''] }))),
          [{ poly: q, k: 1 }]];
 },
 c5() {
  const Bp = xs(LFT, RR, OO, RR, false), Cp = xs(LFT, RR, OO, RR, true);
  const D = [(LFT[0] + OO[0]) / 2, CX], DE = DIST(D, TOP), F = [D[0] + DE, CX];
  const q = []; for (let i = 0; i < 5; i++) q.push(P(CX, CX, RR, -90 + i * 72));
  return [[{ c: [...OO, RR] }, AXH, AXV, { p: [...OO, 'O'] }, { p: [...LFT, 'A'] }, { p: [...TOP, 'E'] }],
          [{ arc: [...LFT, RR, -70, 70], k: 1 }, { p: [...Bp, 'B'] }, { p: [...Cp, 'C'] }],
          [{ l: [...Bp, ...Cp], k: 1 }, { p: [...D, 'D'] }],
          [{ arc: [...D, DE, -62, 0], k: 1 }, { p: [...F, 'F'] }],
          [{ l: [...TOP, ...F], k: 1 }],
          /* 1-р орой нь E цэг тул шошгыг давхардуулахгүй */
          [{ poly: q, k: 1 }].concat(q.map((x, i) => ({ p: [...x, i === 0 ? '' : String(i + 1)] })))];
 },
 ang() {
  const V = [46, 300], r = 100;
  const Pp = [V[0] + r, 300], Qq = P(V[0], V[1], r, -55);
  const s1 = xs(Pp, r, Qq, r, false), s2 = xs(Pp, r, Qq, r, true);
  const S = (s1[0] > s2[0]) ? s1 : s2;
  return [[{ l: [...V, V[0] + 290, 300] }, { l: [...V, ...P(V[0], V[1], 290, -55)] }, { p: [...V, 'V'] }],
          [{ arc: [...V, r, -55, 0], k: 1 }, { p: [...Pp, 'P'] }, { p: [...Qq, 'Q'] }],
          [{ arc: [...Pp, r, -140, -40], k: 1 }],
          [{ arc: [...Qq, r, -70, 30], k: 1 }, { p: [...S, 'S'] }],
          [{ l: [...V, ...S], k: 1 }]];
 },
 c8() {
  const r2 = RR * 0.72;
  const m1 = xs(TOP, r2, RGT, r2, false), m2 = xs(TOP, r2, RGT, r2, true);
  const mid = (DIST(m1, OO) > DIST(m2, OO)) ? m1 : m2;
  const e = []; for (let i = 0; i < 8; i++) e.push(P(CX, CX, RR, -90 + i * 45));
  return [[{ c: [...OO, RR] }, AXH, AXV].concat([TOP, RGT, BOT, LFT].map(x => ({ p: [...x, ''] }))),
          [{ arc: [...TOP, r2, 0, 90], k: 1 }, { arc: [...RGT, r2, 180, 270], k: 1 }],
          [{ l: [...OO, ...mid], k: 1 }, { p: [...e[1], ''] }],
          e.map(x => ({ p: [...x, ''] })),
          [{ poly: e, k: 1 }]];
 }
};

function svgPart(d, hot) {
  const col = hot ? '#e05a3a' : '#2f6f8f', w = hot ? 2.6 : 1.8;
  const f = n => n.toFixed(1);
  if (d.c) return `<circle cx="${f(d.c[0])}" cy="${f(d.c[1])}" r="${f(d.c[2])}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  if (d.l) return `<line x1="${f(d.l[0])}" y1="${f(d.l[1])}" x2="${f(d.l[2])}" y2="${f(d.l[3])}" stroke="${d.dash ? '#9fb0bf' : col}" stroke-width="${d.dash ? 1.3 : w}"${d.dash ? ' stroke-dasharray="7 5"' : ''}/>`;
  if (d.arc) {
    const [cx, cy, r, a1, a2] = d.arc, s = P(cx, cy, r, a1), e = P(cx, cy, r, a2);
    const big = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
    return `<path d="M ${f(s[0])} ${f(s[1])} A ${f(r)} ${f(r)} 0 ${big} 1 ${f(e[0])} ${f(e[1])}" fill="none" stroke="${col}" stroke-width="${w}" stroke-dasharray="3 3" opacity="${hot ? 1 : .5}"/>`;
  }
  if (d.poly) return `<polygon points="${d.poly.map(q => f(q[0]) + ',' + f(q[1])).join(' ')}" fill="${hot ? 'rgba(224,90,58,.12)' : 'rgba(47,111,143,.09)'}" stroke="${col}" stroke-width="${w}"/>`;
  if (d.p) {
    const [x, y, lab] = d.p;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${hot ? 5 : 3.8}" fill="${col}"/>` +
      (lab ? `<text x="${f(x + 9)}" y="${f(y - 8)}" font-size="16" font-weight="700" fill="${col}">${lab}</text>` : '');
  }
  return '';
}

/* байгуулалтыг upto алхам хүртэл зурна */
function drawCon(con, upto) {
  const g = GEO[con.kind]();
  let s = `<svg viewBox="0 0 ${VB} ${VB}" width="100%" preserveAspectRatio="xMidYMid meet">`;
  for (let i = 0; i <= upto && i < g.length; i++) g[i].forEach(d => { s += svgPart(d, i === upto); });
  return s + '</svg>';
}

/* «Аль нь зөв бэ?» тоглоомд: жигд ба гажсан дугуй хээ */
function rosette(n, flawed, size) {
  const S = size || 200, c = S / 2, R = S * 0.35, pr = S * 0.21;
  let g = `<svg viewBox="0 0 ${S} ${S}" width="100%">`;
  g += `<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#c9d6e0" stroke-width="1.2"/>`;
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const rr = flawed ? pr * (0.8 + Math.random() * 0.38) : pr;
    const rad = (acc - 90) * Math.PI / 180;
    const x = c + Math.cos(rad) * (R - pr * 0.5), y = c + Math.sin(rad) * (R - pr * 0.5);
    g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="rgba(47,111,143,.13)" stroke="#2f6f8f" stroke-width="1.6"/>`;
    acc += 360 / n + (flawed ? (i % 2 ? -1 : 1) * (5 + Math.random() * 7) : 0);
  }
  return g + `<circle cx="${c}" cy="${c}" r="2.6" fill="#1d3f52"/></svg>`;
}
