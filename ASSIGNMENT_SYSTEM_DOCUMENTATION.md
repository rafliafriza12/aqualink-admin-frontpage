# Assignment System - Sistem Penugasan Teknisi

## 📋 Ringkasan

Sistem assignment ini memungkinkan **Admin** untuk menugaskan **Teknisi** tertentu ke setiap pengajuan sambungan (connection data) yang telah diverifikasi. Teknisi hanya dapat membuat survei untuk sambungan yang ditugaskan kepada mereka.

---

## ✅ Implementasi Lengkap

### **Backend** ✅

#### 1. **Model Updates**

- `ConnectionData.js`:
  ```javascript
  assignedTechnicianId: { type: ObjectId, ref: "Technician", default: null },
  assignedAt: { type: Date, default: null },
  assignedBy: { type: ObjectId, ref: "AdminAccount", default: null }
  ```

#### 2. **Controllers**

- `connectionDataController.js`:
  - ✅ `assignTechnician` - Admin menugaskan teknisi
  - ✅ `unassignTechnician` - Admin membatalkan penugasan
  - ✅ `getAllConnectionData` - Auto-filter untuk teknisi (hanya melihat tugasnya)
  - ✅ `getConnectionDataById` - Populate data assignment

- `surveyDataController.js`:
  - ✅ Validasi: Teknisi harus di-assign sebelum membuat survei

#### 3. **Routes**

- `connectionDataRoutes.js`:
  ```javascript
  router.put('/:id/assign-technician', verifyAdmin, assignTechnician);
  router.put('/:id/unassign-technician', verifyAdmin, unassignTechnician);
  ```

---

### **Frontend User** ✅

#### 1. **Services**

- `technician.service.ts`:
  - ✅ `getAllTechnicians()` - Ambil daftar teknisi
- `connectionData.service.ts`:
  - ✅ `assignTechnician(connectionDataId, technicianId, token)`
  - ✅ `unassignTechnician(connectionDataId, token)`

#### 2. **Components**

- ✅ `AssignTechnicianDialog.tsx` - Dialog untuk assign/ubah/hapus assignment

---

### **Frontend Admin** ✅

#### 1. **Services**

- `connectionData.service.ts`:
  - ✅ Interface `ConnectionData` dengan field assignment
  - ✅ `assignTechnician(connectionDataId, technicianId)`
  - ✅ `unassignTechnician(connectionDataId)`

#### 2. **Components**

- ✅ `AssignTechnicianDialog.tsx` - Dialog penugasan teknisi

#### 3. **Pages**

- **List Page** (`connection-data/page.tsx`):
  - ✅ Kolom "Teknisi Ditugaskan" menampilkan nama teknisi atau "Belum Ditugaskan"
- **Detail Page** (`connection-data/[id]/page.tsx`):
  - ✅ Tombol "Assign Teknisi" / "Ubah Teknisi" (jika verified, belum ada survei)
  - ✅ Section "Status Penugasan" dengan info lengkap
  - ✅ Integration dengan `AssignTechnicianDialog`

---

## 🔄 Alur Kerja Assignment System

### **Tahap 1: Admin Verifikasi Data**

```
User submit → Admin verifikasi → Status: isVerifiedByData = true
```

### **Tahap 2: Admin Assign Teknisi**

```
Admin klik "Assign Teknisi" → Pilih teknisi dari dropdown → Assign
↓
Backend menyimpan:
- assignedTechnicianId
- assignedAt (timestamp)
- assignedBy (admin yang assign)
```

### **Tahap 3: Teknisi Melihat Tugas**

```
Teknisi login → Hanya melihat sambungan yang di-assign ke dia
(Auto-filtered di backend)
```

### **Tahap 4: Teknisi Membuat Survei**

```
Teknisi akses detail → Buat survei
↓
Backend validasi:
1. Apakah teknisi di-assign ke sambungan ini?
2. Jika tidak → Error 403: "You are not assigned to this connection data"
```

### **Tahap 5: Admin Dapat Ubah Assignment** (Opsional)

```
Jika belum ada survei → Admin dapat:
- Ubah teknisi yang ditugaskan
- Hapus assignment (unassign)

Jika sudah ada survei → Assignment LOCKED, tidak bisa diubah
```

---

## 🎯 Business Rules

### ✅ **Assignment Rules**

1. ✅ Hanya connection data yang **isVerifiedByData = true** yang bisa di-assign
2. ✅ Assignment hanya bisa dilakukan oleh **Admin**
3. ✅ Assignment **tidak bisa diubah/dihapus** setelah survei dibuat
4. ✅ Teknisi hanya melihat sambungan yang di-assign kepada mereka (auto-filter)

### ✅ **Survey Rules**

1. ✅ Connection data **harus verified** oleh admin
2. ✅ Teknisi **harus di-assign** ke connection data tersebut
3. ✅ Validasi di backend: `assignedTechnicianId === req.technicianId`

---

## 📊 Database Schema

