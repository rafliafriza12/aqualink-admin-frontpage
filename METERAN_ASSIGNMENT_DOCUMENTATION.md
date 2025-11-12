# Meteran Assignment Module Documentation

## Overview

Module ini memungkinkan admin untuk assign meteran dan kelompok pelanggan kepada pelanggan setelah RAB (Rencana Anggaran Biaya) selesai dibuat. Module ini merupakan langkah terakhir dalam workflow connection data sebelum menyelesaikan semua prosedur.

## Workflow Position

```
Customer Request → Admin Verify → Technician Verify → Create Survey → Create RAB → **Assign Meteran** → Complete Procedure
```

## Features

### 1. Create Meteran Page (`/operations/meteran/create`)

**Access**: Admin only

**Purpose**: Assign meteran number dan kelompok pelanggan ke connection data yang sudah memiliki RAB

**Form Fields**:

- **Nomor Meteran** (Required)
  - Input text field untuk nomor unik meteran
  - Example: `MTR-2024-0001`
  - Validation: Required, must be unique

- **Kelompok Pelanggan** (Required)
  - Dropdown select dari list KelompokPelanggan
  - Shows pricing info: harga <10m³, harga >10m³, biaya beban
  - Validation: Required

**Features**:

- Auto-populate userId dari connectionData
- Auto-link connectionDataId
- Real-time tarif preview saat pilih kelompok
- Shows NIK dan nama pelanggan di header
- Currency formatting untuk tarif (IDR)

**Validations**:

- Connection data harus exist
- RAB harus sudah dibuat (`rabConnectionId` must exist)
- Connection data harus verified (`isVerifiedByData`)
- Nomor meteran harus unique
- Kelompok pelanggan harus dipilih

**UI Components**:

- Informasi Meteran card
- Kelompok Pelanggan card dengan tarif preview
- Auto-formatted currency display
- Submit button dengan loading state

**API Endpoint**: `POST /api/meteran`
**Request Body**:

```json
{
  "connectionDataId": "connection_id",
  "userId": "user_id",
  "noMeteran": "MTR-2024-0001",
  "kelompokPelangganId": "kelompok_id"
}
```

**Success Behavior**:

- Shows success alert
- Auto-redirect ke connection detail page setelah 2 detik
- Updates connectionData.meteranId
- Updates user.meteranId dan user.isVerified = true

---

### 2. Meteran Detail Page (`/operations/meteran/[id]`)

**Access**: Admin only

**Purpose**: View detail meteran yang sudah di-assign termasuk tarif, pemakaian, dan info pelanggan

**Information Displayed**:

#### Informasi Meteran

- Nomor Meteran
- Status chip (Aktif)

#### Kelompok Pelanggan

- Nama Kelompok
- Tarif tier structure

#### Tarif & Biaya

- **Tarif Pemakaian < 10m³** (Success color box)
  - Currency formatted
- **Tarif Pemakaian > 10m³** (Warning color box)
  - Currency formatted
- **Biaya Beban Bulanan** (Info color box, jika ada)
  - Currency formatted

#### Informasi Pelanggan

- Nama Pelanggan
- No. HP

#### Pemakaian & Pembayaran

- Total Pemakaian (dalam m³)
- Pemakaian Belum Terbayar (dalam m³, red if > 0)
- Jatuh Tempo (jika ada)

#### Connection Data Terkait

- NIK
- Alamat
- Button "Lihat Connection Data" untuk navigate ke detail connection

#### Timestamps

- Dibuat Pada
- Terakhir Diperbarui

**API Endpoint**: `GET /api/meteran/:id`

**Features**:

- Fully populated data (kelompokPelanggan, user, connectionData)
- Color-coded pricing tiers
- Conditional rendering (biaya beban, jatuh tempo, connection data)
- Navigation to related connection data
- Currency formatting Indonesian Rupiah

---

### 3. Connection Detail Page Updates

**New Buttons Added**:

#### "Assign Meteran" Button

- **Visibility**: Admin only
- **Conditions**:
  - RAB exists (`rabConnectionId` is not null)
  - Meteran belum di-assign (`meteranId` is null)
- **Color**: Info (blue)
- **Icon**: Speed
- **Action**: Navigate to `/operations/meteran/create?connectionId={id}`

#### "Lihat Meteran" Button

- **Visibility**: All roles
- **Conditions**:
  - Meteran sudah di-assign (`meteranId` is not null)
- **Color**: Info (blue), outlined variant
- **Icon**: Speed
- **Action**: Navigate to `/operations/meteran/{meteranId}`

**Button Order in Workflow**:

1. Assign/Ubah Teknisi
2. Verifikasi Admin
3. Verifikasi Teknisi
4. Buat Survei
5. Lihat Survei
6. Buat RAB
7. Lihat RAB
8. **Assign Meteran** (NEW)
9. **Lihat Meteran** (NEW)
10. Selesaikan Semua Prosedur

