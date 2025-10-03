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
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  Refresh,
  MoreVert,
  Visibility,
  Settings,
  Warning,
  CheckCircle,
  Error,
  Speed,
  WaterDrop,
  Thermostat,
  Science,
  ElectricBolt,
  TrendingUp,
  TrendingDown,
  NotificationsActive,
  Map,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AdminLayout from '../../../../layouts/AdminLayout';
import { scadaAPI } from '../../../../utils/API';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scada-tabpanel-${index}`}
      aria-labelledby={`scada-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface PlantData {
  plantId: string;
  plantName: string;
  plantType: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  location: {
    address: string;
    coordinates: { latitude: number; longitude: number; };
  };
  waterFlow: {
    inletFlow: number;
    outletFlow: number;
    flowRate: number;
  };
  pressure: {
    inletPressure: number;
    outletPressure: number;
    systemPressure: number;
  };
  waterLevel: {
    currentLevel: number;
    maximumLevel: number;
    percentage: number;
  };
  waterQuality: {
    ph: { value: number; status: string; };
    turbidity: { value: number; status: string; };
    chlorine: { value: number; status: string; };
    temperature: { value: number; status: string; };
  };
  energy: {
    consumption: number;
    powerDemand: number;
    efficiency: number;
  };
  alarms: Array<{
    alarmId: string;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    acknowledged: boolean;
    createdAt: Date;
  }>;
  dataTimestamp: Date;
}

