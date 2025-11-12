'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Person,
  Phone,
  Email,
  LocationOn,
  WaterDrop,
  Receipt,
  History,
  Settings,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import AdminLayout from '../../../../layouts/AdminLayout';
import { customerAPI } from '../../../../utils/API';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [billings, setBillings] = useState<any[]>([]);
  const [loadingBillings, setLoadingBillings] = useState(false);
  const [historyUsage, setHistoryUsage] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<
    'hari' | 'minggu' | 'bulan' | 'tahun'
  >('minggu');

  useEffect(() => {
    fetchCustomerDetail();
  }, [customerId]);

  useEffect(() => {
    if (customer?.meteran && tabValue === 0) {
      fetchBillingHistory();
    }
    if (customer?.meteran && tabValue === 1) {
      fetchHistoryUsage();
    }
  }, [customer, tabValue, historyFilter]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching customer detail for ID:', customerId);

      const response = await customerAPI.getById(customerId);

      console.log('✅ Customer detail response:', response);
      console.log('📊 Customer data:', response.data.data);
      console.log('⚙️ Meteran data:', response.data.data?.meteranId);

      if (response.data.success) {
        const customerData = response.data.data;

        // Map backend data to frontend format
        const mappedCustomer = {
          id: customerData._id,
          nik: customerData.nik || 'N/A',
          name: customerData.fullName,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address || 'N/A',
          customerType: customerData.customerType || 'rumah_tangga',
          accountStatus: customerData.accountStatus || 'active',
          registrationDate: new Date(customerData.createdAt),
          meteran: null as any,
          billings: [], // TODO: Fetch from billing API
        };

        // Handle meteranId - check if it exists and is populated
        if (customerData.meteranId) {
          console.log('✅ Meteran exists:', customerData.meteranId);

          mappedCustomer.meteran = {
            meterNumber: customerData.meteranId.noMeteran || 'N/A',
            accountNumber: customerData.meteranId._id || 'N/A',
            tariffCategory:
              customerData.meteranId.kelompokPelangganId?.namaKelompok ||
              customerData.meteranId.kelompokPelangganId?.tarif ||
              'N/A',
            installationDate: customerData.meteranId.createdAt
              ? new Date(customerData.meteranId.createdAt)
              : null,
            totalUsage: customerData.meteranId.totalPemakaian || 0,
            unpaidUsage: customerData.meteranId.pemakaianBelumTerbayar || 0,
            dueDate: customerData.meteranId.jatuhTempo
              ? new Date(customerData.meteranId.jatuhTempo)
              : null,
          };

          console.log('✅ Mapped meteran:', mappedCustomer.meteran);
        } else {
          console.warn('⚠️ No meteran data found for this customer');
        }

        setCustomer(mappedCustomer);
      }
    } catch (error: any) {
      console.error('❌ Error fetching customer detail:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(
        'Gagal memuat detail pelanggan: ' +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingHistory = async () => {
    try {
      setLoadingBillings(true);
      console.log('🔄 Fetching billing history for customer:', customerId);

      // Call billing API
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
          console.log('✅ Mapped billings:', mappedBillings);
        }
      } else {
        console.warn('⚠️ Billing API returned error');
      }
    } catch (error: any) {
      console.error('❌ Error fetching billing history:', error);
    } finally {
      setLoadingBillings(false);
    }
  };

  const fetchHistoryUsage = async () => {
    if (!customer?.meteran) return;

    try {
      setLoadingHistory(true);
      console.log('🔄 Fetching history usage for customer:', customerId);
      console.log('Filter:', historyFilter);

      const meteranId = customer.meteran.accountNumber; // This is the _id of meteran

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
                timeLabel = item._id.time || '-';
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
      } else {
        console.warn('⚠️ History API returned error');
      }
    } catch (error: any) {
      console.error('❌ Error fetching history usage:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title='Detail Pelanggan'>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
        >
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout title='Detail Pelanggan'>
        <Alert severity='error'>{error || 'Pelanggan tidak ditemukan'}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/customers')}
          sx={{ mt: 2 }}
        >
          Kembali ke Daftar Pelanggan
        </Button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Detail Pelanggan - ${customer.name}`}>
      <Box sx={{ mb: 3 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push('/customers')}
            >
              Kembali
            </Button>
            <Typography variant='h4' component='h1' sx={{ fontWeight: 600 }}>
              Detail Pelanggan
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Edit />}
            onClick={() =>
              router.push(`/customers/registration?edit=${customerId}`)
            }
          >
            Edit Pelanggan
          </Button>
        </Box>

        {/* Customer Info Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                    }}
                  >
                    {customer.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
                      {customer.name}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 2 }}
                    >
                      NIK: {customer.nik}
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}
                    >
                      <Chip
                        icon={<Person />}
                        label={
                          customer.customerType === 'rumah_tangga'
                            ? 'Rumah Tangga'
                            : customer.customerType
                        }
                        color='primary'
                        variant='outlined'
                      />
                      <Chip
                        icon={
                          customer.accountStatus === 'active' ? (
                            <CheckCircle />
                          ) : (
                            <Warning />
                          )
                        }
                        label={
                          customer.accountStatus === 'active'
                            ? 'Aktif'
                            : 'Tidak Aktif'
                        }
                        color={
                          customer.accountStatus === 'active'
                            ? 'success'
                            : 'default'
                        }
                      />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Phone
                            sx={{ fontSize: 20, color: 'text.secondary' }}
                          />
                          <Typography variant='body2'>
                            {customer.phone}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Email
                            sx={{ fontSize: 20, color: 'text.secondary' }}
                          />
                          <Typography variant='body2'>
                            {customer.email}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                          }}
                        >
                          <LocationOn
                            sx={{ fontSize: 20, color: 'text.secondary' }}
                          />
                          <Typography variant='body2'>
                            {customer.address}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant='outlined' sx={{ bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Typography
                      variant='h6'
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <WaterDrop color='primary' />
                      Info Meteran
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {customer.meteran ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                        }}
                      >
                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            No. Meteran
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 600 }}>
                            {customer.meteran.meterNumber}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            ID Meteran
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                            }}
                          >
                            {customer.meteran.accountNumber}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            Kategori Tarif
                          </Typography>
                          <Chip
                            label={customer.meteran.tariffCategory}
                            size='small'
                            color='primary'
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            Total Pemakaian
                          </Typography>
                          <Typography
                            variant='body1'
                            sx={{ fontWeight: 600, color: 'primary.main' }}
                          >
                            {customer.meteran.totalUsage || 0} m³
                          </Typography>
                        </Box>
                        {customer.meteran.unpaidUsage > 0 && (
                          <Box>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
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
                        {customer.meteran.dueDate && (
                          <Box>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
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
                              {new Date(
                                customer.meteran.dueDate
                              ).toLocaleDateString('id-ID')}
                            </Typography>
                          </Box>
                        )}
                        <Divider />
                        {customer.meteran.installationDate && (
                          <Box>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              Tgl. Instalasi
                            </Typography>
                            <Typography variant='body2'>
                              {customer.meteran.installationDate.toLocaleDateString(
                                'id-ID',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                }
                              )}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Alert severity='info' sx={{ mt: 1 }}>
                        Belum ada meteran terpasang
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
            >
              <Tab
                icon={<Receipt />}
                label='Riwayat Tagihan'
                iconPosition='start'
              />
              <Tab
                icon={<History />}
                label='Riwayat Pembacaan'
                iconPosition='start'
              />
              <Tab
                icon={<Settings />}
                label='Pengaturan Akun'
                iconPosition='start'
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {loadingBillings ? (
              <Box display='flex' justifyContent='center' py={4}>
                <CircularProgress />
              </Box>
            ) : billings.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Periode</TableCell>
                      <TableCell align='right'>Pemakaian Awal</TableCell>
                      <TableCell align='right'>Pemakaian Akhir</TableCell>
                      <TableCell align='right'>Total (m³)</TableCell>
                      <TableCell align='right'>Biaya Air</TableCell>
                      <TableCell align='right'>Biaya Beban</TableCell>
                      <TableCell align='right'>Total Tagihan</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Tanggal Bayar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billings.map((billing: any) => (
                      <TableRow key={billing.id}>
                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {billing.period}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          {billing.pemakaianAwal.toFixed(2)}
                        </TableCell>
                        <TableCell align='right'>
                          {billing.pemakaianAkhir.toFixed(2)}
                        </TableCell>
                        <TableCell align='right'>
                          <Typography
                            variant='body2'
                            sx={{ fontWeight: 600, color: 'primary.main' }}
                          >
                            {billing.usage.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(billing.biayaAir)}
                        </TableCell>
                        <TableCell align='right'>
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(billing.biayaBeban)}
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(billing.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              billing.status === 'paid'
                                ? 'Lunas'
                                : 'Belum Bayar'
                            }
                            color={
                              billing.status === 'paid' ? 'success' : 'warning'
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          {billing.paidDate
                            ? billing.paidDate.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity='info'>
                {customer.meteran
                  ? 'Belum ada riwayat tagihan untuk meteran ini'
                  : 'Pelanggan belum memiliki meteran'}
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
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

            {loadingHistory ? (
              <Box display='flex' justifyContent='center' py={4}>
                <CircularProgress />
              </Box>
            ) : historyUsage.length > 0 ? (
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
                      <TableCell align='right'>
                        Rata-rata (L/pembacaan)
                      </TableCell>
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
                          {item.count > 0
                            ? (item.usage / item.count).toFixed(2)
                            : '0.00'}{' '}
                          L
                        </TableCell>
                      </TableRow>
                    ))}
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
                          {historyUsage
                            .reduce((sum, item) => sum + item.usage, 0)
                            .toFixed(2)}{' '}
                          L
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {historyUsage.reduce(
                            (sum, item) => sum + item.count,
                            0
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {(() => {
                            const totalUsage = historyUsage.reduce(
                              (sum, item) => sum + item.usage,
                              0
                            );
                            const totalCount = historyUsage.reduce(
                              (sum, item) => sum + item.count,
                              0
                            );
                            return totalCount > 0
                              ? (totalUsage / totalCount).toFixed(2)
                              : '0.00';
                          })()}{' '}
                          L
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity='info'>
                {customer.meteran
                  ? `Belum ada data pemakaian untuk filter "${historyFilter}"`
                  : 'Pelanggan belum memiliki meteran'}
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Alert severity='info'>
              Fitur pengaturan akun akan segera tersedia
            </Alert>
          </TabPanel>
        </Card>
      </Box>
    </AdminLayout>
  );
}
