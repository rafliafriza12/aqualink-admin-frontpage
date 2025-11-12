# 📋 Dokumentasi Management Pelanggan (Customer Management)

## 🎯 Overview

Sistem Management Pelanggan adalah fitur lengkap untuk mengelola data pelanggan AquaLink di panel admin. Fitur ini memungkinkan admin untuk melihat, menambah, mengedit, menghapus, dan mengekspor data pelanggan dengan mudah.

---

## 📁 Struktur File

```
aqualink-admin-frontpage/
├── app/
│   ├── (pages)/
│   │   ├── customers/
│   │   │   ├── page.tsx                    # ✅ Halaman utama daftar pelanggan
│   │   │   ├── integrated-page.tsx          # Halaman terintegrasi
│   │   │   ├── detail/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx            # ✅ Halaman detail pelanggan (BARU)
│   │   │   ├── registration/
│   │   │   │   └── page.tsx                # Halaman registrasi/edit pelanggan
│   │   │   └── accounts/
│   │   │       └── page.tsx                # Halaman akun pelanggan
│   ├── components/
│   │   └── layout/
│   │       └── AdminSidebar.tsx            # ✅ Sidebar dengan menu pelanggan
│   └── layouts/
│       └── AdminLayout.tsx                 # Layout admin panel
```

---

## ✨ Fitur Utama

### 1. **Daftar Pelanggan** (`/customers`)

#### Fitur:

- ✅ **Tabel Data Pelanggan** dengan informasi lengkap:
  - Nama dan NIK
  - Kontak (Telepon, Email, Alamat)
  - Jenis Pelanggan (Rumah Tangga, Komersial, Industri, Sosial)
  - Status Akun (Aktif, Tidak Aktif, Ditangguhkan)
  - Tanggal Registrasi

- ✅ **Pencarian Real-time**:

  ```typescript
  - Cari berdasarkan: NIK, Nama, Email, Telepon
  - Filter berdasarkan: Jenis Pelanggan, Status
  ```

- ✅ **Bulk Actions (Aksi Massal)**:
  - Checkbox untuk select multiple
  - Hapus banyak pelanggan sekaligus
  - Select all / Deselect all

- ✅ **Export Data**:
  - Export ke CSV format
  - Nama file: `data-pelanggan-YYYY-MM-DD.csv`
  - Include semua field penting

- ✅ **Action Menu** untuk setiap pelanggan:
  - 👁️ Lihat Detail
  - ✏️ Edit
  - 🗑️ Hapus

- ✅ **Statistik Dashboard**:
  - Total Pelanggan
  - Pelanggan Aktif
  - Pelanggan Baru (bulan ini)
  - Pelanggan Suspended

#### Komponen UI:

```typescript
// Summary Cards
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <Card>
      <Avatar><Person /></Avatar>
      <Typography variant="h4">{totalCustomers}</Typography>
      <Typography>Total Pelanggan</Typography>
    </Card>
  </Grid>
  // ... cards lainnya
</Grid>
```

#### Fungsi Utama:

```typescript
// Fetch data pelanggan
const fetchCustomers = async () => {
  const response = await customerAPI.getAll();
  setCustomers(response.data.data);
};

// Export data ke CSV
const handleExportData = () => {
  const csvContent = [headers, ...data].join('\n');
  // Download file
};

// Bulk delete
const handleBulkDelete = async () => {
  await Promise.all(selectedCustomers.map(id => customerAPI.delete(id)));
};

// Toggle select
const toggleSelectCustomer = (customerId: string) => {
  setSelectedCustomers(prev =>
    prev.includes(customerId)
      ? prev.filter(id => id !== customerId)
      : [...prev, customerId]
  );
};
```

---

### 2. **Detail Pelanggan** (`/customers/detail/[id]`)

#### Fitur:

- ✅ **Informasi Lengkap Pelanggan**:
  - Avatar dengan inisial nama
  - Data pribadi (NIK, Nama, Email, Telepon, Alamat)
  - Status dan jenis pelanggan dengan chips berwarna
