# Madam Elektrik

Temel elektrik devrelerini en basit hâliyle anlatan, etkileşimli devre araçlı web uygulaması (PWA). Madam Matematik ile aynı kabuğu kullanır.
**BM-1307117 Temel Elektrik Devreleri** ders notlarından hazırlanmıştır:

- **Bölüm 1 · Ders 3.1 – Elektrik Mühendisliğinde Temel Kavramlar** (1.1–1.3, 8 ders): akım, gerilim, enerji ve güç, pasif işaret yöntemi, Tellegen teoremi, aktif/pasif elemanlar, bağımsız ve bağımlı kaynaklar.
- **Bölüm 2 · Ders 3.2 – Direnç ve Kirchhoff Yasaları** (2.1–2.6, 13 ders): direnç ve Ohm yasası, iletkenlik, R = l/(κA), öz iletkenlik tablosu, renk kodları, düğüm/çevre/dal, KAY, KGY.

3 çoktan seçmeli test ve 3 alıştırma seti (ders notlarındaki ödevlerin adım adım çözümleri dahil) vardır.

Kurulum veya derleme adımı yoktur; saf HTML/CSS/JS'dir.

## Yerelde çalıştırma

```bash
python -m http.server 8000
# tarayıcıda: http://localhost:8000
```

(Service worker `file://` üzerinden çalışmaz; bir sunucuyla aç.)

## GitHub Pages'te yayınlama

1. Bu klasörü bir GitHub deposuna yükle (`index.html` depo kökünde olmalı). PDF'leri yüklemek zorunlu değil.
2. Depo → **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch: `main`, klasör: `/ (root)`.

İlerleme `madamel_*` anahtarlarıyla, önbellek `madam-el-*` adıyla saklanır; aynı adreste yayınlanan diğer Madam uygulamalarıyla karışmaz.

## Dosya yapısı

| Dosya | Görevi |
|---|---|
| `index.html` | Uygulama kabuğu (sol menü, mobil üst/alt menü) |
| `css/style.css` | Tasarım (açık/koyu tema) + devre şeması, grafik, renk kodu stilleri |
| `js/circuit.js` | `Ckt`: SVG devre şeması çizici (direnç, kaynaklar, bağımlı kaynaklar, pil, oklar, düğümler) |
| `js/widgets.js` | Derslerdeki araçlar: `circuitLoop`, `powerSign`, `energyPlot`, `tellegen`, `depSource`, `ohmVI`, `wireR`, `colorCode`, `kcl`, `kvl`, `nodeLoop`, `ohmCalc` |
| `js/content/temel.js` | Bölüm 1 dersleri + `COURSE` (bölüm listesi) |
| `js/content/kirchhoff.js` | Bölüm 2 dersleri |
| `js/content/testler.js` | Testler ve alıştırmalar (ödev şemaları dahil) |
| `js/app.js` | Yönlendirme, sayfalar (`#/lab` = Devre Lab), ilerleme |
| `sw.js`, `manifest.json`, `icons/` | PWA |

## Yeni bölüm eklemek

1. `js/content/` altına `kirchhoff.js` ile aynı yapıda yeni bir dosya ekle (`CHAPTERS.<id>`); testleri `testler.js`'e ekle.
2. `index.html`'e `<script defer>` satırını, `sw.js` içindeki `APP_SHELL` listesine dosya yolunu ekle.
3. `COURSE.chapters` içinde ilgili bölüme `id` ver.
4. Dosyaları değiştirdikten sonra `sw.js` içindeki `CACHE_NAME` sürümünü artır.

Matematik gösterimi için [KaTeX](https://katex.org) (CDN) kullanılır.
