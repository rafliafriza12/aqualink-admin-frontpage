'use client';

import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
  Pagination,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Build,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  LocationOn,
  Phone,
  Person,
  CameraAlt,
  Mic,
  Upload,
  Download,
  Navigation,
  QrCode,
} from '@mui/icons-material';
import AdminLayout from '../../../layouts/AdminLayout';
import { WorkOrder, Material } from '../../../types/admin.types';
import { workOrderAPI } from '../../../utils/API';

// Mock data untuk demo
const mockWorkOrders: WorkOrder[] = [
  {
    id: '1',
    type: 'installation',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'Teknisi A',
    customerId: '1',
    accountId: 'ACC-001-2024',
    description: 'Instalasi meteran baru untuk pelanggan baru',
    location: {
      address: 'Jl. Teuku Umar No. 123, Banda Aceh',
      coordinates: {
        latitude: 5.5483,
        longitude: 95.3238,
      },
    },
    scheduledDate: new Date('2024-01-20T09:00:00'),
    estimatedDuration: 120,
    materials: [
      {
        id: '1',
        name: 'Meteran Digital 1/2"',
        quantity: 1,
        unit: 'pcs',
        unitPrice: 250000,
        totalPrice: 250000,
      },
      {
        id: '2',
        name: 'Pipa PVC 1/2"',
        quantity: 5,
        unit: 'meter',
        unitPrice: 15000,
        totalPrice: 75000,
      },
    ],
    notes: 'Instalasi di lokasi yang mudah dijangkau',
  },
  {
    id: '2',
    type: 'maintenance',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Teknisi B',
    customerId: '2',
    accountId: 'ACC-002-2024',
    description: 'Pemeliharaan rutin meteran dan pipa',
    location: {
      address: 'Jl. Cut Nyak Dien No. 456, Banda Aceh',
      coordinates: {
        latitude: 5.5483,
        longitude: 95.3238,
      },
    },
    scheduledDate: new Date('2024-01-21T10:00:00'),
    estimatedDuration: 90,
    materials: [
      {
        id: '3',
        name: 'Seal Meteran',
        quantity: 2,
        unit: 'pcs',
        unitPrice: 5000,
        totalPrice: 10000,
      },
    ],
  },
  {
    id: '3',
    type: 'repair',
    priority: 'critical',
    status: 'completed',
    assignedTo: 'Teknisi C',
    customerId: '3',
    accountId: 'ACC-003-2024',
    description: 'Perbaikan kebocoran pipa utama',
    location: {
      address: 'Jl. Industri No. 789, Banda Aceh',
      coordinates: {
        latitude: 5.5483,
        longitude: 95.3238,
      },
    },
    scheduledDate: new Date('2024-01-19T08:00:00'),
    completedDate: new Date('2024-01-19T10:30:00'),
    estimatedDuration: 120,
    actualDuration: 150,
    materials: [
      {
        id: '4',
        name: 'Pipa PVC 2"',
        quantity: 2,
        unit: 'meter',
        unitPrice: 25000,
        totalPrice: 50000,
      },
      {
        id: '5',
        name: 'Lem PVC',
        quantity: 1,
        unit: 'tube',
        unitPrice: 15000,
        totalPrice: 15000,
      },
    ],
    notes: 'Kebocoran telah diperbaiki, sistem berfungsi normal',
    photos: ['photo1.jpg', 'photo2.jpg'],
  },
];

const steps = [
  'Diterima',
  'Dijadwalkan',
  'Dalam Proses',
  'Selesai',
  'Diverifikasi',
];

