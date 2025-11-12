# 🔧 REFACTOR: Form Registrasi Pelanggan (Sesuai Model Backend)

## Tanggal: 8 Oktober 2025

---

## 🐛 Problems

### 1. **Infinite Loop Error**

- **Error**: "Too many re-renders. React limits the number of renders to prevent an infinite loop"
- **Cause**: Button `disabled={!validateStep(activeStep)}` memanggil `validateStep()` di setiap render, yang mengubah state `error`

### 2. **Model Mismatch**

- Form registrasi admin mencakup field yang **TIDAK ADA** di User model:
  - ❌ `location` (latitude, longitude, address)
  - ❌ `documents` (ktp, kk, domicile, npwp)
- Field tersebut seharusnya ada di **ConnectionData model** (untuk aktivasi koneksi)

---

## 📊 System Architecture

### **Flow yang Benar:**

```
1. ADMIN REGISTER USER (Basic Info)
   ↓
   User Model:
   - nik, fullName, email, phone, address
   - customerType, gender, birthDate, occupation
   - accountStatus: 'active'
   ↓
   User created with basic info

2. USER/ADMIN SUBMIT CONNECTION DATA (Activation Request)
   ↓
   ConnectionData Model:
   - userId, nik, nikUrl (KTP)
   - noKK, kkUrl (Kartu Keluarga)
   - noImb, imbUrl (IMB)
   - alamat, kecamatan, kelurahan
   - luasBangunan
   - isVerifiedByData: false
   - isVerifiedByTechnician: false
   ↓
   Connection request pending verification

3. ADMIN ASSIGNS TECHNICIAN
   ↓
   ConnectionData updated:
   - assignedTechnicianId
   - assignedAt
   - assignedBy

4. TECHNICIAN SURVEYS & CREATES RAB
   ↓
   SurveyData & RabConnection created

5. USER PAYS & GETS METER
   ↓
   Meteran created & linked to User
```

---

## ✅ Solutions Implemented

### 1. **Fix Infinite Loop**

**Before:**

```tsx
<Button
  variant='contained'
  onClick={handleNext}
  disabled={!validateStep(activeStep)} // ❌ Called every render!
>
  Selanjutnya
</Button>
```

**After:**

```tsx
<Button
  variant='contained'
  onClick={handleNext}
  // No disabled prop - validation runs in handleNext()
>
  Selanjutnya
</Button>
```

Validasi tetap jalan di `handleNext()`:

```tsx
const handleNext = () => {
  if (validateStep(activeStep)) {
    // ✅ Only called on click
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  } else {
    setError('Mohon lengkapi semua field yang diperlukan');
  }
};
```

### 2. **Refactor Form to Match User Model**

#### **Removed:**

- ❌ `location.latitude`
- ❌ `location.longitude`
- ❌ `location.address`
- ❌ `documents.ktp`
- ❌ `documents.kk`
- ❌ `documents.domicile`
- ❌ `documents.npwp`
- ❌ `handleFileUpload()` function

#### **Simplified FormData:**

**Before (Wrong):**

```tsx
const [formData, setFormData] = useState({
  nik: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  customerType: 'rumah_tangga',
  gender: '',
  birthDate: '',
  occupation: '',
  location: {
    // ❌ Not in User model
    latitude: -5.5483,
    longitude: 95.3238,
    address: '',
  },
  documents: {
    // ❌ Not in User model
    ktp: null,
    kk: null,
    domicile: null,
    npwp: null,
  },
});
```

**After (Correct):**

```tsx
const [formData, setFormData] = useState({
  nik: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  customerType: 'rumah_tangga',
  gender: '',
  birthDate: '',
  occupation: '',
});
```

#### **Simplified Steps: 4 → 3**

**Before:**

- Step 0: Informasi Pribadi (8 fields)
- Step 1: Alamat & Lokasi (location fields)
- Step 2: Dokumen (4 document uploads)
- Step 3: Konfirmasi

**After:**

- **Step 0: Informasi Pribadi** (4 fields only)
  - NIK
  - Nama Lengkap
  - Email
  - Nomor Telepon
- **Step 1: Data Tambahan** (6 fields)
  - Alamat Lengkap (required)
  - Jenis Kelamin (required)
  - Jenis Pelanggan (required)
  - Tanggal Lahir (optional)
  - Pekerjaan (optional)
  - Info notice about Connection Data
- **Step 2: Konfirmasi**
  - Review all data
  - Submit to backend

---

## 📝 Updated Code Structure

### **Step 0: Informasi Pribadi**

