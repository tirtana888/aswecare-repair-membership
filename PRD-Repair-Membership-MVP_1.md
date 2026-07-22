# PRD: Repair Membership MVP (Multi-Kategori)
**Versi:** 2.0
**Tanggal:** 21 Juli 2026
**Status:** Draft untuk validasi

## Changelog v2.0
- Tambah struktur kategori/sub-kategori (Fashion, Electronic)
- User punya akun sendiri (bukan WA-only) — buka jalan untuk extended plan hingga 1 tahun
- Klaim via dashboard user, bukan WhatsApp
- Deploy: Railway | Payment: Xendit

---

## 1. Latar Belakang & Tujuan

### Problem Statement
Pemilik sepatu premium/sneaker di Indonesia tidak punya cara mudah dan terjadwal untuk merawat barang mereka (jahitan lepas, sol aus, cleaning). Servis eksisting sifatnya ad-hoc, tidak terstandarisasi, dan tidak ada model berlangganan.

### Tujuan MVP
Validasi 3 hal dalam 3-6 bulan pertama, dengan 100-300 member di 1 kota (Jakarta):
1. Apakah orang mau bayar recurring (membership) untuk servis sepatu?
2. Apakah operasional servis (partner network + fulfillment) bisa dijalankan tanpa collapse secara biaya?
3. Berapa actual claim rate & cost per claim — data ini jadi fondasi negosiasi underwriter di fase insurance nanti.

### Yang BUKAN tujuan MVP
- Bukan produk asuransi murni di tier dasar (tidak ada ganti rugi/cash payout) — namun tier "Extended" mulai membuka elemen ganti-rugi terbatas, lihat §4.3
- Bukan native mobile app (web app dulu, deploy di Railway)
- Bukan automasi penuh (claims tetap direview manual oleh Admin, hanya validasi rule dasar yang otomatis)

### Catatan penting soal scope multi-kategori
Struktur data di PRD ini disiapkan untuk 2 kategori besar (Fashion & Electronic) dengan 5 sub-kategori sejak awal, sesuai permintaan. Secara teknis ini tidak menambah kompleksitas besar di level schema (kategori jadi field, bukan tabel terpisah). **Namun secara operasional**, tetap disarankan soft-launch dengan 1-2 sub-kategori dulu (mis. Sneaker + Handphone Accessories) untuk validasi partner servis dan claim pattern, sebelum buka semua sub-kategori sekaligus — supaya tim Admin tidak kewalahan mengelola partner network yang berbeda-beda karakter servisnya (tukang sol vs teknisi gadget itu skill & SLA yang sangat beda).

---

## 2. Target User

- Sneakerhead / pemilik sepatu premium (harga sepatu Rp800rb ke atas)
- Domisili Jakarta (radius yang terjangkau partner servis)
- Usia 20-40 tahun, aktif di media sosial/komunitas sneaker
- Sudah terbiasa dengan pembayaran digital (QRIS, e-wallet)

---

## 3. User Roles

| Role | Deskripsi |
|---|---|
| **Member (User)** | Konsumen dengan akun terdaftar (email/HP + password atau OTP), kelola barang, ajukan klaim, upgrade plan lewat dashboard sendiri |
| **Admin (Internal)** | Tim yang review assessment foto, approve/reject klaim, kelola partner, kelola katalog kategori |
| **Partner Servis** | Mitra servis (tukang sol, teknisi gadget, dll) yang mengerjakan servis fisik |

Catatan: Member sekarang punya akun sendiri (pakai Supabase Auth) — beda dari v1.0 yang WA-only. Ini membuka fitur self-service: lihat riwayat klaim, sisa kuota, dan upgrade ke plan Extended langsung dari dashboard. Partner Servis TIDAK punya akun/dashboard sendiri di MVP ini — koordinasi masih manual oleh Admin (via WA/telepon), karena volume awal belum butuh otomasi di sisi partner.

---

## 4. Core User Flows

