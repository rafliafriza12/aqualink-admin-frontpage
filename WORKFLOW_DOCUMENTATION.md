# 📋 DOKUMENTASI WORKFLOW SAMBUNGAN AIR PDAM

## 🎯 **OVERVIEW**

Sistem ini mengelola workflow permohonan sambungan air dari user hingga mendapatkan nomor meteran dan menjadi pelanggan resmi PDAM.

---

## 🔄 **ALUR LENGKAP WORKFLOW**

### **FASE 1: PERMOHONAN AWAL**

#### **1.1 User: Submit Permohonan Sambungan**

**Endpoint:** `POST /connection-data`  
**Auth:** User Token (verifyToken)  
**Platform:** Mobile App

**Data yang diupload:**

- Data Diri: NIK, No. KK, Alamat, Kecamatan, Kelurahan
- Luas Bangunan
- Dokumen (PDF/Image):
  - Foto KTP (NIK)
  - Foto Kartu Keluarga (KK)
  - Foto/Surat IMB (Izin Mendirikan Bangunan)

**Status setelah submit:**

```javascript
{
  isVerifiedByData: false,         // Belum dicek admin
  isVerifiedByTechnician: false,   // Belum survey
  isAllProcedureDone: false,       // Belum selesai
  surveiId: null,
  rabConnectionId: null,
  meteranId: null
}
```

---

### **FASE 2: VERIFIKASI ADMIN**

#### **2.1 Admin: Lihat Daftar Permohonan**

**Page:** `/operations/connection-data`  
**Auth:** Admin Token

**Fitur:**

- Filter: Status verifikasi (Admin, Teknisi, Prosedur)
- Search: NIK, No.KK, Nama, Email
- Status indicator: Pending, Verifikasi Admin, Verifikasi Teknisi, Selesai

#### **2.2 Admin: Lihat Detail & Verifikasi**

**Page:** `/operations/connection-data/[id]`  
**Endpoint:** `PUT /connection-data/:id/verify-admin`  
**Auth:** Admin Token

**Yang diperiksa:**
✅ Dokumen KTP jelas dan valid  
✅ Dokumen KK sesuai  
✅ Dokumen IMB lengkap  
✅ Alamat masuk area layanan PDAM  
✅ Data sesuai dengan dokumen

**Action:** Klik tombol **"Verifikasi Data"**

**Status setelah verifikasi:**

```javascript
{
  isVerifiedByData: true,  // ✅ Sudah dicek admin
  ...
}
```

**Notifikasi:**

- ✅ User menerima notifikasi: "Dokumen Anda telah diverifikasi. Teknisi akan segera melakukan survey."

---

### **FASE 3: SURVEY LAPANGAN (TEKNISI)**

#### **3.1 Teknisi: Lihat Tugas Survey**

**Page:** `/operations/connection-data`  
**Auth:** Technician Token  
**Menu:** Tugas Saya → Data Sambungan

**Filter:** Hanya tampilkan yang `isVerifiedByData: true` dan belum ada `surveiId`

#### **3.2 Teknisi: Lihat Detail & Buat Survey**

**Page:** `/operations/connection-data/[id]`  
**Action:** Klik tombol **"Buat Survey"** (muncul jika belum ada survey)

**Modal/Dialog Create Survey muncul dengan form:**

**Form Fields:**

- ✅ Foto Jaringan Pipa (Upload Image)
- ✅ Diameter Pipa (Number input, contoh: 20 mm)
- ✅ Foto Posisi Bak (Upload Image)
- ✅ Foto Posisi Meteran (Upload Image)
- ✅ Jumlah Penghuni (Number input)
- ✅ Koordinat Latitude (Number input, auto dari GPS)
- ✅ Koordinat Longitude (Number input, auto dari GPS)
- ✅ Standar (Toggle/Checkbox: Apakah sesuai standar PDAM?)
- ✅ Catatan (Text area, optional)

**Submit:** `POST /survey-data`  
**Endpoint Handler:** `createSurveyData` (with middleware `verifyTechnician`)

**Request Body (FormData):**

```javascript
{
  connectionDataId: "...",  // Auto filled
  jaringanFile: File,       // Upload foto
  diameterPipa: 20,
  posisiBakFile: File,      // Upload foto
  posisiMeteranFile: File,  // Upload foto
  jumlahPenghuni: 4,
  koordinatLat: -5.1477,
  koordinatLong: 119.4327,
  standar: true,
  catatan: "Lokasi strategis, akses mudah"
}
```

**Response Success:**

