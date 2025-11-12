# 🔧 Backend Integration Fix - Management Pelanggan

## ✅ File yang Sudah Dibuat/Diperbaiki:

### Backend:

1. **`/backend/controllers/adminCustomerController.js`** ✅ BARU
   - `getAllCustomers` - Get all dengan pagination & filter
   - `getCustomerById` - Get by ID dengan populate
   - `createCustomer` - Create customer baru
   - `updateCustomer` - Update customer
   - `deleteCustomer` - Delete customer
   - `getCustomerStats` - Get statistics

2. **`/backend/routes/adminCustomerRoutes.js`** ✅ BARU
   - `GET /admin/customers` - List all
   - `GET /admin/customers/stats` - Statistics
   - `GET /admin/customers/:id` - Get by ID
   - `POST /admin/customers` - Create
   - `PUT /admin/customers/:id` - Update
   - `DELETE /admin/customers/:id` - Delete

3. **`/backend/models/User.js`** ✅ UPDATED
   - Added: `nik` (String, unique)
   - Added: `address` (String)
   - Added: `customerType` (enum: rumah_tangga, komersial, industri, sosial)
   - Added: `accountStatus` (enum: active, inactive, suspended)
   - Added: `gender` (enum: L, P)
   - Added: `birthDate` (Date)
   - Added: `occupation` (String)
   - Added: `location` (Object: latitude, longitude, address)

4. **`/backend/server.js`** ✅ UPDATED
   - Import: `adminCustomerRoutes`
   - Route: `app.use("/admin/customers", adminCustomerRouter)`

### Frontend:

5. **`/admin-frontpage/app/(pages)/customers/page.tsx`** ✅ UPDATED
   - Added: Console logging untuk debugging
   - Added: Proper error handling
   - Added: Data mapping (fullName → name, \_id → id)
   - Fixed: Summary cards display data
   - Fixed: Table cells display all customer info

6. **`/admin-frontpage/app/utils/API.ts`** ✅ ALREADY EXISTS
   - `customerAPI.getAll()` ✅
   - `customerAPI.getById(id)` ✅
   - `customerAPI.create(data)` ✅
   - `customerAPI.update(id, data)` ✅
   - `customerAPI.delete(id)` ✅
   - `customerAPI.getStats()` ✅

---

## 🔍 Debugging Steps:

### 1. Cek Console Browser:

Buka browser console (F12) dan lihat output:

```
🔄 Fetching customers from API...
API URL: http://localhost:5000/admin/customers
✅ API Response: {...}
Response data: {...}
✅ Mapped customers: X customers
```

### 2. Cek Backend Running:

```bash
cd /home/whoami/aqualink/aqualink-backend
yarn start
```

Expected output:

```
Server running on port 5000
Pinged your deployment. You successfully connected to MongoDB!
```

### 3. Test API Directly:

```bash
curl http://localhost:5000/admin/customers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected response:

```json
{
  "status": 200,
  "success": true,
  "message": "Data pelanggan berhasil diambil",
  "data": [...],
  "pagination": {...},
  "stats": {...}
}
```

---

## 🚨 Common Issues & Solutions:

### Issue 1: "Gagal memuat data pelanggan"

**Causes:**

- Backend server not running
- Admin token not saved in localStorage
- CORS issue
- Wrong BASE_URL

**Solutions:**

```bash
# 1. Check backend server
cd /home/whoami/aqualink/aqualink-backend
yarn start

# 2. Check admin token
# Browser console:
localStorage.getItem('admin_token')

