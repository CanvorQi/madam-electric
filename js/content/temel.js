/*
 * Bölüm 1 - Elektrik Mühendisliğinde Temel Kavramlar (Ders 3.1)
 * Akım, gerilim, enerji ve güç, enerji alan/veren elemanlar, Tellegen teoremi,
 * aktif/pasif devre elemanları, bağımsız ve bağımlı kaynaklar.
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
    // Uçları açık tek eleman (kaynak sembolleri için)
    const oneSym = (it, lbl) => svg(130, 130, [it, { t: "w", p: [[40, 20], [100, 20]] }, { t: "term", p: [100, 20] }, { t: "w", p: [[40, 110], [100, 110]] }, { t: "term", p: [100, 110] }]
        .concat(lbl ? [{ t: "txt", p: [10, 65], s: lbl, a: "start", tc: "big" }] : []), 130);
    const sym = (t) => svg(110, 40, [{ t, a: [5, 20], b: [105, 20] }], 110);

    /* Tellegen örneği (Ders 3.1, s. 6) */
    const TEL_ITEMS = [
        { t: "box", id: "e3", a: [40, 45], b: [340, 45], inner: "3" },
        { t: "pm", p: [164, 26], s: "+" }, { t: "txt", p: [190, 23], s: "12 V" }, { t: "pm", p: [216, 26], s: "-" },
        { t: "arr", p: [90, 45], d: "r", label: "1 A" },
        { t: "w", p: [[40, 45], [40, 110]] }, { t: "w", p: [[340, 45], [340, 110]] },
        { t: "box", id: "e4", a: [40, 110], b: [190, 110], inner: "4" },
        { t: "pm", p: [92, 92], s: "+" }, { t: "txt", p: [115, 89], s: "8 V" }, { t: "pm", p: [138, 92], s: "-" },
        { t: "arr", p: [62, 110], d: "r", label: "2 A", side: "b" },
        { t: "box", id: "e2", a: [190, 110], b: [340, 110], inner: "2" },
        { t: "pm", p: [242, 92], s: "+" }, { t: "txt", p: [265, 89], s: "4 V" }, { t: "pm", p: [288, 92], s: "-" },
        { t: "arr", p: [318, 110], d: "r", label: "1 A", side: "b" },
        { t: "V", id: "s24", a: [40, 110], b: [40, 210], plus: "a", label: "24 V", side: "r" },
        { t: "arr", p: [40, 196], d: "u", label: "3 A", side: "l" },
        { t: "box", id: "e1", a: [190, 110], b: [190, 210], inner: "1", label: "16 V", side: "l" },
        { t: "pm", p: [205, 137], s: "+" }, { t: "pm", p: [205, 183], s: "-" },
        { t: "arr", p: [190, 197], d: "d", label: "1 A", side: "r" },
        { t: "V", id: "s12", a: [340, 110], b: [340, 210], plus: "a", label: "12 V", side: "l" },
        { t: "arr", p: [340, 197], d: "d", label: "2 A", side: "r" },
        { t: "w", p: [[40, 210], [340, 210]] },
        { t: "dot", p: [40, 110] }, { t: "dot", p: [190, 110] }, { t: "dot", p: [340, 110] }, { t: "dot", p: [190, 210] },
    ];
    const TEL_ELS = [
        { id: "e1", name: "Eleman 1", v: 16, i: 1 }, { id: "e2", name: "Eleman 2", v: 4, i: 1 }, { id: "e3", name: "Eleman 3", v: 12, i: 1 },
        { id: "e4", name: "Eleman 4", v: 8, i: 2 }, { id: "s12", name: "12 V kaynak", v: 12, i: 2 }, { id: "s24", name: "24 V kaynak", v: 24, i: -3 },
    ];

    const sections = [
        /* =========================== 1.1 =========================== */
        {
            no: "1.1", title: "Akım ve Gerilim",
            lessons: [
                {
                    id: "akim", title: "Elektrik Akımı",
                    summary: "Yükün zamana göre değişim hızı: i = dq/dt, birimi amper.",
                    blocks: [
                        simple(R`Bir su borusunu düşün: borunun bir kesitinden her saniye ne kadar su geçtiği, akışın “şiddeti”dir. Elektrikte de su yerine <b>yük</b> akar. Bir telin kesitinden her saniye ne kadar yük geçiyorsa, <b>akım</b> odur.`),
                        def("Elektrik akımı", R`Bir iletkendeki <b>serbest elektronların</b>, elektriksel bir kuvvetin etkisiyle belirli bir yönde hareket etmesiyle oluşan yük akışına <b>elektrik akımı</b> denir.
                            <ul>
                                <li><b>Doğru akım (DC):</b> yönü ve büyüklüğü sabittir (pil, akü).</li>
                                <li><b>Alternatif akım (AC):</b> yönü ve büyüklüğü periyodik olarak değişir (evdeki priz).</li>
                            </ul>`),
                        formula("Akım = yükün değişim hızı", R`$$i(t) = \frac{dq(t)}{dt} \qquad\text{veya}\qquad q(t) = \int_{-\infty}^{t} i(\tau)\,d\tau$$
                            <ul><li>$q$: elektrik yükü (coulomb, C)</li><li>$t$: zaman (saniye, s)</li><li>$i$: akım (C/s = <b>amper</b>, A)</li></ul>
                            Akım sabitse kısaca $\;I = \dfrac{Q}{t}$.`),
                        def("1 amper nedir?", R`Bir kesitten <b>saniyede 1 C</b> yük geçiyorsa akım <b>1 A</b>'dir. Bir elektronun yükü $1{,}602 \times 10^{-19}$ C olduğundan, 1 A akımda her saniye yaklaşık $6{,}24 \times 10^{18}$ elektron geçer.
                            <br>Bir maddenin birim hacmindeki <b>serbest elektron sayısı ne kadar fazlaysa</b>, o madde o kadar iyi iletkendir.`),
                        widget("circuitLoop", "Elektronları ve akımı izle", "Pilin gerilimini ve direnci değiştir. Noktaların hızı akımla orantılı. Alttaki düğmeyle elektronların gerçek hareketiyle akımın yönünü karşılaştır.", { V: 1.5, R1: 5 }),
                        warn(R`Elektronlar devrede pilin <b>−</b> ucundan <b>+</b> ucuna doğru hareket eder. <b>Akımın yönü</b> ise geleneksel olarak bunun <b>tam tersi</b> kabul edilir: kaynağın <b>+</b> ucundan çıkıp devreyi dolaşarak <b>−</b> ucuna döner. Devre çözümlerinde hep bu “geleneksel akım yönü” kullanılır.`, "Akımın yönü ≠ elektronların yönü"),
                        ex(R`Bir iletkenin kesitinden $4$ saniyede $12$ C yük geçiyor. Akım kaç amperdir?`, [
                            R`Akım sabit: $I = \dfrac{Q}{t}$.`,
                            R`$I = \dfrac{12\text{ C}}{4\text{ s}} = 3$ C/s.`,
                        ], R`$I = 3$ A`),
                        ex(R`Bir elemandan geçen yük $q(t) = 5t^2$ mC ise $t = 2$ s anındaki akımı bulunuz.`, [
                            R`Akım, yükün türevidir: $i(t) = \dfrac{dq}{dt}$.`,
                            R`$i(t) = \dfrac{d}{dt}(5t^2) = 10t$ mA.`,
                            R`$t = 2$ s: $i = 10 \cdot 2 = 20$ mA.`,
                        ], R`$i(2) = 20$ mA`),
                        quiz("1 amperlik akım ne demektir?", ["Saniyede 1 coulomb yük geçmesi", "Saniyede 1 elektron geçmesi", "1 volt başına 1 ohm", "Saatte 1 coulomb yük geçmesi"], 0, R`$1\text{ A} = 1\text{ C/s}$.`),
                        quiz("Bir pile bağlı devrede elektronlar dış devrede hangi yönde hareket eder?", ["− uçtan + uca", "+ uçtan − uca", "Hareket etmez", "Her iki yönde eşit"], 0, R`Elektronlar − uçtan çıkıp + uca gider; akımın yönü bunun tersidir.`),
                    ],
                },
                {
                    id: "gerilim", title: "Gerilim",
                    summary: "Yükleri harekete geçiren “itme”: birimi volt.",
                    blocks: [
                        simple(R`Su, ancak iki nokta arasında <b>basınç farkı</b> varsa akar. Elektrikte bu farkın adı <b>gerilim</b>dir. Pil, iki ucu arasında sürekli bir “elektriksel basınç farkı” tutan bir pompa gibidir.`),
                        def("Gerilim", R`Bir elektrik devresinde yüklü taşıyıcıları harekete geçiren, yani <b>akımın akmasını sağlayan</b> etkiye <b>gerilim</b> denir. Bu etki enerji kaynağından gelir. Birimi <b>volt (V)</b>'tur.
                            <br>Gerilim, belirli bir elektrik yükünü taşımak için harcanan <b>enerji</b> olarak da açıklanır (bir sonraki derste formülüyle).`),
                        fig(svg(360, 170, [
                            { t: "bat", a: [50, 140], b: [50, 30], plus: "b", label: "Pil", side: "l" },
                            { t: "w", p: [[50, 30], [290, 30]] },
                            { t: "lamp", a: [290, 30], b: [290, 140], label: "Ampul", side: "r" },
                            { t: "w", p: [[290, 140], [50, 140]] },
                            { t: "arr", p: [120, 30], d: "r", label: "I (akımın yönü)" },
                            { t: "arr", p: [220, 140], d: "r", label: "e⁻ hareket yönü", side: "b" },
                        ]), "Pil (enerji kaynağı) bir ampule bağlı: akım + uçtan çıkar, elektronlar − uçtan çıkar."),
                        def("Pil içinde neler oluyor?", R`<ul>
                            <li>Kaynağın <b>pozitif (+)</b> ucunda elektron <b>azlığı</b>, <b>negatif (−)</b> ucunda elektron <b>fazlalığı</b> vardır.</li>
                            <li>Kaynak devreye bağlanınca, dış devrede <b>− uçtan + uca</b> doğru bir elektron akışı başlar. Akım yönü bunun tersidir: <b>+ uçtan − uca</b>.</li>
                            <li>Kaynak, kendi <b>elektromotor kuvveti</b> (EMK) ile + kutbuna ulaşan elektronları yeniden − kutbuna taşır; iki kutuptaki elektron yoğunluğu hep aynı kalır. Böylece <b>akımın sürekliliği</b> sağlanır.</li>
                        </ul>`),
                        tip(R`Gerilim her zaman <b>iki nokta arasında</b> ölçülür (potansiyel farkı). “A noktasının gerilimi 5 V” denirse, bu bir referans noktasına (genellikle toprak, 0 V) göredir.`),
                        quiz("Bir pilin hangi ucunda elektron fazlalığı vardır?", ["Negatif (−) uç", "Pozitif (+) uç", "Her iki uçta eşit", "Hiçbirinde"], 0, R`− uçta elektron fazlalığı, + uçta elektron azlığı vardır.`),
                        quiz("Devrede akımın sürekli akmasını ne sağlar?", ["Kaynağın elektromotor kuvveti", "Direncin ısınması", "Tellerin uzunluğu", "Elektronların yükü"], 0, R`Kaynak, + kutba ulaşan elektronları − kutba geri taşıyarak kutuplardaki yoğunluğu sabit tutar.`),
                    ],
                },
            ],
        },
        /* =========================== 1.2 =========================== */
        {
            no: "1.2", title: "Enerji, Güç ve Tellegen Teoremi",
            lessons: [
                {
                    id: "enerji-guc", title: "Gerilim, Enerji ve Güç",
                    summary: "v = dw/dq, p = v·i, Δw = ∫p dt.",
                    blocks: [
                        simple(R`Gerilim, her coulomb yükün “sırtına” ne kadar enerji yüklendiğini söyler. Akım, saniyede kaç coulomb taşındığını söyler. İkisini çarparsan saniyede taşınan enerjiyi, yani <b>gücü</b> bulursun.`),
                        formula("Gerilim: birim yük başına enerji", R`$$v = \frac{dw}{dq} \qquad \left[\frac{\text{J}}{\text{C}} = \text{V}\right]$$
                            1 C yükü bir eleman içinde hareket ettirmek için 1 J enerji gerekiyorsa elemanın gerilimi 1 V'tur.`),
                        def("Enerji", R`<b>Enerji</b>, iş yapabilme kapasitesidir. Birimi <b>joule (J)</b>; $1\text{ J} = 1\text{ W} \cdot \text{s}$.`),
                        formula("Güç: enerjinin değişim hızı", R`Gerilim ifadesini akımla çarpınca enerjinin türevi çıkar:
                            $$v\,i = \frac{dw}{dq}\cdot\frac{dq}{dt} = \frac{dw}{dt} = p$$
                            Gücün birimi saniyedeki joule, yani <b>watt (W)</b>'tır: $1\text{ W} = 1\text{ J/s}$.`),
                        formula("Bir zaman aralığındaki enerji", R`Gerilim ve akım zamanla değişebileceği için güç de değişir. $t_1$ ile $t_2$ arasında aktarılan enerji:
                            $$\Delta w = \int_{t_1}^{t_2} p\,dt = \int_{t_1}^{t_2} v\,i\,dt$$
                            Güç sabitse: $\;W = P \cdot t$.`),
                        widget("energyPlot", "Enerjiden güce, güçten akıma", "Bir devrenin çektiği enerji w(t) verilmiş, gerilim 10 V. Zamanı kaydır: güç, enerji eğrisinin eğimidir; akım ise güç bölü gerilim.", { pts: [[0, 0], [2, 20], [5, 20], [7, 0], [8, 0]], V: 10, t: 1 }),
                        ex(R`$12$ V'luk bir akü, bir lambaya $2$ A akım veriyor. Lambanın gücünü ve $1$ saatte harcadığı enerjiyi bulunuz.`, [
                            R`$P = V \cdot I = 12 \cdot 2 = 24$ W.`,
                            R`Güç sabit: $W = P \cdot t = 24\text{ W} \cdot 3600\text{ s} = 86\,400$ J.`,
                            R`Faturadaki birimle: $24\text{ W} \cdot 1\text{ h} = 24$ Wh $= 0{,}024$ kWh.`,
                        ], R`$P = 24$ W, $\;W = 86{,}4$ kJ $= 0{,}024$ kWh`),
                        ex(R`Bir elemanın gerilimi sabit $v = 10$ V, akımı $i(t) = 2t$ A'dir. $0$–$3$ s arasında elemana aktarılan enerjiyi bulunuz.`, [
                            R`$p(t) = v\,i = 10 \cdot 2t = 20t$ W.`,
                            R`$\Delta w = \displaystyle\int_0^3 20t\,dt = 10t^2 \Big|_0^3 = 90$ J.`,
                        ], R`$\Delta w = 90$ J`),
                        tip(R`Elektrik faturasındaki <b>kWh</b> bir enerji birimidir: $1\text{ kWh} = 1000\text{ W} \cdot 3600\text{ s} = 3{,}6$ MJ.`),
                        quiz("1 watt neye eşittir?", ["1 J/s", "1 C/s", "1 J/C", "1 V/A"], 0, R`Güç = enerji / zaman. (1 C/s amper, 1 J/C volt, 1 V/A ohm'dur.)`),
                        quiz("5 V altında 0,2 A çeken bir eleman ne kadar güç çeker?", ["1 W", "25 W", "0,04 W", "5,2 W"], 0, R`$P = 5 \cdot 0{,}2 = 1$ W.`),
                    ],
                },
                {
                    id: "isaret", title: "Enerji Alan ve Enerji Veren Elemanlar",
                    summary: "Pasif işaret yöntemi: p > 0 alıyor, p < 0 veriyor.",
                    blocks: [
                        simple(R`Bazı elemanlar enerji <b>harcar</b> (ampul, ısıtıcı), bazıları enerji <b>verir</b> (pil). Bir elemanın hangisi olduğunu, gerilimi ile akımını işaretleriyle çarpıp çıkan sonucun <b>işaretine</b> bakarak anlarız.`),
                        def("Pasif işaret yöntemi", R`Elemanın uçlarına bir gerilim yönü ($+$, $-$) ve bir akım yönü (ok) seçilir:
                            <ul>
                                <li>Akım elemana <b>+ işaretli uçtan giriyorsa</b>: $\;p = +v \cdot i$</li>
                                <li>Akım elemana <b>− işaretli uçtan giriyorsa</b> (+ uçtan çıkıyorsa): $\;p = -v \cdot i$</li>
                            </ul>
                            Sonuç <b>pozitifse</b> eleman dışarıdan <b>güç alıyor</b> (çekiyor); <b>negatifse</b> eleman dışarıya <b>güç veriyor</b>.`),
                        widget("powerSign", "Güç alıyor mu, veriyor mu?", "Ders notundaki iki şekil: solda devrenin geri kalanı, sağda incelediğimiz eleman. Gerilimi, akımı ve okun yönünü değiştir; gücün işaretini izle."),
                        ex(R`Şekil (a) ve (b)'de $A$–$B$ arası gerilim $3$ V ($A$ ucu $+$), akım $2$ A'dir. (a)'da akım elemana $A$ ucundan giriyor, (b)'de $A$ ucundan çıkıyor. Her durumda elemanın gücünü bulunuz.`, [
                            R`(a) Akım $+$ uçtan giriyor: $p = +v\,i = (3)(2) = 6$ W $> 0$ → eleman <b>güç alıyor</b>.`,
                            R`(b) Akım $+$ uçtan çıkıyor: $p = -v\,i = -(3)(2) = -6$ W $< 0$ → eleman <b>güç veriyor</b>.`,
                        ], R`(a) $6$ W alıyor, (b) $6$ W veriyor.`),
                        ex(R`$12$ V'luk bir otomobil aküsünün $+$ ucundan içeri $5$ A akım giriyor. Akü güç alıyor mu, veriyor mu?`, [
                            R`Akım $+$ uçtan giriyor: $p = (12)(5) = 60$ W.`,
                            R`$p > 0$: akü güç <b>alıyor</b>, yani şarj oluyor. Marş sırasında akım $+$ uçtan çıkar ve akü güç verir.`,
                        ], R`$60$ W alıyor (şarj oluyor).`),
                        warn(R`Gerilim ve akım yönleri başta <b>keyfî</b> seçilebilir. Hesap sonunda akım ya da gerilim negatif çıkarsa, gerçek yön seçilenin tersidir; ama gücün işareti yine doğru sonucu verir.`),
                        quiz(R`Bir elemanda akım $-$ uçtan giriyor; $v = 4$ V, $i = 3$ A. Elemanın gücü nedir?`, ["−12 W, güç veriyor", "12 W, güç alıyor", "−12 W, güç alıyor", "0,75 W, güç veriyor"], 0, R`$-$ uçtan giriş → $p = -v\,i = -12$ W; negatif olduğu için güç veriyor.`),
                        quiz(R`Hesap sonunda bir eleman için $p = -20$ W bulundu. Bu eleman…`, ["devreye 20 W güç veriyor", "devreden 20 W güç alıyor", "hiç güç almıyor", "bozuk demektir"], 0, R`Negatif güç = eleman dışarıya güç veriyor (kaynak gibi davranıyor).`),
                    ],
                },
                {
                    id: "tellegen", title: "Tellegen Teoremi",
                    summary: "Bir devrede verilen güçlerin toplamı alınan güçlerin toplamına eşittir.",
                    blocks: [
                        simple(R`Enerji yoktan var olmaz, yok olmaz. Bir devrede kaynakların verdiği her watt, mutlaka başka elemanlar tarafından alınır. Bir banka hesabı gibi: giren para = çıkan para.`),
                        def("Tellegen teoremi", R`Bir elektrik devresinde <b>verilen güçlerin toplamı, alınan güçlerin toplamına eşittir</b>. Güçleri işaretleriyle (alınan $+$, verilen $-$) toplarsak sonuç sıfırdır.
                            <br>Bir devre çözüldükten sonra hesapların doğruluğunu <b>kontrol etmek</b> için Tellegen teoreminin sağlanıp sağlanmadığına bakılır.`),
                        formula("Güç dengesi", R`$$\sum_{k} p_k = \sum_{k} v_k\, i_k = 0 \qquad\Longleftrightarrow\qquad \sum p_{\text{alınan}} = \sum \left|p_{\text{verilen}}\right|$$`),
                        widget("tellegen", "Ders örneği: güçleri tek tek hesapla", "Her elemanda akımı + uçtan giren yönde aldık (24 V kaynakta akım + uçtan çıktığı için −3 A). Şekilde ya da tabloda bir elemana dokun.", { items: TEL_ITEMS, els: TEL_ELS, w: 400, h: 235 }),
                        ex(R`Yukarıdaki devrede her elemanın çektiği / verdiği gücü hesaplayınız. Tellegen teoreminin sağlandığını gösteriniz.`, [
                            R`İşaretleme yöntemiyle: $P_1 = (16)(1) = 16$ W, $\;P_2 = (4)(1) = 4$ W, $\;P_3 = (12)(1) = 12$ W.`,
                            R`$P_4 = (8)(2) = 16$ W, $\;P_{12V} = (12)(2) = 24$ W (akım 12 V kaynağın + ucundan giriyor: o da güç alıyor!).`,
                            R`$P_{24V} = (24)(-3) = -72$ W: 24 V kaynak güç veriyor.`,
                            R`Toplam: $16 + 4 + 12 + 16 + 24 - 72 = 0$.`,
                        ], R`Alınan $72$ W = verilen $72$ W; Tellegen teoremi sağlanıyor.`),
                        tip(R`Bir kaynak her zaman güç vermek zorunda değildir! Yukarıdaki 12 V kaynak <b>güç alıyor</b> (şarj olan bir akü gibi). Kimin aldığına, kimin verdiğine işaret karar verir.`),
                        ex(R`Bir $10$ V kaynak $2$ A akım veriyor. Devredeki iki elemandan biri $6$ V gerilimde $2$ A çekiyor. Diğer eleman ne kadar güç çeker?`, [
                            R`Kaynağın verdiği güç: $10 \cdot 2 = 20$ W.`,
                            R`Birinci eleman: $6 \cdot 2 = 12$ W alıyor.`,
                            R`Tellegen: $20 = 12 + P_2$ → $P_2 = 8$ W.`,
                        ], R`$P_2 = 8$ W`),
                        quiz("Bir devrede alınan güçlerin toplamı 50 W ise verilen güçlerin toplamı kaçtır?", ["50 W", "0 W", "100 W", "25 W"], 0, R`Tellegen: verilen = alınan.`),
                        quiz("Tellegen teoremi en çok ne için kullanılır?", ["Devre çözümünün doğruluğunu kontrol etmek için", "Direnci ölçmek için", "Renk kodu okumak için", "Akım yönünü değiştirmek için"], 0, R`Toplam güç sıfır çıkmıyorsa bir yerde hata vardır.`),
                    ],
                },
            ],
        },
        /* =========================== 1.3 =========================== */
        {
            no: "1.3", title: "Devre Elemanları ve Kaynaklar",
            lessons: [
                {
                    id: "aktif-pasif", title: "Aktif ve Pasif Devre Elemanları",
                    summary: "Enerji üretebilen (aktif) ve üretemeyen (pasif) elemanlar.",
                    blocks: [
                        simple(R`Elemanları iki takıma ayırırız: enerji <b>üretebilenler</b> (aktif) ve yalnızca enerjiyi <b>harcayan ya da biriktirenler</b> (pasif). Pil aktif, ampul pasif.`),
                        def("Pasif devre elemanları", R`<ul>
                            <li>Enerji üretme kapasitesi <b>olmayan</b> elemanlardır.</li>
                            <li>Kendi enerji kaynakları yoktur; gerilim uygulanınca geçen akımın sonucu olarak enerji <b>harcar</b> ya da <b>depolarlar</b>.</li>
                            <li>Örnekler: <b>dirençler</b>, <b>kondansatörler</b>, <b>endüktanslar (bobinler)</b>.</li>
                        </ul>`),
                        def("Aktif devre elemanları", R`<ul>
                            <li>Enerji üretme kapasitesine <b>sahip</b> elemanlardır; enerji üretir ya da enerji seviyesini yükseltirler.</li>
                            <li>Örnekler: jeneratörler, piller (bataryalar). En önemlileri, bağlandıkları devreye güç sağlayan <b>akım ve gerilim kaynaklarıdır</b>.</li>
                        </ul>`),
                        table(R`<table class="mtable"><thead><tr><th>Eleman</th><th>Sembol</th><th>Değer (birim)</th><th>Ne yapar?</th></tr></thead><tbody>
                            <tr><td><b>Direnç</b></td><td>${sym("R")}</td><td>$R$ (ohm, $\Omega$)</td><td>Enerjiyi ısıya çevirerek harcar</td></tr>
                            <tr><td><b>Bobin (endüktans)</b></td><td>${sym("L")}</td><td>$L$ (henry, H)</td><td>Enerjiyi manyetik alanda depolar</td></tr>
                            <tr><td><b>Kondansatör</b></td><td>${sym("C")}</td><td>$C$ (farad, F)</td><td>Enerjiyi elektrik alanında depolar</td></tr>
                        </tbody></table>`),
                        tip(R`Telefon ve bilgisayar kartlarında bu elemanların pirinç tanesi kadar küçük <b>SMD</b> (yüzey montajlı) hâlleri kullanılır. Görünüşleri farklı olsa da şemadaki sembolleri aynıdır.`),
                        quiz("Aşağıdakilerden hangisi aktif bir devre elemanıdır?", ["Pil", "Direnç", "Kondansatör", "Bobin"], 0, R`Pil enerji üretebilir; diğerleri pasiftir.`),
                        quiz("Endüktansın (bobinin) birimi nedir?", ["Henry (H)", "Farad (F)", "Ohm (Ω)", "Siemens (S)"], 0, R`$L$ henry; $C$ farad; $R$ ohm.`),
                    ],
                },
                {
                    id: "kaynaklar", title: "Bağımsız Kaynaklar",
                    summary: "Gerilimini ya da akımını ne olursa olsun koruyan kaynaklar.",
                    blocks: [
                        simple(R`İdeal bir gerilim kaynağı “inatçıdır”: ona ne bağlarsan bağla, uçlarındaki gerilimi değiştirmez; gerekirse akımı değiştirir. İdeal akım kaynağı da akımında inat eder.`),
                        p(R`Kaynaklar <b>bağımsız</b> ve <b>bağımlı</b> olmak üzere ikiye ayrılır. <b>Bağımsız kaynaklar</b>, devrenin geri kalanında olan bitenden bağımsız olarak belli bir akım ya da gerilim üretir.`),
                        fig(`<div class="fig-grid">
                            <div>${oneSym({ t: "V", a: [40, 20], b: [40, 110], plus: "a" }, "v")}<div class="fig-cap">(a) Gerilim kaynağı</div></div>
                            <div>${oneSym({ t: "bat", a: [40, 110], b: [40, 20], plus: "b" }, "V")}<div class="fig-cap">(b) Pil (DC)</div></div>
                            <div>${oneSym({ t: "I", a: [40, 110], b: [40, 20], to: "b" }, "i")}<div class="fig-cap">(c) Akım kaynağı</div></div>
                        </div>`, "Bağımsız kaynak sembolleri: daire biçimli."),
                        def("Bağımsız gerilim kaynağı", R`İçinden geçen akım <b>ne olursa olsun</b>, iki ucu arasındaki gerilimi <b>sabit kalan</b> devre elemanıdır (şekil a ve b).`),
                        def("Bağımsız akım kaynağı", R`İki ucu arasındaki gerilim <b>ne olursa olsun</b>, içinden akan akımı <b>sabit kalan</b> devre elemanıdır (şekil c). Oku akımın yönünü gösterir.`),
                        ex(R`$9$ V'luk ideal bir gerilim kaynağına önce $3\,\Omega$, sonra $9\,\Omega$ bağlanıyor. $2$ A'lik ideal bir akım kaynağına da önce $5\,\Omega$, sonra $10\,\Omega$ bağlanıyor. Kaynakların akım ve gerilimlerini bulunuz.`, [
                            R`Gerilim kaynağı gerilimini korur: $I = 9/3 = 3$ A, sonra $I = 9/9 = 1$ A. Değişen akımdır.`,
                            R`Akım kaynağı akımını korur: $V = 2 \cdot 5 = 10$ V, sonra $V = 2 \cdot 10 = 20$ V. Değişen gerilimdir.`,
                        ], R`Gerilim kaynağında $9$ V sabit, akım $3$ A → $1$ A; akım kaynağında $2$ A sabit, gerilim $10$ V → $20$ V.`),
                        warn(R`Gerçek kaynaklar ideal değildir: bir pilin uçlarını tel ile kısa devre edersen gerilimi düşer ve pil ısınır. İdeal modeller, devre çözümünü kolaylaştırmak içindir.`),
                        quiz("İdeal bir gerilim kaynağı için hangisi doğrudur?", ["Gerilimi, çekilen akımdan bağımsız olarak sabittir", "Akımı her zaman sabittir", "Gerilimi bağlanan dirence göre değişir", "Güç veremez"], 0, R`Bağımsız gerilim kaynağının gerilimi sabittir; akımı devreye göre değişir.`),
                        quiz("Bağımsız akım kaynağının şemadaki sembolü nasıldır?", ["İçinde ok olan daire", "İçinde + ve − olan daire", "İçinde ok olan eşkenar dörtgen", "Zikzak çizgi"], 0, R`İçinde + / − olan daire gerilim kaynağıdır; eşkenar dörtgen bağımlı kaynaktır.`),
                    ],
                },
                {
                    id: "bagimli", title: "Bağımlı Kaynaklar",
                    summary: "Çıkışı devrenin başka bir yerindeki akıma ya da gerilime bağlı kaynaklar.",
                    blocks: [
                        simple(R`Bir müzik setinin ses düğmesini düşün: hoparlöre giden güç, senin parmağınla çevirdiğin düğmeye <b>bağlıdır</b>. Bağımlı kaynakta da çıkış, devrenin <b>başka bir yerindeki</b> bir akım ya da gerilim tarafından yönetilir.`),
                        def("Bağımlı (kontrollü) kaynak", R`Dahil olduğu devrenin başka bir noktasındaki <b>akıma veya gerilime bağlı olarak</b> akım ya da gerilim üreten elemanlardır. MOSFET, bipolar transistör, işlemsel yükselteç gibi elektronik elemanların davranışını incelemek için kullanılan <b>modellerdir</b>. Şemada <b>eşkenar dörtgen</b> ile çizilir.`),
                        fig(`<div class="fig-grid">
                            <div>${oneSym({ t: "DV", a: [40, 20], b: [40, 110], plus: "a" }, "v")}<div class="fig-cap">Bağımlı gerilim kaynağı</div></div>
                            <div>${oneSym({ t: "DI", a: [40, 110], b: [40, 20], to: "b" }, "i")}<div class="fig-cap">Bağımlı akım kaynağı</div></div>
                        </div>`),
                        table(R`<table class="mtable"><thead><tr><th>Tür</th><th>Kontrol eden</th><th>Çıkış</th><th>Kazanç (birimi)</th></tr></thead><tbody>
                            <tr><td>(a) Gerilim kontrollü gerilim kaynağı</td><td>$v_S$</td><td>$v = \mu\, v_S$</td><td>$\mu$ (birimsiz)</td></tr>
                            <tr><td>(b) Akım kontrollü gerilim kaynağı</td><td>$i_S$</td><td>$v = r\, i_S$</td><td>$r$ ($\Omega$ = V/A)</td></tr>
                            <tr><td>(c) Gerilim kontrollü akım kaynağı</td><td>$v_S$</td><td>$i = g\, v_S$</td><td>$g$ (S = A/V)</td></tr>
                            <tr><td>(d) Akım kontrollü akım kaynağı</td><td>$i_S$</td><td>$i = \beta\, i_S$</td><td>$\beta$ (birimsiz)</td></tr>
                        </tbody></table>`),
                        widget("depSource", "Dört bağımlı kaynak türü", "Bir tür seç; kontrol eden büyüklüğü ve kazancı değiştir, çıkışın nasıl değiştiğini izle."),
                        ex(R`Bir gerilim kontrollü gerilim kaynağında $\mu = 5$, kontrol gerilimi $v_S = 2$ V'tur. Bir akım kontrollü akım kaynağında (transistör modeli) $\beta = 100$, $i_S = 20\ \mu$A'dir. Çıkışları bulunuz.`, [
                            R`$v = \mu\, v_S = 5 \cdot 2 = 10$ V.`,
                            R`$i = \beta\, i_S = 100 \cdot 20\ \mu\text{A} = 2000\ \mu\text{A} = 2$ mA.`,
                        ], R`$v = 10$ V, $\;i = 2$ mA`),
                        tip(R`Şemada <b>daire</b> görürsen bağımsız, <b>eşkenar dörtgen</b> görürsen bağımlı kaynak. Bağımlı kaynağın yanında hep bir formül yazar: $8I_x$, $0{,}2I$, $50\,i_2(t)$ gibi.`),
                        quiz(R`Akım kontrollü gerilim kaynağının kazancı $r$'nin birimi nedir?`, ["Ohm (V/A)", "Siemens (A/V)", "Birimsiz", "Watt"], 0, R`$v = r\,i_S$ → $r = v / i_S$: volt bölü amper = ohm.`),
                        quiz(R`Şemada yanında “$10\,i_x$” yazan ve içinde ok bulunan eşkenar dörtgen hangi kaynaktır?`, ["Akım kontrollü akım kaynağı", "Gerilim kontrollü gerilim kaynağı", "Bağımsız akım kaynağı", "Akım kontrollü gerilim kaynağı"], 0, R`Ok → akım kaynağı; dörtgen → bağımlı; $i_x$ → akım kontrollü.`),
                    ],
                },
            ],
        },
    ];

    global.CHAPTERS = global.CHAPTERS || {};
    global.CHAPTERS.temel = {
        no: 1, id: "temel", title: "Elektrik Mühendisliğinde Temel Kavramlar",
        intro: "Ders 3.1: akım ve gerilim, enerji ve güç, enerji alan ve veren elemanlar, Tellegen teoremi, aktif/pasif devre elemanları, bağımsız ve bağımlı kaynaklar.",
        sections,
    };

    global.COURSE = {
        title: "Temel Elektrik Devreleri",
        source: "BM-1307117 Temel Elektrik Devreleri ders notları (Ders 3.1 ve 3.2)",
        chapters: [
            { no: 1, title: "Elektrik Mühendisliğinde Temel Kavramlar", sub: "Ders 3.1 · 3 alt konu · 8 ders", id: "temel" },
            { no: 2, title: "Direnç ve Kirchhoff Yasaları", sub: "Ders 3.2 · 6 alt konu · 13 ders", id: "kirchhoff" },
            { no: 3, title: "Seri ve Paralel Bağlantı", sub: "Eşdeğer direnç, gerilim ve akım bölücü" },
            { no: 4, title: "Devre Analiz Yöntemleri", sub: "Düğüm gerilimleri, çevre akımları" },
            { no: 5, title: "Devre Teoremleri", sub: "Thevenin, Norton, süperpozisyon" },
            { no: 6, title: "Kondansatör ve Bobin", sub: "Enerji depolayan elemanlar" },
        ],
    };
})(window);
