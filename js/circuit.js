/*
 * Ckt - basit devre şeması çizici (SVG).
 * Ckt.svg({ w, h, items }) → SVG metni.
 * İki uçlu elemanlar a ve b noktaları arasına (yatay ya da dikey) yerleşir; uçlara kadar olan teller otomatik çizilir.
 *
 * Öğeler (t):
 *   w     tel:                 { p: [[x, y], ...] }
 *   R     direnç:              { a, b, label, side }
 *   box   genel eleman (kutu): { a, b, inner, label, side }
 *   V     gerilim kaynağı:     { a, b, plus: "a" | "b", label }
 *   I     akım kaynağı:        { a, b, to: "a" | "b", label }
 *   DV/DI bağımlı kaynaklar (eşkenar dörtgen), V/I ile aynı seçenekler
 *   bat   pil:                 { a, b, plus }
 *   L, C  bobin, kondansatör;  A ampermetre;  lamp ampul
 *   arr   akım oku:            { p, d: "r" | "l" | "u" | "d", label, side }
 *   pm    + / − işareti:       { p, s: "+" | "-" }
 *   dot, term, node            düğüm noktası, açık uç, numaralı düğüm { p, s }
 *   txt   yazı:                { p, s, a: "start" | "middle" | "end", c }
 *   rect  kutu / gri bölge:    { x, y, w, h, c }
 *   hl    vurgulama yolu:      { p: [[x, y], ...], color }
 * Her öğe isteğe bağlı id (data-id) ve c (ek sınıf) alabilir.
 */