```javascript
{
  status: 201,
  message: "Survey data created successfully",
  data: {
    _id: "...",
    connectionDataId: "...",
    technicianId: "...",
    jaringanUrl: "https://cloudinary.com/...",
    diameterPipa: 20,
    posisiBakUrl: "https://cloudinary.com/...",
    posisiMeteranUrl: "https://cloudinary.com/...",
    jumlahPenghuni: 4,
    koordinat: { lat: -5.1477, long: 119.4327 },
    standar: true,
    catatan: "...",
    createdAt: "...",
    updatedAt: "..."
  }
}
```

**Auto Update ConnectionData:**

```javascript
{
  surveiId: "survey_id_123",  // ✅ Linked
  ...
}
```

**Notifikasi:**

- ✅ User: "Survey lapangan telah selesai. Teknisi akan membuat RAB biaya."
- ✅ Admin: "Survey telah dibuat oleh Teknisi X untuk NIK xxxx"

---

#### **3.3 Teknisi: Verifikasi Teknis**

**Page:** `/operations/connection-data/[id]`  
**Endpoint:** `PUT /connection-data/:id/verify-technician`  
**Action:** Klik tombol **"Verifikasi Teknis"**

**Yang diverifikasi:**
✅ Lokasi feasible untuk sambungan  
✅ Pipa bisa dipasang  
✅ Tidak ada kendala teknis  
✅ Survey sudah lengkap

**Status setelah verifikasi:**

```javascript
{
  isVerifiedByTechnician: true,  // ✅ Sudah survey
  ...
}
```

---

### **FASE 4: RAB (RENCANA ANGGARAN BIAYA)**

#### **4.1 Teknisi: Buat RAB**

**Page:** `/operations/connection-data/[id]`  
**Action:** Klik tombol **"Buat RAB"** (muncul jika `isVerifiedByTechnician: true` dan belum ada RAB)

**Modal/Dialog Create RAB muncul dengan form:**

**Form Fields:**

- ✅ Total Biaya (Number input, format: Rp 3.000.000)
- ✅ Upload Dokumen RAB (PDF, max 5MB)
- ✅ Catatan (Text area, optional, breakdown biaya)

**Example Catatan:**

```
Breakdown Biaya:
- Biaya Instalasi Pipa: Rp 1.500.000
- Biaya Meteran Air: Rp 500.000
- Biaya Pemasangan: Rp 750.000
- Biaya Administrasi: Rp 250.000
------------------------
Total: Rp 3.000.000
```

**Submit:** `POST /rab-connection`  
**Endpoint Handler:** `createRabConnection` (with middleware `verifyTechnician`)

**Request Body (FormData):**

```javascript
{
  connectionDataId: "...",  // Auto filled
  totalBiaya: 3000000,
  rabFile: File,            // Upload PDF
  catatan: "Breakdown biaya..."
}
```

**Response Success:**

```javascript
{
  status: 201,
  message: "RAB connection created successfully",
  data: {
    _id: "...",
    connectionDataId: "...",
    userId: "...",
    technicianId: "...",
    totalBiaya: 3000000,
    rabUrl: "https://cloudinary.com/.../rab.pdf",
    isPaid: false,  // Belum dibayar
    catatan: "...",
    createdAt: "...",
    updatedAt: "..."
  }
}
```

**Auto Update ConnectionData:**

```javascript
{
  rabConnectionId: "rab_id_456",  // ✅ Linked
  ...
}
```

**Notifikasi:**

- ✅ User: "RAB telah dibuat. Total biaya: Rp 3.000.000. Silakan lakukan pembayaran."
- ✅ Admin: "RAB telah dibuat oleh Teknisi X untuk NIK xxxx"

---

### **FASE 5: PEMBAYARAN (USER)**

#### **5.1 User: Lihat RAB & Bayar**

**Platform:** Mobile App  
**Endpoint:** `GET /rab-connection/my-rab`

**User melihat:**

- Detail RAB (Dokumen PDF)
- Total Biaya
- Breakdown biaya (dari catatan)
- Status: Belum Lunas

**Action:** Klik tombol **"Bayar Sekarang"**

**Payment Gateway (Midtrans):**

1. User pilih metode pembayaran:
   - Virtual Account (BCA, BNI, Mandiri)
   - Transfer Bank
   - E-Wallet (GoPay, OVO, Dana)
2. User menyelesaikan pembayaran
3. Midtrans webhook otomatis update status

**Endpoint:** `POST /rab-connection/:rabId/pay`  
**Auto Update RAB:**

```javascript
{
  isPaid: true,  // ✅ Sudah dibayar
  paidAt: "2025-10-07T15:30:00Z"
}
```

**Notifikasi:**