---

## Backend Implementation

### Controller Updates (`meteranController.js`)

#### `createMeteran` Function Changes:

**Before**: Required `isAllProcedureDone` to be true
**After**:

- Check RAB exists instead
- Allow creation BEFORE completing all procedures
- Validate connection data exists
- Validate RAB exists (`rabConnectionId`)
- Check meteran doesn't exist for this connection
- Check meteran number is unique
- Save meteran with connectionDataId
- Update connectionData.meteranId
- Update user.meteranId and user.isVerified
- Return populated meteran

**New Validations**:

- RAB must exist: `if (!connectionData.rabConnectionId)`
- Unique per connection: `findOne({ connectionDataId })`
- Unique meter number: `findOne({ noMeteran })`

**Updated Fields**:

- Added `connectionDataId` to meteran save
- Added `connectionData.meteranId` update
- Added population: kelompokPelangganId, userId, connectionDataId

#### `getMeteranById` Function Changes:

- Added `connectionDataId` population
- Changed phone field to `noHp` for consistency
- Returns NIK and alamat from connectionData

#### `getAllMeteran` Function Changes:

- Added `connectionDataId` population
- Changed phone field to `noHp`

### ConnectionData Controller Updates

Added `.populate("meteranId")` to all populate chains:

- `getConnectionDataByUser`
- `getAllConnectionData`
- `getConnectionDataById`

**Purpose**: Ensure meteranId is populated when fetching connection data

---

## Frontend Implementation

### New Files Created:

1. **`app/(pages)/operations/meteran/create/page.tsx`** (410 lines)
   - Create meteran form
   - Kelompok pelanggan dropdown with pricing preview
   - Currency formatting utilities
   - Form validation
   - Success/error handling

2. **`app/(pages)/operations/meteran/[id]/page.tsx`** (500+ lines)
   - Detail view with all meteran information
   - Color-coded pricing tiers
   - Usage and payment tracking
   - Related connection data navigation
   - Comprehensive information cards

### Modified Files:

1. **`app/(pages)/operations/connection-data/[id]/page.tsx`**
   - Added Speed icon import
   - Added "Assign Meteran" button (admin, if RAB exists, no meteran)
   - Added "Lihat Meteran" button (if meteran exists)
   - Updated workflow button ordering

---

## Data Model

### Meteran Schema:

```javascript
{
  noMeteran: String (required, unique),
  kelompokPelangganId: ObjectId (required, ref: KelompokPelanggan),
  userId: ObjectId (required, ref: User),
  connectionDataId: ObjectId (optional, ref: ConnectionData),
  totalPemakaian: Number (default: 0),
  pemakaianBelumTerbayar: Number (default: 0),
  jatuhTempo: Date (optional),
  timestamps: true
}
```

### KelompokPelanggan Schema:

```javascript
{
  namaKelompok: String (e.g., "Rumah Tangga", "Komersial"),
  hargaPenggunaanDibawah10: Number (price per m³ if < 10m³),
  hargaPenggunaanDiatas10: Number (price per m³ if >= 10m³),
  biayaBeban: Number (fixed monthly cost, optional)
}
```

### ConnectionData Updates:

```javascript
{
  // ... existing fields
  meteranId: ObjectId (ref: Meteran),
}
```

---

## Usage Flow

### Complete Workflow:

1. Customer submits connection request
2. Admin verifies data (`isVerifiedByData`)
3. Admin assigns technician
4. Technician verifies on-site (`isVerifiedByTechnician`)
5. Technician creates survey with photos and GPS
6. Technician creates RAB with budget estimate and PDF
7. **Admin assigns meteran number and kelompok pelanggan** ← NEW
8. Admin marks all procedures complete

### Meteran Assignment Process:

1. Admin navigates to connection detail page
2. Verifies RAB has been created
3. Clicks "Assign Meteran" button
4. Enters unique meter number
5. Selects customer group from dropdown
6. Reviews pricing preview
7. Submits form
8. System:
   - Creates meteran record
   - Links to connectionData and user
   - Updates user.isVerified = true
   - Updates connectionData.meteranId
9. Admin redirected to connection detail
10. "Lihat Meteran" button now available

---

## API Endpoints

### Meteran Endpoints:

- `POST /api/meteran` - Create meteran (Admin)
- `GET /api/meteran` - Get all meteran (Admin)
- `GET /api/meteran/:id` - Get meteran by ID (Admin)
- `PUT /api/meteran/:id` - Update meteran (Admin)
- `DELETE /api/meteran/:id` - Delete meteran (Admin)

### Related Endpoints:

- `GET /api/kelompok-pelanggan` - Get customer groups for dropdown
- `GET /api/connection-data/:id` - Get connection with meteranId populated

---

## UI/UX Features

### Currency Formatting:

