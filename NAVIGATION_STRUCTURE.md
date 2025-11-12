# 🗺️ Struktur Navigasi Admin Panel - Management Pelanggan

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN SIDEBAR MENU                          │
└─────────────────────────────────────────────────────────────────┘

📊 Dashboard                          → /dashboard

👥 Manajemen Pelanggan               [EXPANDABLE]
   │
   ├─ 📋 Daftar Pelanggan            → /customers
   │     │
   │     ├─ Features:
   │     │  ✅ Search & Filter
   │     │  ✅ Bulk Actions
   │     │  ✅ Export CSV
   │     │  ✅ Pagination
   │     │
   │     └─ Actions:
   │        ├─ View Detail          → /customers/detail/[id]
   │        ├─ Edit Customer        → /customers/registration?edit=[id]
   │        └─ Delete Customer
   │
   ├─ ➕ Registrasi Baru             → /customers/registration
   │     │
   │     └─ Features:
   │        ✅ Form Input
   │        ✅ Validation
   │        ✅ Upload Documents
   │
   └─ 👤 Akun Pelanggan              → /customers/accounts
         │
         └─ Features:
            ✅ Service Accounts
            ✅ Meter Assignment
            ✅ Connection Status

💰 Penagihan & Keuangan              [EXPANDABLE]
🔧 Operasi Lapangan                  [EXPANDABLE]
📊 Monitoring                        [EXPANDABLE]
💾 Master Data                       [EXPANDABLE]
📈 Laporan & Analitik                [EXPANDABLE]
⚙️  Sistem                           [EXPANDABLE]
```

---

## 📂 File Structure & Routing

```
app/(pages)/customers/
│
├── page.tsx                          ✅ /customers
│   └── CustomerManagement Component
│       ├── Dashboard Cards (4)
│       ├── Search & Filter Bar
│       ├── Data Table
│       ├── Bulk Actions
│       └── Export Function
│
├── detail/[id]/
│   └── page.tsx                      ✅ /customers/detail/[id]
│       └── CustomerDetail Component
│           ├── Customer Info Card
│           ├── Meter Info
│           └── Tabs:
│               ├── Riwayat Tagihan
│               ├── Riwayat Pembacaan
│               └── Pengaturan Akun
│
├── registration/
│   └── page.tsx                      ✅ /customers/registration
│       └── CustomerRegistration Component
│           ├── Personal Info Form
│           ├── Contact Info Form
│           ├── Document Upload
│           └── Submit Button
│
└── accounts/
    └── page.tsx                      ✅ /customers/accounts
        └── CustomerAccounts Component
            ├── Account List
            ├── Meter Assignment
            └── Service Status
```

---

## 🔄 User Flow Diagram

```
┌─────────────┐
│ Admin Login │
└──────┬──────┘
       │
       v
┌─────────────────────┐
│   Admin Dashboard   │
└──────┬──────────────┘
       │
       v
┌─────────────────────────────────────────────┐
│  Sidebar: Manajemen Pelanggan (Click)      │
└──────┬──────────────────────────────────────┘
       │
       v
┌─────────────────────────────────────────────┐
│  Submenu Expands                            │
├─────────────────────────────────────────────┤
│  • Daftar Pelanggan                         │
│  • Registrasi Baru                          │
│  • Akun Pelanggan                           │
└──────┬──────────────────────────────────────┘
       │
       ├──────────────────────┐
       │                      │
       v                      v
┌──────────────┐      ┌──────────────┐
│ Daftar       │      │ Registrasi   │
│ Pelanggan    │      │ Baru         │
└──────┬───────┘      └──────────────┘
       │
       ├─────────────┬──────────────┐
       │             │              │
       v             v              v