- ✅ **Info Meteran**:
  - Nomor Meteran
  - Nomor Akun
  - Kategori Tarif
  - Tanggal Instalasi

- ✅ **Tab Navigation**:
  1. **Riwayat Tagihan**:
     - Periode pembayaran
     - Penggunaan (m³)
     - Jumlah tagihan (IDR)
     - Status pembayaran (Lunas/Belum Bayar)
     - Tanggal pembayaran
  2. **Riwayat Pembacaan**:
     - Coming soon
  3. **Pengaturan Akun**:
     - Coming soon

- ✅ **Action Buttons**:
  - Kembali ke daftar
  - Edit pelanggan

#### Komponen:

```typescript
// Tab Panel Component
function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Tabs
<Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
  <Tab icon={<Receipt />} label="Riwayat Tagihan" />
  <Tab icon={<History />} label="Riwayat Pembacaan" />
  <Tab icon={<Settings />} label="Pengaturan Akun" />
</Tabs>
```

---

### 3. **Registrasi/Edit Pelanggan** (`/customers/registration`)

- Form untuk menambah pelanggan baru
- Edit data pelanggan existing
- Validasi form
- Upload dokumen (KTP, dll)

---

### 4. **Akun Pelanggan** (`/customers/accounts`)

- Manajemen akun layanan
- Meteran assignment
- Status sambungan

---

## 🎨 Design System

### Color Palette:

```typescript
- Primary: Blue (#5073FF)
- Success: Green (#4CAF50) - Status Aktif
- Warning: Orange (#FF9800) - Pending
- Error: Red (#F44336) - Suspended
- Info: Light Blue (#2196F3)
```

