# 🔧 FIX: Data Meteran & History Tidak Tampil

## Tanggal: 8 Oktober 2025

---

## 🐛 Problem

User melaporkan bahwa **data meteran dan history tidak tampil** di halaman detail pelanggan, padahal customer sudah memiliki meteran yang terpasang.

---

## 🔍 Root Cause Analysis

### 1. **Field Name Mismatch**

❌ **Problem**: Frontend mencari field `meterNumber`, tapi backend mengirim `noMeteran`

**Backend Model (Meteran.js)**:

```javascript
noMeteran: {
  type: String,
  required: true,
}
```

**Frontend (sebelum fix)**:

```typescript
meterNumber: customerData.meteranId.meterNumber || 'N/A'; // ❌ WRONG!
```

### 2. **Incomplete Data Mapping**

❌ **Problem**: Frontend tidak mengambil semua field penting dari meteran:

- `totalPemakaian` - total usage
- `pemakaianBelumTerbayar` - unpaid usage
- `jatuhTempo` - due date

### 3. **No Billing Data Fetch**

❌ **Problem**: Billing history tidak di-fetch dari API, masih hardcoded empty array:

```typescript
billings: [], // TODO: Fetch from billing API
```

### 4. **Insufficient Logging**

❌ **Problem**: Kurang logging untuk debug, sehingga sulit identify masalah

---

## ✅ Solutions Implemented

### 1. **Fix Field Name Mapping**

**Before**:

```typescript
meteran: customerData.meteranId ? {
  meterNumber: customerData.meteranId.meterNumber || 'N/A',  // ❌
  accountNumber: customerData.meteranId.accountNumber || 'N/A',  // ❌
  tariffCategory: customerData.meteranId.kelompokPelangganId?.tarif || 'N/A',
  installationDate: ...
} : null
```

**After** ✅:

```typescript
meteran: customerData.meteranId
  ? {
      meterNumber: customerData.meteranId.noMeteran || 'N/A', // ✅ CORRECT
      accountNumber: customerData.meteranId._id || 'N/A', // ✅ Use _id
      tariffCategory:
        customerData.meteranId.kelompokPelangganId?.namaKelompok ||
        customerData.meteranId.kelompokPelangganId?.tarif ||
        'N/A',
      installationDate: customerData.meteranId.createdAt
        ? new Date(customerData.meteranId.createdAt)
        : null,
      totalUsage: customerData.meteranId.totalPemakaian || 0, // ✅ NEW
      unpaidUsage: customerData.meteranId.pemakaianBelumTerbayar || 0, // ✅ NEW
      dueDate: customerData.meteranId.jatuhTempo // ✅ NEW
        ? new Date(customerData.meteranId.jatuhTempo)
        : null,
    }
  : null;
```

### 2. **Enhanced Logging**

Added comprehensive console logging:

```typescript
console.log('🔄 Fetching customer detail for ID:', customerId);
console.log('✅ Customer detail response:', response);
console.log('📊 Customer data:', response.data.data);
console.log('⚙️ Meteran data:', response.data.data?.meteranId);

if (customerData.meteranId) {
  console.log('✅ Meteran exists:', customerData.meteranId);
  console.log('✅ Mapped meteran:', mappedCustomer.meteran);
} else {
  console.warn('⚠️ No meteran data found for this customer');
}
```

### 3. **Implement Billing History Fetch**

Created `fetchBillingHistory()` function:

