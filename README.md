# Flowin Admin Panel - PDAM Tirta Daroy

Panel Administrasi Manajemen Air Flowin untuk 14.000 pengguna PDAM Tirta Daroy Banda Aceh.

## 🚀 Fitur Utama

### 1. Sistem Informasi Pelanggan (SIP)
- Database pelanggan terpadu dengan integrasi KTP Indonesia
- Manajemen akun multi-tingkat (rumah tangga, komersial, industri, sosial)
- Penyiapan akun otomatis dengan verifikasi dokumen
- Alur kerja sambungan/pemutusan layanan
- Kemampuan impor/ekspor massal untuk migrasi data
- Pemetaan lokasi layanan terintegrasi GPS
- Manajemen siklus hidup pelanggan dengan jejak audit

### 2. Manajemen Penagihan dan Keuangan
- Struktur tarif multi-tingkat mendukung tarif PDAM Indonesia (2A2, 2A3, komersial, industri, sosial)
- Generasi tagihan otomatis dengan integrasi meteran pintar
- Kalkulasi harga progresif dengan manajemen subsidi
- Pemrosesan pembayaran mendukung metode Indonesia (GoPay, OVO, DANA, QRIS, transfer bank)
- Kalkulasi denda keterlambatan dengan masa tenggang yang dapat dikonfigurasi
- Peramalan pendapatan dan pelacakan anggaran vs aktual
- Pelaporan keuangan sesuai standar SAK Indonesia

### 3. Manajemen Layanan
- Manajemen perintah kerja dengan pengiriman teknisi
- Pelacakan permintaan layanan dengan monitoring SLA
- Penjadwalan instalasi dan pemeliharaan peralatan
- Manajemen siklus hidup aset dengan integrasi GIS
- Manajemen inventaris untuk suku cadang dan bahan
- Sistem koordinasi respons darurat

### 4. Monitoring Distribusi Air
- Integrasi sistem SCADA real-time
- Monitoring tekanan dan aliran di jaringan distribusi
- Pelacakan kualitas air dengan kepatuhan SNI
- Analisis dan pelaporan Air Tidak Berekening (ATB)
- Manajemen Area Terukur Distrik (ATD)
- Monitoring utilisasi kapasitas produksi

### 5. Integrasi Meteran Pintar
- Pembacaan meteran berbasis IoT dengan dukungan NB-IoT/LoRaWAN
- Pengumpulan data konsumsi otomatis
- Deteksi anomali untuk kebocoran dan kecurangan
- Kemampuan manajemen meteran jarak jauh
- Analisis konsumsi historis
- Peringatan pemeliharaan prediktif

### 6. Alat Layanan Pelanggan
- Manajemen keluhan multi-channel (telepon, email, web, mobile)
- Routing tiket dengan eskalasi otomatis
- Portal komunikasi pelanggan dengan update status
- Integrasi basis pengetahuan untuk staf support
- Sistem notifikasi kualitas air
- Manajemen gangguan layanan dengan komunikasi proaktif

### 7. Pelaporan dan Analitik
- Ringkasan konsumsi harian/mingguan/bulanan
- Laporan kepatuhan kualitas air
- Laporan kinerja dan pemeliharaan aset
- Analisis gangguan layanan dan waktu respons
- Pelacakan dan optimasi konsumsi energi
- Metrik produktivitas staf
- Pelacakan pendapatan dan efisiensi penagihan
- Analisis biaya per meter kubik
- Pelacakan akurasi tagihan dan sengketa
- Analisis kinerja metode pembayaran
- Laporan varians anggaran
- Analisis ROI untuk investasi infrastruktur

### 8. Operasi Lapangan Mobile
- Aplikasi Mobile Teknisi dengan kemampuan offline
- Routing berbasis GPS dan verifikasi lokasi
- Scanning barcode/QR code peralatan
- Dokumentasi foto dengan tag metadata
- Catatan voice-to-text untuk operasi hands-free
- Sinkronisasi data real-time
- Pengumpulan Data Lapangan
- Aplikasi pembacaan meteran dengan verifikasi foto
- Formulir dan checklist inspeksi layanan
- Logging pemeliharaan peralatan
- Pelacakan interaksi pelanggan
- Pelaporan insiden keselamatan
- Pelacakan metrik kinerja

## 🔐 Sistem RBAC (Role-Based Access Control)

### Administrator
- **Manajemen Pengguna**: Kontrol penuh untuk buat, modifikasi, nonaktifkan akun
- **Konfigurasi Sistem**: Parameter SCADA, ambang batas alarm, pengaturan jaringan
- **Manajemen Keuangan**: Pengawasan penagihan, modifikasi tarif, pelaporan keuangan
- **Pelaporan**: Akses penuh semua laporan dan pembuatan laporan kustom
- **Manajemen Database**: Backup/restore, impor data, modifikasi skema
- **Respons Darurat**: Override interlock keselamatan, prosedur darurat

### Teknisi
- **Operasi Lapangan**: Kontrol peralatan, pengakuan alarm, entri data
- **SERVICE Pelanggan**: Akses informasi akun, riwayat layanan, data konsumsi
- **Perintah Kerja**: Buat perintah kerja, update status, catat penyelesaian
- **Akses Mobile**: Entri data lapangan, upload foto, update status
- **Pemeliharaan**: Inspeksi peralatan, logging pemeliharaan, inventaris suku cadang
- **Pelaporan**: Laporan operasional, metrik kinerja pribadi

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Framework**: Material-UI (MUI) v6
- **State Management**: Redux Toolkit, Zustand
- **Charts**: Recharts, Chart.js
- **Maps**: Leaflet, React Leaflet
- **Forms**: React Hook Form
- **Styling**: Tailwind CSS, Emotion
- **Icons**: Material Icons, Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## 📱 Responsive Design