### Flow 1: Registrasi Akun & Onboarding Barang
1. User buka web app → **Sign up** (email/HP + password, via Supabase Auth) → verifikasi (OTP/email link)
2. User login → dashboard kosong → klik "Tambah Barang"
3. Pilih kategori → sub-kategori (mis. Fashion → Sneaker, atau Electronic → Handphone)
4. Upload foto barang (min. 3 sudut) — wajib untuk assessment kondisi
5. Isi detail barang (brand, model, perkiraan usia pakai, harga beli/perkiraan nilai)
6. Submit → status barang: `pending_review`
7. Admin review foto via Admin Dashboard (SLA 1x24 jam) → approve/reject dengan catatan kondisi (baru/layak/aus berat)
8. Jika approved → user dapat notifikasi (in-app + email) → lanjut ke pembayaran
9. User pilih plan di dashboard:
   - **Basic** (repair-only, bulanan/tahunan)
   - **Extended** (hingga 1 tahun, mulai membuka elemen ganti-rugi terbatas — lihat §4.3)
10. Bayar via Xendit (invoice/VA/QRIS/e-wallet) → webhook Xendit update status barang: `active`, dengan `waiting_period_end_date` (tanggal aktif + 14 hari)

### Flow 2: Pengajuan Klaim Servis (via User Dashboard)
1. Member login → pilih barang terdaftar → klik "Ajukan Klaim"
2. Pilih jenis kerusakan (dropdown predefined per kategori, lihat §7) → upload foto kerusakan → submit
3. Sistem cek otomatis (rule-based) saat submit:
   - Sudah lewat waiting period?
   - Kuota tahunan masih tersedia?
   - Jenis kerusakan termasuk covered list untuk sub-kategori tsb?
4. Jika lolos rule awal → status `submitted`, masuk antrian review Admin
5. Admin review di Admin Dashboard → approve (assign partner servis) atau reject (isi alasan)
6. Status klaim otomatis ter-update di dashboard user secara real-time (Supabase Realtime) — user TIDAK perlu tanya manual, tinggal refresh/lihat status
7. Admin koordinasi manual dengan partner servis (WA/telepon) untuk pickup/drop-off — ini tetap manual di MVP, tapi tidak terlihat oleh user (user hanya lihat status di dashboard)
8. Partner selesai servis → Admin update status `completed` di dashboard, input biaya aktual servis
9. User terima notifikasi barang siap → ambil/terima → Admin update `delivered` → kuota member berkurang 1
10. User bisa beri rating servis langsung dari dashboard (opsional, untuk data kualitas partner)

### Flow 3: Upgrade ke Extended Plan (self-service)
1. Dari dashboard, user klik "Upgrade ke Extended" pada barang tertentu
2. Sistem tampilkan syarat: barang harus dalam status `active` tanpa klaim ditolak dalam 3 bulan terakhir (mitigasi adverse selection)
3. User bayar selisih harga via Xendit → status plan barang berubah jadi `extended`, `plan_end_date` diperpanjang hingga 1 tahun dari tanggal upgrade
4. Extended plan membuka `coverage_type` tambahan (lihat §4.3) — tetap butuh review Admin untuk approve fitur ganti-rugi karena ini elemen sensitif secara regulasi

### Flow 4: Admin Dashboard (internal, prioritas utama build)
- List semua member & barang (status, sisa kuota, tanggal expired, plan type)
- List semua klaim (status, umur klaim, partner ditugaskan) dengan filter kategori/sub-kategori
- Form review klaim & update status (approve/reject/assign partner)
- Log biaya servis per klaim (untuk tracking unit economics per kategori)
- Kelola katalog kategori & sub-kategori (tambah/nonaktifkan sub-kategori baru)

---

## 4.3 Extended Plan — Batasan Penting (Legal Flag)

Anda menyebut Extended Plan "hingga 1 tahun" bisa mulai membuka elemen mendekati ganti-rugi. Perlu digarisbawahi di level PRD supaya tim engineering & produk tidak salah desain:

