# 🚀 IMPLEMENTASI STATUS & TODO

## ✅ **SUDAH SELESAI**

### **Backend:**

- ✅ Model ConnectionData updated (tambah meteranId)
- ✅ Model Meteran updated (tambah connectionDataId)
- ✅ Model SurveyData updated (tambah technicianId, catatan)
- ✅ Model RabConnection updated (tambah technicianId, catatan)
- ✅ Controller surveyDataController updated (logging, technicianId)
- ✅ Controller rabConnectionController updated (logging, technicianId)
- ✅ Controller connectionDataController updated (logging)
- ✅ Middleware adminOrTechnicianAuth.js created
- ✅ Routes updated untuk authorization (admin & teknisi)
- ✅ Service layer frontend updated (types untuk technician)

### **Frontend:**

- ✅ Response handling diperbaiki untuk semua pages
- ✅ Role-based sidebar menu (admin vs teknisi)
- ✅ Connection Data list page
- ✅ Survey Data list page
- ✅ RAB Connection list page
- ✅ Technician Management page

### **Dokumentasi:**

- ✅ WORKFLOW_DOCUMENTATION.md dibuat lengkap

---

## 🔴 **BELUM SELESAI (TO DO)**

### **Priority 1 - CRITICAL:**

#### **1. Create Survey Form (Teknisi)**

**File:** `/app/(pages)/operations/connection-data/[id]/CreateSurveyDialog.tsx`

**Form Fields:**

```typescript
interface SurveyFormData {
  jaringanFile: File; // Upload foto
  diameterPipa: number;
  posisiBakFile: File; // Upload foto
  posisiMeteranFile: File; // Upload foto
  jumlahPenghuni: number;
  koordinatLat: number; // Auto dari GPS jika bisa
  koordinatLong: number; // Auto dari GPS jika bisa
  standar: boolean; // Toggle
  catatan?: string; // Text area
}
```

**Submit:**

```typescript
const formData = new FormData();
formData.append('connectionDataId', connectionDataId);
formData.append('jaringanFile', jaringanFile);
formData.append('diameterPipa', diameterPipa);
formData.append('posisiBakFile', posisiBakFile);
formData.append('posisiMeteranFile', posisiMeteranFile);
formData.append('jumlahPenghuni', jumlahPenghuni);
formData.append('koordinatLat', koordinatLat);
formData.append('koordinatLong', koordinatLong);
formData.append('standar', standar);
formData.append('catatan', catatan);

await createSurveyData(formData);
```

---

#### **2. Create RAB Form (Teknisi)**

**File:** `/app/(pages)/operations/connection-data/[id]/CreateRabDialog.tsx`

**Form Fields:**

```typescript
interface RabFormData {
  totalBiaya: number; // Number input, format Rupiah
  rabFile: File; // Upload PDF
  catatan?: string; // Text area untuk breakdown
}
```

**Submit:**

```typescript
const formData = new FormData();
formData.append('connectionDataId', connectionDataId);
formData.append('totalBiaya', totalBiaya);
formData.append('rabFile', rabFile);
formData.append('catatan', catatan);

await createRabConnection(formData);
```

---

#### **3. Enhanced Detail Page**

**File:** `/app/(pages)/operations/connection-data/[id]/page.tsx`

**Tambahan yang perlu ditambahkan:**

**A. Action Buttons Conditional:**

```typescript
// Show "Buat Survey" jika:
// - isVerifiedByData: true
// - surveiId: null
// - userRole === 'technician'

// Show "Buat RAB" jika:
// - isVerifiedByTechnician: true
// - rabConnectionId: null
// - userRole === 'technician'

// Show "Input Meteran" jika:
// - RAB isPaid: true
// - meteranId: null
// - userRole === 'admin' || 'technician'
```

**B. Display Linked Data:**

