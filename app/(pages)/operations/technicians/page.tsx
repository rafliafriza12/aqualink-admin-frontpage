'use client';

import React, { useState } from 'react';
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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Pagination,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Build,
  CheckCircle,
  Warning,
  Phone,
  Email,
  Assignment,
} from '@mui/icons-material';
import AdminLayout from '../../../layouts/AdminLayout';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  status: 'active' | 'inactive' | 'on_leave';
  assignedWorkOrders: number;
  completedWorkOrders: number;
  rating: number;
  joinDate: Date;
}

const mockTechnicians: Technician[] = [
  {
    id: '1',
    name: 'Teknisi Ahmad',
    email: 'ahmad@pdam.ac.id',
    phone: '081234567890',
    specialization: 'Instalasi',
    status: 'active',
    assignedWorkOrders: 5,
    completedWorkOrders: 120,
    rating: 4.8,
    joinDate: new Date('2020-01-15'),
  },
  {
    id: '2',
    name: 'Teknisi Budi',
    email: 'budi@pdam.ac.id',
    phone: '081234567891',
    specialization: 'Perbaikan',
    status: 'active',
    assignedWorkOrders: 3,
    completedWorkOrders: 98,
    rating: 4.5,
    joinDate: new Date('2020-06-10'),
  },
  {
    id: '3',
    name: 'Teknisi Citra',
    email: 'citra@pdam.ac.id',
    phone: '081234567892',
    specialization: 'Inspeksi',
    status: 'on_leave',
    assignedWorkOrders: 0,
    completedWorkOrders: 76,
    rating: 4.6,
    joinDate: new Date('2021-03-20'),
  },
];

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>(mockTechnicians);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, technician: Technician) => {
    setAnchorEl(event.currentTarget);
    setSelectedTechnician(technician);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.phone.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || tech.status === filterStatus;
    const matchesSpecialization = filterSpecialization === 'all' || tech.specialization === filterSpecialization;

    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'on_leave': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Tidak Aktif';
      case 'on_leave': return 'Cuti';
      default: return status;
    }
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTechnicians = filteredTechnicians.slice(startIndex, endIndex);

  return (
    <AdminLayout title="Manajemen Teknisi">
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Manajemen Teknisi
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
          >
            Tambah Teknisi
          </Button>
        </Box>

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
                      {technicians.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Teknisi
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
                      {technicians.filter(t => t.status === 'active').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Teknisi Aktif
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
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {technicians.reduce((sum, t) => sum + t.assignedWorkOrders, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tugas Aktif
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
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {technicians.reduce((sum, t) => sum + t.completedWorkOrders, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Selesai
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Cari teknisi..."
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

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">Semua</MenuItem>
                    <MenuItem value="active">Aktif</MenuItem>
                    <MenuItem value="inactive">Tidak Aktif</MenuItem>
                    <MenuItem value="on_leave">Cuti</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Spesialisasi</InputLabel>
                  <Select
                    value={filterSpecialization}
                    onChange={(e) => setFilterSpecialization(e.target.value)}
                    label="Spesialisasi"
                  >
                    <MenuItem value="all">Semua</MenuItem>
                    <MenuItem value="Instalasi">Instalasi</MenuItem>
                    <MenuItem value="Perbaikan">Perbaikan</MenuItem>
                    <MenuItem value="Inspeksi">Inspeksi</MenuItem>
                    <MenuItem value="Pemeliharaan">Pemeliharaan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Technicians Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teknisi</TableCell>
                  <TableCell>Kontak</TableCell>
                  <TableCell>Spesialisasi</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tugas Aktif</TableCell>
                  <TableCell>Selesai</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTechnicians.map((tech) => (
                  <TableRow key={tech.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {tech.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {tech.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Bergabung: {tech.joinDate.toLocaleDateString('id-ID')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <Phone sx={{ fontSize: 14, mr: 1, verticalAlign: 'middle' }} />
                          {tech.phone}
                        </Typography>
                        <Typography variant="body2">
                          <Email sx={{ fontSize: 14, mr: 1, verticalAlign: 'middle' }} />
                          {tech.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{tech.specialization}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(tech.status)}
                        size="small"
                        color={getStatusColor(tech.status) as any}
                      />
                    </TableCell>
                    <TableCell>{tech.assignedWorkOrders}</TableCell>
                    <TableCell>{tech.completedWorkOrders}</TableCell>
                    <TableCell>
                      <Chip
                        label={`⭐ ${tech.rating}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, tech)}
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
              count={Math.ceil(filteredTechnicians.length / rowsPerPage)}
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
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Assignment sx={{ mr: 1 }} />
          Tugas Aktif
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Hapus
        </MenuItem>
      </Menu>

      {/* Technician Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detail Teknisi</DialogTitle>
        <DialogContent>
          {selectedTechnician && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informasi Teknisi
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography><strong>Nama:</strong> {selectedTechnician.name}</Typography>
                  <Typography><strong>Email:</strong> {selectedTechnician.email}</Typography>
                  <Typography><strong>Telepon:</strong> {selectedTechnician.phone}</Typography>
                  <Typography><strong>Spesialisasi:</strong> {selectedTechnician.specialization}</Typography>
                  <Typography><strong>Status:</strong> {getStatusLabel(selectedTechnician.status)}</Typography>
                  <Typography><strong>Tugas Aktif:</strong> {selectedTechnician.assignedWorkOrders}</Typography>
                  <Typography><strong>Total Selesai:</strong> {selectedTechnician.completedWorkOrders}</Typography>
                  <Typography><strong>Rating:</strong> ⭐ {selectedTechnician.rating}</Typography>
                  <Typography><strong>Bergabung:</strong> {selectedTechnician.joinDate.toLocaleDateString('id-ID')}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Tutup</Button>
          <Button variant="contained">Edit Teknisi</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
