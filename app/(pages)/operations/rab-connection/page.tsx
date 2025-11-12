'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  CheckCircle,
  HourglassEmpty,
  AttachMoney,
} from '@mui/icons-material';
import AdminLayout from '../../../layouts/AdminLayout';
import {
  getAllRabConnections,
  RabConnection,
} from '../../../services/rabConnection.service';

export default function RabConnectionManagement() {
  const router = useRouter();

  const [rabData, setRabData] = useState<RabConnection[]>([]);
  const [filteredData, setFilteredData] = useState<RabConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const fetchRabData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAllRabConnections();

      // Handle both response structures
      let dataArray: RabConnection[] = [];
      if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        dataArray = response.data.data;
      }

      setRabData(dataArray);
      setFilteredData(dataArray);
    } catch (err: any) {
      console.error('Error fetching RAB data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data RAB');
      setRabData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRabData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(rabData)) {
      setFilteredData([]);
      return;
    }

    let filtered = rabData;

    // Filter by payment status
    if (paymentFilter === 'paid') {
      filtered = filtered.filter(data => data.isPaid);
    } else if (paymentFilter === 'unpaid') {
      filtered = filtered.filter(data => !data.isPaid);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        data =>
          data.connectionDataId.nik.toLowerCase().includes(query) ||
          data.connectionDataId.userId?.fullName
            ?.toLowerCase()
            .includes(query) ||
          data.technicianId?.fullName?.toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
  }, [searchQuery, paymentFilter, rabData]);

  const handleViewDetail = (id: string) => {
    router.push(`/operations/rab-connection/${id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant='h4' gutterBottom>
              RAB Sambungan
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Rencana Anggaran Biaya sambungan air
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Refresh />}
            onClick={fetchRabData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Alert */}
        {error && (
          <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder='Cari NIK, Nama Pelanggan, atau Teknisi...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status Pembayaran</InputLabel>
                  <Select
                    value={paymentFilter}
                    label='Status Pembayaran'
                    onChange={(e: SelectChangeEvent) =>
                      setPaymentFilter(e.target.value)
                    }
                  >
                    <MenuItem value='all'>Semua</MenuItem>
                    <MenuItem value='paid'>Lunas</MenuItem>
                    <MenuItem value='unpaid'>Belum Lunas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant='h6' color='text.secondary'>
                  Tidak ada data RAB
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>NIK / Pelanggan</TableCell>
                      <TableCell>Teknisi</TableCell>
                      <TableCell align='right'>Total Biaya</TableCell>
                      <TableCell>Status Pembayaran</TableCell>
                      <TableCell>Tanggal Dibuat</TableCell>
                      <TableCell align='center'>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(filteredData) &&
                      filteredData.map(data => (
                        <TableRow key={data._id} hover>
                          <TableCell>
                            <Typography variant='body2' fontWeight='bold'>
                              {data.connectionDataId.nik}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {data.connectionDataId.userId?.fullName || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {data.technicianId?.fullName || 'N/A'}
                          </TableCell>
                          <TableCell align='right'>
                            <Typography
                              variant='body2'
                              fontWeight='bold'
                              color='primary'
                            >
                              {formatCurrency(data.totalBiaya)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {data.isPaid ? (
                              <Chip
                                label='Lunas'
                                color='success'
                                size='small'
                                icon={<CheckCircle />}
                              />
                            ) : (
                              <Chip
                                label='Belum Lunas'
                                color='warning'
                                size='small'
                                icon={<HourglassEmpty />}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(data.createdAt).toLocaleDateString(
                              'id-ID'
                            )}
                            {data.isPaid && data.paidAt && (
                              <>
                                <br />
                                <Typography
                                  variant='caption'
                                  color='success.main'
                                >
                                  Lunas:{' '}
                                  {new Date(data.paidAt).toLocaleDateString(
                                    'id-ID'
                                  )}
                                </Typography>
                              </>
                            )}
                          </TableCell>
                          <TableCell align='center'>
                            <Tooltip title='Lihat Detail'>
                              <IconButton
                                size='small'
                                color='primary'
                                onClick={() => handleViewDetail(data._id)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
}