export default function WorkOrderManagement() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await workOrderAPI.getAll();
      if (response.data.success) {
        setWorkOrders(response.data.data);
      } else {
        setWorkOrders(mockWorkOrders);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
      setWorkOrders(mockWorkOrders);
      setError('Gagal memuat data work order, menggunakan data demo');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workOrder: WorkOrder) => {
    setAnchorEl(event.currentTarget);
    setSelectedWorkOrder(workOrder);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWorkOrder(null);
  };

  const handleViewDetails = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleStartWork = () => {
    if (selectedWorkOrder) {
      setWorkOrders(prev => prev.map(wo => 
        wo.id === selectedWorkOrder.id 
          ? { ...wo, status: 'in_progress' }
          : wo
      ));
    }
    handleMenuClose();
  };

  const handleCompleteWork = () => {
    if (selectedWorkOrder) {
      setWorkOrders(prev => prev.map(wo => 
        wo.id === selectedWorkOrder.id 
          ? { ...wo, status: 'completed', completedDate: new Date() }
          : wo
      ));
    }
    handleMenuClose();
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || wo.type === filterType;
    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || wo.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'installation': return 'Instalasi';
      case 'maintenance': return 'Pemeliharaan';
      case 'repair': return 'Perbaikan';
      case 'disconnection': return 'Pemutusan';
      case 'emergency': return 'Darurat';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'assigned': return 'Ditugaskan';
      case 'in_progress': return 'Dalam Proses';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Rendah';
      case 'medium': return 'Sedang';
      case 'high': return 'Tinggi';
      case 'critical': return 'Kritis';
      default: return priority;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Schedule color="warning" />;
      case 'assigned': return <Build color="info" />;
      case 'in_progress': return <Build color="primary" />;
      case 'completed': return <CheckCircle color="success" />;
      case 'cancelled': return <Error color="error" />;
      default: return <Build />;
    }
  };

  const getCurrentStep = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'in_progress': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedWorkOrders = filteredWorkOrders.slice(startIndex, endIndex);

  return (
    <AdminLayout title="Manajemen Perintah Kerja">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          Manajemen Perintah Kerja
        </Typography>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Build />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {workOrders.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Perintah Kerja
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Schedule />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {workOrders.filter(wo => wo.status === 'pending').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Menunggu
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Build />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {workOrders.filter(wo => wo.status === 'in_progress').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dalam Proses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {workOrders.filter(wo => wo.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Selesai
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Cari perintah kerja..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Jenis</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Jenis"
                  >
                    <MenuItem value="all">Semua</MenuItem>
                    <MenuItem value="installation">Instalasi</MenuItem>
                    <MenuItem value="maintenance">Pemeliharaan</MenuItem>
                    <MenuItem value="repair">Perbaikan</MenuItem>
                    <MenuItem value="disconnection">Pemutusan</MenuItem>
                    <MenuItem value="emergency">Darurat</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">Semua</MenuItem>
                    <MenuItem value="pending">Menunggu</MenuItem>
                    <MenuItem value="assigned">Ditugaskan</MenuItem>
                    <MenuItem value="in_progress">Dalam Proses</MenuItem>
                    <MenuItem value="completed">Selesai</MenuItem>
                    <MenuItem value="cancelled">Dibatalkan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Prioritas</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="Prioritas"
                  >
                    <MenuItem value="all">Semua</MenuItem>
                    <MenuItem value="low">Rendah</MenuItem>
                    <MenuItem value="medium">Sedang</MenuItem>
                    <MenuItem value="high">Tinggi</MenuItem>
                    <MenuItem value="critical">Kritis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  sx={{ height: '56px' }}
                >
                  Buat Perintah Kerja
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Work Orders Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Jenis</TableCell>
                  <TableCell>Prioritas</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Teknisi</TableCell>
                  <TableCell>Lokasi</TableCell>
                  <TableCell>Jadwal</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWorkOrders.map((workOrder) => (
                  <TableRow key={workOrder.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        WO-{workOrder.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getTypeLabel(workOrder.type)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getPriorityLabel(workOrder.priority)}
                        size="small"
                        color={getPriorityColor(workOrder.priority) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(workOrder.status)}
                        <Chip 
                          label={getStatusLabel(workOrder.status)}
                          size="small"
                          color={getStatusColor(workOrder.status) as any}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workOrder.assignedTo || 'Belum ditugaskan'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 16 }} />
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {workOrder.location.address}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workOrder.scheduledDate?.toLocaleDateString('id-ID')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {workOrder.scheduledDate?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, workOrder)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={Math.ceil(filteredWorkOrders.length / rowsPerPage)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </Card>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility sx={{ mr: 1 }} />
          Lihat Detail
        </MenuItem>
        <MenuItem onClick={handleStartWork}>
          <Build sx={{ mr: 1 }} />
          Mulai Kerja
        </MenuItem>
        <MenuItem onClick={handleCompleteWork}>
          <CheckCircle sx={{ mr: 1 }} />
          Selesai
        </MenuItem>
        <MenuItem>
          <Navigation sx={{ mr: 1 }} />
          Navigasi GPS
        </MenuItem>
        <MenuItem>
          <QrCode sx={{ mr: 1 }} />
          Scan QR Code
        </MenuItem>
      </Menu>

      {/* Work Order Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detail Perintah Kerja
          {selectedWorkOrder && ` - WO-${selectedWorkOrder.id}`}
        </DialogTitle>
        <DialogContent>
          {selectedWorkOrder && (
            <Box>
              {/* Progress Stepper */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Status Progress
                </Typography>
                <Stepper activeStep={getCurrentStep(selectedWorkOrder.status)} orientation="horizontal">
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Informasi Perintah Kerja
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>Jenis:</strong> {getTypeLabel(selectedWorkOrder.type)}</Typography>
                    <Typography><strong>Prioritas:</strong> {getPriorityLabel(selectedWorkOrder.priority)}</Typography>
                    <Typography><strong>Status:</strong> {getStatusLabel(selectedWorkOrder.status)}</Typography>
                    <Typography><strong>Teknisi:</strong> {selectedWorkOrder.assignedTo || 'Belum ditugaskan'}</Typography>
                    <Typography><strong>Deskripsi:</strong> {selectedWorkOrder.description}</Typography>
                    <Typography><strong>Lokasi:</strong> {selectedWorkOrder.location.address}</Typography>
                    <Typography><strong>Jadwal:</strong> {selectedWorkOrder.scheduledDate?.toLocaleString('id-ID')}</Typography>
                    <Typography><strong>Durasi Estimasi:</strong> {selectedWorkOrder.estimatedDuration} menit</Typography>
                    {selectedWorkOrder.actualDuration && (
                      <Typography><strong>Durasi Aktual:</strong> {selectedWorkOrder.actualDuration} menit</Typography>
                    )}
                    {selectedWorkOrder.completedDate && (
                      <Typography><strong>Tanggal Selesai:</strong> {selectedWorkOrder.completedDate.toLocaleString('id-ID')}</Typography>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Material yang Dibutuhkan
                  </Typography>
                  {selectedWorkOrder.materials && selectedWorkOrder.materials.length > 0 ? (
                    <List>
                      {selectedWorkOrder.materials.map((material) => (
                        <ListItem key={material.id} sx={{ px: 0 }}>
                          <ListItemText
                            primary={material.name}
                            secondary={`${material.quantity} ${material.unit} x Rp ${material.unitPrice.toLocaleString('id-ID')} = Rp ${material.totalPrice.toLocaleString('id-ID')}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Tidak ada material yang dibutuhkan
                    </Typography>
                  )}

                  {selectedWorkOrder.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Catatan
                      </Typography>
                      <Typography variant="body2">
                        {selectedWorkOrder.notes}
                      </Typography>
                    </Box>
                  )}

                  {selectedWorkOrder.photos && selectedWorkOrder.photos.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Dokumentasi Foto
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedWorkOrder.photos.map((photo, index) => (
                          <Chip
                            key={index}
                            label={photo}
                            icon={<CameraAlt />}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Tutup</Button>
          <Button variant="contained" startIcon={<Navigation />}>
            Navigasi GPS
          </Button>
          <Button variant="outlined" startIcon={<CameraAlt />}>
            Ambil Foto
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