```typescript
// Section Survey Data (jika ada)
{data.surveiId && (
  <Card>
    <CardContent>
      <Typography variant="h6">Survey Data</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography>Diameter Pipa</Typography>
          <Typography>{surveyData.diameterPipa} mm</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography>Jumlah Penghuni</Typography>
          <Typography>{surveyData.jumlahPenghuni} orang</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography>Standar</Typography>
          <Chip label={surveyData.standar ? 'Sesuai' : 'Tidak Sesuai'} />
        </Grid>
        // Tombol lihat foto
      </Grid>
    </CardContent>
  </Card>
)}

// Section RAB (jika ada)
{data.rabConnectionId && (
  <Card>
    <CardContent>
      <Typography variant="h6">RAB Connection</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography>Total Biaya</Typography>
          <Typography variant="h5">
            Rp {rabData.totalBiaya.toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography>Status Pembayaran</Typography>
          <Chip label={rabData.isPaid ? 'Lunas' : 'Belum Lunas'} />
        </Grid>
        // Tombol download RAB PDF
      </Grid>
    </CardContent>
  </Card>
)}

// Section Meteran (jika ada)
{data.meteranId && (
  <Card>
    <CardContent>
      <Typography variant="h6">Meteran</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography>Nomor Meteran</Typography>
          <Typography variant="h5">{meteranData.noMeteran}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography>Tanggal Pemasangan</Typography>
          <Typography>{meteranData.createdAt}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)}
```

**C. Workflow Stepper:**

```typescript
<Stepper activeStep={getCurrentStep()} alternativeLabel>
  <Step completed={data.isVerifiedByData}>
    <StepLabel>Verifikasi Admin</StepLabel>
  </Step>
  <Step completed={!!data.surveiId}>
    <StepLabel>Survey Lapangan</StepLabel>
  </Step>
  <Step completed={data.isVerifiedByTechnician}>
    <StepLabel>Verifikasi Teknis</StepLabel>
  </Step>
  <Step completed={!!data.rabConnectionId}>
    <StepLabel>RAB Dibuat</StepLabel>
  </Step>
  <Step completed={rabData?.isPaid}>
    <StepLabel>Pembayaran</StepLabel>
  </Step>
  <Step completed={!!data.meteranId}>
    <StepLabel>Pemasangan Meteran</StepLabel>
  </Step>
  <Step completed={data.isAllProcedureDone}>
    <StepLabel>Selesai</StepLabel>
  </Step>
</Stepper>
```

---

#### **4. Create Meteran Endpoint & Form**

**Backend File:** `/controllers/meteranController.js`

**Create New Controller:**

```javascript
export const createMeteranFromConnection = async (req, res) => {
  try {
    const { connectionDataId, noMeteran, kelompokPelangganId } = req.body;

    // Get connection data
    const connectionData =
      await ConnectionData.findById(connectionDataId).populate(
        'rabConnectionId'
      );

    if (!connectionData) {
      return res.status(404).json({
        status: 404,
        message: 'Connection data not found',
      });
    }

    // Check RAB paid
    if (!connectionData.rabConnectionId?.isPaid) {
      return res.status(400).json({
        status: 400,
        message: 'RAB must be paid before creating meteran',
      });
    }

    // Check if meteran already exists
    if (connectionData.meteranId) {
      return res.status(400).json({
        status: 400,
        message: 'Meteran already exists for this connection',
      });
    }

    // Create meteran
    const meteran = new Meteran({
      connectionDataId,
      userId: connectionData.userId,
      noMeteran,
      kelompokPelangganId,
    });

    await meteran.save();

    // Update connection data
    connectionData.meteranId = meteran._id;
    await connectionData.save();

    res.status(201).json({
      status: 201,
      message: 'Meteran created successfully',
      data: meteran,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
```

**Frontend Form:**
**File:** `/app/(pages)/operations/connection-data/[id]/CreateMeteranDialog.tsx`

```typescript
interface MeteranFormData {
  noMeteran: string; // Text input
  kelompokPelangganId: string; // Dropdown select
}
```

---

### **Priority 2 - HIGH:**

#### **5. Fetch Linked Data di Detail Page**

**Update:** `/app/(pages)/operations/connection-data/[id]/page.tsx`