- ✅ User: "Pembayaran berhasil! Teknisi akan segera memasang meteran."
- ✅ Teknisi: "Pembayaran diterima untuk NIK xxxx. Silakan lakukan pemasangan."
- ✅ Admin: "Pembayaran RAB diterima untuk NIK xxxx"

---

### **FASE 6: INSTALASI METERAN**

#### **6.1 Teknisi: Pasang Meteran Fisik**

**Action Manual:**

1. Teknisi datang ke lokasi
2. Pasang pipa sambungan
3. Pasang meteran air fisik
4. Test sambungan dan aliran air

#### **6.2 Admin/Teknisi: Input Nomor Meteran ke Sistem**

**Page:** `/operations/connection-data/[id]`  
**Action:** Klik tombol **"Input Meteran"** (muncul jika RAB `isPaid: true` dan belum ada meteran)

**Modal/Dialog Input Meteran muncul dengan form:**

**Form Fields:**

- ✅ Nomor Meteran (Text input, contoh: MTR-2025-001234)
- ✅ Kelompok Pelanggan (Dropdown select)
  - Rumah Tangga A
  - Rumah Tangga B
  - Komersial
  - Industri
- ✅ Tanggal Pemasangan (Date picker, default: today)

**Submit:** `POST /meteran` (endpoint baru)

**Request Body:**

```javascript
{
  connectionDataId: "...",
  userId: "...",
  noMeteran: "MTR-2025-001234",
  kelompokPelangganId: "...",
  tanggalPemasangan: "2025-10-07"
}
```

**Response Success:**

```javascript
{
  status: 201,
  message: "Meteran berhasil didaftarkan",
  data: {
    _id: "...",
    connectionDataId: "...",
    userId: "...",
    noMeteran: "MTR-2025-001234",
    kelompokPelangganId: "...",
    totalPemakaian: 0,
    pemakaianBelumTerbayar: 0,
    jatuhTempo: null,
    createdAt: "...",
    updatedAt: "..."
  }
}
```

**Auto Update ConnectionData:**

```javascript
{
  meteranId: "meteran_id_789",  // ✅ Linked
  ...
}
```

**Notifikasi:**

- ✅ User: "Meteran telah terpasang! No. Meteran: MTR-2025-001234. Anda sudah dapat menggunakan air."

---

### **FASE 7: COMPLETE PROCEDURE**

#### **7.1 Admin: Selesaikan Semua Prosedur**

**Page:** `/operations/connection-data/[id]`  
**Endpoint:** `PUT /connection-data/:id/complete-procedure`  
**Action:** Klik tombol **"Selesaikan Prosedur"**

**Validasi sebelum complete:**
✅ `isVerifiedByData: true` (Admin sudah verifikasi)  
✅ `isVerifiedByTechnician: true` (Teknisi sudah verifikasi)  
✅ `surveiId` ada (Survey sudah dibuat)  
✅ `rabConnectionId` ada dan `isPaid: true` (RAB sudah dibayar)  
✅ `meteranId` ada (Meteran sudah terpasang)

**Status Final:**

```javascript
{
  isVerifiedByData: true,
  isVerifiedByTechnician: true,
  surveiId: "...",
  rabConnectionId: "...",
  meteranId: "...",
  isAllProcedureDone: true  // ✅✅✅ SELESAI!
}
```

**Notifikasi:**

- ✅ User: "Selamat! Anda resmi menjadi pelanggan PDAM. Tagihan bulanan akan dimulai bulan depan."
- ✅ Admin/Teknisi: "Prosedur sambungan untuk NIK xxxx telah selesai."

---

## 📊 **STATUS TRACKING**

### **Indicator Visual (Timeline/Stepper)**

```
1. ⏳ Permohonan Dikirim
   └─ User submit dokumen

2. ⏳ Verifikasi Admin
   └─ Admin cek dokumen → ✅ Approved

3. ⏳ Survey Lapangan
   └─ Teknisi survey → ✅ Survey Created

4. ⏳ Verifikasi Teknis
   └─ Teknisi verifikasi → ✅ Verified

5. ⏳ RAB Dibuat
   └─ Teknisi buat RAB → ✅ RAB Created

6. ⏳ Pembayaran
   └─ User bayar → ✅ Paid

7. ⏳ Instalasi Meteran
   └─ Teknisi pasang → ✅ Installed

8. ✅ Selesai
   └─ Admin complete → 🎉 DONE!
```

---

## 🔐 **AUTHORIZATION MATRIX**