(function (global) {
    "use strict";

    const r1 = (n) => Math.round(n * 10) / 10;

    function escText(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // "R_1" → R₁ (tspan alt simge), "v_{S}" → v_S
    function lab(s) {
        return escText(s).replace(/_\{([^}]*)\}|_([^\s_])/g, (m, a, b) => `<tspan dy="4" font-size="0.78em">${a || b}</tspan><tspan dy="-4">​</tspan>`);
    }

    function text(x, y, s, o) {
        o = o || {};
        const lines = Array.isArray(s) ? s : [s];
        return lines.map((ln, i) => `<text x="${r1(x)}" y="${r1(y + i * 15)}" text-anchor="${o.a || "middle"}"${o.c ? ` class="${o.c}"` : ""}>${lab(ln)}</text>`).join("");
    }

    function pm(x, y, s, cls) {
        const c = cls ? `pm ${cls}` : "pm";
        return s === "+" ? `<path class="${c}" d="M${r1(x - 4)} ${r1(y)} h8 M${r1(x)} ${r1(y - 4)} v8"/>` : `<path class="${c}" d="M${r1(x - 4)} ${r1(y)} h8"/>`;
    }

    // Elemanın gövde yarı uzunluğu (eksen boyunca)
    const HALF = { R: 20, box: 16, V: 16, I: 16, DV: 18, DI: 18, bat: 5, L: 20, C: 5, A: 14, lamp: 14 };
    // Etiketin gövdeden uzaklığı (eksene dik)
    const WIDE = { R: 9, box: 12, V: 17, I: 17, DV: 19, DI: 19, bat: 13, L: 8, C: 13, A: 15, lamp: 15 };

    function zigzag() {
        let d = "M-20 0 L-17 0";
        const xs = [-14, -8, -2, 4, 10, 16];
        xs.forEach((x, i) => { d += ` L${x} ${i % 2 ? 7 : -7}`; });
        return `<path class="res" d="${d} L20 0"/>`;
    }

    function arrowLocal(toB) {
        return toB
            ? `<path class="src-in" d="M-9 0 H5"/><path class="src-head" d="M10 0 L3 -5 L3 5 Z"/>`
            : `<path class="src-in" d="M9 0 H-5"/><path class="src-head" d="M-10 0 L-3 -5 L-3 5 Z"/>`;
    }

    function body(it) {
        switch (it.t) {
            case "R": return zigzag();
            case "box": return `<rect class="elem" x="-16" y="-11" width="32" height="22" rx="2"/>`;
            case "V": return `<circle class="src" r="16"/>`;
            case "I": return `<circle class="src" r="16"/>${arrowLocal(it.to !== "a")}`;
            case "DV": return `<path class="src" d="M-18 0 L0 -18 L18 0 L0 18 Z"/>`;
            case "DI": return `<path class="src" d="M-18 0 L0 -18 L18 0 L0 18 Z"/>${arrowLocal(it.to !== "a")}`;
            case "bat": {
                const pa = it.plus !== "b" ? -5 : 5;
                return `<path class="plate" d="M${pa} -13 V13"/><path class="plate thick" d="M${-pa} -7 V7"/>`;
            }
            case "L": return `<path class="res" d="M-20 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0"/>`;
            case "C": return `<path class="plate" d="M-5 -13 V13 M5 -13 V13"/>`;
            case "A": return `<circle class="meter" r="14"/>`;
            case "lamp": return `<circle class="elem" r="14"/><path class="wire" d="M-9 -9 L9 9 M-9 9 L9 -9"/>`;
        }
        return "";
    }

    function twoTerminal(it) {
        const [ax, ay] = it.a, [bx, by] = it.b;
        const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
        const mx = (ax + bx) / 2 + (it.shift || 0) * ux, my = (ay + by) / 2 + (it.shift || 0) * uy;
        const h = HALF[it.t];
        const p1 = [mx - ux * h, my - uy * h], p2 = [mx + ux * h, my + uy * h];
        const ang = r1(Math.atan2(dy, dx) * 180 / Math.PI);
        let s = `<path class="wire" d="M${ax} ${ay} L${r1(p1[0])} ${r1(p1[1])} M${r1(p2[0])} ${r1(p2[1])} L${bx} ${by}"/>`;
        s += `<g transform="translate(${r1(mx)} ${r1(my)}) rotate(${ang})">${body(it)}</g>`;
        // Kaynak içindeki + / − işaretleri her zaman dik durur
        if (it.t === "V" || it.t === "DV") {
            const k = it.plus === "b" ? 1 : -1;
            s += pm(mx + ux * 7 * k, my + uy * 7 * k, "+", "src-pm") + pm(mx - ux * 7 * k, my - uy * 7 * k, "-", "src-pm");
        }
        if (it.t === "bat" && it.signs !== false) {
            const k = it.plus === "b" ? 1 : -1, nx = -uy, ny = ux;
            s += pm(mx + ux * 9 * k + nx * 14, my + uy * 9 * k + ny * 14, "+") + pm(mx - ux * 9 * k + nx * 14, my - uy * 9 * k + ny * 14, "-");
        }
        if (it.inner !== undefined) s += text(mx, my + 1, it.inner, { c: "inner" });
        if (it.t === "A") s += text(mx, my + 1, it.inner === undefined ? "A" : "", { c: "inner" });
        if (it.label !== undefined && it.label !== "") {
            const vertical = Math.abs(uy) > Math.abs(ux);
            const side = it.side || (vertical ? "r" : "t");
            const off = WIDE[it.t] + 6;
            const lines = Array.isArray(it.label) ? it.label : [it.label];
            const n = lines.length;
            if (side === "r") s += text(mx + off, my - (n - 1) * 7.5, lines, { a: "start", c: it.lc });
            else if (side === "l") s += text(mx - off, my - (n - 1) * 7.5, lines, { a: "end", c: it.lc });
            else if (side === "t") s += text(mx, my - off - (n - 1) * 15 - 2, lines, { c: it.lc });
            else s += text(mx, my + off + 4, lines, { c: it.lc });
        }
        return s;
    }

    const ROT = { r: 0, d: 90, l: 180, u: 270 };

    function item(it) {
        let s = "";
        switch (it.t) {
            case "w": s = `<path class="wire" d="M${it.p.map((q) => `${q[0]} ${q[1]}`).join(" L")}"/>`; break;
            case "hl": s = `<path class="hl" style="stroke:${it.color || "var(--orange)"}" d="M${it.p.map((q) => `${q[0]} ${q[1]}`).join(" L")}"/>`; break;
            case "dot": s = `<circle class="dot" cx="${it.p[0]}" cy="${it.p[1]}" r="${it.r || 3.6}"/>`; break;
            case "term": s = `<circle class="term" cx="${it.p[0]}" cy="${it.p[1]}" r="4.5"/>`; break;
            case "node": s = `<circle class="dot" cx="${it.p[0]}" cy="${it.p[1]}" r="3.6"/>` + (it.s !== undefined ? (() => {
                const [lx, ly] = it.lp || [it.p[0], it.p[1] - 16];
                return `<circle class="node-c" cx="${lx}" cy="${ly}" r="9"/>${text(lx, ly + 1, it.s, { c: "inner" })}`;
            })() : ""); break;
            case "pm": s = pm(it.p[0], it.p[1], it.s); break;
            case "txt": s = text(it.p[0], it.p[1], it.s, { a: it.a, c: it.tc }); break;
            case "rect": s = `<rect class="${it.cls || "blob"}" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="${it.rx === undefined ? 10 : it.rx}"/>`; break;
            case "arr": {
                const [x, y] = it.p;
                s = `<path class="arrow" d="M6 0 L-5 -5 L-5 5 Z" transform="translate(${x} ${y}) rotate(${ROT[it.d || "r"]})"/>`;
                if (it.label !== undefined) {
                    const horiz = it.d === "r" || it.d === "l" || !it.d;
                    const side = it.side || (horiz ? "t" : "r");
                    if (side === "t") s += text(x, y - 14, it.label);
                    else if (side === "b") s += text(x, y + 16, it.label);
                    else if (side === "r") s += text(x + 10, y, it.label, { a: "start" });
                    else s += text(x - 10, y, it.label, { a: "end" });
                }
                break;
            }
            default: s = twoTerminal(it);
        }
        const cls = ["it", it.c || "", it.id ? "clickable" : ""].join(" ").trim();
        return `<g class="${cls}"${it.id ? ` data-id="${it.id}"` : ""}>${s}</g>`;
    }

    function svg(spec) {
        // Kenardaki etiketler taşmasın diye çevreye boşluk
        const pad = spec.pad === undefined ? 22 : spec.pad;
        const style = spec.maxw === false ? "" : ` style="max-width:${(spec.maxw || spec.w) + 2 * pad}px"`;
        return `<svg class="ckt" viewBox="${-pad} ${-pad / 2} ${spec.w + 2 * pad} ${spec.h + pad}"${style} role="img" aria-label="${escText(spec.title || "Devre şeması")}">${spec.items.map(item).join("")}</svg>`;
    }

    global.Ckt = { svg, item, text, lab, pm };
})(window);