- **Selama Extended Plan hanya memperpanjang durasi/kuota servis fisik** (lebih banyak kuota, cakupan jenis kerusakan lebih luas, prioritas servis lebih cepat) — ini AMAN, tetap masuk kategori jasa, tidak perlu lisensi.
- **Begitu Extended Plan mulai menjanjikan uang tunai, penggantian unit baru, atau kompensasi finansial atas kehilangan/kerusakan total** — ini sudah masuk elemen indemnity/asuransi, dan MEMBUTUHKAN underwriter partner berlisensi OJK (sesuai pembahasan sebelumnya di percakapan ini). Jangan diimplementasikan sendiri tanpa partner tersebut.
- Rekomendasi desain data: field `coverage_type` di tabel `plans` (lihat §6) dibuat generic sejak awal (`repair_only` vs `indemnity`) supaya schema sudah siap saat elemen ganti-rugi masuk lewat underwriter partner — tapi **jangan aktifkan `indemnity` di produksi sebelum partnership underwriter resmi berjalan.**

---

## 5. Fitur — In Scope vs Out of Scope

### In Scope (MVP)
- [ ] Landing page + form sign-up
- [ ] Upload foto (Supabase Storage)
- [ ] Payment integration (Midtrans/Xendit)
- [ ] Admin dashboard (web sederhana): kelola member, kelola klaim, kelola partner (data statis)
- [ ] Notifikasi via WhatsApp (manual atau WA Business API sederhana)
- [ ] Rule-based claim validation (waiting period, kuota, jenis kerusakan)
- [ ] Data logging terstruktur (untuk fase insurance nanti)

### Out of Scope (eksplisit, jangan dibangun dulu)
- Native mobile app (iOS/Android)
- AI/automated photo assessment
- Partner-facing dashboard/app
- Referral & gamification
- Multi-kategori produk
- Insurance/indemnity features (ganti rugi, cash payout)
- Automated matching/routing partner servis (masih manual assign)

---

## 6. Data Model (Supabase / PostgreSQL)

Semua tabel user-facing pakai Supabase Auth (`auth.users`) sebagai sumber identitas — `members.id` = `auth.users.id`. RLS aktif penuh karena user sekarang login langsung ke dashboard (lihat catatan RLS di akhir bagian ini).

### Tabel: `members`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK, FK → auth.users) | |
| full_name | text | |
| phone_number | text | unique |
| email | text | dari auth.users, mirror untuk kemudahan query |
| created_at | timestamptz | |

### Tabel: `categories` (data referensi/katalog)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| name | text | `Fashion`, `Electronic` |
| slug | text | unique |

### Tabel: `subcategories`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| category_id | uuid (FK → categories) | |
| name | text | `Sneaker`, `Kaos`, `Hoodie`, `Sepatu`, `Accessories`, `Handphone` |
| slug | text | unique |
| default_annual_quota | int | default kuota servis per tahun, bisa beda per sub-kategori |
| is_active | boolean | untuk soft-launch bertahap per sub-kategori (lihat catatan scope di §1) |

### Tabel: `items` (barang yang didaftarkan member)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| member_id | uuid (FK → members) | |
| subcategory_id | uuid (FK → subcategories) | |
| brand | text | |
| model | text | |
| estimated_value | numeric | |
| purchase_date | date | nullable |
| condition_at_signup | text | enum: `pending_review`, `baru`, `layak`, `aus_berat`, `rejected` |
| condition_notes | text | catatan Admin saat review |
| photo_urls | text[] | array URL ke Supabase Storage |
| created_at | timestamptz | |

### Tabel: `plans` (langganan aktif per item)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| item_id | uuid (FK → items) | |
| plan_tier | text | enum: `basic`, `extended` |
| coverage_type | text | enum: `repair_only`, `indemnity` — **`indemnity` tidak boleh aktif tanpa underwriter partner, lihat §4.3** |
| billing_cycle | text | enum: `monthly`, `yearly` |
| status | text | enum: `pending_payment`, `active`, `expired`, `cancelled` |
| plan_start_date | date | |
| plan_end_date | date | |
| waiting_period_end_date | date | plan_start_date + 14 hari |
| annual_quota | int | copy dari subcategory default saat plan dibuat, bisa override |
| quota_used | int | default 0 |
| xendit_invoice_id | text | referensi transaksi Xendit |

