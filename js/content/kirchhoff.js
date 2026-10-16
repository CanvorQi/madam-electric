/*
 * Bölüm 2 - Direnç ve Kirchhoff Yasaları (Ders 3.2)
 * Direnç ve Ohm yasası, iletkenlik, direnç-malzeme ilişkisi, renk kodları,
 * düğüm/çevre/dal kavramları, Kirchhoff'un akım ve gerilim yasaları.
 */
(function (global) {
    "use strict";

    const R = String.raw;

    const p = (html) => ({ t: "p", html });
    const simple = (html) => ({ t: "simple", html });
    const def = (title, html) => ({ t: "def", title, html });
    const formula = (title, html) => ({ t: "formula", title, html });
    const tip = (html, title) => ({ t: "tip", html, title });
    const warn = (html, title) => ({ t: "warn", html, title });
    const ex = (q, steps, answer) => ({ t: "example", q, steps, answer });
    const quiz = (q, options, correct, why) => ({ t: "quiz", q, options, correct, why });
    const widget = (name, title, desc, opts) => ({ t: "widget", name, title, desc, opts: opts || {} });
    const table = (html) => ({ t: "table", html });
    const fig = (html, cap) => ({ t: "fig", html, cap });

    const svg = (w, h, items, maxw) => Ckt.svg({ w, h, items, maxw });

    // Ders 3.2, s. 16: dört basit devre
    const small = (src, arrowLabel, rLabel) => svg(270, 135, [src,
        { t: "w", p: [[60, 20], [170, 20]] }, { t: "arr", p: [115, 20], d: "r", label: arrowLabel },
        { t: "R", a: [170, 20], b: [170, 110], label: rLabel, side: "r" }, { t: "w", p: [[170, 110], [60, 110]] }], 270);
    const FOUR = `<div class="fig-grid">
        <div>${small({ t: "V", a: [60, 20], b: [60, 110], plus: "a", label: "12 V", side: "l" }, "I", "2 kΩ")}<div class="fig-cap">(a)</div></div>
        <div>${small({ t: "V", a: [60, 20], b: [60, 110], plus: "a", label: "V", side: "l" }, "I", ["10 kΩ", "P = 3,6 mW"])}<div class="fig-cap">(b)</div></div>
        <div>${small({ t: "V", a: [60, 20], b: [60, 110], plus: "a", label: "V", side: "l" }, "I = 0,5 mA", "G = 50 µS")}<div class="fig-cap">(c)</div></div>
        <div>${svg(270, 135, [{ t: "I", a: [60, 110], b: [60, 20], to: "b", label: "4 mA", side: "r" },
            { t: "pm", p: [30, 42], s: "+" }, { t: "txt", p: [30, 65], s: "V" }, { t: "pm", p: [30, 88], s: "-" },
            { t: "w", p: [[60, 20], [170, 20]] }, { t: "arr", p: [125, 20], d: "r", label: "I" },
            { t: "R", a: [170, 20], b: [170, 110], label: ["P = 80 mW", "R"], side: "r" }, { t: "w", p: [[170, 110], [60, 110]] }], 270)}<div class="fig-cap">(d)</div></div>
    </div>`;

    // Ders 3.2, s. 25: KAY örneği
    const KCL_FIG = svg(380, 240, [
        { t: "R", a: [40, 30], b: [300, 30], label: "R_1" }, { t: "arr", p: [75, 30], d: "r", label: "i_1(t)", side: "b" },
        { t: "w", p: [[40, 30], [40, 110]] }, { t: "w", p: [[300, 30], [300, 110]] },
        { t: "R", a: [40, 110], b: [170, 110], label: "R_2" }, { t: "arr", p: [148, 110], d: "r", label: "i_2(t)", side: "b" },
        { t: "DI", a: [170, 110], b: [300, 110], to: "a", label: "50i_2(t)", side: "b" },
        { t: "V", a: [40, 110], b: [40, 200], plus: "a", label: "v_1(t)", side: "r" }, { t: "arr", p: [40, 190], d: "u", label: "i_5(t)", side: "r" },
        { t: "R", a: [170, 110], b: [170, 200], label: "R_3", side: "r" }, { t: "arr", p: [170, 189], d: "d", label: "i_3(t)", side: "r" },
        { t: "R", a: [300, 110], b: [300, 200], label: "R_4", side: "r" }, { t: "arr", p: [300, 189], d: "d", label: "i_4(t)", side: "r" },
        { t: "w", p: [[40, 200], [300, 200]] },
        { t: "node", p: [40, 110], s: "1", lp: [20, 110] }, { t: "node", p: [170, 110], s: "2", lp: [170, 90] },
        { t: "node", p: [300, 110], s: "3", lp: [322, 110] }, { t: "node", p: [170, 200], s: "4", lp: [170, 222] },
    ]);

    // Ders 3.2, s. 28: KGY örneği
    const KVL_FIG = svg(420, 250, [
        { t: "V", a: [40, 40], b: [40, 220], plus: "a", label: "24 V", side: "r" },
        { t: "R", a: [40, 40], b: [150, 40], label: "R_1", side: "b" },
        { t: "pm", p: [74, 22], s: "+" }, { t: "txt", p: [95, 20], s: "V_{R1}" }, { t: "pm", p: [117, 22], s: "-" },
        { t: "R", a: [150, 40], b: [250, 40], label: "R_2", side: "b" },
        { t: "pm", p: [179, 22], s: "+" }, { t: "txt", p: [200, 20], s: "V_{R2}" }, { t: "pm", p: [221, 22], s: "-" },
        { t: "R", a: [250, 40], b: [360, 40], label: "R_3", side: "b" },
        { t: "pm", p: [284, 22], s: "+" }, { t: "txt", p: [305, 20], s: "V_{R3}" }, { t: "pm", p: [326, 22], s: "-" },
        { t: "R", a: [150, 40], b: [150, 130], label: "R_4", side: "l" },
        { t: "pm", p: [164, 70], s: "+" }, { t: "txt", p: [172, 85], s: "V_{R4}", a: "start" }, { t: "pm", p: [164, 100], s: "-" },
        { t: "V", a: [150, 130], b: [150, 220], plus: "b", label: "16 V", side: "r" },
        { t: "V", a: [360, 40], b: [360, 220], plus: "a", label: "8 V", side: "l" },
        { t: "w", p: [[40, 220], [360, 220]] },
        { t: "dot", p: [40, 40] }, { t: "txt", p: [28, 26], s: "a", tc: "big" },
        { t: "dot", p: [150, 40] }, { t: "txt", p: [150, 58], s: "b", tc: "big" },
        { t: "dot", p: [250, 40] }, { t: "txt", p: [250, 58], s: "c", tc: "big" },
        { t: "dot", p: [360, 40] }, { t: "txt", p: [372, 26], s: "d", tc: "big" },
        { t: "dot", p: [150, 130] }, { t: "txt", p: [134, 130], s: "e", tc: "big" },
        { t: "dot", p: [150, 220] }, { t: "txt", p: [150, 238], s: "f", tc: "big" },
    ]);

    // Ders 3.2, s. 27: KGY tanım devresi
    const KVL_DEF = svg(400, 240, [
        { t: "V", a: [40, 40], b: [40, 200], plus: "a", label: "30 V", side: "l" },
        { t: "R", a: [40, 40], b: [170, 40], label: "R_1" },
        { t: "pm", p: [83, 62], s: "+" }, { t: "txt", p: [105, 62], s: "V_{R1}" }, { t: "pm", p: [127, 62], s: "-" },
        { t: "V", a: [170, 40], b: [300, 40], plus: "b", label: "5 V" },
        { t: "R", a: [300, 40], b: [300, 200], label: "R_2", side: "l" },
        { t: "pm", p: [318, 98], s: "+" }, { t: "txt", p: [314, 120], s: "V_{R2}", a: "start" }, { t: "pm", p: [318, 142], s: "-" },
        { t: "V", a: [300, 200], b: [170, 200], plus: "b", label: "15 V", side: "b" },
        { t: "R", a: [170, 200], b: [40, 200], label: "R_3", side: "b" },
        { t: "pm", p: [83, 178], s: "-" }, { t: "txt", p: [105, 178], s: "V_{R3}" }, { t: "pm", p: [127, 178], s: "+" },
        { t: "dot", p: [40, 40] }, { t: "txt", p: [28, 28], s: "a", tc: "big" }, { t: "dot", p: [170, 40] }, { t: "txt", p: [170, 26], s: "b", tc: "big" },
        { t: "dot", p: [300, 40] }, { t: "txt", p: [312, 28], s: "c", tc: "big" }, { t: "dot", p: [300, 200] }, { t: "txt", p: [312, 212], s: "d", tc: "big" },
        { t: "dot", p: [170, 200] }, { t: "txt", p: [170, 215], s: "e", tc: "big" }, { t: "dot", p: [40, 200] }, { t: "txt", p: [28, 212], s: "f", tc: "big" },
    ]);

    const sw = (c) => `<td class="sw"><i style="background:${c}"></i></td>`;

    const sections = [
        /* =========================== 2.1 =========================== */
        {
            no: "2.1", title: "Direnç ve Ohm Yasası",
            lessons: [
                {
                    id: "direnc", title: "Direnç Nedir?",
                    summary: "Akıma karşı gösterilen zorluk; birimi ohm (Ω).",
                    blocks: [
                        simple(R`Ders notundaki çizimi hatırla: <b>Gerilim</b> (sarı) akımı iter, <b>Akım</b> (yeşil) dar bir borudan geçmeye çalışır, <b>Direnç</b> (kırmızı) ise boruyu sıkıp geçişi zorlaştırır. Boru ne kadar darsa, aynı itişle o kadar az akım geçer.`),
                        def("Direnç neden oluşur?", R`<ul>
                            <li>Bir elemanın uçlarına $V$ gerilimi uygulanınca devreden bir $I$ akımı akar; eleman bu akıma karşı bir <b>zorluk</b> gösterir.</li>
                            <li>Nedeni: akımı oluşturan serbest elektronlar, malzeme içinde ilerlerken <b>diğer atomlara çarparlar</b>.</li>
                            <li>Her çarpışmada elektronların enerjisinin bir kısmı kaybolur (ısıya dönüşür) ve hareketleri sınırlanır. Çarpışma sayısı arttıkça sınırlama da artar.</li>
                            <li>Bu etki <b>malzemeden malzemeye</b> değişir.</li>
                        </ul>
                        Sonuç olarak <b>direnç, akıma karşı gösterilen zorluktur.</b> Sembolü $R$, birimi <b>ohm ($\Omega$)</b>'dur.`),
                        fig(svg(220, 50, [{ t: "R", a: [10, 25], b: [210, 25] }], 220), "Direncin devre sembolü"),
                        tip(R`Direnç her zaman istenmeyen bir şey değildir: ampulün teli, elektrikli ısıtıcı, saç kurutma makinesi direncin ısıttığı yerlerdir. Devrelerde dirençler akımı sınırlamak için bilerek kullanılır.`),
                        quiz("Direncin oluşmasının temel nedeni nedir?", ["Serbest elektronların atomlara çarpması", "Elektronların çok hızlı olması", "Kaynağın gerilimi", "Tellerin rengi"], 0, R`Çarpışmalar elektronların enerjisini azaltır ve hareketlerini sınırlar.`),
                        quiz("Direncin birimi nedir?", ["Ohm (Ω)", "Volt (V)", "Siemens (S)", "Watt (W)"], 0, R`Siemens iletkenliğin birimidir ($1/\Omega$).`),
                    ],
                },
                {
                    id: "ohm", title: "Ohm Yasası",
                    summary: "V = R·I; güç P = V·I = I²R = V²/R.",
                    blocks: [
                        simple(R`Uygulanan gerilimi iki katına çıkarırsan, dirençten geçen akım da iki katına çıkar. Gerilim ile akım <b>doğru orantılıdır</b>; orantı sabiti dirençtir.`),
                        formula("Ohm yasası", R`$$V = R \cdot I \qquad I = \frac{V}{R} \qquad R = \frac{V}{I}$$
                            $V$: gerilim (V), $\;I$: akım (A), $\;R$: direnç ($\Omega$).`),
                        formula("Dirençte harcanan güç", R`Dirençte harcanan (direncin çektiği) güç:
                            $$P = V \cdot I = R \cdot I^2 = \frac{V^2}{R} \quad (\text{W})$$`),
                        widget("ohmVI", "Gerilim–akım doğrusu", "Gerilimi ve direnci değiştir. Soluk çizgiler başka dirençler için. R = 0 ve R = ∞ düğmelerine de bak."),
                        def(R`$R = 0$ ve $R = \infty$ olursa?`, R`<ul>
                            <li>$R = 0$ olursa akım $I = V/0$ → <b>sonsuz</b> olur. Buna <b>kısa devre</b> denir (kaynağın uçlarını bir telle birleştirmek gibi).</li>
                            <li>$R = \infty$ olursa akım $I = V/\infty$ → <b>sıfır</b> olur. Buna <b>açık devre</b> denir (kopuk tel, açık anahtar).</li>
                        </ul>`),
                        ex(R`$1{,}5$ V'luk bir pile $5\,\Omega$'luk bir direnç bağlanıyor. Akım kaçtır? Dirençte harcanan güç ne kadardır?`, [
                            R`$I = \dfrac{V}{R} = \dfrac{1{,}5}{5} = 0{,}3$ A.`,
                            R`$P = V \cdot I = 1{,}5 \cdot 0{,}3 = 0{,}45$ W. (Kontrol: $I^2 R = 0{,}09 \cdot 5 = 0{,}45$ W.)`,
                        ], R`$I = 0{,}3$ A, $\;P = 0{,}45$ W`),
                        quiz(R`$12$ V'luk kaynağa $4\,\Omega$ bağlanırsa akım kaç olur?`, ["3 A", "48 A", "0,33 A", "16 A"], 0, R`$I = 12/4 = 3$ A.`),
                        quiz(R`$R = \infty$ ise devreden geçen akım nedir?`, ["0 (açık devre)", "Sonsuz (kısa devre)", "V kadar", "1 A"], 0, R`Sonsuz direnç akımı tamamen keser.`),
                        quiz(R`$2\,\Omega$'luk dirençten $3$ A geçiyorsa harcanan güç?`, ["18 W", "6 W", "12 W", "1,5 W"], 0, R`$P = I^2 R = 9 \cdot 2 = 18$ W.`),
                    ],
                },
                {
                    id: "iletkenlik", title: "İletkenlik",
                    summary: "Direncin tersi: G = 1/R, birimi siemens (S).",
                    blocks: [
                        simple(R`Direnç “akım ne kadar <b>zor</b> geçiyor?” sorusunun cevabıysa, iletkenlik “akım ne kadar <b>kolay</b> geçiyor?” sorusunun cevabıdır.`),
                        formula("İletkenlik", R`$$\text{iletkenlik} = \frac{1}{\text{direnç}} \qquad G = \frac{1}{R}$$
                            Birimi: $\dfrac{1}{\Omega} = \Omega^{-1} = \text{mho} = \textbf{siemens (S)}$
                            $$I = \frac{V}{R} = G \cdot V$$`),
                        def("Gerilim–akım öz eğrisi", R`Bir direncin $V$–$I$ grafiği orijinden geçen bir <b>doğrudur</b>. Doğrunun eğimi $\dfrac{I}{V} = G$'dir: iletkenlik büyüdükçe doğru dikleşir, direnç büyüdükçe yatıklaşır.`),
                        ex(R`$20\ \text{k}\Omega$'luk bir direncin iletkenliği nedir?`, [
                            R`$G = \dfrac{1}{R} = \dfrac{1}{20\,000} = 0{,}00005$ S.`,
                            R`$0{,}00005\text{ S} = 50 \times 10^{-6}\text{ S} = 50\ \mu$S.`,
                        ], R`$G = 50\ \mu$S`),
                        ex(R`İletkenliği $0{,}5$ S olan bir elemana $10$ V uygulanıyor. Akım ve direnç nedir?`, [
                            R`$I = G \cdot V = 0{,}5 \cdot 10 = 5$ A.`,
                            R`$R = 1/G = 1/0{,}5 = 2\,\Omega$. (Kontrol: $10/2 = 5$ A.)`,
                        ], R`$I = 5$ A, $\;R = 2\,\Omega$`),
                        quiz(R`$R = 4\,\Omega$ ise $G$ kaçtır?`, ["0,25 S", "4 S", "0,4 S", "16 S"], 0, R`$G = 1/4 = 0{,}25$ S.`),
                        quiz("Siemens hangi birime eşittir?", ["1/Ω (mho)", "Ω", "V·A", "J/s"], 0, R`Siemens = mho = $\Omega^{-1}$.`),
                    ],
                },
            ],
        },
        /* =========================== 2.2 =========================== */
        {
            no: "2.2", title: "Direnç, Malzeme ve Renk Kodları",
            lessons: [
                {
                    id: "malzeme", title: "Direnç ve Malzeme İlişkisi",
                    summary: "R = ρ·l/A = l/(κA): uzunluk, kesit ve malzeme.",
                    blocks: [
                        simple(R`Uzun ve ince bir pipetle su içmek zordur; kısa ve kalın bir pipetle kolaydır. Teller de böyledir: <b>uzun</b> tel daha çok, <b>kalın</b> tel daha az direnç gösterir. Bir de telin <b>malzemesi</b> önemlidir.`),
                        formula("İletken telin direnci", R`$$R = \rho\,\frac{l}{A} = \frac{l}{\varkappa\,A}$$
                            <ul>
                                <li>$l$: iletkenin uzunluğu (m)</li>
                                <li>$A$: kesit alanı (mm²)</li>
                                <li>$\rho$: <b>öz direnç</b> $\left[\dfrac{\Omega\,\text{mm}^2}{\text{m}}\right]$, $\quad \rho = R\,\dfrac{A}{l}$</li>
                                <li>$\varkappa$ (kappa): <b>öz iletkenlik</b> $\left[\dfrac{\text{m}}{\Omega\,\text{mm}^2}\right] = \left[\dfrac{\text{S}\,\text{m}}{\text{mm}^2}\right]$, $\quad \varkappa = \dfrac{1}{\rho}$</li>
                            </ul>
                            İletkenlik: $\;G = \dfrac{1}{R} = \dfrac{\varkappa A}{l}$`),
                        widget("wireR", "Tel direnci hesaplayıcı", "Malzemeyi, uzunluğu ve kesiti değiştir. Varsayılan değerler ilk örnekteki bakır dağıtım hattı."),
                        ex(R`$1$ km uzunluğundaki bakır bir dağıtım hattında kullanılan iletkenin kesiti $70\text{ mm}^2$'dir. Hattın direnci ne kadardır? ($\varkappa_{Cu} = 56$)`, [
                            R`$R_h = \rho\,\dfrac{l}{A} = \dfrac{l}{\varkappa A}$.`,
                            R`$R_h = \dfrac{1000\text{ m}}{56\,\dfrac{\text{m}}{\Omega\,\text{mm}^2} \cdot 70\text{ mm}^2} = \dfrac{1000}{3920}\ \Omega$.`,
                        ], R`$R_h \approx 0{,}255\ \Omega$`),
                        ex(R`Çapı $0{,}45$ mm ve direnci $55\,\Omega$ olan Cr-Ni (krom-nikel) telinin uzunluğu nedir? ($\varkappa_{Cr\text{-}Ni} = 0{,}91$)`, [
                            R`$R = \dfrac{l}{\varkappa A}$ → $l = R\,\varkappa\,A$.`,
                            R`Kesit alanı: $A = \pi \left(\dfrac{0{,}45}{2}\right)^2 = \pi \cdot 0{,}050625 \approx 0{,}159\text{ mm}^2$.`,
                            R`$l = 55 \cdot 0{,}91 \cdot 0{,}159 \approx 7{,}96$ m.`,
                        ], R`$l \approx 7{,}96$ m`),
                        ex(R`Kesiti $10\text{ mm}^2$ olan bir bakır hattın yerine alüminyum hat döşenecektir. Alüminyum hattın aynı dirençte olması için kesit alanı ne kadar olmalıdır? ($\varkappa_{Cu} = 56$, $\varkappa_{Al} = 35$)`, [
                            R`Uzunluklar aynı: $R_{Cu} = \dfrac{l}{\varkappa_{Cu} A_{Cu}}$, $\;R_{Al} = \dfrac{l}{\varkappa_{Al} A_{Al}}$.`,
                            R`$R_{Cu} = R_{Al}$ → $\varkappa_{Cu} A_{Cu} = \varkappa_{Al} A_{Al}$.`,
                            R`$A_{Al} = \dfrac{\varkappa_{Cu}}{\varkappa_{Al}} A_{Cu} = \dfrac{56}{35} \cdot 10 = 16\text{ mm}^2$.`,
                        ], R`$A_{Al} = 16\text{ mm}^2$`),
                        warn(R`Kesit alanını <b>mm²</b>, uzunluğu <b>m</b> olarak yaz; $\varkappa$'nın birimi buna göre seçilmiştir. Çap verildiyse önce $A = \pi d^2/4$ ile alanı bul (yarıçapı değil çapı kullandığına dikkat).`),
                        quiz("Bir telin uzunluğu iki katına çıkarılırsa direnci ne olur?", ["İki katına çıkar", "Yarıya iner", "Değişmez", "Dört katına çıkar"], 0, R`$R \propto l$.`),
                        quiz("Bir telin kesit alanı iki katına çıkarılırsa direnci ne olur?", ["Yarıya iner", "İki katına çıkar", "Değişmez", "Dörtte birine iner"], 0, R`$R \propto 1/A$.`),
                    ],
                },
                {
                    id: "oziletkenlik", title: "İletken Malzemelerin Öz İletkenlikleri",
                    summary: "Gümüş, bakır, altın, alüminyum… hangisi neden seçilir?",
                    blocks: [
                        simple(R`Her malzemenin “elektriği ne kadar iyi ilettiğini” anlatan bir sayısı vardır: öz iletkenlik $\varkappa$. Sayı büyükse malzeme iyi iletkendir.`),
                        table(R`<table class="mtable"><thead><tr><th>Malzeme</th><th>Öz direnç $\rho$ ($\Omega\,$mm²/m)</th><th>Öz iletkenlik $\varkappa$ (m/$\Omega\,$mm²)</th><th>Isı direnç katsayısı ($10^{-3}$/°C)</th></tr></thead><tbody>
                            <tr><td>Gümüş</td><td>0,0165</td><td>61</td><td>3,8</td></tr>
                            <tr><td>Bakır (yeraltı kablosu)</td><td>0,0172</td><td>58</td><td>3,93</td></tr>
                            <tr><td>Bakır (hava hattı)</td><td>0,0176</td><td>56</td><td>3,83</td></tr>
                            <tr><td>Altın</td><td>0,023</td><td>44</td><td>3,8–4</td></tr>
                            <tr><td>Alüminyum</td><td>0,0282</td><td>35</td><td>4,03</td></tr>
                            <tr><td>Tungsten (volfram)</td><td>0,055</td><td>18</td><td>4</td></tr>
                            <tr><td>Platin</td><td>0,10–0,11</td><td>10–9,1</td><td>3–3,8</td></tr>
                            <tr><td>Kalay</td><td>0,12</td><td>8,3</td><td>4,2–4,63</td></tr>
                            <tr><td>Çelik tel</td><td>0,17</td><td>6</td><td>5,2</td></tr>
                            <tr><td>Krom-nikel CN20</td><td>0,97</td><td>1,03</td><td>0,44</td></tr>
                            <tr><td>Krom-nikel CN80</td><td>1,12</td><td>0,89</td><td>0,14</td></tr>
                            <tr><td>Bizmut</td><td>1,2</td><td>0,83</td><td>4,2</td></tr>
                            <tr><td>Çinko</td><td>0,0606</td><td>16,5</td><td>4,7</td></tr>
                            <tr><td>Nikel</td><td>0,08–0,11</td><td>13–9</td><td>3,7–6</td></tr>
                            <tr><td>Demir</td><td>0,10–0,15</td><td>10–7</td><td>4,5–6</td></tr>
                            <tr><td>Pirinç (%60 Cu + %40 Zn)</td><td>0,064</td><td>16</td><td>1,5</td></tr>
                            <tr><td>Pirinç (%70 Cu + %30 Zn)</td><td>0,084</td><td>11,9</td><td>1,5</td></tr>
                        </tbody></table>`),
                        def("Hangi malzeme nerede?", R`<ul>
                            <li><b>Gümüş</b> en iyi iletkendir; sonra <b>bakır</b> ve <b>altın</b> gelir.</li>
                            <li>Bakır gümüşten çok daha <b>ucuz</b> olduğu için <b>kablo ve tellerde bakır</b> tercih edilir.</li>
                            <li>Altının iletkenliği bakır ve gümüşten düşüktür; ama <b>elektromanyetik bozucu etkilerden daha az etkilenir</b> (ayrıca oksitlenmez). Bozucu etkiler bağlantı noktalarında daha etkin olduğundan <b>konnektörlerde altın</b> kaplama tercih edilir.</li>
                            <li><b>Krom-nikel</b> gibi öz iletkenliği düşük alaşımlar, bilerek yüksek direnç istenen yerlerde (ısıtıcı telleri) kullanılır.</li>
                        </ul>`),
                        formula("Sıcaklık etkisi (ısı direnç katsayısı)", R`Metallerin direnci sıcaklıkla artar. Tablodaki katsayı $\alpha$ ile, $20\,°$C'deki direnç $R_{20}$ ise:
                            $$R_T \approx R_{20}\,\big(1 + \alpha\,(T - 20)\big)$$`),
                        ex(R`$20\,°$C'de $10\,\Omega$ olan bir bakır sargı ($\alpha = 3{,}93 \times 10^{-3}$/°C) $70\,°$C'ye ısınıyor. Yeni direnci yaklaşık kaçtır?`, [
                            R`$\Delta T = 70 - 20 = 50\,°$C.`,
                            R`$R_{70} = 10\,(1 + 0{,}00393 \cdot 50) = 10 \cdot 1{,}1965$.`,
                        ], R`$R_{70} \approx 11{,}97\,\Omega$ (yaklaşık %20 artış)`),
                        quiz("Kablolarda neden genellikle bakır kullanılır?", ["İyi iletken ve gümüşten ucuz olduğu için", "En iyi iletken olduğu için", "Paslanmadığı için", "Hafif olduğu için"], 0, R`En iyi iletken gümüştür ama pahalıdır.`),
                        quiz("Öz iletkenliği en büyük olan malzeme hangisidir?", ["Gümüş", "Bakır", "Altın", "Alüminyum"], 0, R`Gümüş: $\varkappa = 61$.`),
                    ],
                },
                {
                    id: "renk-kodu", title: "Direnç Renk Kodları",
                    summary: "4 ve 5 bantlı dirençlerin değerini renklerden okumak.",
                    blocks: [
                        simple(R`Dirençler o kadar küçüktür ki üzerlerine sayı yazmak zordur. Bunun yerine üzerlerine <b>renkli çizgiler</b> (bantlar) boyanır; her renk bir rakam demektir.`),
                        def("Renk kodu", R`Direncin değerini anlamak için üzerine çizilen renkli çizgilere <b>renk kodları</b> denir. Bir direnci tanımlayan önemli parametreler: <b>değeri</b>, <b>toleransı</b> ve <b>güç değeri</b>.
                            <ul>
                                <li><b>4 bantlı:</b> 1. ve 2. renk <b>sayı</b>, 3. renk <b>çarpan</b>, 4. renk <b>tolerans</b>.</li>
                                <li><b>5 bantlı:</b> 1., 2. ve 3. renk <b>sayı</b>, 4. renk <b>çarpan</b>, 5. renk <b>tolerans</b>.</li>
                            </ul>`),
                        table(R`<table class="mtable cc-table"><thead><tr><th></th><th>Renk</th><th>Sayı</th><th>Çarpan</th><th>Tolerans</th></tr></thead><tbody>
                            <tr>${sw("#1a1a1a")}<td>Siyah</td><td>0</td><td>×1</td><td></td></tr>
                            <tr>${sw("#7b4a1e")}<td>Kahverengi</td><td>1</td><td>×10</td><td>±%1</td></tr>
                            <tr>${sw("#e53935")}<td>Kırmızı</td><td>2</td><td>×100</td><td>±%2</td></tr>
                            <tr>${sw("#fb8c00")}<td>Turuncu</td><td>3</td><td>×1 k</td><td></td></tr>
                            <tr>${sw("#fdd835")}<td>Sarı</td><td>4</td><td>×10 k</td><td></td></tr>
                            <tr>${sw("#43a047")}<td>Yeşil</td><td>5</td><td>×100 k</td><td>±%0,5</td></tr>
                            <tr>${sw("#1e88e5")}<td>Mavi</td><td>6</td><td>×1 M</td><td>±%0,25</td></tr>
                            <tr>${sw("#8e24aa")}<td>Mor</td><td>7</td><td>×10 M</td><td>±%0,10</td></tr>
                            <tr>${sw("#9e9e9e")}<td>Gri</td><td>8</td><td></td><td>±%0,05</td></tr>
                            <tr>${sw("#ffffff")}<td>Beyaz</td><td>9</td><td></td><td></td></tr>
                            <tr>${sw("#d4af37")}<td>Altın</td><td></td><td>×0,1</td><td>±%5</td></tr>
                            <tr>${sw("#c0c0c0")}<td>Gümüş</td><td></td><td>×0,01</td><td>±%10</td></tr>
                        </tbody></table>`),
                        tip(R`Rakam sırasını ezberlemek için: <b>“SoKaKTa SaYaMaM GiBi”</b> → <b>So</b>(siyah 0) <b>Ka</b>(kahverengi 1) <b>K</b>(kırmızı 2) <b>Ta</b>(turuncu 3) <b>Sa</b>(sarı 4) <b>Ya</b>(yeşil 5) <b>Ma</b>(mavi 6) <b>M</b>(mor 7) <b>Gi</b>(gri 8) <b>Bi</b>(beyaz 9).`, "Ezber cümlesi"),
                        widget("colorCode", "Renk kodu okuyucu", "Bir banda dokun, sonra rengini seç. Ya da aşağıya bir değer yaz, renkler kendiliğinden ayarlansın."),
                        ex(R`4 bantlı bir direncin renkleri: <b>yeşil, mavi, turuncu, altın</b>. Değeri nedir?`, [
                            R`1. bant yeşil → 5, 2. bant mavi → 6: sayı $56$.`,
                            R`3. bant turuncu → çarpan $\times 1000$: $56 \times 1000 = 56\,000\,\Omega$.`,
                            R`4. bant altın → tolerans $\pm\%5$.`,
                        ], R`$56\text{ k}\Omega \pm \%5$`),
                        ex(R`5 bantlı bir direncin renkleri: <b>kırmızı, turuncu, mor, siyah, kahverengi</b>. Değeri nedir?`, [
                            R`Sayılar: kırmızı 2, turuncu 3, mor 7 → $237$.`,
                            R`4. bant siyah → çarpan $\times 1$: $237\,\Omega$.`,
                            R`5. bant kahverengi → $\pm\%1$.`,
                        ], R`$237\,\Omega \pm \%1$`),
                        def("Direncin güç değeri", R`Direncin <b>güç değeri</b>, direncin harcayabileceği <b>maksimum gücü</b> ifade eder. Bu değerin üzerine çıkılması dirence <b>zarar verir</b> (aşırı ısınır, yanar). Piyasada kolayca bulunan sıradan dirençler genellikle <b>0,25 W</b> gücündedir.`),
                        ex(R`$1\text{ k}\Omega$, $0{,}25$ W'lık bir dirence en fazla kaç volt uygulanabilir?`, [
                            R`$P = \dfrac{V^2}{R}$ → $V = \sqrt{P R}$.`,
                            R`$V = \sqrt{0{,}25 \cdot 1000} = \sqrt{250} \approx 15{,}8$ V.`,
                        ], R`En fazla yaklaşık $15{,}8$ V`),
                        quiz("4 bantlı bir dirençte 3. bant neyi gösterir?", ["Çarpanı", "Toleransı", "İkinci rakamı", "Güç değerini"], 0, R`4 bantlıda: sayı, sayı, çarpan, tolerans.`),
                        quiz("Kahverengi–siyah–kırmızı–altın renkli direncin değeri nedir?", ["1 kΩ ±%5", "102 Ω ±%5", "10 kΩ ±%10", "100 Ω ±%5"], 0, R`$10 \times 100 = 1000\,\Omega$; altın $\pm\%5$.`),
                    ],
                },
            ],
        },
        /* =========================== 2.3 =========================== */
        {
            no: "2.3", title: "Ohm Yasası Uygulamaları",
            lessons: [
                {
                    id: "ohm-pil", title: "Pil, Direnç ve Ampermetre",
                    summary: "Tek ve seri dirençli devreler, akımın ölçülmesi.",
                    blocks: [
                        simple(R`Ders notundaki üç basit deney: bir pile bir direnç, sonra arka arkaya iki direnç, en son da akımı ölçmek için bir <b>ampermetre</b> bağlıyoruz.`),
                        ex(R`$1{,}5$ V'luk pile $R_1 = 5\,\Omega$ bağlı. Akım nedir?`, [R`$I = \dfrac{V}{R} = \dfrac{1{,}5}{5}$.`], R`$I = 0{,}3$ A`),
                        formula("Arka arkaya (seri) dirençler", R`Dirençler aynı yol üzerinde arka arkaya bağlıysa toplam direnç, dirençlerin toplamıdır:
                            $$R_T = R_1 + R_2 + \dots$$
                            Hepsinden <b>aynı akım</b> geçer.`),
                        ex(R`Aynı pile $R_1 = 5\,\Omega$ ve $R_2 = 10\,\Omega$ arka arkaya bağlanıyor. Akım nedir?`, [
                            R`$R_T = R_1 + R_2 = 5 + 10 = 15\,\Omega$.`,
                            R`$I = \dfrac{V}{R_T} = \dfrac{1{,}5}{15} = 0{,}1$ A.`,
                        ], R`$I = 0{,}1$ A (direnç arttı, akım azaldı)`),
                        widget("circuitLoop", "İki dirençli devre", "Dirençleri değiştir: toplam direnç büyüdükçe ampermetrenin gösterdiği akım azalır.", { V: 1.5, R1: 5, R2: 10, mode: 1 }),
                        def("Ampermetre", R`Akımı ölçen alettir. Ölçeceği akımın içinden geçmesi gerektiği için devreye <b>seri</b> (yolun üzerine, arka arkaya) bağlanır. Multimetrede uçlar <b>mA/A</b> ve <b>COM</b> girişlerine takılır. İdeal ampermetrenin direnci sıfırdır; devreyi etkilemez.`),
                        ex(R`Bir multimetre ampermetre olarak $1{,}5$ V'luk pil ile $5\,\Omega$'luk direncin arasına seri bağlanıyor. Ekranda ne görülür?`, [
                            R`Ampermetre (ideal) direnç eklemez: $R_T = R_1 = 5\,\Omega$.`,
                            R`$I = 1{,}5 / 5 = 0{,}3$ A.`,
                        ], R`Ekranda $0{,}3$ A`),
                        warn(R`Ampermetreyi asla bir kaynağın uçlarına doğrudan (paralel) bağlama: direnci neredeyse sıfır olduğundan kısa devre olur, sigortası atar ya da alet bozulur. Gerilim ölçen <b>voltmetre</b> ise iki ucun arasına (paralel) bağlanır.`),
                        quiz("Ampermetre devreye nasıl bağlanır?", ["Seri", "Paralel", "Kaynağın uçlarına doğrudan", "Hiç bağlanmaz"], 0, R`Akım ampermetrenin içinden geçmelidir.`),
                        quiz(R`$3$ V'luk pile arka arkaya $10\,\Omega$ ve $20\,\Omega$ bağlıysa akım?`, ["0,1 A", "0,3 A", "0,15 A", "90 A"], 0, R`$I = 3/30 = 0{,}1$ A.`),
                    ],
                },
                {
                    id: "ohm-ornekler", title: "Dört Devre Örneği",
                    summary: "Akım, güç, gerilim ve direnç: eksik olanı bul.",
                    blocks: [
                        p(R`Aşağıdaki (a), (b), (c) ve (d) devrelerinde her seferinde farklı büyüklükler verilmiş. Ohm yasası ve güç formülleriyle eksik olanları bulacağız.`),
                        fig(FOUR),
                        ex(R`(a) Devreden geçen $I$ akımını ve dirençte harcanan gücü hesaplayınız.`, [
                            R`$I = \dfrac{V}{R} = \dfrac{12}{2000} = 0{,}006$ A $= 6$ mA.`,
                            R`$P = V \cdot I = 12 \cdot 0{,}006 = 0{,}072$ W $= 72$ mW.`,
                        ], R`$I = 6$ mA, $\;P = 72$ mW`),
                        ex(R`(b) Dirençte harcanan güç verildiğine göre devreden geçen $I$ akımını ve kaynağın gerilimini hesaplayınız.`, [
                            R`$P = I^2 R$ → $I = \sqrt{\dfrac{P}{R}} = \sqrt{\dfrac{3{,}6 \times 10^{-3}}{10^4}} = \sqrt{3{,}6 \times 10^{-7}}$.`,
                            R`$I = 6 \times 10^{-4}$ A $= 0{,}6$ mA.`,
                            R`$V = I R = 0{,}6\text{ mA} \cdot 10\text{ k}\Omega = 6$ V.`,
                        ], R`$I = 0{,}6$ mA, $\;V = 6$ V`),
                        ex(R`(c) Dirençte harcanan gücü, üzerine düşen gerilimi ve kaynağın gerilimini hesaplayınız.`, [
                            R`$V = \dfrac{I}{G} = \dfrac{0{,}5 \times 10^{-3}}{50 \times 10^{-6}} = 10$ V (dirençteki gerilim = kaynak gerilimi).`,
                            R`$P = V \cdot I = 10 \cdot 0{,}5 \times 10^{-3} = 5 \times 10^{-3}$ W $= 5$ mW. (Kontrol: $P = I^2/G$.)`,
                        ], R`$V = 10$ V, $\;P = 5$ mW`),
                        ex(R`(d) Direncin değerini ve kaynağın gerilimini hesaplayınız.`, [
                            R`Akım kaynağı $I = 4$ mA veriyor; bu akım direnç üzerinden geçer.`,
                            R`$P = V \cdot I$ → $V = \dfrac{P}{I} = \dfrac{80\text{ mW}}{4\text{ mA}} = 20$ V.`,
                            R`$R = \dfrac{V}{I} = \dfrac{20}{4 \times 10^{-3}} = 5000\,\Omega = 5\text{ k}\Omega$.`,
                        ], R`$V = 20$ V, $\;R = 5\text{ k}\Omega$`),
                        tip(R`Birim ön eklerine dikkat: $\text{m} = 10^{-3}$ (mili), $\mu = 10^{-6}$ (mikro), $\text{k} = 10^{3}$ (kilo). $\text{mA} \cdot \text{k}\Omega = \text{V}$ olduğu için bu ikili birlikte çok pratiktir.`),
                        quiz(R`$5$ V'luk kaynağa bağlı direnç $10$ mW harcıyorsa direnç kaç ohm'dur?`, ["2,5 kΩ", "500 Ω", "50 Ω", "250 Ω"], 0, R`$R = V^2/P = 25 / 0{,}01 = 2500\,\Omega$.`),
                        quiz(R`$2$ mA akım $3\text{ k}\Omega$'dan geçiyor. Gerilim?`, ["6 V", "1,5 V", "0,67 V", "6 mV"], 0, R`$V = 2\text{ mA} \cdot 3\text{ k}\Omega = 6$ V.`),
                    ],
                },
            ],
        },
        /* =========================== 2.4 =========================== */
        {
            no: "2.4", title: "Düğüm, Çevre ve Dal",
            lessons: [
                {
                    id: "dugum-cevre-dal", title: "Düğüm, Çevre ve Dal Kavramları",
                    summary: "Kirchhoff yasalarının dili: devrenin haritası.",
                    blocks: [
                        simple(R`Bir şehir haritası düşün: <b>kavşaklar</b> düğüm, iki kavşak arasındaki <b>yollar</b> dal, başladığın kavşağa geri dönen bir <b>tur</b> ise çevredir.`),
                        def("Düğüm", R`Birden fazla devre elemanının <b>birleşim noktasıdır</b>. Aralarında eleman bulunmayan tellerle birbirine bağlı noktalar <b>tek bir düğüm</b> sayılır.`),
                        def("Çevre", R`Bir devrede <b>aynı düğüme birden fazla kez rastlamadan</b> oluşturulan herhangi bir <b>kapalı yoldur</b>.`),
                        def("Dal", R`<b>İki düğüm noktası arasında kalan</b> devre parçasıdır (seri bağlı birden fazla pasif eleman içerebilir).`),
                        widget("nodeLoop", "Devrenin haritası", "Ders notundaki (b) devresi. Düğmelerle düğümleri, iki örnek çevreyi ve bir dalı vurgula."),
                        tip(R`Düğüm sayarken teli takip et: bir telin üzerinde ne kadar köşe ya da nokta olursa olsun, arada eleman yoksa hepsi <b>aynı</b> düğümdür. En sık yapılan hata, bir düğümü iki kez saymaktır.`),
                        formula("Sayılar arasındaki ilişki", R`$n$ düğüm ve $b$ dal içeren bir devrede bağımsız çevre sayısı:
                            $$\ell = b - n + 1$$
                            Örnek devrede $b = 8$, $n = 5$ → $\ell = 4$.`),
                        quiz("Çevre için hangisi doğrudur?", ["Kapalı bir yoldur ve hiçbir düğümden iki kez geçmez", "İki düğüm arasındaki parçadır", "Elemanların birleşim noktasıdır", "Açık bir yoldur"], 0, R`Dal iki düğüm arası; düğüm birleşim noktası.`),
                        quiz("Aralarında hiçbir eleman olmayan iki nokta…", ["aynı düğümdür", "farklı düğümlerdir", "bir daldır", "bir çevredir"], 0, R`Düz tel ile bağlı noktaların gerilimi aynıdır; tek düğüm sayılır.`),
                    ],
                },
            ],
        },
        /* =========================== 2.5 =========================== */
        {
            no: "2.5", title: "Kirchhoff'un Akım Yasası (KAY)",
            lessons: [
                {
                    id: "kay", title: "Kirchhoff'un Akım Yasası",
                    summary: "Bir düğüme giren akımların toplamı çıkanlarınkine eşittir.",
                    blocks: [
                        simple(R`Bir su borusu kavşağında su kaybolmaz ve birikmez: kavşağa ne kadar su giriyorsa o kadar su çıkar. Elektrik yükü de düğümde birikmez.`),
                        def("Kirchhoff'un Akım Yasası (KAY)", R`Herhangi bir devrede, herhangi bir düğüme giren akımların <b>cebirsel toplamı sıfırdır</b>. Başka bir ifadeyle, bir düğüme <b>gelen akımların toplamı, giden akımların toplamına eşittir</b>.
                            $$\sum i_{\text{giren}} = \sum i_{\text{çıkan}} \qquad\Longleftrightarrow\qquad \sum_k i_k = 0$$`),
                        def("İşaret kuralı", R`Düğüm denklemi yazarken ya düğüme <b>giren</b> akımlar pozitif, <b>çıkanlar</b> negatif alınır; ya da tam tersi. Hangisini seçtiğin önemli değil, <b>bir denklem içinde tutarlı</b> ol.
                            <br>Örnek: $I_1$ ve $I_2$ giriyor, $I_3$ ve $I_4$ çıkıyorsa:
                            $$I_1 + I_2 = I_3 + I_4 \qquad\text{ya da}\qquad 0 = -I_1 - I_2 + I_3 + I_4$$`),
                        widget("kcl", "Bilinmeyen akımı bul", "Ders örneği: I₁ = 5 A ve I₂ = 6 A giriyor, I₃ = 2 A ve I₅ = 5 A çıkıyor. I₄ kaç? Akımları ve yönlerini değiştirerek dene."),
                        ex(R`Bir düğüme $I_1 = 5$ A ve $I_2 = 6$ A giriyor; $I_3 = 2$ A, $I_5 = 5$ A ve $I_4$ çıkıyor. $I_4$ akımını bulunuz.`, [
                            R`Giren = çıkan: $I_1 + I_2 = I_3 + I_4 + I_5$.`,
                            R`$5 + 6 = 2 + I_4 + 5$ → $11 = 7 + I_4$.`,
                        ], R`$I_4 = 4$ A`),
                        warn(R`Bilinmeyen bir akımın yönünü bilmiyorsan <b>rastgele seç</b>. Sonuç negatif çıkarsa, gerçek yön seçtiğinin tersidir; büyüklük yine doğrudur.`),
                        quiz(R`Bir düğüme $3$ A ve $7$ A giriyor, $4$ A ile $I$ çıkıyor. $I = ?$`, ["6 A", "14 A", "0 A", "−6 A"], 0, R`$3 + 7 = 4 + I$ → $I = 6$ A.`),
                        quiz(R`KAY hangi korunum ilkesinden gelir?`, ["Yükün korunumu", "Enerjinin korunumu", "Momentumun korunumu", "Kütlenin korunumu"], 0, R`Düğümde yük birikmez: giren yük = çıkan yük. (KGY ise enerjinin korunumundan gelir.)`),
                    ],
                },
                {
                    id: "kay-denklem", title: "KAY Denklemlerini Yazmak",
                    summary: "Her düğüm için bir denklem; bağımlı kaynak da bir akımdır.",
                    blocks: [
                        p(R`Şekildeki devre için Kirchhoff akım yasası denklemlerini yazalım. Bu örnekte düğümden <b>çıkan akımları pozitif</b>, girenleri negatif alacağız.`),
                        fig(KCL_FIG, "Düğümler daire içindeki numaralarla gösterilmiş. 50 i₂(t) bağımlı bir akım kaynağıdır (oku 3'ten 2'ye)."),
                        ex(R`Devredeki dört düğüm için KAY denklemlerini yazınız.`, [
                            R`<b>Düğüm 1:</b> $i_1$ ve $i_2$ çıkıyor, $i_5$ (kaynaktan yukarı) giriyor: $\;i_1(t) + i_2(t) - i_5(t) = 0$`,
                            R`<b>Düğüm 2:</b> $i_2$ giriyor, $i_3$ çıkıyor, bağımlı kaynağın $50\,i_2$ akımı giriyor: $\;-i_2(t) + i_3(t) - 50\,i_2(t) = 0$`,
                            R`<b>Düğüm 3:</b> $i_1$ giriyor, $50\,i_2$ çıkıyor (kaynağa doğru), $i_4$ çıkıyor: $\;-i_1(t) + 50\,i_2(t) + i_4(t) = 0$`,
                            R`<b>Düğüm 4:</b> $i_5$ çıkıyor, $i_3$ ve $i_4$ giriyor: $\;i_5(t) - i_3(t) - i_4(t) = 0$`,
                        ], R`Dört denklem; bunlardan yalnızca üçü bağımsızdır.`),
                        tip(R`Dört denklemi alt alta toplarsan her akım bir kez $+$, bir kez $-$ geldiği için $0 = 0$ çıkar. Yani son denklem diğerlerinden elde edilebilir. Genel kural: $n$ düğümlü devrede <b>$n - 1$ bağımsız</b> KAY denklemi vardır.`),
                        tip(R`Bağımlı akım kaynağı da sıradan bir akım gibi denkleme girer; tek farkı değerinin başka bir akıma ($i_2$) bağlı olmasıdır.`, "Bağımlı kaynak"),
                        quiz("5 düğümlü bir devrede kaç bağımsız KAY denklemi yazılabilir?", ["4", "5", "6", "10"], 0, R`$n - 1 = 4$.`),
                        quiz(R`Bir düğüme $i_a$ giriyor; $i_b$ ve $3\,i_a$ çıkıyor (bağımlı kaynak). Çıkanlar pozitif kuralıyla denklem hangisidir?`, [R`$-i_a + i_b + 3\,i_a = 0$`, R`$i_a + i_b + 3\,i_a = 0$`, R`$i_a - i_b - 3\,i_a = 1$`, R`$-i_a - i_b + 3\,i_a = 0$`], 0, R`Giren $-$, çıkanlar $+$.`),
                    ],
                },
            ],
        },
        /* =========================== 2.6 =========================== */
        {
            no: "2.6", title: "Kirchhoff'un Gerilim Yasası (KGY)",
            lessons: [
                {
                    id: "kgy", title: "Kirchhoff'un Gerilim Yasası",
                    summary: "Bir çevredeki gerilimlerin cebirsel toplamı sıfırdır.",
                    blocks: [
                        simple(R`Bir dağ yürüyüşünde inip çıkarak başladığın yere dönersen, toplam yükseklik değişimin <b>sıfırdır</b>. Bir çevrede dolaşıp başladığın düğüme dönersen, gerilim “yükseliş ve inişlerinin” toplamı da sıfırdır.`),
                        def("Kirchhoff'un Gerilim Yasası (KGY)", R`Herhangi bir devrede, herhangi bir <b>çevredeki</b> elemanların gerilimlerinin <b>cebirsel toplamı sıfırdır</b>.
                            $$\sum_{\text{çevre}} v_k = 0$$`),
                        def("İşaretler nasıl konur?", R`Çevre denklemi yazarken takip edilen kapalı çevrenin <b>yönüne</b> göre elemanların işaretleri dikkate alınır:
                            <ul>
                                <li>Takip yönünde elemana <b>+ ucundan</b> giriyorsan gerilimini <b>+</b> yaz; <b>− ucundan</b> giriyorsan <b>−</b> yaz.</li>
                                <li>Ya da bunun tam tersi (çıkış ucunun işaretine bakmak) kabul edilebilir; yeter ki bütün çevrede aynı kural kullanılsın.</li>
                                <li>Dirençlerin üzerindeki gerilimin yönü <b>pasif işaretleme yöntemiyle</b> belirlenir: akım dirence + ucundan girer.</li>
                            </ul>`),
                        fig(KVL_DEF, "Ders notundaki çevre: a noktasından başlayıp saat yönünde dolaşacağız."),
                        ex(R`Şekildeki devrede $a$ noktasından başlayarak saat yönünde dolaşan çevre için KGY denklemini yazınız.`, [
                            R`$a \to b$: $R_1$'e $+$ ucundan giriyoruz → $+V_{R_1}$.`,
                            R`$b \to c$: 5 V kaynağına $-$ ucundan giriyoruz → $-5$.`,
                            R`$c \to d$: $R_2$'ye $+$ ucundan → $+V_{R_2}$. $\quad d \to e$: 15 V'a $-$ ucundan → $-15$.`,
                            R`$e \to f$: $R_3$'e $+$ ucundan → $+V_{R_3}$. $\quad f \to a$: 30 V'a $-$ ucundan → $-30$.`,
                            R`Ters kural (çıkış ucuna bakmak) ile aynı denklem $-1$ ile çarpılmış hâlde çıkar: $-V_{R_1} + 5 - V_{R_2} + 15 - V_{R_3} + 30 = 0$.`,
                        ], R`$+V_{R_1} - 5 + V_{R_2} - 15 + V_{R_3} - 30 = 0$`),
                        widget("kvl", "Çevrede yürü", "Dirençleri değiştir, kaynakları ters çevir; sonra adım adım çevreyi dolaş. Her adımda hangi işareti yazdığını ve toplamın sonunda sıfır olduğunu gör."),
                        quiz(R`Takip yönünde bir elemana $-$ ucundan giriyorsan (ilk kurala göre) gerilimini nasıl yazarsın?`, ["Negatif", "Pozitif", "Sıfır", "Yazmazsın"], 0, R`+ ucundan giriş $+$, − ucundan giriş $-$.`),
                        quiz(R`Bir çevrede $12$ V kaynak ve iki direnç var; birinin gerilimi $5$ V. Diğerinin gerilimi?`, ["7 V", "17 V", "5 V", "12 V"], 0, R`$12 = 5 + V_2$ → $V_2 = 7$ V.`),
                    ],
                },
                {
                    id: "kgy-ornek", title: "KGY Denklemlerini Yazmak",
                    summary: "Birden fazla çevreli bir devrede denklemler.",
                    blocks: [
                        p(R`Şekildeki devre için KGY denklemlerini yazalım. Devrede üç kapalı yol var: sol çevre ($a$–$b$–$e$–$f$), sağ çevre ($b$–$c$–$d$–$f$–$e$) ve dış çevre ($a$–$b$–$c$–$d$–$f$). Hepsini saat yönünde dolaşıp, “$+$ uçtan giriyorsan $+$” kuralını kullanacağız.`),
                        fig(KVL_FIG, "16 V kaynağının + ucu aşağıda (f tarafında)."),
                        ex(R`Sol çevre ($f \to a \to b \to e \to f$) için KGY denklemini yazınız.`, [
                            R`$f \to a$: 24 V'a $-$ ucundan → $-24$.`,
                            R`$a \to b$: $+V_{R_1}$. $\quad b \to e$: $R_4$'e $+$ ucundan → $+V_{R_4}$.`,
                            R`$e \to f$: 16 V kaynağının üst ucu $-$ → $-16$.`,
                        ], R`$-24 + V_{R_1} + V_{R_4} - 16 = 0 \;\Rightarrow\; V_{R_1} + V_{R_4} = 40$`),
                        ex(R`Sağ çevre ($b \to c \to d \to f \to e \to b$) için KGY denklemini yazınız.`, [
                            R`$b \to c$: $+V_{R_2}$; $\;c \to d$: $+V_{R_3}$.`,
                            R`$d \to f$: 8 V'a $+$ ucundan → $+8$.`,
                            R`$f \to e$: 16 V'a $+$ ucundan → $+16$; $\;e \to b$: $R_4$'e $-$ ucundan → $-V_{R_4}$.`,
                        ], R`$V_{R_2} + V_{R_3} + 8 + 16 - V_{R_4} = 0$`),
                        ex(R`Dış çevre ($f \to a \to b \to c \to d \to f$) için KGY denklemini yazınız ve ilk ikisiyle ilişkisini gösteriniz.`, [
                            R`$-24 + V_{R_1} + V_{R_2} + V_{R_3} + 8 = 0$.`,
                            R`İlk iki denklemi topla: $V_{R_4}$ ve $16$'lar sadeleşir, tam olarak bu denklem çıkar.`,
                        ], R`$V_{R_1} + V_{R_2} + V_{R_3} = 16$; bağımsız değildir.`),
                        ex(R`Aynı devrede $V_{R_1} = 10$ V ve $V_{R_2} = 4$ V ölçülmüş. $V_{R_4}$ ve $V_{R_3}$'ü bulunuz.`, [
                            R`Sol çevre: $V_{R_1} + V_{R_4} = 40$ → $V_{R_4} = 30$ V.`,
                            R`Sağ çevre: $4 + V_{R_3} + 24 - 30 = 0$ → $V_{R_3} = 2$ V.`,
                            R`Kontrol (dış çevre): $10 + 4 + 2 = 16$ ✓`,
                        ], R`$V_{R_4} = 30$ V, $\;V_{R_3} = 2$ V`),
                        tip(R`KAY'da olduğu gibi KGY'de de bütün denklemler bağımsız değildir. Bağımsız çevre sayısı $b - n + 1$'dir; genellikle devrenin “pencereleri” (iç çevreleri) seçilir.`),
                        quiz("Bir devrede iki iç çevre ve bir dış çevre varsa kaç bağımsız KGY denklemi vardır?", ["2", "3", "1", "6"], 0, R`Dış çevrenin denklemi iki iç çevrenin toplamıdır.`),
                    ],
                },
            ],
        },
    ];

    global.CHAPTERS = global.CHAPTERS || {};
    global.CHAPTERS.kirchhoff = {
        no: 2, id: "kirchhoff", title: "Direnç ve Kirchhoff Yasaları",
        intro: "Ders 3.2: direnç ve Ohm yasası, iletkenlik, direnç-malzeme ilişkisi, renk kodları, düğüm/çevre/dal kavramları, Kirchhoff'un akım ve gerilim yasaları.",
        sections,
    };
})(window);
