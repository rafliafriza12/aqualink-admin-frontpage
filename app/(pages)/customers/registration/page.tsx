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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Person,
  Home,
  LocationOn,
  Description,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Upload,
  CheckCircle,
} from '@mui/icons-material';
import AdminLayout from '../../../layouts/AdminLayout';
import { customerAPI } from '../../../utils/API';

const steps = ['Informasi Pribadi', 'Alamat & Lokasi', 'Dokumen', 'Konfirmasi'];

export default function CustomerRegistration() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nik: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    customerType: 'rumah_tangga',
    gender: '',
    birthDate: '',
    occupation: '',
    location: {
      latitude: -5.5483,
      longitude: 95.3238,
      address: ''
    },
    documents: {
      ktp: null as File | null,
      kk: null as File | null,
      domicile: null as File | null,
      npwp: null as File | null
    }
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    switch (step) {
      case 0:
        if (!formData.nik || formData.nik.length !== 16) {
          setError('NIK harus 16 digit');
          return false;
        }
        if (!formData.name || formData.name.length < 3) {
          setError('Nama lengkap minimal 3 karakter');
          return false;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Format email tidak valid');
          return false;
        }
        if (!formData.phone || !/^(\+62|62|0)[0-9]{9,12}$/.test(formData.phone)) {
          setError('Format nomor telepon tidak valid');
          return false;
        }
        return true;
      case 1:
        if (!formData.address || formData.address.length < 10) {
          setError('Alamat minimal 10 karakter');
          return false;
        }
        if (!formData.location.address || formData.location.address.length < 10) {
          setError('Alamat lokasi pemasangan minimal 10 karakter');
          return false;
        }
        return true;
      case 2:
        return true; // Documents are optional
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      setError('Mohon lengkapi semua field yang diperlukan');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFileUpload = (docType: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: file
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData for file uploads
      const submitData = new FormData();
      submitData.append('nik', formData.nik);
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('customerType', formData.customerType);
      submitData.append('gender', formData.gender);
      submitData.append('birthDate', formData.birthDate);
      submitData.append('occupation', formData.occupation);
      submitData.append('location', JSON.stringify(formData.location));

      // Append documents if available
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) {
          submitData.append(`documents[${key}]`, file);
        }
      });

      await customerAPI.create(submitData);

      setSuccess('Pelanggan berhasil didaftarkan! ID Pelanggan: ' + Date.now());

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          nik: '',
          name: '',
          email: '',
          phone: '',
          address: '',
          customerType: 'rumah_tangga',
          gender: '',
          birthDate: '',
          occupation: '',
          location: {
            latitude: -5.5483,
            longitude: 95.3238,
            address: ''
          },
          documents: {
            ktp: null,
            kk: null,
            domicile: null,
            npwp: null
          }
        });
        setActiveStep(0);
        setSuccess(null);
      }, 5000);

    } catch (err: any) {
      setError('Gagal mendaftarkan pelanggan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                Informasi Pribadi
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NIK"
                value={formData.nik}
                onChange={(e) => handleInputChange('nik', e.target.value)}
                required
                inputProps={{ maxLength: 16 }}
                helperText="Nomor Induk Kependudukan (16 digit)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nomor Telepon"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                helperText="Contoh: 081234567890"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Jenis Pelanggan</InputLabel>
                <Select
                  value={formData.customerType}
                  onChange={(e) => handleInputChange('customerType', e.target.value)}
                  label="Jenis Pelanggan"
                >
                  <MenuItem value="rumah_tangga">Rumah Tangga</MenuItem>
                  <MenuItem value="komersial">Komersial</MenuItem>
                  <MenuItem value="industri">Industri</MenuItem>
                  <MenuItem value="sosial">Sosial</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Jenis Kelamin</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  label="Jenis Kelamin"
                >
                  <MenuItem value="L">Laki-laki</MenuItem>
                  <MenuItem value="P">Perempuan</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tanggal Lahir"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pekerjaan"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" />
                Alamat & Lokasi
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alamat Lengkap"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                helperText="Alamat lengkap sesuai KTP"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alamat Lokasi Pemasangan"
                multiline
                rows={2}
                value={formData.location.address}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                required
                helperText="Alamat lokasi pemasangan (jika berbeda dari alamat KTP)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.location.latitude}
                onChange={(e) => handleInputChange('location.latitude', parseFloat(e.target.value))}
                helperText="Koordinat GPS latitude"
                inputProps={{ step: 'any' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.location.longitude}
                onChange={(e) => handleInputChange('location.longitude', parseFloat(e.target.value))}
                helperText="Koordinat GPS longitude"
                inputProps={{ step: 'any' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  💡 <strong>Tips:</strong> Gunakan aplikasi maps untuk mendapatkan koordinat GPS yang akurat
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" />
                Dokumen Pendukung
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Dokumen yang diperlukan untuk verifikasi pelanggan (opsional saat registrasi):
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Kartu Tanda Penduduk (KTP)
                  </Typography>
                  <input
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    id="ktp-upload"
                    type="file"
                    onChange={(e) => handleFileUpload('ktp', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="ktp-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload />}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {formData.documents.ktp ? formData.documents.ktp.name : 'Upload KTP'}
                    </Button>
                  </label>
                  {formData.documents.ktp && (
                    <Chip
                      label={`${(formData.documents.ktp.size / 1024).toFixed(0)} KB`}
                      onDelete={() => handleFileUpload('ktp', null)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Kartu Keluarga (KK)
                  </Typography>
                  <input
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    id="kk-upload"
                    type="file"
                    onChange={(e) => handleFileUpload('kk', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="kk-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload />}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {formData.documents.kk ? formData.documents.kk.name : 'Upload KK'}
                    </Button>
                  </label>
                  {formData.documents.kk && (
                    <Chip
                      label={`${(formData.documents.kk.size / 1024).toFixed(0)} KB`}
                      onDelete={() => handleFileUpload('kk', null)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Surat Domisili
                  </Typography>
                  <input
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    id="domicile-upload"
                    type="file"
                    onChange={(e) => handleFileUpload('domicile', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="domicile-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload />}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {formData.documents.domicile ? formData.documents.domicile.name : 'Upload Surat Domisili'}
                    </Button>
                  </label>
                  {formData.documents.domicile && (
                    <Chip
                      label={`${(formData.documents.domicile.size / 1024).toFixed(0)} KB`}
                      onDelete={() => handleFileUpload('domicile', null)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    NPWP (untuk komersial/industri)
                  </Typography>
                  <input
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    id="npwp-upload"
                    type="file"
                    onChange={(e) => handleFileUpload('npwp', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="npwp-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload />}
                      fullWidth
                      sx={{ mt: 1 }}
                      disabled={formData.customerType === 'rumah_tangga' || formData.customerType === 'sosial'}
                    >
                      {formData.documents.npwp ? formData.documents.npwp.name : 'Upload NPWP'}
                    </Button>
                  </label>
                  {formData.documents.npwp && (
                    <Chip
                      label={`${(formData.documents.npwp.size / 1024).toFixed(0)} KB`}
                      onDelete={() => handleFileUpload('npwp', null)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="primary" />
                Konfirmasi Data
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Data Pelanggan</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">NIK:</Typography>
                    <Typography variant="body1">{formData.nik}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Nama:</Typography>
                    <Typography variant="body1">{formData.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body1">{formData.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Telepon:</Typography>
                    <Typography variant="body1">{formData.phone}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Jenis:</Typography>
                    <Typography variant="body1">{formData.customerType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Jenis Kelamin:</Typography>
                    <Typography variant="body1">{formData.gender || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Tanggal Lahir:</Typography>
                    <Typography variant="body1">{formData.birthDate || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Pekerjaan:</Typography>
                    <Typography variant="body1">{formData.occupation || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Alamat:</Typography>
                    <Typography variant="body1">{formData.address}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Lokasi Pemasangan:</Typography>
                    <Typography variant="body1">{formData.location.address}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Dokumen:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {formData.documents.ktp && <Chip label="KTP" size="small" color="primary" />}
                      {formData.documents.kk && <Chip label="KK" size="small" color="primary" />}
                      {formData.documents.domicile && <Chip label="Domisili" size="small" color="primary" />}
                      {formData.documents.npwp && <Chip label="NPWP" size="small" color="primary" />}
                      {!formData.documents.ktp && !formData.documents.kk && !formData.documents.domicile && !formData.documents.npwp && (
                        <Typography variant="body2">Tidak ada dokumen</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="warning">
                Pastikan semua data sudah benar sebelum menyimpan. Data yang sudah disimpan akan memerlukan proses verifikasi lebih lanjut untuk diubah.
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <AdminLayout title="Registrasi Pelanggan">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          Registrasi Pelanggan Baru
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 3 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<Cancel />}
              >
                Kembali
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  {loading ? 'Menyimpan...' : 'Simpan & Daftar'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validateStep(activeStep)}
                >
                  Selanjutnya
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
}