```tsx
case 0:
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h6'>
          <Person color='primary' />
          Informasi Pribadi
        </Typography>
      </Grid>

      {/* NIK (16 digits) */}
      <Grid item xs={12} md={6}>
        <TextField
          label='NIK'
          value={formData.nik}
          inputProps={{ maxLength: 16 }}
          helperText='Nomor Induk Kependudukan (16 digit)'
          required
        />
      </Grid>

      {/* Nama Lengkap */}
      <Grid item xs={12} md={6}>
        <TextField
          label='Nama Lengkap'
          value={formData.name}
          required
        />
      </Grid>

      {/* Email */}
      <Grid item xs={12} md={6}>
        <TextField
          label='Email'
          type='email'
          value={formData.email}
          required
        />
      </Grid>

      {/* Phone */}
      <Grid item xs={12} md={6}>
        <TextField
          label='Nomor Telepon'
          value={formData.phone}
          helperText='Contoh: 081234567890 atau +6281234567890'
          required
        />
      </Grid>
    </Grid>
  );
```

### **Step 1: Data Tambahan**

```tsx
case 1:
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h6'>
          <Home color='primary' />
          Data Tambahan
        </Typography>
      </Grid>

      {/* Alamat (required) */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label='Alamat Lengkap'
          value={formData.address}
          helperText='Alamat lengkap sesuai KTP (minimal 10 karakter)'
          required
        />
      </Grid>

      {/* Gender (required) */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Jenis Kelamin</InputLabel>
          <Select value={formData.gender}>
            <MenuItem value='L'>Laki-laki</MenuItem>
            <MenuItem value='P'>Perempuan</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Customer Type (required) */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Jenis Pelanggan</InputLabel>
          <Select value={formData.customerType}>
            <MenuItem value='rumah_tangga'>Rumah Tangga</MenuItem>
            <MenuItem value='komersial'>Komersial</MenuItem>
            <MenuItem value='industri'>Industri</MenuItem>
            <MenuItem value='sosial'>Sosial</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Birth Date (optional) */}
      <Grid item xs={12} md={6}>
        <TextField
          type='date'
          label='Tanggal Lahir'
          value={formData.birthDate}
          helperText='Opsional'
        />
      </Grid>

      {/* Occupation (optional) */}
      <Grid item xs={12} md={6}>
        <TextField
          label='Pekerjaan'
          value={formData.occupation}
          helperText='Opsional'
        />
      </Grid>

      {/* Info Notice */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
          <Typography variant='body2'>
            💡 <strong>Catatan:</strong> Data pelanggan hanya mencakup informasi dasar.
            Untuk aktivasi koneksi, pelanggan perlu mengajukan Connection Data
            (dokumen KTP, KK, IMB, dll) melalui sistem terpisah.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
```

### **Step 2: Konfirmasi**

```tsx
case 2:
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h6'>
          <CheckCircle color='primary' />
          Konfirmasi Data
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant='h6' gutterBottom>
            Data Pelanggan
          </Typography>
          <Grid container spacing={2}>
            {/* Display all form data */}
            <Grid item xs={12} md={6}>
              <Typography variant='body2' color='text.secondary'>
                NIK:
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 600 }}>
                {formData.nik}
              </Typography>
            </Grid>
            {/* ... other fields ... */}
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Alert severity='info'>
          Pelanggan akan didaftarkan dengan status <strong>active</strong>.
          Untuk aktivasi koneksi air, pelanggan perlu mengajukan <strong>Connection Data</strong>.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <Alert severity='warning'>
          Pastikan semua data sudah benar sebelum menyimpan.
        </Alert>
      </Grid>
    </Grid>
  );
```

---

## 📤 Submit Data

### **Backend API Call:**

```tsx
const handleSubmit = async () => {
  const submitData = {
    nik: formData.nik,
    fullName: formData.name, // Backend expects 'fullName'
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    customerType: formData.customerType,
    gender: formData.gender,
    birthDate: formData.birthDate || undefined, // Optional
    occupation: formData.occupation || undefined, // Optional
  };

  const response = await customerAPI.create(submitData);
  // POST /admin/customers
};
```

### **Backend Validation:**

```javascript
// adminCustomerController.js - createCustomer()
const {
  nik,
  fullName,
  email,
  phone,
  address,
  customerType,
  gender,
  birthDate,
  occupation,
} = req.body;

// Validation
if (!nik || !fullName || !email || !phone || !address) {
  return res.status(400).json({ message: 'Data tidak lengkap' });
}

// NIK must be 16 digits
if (nik.length !== 16 || !/^\d+$/.test(nik)) {
  return res.status(400).json({ message: 'NIK harus 16 digit angka' });
}

// Check uniqueness
const existingNIK = await User.findOne({ nik });
const existingEmail = await User.findOne({ email });

// Create user
const newCustomer = new User({
  nik,
  fullName,
  email,
  phone,
  address,
  customerType,
  gender,
  birthDate,
  occupation,
  accountStatus: 'active', // Default status
});

await newCustomer.save();
```