```typescript
const fetchBillingHistory = async () => {
  try {
    setLoadingBillings(true);
    console.log('🔄 Fetching billing history for customer:', customerId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/billing/user/${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Billing data:', data);

      if (data.success && data.data) {
        const mappedBillings = data.data.map((bill: any) => ({
          id: bill._id,
          period: bill.periode,
          usage: bill.totalPemakaian,
          amount: bill.totalTagihan,
          status: bill.isPaid ? 'paid' : 'unpaid',
          paidDate: bill.paidAt ? new Date(bill.paidAt) : null,
          biayaAir: bill.biayaAir,
          biayaBeban: bill.biayaBeban,
          pemakaianAwal: bill.pemakaianAwal,
          pemakaianAkhir: bill.pemakaianAkhir,
        }));

        setBillings(mappedBillings);
      }
    }
  } catch (error: any) {
    console.error('❌ Error fetching billing history:', error);
  } finally {
    setLoadingBillings(false);
  }
};
```

Auto-fetch when tab is opened:

```typescript
useEffect(() => {
  if (customer?.meteran && tabValue === 0) {
    fetchBillingHistory();
  }
}, [customer, tabValue]);
```

### 4. **Enhanced Meteran Display**

**Before** - Simple list:

```tsx
<Box>
  <Typography>No. Meteran</Typography>
  <Typography>{customer.meteran.meterNumber}</Typography>
</Box>
```

**After** ✅ - Rich information display:

```tsx
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
  {/* No. Meteran */}
  <Box>
    <Typography variant='caption' color='text.secondary'>
      No. Meteran
    </Typography>
    <Typography variant='body1' sx={{ fontWeight: 600 }}>
      {customer.meteran.meterNumber}
    </Typography>
  </Box>

  {/* ID Meteran (monospace) */}
  <Box>
    <Typography variant='caption' color='text.secondary'>
      ID Meteran
    </Typography>
    <Typography
      variant='body2'
      sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
    >
      {customer.meteran.accountNumber}
    </Typography>
  </Box>

  <Divider />

  {/* Kategori Tarif (Chip) */}
  <Box>
    <Typography variant='caption' color='text.secondary'>
      Kategori Tarif
    </Typography>
    <Chip
      label={customer.meteran.tariffCategory}
      size='small'
      color='primary'
    />
  </Box>

  {/* Total Pemakaian */}
  <Box>
    <Typography variant='caption' color='text.secondary'>
      Total Pemakaian
    </Typography>
    <Typography variant='body1' sx={{ fontWeight: 600, color: 'primary.main' }}>
      {customer.meteran.totalUsage || 0} m³
    </Typography>
  </Box>

  {/* Belum Terbayar (conditional) */}
  {customer.meteran.unpaidUsage > 0 && (
    <Box>
      <Typography variant='caption' color='text.secondary'>
        Belum Terbayar
      </Typography>
      <Typography
        variant='body1'
        sx={{ fontWeight: 600, color: 'warning.main' }}
      >
        {customer.meteran.unpaidUsage} m³
      </Typography>
    </Box>
  )}

  {/* Jatuh Tempo (with color indicator) */}
  {customer.meteran.dueDate && (
    <Box>
      <Typography variant='caption' color='text.secondary'>
        Jatuh Tempo
      </Typography>
      <Typography
        variant='body1'
        color={
          new Date(customer.meteran.dueDate) < new Date()
            ? 'error.main'
            : 'text.primary'
        }
      >
        {new Date(customer.meteran.dueDate).toLocaleDateString('id-ID')}
      </Typography>
    </Box>
  )}

  <Divider />

  {/* Tanggal Instalasi */}
  <Box>
    <Typography variant='caption' color='text.secondary'>
      Tgl. Instalasi
    </Typography>
    <Typography variant='body2'>
      {customer.meteran.installationDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </Typography>
  </Box>
</Box>
```

### 5. **Enhanced Billing History Table**

**Before** - Simple 5 columns:

- Periode
- Penggunaan
- Tagihan
- Status
- Tanggal Bayar

**After** ✅ - Complete 9 columns:

- Periode (bold)
- Pemakaian Awal (m³)
- Pemakaian Akhir (m³)
- Total (m³) - primary color, bold
- Biaya Air (Rupiah)
- Biaya Beban (Rupiah)
- Total Tagihan (Rupiah, bold)
- Status (Chip: success/warning)
- Tanggal Bayar (formatted)

