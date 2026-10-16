/*
 * Çoktan seçmeli testler + alıştırmalar (adım adım çözümlü). Ders notlarındaki ödevler dahildir.
 */
(function (global) {
    "use strict";

    const R = String.raw;
    const mc = (q, options, correct, why) => ({ q, options, correct, why });
    const part = (l, q, a, s, lab) => ({ l, q, a, s: s || [], lab });
    const svg = (w, h, items) => `<div class="ckt-wrap" style="margin:8px 0">${Ckt.svg({ w, h, items })}</div>`;

    /* Ders 3.1, s. 8: Tellegen ile I_o */
    const FIG_IO = svg(380, 240, [
        { t: "I", a: [40, 40], b: [300, 40], to: "b" },
        { t: "pm", p: [146, 18], s: "-" }, { t: "txt", p: [170, 15], s: "6 V" }, { t: "pm", p: [194, 18], s: "+" }, { t: "txt", p: [170, 68], s: "2 A" },
        { t: "arr", p: [250, 40], d: "r", label: "I_x = 2 A" },
        { t: "w", p: [[40, 40], [40, 120]] }, { t: "w", p: [[300, 40], [300, 120]] },
        { t: "box", a: [40, 120], b: [170, 120], inner: "1" },
        { t: "pm", p: [83, 102], s: "+" }, { t: "txt", p: [105, 100], s: "6 V" }, { t: "pm", p: [127, 102], s: "-" },
        { t: "arr", p: [62, 120], d: "r", label: "I_o", side: "b" },
        { t: "box", a: [170, 120], b: [300, 120], inner: "2" },
        { t: "pm", p: [212, 102], s: "-" }, { t: "txt", p: [235, 100], s: "12 V" }, { t: "pm", p: [258, 102], s: "+" },
        { t: "arr", p: [192, 120], d: "r", label: "9 A", side: "b" },
        { t: "box", a: [40, 120], b: [40, 210], inner: "3", label: "10 V", side: "r" },
        { t: "pm", p: [24, 145], s: "+" }, { t: "pm", p: [24, 185], s: "-" },
        { t: "arr", p: [40, 202], d: "u", label: "3 A", side: "l" },
        { t: "V", a: [170, 120], b: [170, 210], plus: "a", label: "4 V", side: "r" },
        { t: "arr", p: [170, 202], d: "u", label: "8 A", side: "l" },
        { t: "DV", a: [300, 120], b: [300, 210], plus: "a", label: "8I_x", side: "r" },
        { t: "arr", p: [300, 138], d: "d", label: "11 A", side: "r" },
        { t: "w", p: [[40, 210], [300, 210]] },
        { t: "dot", p: [40, 120] }, { t: "dot", p: [170, 120] }, { t: "dot", p: [300, 120] }, { t: "dot", p: [170, 210] },
    ]);

    /* Ders 3.1, s. 13, ödev 1 */
    const FIG_P = svg(380, 190, [
        { t: "V", a: [50, 40], b: [50, 160], plus: "a", label: "20 V", side: "l" }, { t: "txt", p: [78, 100], s: "p_1" },
        { t: "box", a: [50, 40], b: [190, 40], label: "p_2" },
        { t: "pm", p: [98, 60], s: "+" }, { t: "txt", p: [120, 62], s: "12 V" }, { t: "pm", p: [142, 60], s: "-" },
        { t: "arr", p: [74, 40], d: "r", label: "I = 5 A" },
        { t: "box", a: [190, 40], b: [190, 160], label: "p_3", side: "l" },
        { t: "pm", p: [205, 80], s: "+" }, { t: "txt", p: [210, 100], s: "8 V", a: "start" }, { t: "pm", p: [205, 120], s: "-" },
        { t: "arr", p: [190, 62], d: "d", label: "6 A", side: "r" },
        { t: "w", p: [[190, 40], [320, 40]] },
        { t: "DI", a: [320, 160], b: [320, 40], to: "b", label: "0,2I", side: "r" }, { t: "txt", p: [292, 100], s: "p_4", a: "end" },
        { t: "w", p: [[50, 160], [320, 160]] },
        { t: "dot", p: [190, 40] }, { t: "dot", p: [190, 160] },
    ]);

    /* Ders 3.1, s. 13, ödev 2 */
    const FIG_W = () => svg(300, 130, [
        { t: "V", a: [50, 30], b: [50, 110], plus: "a", label: "12 V", side: "l" },
        { t: "w", p: [[50, 30], [180, 30]] }, { t: "arr", p: [120, 30], d: "r", label: "i(t)" },
        { t: "rect", x: 180, y: 14, w: 100, h: 112, cls: "elem", rx: 4 }, { t: "txt", p: [230, 62], s: ["Elektrik", "Devresi"], tc: "inner" },
        { t: "w", p: [[50, 110], [180, 110]] },
    ]) + `<div style="max-width:460px;margin:0 auto">${Widgets._helpers.plot({ w: 460, h: 230, x: [0, 10], y: [-30, 30], xt: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yt: [-30, -20, -10, 0, 10, 20, 30], xl: "t (ms)", yl: "w(t) · mJ",
        series: [{ pts: [[0, 0], [1, 10], [3, 10], [4, 0], [5, 0], [6, -20], [7, -20], [9, 0], [10, 0]], c: "s1" }] })}</div>`;

    /* Ders 3.2, s. 26: KAY ödevi */
    const FIG_KA = svg(320, 150, [
        { t: "I", a: [40, 125], b: [40, 25], to: "b", label: "44 mA", side: "r" },
        { t: "w", p: [[40, 25], [260, 25]] }, { t: "w", p: [[40, 125], [260, 125]] },
        { t: "R", a: [150, 25], b: [150, 125], label: "R", side: "r" }, { t: "arr", p: [150, 108], d: "d", label: "i_x", side: "r" },
        { t: "DI", a: [260, 25], b: [260, 125], to: "b", label: "10i_x", side: "l" },
        { t: "dot", p: [150, 25] }, { t: "dot", p: [150, 125] },
    ]);
    const FIG_KB = svg(450, 150, [
        { t: "R", a: [40, 25], b: [40, 125], label: "R_1", side: "r" }, { t: "arr", p: [40, 108], d: "d", label: "i_x", side: "r" },
        { t: "DI", a: [150, 125], b: [150, 25], to: "b", label: "10i_x", side: "r" },
        { t: "I", a: [260, 25], b: [260, 125], to: "b", label: "120 mA", side: "r" },
        { t: "R", a: [380, 25], b: [380, 125], label: "R_2", side: "r" }, { t: "arr", p: [380, 108], d: "u", label: "12 mA", side: "r" },
        { t: "w", p: [[40, 25], [380, 25]] }, { t: "w", p: [[40, 125], [380, 125]] },
        { t: "dot", p: [150, 25] }, { t: "dot", p: [260, 25] }, { t: "dot", p: [150, 125] }, { t: "dot", p: [260, 125] },
    ]);

    const tests = [
        {
            id: "test-1", chapter: "temel", title: "Test 1 · Temel Kavramlar", sections: ["1.1", "1.2", "1.3"],
            desc: "Akım, gerilim, enerji ve güç, güç işareti, Tellegen, devre elemanları ve kaynaklar.",
            questions: [
                mc(R`Bir iletkenin kesitinden $2$ dakikada $240$ C yük geçiyor. Akım kaçtır?`, ["2 A", "120 A", "480 A", "0,5 A"], 0, R`$I = Q/t = 240/120 = 2$ A (dakikayı saniyeye çevir!).`),
                mc(R`$q(t) = 3t^2 + 2t$ C ise $t = 1$ s'de akım kaçtır?`, ["8 A", "5 A", "6 A", "3 A"], 0, R`$i = dq/dt = 6t + 2$; $t = 1$: $8$ A.`),
                mc("Geleneksel akım yönü için hangisi doğrudur?", ["Kaynağın + ucundan çıkar, devreyi dolaşıp − ucuna döner", "Elektronların hareket yönüyle aynıdır", "Kaynağın − ucundan çıkar", "Yönü yoktur"], 0, R`Akım yönü elektron hareketinin tersidir.`),
                mc(R`Gerilimin birimi volt hangisine eşittir?`, ["J/C", "C/s", "J/s", "A/Ω"], 0, R`$v = dw/dq$: joule bölü coulomb.`),
                mc(R`$230$ V'luk prizden $5$ A çeken bir ısıtıcı $2$ saat çalışıyor. Harcanan enerji kaç kWh'dir?`, ["2,3 kWh", "1,15 kWh", "11,5 kWh", "0,46 kWh"], 0, R`$P = 1150$ W $= 1{,}15$ kW; $W = 1{,}15 \cdot 2 = 2{,}3$ kWh.`),
                mc(R`Bir elemana akım $+$ uçtan giriyor; $v = -5$ V, $i = 2$ A. Eleman…`, ["10 W güç veriyor", "10 W güç alıyor", "güç almıyor", "−10 W güç alıyor"], 0, R`$p = v\,i = -10$ W $< 0$ → güç veriyor.`),
                mc("Bir devrede beş elemanın güçleri 10 W, 25 W, −40 W, 15 W ve P'dir. Tellegen'e göre P kaçtır?", ["−10 W", "10 W", "0 W", "90 W"], 0, R`$10 + 25 - 40 + 15 + P = 0$ → $P = -10$ W.`),
                mc("Hangisi pasif bir devre elemanıdır?", ["Kondansatör", "Jeneratör", "Akü", "Akım kaynağı"], 0, R`Pasif: R, L, C. Diğerleri enerji üretebilir.`),
                mc("İdeal akım kaynağına bağlanan direnç büyütülürse ne olur?", ["Akım aynı kalır, gerilim artar", "Akım azalır", "Gerilim aynı kalır", "Akım artar"], 0, R`Akım kaynağı akımını korur; $V = I R$ artar.`),
                mc(R`Akım kontrollü akım kaynağında $\beta = 50$ ve $i_S = 0{,}1$ mA ise çıkış akımı?`, ["5 mA", "0,002 mA", "50 mA", "0,5 mA"], 0, R`$i = \beta\,i_S = 50 \cdot 0{,}1 = 5$ mA.`),
            ],
        },
        {
            id: "test-2", chapter: "kirchhoff", title: "Test 2 · Direnç, Ohm Yasası ve Renk Kodları", sections: ["2.1", "2.2", "2.3"],
            desc: "Ohm yasası, güç, iletkenlik, R = l/(κA), öz iletkenlik, renk kodu, seri direnç, ampermetre.",
            questions: [
                mc(R`$9$ V'luk pile bağlı bir dirençten $3$ mA geçiyor. Direnç kaçtır?`, ["3 kΩ", "27 Ω", "300 Ω", "3 Ω"], 0, R`$R = 9 / 0{,}003 = 3000\,\Omega$.`),
                mc(R`$100\,\Omega$'luk dirençten $0{,}2$ A geçiyor. Harcanan güç?`, ["4 W", "20 W", "2 W", "0,4 W"], 0, R`$P = I^2 R = 0{,}04 \cdot 100 = 4$ W.`),
                mc(R`İletkenliği $2$ mS olan bir elemanın direnci?`, ["500 Ω", "2 kΩ", "0,5 Ω", "2 Ω"], 0, R`$R = 1/G = 1/0{,}002 = 500\,\Omega$.`),
                mc(R`$R = 0$ olan bir eleman için hangisi söylenir?`, ["Kısa devredir", "Açık devredir", "Akım sıfırdır", "Gerilim sonsuzdur"], 0, R`Sıfır direnç: kısa devre.`),
                mc(R`$200$ m uzunluğunda, $2{,}5\text{ mm}^2$ kesitli bakır telin direnci? ($\varkappa = 56$)`, [R`$\approx 1{,}43\,\Omega$`, R`$\approx 28\,000\,\Omega$`, R`$\approx 0{,}7\,\Omega$`, R`$\approx 5{,}6\,\Omega$`], 0, R`$R = 200/(56 \cdot 2{,}5) = 200/140 \approx 1{,}43\,\Omega$.`),
                mc("Aynı uzunluk ve kesitte hangi tel en büyük dirence sahiptir?", ["Krom-nikel", "Bakır", "Alüminyum", "Gümüş"], 0, R`Öz iletkenliği en küçük olan: krom-nikel ($\varkappa \approx 0{,}9$).`),
                mc("Konnektörlerde (bağlantı noktalarında) neden altın tercih edilir?", ["Elektromanyetik bozucu etkilerden daha az etkilendiği ve oksitlenmediği için", "En iyi iletken olduğu için", "Ucuz olduğu için", "Direnci büyük olduğu için"], 0, R`Altının iletkenliği bakırdan düşüktür; seçilme nedeni dayanıklılığıdır.`),
                mc("Sarı–mor–kırmızı–altın renkli direncin değeri?", ["4,7 kΩ ±%5", "472 Ω ±%5", "47 kΩ ±%5", "470 Ω ±%10"], 0, R`$47 \times 100 = 4700\,\Omega$, altın $\pm\%5$.`),
                mc(R`$6$ V'luk pile arka arkaya $1\,\Omega$, $2\,\Omega$ ve $3\,\Omega$ bağlı. Akım?`, ["1 A", "6 A", "2 A", "36 A"], 0, R`$R_T = 6\,\Omega$, $I = 6/6 = 1$ A.`),
                mc("Akımı ölçmek için multimetre nasıl bağlanır?", ["Ampermetre olarak devreye seri", "Ampermetre olarak kaynağa paralel", "Voltmetre olarak seri", "Ohmmetre olarak çalışan devreye"], 0, R`Ampermetre seri bağlanır; paralel bağlamak kısa devre yapar.`),
            ],
        },
        {
            id: "test-3", chapter: "kirchhoff", title: "Test 3 · Düğüm, Çevre, KAY ve KGY", sections: ["2.4", "2.5", "2.6"],
            desc: "Düğüm/çevre/dal kavramları, Kirchhoff'un akım ve gerilim yasaları.",
            questions: [
                mc("İki düğüm arasında kalan devre parçasına ne denir?", ["Dal", "Çevre", "Düğüm", "Kaynak"], 0, R`Dal: iki düğüm arasındaki parça.`),
                mc("Bir devrede 6 dal ve 4 düğüm var. Bağımsız çevre sayısı?", ["3", "2", "10", "4"], 0, R`$\ell = b - n + 1 = 6 - 4 + 1 = 3$.`),
                mc(R`Bir düğüme $2$ A, $5$ A ve $1$ A giriyor; çıkan tek akım $I$'dır. $I = ?$`, ["8 A", "2 A", "4 A", "0 A"], 0, R`Giren = çıkan: $I = 2 + 5 + 1 = 8$ A.`),
                mc(R`Bir düğüme $4$ A giriyor, $6$ A ve $I$ çıkıyor. $I = ?$`, ["−2 A (aslında 2 A giriyor)", "10 A", "2 A çıkıyor", "0 A"], 0, R`$4 = 6 + I$ → $I = -2$ A: varsayılan yönün tersine 2 A.`),
                mc("KGY hangi ilkeye dayanır?", ["Enerjinin korunumu", "Yükün korunumu", "Ohm yasası", "Tellegen teoremi"], 0, R`Bir yük çevreyi dolaşıp aynı noktaya döndüğünde net enerji değişimi sıfırdır.`),
                mc(R`Bir çevrede $20$ V kaynak ve üç direnç var. İki direncin gerilimi $8$ V ve $5$ V ise üçüncüsü?`, ["7 V", "13 V", "33 V", "3 V"], 0, R`$20 = 8 + 5 + V_3$ → $V_3 = 7$ V.`),
                mc("4 düğümlü bir devrede kaç bağımsız KAY denklemi yazılır?", ["3", "4", "5", "1"], 0, R`$n - 1 = 3$.`),
                mc("Arasında eleman olmayan tellerle bağlı üç nokta kaç düğümdür?", ["1", "3", "2", "0"], 0, R`Hepsi aynı düğümdür.`),
                mc(R`Saat yönünde dolaşırken bir $9$ V kaynağa $+$ ucundan giriyorsan (giriş ucu kuralı) denkleme ne yazarsın?`, [R`$+9$`, R`$-9$`, "0", "Kaynak yazılmaz"], 0, R`Giriş ucu $+$ → $+9$.`),
                mc(R`Ders örneğinde ($30$ V, $5$ V, $15$ V aynı yönde) $R_1 + R_2 + R_3 = 10\,\Omega$ ise çevre akımı?`, ["5 A", "3 A", "1 A", "50 A"], 0, R`Toplam kaynak gerilimi $50$ V; $I = 50/10 = 5$ A.`),
            ],
        },
    ];

    const problemSets = [
        {
            id: "alistirma-1", chapter: "temel", title: "Alıştırmalar · Ders 3.1 (ödevler dahil)", desc: "Akım, güç işareti, Tellegen teoremi ve enerji grafiği.", sections: ["1.1", "1.2", "1.3"],
            problems: [
                { no: 1, q: R`Bir iletkenden geçen yük $q(t) = 4t^2 - t$ C'dur. $t = 2$ s anındaki akımı ve $0$–$2$ s arasında geçen yükü bulunuz.`,
                    a: R`$i(2) = 15$ A, $\;\Delta q = 14$ C`, s: [R`$i(t) = dq/dt = 8t - 1$ → $i(2) = 16 - 1 = 15$ A.`, R`$\Delta q = q(2) - q(0) = (16 - 2) - 0 = 14$ C.`] },
                { no: 2, q: R`Bir telden $1$ dakikada $1800$ C yük geçiyor. Akımı ve saniyede geçen elektron sayısını bulunuz. ($e = 1{,}602 \times 10^{-19}$ C)`,
                    a: R`$I = 30$ A; saniyede $\approx 1{,}87 \times 10^{20}$ elektron`, s: [R`$I = 1800/60 = 30$ A.`, R`$n = I/e = 30 / 1{,}602 \times 10^{-19} \approx 1{,}87 \times 10^{20}$.`] },
                { no: 3, q: "Aşağıdaki elemanların güç alıp almadığını bulunuz.", parts: [
                    part("a", R`$v = 5$ V, akım $+$ uçtan giriyor, $i = 3$ A`, R`$15$ W alıyor`, [R`$p = +v\,i = 15$ W.`]),
                    part("b", R`$v = 5$ V, akım $+$ uçtan çıkıyor, $i = 3$ A`, R`$15$ W veriyor`, [R`$p = -v\,i = -15$ W.`]),
                    part("c", R`$v = -10$ V, akım $+$ uçtan giriyor, $i = -2$ A`, R`$20$ W alıyor`, [R`$p = (-10)(-2) = 20$ W.`]),
                ] },
                { no: 4, q: R`<b>Ödev (s. 13):</b> Aşağıdaki devrede her devre elemanı tarafından çekilen / verilen güçleri hesaplayınız. Tellegen teoreminin sağlandığını gösteriniz.${FIG_P}`,
                    a: R`$p_1 = -100$ W, $p_2 = 60$ W, $p_3 = 48$ W, $p_4 = -8$ W; toplam $0$ ✓`,
                    s: [R`$p_1$: 5 A akım 20 V kaynağın $+$ ucundan çıkıyor → $p_1 = -(20)(5) = -100$ W (veriyor).`,
                        R`$p_2$: akım $+$ uçtan giriyor → $p_2 = (12)(5) = 60$ W. $\quad p_3 = (8)(6) = 48$ W.`,
                        R`$p_4$: bağımlı kaynağın akımı $0{,}2 I = 0{,}2 \cdot 5 = 1$ A, yukarı doğru; uçlarındaki gerilim $8$ V (üst uç $+$). Akım $+$ uçtan çıkıyor → $p_4 = -(8)(1) = -8$ W.`,
                        R`KAY kontrolü (üst sağ düğüm): $5 + 1 = 6$ A ✓.`,
                        R`$-100 + 60 + 48 - 8 = 0$ → Tellegen sağlanıyor.`] },
                { no: 5, q: R`<b>Ödev (s. 8):</b> Tellegen teoremini kullanarak aşağıdaki devredeki $I_o$ akımını bulunuz.${FIG_IO}`,
                    a: R`$I_o = 1$ A`,
                    note: R`Her elemanda akımın $+$ uçtan girip girmediğine dikkat et; bağımlı kaynağın gerilimi $8I_x = 8 \cdot 2 = 16$ V'tur.`,
                    s: [R`Üstteki akım kaynağı: 2 A, $-$ uçtan girip $+$ uçtan çıkıyor → $p = -(6)(2) = -12$ W.`,
                        R`Eleman 1: $I_o$, $+$ uçtan giriyor → $p_1 = 6 I_o$.`,
                        R`Eleman 2: 9 A, $-$ uçtan giriyor → $p_2 = -(12)(9) = -108$ W.`,
                        R`Eleman 3: 3 A alttan ($-$) girip üstten ($+$) çıkıyor → $p_3 = -(10)(3) = -30$ W.`,
                        R`4 V kaynak: 8 A yukarı, $-$ uçtan giriyor → $-(4)(8) = -32$ W. Bağımlı kaynak: 11 A aşağı, $+$ uçtan giriyor → $(16)(11) = 176$ W.`,
                        R`Tellegen: $-12 + 6I_o - 108 - 30 - 32 + 176 = 0$ → $6 I_o = 6$.`,
                        R`KAY kontrolü (sol orta düğüm): $3 = 2 + I_o$ → $I_o = 1$ A ✓.`] },
                { no: 6, q: R`<b>Ödev (s. 13):</b> Kapalı kutu şeklinde gösterilen elektrik devresinin çektiği enerji $w(t)$ aşağıda verilmiştir. $0$–$10$ ms arasında devre akımının nasıl değiştiğini hesaplayınız ve çiziniz.${FIG_W()}`,
                    a: R`$i(t)$: $0$–$1$ ms $0{,}833$ A; $1$–$3$ ms $0$; $3$–$4$ ms $-0{,}833$ A; $4$–$5$ ms $0$; $5$–$6$ ms $-1{,}667$ A; $6$–$7$ ms $0$; $7$–$9$ ms $0{,}833$ A; $9$–$10$ ms $0$.`,
                    s: [R`Güç enerjinin eğimidir: $p = \Delta w / \Delta t$ (mJ/ms = W). Akım: $i = p / 12$.`,
                        R`$0$–$1$ ms: $p = 10/1 = 10$ W → $i = 10/12 \approx 0{,}833$ A.`,
                        R`$1$–$3$ ms: $w$ sabit → $p = 0$, $i = 0$. $\quad 3$–$4$ ms: $p = -10/1 = -10$ W → $i \approx -0{,}833$ A.`,
                        R`$4$–$5$ ms: $0$. $\quad 5$–$6$ ms: $p = -20/1 = -20$ W → $i \approx -1{,}667$ A.`,
                        R`$6$–$7$ ms: $0$. $\quad 7$–$9$ ms: $p = 20/2 = 10$ W → $i \approx 0{,}833$ A. $\quad 9$–$10$ ms: $0$.`,
                        R`Grafik basamaklı (parça parça sabit) bir akım çizgisidir; negatif bölgelerde devre kaynağa enerji geri veriyor. Bu tür grafiği “Enerjiden güce” aracında kendin de inceleyebilirsin.`] },
                { no: 7, q: "Bağımlı kaynakların çıkışlarını bulunuz.", parts: [
                    part("a", R`GKGK, $\mu = 20$, $v_S = 0{,}5$ V`, R`$10$ V`, [R`$v = 20 \cdot 0{,}5$.`]),
                    part("b", R`AKGK, $r = 2\text{ k}\Omega$, $i_S = 3$ mA`, R`$6$ V`, [R`$v = r\,i_S = 2000 \cdot 0{,}003$.`]),
                    part("c", R`GKAK, $g = 4$ mS, $v_S = 5$ V`, R`$20$ mA`, [R`$i = g\,v_S = 0{,}004 \cdot 5 = 0{,}02$ A.`]),
                    part("d", R`AKAK, $\beta = 80$, $i_S = 25\ \mu$A`, R`$2$ mA`, [R`$i = 80 \cdot 25\ \mu\text{A} = 2000\ \mu$A.`]),
                ] },
            ],
        },
        {
            id: "alistirma-2-1", chapter: "kirchhoff", title: "Alıştırmalar · Direnç, Ohm ve Renk Kodu", desc: "Ohm yasası, güç, tel direnci, renk kodları, seri devre.", sections: ["2.1", "2.2", "2.3"],
            problems: [
                { no: 1, q: "Eksik büyüklükleri bulunuz.", parts: [
                    part("a", R`$V = 24$ V, $R = 4\text{ k}\Omega$: $I$ ve $P$?`, R`$I = 6$ mA, $P = 144$ mW`, [R`$I = 24/4000$; $P = V I = 24 \cdot 0{,}006$.`]),
                    part("b", R`$R = 1\text{ k}\Omega$, $P = 40$ mW: $I$ ve $V$?`, R`$I \approx 6{,}32$ mA, $V \approx 6{,}32$ V`, [R`$I = \sqrt{P/R} = \sqrt{4 \times 10^{-5}}$; $V = I R$.`]),
                    part("c", R`$G = 0{,}25$ mS, $V = 8$ V: $I$, $R$ ve $P$?`, R`$I = 2$ mA, $R = 4\text{ k}\Omega$, $P = 16$ mW`, [R`$I = G V$; $R = 1/G$; $P = V I$.`]),
                    part("d", R`Akım kaynağı $I = 10$ mA, direncin gücü $P = 0{,}5$ W: $V$ ve $R$?`, R`$V = 50$ V, $R = 5\text{ k}\Omega$`, [R`$V = P/I = 0{,}5/0{,}01$; $R = V/I$.`]),
                ] },
                { no: 2, q: R`$500$ m uzunluğunda, $16\text{ mm}^2$ kesitli alüminyum hattın direncini bulunuz. ($\varkappa_{Al} = 35$)`,
                    a: R`$R \approx 0{,}893\,\Omega$`, s: [R`$R = \dfrac{l}{\varkappa A} = \dfrac{500}{35 \cdot 16} = \dfrac{500}{560}$.`] },
                { no: 3, q: R`Çapı $0{,}5$ mm olan $10$ m'lik bakır telin direnci nedir? ($\varkappa_{Cu} = 56$)`,
                    a: R`$R \approx 0{,}909\,\Omega$`, s: [R`$A = \pi (0{,}25)^2 \approx 0{,}1963\text{ mm}^2$.`, R`$R = \dfrac{10}{56 \cdot 0{,}1963} \approx \dfrac{10}{11{,}0}$.`] },
                { no: 4, q: R`$25\text{ mm}^2$ bakır hat, aynı uzunlukta ve aynı dirençte alüminyum hatla değiştirilecek. Alüminyum kesiti ne olmalıdır?`,
                    a: R`$A_{Al} = 40\text{ mm}^2$`, s: [R`$A_{Al} = \dfrac{\varkappa_{Cu}}{\varkappa_{Al}} A_{Cu} = \dfrac{56}{35} \cdot 25 = 1{,}6 \cdot 25$.`] },
                { no: 5, q: "Renk kodlarını çözünüz / yazınız.", parts: [
                    part("a", "Kahverengi – siyah – kırmızı – altın", R`$1\text{ k}\Omega \pm\%5$`, [R`$10 \times 100$.`]),
                    part("b", "Sarı – mor – kahverengi – gümüş", R`$470\,\Omega \pm\%10$`, [R`$47 \times 10$.`]),
                    part("c", "Kahverengi – siyah – siyah – kırmızı – kahverengi (5 bant)", R`$10\text{ k}\Omega \pm\%1$`, [R`$100 \times 100$.`]),
                    part("d", R`$2{,}2\text{ k}\Omega \pm\%5$ (4 bant) hangi renklerdir?`, "Kırmızı – kırmızı – kırmızı – altın", [R`$22 \times 100 = 2200$.`]),
                ] },
                { no: 6, q: R`$470\,\Omega$, $0{,}25$ W'lık bir dirence zarar vermeden uygulanabilecek en büyük gerilim ve akım nedir?`,
                    a: R`$V_{max} \approx 10{,}8$ V, $\;I_{max} \approx 23{,}1$ mA`, s: [R`$V = \sqrt{P R} = \sqrt{0{,}25 \cdot 470} = \sqrt{117{,}5}$.`, R`$I = \sqrt{P/R} = \sqrt{0{,}25/470} \approx 0{,}0231$ A.`] },
                { no: 7, q: R`$1{,}5$ V'luk pile $R_1 = 5\,\Omega$ ve $R_2 = 10\,\Omega$ seri bağlı. Akımı ve her direncin gerilimini bulunuz.`,
                    a: R`$I = 0{,}1$ A, $V_1 = 0{,}5$ V, $V_2 = 1$ V`, s: [R`$R_T = 15\,\Omega$, $I = 1{,}5/15 = 0{,}1$ A.`, R`$V_1 = I R_1 = 0{,}5$ V, $V_2 = I R_2 = 1$ V; toplam $1{,}5$ V (KGY!).`] },
            ],
        },
        {
            id: "alistirma-2-2", chapter: "kirchhoff", title: "Alıştırmalar · KAY ve KGY (ödevler dahil)", desc: "Düğüm akımları, bağımlı kaynaklı KAY, çevre denklemleri.", sections: ["2.4", "2.5", "2.6"],
            problems: [
                { no: 1, q: R`Bir düğüme $I_1 = 5$ A ve $I_2 = 6$ A giriyor; $I_3 = 2$ A, $I_5 = 5$ A ve $I_4$ çıkıyor. $I_4 = ?$`,
                    a: R`$I_4 = 4$ A`, s: [R`$5 + 6 = 2 + I_4 + 5$.`] },
                { no: 2, q: R`<b>Ödev (s. 26):</b> (a) ve (b) devrelerindeki $i_x$ akımlarını Kirchhoff akım yasasıyla hesaplayınız.${FIG_KA}${FIG_KB}`, parts: [
                    part("a", R`Soldaki devre`, R`$i_x = 4$ mA`, [R`Üst düğüm: giren $44$ mA; çıkan $i_x$ (R'den aşağı) ve $10\,i_x$ (bağımlı kaynak, aşağı).`, R`$44 = i_x + 10\,i_x = 11\,i_x$ → $i_x = 4$ mA.`]),
                    part("b", R`Sağdaki devre`, R`$i_x = 12$ mA`, [R`Üst düğüme giren: $10\,i_x$ (yukarı) ve $12$ mA ($R_2$'den yukarı).`, R`Çıkan: $i_x$ ($R_1$'den aşağı) ve $120$ mA.`, R`$10\,i_x + 12 = i_x + 120$ → $9\,i_x = 108$ → $i_x = 12$ mA.`]),
                ] },
                { no: 3, q: R`Ders 3.2'deki düğüm-çevre-dal devresinde (5 düğüm, 8 dal) kaç bağımsız KAY ve KGY denklemi yazılabilir?`,
                    a: "4 KAY + 4 KGY = 8 denklem (8 dal akımı için yeterli)", s: [R`KAY: $n - 1 = 4$.`, R`KGY: $b - n + 1 = 8 - 5 + 1 = 4$.`, R`Toplam $8$ bağımsız denklem, $8$ bilinmeyen dal akımını bulmaya yeter.`] },
                { no: 4, q: R`KGY tanım devresinde ($30$ V, $5$ V, $15$ V) $R_1 = 2\,\Omega$, $R_2 = 3\,\Omega$, $R_3 = 5\,\Omega$'dur. Çevre akımını ve direnç gerilimlerini bulunuz; KGY'yi kontrol ediniz.`,
                    a: R`$I = 5$ A; $V_{R_1} = 10$ V, $V_{R_2} = 15$ V, $V_{R_3} = 25$ V`, s: [R`$V_{R_1} - 5 + V_{R_2} - 15 + V_{R_3} - 30 = 0$ ve $V_{R_k} = I R_k$.`, R`$I (2 + 3 + 5) = 50$ → $I = 5$ A.`, R`Kontrol: $10 - 5 + 15 - 15 + 25 - 30 = 0$ ✓.`] },
                { no: 5, q: R`KGY örnek devresinde (24 V, 16 V, 8 V) $V_{R_4} = 25$ V ve $V_{R_3} = 3$ V ölçülmüştür. $V_{R_1}$ ve $V_{R_2}$'yi bulunuz.`,
                    a: R`$V_{R_1} = 15$ V, $\;V_{R_2} = -2$ V`, s: [R`Sol çevre: $V_{R_1} + V_{R_4} = 40$ → $V_{R_1} = 15$ V.`, R`Sağ çevre: $V_{R_2} + V_{R_3} + 24 - V_{R_4} = 0$ → $V_{R_2} = 25 - 24 - 3 = -2$ V.`, R`Negatif: $R_2$ üzerindeki gerçek gerilim yönü işaretlenenin tersidir (c ucu b'den $2$ V yüksek).`, R`Kontrol (dış çevre): $15 - 2 + 3 = 16$ ✓.`] },
            ],
        },
    ];

    global.PRACTICE = global.PRACTICE || { tests: [], problemSets: [] };
    global.PRACTICE.tests.push(...tests);
    global.PRACTICE.problemSets.push(...problemSets);
})(window);