### Tabel: `claims`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| member_id | uuid (FK → members) | |
| item_id | uuid (FK → items) | |
| plan_id | uuid (FK → plans) | |
| damage_type | text | enum predefined per sub-kategori (lihat §7) |
| description | text | |
| photo_urls | text[] | |
| status | text | enum: `submitted`, `approved`, `rejected`, `in_service`, `completed`, `delivered` |
| rejection_reason | text | nullable |
| assigned_partner_id | uuid (FK → partners) | nullable |
| actual_service_cost | numeric | nullable, diisi setelah selesai |
| member_rating | int | nullable, 1-5, diisi user setelah delivered |
| submitted_at | timestamptz | |
| resolved_at | timestamptz | nullable |

### Tabel: `partners` (data statis, input manual oleh Admin)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| type | text | mis. `cobbler`, `cleaning_service`, `gadget_technician` |
| location_area | text | mis. `Jakarta Selatan` |
| phone_number | text | |
| is_active | boolean | |

### Tabel: `admin_users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK, FK → auth.users) | pakai Supabase Auth, role terpisah dari member |
| name | text | |
| role | text | `admin` |

### Catatan RLS (Row Level Security) — penting karena user sekarang login
- `members`: user hanya bisa `select`/`update` baris miliknya sendiri (`auth.uid() = id`)
- `items`, `plans`, `claims`: user hanya bisa akses baris dengan `member_id = auth.uid()`; `insert` diizinkan, `update` status DIBATASI (status hanya boleh diubah lewat Admin/backend, bukan langsung oleh user, supaya user tidak bisa self-approve klaim)
- `categories`, `subcategories`: `select` publik (semua user bisa lihat katalog), `insert`/`update` hanya `admin_users`
- `partners`: TIDAK bisa diakses oleh member sama sekali (data internal operasional) — hanya `admin_users`
- Semua write ke `status` field (claims, plans, items condition) sebaiknya lewat Supabase Edge Function dengan service role, bukan direct table update dari client, supaya rule bisnis (waiting period, kuota, dsb) tervalidasi di server, bukan hanya di client-side.

---

## 7. Daftar Jenis Kerusakan (Covered List) — Predefined per Sub-Kategori

Dropdown di form klaim disesuaikan dengan `subcategory_id` yang dipilih, supaya data tetap konsisten dan bisa dianalisis per kategori nanti.

**Fashion — Sneaker / Sepatu**
1. Jahitan lepas (upper)
2. Sol aus/terkelupas
3. Cleaning deep (kotor berat, noda)
4. Ganti tali/eyelet rusak
5. Reglue sol

**Fashion — Kaos / Hoodie**
1. Jahitan sobek
2. Ganti resleting/kancing
3. Patch/tambal
4. Reprint sablon pudar

**Electronic — Accessories**
1. Ganti kabel/konektor rusak
2. Kalibrasi ulang
3. Cleaning internal (debu/kotoran)

**Electronic — Handphone**
1. Ganti baterai (drop performa)
2. Servis konektor charging
3. Cleaning port/speaker

**Semua sub-kategori**
- Kerusakan lain (free text) — untuk kasus di luar list, otomatis flag untuk review manual lebih ketat oleh Admin, tidak lolos auto-validation

---

## 8. Metrik Sukses MVP (3-6 bulan)

| Metrik | Target |
|---|---|
| Jumlah member aktif | 100-300 |
| Claim rate (klaim per member per tahun) | Data eksploratif — catat, jangan asumsi dulu |
| Cost per claim rata-rata | Bandingkan dengan asumsi awal (Rp60rb) |
| Retention rate (renewal setelah tahun pertama) | > 40% dianggap sinyal positif |
| Rasio cost of service : revenue | Tetap di bawah 70% (alarm kalau lewat) |
| Waktu penyelesaian klaim (submit → delivered) | < 5 hari kerja |

---

## 9. Tech Stack

- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth untuk member dan admin, dua role terpisah)
- **Storage:** Supabase Storage (foto barang & klaim, bucket terpisah `item-photos` dan `claim-photos`)
- **Business logic/API:** Supabase Edge Functions untuk validasi rule (waiting period, kuota, status transition) — jangan taruh logic ini di client
- **Frontend (User Dashboard):** Next.js, deploy di **Railway**
- **Admin Dashboard:** Next.js terpisah (atau route ter-protect di app yang sama dengan role check), deploy di **Railway**
- **Payment:** **Xendit** — pakai Invoice API untuk fleksibilitas metode bayar (VA, QRIS, e-wallet, kartu). Webhook Xendit → Edge Function → update `plans.status` jadi `active`
- **Notifikasi:** In-app notification (tabel `notifications` sederhana + realtime subscription) sebagai kanal utama, email sebagai fallback. WhatsApp tidak lagi jadi kanal utama klaim, tapi tetap bisa dipakai Admin untuk koordinasi ke partner servis (bukan ke user)

### Catatan deployment Railway
- Railway cocok untuk MVP karena setup cepat dan bisa scale vertikal dulu sebelum butuh infra kompleks
- Environment variables (Supabase URL/keys, Xendit API key) dikelola lewat Railway's built-in secrets — jangan hardcode di kode
- Pisahkan service: 1 service untuk User Dashboard app, 1 service untuk Admin Dashboard app (atau 1 app dengan role-based routing, lebih hemat biaya di awal — pilih ini untuk MVP)

---

## 10. Milestone & Urutan Build

1. **Minggu 1-2:** Setup Supabase schema (semua tabel §6) + RLS policies + seed data `categories`/`subcategories` + deploy skeleton app ke Railway
2. **Minggu 3-4:** Auth flow (sign up/login member) + form tambah barang + upload foto + flow assessment (Admin review sederhana)
3. **Minggu 5-6:** Integrasi Xendit (invoice + webhook) + Edge Function validasi plan activation
4. **Minggu 7-8:** Dashboard user (lihat barang, ajukan klaim, lihat status realtime) + Admin Dashboard (review klaim, assign partner, update status)
5. **Minggu 9-10:** Onboard 2-3 partner servis untuk **1-2 sub-kategori prioritas dulu** (rekomendasi: Sneaker + Handphone Accessories, sesuai catatan di §1) — testing end-to-end dengan 10-20 member awal (soft launch tertutup)
6. **Bulan 3 dst:** Buka sub-kategori lain secara bertahap (`is_active` di tabel `subcategories`), mulai tracking metrik §8 per sub-kategori

---

## 11. UI/UX — Prinsip Desain

Dashboard user harus terasa rapi, modern, dan profesional — bukan seperti admin panel internal. Prinsip yang dipakai:

### Tampilan utama: "Barang Saya"
- Grid kartu, satu kartu per barang terdaftar (bukan tabel/list polos)
- Setiap kartu menampilkan: ikon kategori, nama barang, kategori/sub-kategori, **status badge berwarna**, sisa kuota, plan aktif & tanggal berakhir, tombol aksi
- Status badge pakai warna semantik supaya user langsung paham kondisi tanpa baca detail:

| Status | Warna badge | Arti |
|---|---|---|
| Terproteksi | Hijau (success) | Aktif, bisa klaim |
| Extended | Ungu (pro) | Plan extended aktif, bisa klaim |
| Masa tunggu | Kuning (warning) | Sudah bayar, belum lewat 14 hari waiting period |
| Review foto | Abu-abu (netral) | Menunggu Admin approve assessment awal |

- Tombol "Ajukan klaim" otomatis **disabled** untuk barang berstatus Masa tunggu / Review foto — mencegah user submit klaim yang pasti ditolak, sekaligus mengurangi beban review Admin dari klaim invalid
- Card menampilkan estimasi waktu tunggu secara eksplisit (mis. "Bisa klaim mulai 2 Agt 2026") supaya user tidak bingung kenapa tombol nonaktif

### Prinsip visual umum
- Flat design, tanpa gradient/shadow berlebihan — clean dan cepat dimuat
- Satu warna aksen dominan untuk aksi utama (tombol "Tambah barang"), warna lain hanya dipakai untuk status/badge, bukan dekorasi
- Ikon konsisten per kategori (mis. sepatu untuk Sneaker/Sepatu, handphone untuk kategori Handphone) supaya user bisa scan visual dengan cepat tanpa baca teks satu-satu
- Responsive grid (`auto-fit`) supaya tampilan tetap rapi baik di desktop maupun mobile browser

