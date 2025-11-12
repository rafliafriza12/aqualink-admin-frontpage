# Create Survey Feature - Fitur Buat Survei untuk Teknisi

## 📋 Ringkasan

Teknisi sekarang dapat membuat survei langsung dari halaman detail connection data. Setelah admin memverifikasi dan meng-assign teknisi, tombol "Buat Survei" akan muncul.

---

## ✅ Implementasi

### **1. Connection Data Detail Page** ✅

**File**: `app/(pages)/operations/connection-data/[id]/page.tsx`

**Perubahan:**

- ✅ Tambah icon `AddCircle` untuk tombol
- ✅ Tambah tombol "Buat Survei" untuk teknisi
- ✅ Tombol muncul jika:
  - `userRole === 'technician'`
  - `isVerifiedByData === true` (sudah diverifikasi admin)
  - `surveiId === null` (belum ada survei)
- ✅ Tombol redirect ke `/operations/survey-data/create?connectionId={id}`

**Code:**

```tsx
{
  userRole === 'technician' && data.isVerifiedByData && !data.surveiId && (
    <Button
      variant='contained'
      color='success'
      onClick={() =>
        router.push(`/operations/survey-data/create?connectionId=${data._id}`)
      }
      disabled={actionLoading}
      startIcon={<AddCircle />}
    >
      Buat Survei
    </Button>
  );
}
```

---

### **2. Create Survey Page** ✅ (NEW)

**File**: `app/(pages)/operations/survey-data/create/page.tsx`

**Features:**

- ✅ Form lengkap untuk membuat survei
- ✅ Upload 3 foto (Jaringan, Posisi Bak, Posisi Meteran)
- ✅ Preview foto yang diupload
- ✅ Input diameter pipa, jumlah penghuni
- ✅ Input koordinat latitude/longitude
- ✅ Tombol "Auto" untuk ambil lokasi GPS otomatis
- ✅ Switch "Standar" (sesuai standar instalasi)
- ✅ Text area catatan tambahan
- ✅ Validasi lengkap sebelum submit
- ✅ Loading states
- ✅ Error & success handling
- ✅ Auto-redirect ke detail page setelah sukses

**Form Fields:**

| Field             | Type    | Required | Description                 |
| ----------------- | ------- | -------- | --------------------------- |
| jaringanFile      | File    | ✅       | Foto jaringan pipa          |
| posisiBakFile     | File    | ✅       | Foto posisi bak penampungan |
| posisiMeteranFile | File    | ✅       | Foto posisi meteran         |
| diameterPipa      | Number  | ✅       | Diameter pipa dalam inch    |
| jumlahPenghuni    | Number  | ✅       | Jumlah penghuni rumah       |
| koordinatLat      | Number  | ✅       | Latitude lokasi             |
| koordinatLong     | Number  | ✅       | Longitude lokasi            |
| standar           | Boolean | ✅       | Sesuai standar instalasi?   |
| catatan           | String  | ❌       | Catatan tambahan            |

**Validations:**

1. ✅ Semua file harus diupload
2. ✅ File harus gambar (JPG, PNG) atau PDF
3. ✅ Ukuran file maksimal 5MB
4. ✅ Diameter pipa dan jumlah penghuni harus diisi
5. ✅ Koordinat harus diisi
6. ✅ Connection data harus sudah verified
7. ✅ Connection data belum punya survei
8. ✅ Teknisi harus di-assign (untuk role teknisi)

---

## 🔄 Alur Kerja

```
1. Admin verifikasi connection data
   └─> Admin assign teknisi

2. Teknisi login → Lihat list connection data (hanya yang di-assign)
   └─> Klik detail

3. Di halaman detail, tombol "Buat Survei" muncul
   └─> Klik tombol

4. Redirect ke halaman form create survey
   └─> Form sudah terisi connectionId dari query parameter

5. Teknisi isi form dan upload foto:
   - Upload foto jaringan
   - Upload foto posisi bak
   - Upload foto posisi meteran
   - Isi diameter pipa
   - Isi jumlah penghuni
   - Ambil koordinat GPS (atau input manual)
   - Toggle standar (default: true)
   - Tambah catatan (optional)

6. Klik "Simpan Survei"
   └─> Backend validasi:
       - Apakah teknisi di-assign?
       - Apakah connection data verified?
       - Apakah belum ada survei?
   └─> Jika valid: Survei tersimpan

7. Auto-redirect kembali ke detail connection data
   └─> Survei berhasil dibuat
   └─> Tombol "Buat Survei" hilang (karena sudah ada survei)
```

---

## 🎨 UI/UX Features

### **Detail Page:**

- ✅ Tombol "Buat Survei" dengan icon `AddCircle`
- ✅ Warna success (hijau)
- ✅ Conditional rendering (hanya untuk teknisi, verified, belum ada survei)

