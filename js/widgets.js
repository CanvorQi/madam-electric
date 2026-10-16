/*
 * Widgets - derslerin içine gömülen etkileşimli araçlar.
 * Her araç: Widgets[name](root, opts)  -> root içine kendi arayüzünü kurar.
 */
(function (global) {
    "use strict";

    const C = global.Ckt;

    function el(html) {
        const t = document.createElement("template");
        t.innerHTML = html.trim();
        return t.content.firstElementChild;
    }
    function tex(s, display) {
        if (global.katex) {
            try { return katex.renderToString(String(s), { throwOnError: false, displayMode: !!display }); } catch (e) { /* düz metne düş */ }
        }
        return String(s);
    }
    function esc(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    /* ---------------- Sayı biçimleri (ondalık virgül) ---------------- */
    function fmt(v, d) {
        if (!isFinite(v)) return v > 0 ? "∞" : "−∞";
        const r = Number(Number(v).toFixed(d === undefined ? 3 : d));
        return String(Object.is(r, -0) ? 0 : r).replace("-", "−").replace(".", ",");
    }
    // KaTeX içinde: 0{,}255
    const ft = (v, d) => fmt(v, d).replace("−", "-").replace(",", "{,}");
    const PREFIX = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"]];
    function eng(v, unit, n) {
        const u = unit ? unit : "";
        if (!isFinite(v)) return "∞" + (u ? " " + u : "");
        if (Math.abs(v) < 1e-15) return "0" + (u ? " " + u : "");
        const a = Math.abs(v);
        const p = PREFIX.find(([m]) => a >= m * 0.99995) || PREFIX[PREFIX.length - 1];
        const x = Number((v / p[0]).toPrecision(n || 4));
        return `${String(x).replace("-", "−").replace(".", ",")}${u || p[1] ? " " : ""}${p[1]}${u}`;
    }
    const engT = (v, unit, n) => eng(v, unit, n).replace("−", "-").replace(",", "{,}").replace("µ", "\\mu ").replace("Ω", "\\Omega").replace(/ /g, "\\,");
    function parseEng(s) {
        const m = String(s).trim().replace(",", ".").replace("−", "-").match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(G|M|k|K|m|u|µ|μ|n)?\s*[a-zA-ZΩ]*$/);
        if (!m) return NaN;
        const mult = { G: 1e9, M: 1e6, k: 1e3, K: 1e3, m: 1e-3, u: 1e-6, "µ": 1e-6, "μ": 1e-6, n: 1e-9 }[m[2]] || 1;
        return Number(m[1]) * mult;
    }
    // 1,87 × 10¹⁸
    function sci(v) {
        if (!v) return "0";
        const e = Math.floor(Math.log10(Math.abs(v)));
        const m = v / Math.pow(10, e);
        return `${fmt(m, 2)} \\times 10^{${e}}`;
    }

    /* ---------------- Ortak arayüz parçaları ---------------- */
    function slider(parent, o, onInput) {
        const show = o.format || ((v) => fmt(v, 3));
        const node = el(`<label class="ctrl"><span class="ctrl-label"><span>${o.label}</span><span class="val"></span></span>
            <input type="range" min="${o.min}" max="${o.max}" step="${o.step || 0.1}" value="${o.value}"></label>`);
        const input = node.querySelector("input"), val = node.querySelector(".val");
        const update = () => { val.innerHTML = show(Number(input.value)); };
        input.addEventListener("input", () => { update(); onInput(Number(input.value)); });
        update();
        parent.appendChild(node);
        return { node, input, get: () => Number(input.value), set: (v) => { input.value = v; update(); } };
    }

    function chips(parent, labels, active, onChange) {
        const row = el(`<div class="chip-row"></div>`);
        const btns = labels.map((lb, i) => {
            const b = el(`<button type="button" class="chip${i === active ? " active" : ""}">${lb}</button>`);
            b.addEventListener("click", () => {
                btns.forEach((x) => x.classList.remove("active"));
                b.classList.add("active");
                onChange(i);
            });
            row.appendChild(b);
            return b;
        });
        parent.appendChild(row);
        return { row, btns, set: (i) => btns.forEach((x, j) => x.classList.toggle("active", i === j)) };
    }

    const badge = (p, tol) => Math.abs(p) < (tol || 1e-9) ? `<span class="badge zero">Güç yok</span>`
        : p > 0 ? `<span class="badge abs">Güç alıyor (çekiyor)</span>` : `<span class="badge sup">Güç veriyor</span>`;

    /* ---------------- Basit SVG grafik ---------------- */
    let plotId = 0;
    function plot(o) {
        const w = o.w || 420, h = o.h || 200, pl = o.pl || 46, pr = 14, pt = 14, pb = 30;
        const X = (x) => pl + (x - o.x[0]) / (o.x[1] - o.x[0]) * (w - pl - pr);
        const Y = (y) => h - pb - (y - o.y[0]) / (o.y[1] - o.y[0]) * (h - pt - pb);
        const r = (n) => Math.round(n * 10) / 10;
        const id = "pc" + (++plotId);
        let s = `<defs><clipPath id="${id}"><rect x="${pl}" y="${pt - 2}" width="${w - pl - pr}" height="${h - pt - pb + 4}"/></clipPath></defs>`;
        (o.xt || []).forEach((t) => { s += `<line class="grid" x1="${r(X(t))}" x2="${r(X(t))}" y1="${pt}" y2="${h - pb}"/><text x="${r(X(t))}" y="${h - pb + 14}" text-anchor="middle">${fmt(t)}</text>`; });
        (o.yt || []).forEach((t) => { s += `<line class="grid" x1="${pl}" x2="${w - pr}" y1="${r(Y(t))}" y2="${r(Y(t))}"/><text x="${pl - 6}" y="${r(Y(t)) + 4}" text-anchor="end">${fmt(t)}</text>`; });
        const y0 = o.y[0] <= 0 && o.y[1] >= 0 ? Y(0) : h - pb;
        s += `<line class="axis" x1="${pl}" x2="${w - pr}" y1="${r(y0)}" y2="${r(y0)}"/><line class="axis" x1="${pl}" x2="${pl}" y1="${pt}" y2="${h - pb}"/>`;
        if (o.xl) s += `<text class="axl" x="${w - pr}" y="${r(y0) - 6}" text-anchor="end">${o.xl}</text>`;
        if (o.yl) s += `<text class="axl" x="${pl + 6}" y="${pt + 4}" text-anchor="start">${o.yl}</text>`;
        s += `<g clip-path="url(#${id})">`;
        (o.series || []).forEach((se) => { s += `<polyline class="${se.c || "s1"}" points="${se.pts.map(([x, y]) => `${r(X(x))},${r(Y(y))}`).join(" ")}"/>`; });
        if (o.vline !== undefined) s += `<line class="cursor" x1="${r(X(o.vline))}" x2="${r(X(o.vline))}" y1="${pt}" y2="${h - pb}"/>`;
        (o.marks || []).forEach((m) => { s += `<circle class="mk" cx="${r(X(m[0]))}" cy="${r(Y(m[1]))}" r="5.5"/>`; });
        s += `</g>`;
        (o.labels || []).forEach((lb) => { s += `<text x="${r(X(lb.x))}" y="${r(Y(lb.y))}" text-anchor="${lb.a || "start"}" class="axl">${lb.s}</text>`; });
        return `<svg class="plt" viewBox="0 0 ${w} ${h}" style="max-width:${w}px">${s}</svg>`;
    }

    const W = {};

    /* ---------------- Pil + direnç devresi: elektronlar ve akım ---------------- */
    W.circuitLoop = function (root, o) {
        const st = { V: o.V === undefined ? 1.5 : o.V, R1: o.R1 === undefined ? 5 : o.R1, R2: o.R2, mode: o.mode || 0 };
        const two = st.R2 !== undefined;
        const box = el(`<div class="controls"></div>`);
        root.appendChild(box);
        slider(box, { label: "Pil gerilimi V", min: 0, max: o.Vmax || 12, step: 0.5, value: st.V, format: (v) => eng(v, "V") }, (v) => { st.V = v; update(); });
        slider(box, { label: two ? "Direnç R₁" : "Direnç R", min: 1, max: 100, step: 1, value: st.R1, format: (v) => eng(v, "Ω") }, (v) => { st.R1 = v; update(); });
        if (two) slider(box, { label: "Direnç R₂", min: 1, max: 100, step: 1, value: st.R2, format: (v) => eng(v, "Ω") }, (v) => { st.R2 = v; update(); });
        const modeRow = el(`<div style="margin-top:12px"></div>`);
        root.appendChild(modeRow);
        chips(modeRow, ["e⁻ Elektronların hareketi", "⊕ Akımın (geleneksel) yönü"], st.mode, (i) => { st.mode = i; update(); });
        const stage = el(`<div class="ckt-wrap" style="margin-top:10px"></div>`);
        root.appendChild(stage);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);

        const L = 50, Rr = 330, T = 40, B = 180;
        const corners = [[L, B], [L, T], [Rr, T], [Rr, B], [L, B]];
        const segs = [];
        let P = 0;
        for (let k = 0; k < 4; k++) {
            const [x1, y1] = corners[k], [x2, y2] = corners[k + 1];
            const len = Math.hypot(x2 - x1, y2 - y1);
            segs.push({ x1, y1, x2, y2, s0: P, len });
            P += len;
        }
        const pos = (s) => {
            s = ((s % P) + P) % P;
            const g = segs.find((q) => s >= q.s0 && s < q.s0 + q.len) || segs[3];
            const f = (s - g.s0) / g.len;
            return [g.x1 + (g.x2 - g.x1) * f, g.y1 + (g.y2 - g.y1) * f];
        };
        const N = 18;
        let dots = [], I = 0;

        function update() {
            const RT = st.R1 + (two ? st.R2 : 0);
            I = st.V / RT;
            const items = [
                { t: "bat", a: [L, B], b: [L, T], plus: "b", label: eng(st.V, "V"), side: "l" },
                { t: "A", a: [Rr, T], b: [Rr, B], label: ["Ampermetre", eng(I, "A")], side: "r" },
                { t: "w", p: [[Rr, B], [L, B]] },
                { t: "arr", p: [190, B], d: "l", label: "I", side: "b" },
            ];
            if (two) items.push({ t: "R", a: [L, T], b: [190, T], label: `R_1 = ${eng(st.R1, "Ω")}` }, { t: "R", a: [190, T], b: [Rr, T], label: `R_2 = ${eng(st.R2, "Ω")}` });
            else items.push({ t: "R", a: [L, T], b: [Rr, T], label: `R = ${eng(st.R1, "Ω")}` });
            const dotCls = st.mode === 0 ? "e-dot" : "q-dot";
            stage.innerHTML = `<svg class="ckt" viewBox="0 0 440 215" style="max-width:440px"><g data-dots></g>${items.map(C.item).join("")}</svg>`;
            const g = stage.querySelector("[data-dots]");
            dots = Array.from({ length: N }, () => {
                const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                c.setAttribute("r", st.mode === 0 ? 4 : 4.5);
                c.setAttribute("class", dotCls);
                g.appendChild(c);
                return c;
            });
            place();
            const perSec = I / 1.602e-19;
            out.innerHTML = `${tex(`R_T = ${two ? `R_1 + R_2 = ${ft(st.R1)} + ${ft(st.R2)} = ` : ""}${ft(RT)}\\,\\Omega`)}<br>
                ${tex(`I = \\dfrac{V}{R_T} = \\dfrac{${ft(st.V)}}{${ft(RT)}} = ${engT(I, "A")}`)} &nbsp; · &nbsp; ${tex(`P = V \\cdot I = ${engT(st.V * I, "W")}`)}
                ${two ? `<br>${tex(`V_{R_1} = I R_1 = ${engT(I * st.R1, "V")}`)}, &nbsp; ${tex(`V_{R_2} = I R_2 = ${engT(I * st.R2, "V")}`)} <span class="muted">(toplamı pilin gerilimi)</span>` : ""}
                <br>Her saniyede bir kesitten geçen yük: ${tex(`q = I \\cdot t = ${engT(I, "C")}`)} ≈ ${tex(sci(perSec))} elektron.
                <br><span class="muted">${st.mode === 0 ? "Mavi noktalar elektronlar: pilin <b>−</b> ucundan çıkıp <b>+</b> ucuna giderler." : "Turuncu noktalar “pozitif yük” gibi düşünülür: akım, pilin <b>+</b> ucundan çıkıp devreyi dolaşarak <b>−</b> ucuna döner. Elektronlarla tam ters yön!"}</span>`;
        }

        let off = 0, last = performance.now();
        const reduce = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
        function place() { dots.forEach((c, k) => { const [x, y] = pos(off + (k * P) / N); c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1)); }); }
        function frame(now) {
            if (!root.isConnected) return;
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (!reduce) {
                const speed = Math.min(220, I * 45);
                off += (st.mode === 0 ? -1 : 1) * speed * dt;
                place();
            }
            requestAnimationFrame(frame);
        }
        update();
        requestAnimationFrame(frame);
    };

    /* ---------------- Güç alan / veren eleman (pasif işaret yöntemi) ---------------- */
    W.powerSign = function (root, o) {
        const st = { v: o.v === undefined ? 3 : o.v, i: o.i === undefined ? 2 : o.i, enter: o.enter !== false };
        const pre = el(`<div></div>`);
        root.appendChild(pre);
        const presetChips = chips(pre, ["Şekil (a): akım + uçtan giriyor", "Şekil (b): akım + uçtan çıkıyor"], st.enter ? 0 : 1, (k) => {
            st.v = 3; st.i = 2; st.enter = k === 0; sv.set(3); si.set(2); update();
        });
        const box = el(`<div class="controls"></div>`);
        root.appendChild(box);
        const sv = slider(box, { label: "Gerilim v (A ucu B'ye göre)", min: -12, max: 12, step: 1, value: st.v, format: (v) => eng(v, "V") }, (v) => { st.v = v; presetChips.set(-1); update(); });
        const si = slider(box, { label: "Akım i (ok yönünde)", min: -5, max: 5, step: 0.5, value: st.i, format: (v) => eng(v, "A") }, (v) => { st.i = v; presetChips.set(-1); update(); });
        const dirRow = el(`<div style="margin-top:10px"></div>`);
        root.appendChild(dirRow);
        const dirBtn = el(`<button type="button" class="btn small ghost">⇄ Akım okunu ters çevir</button>`);
        dirRow.appendChild(dirBtn);
        dirBtn.addEventListener("click", () => { st.enter = !st.enter; presetChips.set(-1); update(); });
        const stage = el(`<div class="ckt-wrap" style="margin-top:10px"></div>`);
        root.appendChild(stage);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);

        function update() {
            const items = [
                { t: "rect", x: 14, y: 22, w: 40, h: 156 },
                { t: "txt", p: [34, 100], s: "devre", tc: "val" },
                { t: "w", p: [[54, 40], [250, 40]] },
                { t: "w", p: [[250, 160], [54, 160]] },
                { t: "box", a: [250, 40], b: [250, 160], inner: "?", label: ["eleman"], side: "r" },
                { t: "term", p: [100, 40] }, { t: "term", p: [100, 160] },
                { t: "txt", p: [100, 24], s: "A", tc: "big" }, { t: "txt", p: [100, 180], s: "B", tc: "big" },
                { t: "pm", p: [100, 64], s: "+" }, { t: "txt", p: [100, 100], s: `v = ${eng(st.v, "V")}` }, { t: "pm", p: [100, 136], s: "-" },
                { t: "arr", p: [180, 40], d: st.enter ? "r" : "l", label: `i = ${eng(st.i, "A")}` },
                { t: "arr", p: [180, 160], d: st.enter ? "l" : "r" },
            ];
            stage.innerHTML = C.svg({ w: 340, h: 200, items });
            const p = (st.enter ? 1 : -1) * st.v * st.i;
            const rule = st.enter ? `Akım okunun ucu <b>+</b> işaretli uçtan <b>giriyor</b> → ${tex("p = +v \\cdot i")}` : `Akım okunun ucu <b>+</b> işaretli uçtan <b>çıkıyor</b> → ${tex("p = -v \\cdot i")}`;
            out.innerHTML = `${rule}<br>${tex(`p = ${st.enter ? "" : "-"}(${ft(st.v)})(${ft(st.i)}) = ${ft(p)}\\,\\text{W}`)} &nbsp; ${badge(p)}
                <br><span class="muted">${Math.abs(p) < 1e-9 ? "Gerilim ya da akım sıfır: eleman ne güç alıyor ne veriyor." : p > 0 ? "Pozitif güç: eleman dışarıdan enerji alıp harcıyor ya da depoluyor (direnç, şarj olan pil gibi)." : "Negatif güç: eleman devreye enerji veriyor (kaynak gibi davranıyor)."}${st.i < 0 ? " Akım negatif çıktı: gerçek akım, okun tersi yönde akıyor." : ""}${st.v < 0 ? " Gerilim negatif: gerçekte B ucu A'dan daha yüksek potansiyelde." : ""}</span>`;
        }
        update();
    };

    /* ---------------- Enerji grafiğinden güç ve akım ---------------- */
    W.energyPlot = function (root, o) {
        const pts = o.pts || [[0, 0], [2, 10], [4, 10], [6, 0]];
        const V = o.V || 10;
        const tmax = pts[pts.length - 1][0];
        const segs = [];
        for (let k = 0; k < pts.length - 1; k++) {
            const [t1, w1] = pts[k], [t2, w2] = pts[k + 1];
            segs.push({ t1, t2, w1, w2, p: (w2 - w1) / (t2 - t1) });
        }
        const at = (t) => {
            const s = segs.find((q) => t >= q.t1 && t <= q.t2) || segs[segs.length - 1];
            return { s, w: s.w1 + (s.w2 - s.w1) * ((t - s.t1) / (s.t2 - s.t1)) };
        };
        let t = o.t === undefined ? 0.5 : o.t;
        const box = el(`<div class="controls"></div>`);
        root.appendChild(box);
        slider(box, { label: "Zaman t", min: 0, max: tmax, step: 0.1, value: t, format: (v) => fmt(v, 1) + " ms" }, (v) => { t = v; update(); });
        const plots = el(`<div class="plot-stack"></div>`);
        root.appendChild(plots);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        const wv = pts.map((q) => q[1]), pv = segs.map((q) => q.p);
        const pad = (a, b) => { const m = Math.max(Math.abs(a), Math.abs(b), 1); return [Math.min(0, a) - m * 0.15, Math.max(0, b) + m * 0.15]; };
        const wr = pad(Math.min(...wv), Math.max(...wv)), pr = pad(Math.min(...pv), Math.max(...pv));
        const ir = [pr[0] / V, pr[1] / V];
        const ticks = (lo, hi, n) => { const st = Math.pow(10, Math.floor(Math.log10((hi - lo) / n))); const step = [1, 2, 5, 10].map((k) => k * st).find((k) => (hi - lo) / k <= n) || st * 10; const a = []; for (let x = Math.ceil(lo / step) * step; x <= hi + 1e-9; x += step) a.push(Number(x.toFixed(6))); return a; };
        const xt = ticks(0, tmax, 10);
        const stepPts = (f) => segs.flatMap((q) => [[q.t1, f(q.p)], [q.t2, f(q.p)]]);
        function update() {
            const { s, w } = at(t);
            plots.innerHTML =
                plot({ w: 460, h: 150, x: [0, tmax], y: wr, xt, yt: ticks(wr[0], wr[1], 5), yl: "w(t) · mJ", xl: "t (ms)", series: [{ pts, c: "s1" }], vline: t, marks: [[t, w]] }) +
                plot({ w: 460, h: 150, x: [0, tmax], y: pr, xt, yt: ticks(pr[0], pr[1], 5), yl: "p(t) = dw/dt · W", xl: "t (ms)", series: [{ pts: stepPts((p) => p), c: "s2" }], vline: t, marks: [[t, s.p]] }) +
                plot({ w: 460, h: 150, x: [0, tmax], y: ir, xt, yt: ticks(ir[0], ir[1], 5), yl: `i(t) = p/${fmt(V)} · A`, xl: "t (ms)", series: [{ pts: stepPts((p) => p / V), c: "s3" }], vline: t, marks: [[t, s.p / V]] });
            out.innerHTML = `${tex(`t = ${ft(t, 1)}\\text{ ms}`)} anında enerji ${tex(`w = ${ft(w, 2)}\\text{ mJ}`)}.
                <br>Bu aralıkta (${fmt(s.t1)}–${fmt(s.t2)} ms) eğim: ${tex(`p = \\dfrac{\\Delta w}{\\Delta t} = \\dfrac{${ft(s.w2)} - (${ft(s.w1)})\\text{ mJ}}{${ft(s.t2 - s.t1)}\\text{ ms}} = ${ft(s.p, 2)}\\text{ W}`)}
                <br>Akım: ${tex(`i = \\dfrac{p}{V} = \\dfrac{${ft(s.p, 2)}}{${ft(V)}} = ${ft(s.p / V, 3)}\\text{ A}`)}
                <br><span class="muted">${Math.abs(s.p) < 1e-9 ? "Enerji değişmiyor (yatay çizgi) → güç ve akım sıfır." : s.p > 0 ? "Enerji artıyor → devre güç çekiyor, akım pozitif." : "Enerji azalıyor → devre güç geri veriyor, akım negatif (ters yönde)."}</span>`;
        }
        update();
    };

    /* ---------------- Tellegen: güç dengesi ---------------- */
    // o.items: Ckt öğeleri (eleman öğelerinde id), o.els: [{ id, name, v, i }] — i, + uçtan giren akım (pasif işaret)
    W.tellegen = function (root, o) {
        const els = o.els;
        const shown = new Set(o.showAll ? els.map((e) => e.id) : []);
        let sel = null;
        const stage = el(`<div class="ckt-wrap"></div>`);
        root.appendChild(stage);
        const actions = el(`<div class="ex-actions"><button type="button" class="btn small" data-all>Hepsini hesapla</button><button type="button" class="btn small ghost" data-reset>Sıfırla</button></div>`);
        root.appendChild(actions);
        const tbl = el(`<div class="table-wrap"></div>`);
        root.appendChild(tbl);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        const maxP = Math.max(...els.map((e) => Math.abs(e.v * e.i)));
        stage.innerHTML = C.svg({ w: o.w || 380, h: o.h || 250, items: o.items });
        function pick(id) {
            sel = id;
            shown.add(id);
            update();
        }
        stage.querySelectorAll("[data-id]").forEach((g) => g.addEventListener("click", () => pick(g.dataset.id)));
        actions.querySelector("[data-all]").addEventListener("click", () => { els.forEach((e) => shown.add(e.id)); sel = null; update(); });
        actions.querySelector("[data-reset]").addEventListener("click", () => { shown.clear(); sel = null; update(); });
        function update() {
            stage.querySelectorAll("[data-id]").forEach((g) => g.classList.toggle("sel", g.dataset.id === sel));
            let sum = 0, absSum = 0, supSum = 0;
            const rows = els.map((e) => {
                const p = e.v * e.i, vis = shown.has(e.id);
                if (vis) { sum += p; if (p > 0) absSum += p; else supSum += p; }
                return `<tr class="pw-row${sel === e.id ? " sel" : ""}" data-row="${e.id}">
                    <td><b>${esc(e.name)}</b></td><td>${fmt(e.v)} V</td><td>${fmt(e.i)} A</td>
                    <td>${vis ? `${tex(`p = (${ft(e.v)})(${ft(e.i)}) = ${ft(p)}\\,\\text{W}`)}` : `<span class="muted">dokun →</span>`}</td>
                    <td style="width:30%">${vis ? `<div class="pw-bar ${p >= 0 ? "abs" : "sup"}" style="width:${Math.round((Math.abs(p) / maxP) * 100)}%"></div><div style="font-size:12px;margin-top:3px">${p >= 0 ? "alıyor" : "veriyor"}</div>` : ""}</td></tr>`;
            }).join("");
            const all = shown.size === els.length;
            tbl.innerHTML = `<table class="pw-table"><thead><tr><th>Eleman</th><th>v</th><th>i (+ uçtan giren)</th><th>Güç</th><th></th></tr></thead><tbody>${rows}</tbody>
                <tfoot><tr><td colspan="5">Alınan: ${fmt(absSum)} W &nbsp;·&nbsp; Verilen: ${fmt(-supSum)} W</td></tr></tfoot></table>`;
            tbl.querySelectorAll("[data-row]").forEach((r) => r.addEventListener("click", () => pick(r.dataset.row)));
            out.innerHTML = all ? `<span class="good">Toplam güç: ${tex(`\\sum p = ${els.map((e) => ft(e.v * e.i)).join(" + ").replace(/\+ -/g, "- ")} = ${ft(sum)}`)} ✓</span> Verilen güç = alınan güç; Tellegen teoremi sağlanıyor.`
                : `Bir elemana (şekilde ya da tabloda) dokun, gücünü hesaplayalım. ${shown.size}/${els.length} eleman hesaplandı.`;
        }
        update();
    };

    /* ---------------- Bağımlı kaynaklar ---------------- */
    W.depSource = function (root, o) {
        const T = [
            { name: "Gerilim kontrollü gerilim kaynağı", ctrl: "v", out: "v", g: "\\mu", gl: "μ (birimsiz)", gMax: 10, gStep: 0.5, g0: 2, f: (g, x) => g * x, outUnit: "V", form: "v = \\mu\\, v_S" },
            { name: "Akım kontrollü gerilim kaynağı", ctrl: "i", out: "v", g: "r", gl: "r (kΩ = V/mA)", gMax: 10, gStep: 0.5, g0: 2, f: (g, x) => g * x, outUnit: "V", form: "v = r\\, i_S" },
            { name: "Gerilim kontrollü akım kaynağı", ctrl: "v", out: "i", g: "g", gl: "g (mS = mA/V)", gMax: 5, gStep: 0.1, g0: 0.5, f: (g, x) => g * x, outUnit: "mA", form: "i = g\\, v_S" },
            { name: "Akım kontrollü akım kaynağı", ctrl: "i", out: "i", g: "\\beta", gl: "β (birimsiz)", gMax: 100, gStep: 1, g0: 50, f: (g, x) => g * x, outUnit: "mA", form: "i = \\beta\\, i_S" },
        ];
        let k = o.type || 0, x = 2, g = T[k].g0;
        const top = el(`<div></div>`);
        root.appendChild(top);
        chips(top, ["(a) GKGK", "(b) AKGK", "(c) GKAK", "(d) AKAK"], k, (i) => { k = i; g = T[k].g0; build(); });
        const box = el(`<div class="controls"></div>`);
        root.appendChild(box);
        const stage = el(`<div class="ckt-wrap" style="margin-top:10px"></div>`);
        root.appendChild(stage);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        function build() {
            box.innerHTML = "";
            const t = T[k];
            slider(box, { label: t.ctrl === "v" ? "Kontrol gerilimi v<sub>S</sub>" : "Kontrol akımı i<sub>S</sub>", min: 0, max: 10, step: 0.5, value: x, format: (v) => fmt(v) + (t.ctrl === "v" ? " V" : " mA") }, (v) => { x = v; update(); });
            slider(box, { label: `Kazanç ${t.gl}`, min: 0, max: t.gMax, step: t.gStep, value: g, format: (v) => fmt(v) }, (v) => { g = v; update(); });
            update();
        }
        function update() {
            const t = T[k], y = t.f(g, x);
            const items = [{ t: "rect", x: 10, y: 22, w: 34, h: 126 }, { t: "txt", p: [27, 85], s: "…", tc: "val" }];
            if (t.ctrl === "v") items.push({ t: "w", p: [[44, 40], [110, 40]] }, { t: "w", p: [[44, 130], [110, 130]] }, { t: "term", p: [110, 40] }, { t: "term", p: [110, 130] },
                { t: "pm", p: [110, 60], s: "+" }, { t: "txt", p: [110, 85], s: `v_S = ${fmt(x)} V` }, { t: "pm", p: [110, 110], s: "-" });
            else items.push({ t: "w", p: [[44, 40], [120, 40], [120, 130], [44, 130]] }, { t: "arr", p: [84, 40], d: "r", label: `i_S = ${fmt(x)} mA` });
            items.push({ t: "txt", p: [175, 85], s: "⟹", tc: "big" });
            const lbl = t.form.replace("\\mu", "μ").replace("\\beta", "β").replace("\\,", "").replace(/v_S|i_S/, (m) => m);
            if (t.out === "v") items.push({ t: "DV", a: [250, 40], b: [250, 130], plus: "a", label: lbl, side: "l" });
            else items.push({ t: "DI", a: [250, 130], b: [250, 40], to: "b", label: lbl, side: "l" });
            items.push({ t: "w", p: [[250, 40], [320, 40]] }, { t: "w", p: [[250, 130], [320, 130]] }, { t: "term", p: [320, 40] }, { t: "term", p: [320, 130] },
                { t: "txt", p: [330, 85], s: `= ${fmt(y)} ${t.outUnit}`, a: "start", tc: "big" });
            stage.innerHTML = C.svg({ w: 420, h: 170, items });
            const cx = t.ctrl === "v" ? `${ft(x)}\\text{ V}` : `${ft(x)}\\text{ mA}`;
            out.innerHTML = `<b>${t.name}</b><br>${tex(`${t.form} = (${ft(g)})(${cx}) = ${ft(y)}\\text{ ${t.outUnit}}`)}
                <br><span class="muted">Çıkış, devrenin <b>başka bir yerindeki</b> ${t.ctrl === "v" ? "gerilime" : "akıma"} bağlı. Kontrolü değiştir, çıkışın nasıl orantılı değiştiğini izle. Kontrol sıfırsa çıkış da sıfırdır.</span>`;
        }
        build();
    };

    /* ---------------- Ohm yasası: V–I eğrisi ---------------- */
    W.ohmVI = function (root, o) {
        const st = { V: o.V === undefined ? 6 : o.V, R: o.R === undefined ? 4 : o.R, mode: 0 };
        const top = el(`<div></div>`);
        root.appendChild(top);
        chips(top, ["Normal direnç", "R = 0 (kısa devre)", "R = ∞ (açık devre)"], 0, (i) => { st.mode = i; update(); });
        const box = el(`<div class="controls"></div>`);
        root.appendChild(box);
        slider(box, { label: "Gerilim V", min: 0, max: 12, step: 0.5, value: st.V, format: (v) => eng(v, "V") }, (v) => { st.V = v; update(); });
        const sr = slider(box, { label: "Direnç R", min: 1, max: 30, step: 0.5, value: st.R, format: (v) => eng(v, "Ω") }, (v) => { st.R = v; update(); });
        const pl = el(`<div style="margin-top:10px"></div>`);
        root.appendChild(pl);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        function update() {
            sr.node.style.opacity = st.mode ? 0.4 : 1;
            sr.input.disabled = !!st.mode;
            const faint = [2, 6, 20].map((R) => ({ pts: [[0, 0], [12, 12 / R]], c: "faint" }));
            const labels = [2, 6, 20].map((R) => (12 / R <= 6 ? { x: 11.9, y: 12 / R + 0.15, s: `${R} Ω`, a: "end" } : { x: R * 5.6, y: 5.75, s: `${R} Ω`, a: "end" }));
            let series, marks = [], txt;
            if (st.mode === 1) {
                series = [{ pts: [[0, 0], [0, 6]], c: "s2" }];
                txt = `${tex("I = \\dfrac{V}{0} \\to \\infty")} — <b>kısa devre</b>. Akımı sınırlayan hiçbir şey yok; gerçekte teller ısınır, pil biter ya da sigorta atar. Eğri dikey eksene yapışır.`;
            } else if (st.mode === 2) {
                series = [{ pts: [[0, 0], [12, 0]], c: "s2" }];
                txt = `${tex("I = \\dfrac{V}{\\infty} = 0")} — <b>açık devre</b>. Gerilim ne olursa olsun akım akmaz (kopuk tel, açık anahtar gibi). Eğri yatay eksenin üzerindedir.`;
            } else {
                const I = st.V / st.R;
                series = [{ pts: [[0, 0], [12, 12 / st.R]], c: "s1" }];
                marks = [[st.V, I]];
                txt = `${tex(`I = \\dfrac{V}{R} = \\dfrac{${ft(st.V)}}{${ft(st.R)}} = ${engT(I, "A")}`)} &nbsp; · &nbsp; ${tex(`G = \\dfrac{1}{R} = ${engT(1 / st.R, "S")}`)}
                    <br>${tex(`P = V I = I^2 R = \\dfrac{V^2}{R} = ${engT(st.V * I, "W")}`)}
                    <br><span class="muted">Doğrunun eğimi iletkenliktir: ${tex("\\text{eğim} = \\dfrac{I}{V} = G")}. Direnç büyüdükçe doğru yatıklaşır.</span>`;
            }
            pl.innerHTML = plot({ w: 460, h: 260, x: [0, 12], y: [0, 6], xt: [0, 2, 4, 6, 8, 10, 12], yt: [0, 1, 2, 3, 4, 5, 6], xl: "V (V)", yl: "I (A)", series: faint.concat(series), marks, labels });
            out.innerHTML = txt;
        }
        update();
    };

    /* ---------------- İletken direnci R = l / (κ A) ---------------- */
    const MATS = [
        { n: "Gümüş", k: 61, c: "#b8c2cc" }, { n: "Bakır", k: 56, c: "#d9822b" }, { n: "Altın", k: 44, c: "#d4af37" },
        { n: "Alüminyum", k: 35, c: "#9fb3c2" }, { n: "Tungsten", k: 18, c: "#7d8a96" }, { n: "Pirinç", k: 16, c: "#c9a227" },
        { n: "Demir", k: 10, c: "#8a6f5a" }, { n: "Krom-Nikel", k: 0.91, c: "#6f7f73" },
    ];
    const SECTIONS = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
    W.wireR = function (root, o) {
        const st = { m: o.mat === undefined ? 1 : o.mat, l: o.l || 1000, ai: SECTIONS.indexOf(o.A || 70), byD: !!o.byD, d: o.d || 0.45 };
        if (st.ai < 0) st.ai = 12;
        const top = el(`<div></div>`);
        root.appendChild(top);
        chips(top, MATS.map((m) => `${m.n} <span class="muted">κ=${fmt(m.k)}</span>`), st.m, (i) => { st.m = i; update(); });
        const modeRow = el(`<div style="margin-top:10px"></div>`);
        root.appendChild(modeRow);
        chips(modeRow, ["Kesit alanını seç (mm²)", "Çapı gir (mm)"], st.byD ? 1 : 0, (i) => { st.byD = i === 1; sA.node.hidden = st.byD; sD.node.hidden = !st.byD; update(); });
        const box = el(`<div class="controls"></div>`);
        root.appendChild(box);
        slider(box, { label: "Uzunluk l", min: 1, max: 2000, step: 1, value: st.l, format: (v) => (v >= 1000 ? fmt(v / 1000, 3) + " km" : fmt(v) + " m") }, (v) => { st.l = v; update(); });
        const sA = slider(box, { label: "Kesit alanı A", min: 0, max: SECTIONS.length - 1, step: 1, value: st.ai, format: (v) => fmt(SECTIONS[v]) + " mm²" }, (v) => { st.ai = v; update(); });
        const sD = slider(box, { label: "Çap d", min: 0.05, max: 5, step: 0.05, value: st.d, format: (v) => fmt(v, 2) + " mm" }, (v) => { st.d = v; update(); });
        sA.node.hidden = st.byD; sD.node.hidden = !st.byD;
        const stage = el(`<div style="margin-top:12px"></div>`);
        root.appendChild(stage);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        function update() {
            const m = MATS[st.m];
            const A = st.byD ? Math.PI * st.d * st.d / 4 : SECTIONS[st.ai];
            const R = st.l / (m.k * A);
            const len = 60 + 340 * (st.l / 2000), th = Math.max(3, Math.min(34, 3.2 * Math.sqrt(A) * 1.4));
            stage.innerHTML = `<svg class="ckt" viewBox="0 0 440 70" style="max-width:440px">
                <rect x="20" y="${35 - th / 2}" width="${len}" height="${th}" rx="${Math.min(th / 2, 6)}" fill="${m.c}" stroke="rgba(0,0,0,.25)"/>
                <text x="20" y="${35 - th / 2 - 9}" text-anchor="start" class="val">${esc(m.n)} tel</text>
                <text x="${20 + len + 8}" y="35" text-anchor="start" class="big">${eng(R, "Ω")}</text></svg>`;
            out.innerHTML = `${st.byD ? `${tex(`A = \\pi \\left(\\dfrac{d}{2}\\right)^2 = \\pi \\left(\\dfrac{${ft(st.d, 2)}}{2}\\right)^2 = ${ft(A, 4)}\\text{ mm}^2`)}<br>` : ""}
                ${tex(`R = \\rho \\dfrac{l}{A} = \\dfrac{l}{\\varkappa A} = \\dfrac{${ft(st.l, 0)}\\text{ m}}{${ft(m.k)} \\cdot ${ft(A, 4)}\\text{ mm}^2} = ${engT(R, "Ω")}`)}
                <br>${tex(`\\rho = \\dfrac{1}{\\varkappa} = ${ft(1 / m.k, 4)}\\ \\dfrac{\\Omega\\,\\text{mm}^2}{\\text{m}}`)} &nbsp; · &nbsp; ${tex(`G = \\dfrac{1}{R} = ${engT(1 / R, "S")}`)}
                <br><span class="muted">Tel uzarsa direnç <b>artar</b> (elektronlar daha uzun yol boyunca çarpışır); kalınlaşırsa <b>azalır</b> (daha geniş yol). İyi iletken (büyük κ) → küçük direnç.</span>`;
        }
        update();
    };

    /* ---------------- Direnç renk kodu ---------------- */
    const CC = [
        { n: "Siyah", c: "#1a1a1a", d: 0, m: 1 }, { n: "Kahverengi", c: "#7b4a1e", d: 1, m: 10, t: 1 }, { n: "Kırmızı", c: "#e53935", d: 2, m: 100, t: 2 },
        { n: "Turuncu", c: "#fb8c00", d: 3, m: 1e3 }, { n: "Sarı", c: "#fdd835", d: 4, m: 1e4 }, { n: "Yeşil", c: "#43a047", d: 5, m: 1e5, t: 0.5 },
        { n: "Mavi", c: "#1e88e5", d: 6, m: 1e6, t: 0.25 }, { n: "Mor", c: "#8e24aa", d: 7, m: 1e7, t: 0.1 }, { n: "Gri", c: "#9e9e9e", d: 8, t: 0.05 },
        { n: "Beyaz", c: "#ffffff", d: 9 }, { n: "Altın", c: "#d4af37", m: 0.1, t: 5 }, { n: "Gümüş", c: "#c0c0c0", m: 0.01, t: 10 },
    ];
    W._CC = CC;
    W.colorCode = function (root, o) {
        const st = { n: o.bands === 5 ? 5 : 4, b4: o.b4 || [5, 6, 3, 10], b5: o.b5 || [2, 3, 7, 0, 1], sel: 0 };
        const roles = (n) => (n === 4 ? ["d", "d", "m", "t"] : ["d", "d", "d", "m", "t"]);
        const roleName = { d: "Sayı", m: "Çarpan", t: "Tolerans" };
        const top = el(`<div></div>`);
        root.appendChild(top);
        chips(top, ["4 bantlı", "5 bantlı"], st.n === 5 ? 1 : 0, (i) => { st.n = i ? 5 : 4; st.sel = 0; update(); });
        const wrap = el(`<div class="cc-wrap"></div>`);
        root.appendChild(wrap);
        const rev = el(`<div class="controls" style="grid-template-columns:minmax(0,1fr)">
            <label class="ctrl"><span class="ctrl-label"><span>Değerden renge: direnç değeri yaz (ör. 220, 4.7k, 1M)</span></span><input class="text-input mono" type="text" spellcheck="false" autocomplete="off" data-rev></label></div>`);
        root.appendChild(rev);
        const revIn = rev.querySelector("[data-rev]");
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        const bands = () => (st.n === 4 ? st.b4 : st.b5);
        const allowed = (role, c) => (role === "d" ? c.d !== undefined : role === "m" ? c.m !== undefined : c.t !== undefined);
        let revMsg = "";
        function update() {
            const b = bands(), rl = roles(st.n);
            const xs = st.n === 4 ? [130, 178, 226, 318] : [118, 158, 198, 240, 320];
            let svg = `<svg class="cc-svg" viewBox="0 0 460 132"><line x1="6" y1="58" x2="454" y2="58" stroke="#9aa5ae" stroke-width="6" stroke-linecap="round"/>
                <path d="M100 24 Q100 16 112 16 L150 16 Q158 24 170 24 L290 24 Q302 24 310 16 L348 16 Q360 16 360 24 L360 92 Q360 100 348 100 L310 100 Q302 92 290 92 L170 92 Q158 92 150 100 L112 100 Q100 100 100 92 Z" fill="#e9d5a7" stroke="#b89b6a" stroke-width="2"/>`;
            b.forEach((ci, k) => {
                const tall = k === 0 || k === b.length - 1 ? [16, 84] : [24, 68];
                svg += `<rect class="cc-band${st.sel === k ? " sel" : ""}" data-b="${k}" x="${xs[k] - 9}" y="${tall[0]}" width="18" height="${tall[1]}" fill="${CC[ci].c}" stroke="rgba(0,0,0,.3)"/>
                    <text x="${xs[k]}" y="118" text-anchor="middle" font-size="10.5" font-weight="700" fill="${st.sel === k ? "var(--pink)" : "var(--ink-soft)"}">${roleName[rl[k]]}</text>`;
            });
            svg += `</svg>`;
            const role = rl[st.sel];
            const pal = CC.map((c, i) => `<button type="button" class="cc-color${b[st.sel] === i ? " active" : ""}" data-c="${i}"${allowed(role, c) ? "" : " disabled"}><i style="background:${c.c}"></i>${c.n}</button>`).join("");
            const digits = b.slice(0, st.n - 2).map((ci) => CC[ci].d);
            const base = Number(digits.join(""));
            const mult = CC[b[st.n - 2]].m, tol = CC[b[st.n - 1]].t;
            const R = base * mult;
            wrap.innerHTML = `${svg}<div class="cc-value">${eng(R, "Ω")} <span style="font-size:18px;color:var(--ink-soft)">± %${fmt(tol)}</span></div>
                <div class="muted" style="text-align:center;font-size:13px">Değiştirmek istediğin banda dokun (seçili: <b>${st.sel + 1}. bant · ${roleName[role]}</b>), sonra renk seç:</div>
                <div class="cc-palette">${pal}</div>`;
            wrap.querySelectorAll("[data-b]").forEach((r) => r.addEventListener("click", () => { st.sel = Number(r.dataset.b); update(); }));
            wrap.querySelectorAll("[data-c]").forEach((btn) => btn.addEventListener("click", () => {
                b[st.sel] = Number(btn.dataset.c);
                if (st.sel < b.length - 1) st.sel++;
                revMsg = "";
                update();
            }));
            const multTxt = mult >= 1 ? fmt(mult, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : fmt(mult, 2);
            out.innerHTML = `${digits.join(" ")} → ${tex(`${base} \\times ${multTxt.replace(",", "{,}")} = ${engT(R, "Ω")}`)} &nbsp; ${tex(`\\pm\\%${ft(tol)}`)}
                <br>Gerçek değer şu aralıkta olabilir: <b>${eng(R * (1 - tol / 100), "Ω")}</b> – <b>${eng(R * (1 + tol / 100), "Ω")}</b>
                ${revMsg ? `<br>${revMsg}` : ""}
                <br><span class="muted">Sıra ezberi: <b>So</b>(0) <b>Ka</b>(1) <b>K</b>(2) <b>Ta</b>(3) · <b>Sa</b>(4) <b>Ya</b>(5) <b>Ma</b>(6) <b>M</b>(7) · <b>Gi</b>(8) <b>Bi</b>(9) → “SoKaKTa SaYaMaM GiBi”: Siyah, Kahverengi, Kırmızı, Turuncu, Sarı, Yeşil, Mavi, Mor, Gri, Beyaz.</span>`;
        }
        revIn.addEventListener("input", () => {
            const v = parseEng(revIn.value);
            revIn.classList.remove("err");
            if (!revIn.value.trim()) { revMsg = ""; update(); return; }
            if (!(v > 0)) { revIn.classList.add("err"); revMsg = `<span class="bad">Sayı anlaşılamadı.</span>`; update(); return; }
            const nd = st.n - 2, lo = Math.pow(10, nd - 1), hi = Math.pow(10, nd) - 1;
            const b = bands();
            let done = false;
            for (let e = -2; e <= 7 && !done; e++) {
                const q = v / Math.pow(10, e);
                const qi = Math.round(q);
                if (Math.abs(q - qi) < 1e-6 * Math.max(1, q) && qi >= lo && qi <= hi) {
                    const ds = String(qi).split("").map(Number);
                    ds.forEach((d, k) => { b[k] = CC.findIndex((c) => c.d === d); });
                    b[nd] = CC.findIndex((c) => c.m !== undefined && Math.abs(Math.log10(c.m) - e) < 1e-9);
                    done = b[nd] >= 0;
                }
            }
            revMsg = done ? `<span class="good">${esc(revIn.value)} → bantlar ayarlandı.</span>` : `<span class="bad">Bu değer ${st.n} bantla ${st.n - 2} anlamlı basamakla yazılamıyor.</span>`;
            if (!done) revIn.classList.add("err");
            update();
        });
        update();
    };

    /* ---------------- KAY: bir düğüme giren ve çıkan akımlar ---------------- */
    W.kcl = function (root, o) {
        const items = (o.items || [
            { name: "I_1", v: 5, dir: "in", ang: 90 }, { name: "I_2", v: 6, dir: "in", ang: 180 }, { name: "I_3", v: 2, dir: "out", ang: 230 },
            { name: "I_4", unknown: true, dir: "out", ang: 330 }, { name: "I_5", v: 5, dir: "out", ang: 30 },
        ]).map((x) => Object.assign({}, x));
        const box = el(`<div class="controls"></div>`);
        root.appendChild(box);
        const stage = el(`<div class="ckt-wrap" style="margin-top:10px"></div>`);
        root.appendChild(stage);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        const sub = (n) => n.replace(/_(\w+)/, "<sub>$1</sub>");
        items.forEach((it) => {
            if (it.unknown) return;
            const wrap = el(`<div class="ctrl"></div>`);
            box.appendChild(wrap);
            slider(wrap, { label: sub(it.name), min: 0, max: 10, step: 0.5, value: it.v, format: (v) => fmt(v) + " A" }, (v) => { it.v = v; update(); });
            const b = el(`<button type="button" class="btn small ghost" style="align-self:flex-start"></button>`);
            const lbl = () => { b.textContent = it.dir === "in" ? "→• giriyor (değiştir)" : "•→ çıkıyor (değiştir)"; };
            lbl();
            b.addEventListener("click", () => { it.dir = it.dir === "in" ? "out" : "in"; lbl(); update(); });
            wrap.appendChild(b);
        });
        const cx = 190, cy = 150, Rl = 105;
        function update() {
            const unk = items.find((x) => x.unknown);
            const known = items.filter((x) => !x.unknown);
            const sIn = known.filter((x) => x.dir === "in").reduce((a, x) => a + x.v, 0);
            const sOut = known.filter((x) => x.dir === "out").reduce((a, x) => a + x.v, 0);
            let val = null, real = null;
            if (unk) {
                val = unk.dir === "out" ? sIn - sOut : sOut - sIn;
                real = val >= 0 ? unk.dir : unk.dir === "in" ? "out" : "in";
            }
            let s = "";
            items.forEach((it) => {
                const a = (it.ang * Math.PI) / 180, ex = cx + Rl * Math.cos(a), ey = cy - Rl * Math.sin(a);
                const dir = it.unknown ? real : it.dir;
                const mx = cx + Rl * 0.6 * Math.cos(a), my = cy - Rl * 0.6 * Math.sin(a);
                const deg = dir === "in" ? 180 - it.ang : -it.ang;
                const col = dir === "in" ? "var(--red)" : "var(--blue)";
                s += `<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" class="wire"/>
                    <path d="M9 0 L-7 -8 L-7 8 Z" fill="${col}" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${deg})"/>`;
                const lx = cx + (Rl + 22) * Math.cos(a), ly = cy - (Rl + 22) * Math.sin(a);
                const anchor = Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle";
                const txt = it.unknown ? `${it.name} = ${val === null ? "?" : fmt(Math.abs(val)) + " A"}` : `${it.name} = ${fmt(it.v)} A`;
                s += C.text(lx, ly, txt, { a: anchor, c: it.unknown ? "ok" : "big" });
            });
            s += `<circle cx="${cx}" cy="${cy}" r="9" class="dot"/>${C.text(cx + 14, cy + 16, "düğüm", { a: "start", c: "val" })}`;
            stage.innerHTML = `<svg class="ckt" viewBox="0 0 380 300" style="max-width:380px">${s}</svg>`;
            const nm = (x) => x.name.replace(/_(\w+)/, "_{$1}");
            const ins = items.filter((x) => (x.unknown ? unk.dir : x.dir) === "in"), outs = items.filter((x) => (x.unknown ? unk.dir : x.dir) === "out");
            const side = (arr) => arr.map(nm).join(" + ") || "0";
            const num = (arr) => arr.map((x) => (x.unknown ? nm(x) : ft(x.v))).join(" + ") || "0";
            out.innerHTML = `Giren = Çıkan: ${tex(`${side(ins)} = ${side(outs)}`)}<br>${tex(`${num(ins)} = ${num(outs)}`)}
                ${unk ? `<br>${tex(`${nm(unk)} = ${ft(val)}\\text{ A}`)} ${val < 0 ? `<span class="bad">Negatif çıktı!</span> Varsaydığımız yön yanlışmış: ${unk.name.replace("_", "")} aslında düğüme <b>${real === "in" ? "giriyor" : "çıkıyor"}</b>, büyüklüğü ${fmt(-val)} A.` : `<span class="good">✓</span> Toplam giren ${fmt(sIn + (unk.dir === "in" ? val : 0))} A, toplam çıkan ${fmt(sOut + (unk.dir === "out" ? val : 0))} A.`}` : ""}
                <br><span class="muted">Kırmızı oklar düğüme giren, mavi oklar çıkan akımlar. Düğümde yük birikmez: ne girerse o çıkar.</span>`;
        }
        update();
    };

    /* ---------------- KGY: çevrede yürüyüş ---------------- */
    W.kvl = function (root, o) {
        const st = { R1: 2, R2: 3, R3: 5, f5: false, f15: false, step: -1 };
        const box = el(`<div class="controls"></div>`);
        root.appendChild(box);
        ["R1", "R2", "R3"].forEach((k) => slider(box, { label: `R<sub>${k[1]}</sub>`, min: 1, max: 20, step: 1, value: st[k], format: (v) => fmt(v) + " Ω" }, (v) => { st[k] = v; update(); }));
        const flips = el(`<div class="chip-row" style="margin-top:10px"><button type="button" class="chip" data-f="f5">⇄ 5 V kaynağını ters çevir</button><button type="button" class="chip" data-f="f15">⇄ 15 V kaynağını ters çevir</button></div>`);
        root.appendChild(flips);
        flips.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { st[b.dataset.f] = !st[b.dataset.f]; b.classList.toggle("active", st[b.dataset.f]); st.step = -1; update(); }));
        const stage = el(`<div class="ckt-wrap" style="margin-top:10px"></div>`);
        root.appendChild(stage);
        const actions = el(`<div class="ex-actions"><button type="button" class="btn small" data-step>▶ a'dan başla, saat yönünde bir adım yürü</button><button type="button" class="btn small ghost" data-reset>Baştan</button></div>`);
        root.appendChild(actions);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        actions.querySelector("[data-step]").addEventListener("click", () => { st.step = st.step >= 5 ? -1 : st.step + 1; update(); });
        actions.querySelector("[data-reset]").addEventListener("click", () => { st.step = -1; update(); });
        const xa = 40, xb = 170, xc = 300, yt = 40, yb = 200;
        function update() {
            const emf = 30 + (st.f5 ? -5 : 5) + (st.f15 ? -15 : 15);
            const RT = st.R1 + st.R2 + st.R3, I = emf / RT;
            const V1 = I * st.R1, V2 = I * st.R2, V3 = I * st.R3;
            // Saat yönünde: [id, ad, + uçtan mı giriliyor, değer]
            const loop = [
                ["R1", "V_{R_1}", true, V1, "a → b"], ["E5", "5\\text{ V}", st.f5, 5, "b → c"], ["R2", "V_{R_2}", true, V2, "c → d"],
                ["E15", "15\\text{ V}", st.f15, 15, "d → e"], ["R3", "V_{R_3}", true, V3, "e → f"], ["E30", "30\\text{ V}", false, 30, "f → a"],
            ];
            const items = [
                { t: "V", id: "E30", a: [xa, yt], b: [xa, yb], plus: "a", label: "30 V", side: "l" },
                { t: "R", id: "R1", a: [xa, yt], b: [xb, yt], label: `R_1 = ${fmt(st.R1)} Ω` },
                { t: "pm", p: [83, 62], s: "+" }, { t: "txt", p: [105, 62], s: "V_{R1}" }, { t: "pm", p: [127, 62], s: "-" },
                { t: "V", id: "E5", a: [xb, yt], b: [xc, yt], plus: st.f5 ? "a" : "b", label: "5 V" },
                { t: "R", id: "R2", a: [xc, yt], b: [xc, yb], label: `R_2 = ${fmt(st.R2)} Ω`, side: "l" },
                { t: "pm", p: [318, 98], s: "+" }, { t: "txt", p: [314, 120], s: "V_{R2}", a: "start" }, { t: "pm", p: [318, 142], s: "-" },
                { t: "V", id: "E15", a: [xc, yb], b: [xb, yb], plus: st.f15 ? "a" : "b", label: "15 V", side: "b" },
                { t: "R", id: "R3", a: [xb, yb], b: [xa, yb], label: `R_3 = ${fmt(st.R3)} Ω`, side: "b" },
                { t: "pm", p: [83, 178], s: "-" }, { t: "txt", p: [105, 178], s: "V_{R3}" }, { t: "pm", p: [127, 178], s: "+" },
            ];
            [["a", xa, yt, -12, -10], ["b", xb, yt, 0, -14], ["c", xc, yt, 12, -10], ["d", xc, yb, 12, 12], ["e", xb, yb, 0, 15], ["f", xa, yb, -12, 12]].forEach(([n, x, y, dx, dy]) => {
                items.push({ t: "dot", p: [x, y] }, { t: "txt", p: [x + dx, y + dy], s: n, tc: "big" });
            });
            items.push({ t: "txt", p: [170, 112], s: `I = ${fmt(I, 3)} A ↻`, tc: "big" });
            stage.innerHTML = C.svg({ w: 400, h: 240, items });
            if (st.step >= 0) { const g = stage.querySelector(`[data-id="${loop[st.step][0]}"]`); if (g) g.classList.add("sel"); }
            let sum = 0;
            const terms = [];
            loop.forEach((e, k) => {
                if (k > st.step) return;
                const v = e[2] ? e[3] : -e[3];
                sum += v;
                terms.push(`${e[2] ? "+" : "-"}${e[1]}`);
            });
            const nums = loop.slice(0, st.step + 1).map((e) => `${e[2] ? "+" : "-"}${ft(e[3], 2)}`).join(" ");
            const cur = st.step >= 0 ? loop[st.step] : null;
            out.innerHTML = `${tex(`I = \\dfrac{${30} ${st.f5 ? "-" : "+"} 5 ${st.f15 ? "-" : "+"} 15}{R_1 + R_2 + R_3} = \\dfrac{${emf}}{${RT}} = ${ft(I, 3)}\\text{ A}`)} (saat yönünde)
                <br>${tex(`V_{R_1} = ${ft(V1, 2)}\\text{ V},\\ V_{R_2} = ${ft(V2, 2)}\\text{ V},\\ V_{R_3} = ${ft(V3, 2)}\\text{ V}`)}
                <br>${cur ? `<b>${cur[4]}</b>: elemana <b>${cur[2] ? "+" : "−"}</b> ucundan girdin → ${tex(`${cur[2] ? "+" : "-"}${cur[1]}`)}<br>${tex(`${terms.join(" ")} = ${nums} = ${ft(sum, 2)}`)} ${st.step === 5 ? `<span class="good">✓ Çevre kapandı, toplam sıfır!</span>` : ""}`
                : `Adım düğmesine bas: a noktasından başlayıp saat yönünde yürüyeceğiz. Kural: elemana <b>+</b> ucundan girersen gerilimini <b>+</b>, <b>−</b> ucundan girersen <b>−</b> yaz.`}`;
        }
        update();
    };

    /* ---------------- Düğüm, çevre, dal ---------------- */
    W.nodeLoop = function (root, o) {
        const L = 40, M = 190, Rx = 340, T = 30, Md = 130, B = 230;
        const base = [
            { t: "w", p: [[L, T], [Rx, T]] },
            { t: "I", a: [L, Md], b: [L, T], to: "b", label: "i_1(t)", side: "l" },
            { t: "R", a: [L, Md], b: [L, B], label: "R_4", side: "l" },
            { t: "R", a: [L, Md], b: [M, Md], label: "R_3" },
            { t: "R", a: [M, T], b: [M, Md], label: "R_1" },
            { t: "V", a: [M, Md], b: [Rx, Md], plus: "a", label: "v_1(t)" },
            { t: "R", a: [Rx, T], b: [Rx, Md], label: "R_2" },
            { t: "R", a: [Rx, Md], b: [Rx, B], label: "R_5" },
            { t: "V", a: [M, Md], b: [M, B], plus: "a", label: "v_2(t)" },
            { t: "w", p: [[L, B], [Rx, B]] },
            { t: "node", p: [M, T], s: "1", lp: [M - 18, T - 14] }, { t: "node", p: [L, Md], s: "2", lp: [L + 16, Md + 18] },
            { t: "node", p: [M, Md], s: "3", lp: [M + 16, Md - 16] }, { t: "node", p: [Rx, Md], s: "4", lp: [Rx - 16, Md + 18] }, { t: "node", p: [M, B], s: "5", lp: [M + 16, B + 14] },
        ];
        const NC = ["#ff4f8b", "#00aff0", "#1fa957", "#f08c00", "#7c4dff"];
        const nodes = [
            [[[L, 64], [L, T], [Rx, T], [Rx, 60]], [[M, T], [M, 60]]],
            [[[L, 96], [L, Md], [95, Md]], [[L, Md], [L, 160]]],
            [[[135, Md], [249, Md]], [[M, 100], [M, 164]]],
            [[[281, Md], [Rx, Md]], [[Rx, 100], [Rx, 160]]],
            [[[L, 200], [L, B], [Rx, B], [Rx, 200]], [[M, 196], [M, B]]],
        ];
        const MODES = [
            { label: "Düğümler", hl: () => nodes.flatMap((ps, k) => ps.map((p) => ({ t: "hl", p, color: NC[k] }))),
                txt: "Aynı renkteki teller <b>tek bir düğümdür</b>: aralarında eleman olmayan teller aynı noktadır. Bu devrede <b>5 düğüm</b> var. Üstteki uzun tel (1) baştan sona tek düğümdür; alttaki tel (5) de öyle." },
            { label: "Çevre: R₁–v₂–R₄–i₁", hl: () => [{ t: "hl", p: [[M, T], [M, B], [L, B], [L, T], [M, T]], color: "#f08c00" }],
                txt: "1 → (R₁) → 3 → (v₂) → 5 → (R₄) → 2 → (i₁) → 1. Başladığımız düğüme döndük ve hiçbir düğümden iki kez geçmedik: bu bir <b>çevredir</b>." },
            { label: "Çevre: R₂–v₁–v₂–R₄–i₁", hl: () => [{ t: "hl", p: [[Rx, T], [Rx, Md], [M, Md], [M, B], [L, B], [L, T], [Rx, T]], color: "#1fa957" }],
                txt: "1 → (R₂) → 4 → (v₁) → 3 → (v₂) → 5 → (R₄) → 2 → (i₁) → 1. Daha uzun ama yine kapalı ve tekrarsız bir yol: bu da bir çevre." },
            { label: "Dal: R₃", hl: () => [{ t: "hl", p: [[L, Md], [M, Md]], color: "#7c4dff" }],
                txt: "2 ve 3 düğümleri arasında kalan parça bir <b>daldır</b>. Bu devrede 8 dal var: i₁, R₁, R₂, R₃, R₄, R₅, v₁, v₂ (her biri iki düğüm arasında)." },
        ];
        let m = o.mode || 0;
        const top = el(`<div></div>`);
        root.appendChild(top);
        chips(top, MODES.map((x) => x.label), m, (i) => { m = i; update(); });
        const stage = el(`<div class="ckt-wrap" style="margin-top:10px"></div>`);
        root.appendChild(stage);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        function update() {
            stage.innerHTML = C.svg({ w: 400, h: 260, items: MODES[m].hl().concat(base) });
            out.innerHTML = MODES[m].txt + `<br><span class="muted">Sayılar: n = 5 düğüm, b = 8 dal → bağımsız çevre sayısı b − n + 1 = 4.</span>`;
        }
        update();
    };

    /* ---------------- Ohm ve güç hesaplayıcı (Lab) ---------------- */
    W.ohmCalc = function (root) {
        const F = [
            { k: "V", n: "Gerilim", u: "V" }, { k: "I", n: "Akım", u: "A" }, { k: "R", n: "Direnç", u: "Ω" }, { k: "P", n: "Güç", u: "W" },
        ];
        const order = [];
        const vals = {};
        const form = el(`<div class="controls"></div>`);
        root.appendChild(form);
        const inputs = {};
        F.forEach((f) => {
            const node = el(`<label class="ctrl"><span class="ctrl-label"><span>${f.n} ${f.k}</span></span><div class="unit-row"><input class="text-input mono" type="text" inputmode="decimal" spellcheck="false" autocomplete="off" placeholder="boş bırak"><span class="u">${f.u}</span></div></label>`);
            const inp = node.querySelector("input");
            inp.addEventListener("input", () => {
                const i = order.indexOf(f.k);
                if (i >= 0) order.splice(i, 1);
                if (inp.value.trim()) order.push(f.k);
                inp.classList.remove("calc");
                update();
            });
            form.appendChild(node);
            inputs[f.k] = inp;
        });
        const actions = el(`<div class="ex-actions"><button type="button" class="btn small ghost" data-clear>Temizle</button></div>`);
        root.appendChild(actions);
        const out = el(`<div class="readout"></div>`);
        root.appendChild(out);
        actions.querySelector("[data-clear]").addEventListener("click", () => { order.length = 0; F.forEach((f) => { inputs[f.k].value = ""; inputs[f.k].classList.remove("calc", "err"); }); update(); });
        const SOLVE = {
            "I,V": (V, I) => ({ R: [V / I, "R = \\dfrac{V}{I}"], P: [V * I, "P = V \\cdot I"] }),
            "R,V": (V, R) => ({ I: [V / R, "I = \\dfrac{V}{R}"], P: [(V * V) / R, "P = \\dfrac{V^2}{R}"] }),
            "P,V": (V, P) => ({ I: [P / V, "I = \\dfrac{P}{V}"], R: [(V * V) / P, "R = \\dfrac{V^2}{P}"] }),
            "I,R": (I, R) => ({ V: [I * R, "V = I \\cdot R"], P: [I * I * R, "P = I^2 R"] }),
            "I,P": (I, P) => ({ V: [P / I, "V = \\dfrac{P}{I}"], R: [P / (I * I), "R = \\dfrac{P}{I^2}"] }),
            "P,R": (R, P) => ({ I: [Math.sqrt(P / R), "I = \\sqrt{P/R}"], V: [Math.sqrt(P * R), "V = \\sqrt{P R}"] }),
        };
        function update() {
            const given = [];
            for (let i = order.length - 1; i >= 0 && given.length < 2; i--) {
                const k = order[i], v = parseEng(inputs[k].value);
                inputs[k].classList.toggle("err", !isFinite(v));
                if (isFinite(v)) given.push(k);
            }
            F.forEach((f) => { if (!given.includes(f.k) && inputs[f.k].classList.contains("calc")) { inputs[f.k].value = ""; inputs[f.k].classList.remove("calc"); } });
            if (given.length < 2) {
                out.innerHTML = `Dört kutudan <b>herhangi ikisini</b> doldur; diğer ikisi hesaplanır. Ön ek kullanabilirsin: <code>4.7k</code>, <code>20m</code> (mili), <code>50u</code> (mikro), <code>1M</code> (mega).`;
                return;
            }
            const keys = given.slice().sort();
            given.forEach((k) => { vals[k] = parseEng(inputs[k].value); });
            const fn = SOLVE[keys.join(",")];
            const res = fn(vals[keys[0]], vals[keys[1]]);
            const lines = [];
            Object.keys(res).forEach((k) => {
                const [v, f] = res[k];
                inputs[k].value = isFinite(v) ? eng(v, "").trim() : "∞";
                inputs[k].classList.add("calc");
                lines.push(tex(`${f} = ${engT(v, F.find((x) => x.k === k).u)}`));
            });
            out.innerHTML = `Verilen: ${given.map((k) => tex(`${k} = ${engT(vals[k], F.find((x) => x.k === k).u)}`)).join(", ")}<br>${lines.join("<br>")}
                <br><span class="muted">Yeşil kutular hesaplandı. Başka bir kutuya yazarsan en son yazdığın iki değer esas alınır.</span>`;
        }
        update();
    };

    W._helpers = { el, tex, esc, fmt, ft, eng, engT, parseEng, slider, chips, plot };
    global.Widgets = W;
})(window);