### Layar lain yang perlu didesain dengan prinsip sama
1. **Form tambah barang** — step jelas (pilih kategori → sub-kategori → upload foto → detail barang), progress indicator supaya user tahu ada berapa langkah lagi
2. **Form ajukan klaim** — dropdown jenis kerusakan (sesuai §7), upload foto, preview sebelum submit
3. **Riwayat klaim** — timeline status (submitted → approved → in_service → completed → delivered) per klaim, bukan cuma teks status statis
4. **Halaman upgrade plan** — perbandingan visual Basic vs Extended (card side-by-side), harga jelas, syarat upgrade ditampilkan sebelum user bayar

### Halaman Login & Signup
- Card terpusat, single-column form, tanpa elemen dekoratif berlebihan — fokus ke input
- Field minimal: Login (email, kata sandi), Signup (nama, no HP, email, kata sandi) — jangan minta data berlebih di signup, tambahan detail (foto barang dll) diisi belakangan saat "Tambah barang"
- Ikon brand kecil (36px, rounded square) di atas judul sebagai anchor visual, bukan logo besar
- Link "Lupa kata sandi" dan toggle "Belum punya akun? Daftar" ditempatkan konsisten supaya user tidak nyasar antar halaman
- Teks kecil (11px, muted) untuk Syarat Layanan/Kebijakan Privasi di bawah tombol signup — wajib ada mengingat ini menyangkut data pribadi & pembayaran

### Halaman Pembayaran (Checkout)
Pola dua kolom ala Stripe checkout — kiri ringkasan, kanan aksi:
- **Kolom kiri (ringkasan pesanan):** nama barang + kategori, breakdown biaya (harga plan, biaya admin, total), dan **catatan transparansi** yang eksplisit menyebut "cakupan berupa jasa perbaikan, bukan penggantian uang" — ini bukan cuma UX, tapi bagian dari kepatuhan bahasa kontrak yang sudah dibahas di §4.3
- **Kolom kanan (metode bayar):** list metode pembayaran Xendit (QRIS, VA bank, e-wallet, kartu) sebagai radio card, QRIS default terpilih karena paling umum dipakai di Indonesia
- Tombol bayar menampilkan nominal final langsung di label tombol (mis. "Bayar Rp 355.000") — mengurangi keraguan user sebelum klik
- Baris kecil "Dibayar aman lewat Xendit" dengan ikon gembok di bawah tombol — signal kepercayaan (trust badge) tanpa perlu elemen keamanan yang berlebihan

### Prinsip konsistensi lintas halaman
- Tombol utama selalu warna solid gelap (bukan warna-warni), supaya user tahu persis mana aksi utama di tiap halaman
- Border tipis (bukan shadow tebal) dan radius konsisten 12px di semua card — inilah yang memberi kesan "modern clean" ala produk fintech (Stripe, Xendit dashboard sendiri) dibanding tampilan startup generik
- Tidak ada gradient atau warna mencolok di background — warna hanya dipakai untuk status/badge/aksi, bukan dekorasi

*(Mockup visual sudah dibuat sebagai referensi desain: dashboard "Barang Saya", halaman Login/Signup, dan halaman Checkout/Pembayaran — lihat percakapan sebelumnya untuk tampilan lengkapnya.)*

---



## 12. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Adverse selection (daftar pas barang sudah rusak) | Wajib foto assessment + waiting period 14 hari |
| Partner servis tidak konsisten kualitas/waktu | Mulai dengan 2-3 partner terverifikasi, rating internal per partner |
| Klaim melebihi asumsi (rugi) | Cap kuota per tahun (bukan cap rupiah), monitor rasio cost:revenue bulanan, siap pause sign-up baru jika perlu |
| Data tidak konsisten untuk fase insurance nanti | Standardisasi `damage_type` sejak awal (lihat §7), jangan andalkan free text |