# 3. Check BASE_URL
# Check .env.local:
NEXT_PUBLIC_BASE_URL=http://localhost:5000
```

### Issue 2: 401 Unauthorized

**Cause:** Admin token tidak ada atau expired

**Solution:**

1. Login ulang di `/auth/login`
2. Token akan tersimpan otomatis
3. Refresh halaman customers

### Issue 3: 404 Not Found

**Cause:** Route belum terdaftar di server.js

**Solution:**
Pastikan di `server.js` ada:

```javascript
import adminCustomerRouter from './routes/adminCustomerRoutes.js';
app.use('/admin/customers', adminCustomerRouter);
```

### Issue 4: Data kosong tapi API sukses

**Cause:** Database belum ada data customer

**Solution:**
Buat customer baru melalui `/customers/registration` atau insert manual:

```javascript
db.users.insertOne({
  nik: '1101010101010001',
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '081234567890',
  address: 'Jl. Test No. 123',
  customerType: 'rumah_tangga',
  accountStatus: 'active',
  isVerified: false,
});
```

---

## 📋 Checklist Sebelum Test:

- [ ] Backend server running (`yarn start`)
- [ ] MongoDB connected (cek console log)
- [ ] Admin login sudah dilakukan
- [ ] Admin token tersimpan di localStorage
- [ ] BASE_URL di `.env.local` benar
- [ ] Routes sudah dimount di `server.js`
- [ ] Browser console terbuka untuk debugging

---

## 🧪 Manual Testing Steps:

### Step 1: Start Backend

```bash
cd /home/whoami/aqualink/aqualink-backend
yarn start
```

Wait for:

```
✅ Pinged your deployment. You successfully connected to MongoDB!
✅ Server running on port 5000
```

### Step 2: Start Frontend

```bash
cd /home/whoami/aqualink/aqualink-admin-frontpage
yarn dev
```

### Step 3: Login Admin

1. Open http://localhost:3000/auth/login
2. Login dengan credentials admin
3. Cek localStorage ada `admin_token`

### Step 4: Test Customers Page

1. Navigate ke http://localhost:3000/customers
2. Buka browser console (F12)
3. Lihat log:
   - `🔄 Fetching customers...`
   - `✅ API Response:`
   - `✅ Mapped customers: X customers`

### Step 5: Verify Display

- [ ] Summary cards show numbers
- [ ] Table displays customer data
- [ ] Search works
- [ ] Filters work
- [ ] Export button works
- [ ] Actions (View, Edit, Delete) work

---

## 🔗 API Endpoints Reference:

| Method | Endpoint                 | Description        | Auth     |
| ------ | ------------------------ | ------------------ | -------- |
| GET    | `/admin/customers`       | Get all customers  | Required |
| GET    | `/admin/customers/stats` | Get statistics     | Required |
| GET    | `/admin/customers/:id`   | Get customer by ID | Required |
| POST   | `/admin/customers`       | Create customer    | Required |
| PUT    | `/admin/customers/:id`   | Update customer    | Required |
| DELETE | `/admin/customers/:id`   | Delete customer    | Required |

### Query Parameters for GET /admin/customers:

```typescript
{
  page?: number,          // default: 1
  limit?: number,         // default: 10
  search?: string,        // search in name, email, phone, nik
  customerType?: string,  // rumah_tangga | komersial | industri | sosial | all
  accountStatus?: string, // active | inactive | suspended | all
  sortBy?: string,        // default: createdAt
  sortOrder?: string      // asc | desc
}
```

### Response Format:

```typescript
{
  status: 200,
  success: true,
  message: string,
  data: User[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  stats: {
    totalCustomers: number,
    activeCustomers: number,
    inactiveCustomers: number,
    suspendedCustomers: number,
    newThisMonth: number
  }
}
```

---

## 🎯 Next Steps:

1. **Start both servers** (backend & frontend)
2. **Login as admin**
3. **Open customers page**
4. **Check browser console** for logs
5. **Verify data displays correctly**
6. **Test all CRUD operations**
7. **Test pagination & filters**
8. **Test export functionality**

---

## 📞 Troubleshooting Contact:

Jika masih ada masalah:

1. Screenshot error di console
2. Screenshot network tab (F12 → Network)
3. Copy error log dari terminal backend
4. Kirim ke developer

---

**Status**: ✅ Backend & Frontend Integration COMPLETE
**Last Updated**: 8 Oktober 2025