---

## 🔄 Updated Validations

### **Step 0 Validation:**

```tsx
case 0:
  if (!formData.nik || formData.nik.length !== 16) {
    setError('NIK harus 16 digit');
    return false;
  }
  if (!formData.name || formData.name.length < 3) {
    setError('Nama lengkap minimal 3 karakter');
    return false;
  }
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    setError('Format email tidak valid');
    return false;
  }
  if (!formData.phone || !/^(\+62|62|0)[0-9]{9,12}$/.test(formData.phone)) {
    setError('Format nomor telepon tidak valid');
    return false;
  }
  return true;
```

### **Step 1 Validation:**

```tsx
case 1:
  if (!formData.address || formData.address.length < 10) {
    setError('Alamat minimal 10 karakter');
    return false;
  }
  if (!formData.gender) {
    setError('Jenis kelamin harus dipilih');
    return false;
  }
  if (!formData.customerType) {
    setError('Jenis pelanggan harus dipilih');
    return false;
  }
  return true;
```

### **Step 2 Validation:**

```tsx
case 2:
  return true;  // Just confirmation, no new input
```

---

## 📋 User Model Fields (Backend Reference)

```javascript
// models/User.js
const Users = new mongoose.Schema(
  {
    // REQUIRED FIELDS (set by admin)
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },

    // OPTIONAL FIELDS (can be null)
    nik: { type: String, default: null, sparse: true, unique: true },
    phone: { type: String, default: null },
    address: { type: String, default: null },

    // ENUM FIELDS
    customerType: {
      type: String,
      enum: ['rumah_tangga', 'komersial', 'industri', 'sosial'],
      default: 'rumah_tangga',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    gender: {
      type: String,
      enum: ['L', 'P'],
      default: null,
    },

    // ADDITIONAL INFO
    birthDate: { type: Date, default: null },
    occupation: { type: String, default: null },

    // RELATIONS (set later by system)
    SambunganDataId: { type: ObjectId, ref: 'ConnectionData', default: null },
    meteranId: { type: ObjectId, ref: 'Meteran', default: null },
    iotConnectionId: { type: ObjectId, ref: 'IoTConnection', default: null },

    // FLAGS (managed by system)
    isIoTConnected: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    // AUTH (not used in admin registration)
    password: { type: String, default: null },
    token: { type: String, default: null },
  },
  { timestamps: true }
);
```

---

## 📋 ConnectionData Model (For Reference)

```javascript
// models/ConnectionData.js
// This is for ACTIVATION REQUEST, not admin registration!
const ConnectionData = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: 'Users', required: true },

    // DOCUMENT FIELDS
    nik: { type: String, required: true },
    nikUrl: { type: String, required: true }, // Cloudinary URL
    noKK: { type: String, required: true },
    kkUrl: { type: String, required: true }, // Cloudinary URL
    noImb: { type: String, required: true },
    imbUrl: { type: String, required: true }, // Cloudinary URL

    // LOCATION FIELDS
    alamat: { type: String, required: true },
    kecamatan: { type: String, required: true },
    kelurahan: { type: String, required: true },
    luasBangunan: { type: Number, required: true },

    // VERIFICATION FIELDS
    isVerifiedByData: { type: Boolean, default: false },
    isVerifiedByTechnician: { type: Boolean, default: false },

    // ASSIGNMENT FIELDS
    assignedTechnicianId: { type: ObjectId, ref: 'Technician', default: null },
    assignedAt: { type: Date, default: null },
    assignedBy: { type: ObjectId, ref: 'AdminAccount', default: null },

    // RELATIONS
    surveiId: { type: ObjectId, ref: 'SurveyData', default: null },
    rabConnectionId: { type: ObjectId, ref: 'RabConnection', default: null },
    meteranId: { type: ObjectId, ref: 'Meteran', default: null },

    // FLAGS
    isAllProcedureDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);
```

---

## 🧪 Testing Steps

### 1. Test Registration Flow

