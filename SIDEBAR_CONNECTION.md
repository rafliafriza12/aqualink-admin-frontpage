# 🔗 Koneksi Sidebar - Management Pelanggan

## ✅ Status: **TERHUBUNG**

Menu Management Pelanggan sudah terhubung dengan baik ke AdminSidebar dan semua path sudah benar.

---

## 📍 Navigasi di Sidebar

### Lokasi Menu:

```
Admin Panel
└── Manajemen Pelanggan (expandable)
    ├── Daftar Pelanggan      → /customers
    ├── Registrasi Baru       → /customers/registration  ✅ FIXED
    └── Akun Pelanggan        → /customers/accounts
```

---

## 🔧 Konfigurasi Sidebar

### File: `/app/components/layout/AdminSidebar.tsx`

```typescript
{
  id: 'customers',
  title: 'Manajemen Pelanggan',
  icon: <People />,
  roles: ['admin'],
  children: [
    {
      id: 'customer-list',
      title: 'Daftar Pelanggan',
      icon: <People />,
      path: '/customers',                    // ✅ Terhubung ke page.tsx
      permission: 'customers:read',
      roles: ['admin'],
    },
    {
      id: 'customer-registration',
      title: 'Registrasi Baru',
      icon: <People />,
      path: '/customers/registration',        // ✅ FIXED: register → registration
      permission: 'customers:create',
      roles: ['admin'],
    },
    {
      id: 'customer-accounts',
      title: 'Akun Pelanggan',
      icon: <AccountTree />,
      path: '/customers/accounts',            // ✅ Terhubung ke accounts/page.tsx
      permission: 'customers:read',
      roles: ['admin'],
    },
  ],
},
```

---

## 📂 Mapping Path ke File

| Menu             | Path                              | File                                           |
| ---------------- | --------------------------------- | ---------------------------------------------- |
| Daftar Pelanggan | `/customers`                      | `/app/(pages)/customers/page.tsx`              |
| Registrasi Baru  | `/customers/registration`         | `/app/(pages)/customers/registration/page.tsx` |
| Akun Pelanggan   | `/app/(pages)/customers/accounts` | `/app/(pages)/customers/accounts/page.tsx`     |
| Detail Pelanggan | `/customers/detail/[id]`          | `/app/(pages)/customers/detail/[id]/page.tsx`  |

---

## 🔐 Permission & Roles

### Role Access:

- **Admin**: Full access (read, create, update, delete)
- **Technician**: No access ke Management Pelanggan

### Permissions:

```typescript
'customers:read'   - View daftar dan detail pelanggan
'customers:create' - Tambah pelanggan baru
'customers:update' - Edit data pelanggan (implicit)
'customers:delete' - Hapus pelanggan (implicit)
```

---

## 🎯 Cara Akses

### Dari Sidebar:

1. Login sebagai **Admin**
2. Sidebar akan menampilkan menu **"Manajemen Pelanggan"**
3. Klik untuk expand submenu
4. Pilih:
   - **Daftar Pelanggan** → Lihat semua pelanggan
   - **Registrasi Baru** → Form tambah pelanggan
   - **Akun Pelanggan** → Manajemen akun layanan

### Direct URL:

```
https://admin.aqualink.com/customers
https://admin.aqualink.com/customers/registration
https://admin.aqualink.com/customers/accounts
https://admin.aqualink.com/customers/detail/123
```

---

## 🎨 Icon & Styling

### Icons Used:

- **Main Menu**: `<People />` - Ikon grup orang
- **Daftar Pelanggan**: `<People />` - Ikon orang
- **Registrasi Baru**: `<People />` - Ikon orang
- **Akun Pelanggan**: `<AccountTree />` - Ikon struktur akun

### Active State:

```typescript
const isActive = item.path === pathname;

// Active styling:
{
  bgcolor: 'primary.main',
  color: 'white',
  '&:hover': {
    bgcolor: 'primary.dark',
  },
}
```

---

## 🔄 Navigation Flow

```
User clicks "Manajemen Pelanggan"
         ↓
Sidebar expands (setState)
         ↓
User clicks "Daftar Pelanggan"
         ↓
router.push('/customers')
         ↓
Next.js navigates to page
         ↓
AdminLayout renders with content
         ↓
CustomerManagement component loads
```

---

## ✅ Testing Checklist

- [x] Menu "Manajemen Pelanggan" muncul di sidebar
- [x] Submenu expandable berfungsi
- [x] Path `/customers` navigates correctly
- [x] Path `/customers/registration` navigates correctly ✅ FIXED
- [x] Path `/customers/accounts` navigates correctly
- [x] Active state highlight berfungsi
- [x] Permission checking works
- [x] Only admin can see menu
- [x] Icons displayed correctly
- [x] Breadcrumb updates on navigation

---

## 🐛 Bug Fixes

### Issue #1: Wrong Registration Path

**Before:**

```typescript
path: '/customers/register'; // ❌ File tidak ada
```

**After:**

```typescript
path: '/customers/registration'; // ✅ File ada
```

**Status**: ✅ **FIXED**

---

## 🚀 Next Steps

### Tambahan yang Disarankan:

1. **Add Badge Count** di menu:

```typescript
{
  id: 'customer-list',
  title: 'Daftar Pelanggan',
  icon: <People />,
  badge: customerCount,  // Show total customers
  path: '/customers',
}
```

2. **Add Notification Badge**:

```typescript
{
  id: 'customer-registration',
  title: 'Registrasi Baru',
  icon: <People />,
  badge: pendingRegistrations,  // Show pending count
  badgeColor: 'warning',
  path: '/customers/registration',
}
```

3. **Add Search in Sidebar**:

```typescript
<TextField
  size="small"
  placeholder="Cari menu..."
  onChange={handleSearch}
/>
```

---

## 💡 Tips

1. **Quick Access**: Pin "Daftar Pelanggan" ke favorites
2. **Keyboard Shortcut**: `Ctrl/Cmd + K` untuk search menu
3. **Collapse Other**: Auto-collapse other menus when expanding
4. **Recent Pages**: Show recent visited pages di sidebar

---

## 📊 Analytics

Track menu usage:

```typescript
const trackMenuClick = (menuId: string) => {
  analytics.track('sidebar_menu_click', {
    menu_id: menuId,
    timestamp: new Date(),
    user_role: userRole,
  });
};
```

---

**Terakhir diupdate**: 8 Oktober 2025 - Path registrasi diperbaiki
**Status**: ✅ Fully Connected & Working