**Loading & Empty States**:

```tsx
{
  loadingBillings ? (
    <Box display='flex' justifyContent='center' py={4}>
      <CircularProgress />
    </Box>
  ) : billings.length > 0 ? (
    <TableContainer>{/* Table content */}</TableContainer>
  ) : (
    <Alert severity='info'>
      {customer.meteran
        ? 'Belum ada riwayat tagihan untuk meteran ini'
        : 'Pelanggan belum memiliki meteran'}
    </Alert>
  );
}
```

---

## 📊 Data Flow

### Customer Detail Flow:

```
1. User opens /customers/detail/[id]
   ↓
2. useEffect triggers fetchCustomerDetail()
   ↓
3. API Call: GET /admin/customers/:id
   ↓
4. Backend populates meteranId with kelompokPelangganId
   ↓
5. Frontend maps response data:
   - fullName → name
   - noMeteran → meterNumber
   - totalPemakaian → totalUsage
   - pemakaianBelumTerbayar → unpaidUsage
   - jatuhTempo → dueDate
   ↓
6. Display customer info + meteran card
```

### Billing History Flow:

```
1. Customer data loaded + Tab 0 selected
   ↓
2. useEffect triggers fetchBillingHistory()
   ↓
3. API Call: GET /billing/user/:userId
   ↓
4. Backend returns array of billing records
   ↓
5. Frontend maps billing data:
   - periode → period
   - totalPemakaian → usage
   - totalTagihan → amount
   - isPaid → status
   - paidAt → paidDate
   ↓
6. Display in enhanced table with 9 columns
```

---

## 🧪 Testing Steps

### 1. Test Meteran Display

```bash
# 1. Login sebagai admin
# 2. Buka http://localhost:3000/customers
# 3. Pilih customer yang sudah punya meteran
# 4. Klik "View Detail"
# 5. Check browser console (F12)
#    - Look for: "⚙️ Meteran data:"
#    - Should show: { noMeteran: "...", totalPemakaian: ..., ... }
# 6. Verify Meteran Info Card shows:
#    ✅ No. Meteran
#    ✅ ID Meteran (monospace)
#    ✅ Kategori Tarif (chip)
#    ✅ Total Pemakaian (m³)
#    ✅ Belum Terbayar (if > 0)
#    ✅ Jatuh Tempo (red if overdue)
#    ✅ Tgl. Instalasi
```

### 2. Test Billing History

```bash
# 1. From customer detail page
# 2. Check console for: "🔄 Fetching billing history..."
# 3. Verify "Riwayat Tagihan" tab shows table with:
#    ✅ Periode (bold)
#    ✅ Pemakaian Awal
#    ✅ Pemakaian Akhir
#    ✅ Total (m³, blue, bold)
#    ✅ Biaya Air (Rp formatted)
#    ✅ Biaya Beban (Rp formatted)
#    ✅ Total Tagihan (Rp, bold)
#    ✅ Status (green "Lunas" or orange "Belum Bayar")
#    ✅ Tanggal Bayar
# 4. If no billing data:
#    ✅ Should show info alert
```

### 3. Test Edge Cases

```bash
# Case 1: Customer without meteran
# - Should show: "Belum ada meteran terpasang"

# Case 2: Customer with meteran but no billing
# - Meteran card should show
# - Billing tab should show: "Belum ada riwayat tagihan"

# Case 3: Overdue payment
# - Jatuh Tempo should be RED color

# Case 4: Unpaid usage
# - "Belum Terbayar" should show in WARNING color
```

---

## 🔗 Backend Model Reference

### Meteran Model