```typescript
const [surveyData, setSurveyData] = useState(null);
const [rabData, setRabData] = useState(null);
const [meteranData, setMeteranData] = useState(null);

useEffect(() => {
  if (data) {
    // Fetch survey if exists
    if (data.surveiId) {
      getSurveyDataById(data.surveiId._id).then(res => {
        setSurveyData(res.data.data || res.data);
      });
    }

    // Fetch RAB if exists
    if (data.rabConnectionId) {
      getRabConnectionById(data.rabConnectionId._id).then(res => {
        setRabData(res.data.data || res.data);
      });
    }

    // Fetch meteran if exists
    if (data.meteranId) {
      getMeteranById(data.meteranId._id).then(res => {
        setMeteranData(res.data.data || res.data);
      });
    }
  }
}, [data]);
```

---

#### **6. Update Survey & RAB Tables**

**Files:**

- `/app/(pages)/operations/survey-data/page.tsx`
- `/app/(pages)/operations/rab-connection/page.tsx`

**Show technician name:**

```typescript
<TableCell>
  {row.technicianId?.fullName || 'N/A'}
</TableCell>
```

---

### **Priority 3 - MEDIUM:**

#### **7. Meteran Service Layer**

**File:** `/app/services/meteran.service.ts`

```typescript
export interface Meteran {
  _id: string;
  connectionDataId?: string;
  noMeteran: string;
  kelompokPelangganId: {
    _id: string;
    nama: string;
  };
  userId: string;
  totalPemakaian: number;
  pemakaianBelumTerbayar: number;
  jatuhTempo?: string;
  createdAt: string;
  updatedAt: string;
}

export const createMeteranFromConnection = async (data: {
  connectionDataId: string;
  noMeteran: string;
  kelompokPelangganId: string;
}) => {
  const response = await API.post('/meteran/from-connection', data);
  return response;
};

export const getMeteranById = async (id: string) => {
  const response = await API.get(`/meteran/${id}`);
  return response;
};
```

---

#### **8. Edit Forms**

- Edit Survey (jika ada kesalahan input)
- Edit RAB (jika perlu revisi)

---

#### **9. Delete Confirmations**

- Dialog konfirmasi sebelum delete
- Cascade delete (jika hapus connection, hapus juga survey, RAB, meteran)

---

#### **10. Notifications**

- WebSocket/Pusher untuk real-time notifications
- Email notifications
- Push notifications (mobile)

---

## 📝 **CATATAN IMPLEMENTASI**

### **Upload Files:**

Semua file upload menggunakan FormData:

```typescript
const formData = new FormData();
formData.append('field', file);
```

### **Image Preview:**

Sebelum submit, preview image yang diupload:

```typescript
const [preview, setPreview] = useState('');

const handleFileChange = e => {
  const file = e.target.files[0];
  setFile(file);

  const reader = new FileReader();
  reader.onloadend = () => {
    setPreview(reader.result);
  };
  reader.readAsDataURL(file);
};
```

### **Currency Format:**

```typescript
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};
```

### **Conditional Buttons:**

```typescript
{!data.surveiId && data.isVerifiedByData && userRole === 'technician' && (
  <Button onClick={() => setCreateSurveyOpen(true)}>
    Buat Survey
  </Button>
)}
```

---

## 🎯 **QUICK START GUIDE**

### **Untuk melanjutkan development:**

1. **Buat CreateSurveyDialog.tsx**
2. **Buat CreateRabDialog.tsx**
3. **Buat CreateMeteranDialog.tsx**
4. **Update detail page untuk show buttons & linked data**
5. **Test workflow end-to-end**

### **Testing Workflow:**

1. Login sebagai Admin
2. Verifikasi connection data
3. Login sebagai Teknisi
4. Buat survey
5. Verifikasi teknis
6. Buat RAB
7. (Simulasi pembayaran via API/Postman)
8. Login sebagai Admin
9. Input meteran
10. Complete procedure

---

**Last Updated:** October 7, 2025