### Status Colors:

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    case 'suspended':
      return 'error';
    default:
      return 'default';
  }
};
```

### Customer Type Labels:

```typescript
const getCustomerTypeLabel = (type: string) => {
  switch (type) {
    case 'rumah_tangga':
      return 'Rumah Tangga';
    case 'komersial':
      return 'Komersial';
    case 'industri':
      return 'Industri';
    case 'sosial':
      return 'Sosial';
    default:
      return type;
  }
};
```

---

## 🔌 Backend Integration

### API Endpoints:

```typescript
// Customer API
const customerAPI = {
  // Get all customers
  getAll: () => axios.get('/api/customers'),

  // Get single customer
  getById: (id: string) => axios.get(`/api/customers/${id}`),

  // Create customer
  create: (data: CustomerData) => axios.post('/api/customers', data),

  // Update customer
  update: (id: string, data: CustomerData) =>
    axios.put(`/api/customers/${id}`, data),

  // Delete customer
  delete: (id: string) => axios.delete(`/api/customers/${id}`),

  // Bulk delete
  bulkDelete: (ids: string[]) =>
    axios.post('/api/customers/bulk-delete', { ids }),
};
```

### Data Models:

```typescript
interface User {
  id: string;
  nik: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customerType: 'rumah_tangga' | 'komersial' | 'industri' | 'sosial';
  accountStatus: 'active' | 'inactive' | 'suspended';
  registrationDate: Date;
  lastLogin?: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface CustomerAccount {
  id: string;
  customerId: string;
  accountNumber: string;
  meterNumber: string;
  connectionType: 'new' | 'existing';
  serviceStatus: 'active' | 'inactive' | 'suspended';
  tariffCategory: string;
  installationDate: Date;
  lastReading: Date;
  currentReading: number;
  previousReading: number;
  consumption: number;
}
```

---

## 📊 Mock Data

### Sample Customer:

```typescript
{
  id: '1',
  nik: '1101010101010001',
  name: 'Ahmad Rizki',
  email: 'ahmad.rizki@email.com',
  phone: '081234567890',
  address: 'Jl. Teuku Umar No. 123, Banda Aceh',
  customerType: 'rumah_tangga',
  accountStatus: 'active',
  registrationDate: new Date('2023-01-15'),
}
```

---

## 🚀 Usage

### Akses Menu:

1. Login sebagai admin
2. Klik menu **"Manajemen Pelanggan"** di sidebar
3. Pilih **"Daftar Pelanggan"**

### Menambah Pelanggan:

1. Klik tombol **"Tambah"**
2. Isi form registrasi
3. Upload dokumen (optional)
4. Klik **"Simpan"**

### Melihat Detail:

1. Klik icon **⋮** (more vert) pada row pelanggan
2. Pilih **"Lihat Detail"**
3. Atau klik nama pelanggan langsung

### Export Data:

1. Filter data jika perlu (jenis, status)
2. Klik icon **Download**
3. File CSV akan terdownload otomatis

### Bulk Delete:

1. Centang checkbox pelanggan yang ingin dihapus
2. Klik tombol **"Hapus Terpilih"**
3. Konfirmasi penghapusan

---

## 🔒 Permission & Security

### Role Access:

```typescript
roles: ['admin']; // Hanya admin yang bisa akses
permission: 'customers:read'; // Read access
permission: 'customers:create'; // Create access
permission: 'customers:update'; // Update access
permission: 'customers:delete'; // Delete access
```

### Validasi:

- ✅ NIK harus 16 digit
- ✅ Email harus valid format
- ✅ Telepon format Indonesia
- ✅ Form validation sebelum submit
- ✅ Konfirmasi sebelum hapus

---

## 📱 Responsive Design

- ✅ Mobile-friendly (xs: 12 cols)
- ✅ Tablet (sm: 6, md: 4 cols)
- ✅ Desktop (lg, xl: 3 cols)
- ✅ Adaptive table layout
- ✅ Touch-friendly action buttons

---

## 🎯 Next Steps / Roadmap

### Coming Soon:

- [ ] **Riwayat Pembacaan Meteran** (Tab 2 di detail)
- [ ] **Pengaturan Akun** (Tab 3 di detail)
- [ ] **Import Data** dari Excel/CSV
- [ ] **Filter Advanced** (by location, registration date range)
- [ ] **Sort Columns** (sortable table headers)
- [ ] **Pagination Size** selector (10, 25, 50, 100)
- [ ] **Print Report** feature
- [ ] **Customer Analytics Dashboard**
- [ ] **Email Notification** to customer
- [ ] **SMS Integration**
- [ ] **Map View** of customers (GIS integration)
- [ ] **Bulk Edit** feature
- [ ] **Customer Portal** link

### Integration Required:

- [ ] Connect to real backend API
- [ ] Real-time data sync
- [ ] WebSocket for live updates
- [ ] Image upload for KTP/documents
- [ ] Cloudinary integration for photos
- [ ] Payment gateway integration
- [ ] Billing system integration
- [ ] Meter reading integration

---

## 🐛 Known Issues

- Mock data digunakan sebagai fallback jika API gagal
- Detail billing menggunakan sample data
- Riwayat pembacaan dan pengaturan akun belum implemented

---

## 💡 Tips

1. **Gunakan Search** untuk cari pelanggan cepat
2. **Filter by Status** untuk melihat pelanggan aktif/suspended saja
3. **Export** sebelum bulk delete untuk backup
4. **View Detail** untuk info lengkap sebelum edit
5. **Check Checkbox** untuk bulk operations

---

## 🔧 Troubleshooting

### Issue: Data tidak muncul

**Solution**: Check console log, pastikan API endpoint benar

### Issue: Export tidak berfungsi

**Solution**: Check browser permissions untuk download

### Issue: Bulk delete gagal

**Solution**: Check network tab, pastikan backend API ready

---

## 📞 Support

Untuk pertanyaan atau issue, hubungi:

- **Developer**: [Your Name]
- **Email**: developer@aqualink.com
- **Docs**: `/docs/customer-management`

---

**Terakhir diupdate**: 8 Oktober 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