┌──────────┐  ┌──────────┐  ┌──────────┐
│ View     │  │ Edit     │  │ Delete   │
│ Detail   │  │ Customer │  │ Customer │
└──────────┘  └──────────┘  └──────────┘
```

---

## 🎯 Component Hierarchy

```
AdminLayout
│
├── AdminSidebar
│   ├── Logo
│   ├── Menu Items
│   │   └── Manajemen Pelanggan
│   │       ├── Daftar Pelanggan      [Active Highlight]
│   │       ├── Registrasi Baru
│   │       └── Akun Pelanggan
│   └── User Profile
│
├── AdminHeader
│   ├── Hamburger Menu
│   ├── Breadcrumb
│   └── User Menu
│
└── Main Content Area
    │
    └── CustomerManagement (/customers)
        │
        ├── Summary Cards
        │   ├── Total Pelanggan
        │   ├── Pelanggan Aktif
        │   ├── Pelanggan Baru
        │   └── Pelanggan Suspended
        │
        ├── Filter Bar
        │   ├── Search Input
        │   ├── Filter Jenis
        │   ├── Filter Status
        │   └── Action Buttons
        │       ├── Tambah
        │       ├── Export
        │       └── Refresh
        │
        ├── Bulk Actions Bar (conditional)
        │   └── Delete Selected
        │
        ├── Data Table
        │   ├── Table Header
        │   │   ├── Checkbox (Select All)
        │   │   ├── Pelanggan
        │   │   ├── Kontak
        │   │   ├── Jenis
        │   │   ├── Status
        │   │   ├── Tanggal Daftar
        │   │   └── Aksi
        │   │
        │   └── Table Body
        │       └── Customer Row
        │           ├── Checkbox
        │           ├── Avatar + Name
        │           ├── Contact Info
        │           ├── Type Chip
        │           ├── Status Chip
        │           ├── Registration Date
        │           └── Action Menu
        │               ├── View Details
        │               ├── Edit
        │               └── Delete
        │
        ├── Pagination
        │
        └── Dialogs
            ├── Detail Dialog
            └── Snackbar (Notifications)
```

---

## 🔐 Permission Flow

```
┌──────────────┐
│ User Login   │
└──────┬───────┘
       │
       v
┌─────────────────┐
│ Check User Role │
├─────────────────┤
│ • Admin         │
│ • Technician    │
└──────┬──────────┘
       │
       ├─────────────────┐
       │                 │
       v                 v
   [Admin]          [Technician]
       │                 │
       v                 v
Show Full Menu    Show Limited Menu
       │                 │
       v                 └─> No "Manajemen Pelanggan"
Manajemen Pelanggan
       │
       v
┌──────────────────────┐
│ Check Permission     │
├──────────────────────┤
│ customers:read    ✅ │
│ customers:create  ✅ │
│ customers:update  ✅ │
│ customers:delete  ✅ │
└──────────────────────┘
```

---

## 📊 Data Flow

```
┌─────────────────┐
│ User Action     │
│ (Click Menu)    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Next.js Router  │
│ router.push()   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Page Component  │
│ Loads           │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ useEffect()     │
│ fetchData()     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ API Call        │
│ customerAPI     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Backend Server  │
│ /api/customers  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Database Query  │
│ MongoDB         │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Response Data   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ setState()      │
│ Update UI       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Render Table    │
│ Display Data    │
└─────────────────┘
```

---

## 🎨 Active State Visual

```
SIDEBAR BEFORE CLICK:
┌────────────────────────┐
│ 👥 Manajemen Pelanggan │ [Gray, Collapsed]
└────────────────────────┘

SIDEBAR AFTER CLICK:
┌────────────────────────────┐
│ 👥 Manajemen Pelanggan  ▼  │ [Expanded]
├────────────────────────────┤
│   📋 Daftar Pelanggan      │ [Blue Highlight, Active]
│   ➕ Registrasi Baru       │
│   👤 Akun Pelanggan        │
└────────────────────────────┘
```

---

## 🔗 URL Routing

```
Route: /customers
├─ Method: GET
├─ Component: CustomerManagement
├─ Layout: AdminLayout
└─ Access: Admin Only

Route: /customers/detail/[id]
├─ Method: GET
├─ Component: CustomerDetailPage
├─ Dynamic: id parameter
├─ Layout: AdminLayout
└─ Access: Admin Only

Route: /customers/registration
├─ Method: GET
├─ Component: CustomerRegistration
├─ Query: ?edit=[id] (optional)
├─ Layout: AdminLayout
└─ Access: Admin Only

Route: /customers/accounts
├─ Method: GET
├─ Component: CustomerAccounts
├─ Layout: AdminLayout
└─ Access: Admin Only
```

---

## ✅ Connection Status

| Component         | Status | Path                                  |
| ----------------- | ------ | ------------------------------------- |
| Sidebar Menu      | ✅     | `/components/layout/AdminSidebar.tsx` |
| Main Page         | ✅     | `/customers/page.tsx`                 |
| Detail Page       | ✅     | `/customers/detail/[id]/page.tsx`     |
| Registration Page | ✅     | `/customers/registration/page.tsx`    |
| Accounts Page     | ✅     | `/customers/accounts/page.tsx`        |
| Router Navigation | ✅     | Next.js App Router                    |
| Permission Check  | ✅     | AdminProvider                         |
| Active State      | ✅     | usePathname()                         |

**Overall Status**: 🟢 **FULLY CONNECTED & OPERATIONAL**

---

Terakhir diupdate: 8 Oktober 2025