```javascript
{
  noMeteran: String,  // ✅ Use this, not meterNumber
  kelompokPelangganId: ObjectId,  // Tariff category
  totalPemakaian: Number,  // Total usage in m³
  pemakaianBelumTerbayar: Number,  // Unpaid usage
  jatuhTempo: Date,  // Due date
  userId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Billing Model

```javascript
{
  userId: ObjectId,
  meteranId: ObjectId,
  periode: String,  // "YYYY-MM"
  pemakaianAwal: Number,  // Start reading
  pemakaianAkhir: Number,  // End reading
  totalPemakaian: Number,  // Usage (m³)
  biayaAir: Number,  // Water cost
  biayaBeban: Number,  // Fixed cost
  totalTagihan: Number,  // Total bill
  isPaid: Boolean,
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📝 Console Output Example

### Success Case:

```
🔄 Fetching customer detail for ID: 507f1f77bcf86cd799439011
✅ Customer detail response: { status: 200, success: true, ... }
📊 Customer data: { _id: "...", fullName: "Ahmad Rizki", ... }
⚙️ Meteran data: {
  _id: "...",
  noMeteran: "MTR-001-2024",
  totalPemakaian: 1250,
  pemakaianBelumTerbayar: 50,
  jatuhTempo: "2024-01-15T00:00:00.000Z",
  kelompokPelangganId: {
    namaKelompok: "Rumah Tangga A",
    tarif: 2500
  }
}
✅ Meteran exists: { ... }
✅ Mapped meteran: {
  meterNumber: "MTR-001-2024",
  accountNumber: "507f...",
  tariffCategory: "Rumah Tangga A",
  totalUsage: 1250,
  unpaidUsage: 50,
  dueDate: Date(...)
}
🔄 Fetching billing history for customer: 507f1f77bcf86cd799439011
✅ Billing data: { success: true, data: [...] }
✅ Mapped billings: [
  {
    period: "2024-01",
    usage: 50,
    amount: 250000,
    status: "paid",
    biayaAir: 200000,
    biayaBeban: 50000,
    ...
  }
]
```

### No Meteran Case:

```
🔄 Fetching customer detail for ID: 507f1f77bcf86cd799439011
✅ Customer detail response: { ... }
📊 Customer data: { meteranId: null }
⚙️ Meteran data: null
⚠️ No meteran data found for this customer
```

---

## 🎯 Key Changes Summary

| Area                  | Before            | After                         |
| --------------------- | ----------------- | ----------------------------- |
| **Field Mapping**     | `meterNumber` ❌  | `noMeteran` ✅                |
| **Data Completeness** | Basic 4 fields    | Full 7 fields ✅              |
| **Billing Fetch**     | Hardcoded `[]` ❌ | Real API call ✅              |
| **Logging**           | Minimal           | Comprehensive ✅              |
| **Meteran Display**   | Simple list       | Rich card with colors ✅      |
| **Billing Table**     | 5 columns         | 9 columns detailed ✅         |
| **Loading States**    | None ❌           | Proper loading UI ✅          |
| **Empty States**      | Generic           | Context-aware ✅              |
| **Error Handling**    | Basic             | Enhanced with console logs ✅ |

---

## ✅ Status

**FIXED** ✅ - Data meteran dan billing history sekarang tampil dengan lengkap!

### What's Working Now:

- ✅ Meteran data fetched and displayed correctly
- ✅ All meteran fields shown (usage, unpaid, due date, etc)
- ✅ Billing history fetched from API
- ✅ Enhanced table with 9 columns
- ✅ Proper loading states
- ✅ Context-aware empty states
- ✅ Color-coded UI (overdue = red, unpaid = orange)
- ✅ Comprehensive console logging for debugging

### Next Steps (Optional Enhancements):

- ⏳ Add pagination for billing history (if > 10 records)
- ⏳ Add filter by period (bulan/tahun)
- ⏳ Add export to PDF button for billing
- ⏳ Add chart visualization for usage trend
- ⏳ Implement riwayat pembacaan tab (meter readings)

---

**Last Updated**: 8 Oktober 2025
**Status**: ✅ RESOLVED
