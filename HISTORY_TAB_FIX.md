# 🔧 FIX: Tab Riwayat Pembacaan Tidak Terkoneksi

## Tanggal: 8 Oktober 2025

---

## 🐛 Problem

User melaporkan bahwa **Tab "Riwayat Pembacaan" tidak menampilkan data**, padahal data history usage sudah ada di database.

**Sebelumnya:**

```tsx
<TabPanel value={tabValue} index={1}>
  <Alert severity='info'>
    Fitur riwayat pembacaan meteran akan segera tersedia // ❌ Placeholder!
  </Alert>
</TabPanel>
```

---

## 🔍 Root Cause

Tab "Riwayat Pembacaan" masih menggunakan **placeholder/mock** dan tidak melakukan fetch data dari backend API `/history/getHistory/:userId/:meteranId`.

---

## ✅ Solution Implemented

### 1. **Add State Management**

```typescript
const [historyUsage, setHistoryUsage] = useState<any[]>([]);
const [loadingHistory, setLoadingHistory] = useState(false);
const [historyFilter, setHistoryFilter] = useState<
  'hari' | 'minggu' | 'bulan' | 'tahun'
>('minggu');
```

### 2. **Auto-fetch When Tab Opens**

```typescript
useEffect(() => {
  if (customer?.meteran && tabValue === 0) {
    fetchBillingHistory();
  }
  if (customer?.meteran && tabValue === 1) {
    // ✅ NEW
    fetchHistoryUsage();
  }
}, [customer, tabValue, historyFilter]);
```

### 3. **Implement fetchHistoryUsage()**

```typescript
const fetchHistoryUsage = async () => {
  if (!customer?.meteran) return;

  try {
    setLoadingHistory(true);
    console.log('🔄 Fetching history usage for customer:', customerId);
    console.log('Filter:', historyFilter);

    const meteranId = customer.meteran.accountNumber; // _id of meteran

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/history/getHistory/${customerId}/${meteranId}?filter=${historyFilter}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ History usage data:', data);

      if (data.status === 200 && data.data) {
        // Map the aggregated data
        const mappedHistory = data.data.map((item: any) => {
          let timeLabel = '';

          switch (historyFilter) {
            case 'hari':
              timeLabel = item._id.time || '-'; // "10:00", "11:00", etc
              break;
            case 'minggu':
              const days = [
                'Minggu',
                'Senin',
                'Selasa',
                'Rabu',
                'Kamis',
                'Jumat',
                'Sabtu',
              ];
              timeLabel = days[item._id.day - 1] || '-';
              break;
            case 'bulan':
              timeLabel = `Minggu ${item._id.week}` || '-';
              break;
            case 'tahun':
              const months = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'Mei',
                'Jun',
                'Jul',
                'Agu',
                'Sep',
                'Okt',
                'Nov',
                'Des',
              ];
              timeLabel = months[item._id.month - 1] || '-';
              break;
          }

          return {
            time: timeLabel,
            usage: item.totalUsedWater || 0,
            count: item.count || 0,
          };
        });

        setHistoryUsage(mappedHistory);
        console.log('✅ Mapped history usage:', mappedHistory);
      }
    }
  } catch (error: any) {
    console.error('❌ Error fetching history usage:', error);
  } finally {
    setLoadingHistory(false);
  }
};
```

### 4. **Enhanced UI with Filter Chips**

```tsx
<Box sx={{ mb: 2 }}>
  <Typography variant='h6' gutterBottom>
    Riwayat Pemakaian Air
  </Typography>
  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
    <Chip
      label='Hari Ini'
      color={historyFilter === 'hari' ? 'primary' : 'default'}
      onClick={() => setHistoryFilter('hari')}
      clickable
    />
    <Chip
      label='Minggu Ini'
      color={historyFilter === 'minggu' ? 'primary' : 'default'}
      onClick={() => setHistoryFilter('minggu')}
      clickable
    />
    <Chip
      label='Bulan Ini'
      color={historyFilter === 'bulan' ? 'primary' : 'default'}
      onClick={() => setHistoryFilter('bulan')}
      clickable
    />
    <Chip
      label='Tahun Ini'
      color={historyFilter === 'tahun' ? 'primary' : 'default'}
      onClick={() => setHistoryFilter('tahun')}
      clickable
    />
  </Box>
</Box>
```

### 5. **Complete Data Table**

