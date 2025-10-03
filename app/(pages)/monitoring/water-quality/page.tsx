'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  WaterDrop,
  Science,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Download,
  Add,
  LocationOn,
  Schedule,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AdminLayout from '../../../layouts/AdminLayout';
import { waterQualityAPI } from '../../../utils/API';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface WaterQualityData {
  id: string;
  location: string;
  timestamp: string;
  parameters: {
    ph: number;
    turbidity: number;
    chlorine: number;
    tds: number;
    temperature: number;
    conductivity: number;
    dissolvedOxygen: number;
    alkalinity: number;
  };
  status: 'excellent' | 'good' | 'acceptable' | 'poor';
  alerts: string[];
}

interface TestResult {
  id: string;
  sampleId: string;
  location: string;
  collectedAt: string;
  testedAt: string;
  parameters: Record<string, number>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  technician: string;
  notes?: string;
}

const COLORS = ['#4caf50', '#ff9800', '#2196f3', '#f44336'];

export default function WaterQualityMonitoring() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState<WaterQualityData[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [newTest, setNewTest] = useState({
    location: '',
    sampleType: 'routine',
    priority: 'normal',
    parameters: [],
    notes: ''
  });

  const qualityParameters = [
    { key: 'ph', label: 'pH', unit: '', min: 6.5, max: 8.5, color: '#2196f3' },
    { key: 'turbidity', label: 'Kekeruhan', unit: 'NTU', min: 0, max: 5, color: '#ff9800' },
    { key: 'chlorine', label: 'Klor Bebas', unit: 'mg/L', min: 0.2, max: 1.0, color: '#4caf50' },
    { key: 'tds', label: 'TDS', unit: 'mg/L', min: 0, max: 500, color: '#9c27b0' },
    { key: 'temperature', label: 'Suhu', unit: '°C', min: 20, max: 30, color: '#f44336' },
    { key: 'conductivity', label: 'Konduktivitas', unit: 'µS/cm', min: 50, max: 1000, color: '#795548' },
    { key: 'dissolvedOxygen', label: 'Oksigen Terlarut', unit: 'mg/L', min: 5, max: 10, color: '#00bcd4' },
    { key: 'alkalinity', label: 'Alkalinitas', unit: 'mg/L CaCO3', min: 50, max: 200, color: '#607d8b' },
  ];

  const locations = [
    'Reservoir Utama',
    'Treatment Plant A',
    'Treatment Plant B',
    'Distribution Point 1',
    'Distribution Point 2',
    'Distribution Point 3',
    'Consumer Tap - Zone A',
    'Consumer Tap - Zone B',
    'Consumer Tap - Zone C'
  ];

  useEffect(() => {
    fetchData();
    const interval = autoRefresh ? setInterval(fetchData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Simulate API calls - replace with actual API
      const mockRealTimeData: WaterQualityData[] = locations.map((location, index) => ({
        id: `wq-${index}`,
        location,
        timestamp: new Date().toISOString(),
        parameters: {
          ph: 7.2 + Math.random() * 0.6,
          turbidity: Math.random() * 3,
          chlorine: 0.3 + Math.random() * 0.4,
          tds: 200 + Math.random() * 100,
          temperature: 24 + Math.random() * 4,
          conductivity: 300 + Math.random() * 200,
          dissolvedOxygen: 6 + Math.random() * 2,
          alkalinity: 100 + Math.random() * 50,
        },
        status: ['excellent', 'good', 'acceptable', 'poor'][Math.floor(Math.random() * 4)] as any,
        alerts: Math.random() > 0.7 ? ['pH level approaching limit'] : []
      }));

      const mockHistoricalData = Array.from({ length: 24 }, (_, i) => ({
        time: `${23 - i}:00`,
        ph: 7.2 + Math.random() * 0.6,
        turbidity: Math.random() * 3,
        chlorine: 0.3 + Math.random() * 0.4,
        temperature: 24 + Math.random() * 4,
      }));

      const mockTestResults: TestResult[] = Array.from({ length: 10 }, (_, i) => ({
        id: `test-${i}`,
        sampleId: `SAMPLE-2024-${String(i + 1).padStart(3, '0')}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        collectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        testedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        parameters: {
          ph: 7.2 + Math.random() * 0.6,
          turbidity: Math.random() * 3,
          chlorine: 0.3 + Math.random() * 0.4,
          bacteria: Math.floor(Math.random() * 10),
        },
        status: ['pending', 'in_progress', 'completed', 'failed'][Math.floor(Math.random() * 4)] as any,
        technician: ['Ahmad Rizki', 'Sari Dewi', 'Budi Santoso'][Math.floor(Math.random() * 3)],
        notes: Math.random() > 0.5 ? 'Sample dalam kondisi baik' : undefined
      }));

      setRealTimeData(mockRealTimeData);
      setHistoricalData(mockHistoricalData);
      setTestResults(mockTestResults);
    } catch (error) {
      console.error('Error fetching water quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'acceptable': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle />;
      case 'good': return <CheckCircle />;
      case 'acceptable': return <Warning />;
      case 'poor': return <Error />;
      default: return <Warning />;
    }
  };

  const getParameterStatus = (value: number, parameter: any) => {
    if (value < parameter.min || value > parameter.max) {
      return 'error';
    } else if (value < parameter.min * 1.1 || value > parameter.max * 0.9) {
      return 'warning';
    }
    return 'success';
  };

  const handleCreateTest = async () => {
    try {
      setLoading(true);
      // await waterQualityAPI.createTest(newTest);
      setOpenTestDialog(false);
      setNewTest({
        location: '',
        sampleType: 'routine',
        priority: 'normal',
        parameters: [],
        notes: ''
      });
      await fetchData();
    } catch (error) {
      console.error('Error creating test:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Lokasi', 'Waktu', 'pH', 'Kekeruhan (NTU)', 'Klor (mg/L)', 'Suhu (°C)', 'Status'],
      ...realTimeData.map(data => [
        data.location,
        new Date(data.timestamp).toLocaleString('id-ID'),
        data.parameters.ph.toFixed(2),
        data.parameters.turbidity.toFixed(2),
        data.parameters.chlorine.toFixed(2),
        data.parameters.temperature.toFixed(1),
        data.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water-quality-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && realTimeData.length === 0) {
    return (
      <AdminLayout title="Monitoring Kualitas Air">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Monitoring Kualitas Air">
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Monitoring Kualitas Air
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportData}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenTestDialog(true)}
            >
              Tes Baru
            </Button>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Real-time" icon={<WaterDrop />} />
            <Tab label="Trend Historis" icon={<TrendingUp />} />
            <Tab label="Hasil Lab" icon={<Science />} />
            <Tab label="Laporan" icon={<Assessment />} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Status Overview Cards */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {['excellent', 'good', 'acceptable', 'poor'].map((status) => {
                  const count = realTimeData.filter(d => d.status === status).length;
                  return (
                    <Grid item xs={12} sm={6} md={3} key={status}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(status)}
                            <Box>
                              <Typography variant="h6">{count}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {status === 'excellent' && 'Sangat Baik'}
                                {status === 'good' && 'Baik'}
                                {status === 'acceptable' && 'Dapat Diterima'}
                                {status === 'poor' && 'Buruk'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            {/* Real-time Data Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Data Real-time Kualitas Air
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Lokasi</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="center">pH</TableCell>
                          <TableCell align="center">Kekeruhan</TableCell>
                          <TableCell align="center">Klor Bebas</TableCell>
                          <TableCell align="center">Suhu</TableCell>
                          <TableCell align="center">TDS</TableCell>
                          <TableCell>Update Terakhir</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {realTimeData.map((data) => (
                          <TableRow key={data.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn fontSize="small" />
                                {data.location}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(data.status)}
                                label={
                                  data.status === 'excellent' ? 'Sangat Baik' :
                                  data.status === 'good' ? 'Baik' :
                                  data.status === 'acceptable' ? 'Dapat Diterima' : 'Buruk'
                                }
                                color={getStatusColor(data.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={`Normal: 6.5-8.5`}>
                                <Chip
                                  label={data.parameters.ph.toFixed(2)}
                                  size="small"
                                  color={getParameterStatus(data.parameters.ph, qualityParameters[0]) as any}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={`Normal: 0-5 NTU`}>
                                <Chip
                                  label={`${data.parameters.turbidity.toFixed(2)} NTU`}
                                  size="small"
                                  color={getParameterStatus(data.parameters.turbidity, qualityParameters[1]) as any}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={`Normal: 0.2-1.0 mg/L`}>
                                <Chip
                                  label={`${data.parameters.chlorine.toFixed(3)} mg/L`}
                                  size="small"
                                  color={getParameterStatus(data.parameters.chlorine, qualityParameters[2]) as any}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={`Normal: 20-30°C`}>
                                <Chip
                                  label={`${data.parameters.temperature.toFixed(1)}°C`}
                                  size="small"
                                  color={getParameterStatus(data.parameters.temperature, qualityParameters[4]) as any}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={`Normal: 0-500 mg/L`}>
                                <Chip
                                  label={`${data.parameters.tds.toFixed(0)} mg/L`}
                                  size="small"
                                  color={getParameterStatus(data.parameters.tds, qualityParameters[3]) as any}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Schedule fontSize="small" />
                                {new Date(data.timestamp).toLocaleTimeString('id-ID')}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trend Parameter Kualitas Air (24 Jam Terakhir)
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="ph" stroke="#2196f3" name="pH" />
                        <Line type="monotone" dataKey="turbidity" stroke="#ff9800" name="Kekeruhan (NTU)" />
                        <Line type="monotone" dataKey="chlorine" stroke="#4caf50" name="Klor (mg/L)" />
                        <Line type="monotone" dataKey="temperature" stroke="#f44336" name="Suhu (°C)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribusi Status Kualitas
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Sangat Baik', value: realTimeData.filter(d => d.status === 'excellent').length },
                            { name: 'Baik', value: realTimeData.filter(d => d.status === 'good').length },
                            { name: 'Dapat Diterima', value: realTimeData.filter(d => d.status === 'acceptable').length },
                            { name: 'Buruk', value: realTimeData.filter(d => d.status === 'poor').length },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Parameter Rata-rata Hari Ini
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={qualityParameters.slice(0, 4).map(param => ({
                          name: param.label,
                          value: realTimeData.reduce((sum, data) => sum + data.parameters[param.key as keyof typeof data.parameters], 0) / realTimeData.length,
                          unit: param.unit
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip
                          formatter={(value: any, name, props) => [
                            `${Number(value).toFixed(2)} ${props.payload.unit}`,
                            'Rata-rata'
                          ]}
                        />
                        <Bar dataKey="value" fill="#2196f3" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hasil Tes Laboratorium
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID Sampel</TableCell>
                          <TableCell>Lokasi</TableCell>
                          <TableCell>Tanggal Ambil</TableCell>
                          <TableCell>Tanggal Tes</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Teknisi</TableCell>
                          <TableCell>Aksi</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {testResults.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell>{test.sampleId}</TableCell>
                            <TableCell>{test.location}</TableCell>
                            <TableCell>
                              {new Date(test.collectedAt).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              {new Date(test.testedAt).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  test.status === 'pending' ? 'Menunggu' :
                                  test.status === 'in_progress' ? 'Sedang Diproses' :
                                  test.status === 'completed' ? 'Selesai' : 'Gagal'
                                }
                                color={
                                  test.status === 'completed' ? 'success' :
                                  test.status === 'failed' ? 'error' : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{test.technician}</TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined">
                                Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Fitur laporan dalam pengembangan. Akan tersedia dalam versi berikutnya.
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>

      {/* Create Test Dialog */}
      <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Buat Tes Kualitas Air Baru</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Lokasi Sampling</InputLabel>
                <Select
                  value={newTest.location}
                  onChange={(e) => setNewTest({ ...newTest, location: e.target.value })}
                  label="Lokasi Sampling"
                >
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Jenis Tes</InputLabel>
                <Select
                  value={newTest.sampleType}
                  onChange={(e) => setNewTest({ ...newTest, sampleType: e.target.value })}
                  label="Jenis Tes"
                >
                  <MenuItem value="routine">Rutin</MenuItem>
                  <MenuItem value="complaint">Keluhan</MenuItem>
                  <MenuItem value="emergency">Darurat</MenuItem>
                  <MenuItem value="regulatory">Regulasi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Prioritas</InputLabel>
                <Select
                  value={newTest.priority}
                  onChange={(e) => setNewTest({ ...newTest, priority: e.target.value })}
                  label="Prioritas"
                >
                  <MenuItem value="low">Rendah</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">Tinggi</MenuItem>
                  <MenuItem value="urgent">Mendesak</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Catatan"
                multiline
                rows={3}
                value={newTest.notes}
                onChange={(e) => setNewTest({ ...newTest, notes: e.target.value })}
                placeholder="Catatan tambahan untuk tes ini..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>Batal</Button>
          <Button
            onClick={handleCreateTest}
            variant="contained"
            disabled={!newTest.location}
          >
            Buat Tes
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}