### ConnectionData Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  nik: String,
  // ... fields lainnya ...

  // Verification
  isVerifiedByData: Boolean,
  isVerifiedByTechnician: Boolean,

  // Assignment (NEW)
  assignedTechnicianId: ObjectId → ref: "Technician",
  assignedAt: Date,
  assignedBy: ObjectId → ref: "AdminAccount",

  // Survey & RAB
  surveiId: ObjectId,
  rabConnectionId: ObjectId
}
```

---

## 🔒 Authorization Matrix

| Aksi                     | Admin                      | Teknisi             | User |
| ------------------------ | -------------------------- | ------------------- | ---- |
| View all connection data | ✅                         | ✅ (filtered)       | ❌   |
| Assign teknisi           | ✅                         | ❌                  | ❌   |
| Unassign teknisi         | ✅ (jika belum ada survei) | ❌                  | ❌   |
| Create survey            | ❌                         | ✅ (jika di-assign) | ❌   |
| View detail              | ✅                         | ✅ (hanya tugasnya) | ❌   |

---

## 🧪 Testing Checklist

### Backend Testing

- [x] Admin dapat assign teknisi ke connection data yang verified
- [x] Admin dapat unassign teknisi jika belum ada survei
- [x] Admin **tidak dapat** unassign jika sudah ada survei
- [x] Teknisi hanya melihat sambungan yang di-assign ke mereka
- [x] Teknisi **tidak dapat** membuat survei untuk sambungan yang tidak di-assign
- [x] Teknisi dapat membuat survei untuk sambungan yang di-assign

### Frontend Admin Testing

- [ ] Halaman list menampilkan kolom "Teknisi Ditugaskan"
- [ ] Tombol "Assign Teknisi" muncul setelah verifikasi admin
- [ ] Dialog assignment menampilkan daftar teknisi
- [ ] Assignment berhasil dan data refresh otomatis
- [ ] Section "Status Penugasan" menampilkan info lengkap
- [ ] Tombol "Ubah Teknisi" muncul jika sudah di-assign (dan belum ada survei)
- [ ] Tombol "Hapus Assignment" berfungsi dengan benar

### Frontend Teknisi Testing

- [ ] Teknisi hanya melihat sambungan yang di-assign ke mereka
- [ ] Teknisi dapat akses detail sambungan yang di-assign
- [ ] Teknisi **tidak dapat** akses sambungan yang tidak di-assign
- [ ] Teknisi dapat membuat survei untuk sambungan yang di-assign

---

## 🚀 Next Steps

1. ✅ Backend implementation (DONE)
2. ✅ Frontend Admin implementation (DONE)
3. ⏳ Testing seluruh flow assignment system
4. ⏳ Implementasi Create Survey Dialog
5. ⏳ Implementasi Create RAB Dialog
6. ⏳ Implementasi Create Meteran Dialog

---

## 📝 API Endpoints

### Assignment Endpoints (Admin Only)

#### **PUT** `/api/connection-data/:id/assign-technician`

Assign teknisi ke connection data

**Request Body:**

```json
{
  "technicianId": "64abc123..."
}
```

**Response:**

```json
{
  "status": 200,
  "message": "Technician assigned successfully",
  "data": {
    /* updated connection data */
  }
}
```

**Errors:**

- 404: Connection data not found
- 400: Not verified by admin yet
- 400: Survey already exists (cannot change assignment)

---

#### **PUT** `/api/connection-data/:id/unassign-technician`

Hapus assignment teknisi

**Response:**

```json
{
  "status": 200,
  "message": "Technician unassigned successfully",
  "data": {
    /* updated connection data */
  }
}
```

**Errors:**

- 404: Connection data not found
- 400: Survey already exists (cannot unassign)

---

## 🎨 UI/UX Features

### Admin Panel - List Page

- ✅ Kolom baru: "Teknisi Ditugaskan"
- ✅ Menampilkan nama + phone teknisi
- ✅ Badge "Belum Ditugaskan" jika belum di-assign

### Admin Panel - Detail Page

- ✅ Section "Status Penugasan" dengan info:
  - Nama teknisi
  - Email & phone teknisi
  - Tanggal assignment
  - Admin yang assign
- ✅ Tombol "Assign Teknisi" (jika verified, belum assigned, belum ada survei)
- ✅ Tombol "Ubah Teknisi" (jika assigned, belum ada survei)
- ✅ Alert warning jika belum di-assign

### Assignment Dialog

- ✅ Dropdown daftar teknisi
- ✅ Menampilkan teknisi saat ini (jika sudah di-assign)
- ✅ Tombol "Hapus Assignment" (jika sudah di-assign)
- ✅ Loading states
- ✅ Error handling
- ✅ Auto-refresh setelah berhasil

---

## 💡 Tips & Best Practices

1. **Selalu assign teknisi** setelah verifikasi admin, agar teknisi bisa langsung bekerja
2. **Jangan ubah assignment** setelah survei dibuat untuk menjaga akuntabilitas
3. **Gunakan filter** di halaman list untuk melihat sambungan berdasarkan status assignment
4. **Monitor workload** teknisi dengan melihat jumlah sambungan yang di-assign

---

## 🐛 Known Issues & Limitations

1. **Limitation**: Hanya 1 teknisi per connection data (tidak support team assignment)
2. **Limitation**: Assignment history tidak disimpan (hanya menyimpan assignment terakhir)

---

## 📚 Related Documentation

- [WORKFLOW_DOCUMENTATION.md](WORKFLOW_DOCUMENTATION.md) - Alur lengkap dari submission sampai instalasi meteran
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Status implementasi fitur-fitur
- [API_DOCUMENTATION_V2.md](../aqualink-backend/API_DOCUMENTATION_V2.md) - API endpoints lengkap

---

**Status**: ✅ **FULLY IMPLEMENTED**  
**Last Updated**: 2025-10-07  
**Version**: 1.0.0