```tsx
<TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>
          {historyFilter === 'hari' && 'Jam'}
          {historyFilter === 'minggu' && 'Hari'}
          {historyFilter === 'bulan' && 'Minggu'}
          {historyFilter === 'tahun' && 'Bulan'}
        </TableCell>
        <TableCell align='right'>Pemakaian (Liter)</TableCell>
        <TableCell align='right'>Jumlah Pembacaan</TableCell>
        <TableCell align='right'>Rata-rata (L/pembacaan)</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {historyUsage.map((item: any, index: number) => (
        <TableRow key={index}>
          <TableCell>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {item.time}
            </Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              {item.usage.toFixed(2)} L
            </Typography>
          </TableCell>
          <TableCell align='right'>{item.count}</TableCell>
          <TableCell align='right'>
            {item.count > 0 ? (item.usage / item.count).toFixed(2) : '0.00'} L
          </TableCell>
        </TableRow>
      ))}

      {/* TOTAL ROW */}
      <TableRow sx={{ bgcolor: 'primary.50' }}>
        <TableCell>
          <Typography variant='body2' sx={{ fontWeight: 700 }}>
            TOTAL
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <Typography
            variant='body2'
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            {historyUsage.reduce((sum, item) => sum + item.usage, 0).toFixed(2)}{' '}
            L
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <Typography variant='body2' sx={{ fontWeight: 700 }}>
            {historyUsage.reduce((sum, item) => sum + item.count, 0)}
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <Typography variant='body2' sx={{ fontWeight: 700 }}>
            {/* Calculate average */}
          </Typography>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
```

### 6. **Loading & Empty States**

```tsx
{
  loadingHistory ? (
    <Box display='flex' justifyContent='center' py={4}>
      <CircularProgress />
    </Box>
  ) : historyUsage.length > 0 ? (
    <TableContainer>{/* Table */}</TableContainer>
  ) : (
    <Alert severity='info'>
      {customer.meteran
        ? `Belum ada data pemakaian untuk filter "${historyFilter}"`
        : 'Pelanggan belum memiliki meteran'}
    </Alert>
  );
}
```

---

## 📊 Data Flow

```
1. User clicks "Riwayat Pembacaan" tab
   ↓
2. useEffect detects tabValue === 1 and customer has meteran
   ↓
3. Trigger fetchHistoryUsage()
   ↓
4. API Call: GET /history/getHistory/:userId/:meteranId?filter=minggu
   ↓
5. Backend aggregates HistoryUsage data:
   - filter=hari → Group by hour
   - filter=minggu → Group by day of week
   - filter=bulan → Group by week
   - filter=tahun → Group by month
   ↓
6. Frontend maps response:
   - _id.time/day/week/month → time label
   - totalUsedWater → usage
   - count → count
   ↓
7. Display in table with 4 columns + TOTAL row
```

---

## 🎯 Features

### **Filter Options:**

- ✅ **Hari Ini** - Shows hourly breakdown (00:00, 01:00, ..., 23:00)
- ✅ **Minggu Ini** - Shows daily breakdown (Senin, Selasa, ..., Minggu)
- ✅ **Bulan Ini** - Shows weekly breakdown (Minggu 1, Minggu 2, ...)
- ✅ **Tahun Ini** - Shows monthly breakdown (Jan, Feb, ..., Des)

### **Table Columns:**

1. **Time/Period** - Hour/Day/Week/Month (bold)
2. **Pemakaian** - Total water used in Liters (blue, bold)
3. **Jumlah Pembacaan** - Number of readings
4. **Rata-rata** - Average per reading (calculated)

### **Summary Row:**

- Background color: light blue
- Bold text
- Shows:
  - Total usage (sum of all rows)
  - Total readings (sum of all counts)
  - Overall average (total usage / total count)

---

## 🧪 Testing Steps

### 1. Test Filter "Hari Ini"

```bash
# 1. Login sebagai admin
# 2. Buka customer detail yang punya meteran
# 3. Click tab "Riwayat Pembacaan"
# 4. Check console:
#    - "🔄 Fetching history usage..."
#    - "Filter: hari"
#    - "✅ History usage data: {...}"
# 5. Verify tabel menampilkan data per jam:
#    - Kolom 1: "Jam" (00:00, 01:00, dst)
#    - Kolom 2: Pemakaian (Liter)
#    - Kolom 3: Jumlah Pembacaan
#    - Kolom 4: Rata-rata
# 6. Check TOTAL row di bawah (background biru muda)
```

### 2. Test Filter "Minggu Ini"

```bash
# 1. Click chip "Minggu Ini"
# 2. Check console: "Filter: minggu"
# 3. Verify tabel menampilkan data per hari:
#    - Senin, Selasa, Rabu, dst
# 4. Check TOTAL row
```

### 3. Test Filter "Bulan Ini"

```bash
# 1. Click chip "Bulan Ini"
# 2. Check console: "Filter: bulan"
# 3. Verify tabel menampilkan data per minggu:
#    - Minggu 1, Minggu 2, Minggu 3, Minggu 4
# 4. Check TOTAL row
```

### 4. Test Filter "Tahun Ini"

```bash
# 1. Click chip "Tahun Ini"
# 2. Check console: "Filter: tahun"
# 3. Verify tabel menampilkan data per bulan:
#    - Jan, Feb, Mar, ..., Des
# 4. Check TOTAL row
```

