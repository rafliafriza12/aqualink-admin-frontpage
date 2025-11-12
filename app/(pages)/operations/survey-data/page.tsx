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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton as MuiIconButton,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  Description,
  Close,
  ZoomIn,
  ZoomOut,
  RestartAlt,
} from '@mui/icons-material';
import AdminLayout from '../../../layouts/AdminLayout';
import {
  getAllSurveyData,
  SurveyData,
} from '../../../services/surveyData.service';

export default function SurveyDataManagement() {
  const router = useRouter();

  const [surveyData, setSurveyData] = useState<SurveyData[]>([]);
  const [filteredData, setFilteredData] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Document viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState('');
  const [zoom, setZoom] = useState(100);

  const fetchSurveyData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAllSurveyData();

      // Handle both response structures
      let dataArray: SurveyData[] = [];
      if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        dataArray = response.data.data;
      }

      setSurveyData(dataArray);
      setFilteredData(dataArray);
    } catch (err: any) {
      console.error('Error fetching survey data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data survey');
      setSurveyData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(surveyData);
    } else {
      const query = searchQuery.toLowerCase();
      if (Array.isArray(surveyData)) {
        const filtered = surveyData.filter(
          data =>
            data.connectionDataId.nik.toLowerCase().includes(query) ||
            data.connectionDataId.userId?.fullName
              ?.toLowerCase()
              .includes(query) ||
            data.technicianId?.fullName?.toLowerCase().includes(query)
        );
        setFilteredData(filtered);
      }
    }
  }, [searchQuery, surveyData]);

  const openImageViewer = (url: string) => {
    setViewerImage(url);
    setZoom(100);
    setViewerOpen(true);
  };

  const handleViewDetail = (id: string) => {
    router.push(`/operations/survey-data/${id}`);
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
              Data Survey
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Kelola data survey lokasi sambungan
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Refresh />}
            onClick={fetchSurveyData}
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

        {/* Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
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
                  Tidak ada data survey
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>NIK / Pelanggan</TableCell>
                      <TableCell>Teknisi</TableCell>
                      <TableCell>Diameter Pipa</TableCell>
                      <TableCell>Jumlah Penghuni</TableCell>
                      <TableCell>Standar</TableCell>
                      <TableCell>Tanggal Survey</TableCell>
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
                          <TableCell>{data.diameterPipa} mm</TableCell>
                          <TableCell>{data.jumlahPenghuni} orang</TableCell>
                          <TableCell>
                            <Chip
                              label={data.standar ? 'Sesuai' : 'Tidak Sesuai'}
                              size='small'
                              color={data.standar ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(data.createdAt).toLocaleDateString(
                              'id-ID'
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
                            <Tooltip title='Lihat Foto Jaringan'>
                              <IconButton
                                size='small'
                                color='info'
                                onClick={() =>
                                  openImageViewer(data.jaringanUrl)
                                }
                              >
                                <Description />
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

        {/* Image Viewer Dialog */}
        <Dialog
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          maxWidth='lg'
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant='h6'>Foto Lokasi Survey</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size='small'
                  onClick={() => setZoom(prev => Math.max(prev - 25, 50))}
                >
                  <ZoomOut />
                </IconButton>
                <Typography
                  variant='body2'
                  sx={{ minWidth: 60, textAlign: 'center' }}
                >
                  {zoom}%
                </Typography>
                <IconButton
                  size='small'
                  onClick={() => setZoom(prev => Math.min(prev + 25, 300))}
                >
                  <ZoomIn />
                </IconButton>
                <IconButton size='small' onClick={() => setZoom(100)}>
                  <RestartAlt />
                </IconButton>
                <IconButton onClick={() => setViewerOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                minHeight: 400,
                overflow: 'auto',
              }}
            >
              <img
                src={viewerImage}
                alt='Foto Lokasi'
                style={{
                  width: `${zoom}%`,
                  height: 'auto',
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
