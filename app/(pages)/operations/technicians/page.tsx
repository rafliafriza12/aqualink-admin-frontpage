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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  Engineering,
} from '@mui/icons-material';
import AdminLayout from '../../../layouts/AdminLayout';
import { useAdmin } from '../../../layouts/AdminProvider';
import {
  getAllTechnicians,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  Technician,
  CreateTechnicianData,
} from '../../../services/technician.service';

export default function TechnicianManagement() {
  const router = useRouter();
  const { userRole } = useAdmin();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateTechnicianData>({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const fetchTechnicians = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAllTechnicians();
      console.log('Technician Response:', response);

      // Handle both response structures
      let dataArray: Technician[] = [];
      if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        dataArray = response.data.data;
      }

      console.log('Parsed Technicians:', dataArray);
      setTechnicians(dataArray);
      setFilteredTechnicians(dataArray);
    } catch (err: any) {
      console.error('Error fetching technicians:', err);
      setError(err.response?.data?.message || 'Gagal memuat data teknisi');
      setTechnicians([]);
      setFilteredTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTechnicians(technicians);
    } else {
      const query = searchQuery.toLowerCase();
      // Pastikan technicians adalah array sebelum filter
      if (Array.isArray(technicians)) {
        const filtered = technicians.filter(
          tech =>
            tech.fullName.toLowerCase().includes(query) ||
            tech.email.toLowerCase().includes(query) ||
            tech.phone.includes(query)
        );
        setFilteredTechnicians(filtered);
      }
    }
  }, [searchQuery, technicians]);

  const handleCreateOpen = () => {
    setFormData({ fullName: '', email: '', password: '', phone: '' });
    setCreateDialogOpen(true);
  };

  const handleEditOpen = (technician: Technician) => {
    setSelectedTechnician(technician);
    setFormData({
      fullName: technician.fullName,
      email: technician.email,
      password: '',
      phone: technician.phone,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteOpen = (technician: Technician) => {
    setSelectedTechnician(technician);
    setDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await createTechnician(formData);

      if (response.status === 201) {
        setSuccess('Teknisi berhasil ditambahkan');
        setCreateDialogOpen(false);
        await fetchTechnicians();
      }
    } catch (err: any) {
      console.error('Error creating technician:', err);
      setError(err.response?.data?.message || 'Gagal menambahkan teknisi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTechnician) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: any = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await updateTechnician(
        selectedTechnician._id,
        updateData
      );

      if (response.status === 200) {
        setSuccess('Teknisi berhasil diperbarui');
        setEditDialogOpen(false);
        await fetchTechnicians();
      }
    } catch (err: any) {
      console.error('Error updating technician:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui teknisi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTechnician) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await deleteTechnician(selectedTechnician._id);

      if (response.status === 200) {
        setSuccess('Teknisi berhasil dihapus');
        setDeleteDialogOpen(false);
        await fetchTechnicians();
      }
    } catch (err: any) {
      console.error('Error deleting technician:', err);
      setError(err.response?.data?.message || 'Gagal menghapus teknisi');
    } finally {
      setActionLoading(false);
    }
  };

  // Only admin can manage technicians
  if (userRole !== 'admin') {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity='error'>
            Akses ditolak. Hanya admin yang dapat mengelola teknisi.
          </Alert>
        </Box>
      </AdminLayout>
    );
  }

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
              Manajemen Teknisi
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Kelola data teknisi lapangan
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant='outlined'
              startIcon={<Refresh />}
              onClick={fetchTechnicians}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={handleCreateOpen}
            >
              Tambah Teknisi
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity='success'
            sx={{ mb: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder='Cari nama, email, atau nomor telepon...'
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
            ) : filteredTechnicians.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Engineering
                  sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant='h6' color='text.secondary'>
                  Tidak ada data teknisi
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nama Lengkap</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Nomor Telepon</TableCell>
                      <TableCell>Tanggal Dibuat</TableCell>
                      <TableCell align='center'>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(filteredTechnicians) &&
                      filteredTechnicians.map(tech => (
                        <TableRow key={tech._id} hover>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Engineering color='primary' />
                              <Typography variant='body2' fontWeight='bold'>
                                {tech.fullName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{tech.email}</TableCell>
                          <TableCell>{tech.phone}</TableCell>
                          <TableCell>
                            {new Date(tech.createdAt).toLocaleDateString(
                              'id-ID'
                            )}
                          </TableCell>
                          <TableCell align='center'>
                            <Tooltip title='Edit'>
                              <IconButton
                                size='small'
                                color='primary'
                                onClick={() => handleEditOpen(tech)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Hapus'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleDeleteOpen(tech)}
                              >
                                <Delete />
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

        {/* Create Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Tambah Teknisi Baru</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Nama Lengkap'
                  value={formData.fullName}
                  onChange={e =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Password'
                  type='password'
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Nomor Telepon'
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Batal</Button>
            <Button
              variant='contained'
              onClick={handleCreate}
              disabled={
                actionLoading ||
                !formData.fullName ||
                !formData.email ||
                !formData.password ||
                !formData.phone
              }
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Tambah'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Edit Teknisi</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Nama Lengkap'
                  value={formData.fullName}
                  onChange={e =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Password (Kosongkan jika tidak ingin diubah)'
                  type='password'
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Nomor Telepon'
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button
              variant='contained'
              onClick={handleUpdate}
              disabled={
                actionLoading ||
                !formData.fullName ||
                !formData.email ||
                !formData.phone
              }
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogContent>
            <Typography>
              Apakah Anda yakin ingin menghapus teknisi{' '}
              <strong>{selectedTechnician?.fullName}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button
              variant='contained'
              color='error'
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Hapus'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