```bash
# 1. Open registration page
http://localhost:3000/customers/registration

# 2. Step 0: Fill basic info
- NIK: 3201234567890123 (16 digits)
- Nama: John Doe
- Email: john@example.com
- Phone: 081234567890
- Click "Selanjutnya"

# 3. Step 1: Fill additional data
- Alamat: Jl. Merdeka No. 123, Jakarta Pusat
- Jenis Kelamin: Laki-laki
- Jenis Pelanggan: Rumah Tangga
- Tanggal Lahir: 1990-01-01 (optional)
- Pekerjaan: Software Engineer (optional)
- Click "Selanjutnya"

# 4. Step 2: Review & confirm
- Check all data is correct
- Read info notice about Connection Data
- Click "Simpan & Daftar"

# 5. Check console for:
📤 Submitting customer data: {
  nik: "3201234567890123",
  fullName: "John Doe",
  email: "john@example.com",
  phone: "081234567890",
  address: "Jl. Merdeka No. 123, Jakarta Pusat",
  customerType: "rumah_tangga",
  gender: "L",
  birthDate: "1990-01-01",
  occupation: "Software Engineer"
}
✅ Customer created: { data: { _id: "..." } }

# 6. Success message should show
"Pelanggan berhasil didaftarkan! ID: 507f..."

# 7. Form should reset after 5 seconds
```

### 2. Test Validations

```bash
# Test NIK validation
- Enter "123" → Error: "NIK harus 16 digit"
- Enter "abcd1234567890ab" → Error: "NIK harus 16 digit"
- Enter "1234567890123456" → ✅ Valid

# Test Email validation
- Enter "test" → Error: "Format email tidak valid"
- Enter "test@" → Error: "Format email tidak valid"
- Enter "test@example.com" → ✅ Valid

# Test Phone validation
- Enter "123" → Error: "Format nomor telepon tidak valid"
- Enter "081234567890" → ✅ Valid
- Enter "+6281234567890" → ✅ Valid
- Enter "6281234567890" → ✅ Valid

# Test Address validation (Step 1)
- Enter "Jl." → Error: "Alamat minimal 10 karakter"
- Enter "Jl. Merdeka" → Error: "Alamat minimal 10 karakter"
- Enter "Jl. Merdeka No. 123" → ✅ Valid

# Test Gender validation (Step 1)
- Leave empty → Error: "Jenis kelamin harus dipilih"
- Select "Laki-laki" → ✅ Valid
```

### 3. Test Backend Integration

```bash
# Check if customer is created in MongoDB
db.users.findOne({ nik: "3201234567890123" })

# Should return:
{
  _id: ObjectId("..."),
  nik: "3201234567890123",
  fullName: "John Doe",
  email: "john@example.com",
  phone: "081234567890",
  address: "Jl. Merdeka No. 123, Jakarta Pusat",
  customerType: "rumah_tangga",
  accountStatus: "active",
  gender: "L",
  birthDate: ISODate("1990-01-01T00:00:00.000Z"),
  occupation: "Software Engineer",
  SambunganDataId: null,  // Not set yet
  meteranId: null,  // Not set yet
  isIoTConnected: false,
  isVerified: false,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## ✅ Status

**FIXED** ✅ - Form registrasi sekarang sesuai dengan User model dan tidak ada infinite loop!

### What's Working Now:

- ✅ No infinite loop error
- ✅ 3-step registration (not 4)
- ✅ Only fields that exist in User model
- ✅ Proper validation for each step
- ✅ Clear separation: User registration vs Connection Data
- ✅ Info notice about Connection Data process
- ✅ Correct field mapping (fullName, etc.)
- ✅ No compilation errors

### What's Removed:

- ❌ Location fields (latitude, longitude, address)
- ❌ Document upload fields (ktp, kk, domicile, npwp)
- ❌ `handleFileUpload()` function
- ❌ Unused imports (Upload, Description, LocationOn, Chip, etc.)

### Benefits:

- 🎯 Form matches backend User model exactly
- 🚀 Cleaner, simpler registration process
- 📝 Clear workflow: Register → Submit Connection Data → Verification → Meter Installation
- 🔧 Easier to maintain and debug

---

## 📌 Important Notes

### **For Connection Data Submission:**

- User/Admin should use **separate page/form** for Connection Data
- Route: `/connection-data/create` (example)
- Upload documents: KTP, KK, IMB
- Fill location details: kecamatan, kelurahan, luas bangunan
- This creates **ConnectionData** record linked to User
- Admin can then assign technician for survey

### **Workflow Summary:**

```
1. Admin creates User (basic info) → /customers/registration
2. User/Admin submits Connection Data (documents + location) → /connection-data/create
3. Admin assigns Technician → /connection-data/:id/assign
4. Technician surveys & creates RAB → /survey/create
5. User pays → /payment
6. Admin creates Meter → /meteran/create
7. IoT device connected → /iot/connect
```

---

**Last Updated**: 8 Oktober 2025
**Status**: ✅ RESOLVED - Form refactored to match User model
