/* ГОРТИГ — байгуулалтын SVG зурагч.
   Огтлолцол, шүргэлтийг томьёогоор бодно — цэг гараар байрлуулаагүй. */

const VB = 360, CX = 180, RR = 112;
const P = (cx, cy, r, deg) => { const a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
const DIST = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const ANG = (c, p) => (Math.atan2(p[1] - c[1], p[0] - c[0]) * 180 / Math.PI + 360) % 360;
const ADD = (a, b) => [a[0] + b[0], a[1] + b[1]];
const MUL = (v, k) => [v[0] * k, v[1] * k];
const UNIT = (a, b) => { const d = DIST(a, b); return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
const MID = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
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
/* шулуун (p, чиглэл u) ба тойрог (c, r) огтлолцол; k=+1 эсвэл -1 */
function lineCircle(p, u, c, r, k) {
  const f = [p[0] - c[0], p[1] - c[1]];
  const b = f[0] * u[0] + f[1] * u[1];
  const cc = f[0] * f[0] + f[1] * f[1] - r * r;
  const disc = Math.sqrt(Math.max(0, b * b - cc));
  const t = -b + k * disc;
  return [p[0] + u[0] * t, p[1] + u[1] * t];
}
/* хоёр шулууны огтлолцол: (p1,u1) ба (p2,u2) */
function lineLine(p1, u1, p2, u2) {
  const det = u1[0] * (-u2[1]) - u1[1] * (-u2[0]);
  const t = ((p2[0] - p1[0]) * (-u2[1]) - (p2[1] - p1[1]) * (-u2[0])) / det;
  return [p1[0] + u1[0] * t, p1[1] + u1[1] * t];
}
/* p цэгээс (a, чиглэл u) шулуунд буулгасан перпендикулярын ул */
function foot(p, a, u) {
  const t = (p[0] - a[0]) * u[0] + (p[1] - a[1]) * u[1];
  return [a[0] + u[0] * t, a[1] + u[1] * t];
}
const DEG = d => d * Math.PI / 180;
const DIR = d => [Math.cos(DEG(d)), Math.sin(DEG(d))];

const AXH = { l: [CX - RR - 16, CX, CX + RR + 16, CX], dash: 1 };
const AXV = { l: [CX, CX - RR - 16, CX, CX + RR + 16], dash: 1 };

/* ── аксонометрийн тэнхлэгийн вектор (сурах бичиг VIII анги, х.15–17) ── */
const ISO = { x: DIR(150), y: DIR(30), z: [0, -1], ky: 1 };           /* тэнхлэг хоорондоо 120° */
const DIM = { x: [-1, 0], y: DIR(45), z: [0, -1], ky: 0.5 };          /* x зүүн, z эгц, y 45°, y хагас */

/* гүдгэр тойм (Andrew monotone chain) — ямар ч параллель проекцод зөв ажиллана */
function hull2(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = arr => {
    const h = [];
    for (const q of arr) { while (h.length >= 2 && cr(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop(); h.push(q); }
    return h;
  };
  const lo = half(p), up = half(p.slice().reverse());
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/* биетийн цэгийг хавтгайд буулгах */
const pr3 = (O, ax, u, v, w) =>
  [O[0] + ax.x[0] * u + ax.y[0] * v * ax.ky + ax.z[0] * w,
   O[1] + ax.x[1] * u + ax.y[1] * v * ax.ky + ax.z[1] * w];

/* ── шоо + ¼ хэсгийг хассан байгуулалт (8-р анги, Хүснэгт 1.2) ── */
function cubeQuarter(O, ax, a) {
  const p = (u, v, w) => pr3(O, ax, u, v, w);
  const h = a / 2;
  return {
    base: [p(0,0,0), p(a,0,0), p(a,a,0), p(0,a,0)],
    top:  [p(0,0,a), p(a,0,a), p(a,a,a), p(0,a,a)],
    vert: [[p(0,0,0), p(0,0,a)], [p(a,0,0), p(a,0,a)], [p(a,a,0), p(a,a,a)], [p(0,a,0), p(0,a,a)]],
    mids: [p(h,0,a), p(a,h,a), p(h,a,a), p(0,h,a), p(h,h,a)],
    /* ¼ хассаны дараах гадна тойм */
    hull: [p(0,0,a), p(a,0,a), p(a,0,0), p(a,h,0), p(h,h,0), p(h,a,0), p(0,a,0), p(0,a,a)],
    /* дээд L нүүр */
    lface: [p(0,0,a), p(a,0,a), p(a,h,a), p(h,h,a), p(h,a,a), p(0,a,a)],
    /* дотоод ирмэгүүд */
    inner: [[p(h,h,a), p(h,h,0)], [p(a,h,a), p(a,h,0)], [p(h,a,a), p(h,a,0)]],
    /* хассан хэсгийн хоёр дотоод нүүр */
    f1: [p(a,h,a), p(h,h,a), p(h,h,0), p(a,h,0)],
    f2: [p(h,a,a), p(h,h,a), p(h,h,0), p(h,a,0)]
  };
}

/* байгуулалт бүрийн алхам бүрд зурагдах элементүүд */
const GEO = {

/* ═══════════ 6-р АНГИ ═══════════ */
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
 },

/* ═══════════ 7-р АНГИ ═══════════ */
 /* Овал — ижил радиустай хоёр тойрог (сурах бичиг х.15, 1.7–1.8 зураг) */
 oval() {
  const d = 150, R = 55, cy = 180;
  const O = [CX - d / 2, cy], O1 = [CX + d / 2, cy];
  const p1 = xs(O, d, O1, d, false), p2 = xs(O, d, O1, d, true);   /* 1 = дээд, 2 = доод */
  const u1O = UNIT(p1, O), u1O1 = UNIT(p1, O1), u2O = UNIT(p2, O), u2O1 = UNIT(p2, O1);
  const C = ADD(O, MUL(u1O, R)), D = ADD(O1, MUL(u1O1, R));
  const A = ADD(O, MUL(u2O, R)), B = ADD(O1, MUL(u2O1, R));
  const rho = d + R;
  return [
   [{ l: [40, cy, 320, cy], dash: 1 }, { c: [...O, R] }, { c: [...O1, R] },
    { p: [...O, 'O'] }, { p: [...O1, 'O₁'] }],
   [{ arc: [...O, d, -75, 75] }, { arc: [...O1, d, 105, 255] },
    { p: [...p1, '1'] }, { p: [...p2, '2'] }],
   [{ l: [...p1, ...C], dash: 1 }, { l: [...p1, ...D], dash: 1 },
    { l: [...p2, ...A], dash: 1 }, { l: [...p2, ...B], dash: 1 },
    { p: [...A, 'A'] }, { p: [...B, 'B'] }, { p: [...C, 'C'] }, { p: [...D, 'D'] }],
   [{ arc: [...p1, rho, ANG(p1, D), ANG(p1, C)], k: 1 }],
   [{ arc: [...p2, rho, ANG(p2, A), ANG(p2, B)], k: 1 }],
   [{ arc: [...O, R, ANG(O, A), ANG(O, C)], k: 1 },
    { arc: [...O1, R, ANG(O1, B), ANG(O1, D)], k: 1 },
    { arc: [...p1, rho, ANG(p1, D), ANG(p1, C)], k: 1 },
    { arc: [...p2, rho, ANG(p2, A), ANG(p2, B)], k: 1 }]
  ];
 },
 /* Овоид (сурах бичиг х.16, 1.10 зураг) */
 ovoid() {
  const R = 80, O = [CX, 140];
  const O2 = [O[0] - R, O[1]], O3 = [O[0] + R, O[1]], O1 = [O[0], O[1] + R];
  const R2 = 2 * R;
  const u3 = UNIT(O3, O1), u2 = UNIT(O2, O1);
  const q1 = ADD(O3, MUL(u3, R2));      /* 1 — зүүн доод */
  const q2 = ADD(O2, MUL(u2, R2));      /* 2 — баруун доод */
  const R3 = DIST(O1, q1);
  return [
   [{ c: [...O, R] }, { l: [O[0] - R - 18, O[1], O[0] + R + 18, O[1]], dash: 1 },
    { l: [O[0], O[1] - R - 18, O[0], O[1] + R + 70], dash: 1 }, { p: [...O, 'O'] }],
   [{ p: [...O2, 'O₂'] }, { p: [...O3, 'O₃'] }, { p: [...O1, 'O₁'] }],
   [{ l: [...O2, ...ADD(O2, MUL(u2, R2 + 14))], dash: 1 },
    { l: [...O3, ...ADD(O3, MUL(u3, R2 + 14))], dash: 1 }],
   [{ arc: [...O3, R2, ANG(O3, q1), 180], k: 1 }, { p: [...q1, '1'] }],
   [{ arc: [...O2, R2, 0, ANG(O2, q2)], k: 1 }, { p: [...q2, '2'] }],
   [{ arc: [...O, R, 180, 360], k: 1 },
    { arc: [...O3, R2, ANG(O3, q1), 180], k: 1 },
    { arc: [...O2, R2, 0, ANG(O2, q2)], k: 1 },
    { arc: [...O1, R3, ANG(O1, q2), ANG(O1, q1)], k: 1 }]
  ];
 },
 /* Хоёр нумыг шулуунаар дөлгөөн холбох (сурах бичиг х.16, 1.9 зураг) */
 arc2() {
  const O2 = [120, 205], R2 = 70, O1 = [288, 205], R1 = 35;
  const dr = R2 - R1, dd = DIST(O2, O1);
  const nx = dr / dd, ny = -Math.sqrt(Math.max(0, 1 - nx * nx));
  const n = [nx, ny];
  const T2 = ADD(O2, MUL(n, R2)), T1 = ADD(O1, MUL(n, R1));
  const Ta = ADD(O2, MUL(n, dr));
  const ut = UNIT(T2, T1);
  return [
   [{ c: [...O2, R2] }, { c: [...O1, R1] }, { p: [...O2, 'O₂'] }, { p: [...O1, 'O₁'] }],
   [{ c: [...O2, dr], dash: 1 }, { t: [O2[0] - 66, O2[1] + 34, 'R₂−R₁', 13] }],
   [{ l: [...ADD(Ta, MUL(ut, -34)), ...ADD(O1, MUL(ut, 26))], dash: 1 }, { p: [...Ta, ''] }],
   [{ l: [...O2, ...T2], dash: 1 }, { l: [...O1, ...T1], dash: 1 },
    { p: [...T2, '1'] }, { p: [...T1, '2'] }],
   [{ c: [...O2, R2] }, { c: [...O1, R1] }, { l: [...T2, ...T1], k: 1 },
    { p: [...T2, '1'] }, { p: [...T1, '2'] }]
  ];
 },
 /* Хоёр шулууныг нумаар холбох (сурах бичиг х.17) */
 tll() {
  const V = [60, 292], R = 70, a2 = -55;
  const u1 = [1, 0], u2 = DIR(a2);
  const n2 = [-u2[1], u2[0]];                       /* өнцгийн дотор тал */
  const n2i = (n2[0] * 0.9 + n2[1] * -0.45 > 0) ? n2 : MUL(n2, -1);
  const q1 = [V[0], V[1] - R];                      /* 1-р шулууны параллель */
  const q2 = ADD(V, MUL(n2i, R));
  const O = lineLine(q1, u1, q2, u2);
  const A1 = foot(O, V, u1), A2 = foot(O, V, u2);
  return [
   [{ l: [...V, V[0] + 285, V[1]] }, { l: [...V, ...ADD(V, MUL(u2, 270))] }, { p: [...V, ''] }],
   [{ l: [q1[0], q1[1], q1[0] + 285, q1[1]], dash: 1 },
    { l: [...q2, ...ADD(q2, MUL(u2, 260))], dash: 1 }],
   [{ p: [...O, 'O'] }],
   [{ l: [...O, ...A1], dash: 1 }, { l: [...O, ...A2], dash: 1 },
    { p: [...A1, 'A₁'] }, { p: [...A2, 'A₂'] }],
   [{ arc: [...O, R, ANG(O, A1), ANG(O, A2)], k: 1 }, { t: [O[0] - 10, O[1] - 12, 'R', 14] }]
  ];
 },
 /* Тойрог, шулууныг нумаар холбох (сурах бичиг х.18) */
 tcl() {
  const C = [118, 138], r = 55, ly = 292, R = 65;
  const u = [1, 0];
  const O = lineCircle([30, ly - R], u, C, r + R, 1);
  const T2 = foot(O, [30, ly], u), T1 = ADD(C, MUL(UNIT(C, O), r));
  return [
   [{ c: [...C, r] }, { p: [...C, 'C'] }, { l: [30, ly, 338, ly] }],
   [{ l: [30, ly - R, 338, ly - R], dash: 1 }, { t: [36, ly - R - 8, 'R', 13] }],
   [{ arc: [...C, r + R, -20, 84], dash: 0 }, { t: [C[0] + 44, C[1] + 74, 'r+R', 13] }],
   [{ p: [...O, 'O'] }],
   [{ l: [...O, ...T2], dash: 1 }, { l: [...O, ...C], dash: 1 },
    { p: [...T1, 'A₁'] }, { p: [...T2, 'A₂'] }],
   [{ arc: [...O, R, ANG(O, T2), ANG(O, T1)], k: 1 }]
  ];
 },
 /* Куб биетийн тойм зураг (сурах бичиг х.20, 1.21 зураг) */
 cube7() {
  const O = [CX, 180], a = 100, ax = ISO;
  const q = cubeQuarter(O, ax, a);
  const B = q.base, T = q.top;
  const hex = [T[0], T[1], B[1], B[2], B[3], T[3]];
  return [
   [{ l: [...O, ...ADD(O, MUL(ax.x, a + 34))], dash: 1 },
    { l: [...O, ...ADD(O, MUL(ax.y, a + 34))], dash: 1 },
    { l: [...O, ...ADD(O, MUL(ax.z, a + 34))], dash: 1 },
    { t: [O[0] - a - 52, O[1] + 60, 'x', 14] }, { t: [O[0] + a + 40, O[1] + 60, 'y', 14] },
    { t: [O[0] + 8, O[1] - a - 36, 'z', 14] }],
   [{ p: [...B[1], ''] }, { p: [...B[3], ''] }, { p: [...T[0], ''] },
    { t: [O[0] - 74, O[1] + 4, '50мм', 12] }],
   [{ l: [...B[0], ...B[1]], dash: 1 }, { l: [...B[1], ...B[2]], dash: 1 },
    { l: [...B[2], ...B[3]], dash: 1 }, { l: [...B[3], ...B[0]], dash: 1 }],
   [{ l: [...B[1], ...T[1]], dash: 1 }, { l: [...B[2], ...T[2]], dash: 1 },
    { l: [...B[3], ...T[3]], dash: 1 }],
   [{ poly: hex, k: 1 },
    { l: [...T[2], ...T[1]], k: 1 }, { l: [...T[2], ...T[3]], k: 1 }, { l: [...T[2], ...B[2]], k: 1 }]
  ];
 },

/* ═══════════ 8-р АНГИ ═══════════ */
 /* Нэгдсэн ортогональ проекц (сурах бичиг х.10–11) */
 ort() {
  /* π₂ нүүрний (зүүн дээд), π₁ хэвтээ (доор), π₃ хажуугийн (баруун) */
  const x0 = 58, y0 = 52, w = 96, h = 76, dp = 62, gx = 42, gy = 44;
  const fr = [[x0, y0 + h], [x0 + w, y0 + h], [x0 + w, y0 + 32], [x0 + 52, y0 + 32], [x0 + 52, y0], [x0, y0]];
  const ty = y0 + h + gy;
  const tp = [[x0, ty], [x0 + w, ty], [x0 + w, ty + dp], [x0, ty + dp]];
  const sx = x0 + w + gx;
  const sd = [[sx, y0 + h], [sx + dp, y0 + h], [sx + dp, y0], [sx, y0]];
  return [
   [{ l: [x0 - 18, y0 + h + gy / 2, sx + dp + 16, y0 + h + gy / 2], dash: 1 },
    { l: [x0 + w + gx / 2, y0 - 16, x0 + w + gx / 2, ty + dp + 12], dash: 1 },
    { t: [x0 - 6, y0 - 20, 'π₂ нүүрний', 13] }],
   [{ poly: fr, k: 1 }],
   [{ t: [x0 - 6, ty - 8, 'π₁ хэвтээ', 13] }, { poly: tp, k: 1 },
    { l: [x0 + 52, ty, x0 + 52, ty + dp], dash: 1 }],
   [{ t: [sx - 4, y0 - 20, 'π₃ хажуугийн', 13] }, { poly: sd, k: 1 },
    { l: [sx, y0 + 32, sx + dp, y0 + 32], dash: 1 }],
   [{ l: [x0, y0 + h, x0, ty], dash: 1 }, { l: [x0 + w, y0 + h, x0 + w, ty], dash: 1 },
    { l: [x0 + 52, y0 + 32, x0 + 52, ty], dash: 1 },
    { l: [x0 + w, y0, sx, y0], dash: 1 }, { l: [x0 + w, y0 + h, sx, y0 + h], dash: 1 },
    { l: [x0 + w, y0 + 32, sx, y0 + 32], dash: 1 }]
  ];
 },
 /* Изометр ба диметрийн тэнхлэг (сурах бичиг х.15–16) */
 axes() {
  const L = [98, 178], Rt = [268, 178], n = 88;
  const ia = ISO, da = DIM;
  return [
   [{ l: [...L, ...ADD(L, MUL(ia.z, n + 14))], k: 1 }, { t: [L[0] + 8, L[1] - n - 18, 'z', 15] },
    { t: [L[0] - 42, L[1] - n - 44, 'ИЗОМЕТР', 13] }],
   [{ l: [...L, ...ADD(L, MUL(ia.x, n))], k: 1 }, { l: [...L, ...ADD(L, MUL(ia.y, n))], k: 1 },
    { t: [L[0] - n - 22, L[1] + n / 2 + 16, 'x', 15] }, { t: [L[0] + n - 4, L[1] + n / 2 + 22, 'y', 15] },
    { arc: [...L, 34, 150, 270], dash: 1 }, { t: [L[0] - 40, L[1] - 18, '120°', 12] }],
   [{ t: [L[0] - 30, L[1] + n + 34, '1 : 1 : 1', 13] }],
   [{ l: [...Rt, ...ADD(Rt, MUL(da.z, n + 14))], k: 1 }, { t: [Rt[0] + 8, Rt[1] - n - 18, 'z', 15] },
    { t: [Rt[0] - 36, Rt[1] - n - 44, 'ДИМЕТР', 13] },
    { l: [...Rt, ...ADD(Rt, MUL(da.x, n))], k: 1 }, { t: [Rt[0] - n - 20, Rt[1] + 6, 'x', 15] },
    { arc: [...Rt, 26, 180, 270], dash: 1 }, { t: [Rt[0] - 48, Rt[1] - 26, '90°', 12] }],
   [{ l: [...Rt, ...ADD(Rt, MUL(da.y, n))], k: 1 },
    { t: [Rt[0] + n * 0.72 + 8, Rt[1] + n * 0.72 + 6, 'y', 15] },
    { arc: [...Rt, 34, 0, 45], dash: 1 }, { t: [Rt[0] + 30, Rt[1] + 30, '45°', 12] }],
   [{ t: [Rt[0] - 34, Rt[1] + n + 34, '1 : 0,5 : 1', 13] }]
  ];
 },
 iso() { return cubeSteps(ISO, 100); },
 dim() { return cubeSteps(DIM, 112); },

/* ═══════════ 9-р АНГИ ═══════════ */
 /* Огтлолыг дүрслэх (сурах бичиг х.7) */
 sect() {
  const x0 = 40, y0 = 70, w = 108, h = 118, hr = 26;
  const cx = x0 + w / 2, cy = y0 + h / 2;
  const sx = 208;
  return [
   [{ poly: [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], k: 1 },
    { c: [cx, cy, hr] }],
   [{ l: [x0 - 14, cy, x0 + w + 14, cy], dash: 1 }, { l: [cx, y0 - 14, cx, y0 + h + 14], dash: 1 }],
   [{ dd: [x0 - 20, cy, x0 + w + 20, cy] },
    { ar: [x0 - 12, cy - 26, x0 - 12, cy - 4] }, { ar: [x0 + w + 12, cy - 26, x0 + w + 12, cy - 4] },
    { t: [x0 - 24, cy - 32, 'А', 15] }, { t: [x0 + w + 6, cy - 32, 'А', 15] }],
   [{ poly: [[sx, y0], [sx + w, y0], [sx + w, y0 + h], [sx, y0 + h]], k: 1 },
    { l: [sx, cy - hr, sx + w, cy - hr] }, { l: [sx, cy + hr, sx + w, cy + hr] },
    { t: [sx + w / 2 - 20, y0 - 14, 'А–А', 15] }],
   [{ hp: [[[sx, y0], [sx + w, y0], [sx + w, cy - hr], [sx, cy - hr]], 45] },
    { hp: [[[sx, cy + hr], [sx + w, cy + hr], [sx + w, y0 + h], [sx, y0 + h]], 45] },
    { t: [sx + 26, y0 + h + 24, '45°', 13] }],
   [{ t: [x0, y0 + h + 50, 'Хүрээтэй давхцвал 30° / 60°', 13] },
    { t: [x0, y0 + h + 72, 'MNS ISO 128-40:2004', 12] }]
  ];
 },
 /* Байдлын хагасыг зүсэлтийн хагастай хамтруулах (сурах бичиг х.10) */
 half() {
  const cx = CX, cy = 176, Rw = 106, h = 124;
  const hr = 30, y0 = cy - h / 2, y1 = cy + h / 2;
  return [
   [{ poly: [[cx - Rw, y0], [cx + Rw, y0], [cx + Rw, y1], [cx - Rw, y1]], k: 1 }],
   [{ l: [cx, y0 - 20, cx, y1 + 20], dash: 1 }, { l: [cx - Rw - 16, cy, cx + Rw + 16, cy], dash: 1 }],
   /* далд нүх зөвхөн байдлын хагаст тасархайгаар харагдана */
   [{ arc: [cx, cy, hr, 90, 270], dash: 1 },
    { l: [cx - Rw, cy - hr, cx, cy - hr], dash: 1 }, { l: [cx - Rw, cy + hr, cx, cy + hr], dash: 1 },
    { t: [cx - Rw, y0 - 14, 'байдал', 13] }],
   [{ l: [cx, cy - hr, cx + Rw, cy - hr] }, { l: [cx, cy + hr, cx + Rw, cy + hr] },
    { t: [cx + 30, y0 - 14, 'зүсэлт', 13] }],
   [{ hp: [[[cx, y0], [cx + Rw, y0], [cx + Rw, cy - hr], [cx, cy - hr]], 45] },
    { hp: [[[cx, cy + hr], [cx + Rw, cy + hr], [cx + Rw, y1], [cx, y1]], 45] }],
   [{ l: [cx, y0, cx, y1], k: 1 }, { t: [cx - 72, y1 + 34, 'тэгш хэмийн тэнхлэгээр хиллүүлнэ', 12] }]
  ];
 },
 /* Тойргийн изометрийг эллипсээр — дөрвөн төв (сурах бичиг х.11–12, 1.17 зураг) */
 ell() {
  const b = 67.2, a = b * Math.sqrt(3);          /* 0,71d/2 ба 1,22d/2 — харьцаа √3 */
  const O = [CX, 178];
  const A = [O[0] - a, O[1]], B = [O[0] + a, O[1]];
  const C = [O[0], O[1] - b], D = [O[0], O[1] + b];
  const O1 = [O[0], O[1] - a], O2 = [O[0], O[1] + a];
  const O3 = [O[0] - b, O[1]], O4 = [O[0] + b, O[1]];
  const Rb = a + b, Rs = a - b;
  const J = (c1, c2) => ADD(c1, MUL(UNIT(c1, c2), Rb));
  const jTR = J(O2, O4), jTL = J(O2, O3), jBR = J(O1, O4), jBL = J(O1, O3);
  return [
   [{ l: [O[0] - a - 20, O[1], O[0] + a + 20, O[1]], dash: 1 },
    { l: [O[0], O[1] - a - 20, O[0], O[1] + a + 20], dash: 1 },
    { t: [O[0] - a - 16, O[1] - 10, 'их тэнхлэг', 12] }, { t: [O[0] + 8, O[1] - a - 8, 'z', 14] }],
   [{ c: [...O, b] }, { p: [...C, 'C'] }, { p: [...D, 'D'] },
    { p: [...O3, 'O₃'] }, { p: [...O4, 'O₄'] }, { t: [O[0] - 34, O[1] + b + 22, 'd×0,71', 13] }],
   [{ c: [...O, a] }, { p: [...A, 'A'] }, { p: [...B, 'B'] },
    { p: [...O1, 'O₁'] }, { p: [...O2, 'O₂'] }, { t: [O[0] - 34, O[1] + a + 24, 'd×1,22', 13] }],
   [{ l: [...O1, ...O3], dash: 1 }, { l: [...O1, ...O4], dash: 1 },
    { l: [...O2, ...O3], dash: 1 }, { l: [...O2, ...O4], dash: 1 }],
   [{ arc: [...O2, Rb, ANG(O2, jTL), ANG(O2, jTR)], k: 1 },
    { arc: [...O1, Rb, ANG(O1, jBR), ANG(O1, jBL)], k: 1 }],
   [{ arc: [...O2, Rb, ANG(O2, jTL), ANG(O2, jTR)], k: 1 },
    { arc: [...O1, Rb, ANG(O1, jBR), ANG(O1, jBL)], k: 1 },
    { arc: [...O3, Rs, ANG(O3, jBL), ANG(O3, jTL)], k: 1 },
    { arc: [...O4, Rs, ANG(O4, jTR), ANG(O4, jBR)], k: 1 }]
  ];
 },
 /* Аксонометр проекцыг ¼ зүсэлттэй дүрслэх (сурах бичиг х.12, 1.19–1.20) */
 cut4() {
  const O = [CX, 172], a = 100, q = cubeQuarter(O, ISO, a);
  const B = q.base, T = q.top;
  const hex = [T[0], T[1], B[1], B[2], B[3], T[3]];
  return [
   [{ poly: hex, k: 1 }, { l: [...T[2], ...T[1]] }, { l: [...T[2], ...T[3]] }, { l: [...T[2], ...B[2]] }],
   [{ poly: q.lface, dash: 1 }],
   [{ l: [...q.mids[1], ...q.mids[4]], dash: 1 }, { l: [...q.mids[4], ...q.mids[2]], dash: 1 }]
     .concat(q.mids.map(m => ({ p: [...m, ''] }))),
   [{ poly: q.hull, k: 1 }].concat(q.inner.map(e => ({ l: [...e[0], ...e[1]], k: 1 })))
     .concat([{ l: [...q.lface[2], ...q.lface[3]], k: 1 }, { l: [...q.lface[3], ...q.lface[4]], k: 1 }]),
   [{ hp: [q.f1, 60] }, { hp: [q.f2, 120] }],
   [{ t: [O[0] - 96, O[1] + a + 58, 'эсрэг тэнхлэгт перпендикуляр зураас', 12] }]
  ];
 }
};

/* шоо + ¼ хэсэг: 8 алхам (сурах бичиг VIII анги, Хүснэгт 1.2) */
function cubeSteps(ax, a) {
  const O = (ax === DIM) ? [CX + 36, 208] : [CX, 168];
  const q = cubeQuarter(O, ax, a);
  const B = q.base, T = q.top;
  const hex = hull2(B.concat(T));           /* бүтэн шооны гадна тойм */
  return [
   [{ l: [...O, ...ADD(O, MUL(ax.x, a + 30))], dash: 1 },
    { l: [...O, ...ADD(O, MUL(ax.y, a * ax.ky + 30))], dash: 1 },
    { l: [...O, ...ADD(O, MUL(ax.z, a + 30))], dash: 1 }],
   [{ poly: B }],
   [{ l: [...B[0], ...T[0]] }, { l: [...B[1], ...T[1]] }, { l: [...B[2], ...T[2]] }, { l: [...B[3], ...T[3]] }],
   [{ p: [...T[0], ''] }, { p: [...T[1], ''] }, { p: [...T[2], ''] }, { p: [...T[3], ''] }],
   [{ poly: T }, { poly: hex, k: 1 },
    { l: [...T[2], ...T[1]], k: 1 }, { l: [...T[2], ...T[3]], k: 1 }, { l: [...T[2], ...B[2]], k: 1 }],
   q.mids.map(m => ({ p: [...m, ''] })),
   [{ l: [...q.mids[1], ...q.mids[4]], dash: 1 }, { l: [...q.mids[4], ...q.mids[2]], dash: 1 },
    { l: [...q.mids[4], ...q.inner[0][1]], dash: 1 }],
   [{ poly: q.hull, k: 1 }, { poly: q.lface, k: 1 }]
     .concat(q.inner.map(e => ({ l: [...e[0], ...e[1]], k: 1 })))
  ];
}

/* ── SVG элемент ── */
/* clipPath-ийн id хуудсанд давхардвал зураасалт хөрш зурагт гоожино — тиймээс хэзээ ч тэглэхгүй */
let HID = 0;
const HTAG = 'g' + Math.random().toString(36).slice(2, 7);
function svgPart(d, hot) {
  const col = hot ? '#e05a3a' : '#2f6f8f', w = hot ? 2.6 : 1.8;
  const f = n => n.toFixed(1);
  if (d.c) return `<circle cx="${f(d.c[0])}" cy="${f(d.c[1])}" r="${f(d.c[2])}" fill="none" stroke="${d.dash ? '#9fb0bf' : col}" stroke-width="${d.dash ? 1.3 : w}"${d.dash ? ' stroke-dasharray="7 5"' : ''}/>`;
  if (d.l) return `<line x1="${f(d.l[0])}" y1="${f(d.l[1])}" x2="${f(d.l[2])}" y2="${f(d.l[3])}" stroke="${d.dash ? '#9fb0bf' : col}" stroke-width="${d.dash ? 1.3 : w}"${d.dash ? ' stroke-dasharray="7 5"' : ''}/>`;
  if (d.dd) /* цэгтэй тасалдсан огтлогч хавтгай */
    return `<line x1="${f(d.dd[0])}" y1="${f(d.dd[1])}" x2="${f(d.dd[2])}" y2="${f(d.dd[3])}" stroke="${col}" stroke-width="2.8" stroke-dasharray="16 4 2 4"/>`;
  if (d.ar) { /* сум */
    const [x1, y1, x2, y2] = d.ar, an = Math.atan2(y2 - y1, x2 - x1);
    const s = 7, p1 = [x2 - s * Math.cos(an - 0.4), y2 - s * Math.sin(an - 0.4)],
          p2 = [x2 - s * Math.cos(an + 0.4), y2 - s * Math.sin(an + 0.4)];
    return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="2"/>` +
      `<polygon points="${f(x2)},${f(y2)} ${f(p1[0])},${f(p1[1])} ${f(p2[0])},${f(p2[1])}" fill="${col}"/>`;
  }
  if (d.arc) {
    const [cx, cy, r, a1, a2] = d.arc, s = P(cx, cy, r, a1), e = P(cx, cy, r, a2);
    const big = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
    return `<path d="M ${f(s[0])} ${f(s[1])} A ${f(r)} ${f(r)} 0 ${big} 1 ${f(e[0])} ${f(e[1])}" fill="none" stroke="${col}" stroke-width="${w}" stroke-dasharray="${d.k ? 'none' : '3 3'}" opacity="${hot || d.k ? 1 : .5}"/>`;
  }
  if (d.poly) return `<polygon points="${d.poly.map(q => f(q[0]) + ',' + f(q[1])).join(' ')}" fill="${d.k ? (hot ? 'rgba(224,90,58,.10)' : 'rgba(47,111,143,.07)') : 'none'}" stroke="${d.dash ? '#9fb0bf' : col}" stroke-width="${d.dash ? 1.3 : w}"${d.dash ? ' stroke-dasharray="7 5"' : ''}/>`;
  if (d.hp) { /* 45°-ийн зураасалт, олон өнцөгтөөр хайчилсан */
    const [pts, deg] = d.hp, id = HTAG + (++HID);
    const xs2 = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    const x1 = Math.min(...xs2), x2 = Math.max(...xs2), y1 = Math.min(...ys), y2 = Math.max(...ys);
    const dia = Math.hypot(x2 - x1, y2 - y1), gap = 9, u = DIR(deg), n = [-u[1], u[0]];
    const mid = [(x1 + x2) / 2, (y1 + y2) / 2];
    let ls = '';
    for (let t = -dia; t <= dia; t += gap) {
      const b = ADD(mid, MUL(n, t));
      const s1 = ADD(b, MUL(u, -dia)), s2 = ADD(b, MUL(u, dia));
      ls += `<line x1="${f(s1[0])}" y1="${f(s1[1])}" x2="${f(s2[0])}" y2="${f(s2[1])}"/>`;
    }
    return `<clipPath id="${id}"><polygon points="${pts.map(q => f(q[0]) + ',' + f(q[1])).join(' ')}"/></clipPath>` +
      `<g clip-path="url(#${id})" stroke="${col}" stroke-width="1.2">${ls}</g>`;
  }
  if (d.t) return `<text x="${f(d.t[0])}" y="${f(d.t[1])}" font-size="${d.t[3] || 13}" font-weight="600" fill="${col}">${d.t[2]}</text>`;
  if (d.p) {
    const [x, y, lab] = d.p;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${hot ? 5 : 3.8}" fill="${col}"/>` +
      (lab ? `<text x="${f(x + 9)}" y="${f(y - 8)}" font-size="15" font-weight="700" fill="${col}">${lab}</text>` : '');
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