- **Desktop**: Layout penuh dengan sidebar dan header
- **Tablet**: Layout adaptif dengan navigasi yang dioptimalkan
- **Mobile**: Interface mobile-first untuk teknisi lapangan
- **PWA Support**: Dapat diinstall sebagai aplikasi mobile

## 🌐 Lokalisasi Indonesia

- **Bahasa**: Interface dalam Bahasa Indonesia
- **Format**: Tanggal DD/MM/YYYY, Mata uang Rupiah (IDR)
- **Kultur**: Preferensi warna hijau, pola pembacaan kiri-ke-kanan
- **Regional**: Dukungan untuk bahasa daerah (Aceh)

## 🚀 Instalasi dan Setup

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Git

### Installation
```bash
# Clone repository
git clone <repository-url>
cd aqualink-admin-frontpage

# Install dependencies
npm install
# atau
yarn install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan konfigurasi yang sesuai

# Run development server
npm run dev
# atau
yarn dev
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Flowin Admin Panel
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📁 Struktur Proyek

```
aqualink-admin-frontpage/
├── app/
│   ├── (pages)/
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── billing/
│   │   ├── operations/
│   │   ├── monitoring/
│   │   ├── reports/
│   │   └── mobile/
│   ├── components/
│   │   └── layout/
│   ├── layouts/
│   ├── types/
│   └── utils/
├── public/
│   └── assets/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔧 Scripts

```bash
# Development
npm run dev

# Build untuk production
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📊 Dashboard dan Interface

### Dashboard Eksekutif
- 5-6 kartu KPI utama dalam layout pola-F
- Status sistem real-time dengan peringatan kode warna
- Kemampuan drill-down interaktif
- Desain responsif mobile
- Indikator Kinerja Utama:
  - Efisiensi produksi dan distribusi air
  - Persentase Air Tidak Berekening (target <20%)
  - Waktu respons layanan pelanggan
  - Kinerja keuangan (efisiensi penagihan >90%)
  - Kinerja dan uptime aset
  - Tingkat kepatuhan kualitas air

### Dashboard Kontrol Operasional
- Integrasi SCADA real-time
- Monitoring aliran dan tekanan
- Visualisasi kinerja plant pengolahan
- Pelacakan konsumsi energi
- Peta kinerja jaringan
- Peringatan pemeliharaan prediktif

### Interface Mobile
- Interface dioptimalkan untuk sentuhan (target minimum 44px)
- Arsitektur offline-first dengan sinkronisasi data
- Navigasi bawah untuk operasi satu tangan
- Alur kerja berorientasi tugas untuk operasi lapangan

## 🔒 Keamanan

### Autentikasi Multi-Faktor
- MFA untuk semua akses jarak jauh
- Autentikasi biometrik untuk perangkat mobile
- Sertifikat digital untuk komunikasi sistem-ke-sistem
- Autentikasi berbasis risiko

### Manajemen Sesi
- Generasi token aman dengan entropi tinggi
- Kebijakan timeout berbasis peran
- Pembatasan sesi bersamaan
- Monitoring dan perekaman aktivitas sesi

### Audit dan Kepatuhan
- Logging aktivitas komprehensif
- Jejak audit tahan gangguan dengan retensi 7 tahun
- Audit kepatuhan pihak ketiga reguler
- Integrasi SIEM untuk monitoring real-time

## 📈 Monitoring dan Analytics

### Real-time Monitoring
- Status sistem SCADA
- Kualitas air real-time
- Tekanan dan aliran distribusi
- Status meteran pintar
- Peringatan dan alarm

### Analytics Dashboard
- Tren konsumsi air
- Analisis efisiensi
- Pelacakan performa aset
- Analisis keuangan
- Laporan kepatuhan

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 📞 Support

Untuk pertanyaan dan dukungan, silakan hubungi:
- Email: support@pdam-tirtadaroy.ac.id
- Phone: +62 651 123456
- Website: https://pdam-tirtadaroy.ac.id

## 🎯 Roadmap

### Phase 1 (Completed)
- ✅ Setup struktur dasar
- ✅ Implementasi RBAC
- ✅ Dashboard eksekutif
- ✅ Dashboard operasional
- ✅ Sistem Informasi Pelanggan
- ✅ Manajemen penagihan
- ✅ Interface mobile
- ✅ Sistem pelaporan

### Phase 2 (Planned)
- 🔄 Integrasi dengan backend API
- 🔄 Implementasi real-time notifications
- 🔄 Advanced analytics dan AI insights
- 🔄 Mobile app native (React Native)
- 🔄 Integration dengan sistem eksternal

### Phase 3 (Future)
- 📋 Machine Learning untuk prediksi
- 📋 IoT device management
- 📋 Advanced GIS integration
- 📋 Blockchain untuk transparansi
- 📋 Multi-tenant architecture

---

**Flowin Admin Panel** - Solusi komprehensif untuk manajemen air PDAM Tirta Daroy Banda Aceh 🚰💧