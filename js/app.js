/*
 * Madam Elektrik - uygulama kabuğu: yönlendirme (hash), sayfalar, ilerleme, tema, PWA.
 * Sayfalar: #/  ·  #/konu/:id  ·  #/ders/:id  ·  #/lab[?m=...]
 */
(function () {
    "use strict";

    const view = document.getElementById("view");

    /* ---------------- Depolama (localStorage erişilemezse sessizce geç) ---------------- */
    const store = {
        get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* yok say */ } },
    };
    let progress = store.get("madamel_progress", {});

    /* ---------------- Ders listesi ---------------- */
    const chapters = Object.values(CHAPTERS).sort((a, b) => a.no - b.no);
    const lessons = [];
    chapters.forEach((ch) => ch.sections.forEach((s) => s.lessons.forEach((l, i) => lessons.push(Object.assign({}, l, { chapter: ch, section: s, idxInSection: i })))));
    const lessonById = {};
    lessons.forEach((l, i) => { l.index = i; lessonById[l.id] = l; });
    const chapterLessons = (ch) => lessons.filter((l) => l.chapter === ch);

    const doneCount = (ch) => (ch ? chapterLessons(ch) : lessons).filter((l) => progress[l.id]).length;
    const pct = (ch) => Math.round((doneCount(ch) / (ch ? chapterLessons(ch) : lessons).length) * 100);

    function esc(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function toast(msg) {
        const t = document.getElementById("toast");
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toast._t);
        toast._t = setTimeout(() => t.classList.remove("show"), 2200);
    }

    function renderMath(el) {
        if (typeof window.renderMathInElement !== "function") return;
        try {
            renderMathInElement(el, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false },
                ],
                throwOnError: false,
                ignoredClasses: ["no-math"],
            });
        } catch (e) { /* KaTeX yoksa düz metin kalır */ }
    }

    /* ---------------- Ana sayfa ---------------- */
    function pageHome() {
        const last = lessonById[store.get("madamel_last", "")];
        const next = last || lessons.find((l) => !progress[l.id]) || lessons[0];
        return `
        <section class="hero">
            <svg class="hero-art" viewBox="0 0 200 160" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10 130 H40 L48 116 L60 144 L72 116 L84 144 L96 116 L104 130 H134" stroke-width="4"/>
                <path d="M134 130 V100 M134 100 H150 M150 88 V112 M160 94 V106 M160 100 H176 V130 H134" stroke-width="3"/>
                <path d="M118 14 L84 70 H112 L92 112 L146 52 H118 L134 14 Z" fill="#ffd23f" stroke="#fff" stroke-width="4"/>
            </svg>
            <h1>Elektrik devrelerini en basit hâliyle öğren</h1>
            <p>Her konu önce “basitçe” anlatılır, sonra tanım, adım adım örnek, dokunarak oynayabileceğin bir devre ve kısa bir test gelir.</p>
            <div class="hero-actions">
                <a class="btn" href="#/ders/${next.id}">${last ? "▶ Kaldığın yerden devam et" : "▶ Derse başla"}</a>
                <a class="btn ghost" href="#/lab">⚡ Devre Lab</a>
            </div>
        </section>
        <div class="stat-row">
            <div class="stat-box"><div class="num">${doneCount()}</div><div class="lbl">tamamlanan ders</div></div>
            <div class="stat-box"><div class="num">${lessons.length}</div><div class="lbl">ders · ${chapters.length} bölüm</div></div>
            <div class="stat-box"><div class="num">%${pct()}</div><div class="lbl">ilerleme</div></div>
        </div>
        ${last ? `<div class="card" style="margin-top:16px">
            <h2 class="section-title">Kaldığın yer</h2>
            <a class="lesson-row${progress[last.id] ? " done" : ""}" href="#/ders/${last.id}">
                <div class="lesson-check">${progress[last.id] ? "✓" : last.idxInSection + 1}</div>
                <div><div class="lt">${esc(last.title)}</div><div class="ls">${esc(last.chapter.title)} · ${last.section.no} ${esc(last.section.title)}</div></div>
                <span class="arrow">›</span>
            </a></div>` : ""}
        <a class="card lesson-row" href="#/testler" style="margin-top:16px;padding:18px 20px">
            <div class="chapter-no" style="background:var(--green);color:#fff">🎯</div>
            <div><div class="lt">Testler ve alıştırmalar</div><div class="ls">${PRACTICE.tests.length} çoktan seçmeli test · ${PRACTICE.problemSets.reduce((a, s) => a + s.problems.length, 0)} alıştırmanın adım adım çözümü (ders ödevleri dahil)</div></div>
            <span class="arrow">›</span>
        </a>
        <div class="card" style="margin-top:16px">
            <h2 class="section-title">Konular · ${esc(COURSE.title)}</h2>
            ${chapterGrid()}
        </div>
        <div class="card">
            <h2 class="section-title">Her derste</h2>
            <div class="chapter-grid">
                <div class="chapter-card"><div class="chapter-no" style="background:var(--orange-pale);color:var(--orange)">💡</div><div><div class="ct">Basitçe</div><div class="cs">Konunun özü, günlük dille</div></div></div>
                <div class="chapter-card"><div class="chapter-no">📘</div><div><div class="ct">Tanım ve formüller</div><div class="cs">Ders notundaki hâliyle</div></div></div>
                <div class="chapter-card"><div class="chapter-no" style="background:var(--purple-pale);color:var(--purple)">🧪</div><div><div class="ct">Etkileşimli devre</div><div class="cs">Değeri kaydır, akımı izle</div></div></div>
                <div class="chapter-card"><div class="chapter-no" style="background:var(--green-pale);color:var(--green)">🎯</div><div><div class="ct">Adım adım örnek + test</div><div class="cs">Kendini hemen dene</div></div></div>
            </div>
        </div>
        <div class="card">
            <h2 class="section-title">Telefona / tablete ekle</h2>
            <p class="muted" style="margin:0">Android (Chrome): menü ⋮ → <b>Ana ekrana ekle</b> ya da <b>Uygulamayı yükle</b>. iPhone/iPad (Safari): paylaş ⎋ → <b>Ana Ekrana Ekle</b>. Eklendikten sonra uygulama gibi tam ekran açılır ve bir kez açılan dersler internetsiz de çalışır.</p>
            <div class="ex-actions"><button class="btn small" type="button" data-install hidden>📲 Şimdi yükle</button></div>
        </div>`;
    }

    /* ---------------- Bölüm listesi ve bölüm sayfası ---------------- */
    function chapterGrid() {
        return `<div class="chapter-grid">${COURSE.chapters.map((c) => {
            const ch = CHAPTERS[c.id];
            if (!ch) return `<div class="chapter-card locked" title="Yakında"><div class="chapter-no">${c.no}</div><div><div class="ct">${esc(c.title)}</div><div class="cs">Yakında</div></div></div>`;
            const p = pct(ch);
            return `<a class="chapter-card available" href="#/konu/${c.id}"><div class="chapter-no">${c.no}</div><div style="flex:1;min-width:0"><div class="ct">${esc(c.title)}</div><div class="cs">${esc(c.sub)}</div>
                <div class="progress-bar" style="height:5px;margin-top:6px"><span style="width:${p}%"></span></div></div></a>`;
        }).join("")}</div>`;
    }

    function pageChapters() {
        return `
        <div class="page-head">
            <div class="crumbs"><a href="#/">Ana Sayfa</a> › <span>Konular</span></div>
            <h1>${esc(COURSE.title)}</h1>
            <p>${esc(COURSE.source)}. Hazır olanlara dokunup başla; diğerleri yakında eklenecek.</p>
        </div>
        <div class="card">${chapterGrid()}</div>`;
    }

    function pageChapter(id) {
        const chapter = CHAPTERS[id];
        if (!chapter) return pageNotFound();
        const secs = chapter.sections.map((s) => {
            const d = s.lessons.filter((l) => progress[l.id]).length;
            const rows = s.lessons.map((l, i) => `
                <a class="lesson-row${progress[l.id] ? " done" : ""}" href="#/ders/${l.id}">
                    <div class="lesson-check">${progress[l.id] ? "✓" : i + 1}</div>
                    <div><div class="lt">${esc(l.title)}</div><div class="ls">${l.summary}</div></div>
                    <span class="arrow">›</span>
                </a>`).join("");
            return `<div class="card section-block">
                <div class="section-head"><span class="section-num">${s.no}</span><h2>${esc(s.title)}</h2>
                <span class="pill ${d === s.lessons.length ? "green" : "gray"}">${d}/${s.lessons.length}</span></div>
                <div class="lesson-list">${rows}</div>
                ${practiceLinks(s.no) ? `<div class="section-title" style="margin:14px 0 6px">Kendini sına</div><div class="lesson-list">${practiceLinks(s.no)}</div>` : ""}</div>`;
        }).join("");
        return `
        <div class="page-head">
            <div class="crumbs"><a href="#/konular">Konular</a> › <span>Bölüm ${chapter.no}</span></div>
            <h1>${chapter.no}. ${esc(chapter.title)}</h1>
            <p>${esc(chapter.intro)}</p>
            <div class="ex-actions"><a class="btn small ghost" href="#/ozet/${chapter.id}">📄 Formül özeti (kopya kâğıdı)</a></div>
            <div style="display:flex;align-items:center;gap:12px;margin-top:14px">
                <div class="progress-bar" style="flex:1"><span style="width:${pct(chapter)}%"></span></div>
                <b style="color:var(--blue-deep);font-family:Sora,sans-serif">%${pct(chapter)}</b>
            </div>
        </div>
        ${secs}`;
    }

    /* ---------------- Formül özeti (kopya kâğıdı) ---------------- */
    function pageSummary(id) {
        const chapter = CHAPTERS[id];
        if (!chapter) return pageNotFound();
        const kinds = { def: ["📘", "Tanım"], formula: ["🧮", "Formül"], table: ["📊", "Tablo"] };
        const secs = chapter.sections.map((s) => {
            const items = [];
            s.lessons.forEach((l) => l.blocks.forEach((b) => {
                if (!kinds[b.t]) return;
                const title = b.title || kinds[b.t][1];
                items.push(`<div class="sum-item sum-${b.t}">
                    <div class="sum-title">${kinds[b.t][0]} ${title}<a class="sum-src no-print" href="#/ders/${l.id}" title="Derse git">${esc(l.title)} ›</a></div>
                    <div class="sum-body">${b.html}</div></div>`);
            }));
            return items.length ? `<section class="sum-section"><h2 class="sum-head"><span class="section-num">${s.no}</span> ${esc(s.title)}</h2><div class="sum-grid">${items.join("")}</div></section>` : "";
        }).join("");
        return `
        <div class="page-head no-print">
            <div class="crumbs"><a href="#/konu/${chapter.id}">${chapter.no}. ${esc(chapter.title)}</a> › <span>Formül özeti</span></div>
            <h1>Formül Özeti · ${esc(chapter.title)}</h1>
            <p>Bölümdeki tüm tanım, formül ve tabloların bir arada hâli. Her kutudaki bağlantı ilgili derse götürür.</p>
            <div class="ex-actions"><button type="button" class="btn small" data-print>🖨️ Yazdır / PDF kaydet</button></div>
        </div>
        <div class="print-only sum-print-head"><b>${esc(COURSE.title)} · ${chapter.no}. ${esc(chapter.title)}</b> — Formül özeti</div>
        <div class="summary">${secs}</div>`;
    }

    /* ---------------- Ders sayfası ---------------- */
    let widgetQueue = [];

    function box(cls, icon, title, html) {
        return `<div class="box ${cls}"><div class="box-title">${icon} ${title}</div><div>${html}</div></div>`;
    }

    function renderBlock(b, bi) {
        switch (b.t) {
            case "p": return `<div class="card">${b.html.trim().startsWith("<") ? b.html : `<p>${b.html}</p>`}</div>`;
            case "simple": return box("simple", "💡", "Basitçe", b.html);
            case "def": return box("def", "📘", b.title || "Tanım", b.html);
            case "formula": return box("formula", "🧮", b.title || "Formül", b.html);
            case "tip": return box("tip", "✅", b.title || "İpucu", b.html);
            case "warn": return box("warn", "⚠️", b.title || "Dikkat", b.html);
            case "table": return `<div class="card"><div class="table-wrap">${b.html}</div></div>`;
            case "fig": return `<div class="card fig"><div class="ckt-wrap">${b.html}</div>${b.cap ? `<div class="fig-cap">${b.cap}</div>` : ""}</div>`;
            case "example": {
                const steps = b.steps.map((s, i) => `<div class="ex-step" hidden><span class="sn">${i + 1}</span><div class="sb">${s}</div></div>`).join("");
                return `<div class="card example" data-example>
                    <div class="box-title" style="color:var(--blue-deep)">✏️ Örnek</div>
                    <div class="ex-q">${b.q}</div>
                    <div class="ex-steps">${steps}<div class="ex-answer" hidden><b>Sonuç:</b> ${b.answer}</div></div>
                    <div class="ex-actions">
                        <button type="button" class="btn small" data-step>Çözümü adım adım göster</button>
                        <button type="button" class="btn small ghost" data-all>Tamamını göster</button>
                    </div></div>`;
            }
            case "quiz": {
                const opts = b.options.map((o, i) => `<button type="button" class="q-opt" data-i="${i}">${o.replace(/\$([^$]+)\$/g, (m, x) => `$\\displaystyle ${x}$`)}</button>`).join("");
                return `<div class="card quiz" data-quiz data-correct="${b.correct}">
                    <div class="box-title" style="color:var(--green)">🎯 Kendini dene</div>
                    <div class="q-text">${b.q}</div>
                    <div class="q-options">${opts}</div>
                    <div class="q-feedback ok" hidden><b>Doğru! 🎉</b> ${b.why || ""}</div>
                    <div class="q-feedback no" hidden><b>Olmadı.</b> Doğru cevap: <b>${b.options[b.correct]}</b>. ${b.why || ""}</div>
                </div>`;
            }
            case "widget":
                widgetQueue.push({ id: `w${bi}`, name: b.name, opts: b.opts });
                return `<div class="card widget">
                    <div class="widget-head"><span class="wi">🧪</span><span class="wt">${esc(b.title)}</span></div>
                    <div class="widget-body">${b.desc ? `<p class="widget-desc">${b.desc}</p>` : ""}<div data-widget="w${bi}"></div></div>
                </div>`;
        }
        return "";
    }

    function pageLesson(id) {
        const l = lessonById[id];
        if (!l) return pageNotFound();
        store.set("madamel_last", id);
        widgetQueue = [];
        const prev = lessons[l.index - 1], next = lessons[l.index + 1];
        const body = l.blocks.map(renderBlock).join("");
        const done = !!progress[l.id];
        return `
        <div class="lesson-hero">
            <div class="crumbs"><a href="#/konu/${l.chapter.id}">${l.chapter.no}. ${esc(l.chapter.title)}</a> › <span>${l.section.no} ${esc(l.section.title)}</span></div>
            <h1>${esc(l.title)}</h1>
            <p class="lead">${l.summary} <span class="pill gray" style="margin-left:4px">Ders ${l.idxInSection + 1}/${l.section.lessons.length}</span></p>
        </div>
        <div class="lesson-body">${body}
            ${l.idxInSection === l.section.lessons.length - 1 && practiceLinks(l.section.no) ? `<div class="card"><div class="box-title" style="color:var(--green)">🎯 ${l.section.no} bitti — kendini sına</div><div class="lesson-list">${practiceLinks(l.section.no)}</div></div>` : ""}
            <div class="card lesson-done-bar">
                <div><b>${done ? "Bu dersi tamamladın ✓" : "Bu dersi bitirdin mi?"}</b><div class="muted" style="font-size:13px">İlerlemen bu cihazda saklanır.</div></div>
                <button type="button" class="btn ${done ? "ghost" : "success"}" data-done>${done ? "Tamamlanmadı olarak işaretle" : "✓ Anladım, tamamla"}</button>
            </div>
            <div class="lesson-nav">
                ${prev ? `<a class="btn ghost nav-prev" href="#/ders/${prev.id}"><span><span class="nl">‹ Önceki</span>${esc(prev.title)}</span></a>` : "<span></span>"}
                ${next ? `<a class="btn nav-next" href="#/ders/${next.id}"><span><span class="nl">${next.chapter === l.chapter ? "Sonraki ›" : `Sonraki bölüm: ${esc(next.chapter.title)} ›`}</span>${esc(next.title)}</span></a>` : `<a class="btn nav-next" href="#/konu/${l.chapter.id}">Bölüm özeti ›</a>`}
            </div>
        </div>`;
    }

    function bindLesson(id) {
        view.querySelectorAll("[data-example]").forEach((ex) => {
            const steps = Array.from(ex.querySelectorAll(".ex-step"));
            const ans = ex.querySelector(".ex-answer");
            const bStep = ex.querySelector("[data-step]"), bAll = ex.querySelector("[data-all]");
            let shown = 0;
            const finish = () => { ans.hidden = false; bStep.hidden = true; bAll.hidden = true; };
            bStep.addEventListener("click", () => {
                if (shown < steps.length) { steps[shown++].hidden = false; bStep.textContent = shown < steps.length ? "Sonraki adım ›" : "Sonucu göster"; }
                else finish();
            });
            bAll.addEventListener("click", () => { steps.forEach((s) => (s.hidden = false)); finish(); });
        });
        view.querySelectorAll("[data-quiz]").forEach((q) => {
            const correct = Number(q.dataset.correct);
            q.querySelectorAll(".q-opt").forEach((b) => b.addEventListener("click", () => {
                const i = Number(b.dataset.i);
                q.querySelectorAll(".q-opt").forEach((x) => {
                    x.disabled = true;
                    if (Number(x.dataset.i) === correct) x.classList.add("correct");
                });
                if (i !== correct) b.classList.add("wrong");
                q.querySelector(i === correct ? ".q-feedback.ok" : ".q-feedback.no").hidden = false;
            }));
        });
        const doneBtn = view.querySelector("[data-done]");
        if (doneBtn) doneBtn.addEventListener("click", () => {
            if (progress[id]) delete progress[id]; else progress[id] = true;
            store.set("madamel_progress", progress);
            if (progress[id]) {
                toast("Harika! Ders tamamlandı ✓");
                const next = lessons[lessonById[id].index + 1];
                if (next) { location.hash = "#/ders/" + next.id; return; }
            }
            route();
        });
        widgetQueue.forEach((w) => mountWidget(view.querySelector(`[data-widget="${w.id}"]`), w.name, w.opts));
    }

    function mountWidget(host, name, opts) {
        if (!host || !Widgets[name]) return;
        try { Widgets[name](host, opts || {}); } catch (e) {
            host.innerHTML = `<p class="muted">Bu araç yüklenemedi.</p>`;
            console.error(e);
        }
    }

    /* ---------------- Testler ve alıştırmalar ---------------- */
    const tests = PRACTICE.tests, problemSets = PRACTICE.problemSets;
    let testScores = store.get("madamel_tests", {});
    let solved = store.get("madamel_solved", {});
    const solvedCount = (set) => set.problems.filter((p) => solved[`${set.id}#${p.no}`]).length;
    const practiceFor = (secNo) => ({
        tests: tests.filter((t) => t.sections.includes(secNo)),
        sets: problemSets.filter((s) => s.sections.includes(secNo)),
    });

    // Bir test/alıştırma birden çok alt konuyu kapsıyorsa yalnızca son alt konusunda gösterilir
    function practiceLinks(secNo) {
        const { tests: ts, sets } = practiceFor(secNo);
        const last = (x) => x.sections[x.sections.length - 1] === secNo;
        return ts.filter(last).map((t) => `<a class="lesson-row" href="#/test/${t.id}"><div class="lesson-check" style="border-color:var(--green);color:var(--green)">🎯</div><div><div class="lt">${esc(t.title)}</div><div class="ls">${t.questions.length} soru · çoktan seçmeli${testScores[t.id] ? ` · en iyi ${testScores[t.id].best}/${t.questions.length}` : ""}</div></div><span class="arrow">›</span></a>`).join("") +
            sets.filter(last).map((s) => `<a class="lesson-row" href="#/problemler/${s.id}"><div class="lesson-check" style="border-color:var(--purple);color:var(--purple)">📚</div><div><div class="lt">${esc(s.title)}</div><div class="ls">${s.problems.length} alıştırma · ${solvedCount(s)} çözüldü</div></div><span class="arrow">›</span></a>`).join("");
    }

    function pagePractice() {
        const grouped = (list, render) => chapters.map((ch) => {
            const items = list.filter((x) => x.chapter === ch.id);
            return items.length ? `<div class="section-title" style="margin:14px 0 4px">${ch.no}. ${esc(ch.title)}</div>${items.map(render).join("")}` : "";
        }).join("");
        const tcards = grouped(tests, (t) => {
            const sc = testScores[t.id];
            return `<a class="lesson-row" href="#/test/${t.id}">
                <div class="lesson-check" style="${sc ? "background:var(--green);border-color:var(--green);color:#fff" : ""}">${sc ? sc.best : "🎯"}</div>
                <div><div class="lt">${esc(t.title)}</div><div class="ls">${esc(t.desc)}</div></div>
                <span class="pill ${sc ? "green" : "gray"}" style="margin-left:auto;white-space:nowrap">${sc ? `en iyi ${sc.best}/${t.questions.length}` : `${t.questions.length} soru`}</span></a>`;
        });
        const pcards = grouped(problemSets, (s) => {
            const n = solvedCount(s);
            return `<a class="lesson-row${n === s.problems.length ? " done" : ""}" href="#/problemler/${s.id}">
                <div class="lesson-check">${n === s.problems.length ? "✓" : "📚"}</div>
                <div><div class="lt">${esc(s.title)}</div><div class="ls">${esc(s.desc || "")}</div></div>
                <span class="pill ${n ? "green" : "gray"}" style="margin-left:auto;white-space:nowrap">${n}/${s.problems.length}</span></a>`;
        });
        return `
        <div class="page-head">
            <div class="crumbs"><a href="#/">Ana Sayfa</a> › <span>Testler</span></div>
            <h1>Testler ve Problemler</h1>
            <p>Çoktan seçmeli testlerle kendini dene; ders notlarındaki ödevlerin ve alıştırmaların adım adım çözümlerine bak.</p>
        </div>
        <div class="card"><div class="section-head"><span class="section-num">🎯</span><h2>Çoktan seçmeli testler</h2></div>
            <p class="muted" style="margin:0 0 10px;font-size:14px">Her test 10 soru. Bitirince puanını ve her sorunun açıklamasını görürsün.</p>
            <div class="lesson-list">${tcards}</div></div>
        <div class="card"><div class="section-head"><span class="section-num" style="background:var(--purple)">📚</span><h2>Alıştırmalar</h2></div>
            <p class="muted" style="margin:0 0 10px;font-size:14px">Kâğıt kalemle çözülecek sorular. Önce kendin dene, sonra çözümü aç.</p>
            <div class="lesson-list">${pcards}</div></div>`;
    }

    function pageTest(id) {
        const t = tests.find((x) => x.id === id);
        if (!t) return pageNotFound();
        const sc = testScores[t.id];
        // Şıklar her açılışta karışır; data-i orijinal indeksi tutar
        const shuffled = (n) => {
            const a = Array.from({ length: n }, (_, i) => i);
            for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
            return a;
        };
        const big = (o) => o.replace(/\$([^$]+)\$/g, (m, x) => `$\\displaystyle ${x}$`);
        const qs = t.questions.map((q, qi) => `
            <div class="card quiz" data-q="${qi}">
                <div class="box-title" style="color:var(--blue-deep)">Soru ${qi + 1} <span class="q-mark" style="margin-left:auto"></span></div>
                <div class="q-text">${q.q}</div>
                <div class="q-options">${shuffled(q.options.length).map((oi, pos) => `<button type="button" class="q-opt" data-i="${oi}"><span class="q-letter">${"ABCD"[pos]}</span> ${big(q.options[oi])}</button>`).join("")}</div>
                <div class="q-feedback" hidden><b>Açıklama:</b> ${q.why}</div>
            </div>`).join("");
        return `
        <div class="page-head">
            <div class="crumbs"><a href="#/testler">Testler</a> › <span>${esc(t.title)}</span></div>
            <h1>${esc(t.title)}</h1>
            <p>${esc(t.desc)}${sc ? ` <span class="pill green">En iyi: ${sc.best}/${t.questions.length}</span>` : ""}</p>
        </div>
        <div id="testResult"></div>
        <div class="lesson-body">${qs}
            <div class="card lesson-done-bar">
                <div><b data-answered>0 / ${t.questions.length} cevaplandı</b><div class="muted" style="font-size:13px">Boş bıraktıkların yanlış sayılır.</div></div>
                <button type="button" class="btn success" data-finish>Testi bitir</button>
            </div>
        </div>`;
    }

    function bindTest(id) {
        const t = tests.find((x) => x.id === id);
        if (!t) return;
        const answers = new Array(t.questions.length).fill(null);
        let finished = false;
        const answeredEl = view.querySelector("[data-answered]");
        view.querySelectorAll("[data-q]").forEach((card) => {
            const qi = Number(card.dataset.q);
            card.querySelectorAll(".q-opt").forEach((b) => b.addEventListener("click", () => {
                if (finished) return;
                answers[qi] = Number(b.dataset.i);
                card.querySelectorAll(".q-opt").forEach((x) => x.classList.toggle("selected", x === b));
                answeredEl.textContent = `${answers.filter((a) => a !== null).length} / ${t.questions.length} cevaplandı`;
            }));
        });
        view.querySelector("[data-finish]").addEventListener("click", (e) => {
            if (finished) { route(); return; }
            finished = true;
            let score = 0;
            view.querySelectorAll("[data-q]").forEach((card) => {
                const qi = Number(card.dataset.q), q = t.questions[qi], a = answers[qi];
                const ok = a === q.correct;
                if (ok) score++;
                card.querySelectorAll(".q-opt").forEach((x) => {
                    x.disabled = true;
                    const i = Number(x.dataset.i);
                    if (i === q.correct) x.classList.add("correct");
                    else if (i === a) x.classList.add("wrong");
                });
                const fb = card.querySelector(".q-feedback");
                fb.className = "q-feedback " + (ok ? "ok" : "no");
                fb.hidden = false;
                card.querySelector(".q-mark").innerHTML = ok ? `<span class="pill green">✓ Doğru</span>` : `<span class="pill" style="background:var(--red-pale);color:var(--red)">${a === null ? "Boş" : "✗ Yanlış"}</span>`;
            });
            const n = t.questions.length, prev = testScores[t.id];
            testScores[t.id] = { best: Math.max(score, prev ? prev.best : 0), last: score };
            store.set("madamel_tests", testScores);
            const pctv = Math.round((score / n) * 100);
            const msg = pctv === 100 ? "Mükemmel! Hepsi doğru 🎉" : pctv >= 70 ? "Çok iyi! Yanlışlarının açıklamalarına bir göz at." : pctv >= 40 ? "Fena değil. Yanlış yaptığın konuların derslerine dönmek iyi olur." : "Konuları tekrar edip yeniden dene — açıklamalar yardımcı olacak.";
            const res = view.querySelector("#testResult");
            res.innerHTML = `<div class="card" style="margin-bottom:16px;text-align:center">
                <div class="section-title">Sonuç</div>
                <div style="font-family:Sora,sans-serif;font-weight:800;font-size:44px;color:${pctv >= 70 ? "var(--green)" : pctv >= 40 ? "var(--orange)" : "var(--red)"}">${score} / ${n}</div>
                <div class="progress-bar" style="max-width:320px;margin:8px auto"><span style="width:${pctv}%"></span></div>
                <p style="margin:8px 0 14px">${msg}</p>
                <div class="ex-actions" style="justify-content:center"><button type="button" class="btn" data-retry>↻ Tekrar çöz</button><a class="btn ghost" href="#/testler">Testlere dön</a></div></div>`;
            res.querySelector("[data-retry]").addEventListener("click", () => route());
            e.target.textContent = "↻ Tekrar çöz";
            res.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    function pageProblems(id) {
        const set = problemSets.find((x) => x.id === id);
        if (!set) return pageNotFound();
        const solBlock = (p) => {
            if (p.parts) {
                return p.parts.map((pt) => `<div class="ex-step"><span class="sn" style="width:auto;padding:0 8px;border-radius:12px">${pt.l}</span><div class="sb">
                    <div><b>Cevap:</b> ${pt.a}</div>
                    ${pt.s && pt.s.length ? `<div class="muted" style="margin-top:4px">${pt.s.join("<br>")}</div>` : ""}
                </div></div>`).join("");
            }
            return `<div class="ex-answer"><b>Cevap:</b> ${p.a}</div>` +
                (p.s || []).map((s, i) => `<div class="ex-step"><span class="sn">${i + 1}</span><div class="sb">${s}</div></div>`).join("");
        };
        const cards = set.problems.map((p) => {
            const key = `${set.id}#${p.no}`, isSolved = !!solved[key];
            const partsQ = p.parts ? `<div class="part-grid">${p.parts.map((pt) => `<div><b>(${pt.l})</b> ${pt.q}</div>`).join("")}</div>` : "";
            return `<div class="card problem${isSolved ? " solved" : ""}" data-key="${key}">
                <div class="box-title" style="color:var(--purple)">Alıştırma ${p.no}
                    <button type="button" class="solve-toggle" data-solve>${isSolved ? "✓ Çözdüm" : "Çözdüm olarak işaretle"}</button></div>
                <div class="q-text">${p.q}</div>${partsQ}
                <div class="ex-actions">
                    <button type="button" class="btn small" data-show>💡 Çözümü göster</button>
                </div>
                <div class="ex-steps" data-sol hidden>
                    ${p.note ? `<div class="box warn" style="padding:10px 14px"><div class="box-title" style="margin-bottom:4px">⚠️ Not</div>${p.note}</div>` : ""}
                    ${solBlock(p)}
                </div>
            </div>`;
        }).join("");
        const n = solvedCount(set);
        return `
        <div class="page-head">
            <div class="crumbs"><a href="#/testler">Testler</a> › <span>Alıştırmalar</span></div>
            <h1>${esc(set.title)}</h1>
            <p>${set.desc ? esc(set.desc) + " " : ""}Önce kendin çöz, sonra çözümü aç ve kontrol et.</p>
            <div style="display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap">
                <div class="progress-bar" style="flex:1;min-width:160px"><span data-pbar style="width:${Math.round((n / set.problems.length) * 100)}%"></span></div>
                <b style="color:var(--blue-deep);font-family:Sora,sans-serif" data-pcount>${n}/${set.problems.length} çözüldü</b>
                <button type="button" class="btn small ghost" data-allsol>Tüm çözümleri aç</button>
            </div>
        </div>
        <div class="lesson-body">${cards}</div>`;
    }

    function bindProblems(id) {
        const set = problemSets.find((x) => x.id === id);
        if (!set) return;
        const refresh = () => {
            const n = solvedCount(set);
            view.querySelector("[data-pcount]").textContent = `${n}/${set.problems.length} çözüldü`;
            view.querySelector("[data-pbar]").style.width = `${Math.round((n / set.problems.length) * 100)}%`;
        };
        view.querySelectorAll(".problem").forEach((card) => {
            const sol = card.querySelector("[data-sol]"), btn = card.querySelector("[data-show]");
            btn.addEventListener("click", () => {
                sol.hidden = !sol.hidden;
                btn.textContent = sol.hidden ? "💡 Çözümü göster" : "Çözümü gizle";
            });
            card.querySelector("[data-solve]").addEventListener("click", (e) => {
                const key = card.dataset.key;
                if (solved[key]) delete solved[key]; else solved[key] = true;
                store.set("madamel_solved", solved);
                card.classList.toggle("solved", !!solved[key]);
                e.target.textContent = solved[key] ? "✓ Çözdüm" : "Çözdüm olarak işaretle";
                refresh();
            });
        });
        let allOpen = false;
        view.querySelector("[data-allsol]").addEventListener("click", (e) => {
            allOpen = !allOpen;
            view.querySelectorAll(".problem").forEach((card) => {
                card.querySelector("[data-sol]").hidden = !allOpen;
                card.querySelector("[data-show]").textContent = allOpen ? "Çözümü gizle" : "💡 Çözümü göster";
            });
            e.target.textContent = allOpen ? "Tüm çözümleri kapat" : "Tüm çözümleri aç";
        });
    }

    /* ---------------- Devre Lab sayfası ---------------- */
    const LAB = [
        { k: "ohm", tab: "⚡ Ohm & Güç", title: "Ohm ve Güç Hesaplayıcı", desc: "Gerilim, akım, direnç ve güçten herhangi ikisini yaz; diğer ikisi formülleriyle birlikte hesaplanır.", w: "ohmCalc" },
        { k: "renk", tab: "🎨 Renk kodu", title: "Direnç Renk Kodu", desc: "4 ya da 5 bantlı direncin renklerinden değerini oku, ya da değerden renklerini bul.", w: "colorCode" },
        { k: "tel", tab: "🧵 İletken direnci", title: "İletken Telin Direnci", desc: "Malzeme, uzunluk ve kesitten telin direncini hesapla: R = l / (κA).", w: "wireR" },
        { k: "devre", tab: "🔋 Seri devre", title: "Pil ve İki Direnç", desc: "Gerilimi ve dirençleri değiştir; akımı, gerilim paylaşımını ve yük akışını izle.", w: "circuitLoop", o: { V: 9, R1: 10, R2: 20 } },
        { k: "kay", tab: "🔀 KAY düğümü", title: "Kirchhoff Akım Yasası", desc: "Bir düğüme giren ve çıkan akımları ayarla; bilinmeyen akımı KAY ile bul.", w: "kcl" },
        { k: "kgy", tab: "🔁 KGY çevresi", title: "Kirchhoff Gerilim Yasası", desc: "Çevreyi adım adım dolaş; gerilimlerin toplamının sıfır olduğunu gör.", w: "kvl" },
    ];

    function pageLab() {
        return `
        <div class="page-head">
            <div class="crumbs"><a href="#/">Ana Sayfa</a> › <span>Devre Lab</span></div>
            <h1>Devre Lab</h1>
            <p>Derslerdeki araçların hepsi bir arada. Bir sekme seç ve dene.</p>
        </div>
        <div class="chip-row lab-tabs">${LAB.map((t) => `<button type="button" class="chip" data-labtab="${t.k}">${t.tab}</button>`).join("")}</div>
        ${LAB.map((t) => `<div class="card widget" data-labpane="${t.k}" hidden>
            <div class="widget-head"><span class="wi">🧪</span><span class="wt">${esc(t.title)}</span></div>
            <div class="widget-body"><p class="widget-desc">${t.desc}</p><div data-labhost="${t.k}"></div></div></div>`).join("")}`;
    }

    function bindLab(query) {
        const keys = LAB.map((t) => t.k);
        let tab = keys.includes(query.get("m")) ? query.get("m") : store.get("madamel_labtab", "ohm");
        if (!keys.includes(tab)) tab = "ohm";
        if (query.get("m")) history.replaceState(null, "", "#/lab");
        const ready = {};
        function showTab() {
            view.querySelectorAll("[data-labtab]").forEach((b) => b.classList.toggle("active", b.dataset.labtab === tab));
            view.querySelectorAll("[data-labpane]").forEach((p) => (p.hidden = p.dataset.labpane !== tab));
            if (ready[tab]) return;
            ready[tab] = true;
            const t = LAB.find((x) => x.k === tab);
            mountWidget(view.querySelector(`[data-labhost="${tab}"]`), t.w, t.o);
        }
        view.querySelectorAll("[data-labtab]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.labtab; store.set("madamel_labtab", tab); showTab(); }));
        showTab();
    }

    function pageNotFound() {
        return `<div class="card empty-note"><h2>Sayfa bulunamadı</h2><p>Aradığın sayfa yok ya da taşınmış.</p><a class="btn" href="#/">Ana sayfaya dön</a></div>`;
    }

    /* ---------------- Yönlendirme ---------------- */
    function parseHash() {
        const raw = (location.hash || "#/").slice(1);
        const [path, qs] = raw.split("?");
        const parts = path.split("/").filter(Boolean);
        return { parts, query: new URLSearchParams(qs || "") };
    }

    function route() {
        const { parts, query } = parseHash();
        const page = parts[0] || "home";
        let html, after = null, navKey = page;
        if (page === "home") html = pageHome();
        else if (page === "konular") { html = pageChapters(); navKey = "konu"; }
        else if (page === "konu") html = pageChapter(parts[1]);
        else if (page === "ozet") {
            html = pageSummary(parts[1]); navKey = "konu";
            after = () => { const b = view.querySelector("[data-print]"); if (b) b.addEventListener("click", () => window.print()); };
        }
        else if (page === "ders") { html = pageLesson(parts[1]); after = () => bindLesson(parts[1]); navKey = "konu"; }
        else if (page === "lab") { html = pageLab(); after = () => bindLab(query); }
        else if (page === "testler") html = pagePractice();
        else if (page === "test") { html = pageTest(parts[1]); after = () => bindTest(parts[1]); navKey = "testler"; }
        else if (page === "problemler") { html = pageProblems(parts[1]); after = () => bindProblems(parts[1]); navKey = "testler"; }
        else html = pageNotFound();

        view.classList.add("page-fade");
        view.innerHTML = html;
        renderMath(view);
        if (after) after();
        requestAnimationFrame(() => view.classList.remove("page-fade"));
        window.scrollTo(0, 0);

        document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === navKey));
        updateSidebar();
        syncInstallButtons();
        document.title = page === "ders" && lessonById[parts[1]] ? `${lessonById[parts[1]].title} · Madam` : page === "lab" ? "Devre Lab · Madam" : navKey === "testler" ? "Testler · Madam" : "Madam Elektrik";
    }

    function updateSidebar() {
        const el = document.getElementById("sidebarProgress");
        el.innerHTML = `<div class="sp-label">Toplam ilerleme</div><div class="sp-value">%${pct()}</div><div class="progress-bar"><span style="width:${pct()}%"></span></div>
            <div class="muted" style="font-size:12px;margin:6px 0 12px">${doneCount()} / ${lessons.length} ders tamamlandı</div>
            ${chapters.map((ch) => `<a href="#/konu/${ch.id}" style="display:block;margin-top:8px;color:var(--ink-soft);font-size:12px;font-weight:700">${ch.no}. ${esc(ch.title)} <span style="float:right">${doneCount(ch)}/${chapterLessons(ch).length}</span>
                <div class="progress-bar" style="height:5px;margin-top:4px"><span style="width:${pct(ch)}%"></span></div></a>`).join("")}`;
    }

    /* ---------------- Tema ---------------- */
    function applyThemeIcons() {
        const dark = document.documentElement.getAttribute("data-theme") === "dark";
        document.querySelectorAll("[data-theme-toggle]").forEach((b) => (b.textContent = dark ? "☀️" : "🌙"));
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", dark ? "#182530" : "#00aff0");
    }
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("madamel_theme", next); } catch (e) { /* yok say */ }
        applyThemeIcons();
    }));

    /* ---------------- PWA: service worker + yükleme ---------------- */
    let installEvt = null;
    function syncInstallButtons() {
        document.querySelectorAll("[data-install]").forEach((b) => {
            b.hidden = !installEvt;
            if (!b._bound) {
                b._bound = true;
                b.addEventListener("click", async () => {
                    if (!installEvt) return;
                    installEvt.prompt();
                    try { await installEvt.userChoice; } catch (e) { /* yok say */ }
                    installEvt = null;
                    syncInstallButtons();
                });
            }
        });
    }
    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; syncInstallButtons(); });
    window.addEventListener("appinstalled", () => { installEvt = null; syncInstallButtons(); toast("Uygulama yüklendi 🎉"); });
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
        window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => { /* çevrimdışı destek olmadan devam */ }));
    }

    window.addEventListener("hashchange", route);
    applyThemeIcons();
    route();
})();