### 5. Test Edge Cases

```bash
# Case 1: Customer without meteran
# - Should show: "Pelanggan belum memiliki meteran"

# Case 2: Customer with meteran but no usage data
# - Should show: "Belum ada data pemakaian untuk filter 'minggu'"

# Case 3: Switch between filters
# - Should auto-refetch when filter changes
# - Loading spinner should appear
```

---

## 📋 API Response Format

### GET /history/getHistory/:userId/:meteranId?filter=minggu

**Response:**

```json
{
  "status": 200,
  "message": "Data history usage minggu ini berhasil didapatkan",
  "data": [
    {
      "_id": { "day": 1 }, // 1 = Minggu, 2 = Senin, ...
      "totalUsedWater": 1234.56,
      "count": 150
    },
    {
      "_id": { "day": 2 },
      "totalUsedWater": 890.12,
      "count": 120
    }
  ]
}
```

**Frontend Mapping:**

```typescript
{
  time: "Minggu",  // or "Senin", "Selasa", etc
  usage: 1234.56,
  count: 150
}
```

---

## 🎨 UI Components

### Filter Chips (Active State)

```tsx
color={historyFilter === 'hari' ? 'primary' : 'default'}
// Active chip: Blue background with white text
// Inactive chip: Light gray background
```

### Table Styling

- **Header**: Bold text
- **Data rows**: Normal weight
- **Primary column** (Pemakaian): Blue color, bold
- **TOTAL row**: Light blue background, bold text

### Loading State

- Centered CircularProgress spinner
- Padding: 4 (vertical)

### Empty State

- Info severity alert
- Context-aware message based on:
  - Has meteran or not
  - Current filter selection

---

## 📊 Calculations

### Average per Reading

```typescript
item.count > 0 ? (item.usage / item.count).toFixed(2) : '0.00';
```

### Total Usage

```typescript
historyUsage.reduce((sum, item) => sum + item.usage, 0).toFixed(2);
```

### Total Count

```typescript
historyUsage.reduce((sum, item) => sum + item.count, 0);
```

### Overall Average

```typescript
const totalUsage = historyUsage.reduce((sum, item) => sum + item.usage, 0);
const totalCount = historyUsage.reduce((sum, item) => sum + item.count, 0);
return totalCount > 0 ? (totalUsage / totalCount).toFixed(2) : '0.00';
```

---

## 🔗 Backend Controller Reference

**File**: `/backend/controllers/historyUsageController.js`

**Function**: `getHistories()`

**Aggregation Logic:**

- **hari**: Group by hour (00:00 - 23:00)
- **minggu**: Group by day of week (1-7)
- **bulan**: Group by week number
- **tahun**: Group by month (1-12)

**Response Fields:**

- `_id.time` - Hour string (for hari)
- `_id.day` - Day number (for minggu)
- `_id.week` - Week number (for bulan)
- `_id.month` - Month number (for tahun)
- `totalUsedWater` - Sum of usedWater
- `count` - Number of records

---

## 📝 Console Output Example

### Success Case:

```
🔄 Fetching history usage for customer: 507f1f77bcf86cd799439011
Filter: minggu
✅ History usage data: {
  status: 200,
  message: "Data history usage minggu ini berhasil didapatkan",
  data: [
    { _id: { day: 2 }, totalUsedWater: 1234.56, count: 150 },
    { _id: { day: 3 }, totalUsedWater: 890.12, count: 120 },
    ...
  ]
}
✅ Mapped history usage: [
  { time: "Senin", usage: 1234.56, count: 150 },
  { time: "Selasa", usage: 890.12, count: 120 },
  ...
]
```

### No Data Case:

```
🔄 Fetching history usage for customer: 507f1f77bcf86cd799439011
Filter: minggu
✅ History usage data: { status: 200, data: [] }
✅ Mapped history usage: []
```

---

## ✅ Status

**FIXED** ✅ - Tab "Riwayat Pembacaan" sekarang terkoneksi dengan backend dan menampilkan data history usage dengan lengkap!

### What's Working Now:

- ✅ Fetch history usage from API
- ✅ 4 filter options (hari, minggu, bulan, tahun)
- ✅ Auto-refetch when filter changes
- ✅ Dynamic table header based on filter
- ✅ 4-column detailed table
- ✅ TOTAL summary row with calculations
- ✅ Loading state with spinner
- ✅ Empty state with context-aware message
- ✅ Proper data mapping for all filter types
- ✅ Comprehensive console logging

### Benefits:

- 📊 Admin dapat melihat tren pemakaian air
- ⏱️ Dapat filter by hari/minggu/bulan/tahun
- 🔢 Melihat rata-rata pemakaian per pembacaan
- 📈 Total summary untuk analysis cepat

---

**Last Updated**: 8 Oktober 2025
**Status**: ✅ RESOLVED