| Action             | User   | Admin  | Teknisi |
| ------------------ | ------ | ------ | ------- |
| Submit Permohonan  | ✅     | ❌     | ❌      |
| View Permohonan    | Own    | ✅ All | ✅ All  |
| Verifikasi Admin   | ❌     | ✅     | ❌      |
| Create Survey      | ❌     | ❌     | ✅      |
| Verifikasi Teknis  | ❌     | ❌     | ✅      |
| Create RAB         | ❌     | ❌     | ✅      |
| View RAB           | Own    | ✅ All | ✅ All  |
| Bayar RAB          | ✅ Own | ❌     | ❌      |
| Input Meteran      | ❌     | ✅     | ✅      |
| Complete Procedure | ❌     | ✅     | ❌      |

---

## 🛠️ **TECHNICAL IMPLEMENTATION**

### **Models Relationship:**

```javascript
User
  └── ConnectionData
       ├── SurveyData (1:1)
       │    └── technicianId (ref: Technician)
       ├── RabConnection (1:1)
       │    └── technicianId (ref: Technician)
       └── Meteran (1:1)
            └── kelompokPelangganId (ref: KelompokPelanggan)
```

### **Backend Routes:**

**Connection Data:**

- `GET /connection-data` - List all (Admin & Teknisi)
- `GET /connection-data/:id` - Detail (Admin & Teknisi)
- `PUT /connection-data/:id/verify-admin` - Verifikasi admin (Admin only)
- `PUT /connection-data/:id/verify-technician` - Verifikasi teknisi (Teknisi only)
- `PUT /connection-data/:id/complete-procedure` - Complete (Admin only)

**Survey Data:**

- `GET /survey-data` - List all (Admin & Teknisi)
- `GET /survey-data/:id` - Detail (Admin & Teknisi)
- `POST /survey-data` - Create (Teknisi only)
- `PUT /survey-data/:id` - Update (Teknisi only)

**RAB Connection:**

- `GET /rab-connection` - List all (Admin & Teknisi)
- `GET /rab-connection/:id` - Detail (Admin & Teknisi)
- `POST /rab-connection` - Create (Teknisi only)
- `PUT /rab-connection/:id` - Update (Teknisi only)
- `POST /rab-connection/:rabId/pay` - Payment (User only)

**Meteran:**

- `POST /meteran` - Create (Admin & Teknisi) - **NEED TO IMPLEMENT**

### **Frontend Pages:**

**Admin:**

- `/operations/connection-data` - List permohonan
- `/operations/connection-data/[id]` - Detail dengan workflow lengkap
- `/operations/survey-data` - List survey
- `/operations/rab-connection` - List RAB

**Teknisi:**

- `/operations/connection-data` - List tugas
- `/operations/connection-data/[id]` - Detail dengan action buttons
- `/operations/survey-data` - List survey yang dibuat
- `/operations/rab-connection` - List RAB yang dibuat

---

## 🚀 **NEXT STEPS TO IMPLEMENT**

### **Priority 1 (CRITICAL):**

1. ✅ Create Survey Form Dialog (Modal) ← **IMPLEMENT THIS**
2. ✅ Create RAB Form Dialog (Modal) ← **IMPLEMENT THIS**
3. ✅ Enhanced Detail Page dengan workflow visual ← **IMPLEMENT THIS**
4. ✅ Create Meteran endpoint & form ← **IMPLEMENT THIS**

### **Priority 2 (HIGH):**

5. ✅ Notification system (Pusher/WebSocket)
6. ✅ Email notifications
7. ✅ Payment integration testing (Midtrans)
8. ✅ Mobile app sync dengan workflow baru

### **Priority 3 (MEDIUM):**

9. ✅ Edit Survey & RAB forms
10. ✅ Delete confirmations
11. ✅ History logs (audit trail)
12. ✅ Reports & analytics

---

## 📱 **USER NOTIFICATIONS**

### **User Mobile App:**

- "Dokumen Anda telah diverifikasi"
- "Survey lapangan telah selesai"
- "RAB telah dibuat. Total: Rp X. Silakan bayar"
- "Pembayaran berhasil!"
- "Meteran telah terpasang. No: MTR-XXX"
- "Selamat! Anda resmi pelanggan PDAM"

### **Admin Dashboard:**

- "Permohonan baru dari User X"
- "Survey dibuat oleh Teknisi Y"
- "RAB dibuat oleh Teknisi Y"
- "Pembayaran diterima untuk NIK X"

### **Teknisi App:**

- "Tugas survey baru untuk NIK X"
- "Pembayaran diterima, lakukan instalasi"
- "User X menunggu pemasangan meteran"

---

## 📞 **SUPPORT**

Jika ada pertanyaan atau masalah teknis, hubungi tim development.

**Created:** October 7, 2025  
**Last Updated:** October 7, 2025  
**Version:** 1.0.0
