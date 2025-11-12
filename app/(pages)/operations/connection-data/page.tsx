'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Pagination,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search,
  Visibility,
  CheckCircle,
  HourglassEmpty,
  FilterList,
  Refresh,
  Description,
} from '@mui/icons-material';
import AdminLayout from '../../../layouts/AdminLayout';
import { useAdmin } from '../../../layouts/AdminProvider';
import {
  getAllConnectionData,
  ConnectionData,
  ConnectionDataFilters,
} from '../../../services/connectionData.service';

export default function ConnectionDataManagement() {
  const router = useRouter();
  const { userRole } = useAdmin();

  const [connectionData, setConnectionData] = useState<ConnectionData[]>([]);
  const [filteredData, setFilteredData] = useState<ConnectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [adminVerifyFilter, setAdminVerifyFilter] = useState<string>('all');
  const [technicianVerifyFilter, setTechnicianVerifyFilter] =
    useState<string>('all');
  const [procedureFilter, setProcedureFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Fetch data from API
  const fetchConnectionData = async () => {
    setLoading(true);
    setError('');

    try {
      const filters: ConnectionDataFilters = {};

      if (adminVerifyFilter !== 'all') {
        filters.isVerifiedByData = adminVerifyFilter === 'verified';
      }
      if (technicianVerifyFilter !== 'all') {
        filters.isVerifiedByTechnician = technicianVerifyFilter === 'verified';
      }
      if (procedureFilter !== 'all') {
        filters.isAllProcedureDone = procedureFilter === 'done';
      }

      console.log('Fetching connection data with filters:', filters);
      const response = await getAllConnectionData(filters);

      console.log('Full response:', response);
      console.log('Response.data:', response.data);

      // Backend returns: { status: 200, data: [...] }
      // Axios wraps it, so response.data = { status: 200, data: [...] }
      // We need to access response.data (which is the array)
      let dataArray: ConnectionData[] = [];

      if (Array.isArray(response.data)) {
        // If response.data is already an array
        dataArray = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        // If response.data.data is the array
        dataArray = (response.data as any).data;
      } else if (response.data) {
        console.warn('Unexpected response structure:', response.data);
      }

      console.log('Final data array length:', dataArray.length);
      console.log('Final data array:', dataArray);

      setConnectionData(dataArray);
      setFilteredData(dataArray);
    } catch (err: any) {
      console.error('Error fetching connection data:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Gagal memuat data sambungan');
      setConnectionData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectionData();
  }, [adminVerifyFilter, technicianVerifyFilter, procedureFilter]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(connectionData);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = connectionData.filter(
        data =>
          data.nik.toLowerCase().includes(query) ||
          data.noKK.toLowerCase().includes(query) ||
          data.userId?.fullName?.toLowerCase().includes(query) ||
          data.userId?.email?.toLowerCase().includes(query) ||
          data.alamat.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    }
    setPage(1); // Reset to first page on search
  }, [searchQuery, connectionData]);

  const getVerificationStatus = (data: ConnectionData) => {
    if (data.isAllProcedureDone) {
      return { label: 'Selesai', color: 'success' as const };
    }
    if (data.isVerifiedByTechnician) {
      return { label: 'Verifikasi Teknisi', color: 'info' as const };
    }
    if (data.isVerifiedByData) {
      return { label: 'Verifikasi Admin', color: 'warning' as const };
    }
    return { label: 'Pending', color: 'default' as const };
  };

  const handleViewDetail = (id: string) => {
    router.push(`/operations/connection-data/${id}`);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Paginated data
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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
              Data Sambungan Air
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Kelola data pengajuan sambungan air dari pelanggan
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Refresh />}
            onClick={fetchConnectionData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder='Cari NIK, KK, Nama, Email, Alamat...'
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

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Verifikasi Admin</InputLabel>
                  <Select
                    value={adminVerifyFilter}
                    label='Verifikasi Admin'
                    onChange={(e: SelectChangeEvent) =>
                      setAdminVerifyFilter(e.target.value)
                    }
                  >
                    <MenuItem value='all'>Semua</MenuItem>
                    <MenuItem value='verified'>Terverifikasi</MenuItem>
                    <MenuItem value='pending'>Belum Verifikasi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Verifikasi Teknisi</InputLabel>
                  <Select
                    value={technicianVerifyFilter}
                    label='Verifikasi Teknisi'
                    onChange={(e: SelectChangeEvent) =>
                      setTechnicianVerifyFilter(e.target.value)
                    }
                  >
                    <MenuItem value='all'>Semua</MenuItem>
                    <MenuItem value='verified'>Terverifikasi</MenuItem>
                    <MenuItem value='pending'>Belum Verifikasi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={procedureFilter}
                    label='Status'
                    onChange={(e: SelectChangeEvent) =>
                      setProcedureFilter(e.target.value)
                    }
                  >
                    <MenuItem value='all'>Semua</MenuItem>
                    <MenuItem value='done'>Selesai</MenuItem>
                    <MenuItem value='pending'>Proses</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 400,
                }}
              >
                <CircularProgress />
              </Box>
            ) : filteredData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant='h6' color='text.secondary'>
                  Tidak ada data sambungan
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {searchQuery
                    ? 'Coba kata kunci pencarian yang berbeda'
                    : 'Belum ada pengajuan sambungan'}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Pelanggan</TableCell>
                        <TableCell>NIK / KK</TableCell>
                        <TableCell>Alamat</TableCell>
                        <TableCell>Luas Bangunan</TableCell>
                        <TableCell>Teknisi Ditugaskan</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align='center'>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.map(data => {
                        const status = getVerificationStatus(data);
                        return (
                          <TableRow key={data._id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant='body2' fontWeight='bold'>
                                  {data.userId?.fullName || 'N/A'}
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {data.userId?.email || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2'>
                                {data.nik}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                KK: {data.noKK}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant='body2'
                                noWrap
                                sx={{ maxWidth: 200 }}
                              >
                                {data.alamat}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {data.kelurahan}, {data.kecamatan}
                              </Typography>
                            </TableCell>
                            <TableCell>{data.luasBangunan} m²</TableCell>
                            <TableCell>
                              {data.assignedTechnicianId ? (
                                <Box>
                                  <Typography variant='body2' fontWeight='bold'>
                                    {data.assignedTechnicianId.fullName}
                                  </Typography>
                                  <Typography
                                    variant='caption'
                                    color='text.secondary'
                                  >
                                    {data.assignedTechnicianId.phone}
                                  </Typography>
                                </Box>
                              ) : (
                                <Chip
                                  label='Belum Ditugaskan'
                                  size='small'
                                  variant='outlined'
                                  color='default'
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={status.label}
                                color={status.color}
                                size='small'
                                icon={
                                  data.isAllProcedureDone ? (
                                    <CheckCircle />
                                  ) : (
                                    <HourglassEmpty />
                                  )
                                }
                              />
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
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={Math.ceil(filteredData.length / rowsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    color='primary'
                  />
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
}