export default function SCADARealTime() {
  const [tabValue, setTabValue] = useState(0);
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Mock data for demonstration
  const mockPlants: PlantData[] = [
    {
      plantId: 'PLANT-001',
      plantName: 'Plant Pengolahan A',
      plantType: 'treatment_plant',
      status: 'normal',
      location: {
        address: 'Jl. Industri No. 1, Banda Aceh',
        coordinates: { latitude: 5.5483, longitude: 95.3238 }
      },
      waterFlow: {
        inletFlow: 1250,
        outletFlow: 1200,
        flowRate: 1225
      },
      pressure: {
        inletPressure: 3.2,
        outletPressure: 2.8,
        systemPressure: 3.0
      },
      waterLevel: {
        currentLevel: 7.5,
        maximumLevel: 10,
        percentage: 75
      },
      waterQuality: {
        ph: { value: 7.2, status: 'normal' },
        turbidity: { value: 0.5, status: 'normal' },
        chlorine: { value: 0.8, status: 'normal' },
        temperature: { value: 26.5, status: 'normal' }
      },
      energy: {
        consumption: 125.5,
        powerDemand: 85.2,
        efficiency: 87.3
      },
      alarms: [],
      dataTimestamp: new Date()
    },
    {
      plantId: 'PLANT-002',
      plantName: 'Plant Pengolahan B',
      plantType: 'treatment_plant',
      status: 'warning',
      location: {
        address: 'Jl. Industri No. 2, Banda Aceh',
        coordinates: { latitude: 5.5500, longitude: 95.3250 }
      },
      waterFlow: {
        inletFlow: 980,
        outletFlow: 950,
        flowRate: 965
      },
      pressure: {
        inletPressure: 2.8,
        outletPressure: 2.4,
        systemPressure: 2.6
      },
      waterLevel: {
        currentLevel: 4.2,
        maximumLevel: 8,
        percentage: 52.5
      },
      waterQuality: {
        ph: { value: 6.8, status: 'warning' },
        turbidity: { value: 1.2, status: 'warning' },
        chlorine: { value: 0.6, status: 'normal' },
        temperature: { value: 28.1, status: 'normal' }
      },
      energy: {
        consumption: 98.3,
        powerDemand: 72.1,
        efficiency: 82.1
      },
      alarms: [
        {
          alarmId: 'ALM-001',
          type: 'low_pressure',
          severity: 'warning',
          message: 'Tekanan sistem di bawah normal',
          acknowledged: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000)
        }
      ],
      dataTimestamp: new Date()
    },
    {
      plantId: 'RES-001',
      plantName: 'Reservoir Utama',
      plantType: 'reservoir',
      status: 'normal',
      location: {
        address: 'Jl. Reservoir Raya, Banda Aceh',
        coordinates: { latitude: 5.5600, longitude: 95.3300 }
      },
      waterFlow: {
        inletFlow: 2100,
        outletFlow: 2050,
        flowRate: 2075
      },
      pressure: {
        inletPressure: 4.1,
        outletPressure: 3.8,
        systemPressure: 3.95
      },
      waterLevel: {
        currentLevel: 12.8,
        maximumLevel: 15,
        percentage: 85.3
      },
      waterQuality: {
        ph: { value: 7.1, status: 'normal' },
        turbidity: { value: 0.3, status: 'normal' },
        chlorine: { value: 0.9, status: 'normal' },
        temperature: { value: 25.8, status: 'normal' }
      },
      energy: {
        consumption: 45.2,
        powerDemand: 32.1,
        efficiency: 92.5
      },
      alarms: [],
      dataTimestamp: new Date()
    }
  ];

  useEffect(() => {
    loadSCADAData();

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(loadSCADAData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSCADAData = async () => {
    try {
      setLoading(true);
      // For demo, use mock data
      setPlants(mockPlants);

      // Generate mock historical data
      const histData = generateMockHistoricalData();
      setHistoricalData(histData);

    } catch (err: any) {
      setError('Gagal memuat data SCADA: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistoricalData = () => {
    const data = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        flowRate: 1200 + Math.random() * 100,
        pressure: 2.8 + Math.random() * 0.8,
        waterLevel: 70 + Math.random() * 20,
        ph: 6.8 + Math.random() * 0.8,
        turbidity: 0.3 + Math.random() * 0.5,
      });
    }

    return data;
  };

  const handleRefresh = async () => {
    await loadSCADAData();
    setSuccess('Data SCADA berhasil di-refresh');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, plant: PlantData) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlant(plant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlant(null);
  };

  const handleViewDetails = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const acknowledgeAlarm = async (plantId: string, alarmId: string) => {
    try {
      // await scadaAPI.acknowledgeAlarm(plantId, alarmId, 'current-user');
      setSuccess('Alarm berhasil di-acknowledge');
      loadSCADAData();
    } catch (err: any) {
      setError('Gagal acknowledge alarm: ' + err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'critical': return <Error color="error" />;
      case 'offline': return <Error color="disabled" />;
      default: return <CheckCircle />;
    }
  };

  const getPlantTypeLabel = (type: string) => {
    switch (type) {
      case 'treatment_plant': return 'Plant Pengolahan';
      case 'reservoir': return 'Reservoir';
      case 'distribution_center': return 'Pusat Distribusi';
      case 'pumping_station': return 'Stasiun Pompa';
      default: return type;
    }
  };

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.plantId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || plant.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalActiveAlarms = plants.reduce((sum, plant) =>
    sum + plant.alarms.filter(alarm => !alarm.acknowledged).length, 0);

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Speed />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {plants.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Plant
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
                  {plants.filter(p => p.status === 'normal').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Normal
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
                <Warning />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {plants.filter(p => p.status === 'warning').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Warning
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
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <NotificationsActive />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {totalActiveAlarms}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Alarms
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Plant Status Grid */}
      {filteredPlants.map((plant) => (
        <Grid item xs={12} md={6} lg={4} key={plant.plantId}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {plant.plantName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getPlantTypeLabel(plant.plantType)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {plant.alarms.length > 0 && (
                    <Badge badgeContent={plant.alarms.length} color="error">
                      <NotificationsActive color="error" />
                    </Badge>
                  )}
                  <Chip
                    label={plant.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(plant.status) as any}
                    icon={getStatusIcon(plant.status)}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, plant)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WaterDrop color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {plant.waterFlow.flowRate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      L/min
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Speed color="info" sx={{ fontSize: 32 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {plant.pressure.systemPressure}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      bar
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Water Level</Typography>
                      <Typography variant="caption">{plant.waterLevel.percentage}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={plant.waterLevel.percentage}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={plant.waterLevel.percentage > 80 ? 'success' :
                             plant.waterLevel.percentage > 50 ? 'warning' : 'error'}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Update: {plant.dataTimestamp.toLocaleTimeString('id-ID')}
                </Typography>
                <Button size="small" onClick={() => { setSelectedPlant(plant); setOpenDialog(true); }}>
                  Detail
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderHistoricalTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Flow Rate (24 Jam Terakhir)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="flowRate" stroke="#2196F3" fill="#2196F3" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Pressure (24 Jam Terakhir)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="pressure" stroke="#4CAF50" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Water Level (24 Jam Terakhir)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="waterLevel" stroke="#FF9800" fill="#FF9800" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              pH Level (24 Jam Terakhir)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[6, 8]} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="ph" stroke="#9C27B0" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAlarmsTab = () => {
    const allAlarms = plants.flatMap(plant =>
      plant.alarms.map(alarm => ({
        ...alarm,
        plantName: plant.plantName,
        plantId: plant.plantId
      }))
    );

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Alarms
              </Typography>
              {allAlarms.length === 0 ? (
                <Alert severity="success">
                  Tidak ada alarm aktif saat ini
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Plant</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allAlarms.map((alarm) => (
                        <TableRow key={`${alarm.plantId}-${alarm.alarmId}`}>
                          <TableCell>{alarm.plantName}</TableCell>
                          <TableCell>
                            <Chip
                              label={alarm.type.replace('_', ' ').toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alarm.severity.toUpperCase()}
                              size="small"
                              color={alarm.severity === 'critical' ? 'error' :
                                     alarm.severity === 'warning' ? 'warning' : 'info'}
                            />
                          </TableCell>
                          <TableCell>{alarm.message}</TableCell>
                          <TableCell>
                            {alarm.createdAt.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell>
                            {!alarm.acknowledged && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => acknowledgeAlarm(alarm.plantId, alarm.alarmId)}
                              >
                                Acknowledge
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <AdminLayout title="SCADA Real-time">
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            SCADA Real-time Monitoring
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Auto-refresh setiap 10 detik">
              <CircularProgress size={20} />
            </Tooltip>
            <Tooltip title="Refresh Manual">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Cari plant..."
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
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="offline">Offline</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Map />}
                  sx={{ height: '56px' }}
                  onClick={() => setSuccess('Fitur peta akan segera tersedia')}
                >
                  Lihat Peta
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Overview" />
            <Tab label="Historical" />
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Alarms
                {totalActiveAlarms > 0 && (
                  <Badge badgeContent={totalActiveAlarms} color="error" />
                )}
              </Box>
            } />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderOverviewTab()
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderHistoricalTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderAlarmsTab()}
        </TabPanel>
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
        <MenuItem onClick={() => { setSuccess('Fitur konfigurasi akan segera tersedia'); handleMenuClose(); }}>
          <Settings sx={{ mr: 1 }} />
          Konfigurasi
        </MenuItem>
      </Menu>

      {/* Plant Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Detail Plant SCADA
          {selectedPlant && ` - ${selectedPlant.plantName}`}
        </DialogTitle>
        <DialogContent>
          {selectedPlant && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Informasi Plant
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography><strong>ID:</strong> {selectedPlant.plantId}</Typography>
                  <Typography><strong>Nama:</strong> {selectedPlant.plantName}</Typography>
                  <Typography><strong>Tipe:</strong> {getPlantTypeLabel(selectedPlant.plantType)}</Typography>
                  <Typography><strong>Status:</strong> {selectedPlant.status.toUpperCase()}</Typography>
                  <Typography><strong>Lokasi:</strong> {selectedPlant.location.address}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Data Real-time
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <WaterDrop color="primary" sx={{ fontSize: 32 }} />
                      <Typography variant="h6">{selectedPlant.waterFlow.flowRate}</Typography>
                      <Typography variant="caption">Flow Rate (L/min)</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Speed color="info" sx={{ fontSize: 32 }} />
                      <Typography variant="h6">{selectedPlant.pressure.systemPressure}</Typography>
                      <Typography variant="caption">Pressure (bar)</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Thermostat color="warning" sx={{ fontSize: 32 }} />
                      <Typography variant="h6">{selectedPlant.waterQuality.temperature.value}°C</Typography>
                      <Typography variant="caption">Temperature</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Science color="success" sx={{ fontSize: 32 }} />
                      <Typography variant="h6">{selectedPlant.waterQuality.ph.value}</Typography>
                      <Typography variant="caption">pH Level</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Water Quality Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">pH</Typography>
                      <Typography variant="h6">{selectedPlant.waterQuality.ph.value}</Typography>
                      <Chip
                        label={selectedPlant.waterQuality.ph.status}
                        size="small"
                        color={selectedPlant.waterQuality.ph.status === 'normal' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Turbidity</Typography>
                      <Typography variant="h6">{selectedPlant.waterQuality.turbidity.value} NTU</Typography>
                      <Chip
                        label={selectedPlant.waterQuality.turbidity.status}
                        size="small"
                        color={selectedPlant.waterQuality.turbidity.status === 'normal' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Chlorine</Typography>
                      <Typography variant="h6">{selectedPlant.waterQuality.chlorine.value} mg/L</Typography>
                      <Chip
                        label={selectedPlant.waterQuality.chlorine.status}
                        size="small"
                        color={selectedPlant.waterQuality.chlorine.status === 'normal' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Temperature</Typography>
                      <Typography variant="h6">{selectedPlant.waterQuality.temperature.value}°C</Typography>
                      <Chip
                        label={selectedPlant.waterQuality.temperature.status}
                        size="small"
                        color={selectedPlant.waterQuality.temperature.status === 'normal' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Tutup</Button>
          <Button variant="contained">Lihat Historical</Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}