```javascript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
```

**Output**: Rp 5.000 (with dots as thousand separators)

### Color Coding:

- **Success**: Tarif <10m³ (green box)
- **Warning**: Tarif >10m³ (orange box)
- **Info**: Biaya Beban (blue box)
- **Error**: Pemakaian Belum Terbayar > 0 (red text)
- **Primary**: Total Pemakaian (blue text)

### Responsive Design:

- Grid layout: 12 columns on mobile, 6 on tablet, 4 on desktop
- Card-based information structure
- Icon-enhanced sections
- Button groups with proper spacing

---

## Validation Rules

### Frontend Validation:

- Nomor meteran: Required, not empty
- Kelompok pelanggan: Required, must select one

### Backend Validation:

1. Connection data must exist
2. RAB must be created (`rabConnectionId` not null)
3. Connection must be verified (`isVerifiedByData`)
4. Meteran number must be unique globally
5. No existing meteran for this connection data
6. Kelompok pelanggan must exist

### Error Messages:

- "Connection data not found"
- "RAB must be created first"
- "Meteran already exists for this connection data"
- "Meteran number already exists"
- "Nomor meteran wajib diisi"
- "Kelompok pelanggan wajib dipilih"

---

## Testing Checklist

### Create Meteran:

- [ ] Admin can access create page
- [ ] Non-admin cannot access (redirect/error)
- [ ] Form loads with connection info
- [ ] Kelompok dropdown populated
- [ ] Currency formatted correctly in dropdown
- [ ] Tarif preview shows when kelompok selected
- [ ] Cannot submit without meter number
- [ ] Cannot submit without kelompok
- [ ] Cannot create if RAB doesn't exist
- [ ] Cannot create duplicate meter number
- [ ] Success redirects to connection detail
- [ ] connectionData.meteranId updated
- [ ] user.meteranId updated
- [ ] user.isVerified set to true

### View Meteran Detail:

- [ ] All information displays correctly
- [ ] Currency formatted properly
- [ ] Color coding applied to pricing tiers
- [ ] Usage statistics visible
- [ ] Connection data link works
- [ ] Timestamps formatted correctly
- [ ] Back button works
- [ ] Conditional fields (biaya beban, jatuh tempo) work

### Connection Detail Updates:

- [ ] "Assign Meteran" button shows for admin when RAB exists and no meteran
- [ ] "Assign Meteran" button hidden if meteran exists
- [ ] "Lihat Meteran" button shows when meteran exists
- [ ] Navigation to create page works with correct connectionId
- [ ] Navigation to detail page works with correct meteranId
- [ ] Button ordering correct in workflow

### Backend:

- [ ] POST /meteran creates record successfully
- [ ] Validations work (RAB exists, unique number, etc.)
- [ ] Population works (kelompok, user, connectionData)
- [ ] GET /meteran/:id returns full data
- [ ] connectionData populate includes meteranId
- [ ] User updates applied correctly

---

## Future Enhancements

### Potential Features:

1. **Bulk Meteran Assignment**
   - Upload CSV with meter numbers
   - Batch assign to multiple customers

2. **Meteran Status Management**
   - Active/Inactive toggle
   - Maintenance mode
   - Replacement history

3. **Usage Tracking Integration**
   - Real-time meter reading input
   - Usage history graph
   - Billing calculation preview

4. **Kelompok Migration**
   - Move customer to different kelompok
   - Historical tracking of kelompok changes

5. **QR Code Generation**
   - Generate QR for each meter
   - Quick access to meter details via scan

6. **Notifications**
   - Alert when meter assigned
   - SMS/email to customer with meter number

---

## Files Modified/Created

### New Files:

- `aqualink-admin-frontpage/app/(pages)/operations/meteran/create/page.tsx`
- `aqualink-admin-frontpage/app/(pages)/operations/meteran/[id]/page.tsx`
- `aqualink-admin-frontpage/METERAN_ASSIGNMENT_DOCUMENTATION.md`

### Modified Files:

- `aqualink-admin-frontpage/app/(pages)/operations/connection-data/[id]/page.tsx`
- `aqualink-backend/controllers/meteranController.js`
- `aqualink-backend/controllers/connectionDataController.js`

### Total Lines Added: ~950+ lines

### Total Files Modified: 5 files

---

## Conclusion

Module meteran assignment sekarang fully integrated dalam workflow connection data. Admin dapat:

1. Assign meteran number yang unique
2. Pilih kelompok pelanggan dengan tarif yang sesuai
3. Preview tarif sebelum submit
4. View complete meteran details dengan pricing dan usage info
5. Navigate seamlessly antara connection, RAB, dan meteran

Module ini merupakan langkah final sebelum menyelesaikan semua prosedur installation, dan memastikan customer memiliki meteran yang di-link ke kelompok pelanggan untuk billing purposes.