### **Create Survey Page:**

- ✅ Header dengan back button
- ✅ Info connection data (NIK dan nama pelanggan)
- ✅ Alert untuk error dan success
- ✅ Card terpisah untuk upload foto
- ✅ Preview foto yang diupload
- ✅ Tombol remove foto
- ✅ Card terpisah untuk detail survei
- ✅ Tombol "Auto" untuk ambil GPS
- ✅ Switch untuk standar
- ✅ Text area untuk catatan
- ✅ Tombol Batal dan Simpan

### **File Upload:**

- ✅ Support gambar (JPG, PNG) dan PDF
- ✅ Maksimal 5MB per file
- ✅ Preview gambar sebelum upload
- ✅ Indikator "PDF uploaded" untuk file PDF
- ✅ Tombol remove dengan icon X

### **GPS Location:**

- ✅ Tombol "Auto" untuk ambil lokasi otomatis
- ✅ Menggunakan browser Geolocation API
- ✅ Success message setelah lokasi diambil
- ✅ Error handling jika geolocation gagal
- ✅ Fallback: input manual jika geolocation tidak support

---

## 🧪 Testing Checklist

### **Connection Data Detail Page:**

- [ ] Login sebagai teknisi
- [ ] Buka detail connection data yang di-assign
- [ ] Tombol "Buat Survei" muncul (jika verified, belum ada survei)
- [ ] Klik tombol → redirect ke form create survey
- [ ] Jika sudah ada survei → tombol tidak muncul

### **Create Survey Page:**

- [ ] Form muncul dengan header yang benar
- [ ] Info connection data tampil (NIK dan nama)
- [ ] Upload foto jaringan → preview muncul
- [ ] Upload foto posisi bak → preview muncul
- [ ] Upload foto posisi meteran → preview muncul
- [ ] Klik tombol remove → foto terhapus
- [ ] Upload file > 5MB → error muncul
- [ ] Upload file selain gambar/PDF → error muncul
- [ ] Input diameter pipa dan jumlah penghuni
- [ ] Klik tombol "Auto" → koordinat terisi otomatis
- [ ] Toggle switch standar
- [ ] Isi catatan tambahan
- [ ] Klik "Simpan Survei" tanpa upload foto → error validation
- [ ] Klik "Simpan Survei" dengan data lengkap → success
- [ ] Auto-redirect ke detail page → survei tersimpan

### **Backend Validation:**

- [ ] Coba buat survei tanpa di-assign → error 403
- [ ] Coba buat survei untuk connection yang belum verified → error 400
- [ ] Coba buat survei kedua kali → error (sudah ada survei)

---

## 📁 Files Created/Modified

### **Created:**

- ✅ `app/(pages)/operations/survey-data/create/page.tsx` - Form create survey (NEW)

### **Modified:**

- ✅ `app/(pages)/operations/connection-data/[id]/page.tsx` - Tambah tombol "Buat Survei"

---

## 🚀 Next Steps

1. ✅ Tombol "Buat Survei" di detail page (DONE)
2. ✅ Halaman form create survey (DONE)
3. ⏳ Testing end-to-end flow
4. ⏳ Create RAB Dialog (teknisi buat RAB setelah survei)
5. ⏳ Create Meteran Dialog (admin input meteran)
6. ⏳ Workflow stepper di detail page

---

## 💡 Tips untuk Teknisi

1. **Sebelum Survei:**
   - Pastikan Anda sudah di-assign ke connection data
   - Siapkan kamera/HP untuk foto
   - Aktifkan GPS untuk koordinat otomatis

2. **Saat Survei:**
   - Ambil foto yang jelas untuk jaringan, bak, dan meteran
   - Ukur diameter pipa dengan akurat
   - Hitung jumlah penghuni
   - Gunakan tombol "Auto" untuk koordinat (lebih akurat)
   - Centang "Standar" jika instalasi sesuai standar
   - Tulis catatan penting di field catatan

3. **Setelah Survei:**
   - Pastikan semua data tersimpan
   - Lanjut ke pembuatan RAB (jika sudah tersedia)
   - Hubungi pelanggan untuk konfirmasi

---

## 🐛 Known Issues & Limitations

1. **GPS Accuracy**: Akurasi GPS bergantung pada device dan koneksi
2. **File Size**: Maksimal 5MB per foto, kompres foto jika terlalu besar
3. **Browser Support**: Geolocation mungkin tidak work di browser lama

---

## 📚 Related Files

- Backend: `controllers/surveyDataController.js` - Validasi dan simpan survei
- Backend: `models/SurveyData.js` - Schema survei
- Service: `services/surveyData.service.ts` - API calls

---

**Status**: ✅ **IMPLEMENTED**  
**Last Updated**: 2025-10-07  
**Version**: 1.0.0
