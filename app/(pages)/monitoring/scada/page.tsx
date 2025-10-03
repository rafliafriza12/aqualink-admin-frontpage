'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Refresh,
  Warning,
  CheckCircle,
  Error,
  Speed,
  WaterDrop,
  Battery,
  Signal,
  LocationOn,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, GaugeChart, Gauge } from 'recharts';
import AdminLayout from '../../../layouts/AdminLayout';
import { SCADAData } from '../../../types/admin.types';
import { scadaAPI } from '../../../utils/API';

// Mock data untuk demo
const mockSCADAData: SCADAData[] = [
  {
    timestamp: new Date(),
    plantId: 'PLANT-A',
    flowRate: 1250,
    pressure: 3.2,
    waterLevel: 85,
    ph: 7.2,
    turbidity: 0.8,
    chlorine: 0.5,
    temperature: 28,
    energyConsumption: 450,
    status: 'normal',
  },
  {
    timestamp: new Date(Date.now() - 300000),
    plantId: 'PLANT-A',
    flowRate: 1180,
    pressure: 3.0,
    waterLevel: 82,
    ph: 7.1,
    turbidity: 0.9,
    chlorine: 0.4,
    temperature: 29,
    energyConsumption: 440,
    status: 'normal',
  },
  {
    timestamp: new Date(Date.now() - 600000),
    plantId: 'PLANT-A',
    flowRate: 1320,
    pressure: 3.4,
    waterLevel: 88,
    ph: 7.3,
    turbidity: 0.7,
    chlorine: 0.6,
    temperature: 27,
    energyConsumption: 460,
    status: 'normal',
  },
];

const plantData = [
  {
    id: 'PLANT-A',
    name: 'Plant Pengolahan A',
    location: 'Banda Aceh Utara',
    capacity: 2000,
    status: 'normal',
    flowRate: 1250,
    pressure: 3.2,
    efficiency: 87.5,
  },
  {
    id: 'PLANT-B',
    name: 'Plant Pengolahan B',
    location: 'Banda Aceh Selatan',
    capacity: 1500,
    status: 'warning',
    flowRate: 980,
    pressure: 2.8,
    efficiency: 65.3,
  },
  {
    id: 'RESERVOIR-1',
    name: 'Reservoir Utama',
    location: 'Banda Aceh Pusat',
    capacity: 5000,
    status: 'normal',
    flowRate: 2100,
    pressure: 4.1,
    efficiency: 95.2,
  },
];

const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  flowRate: 1000 + Math.random() * 500,
  pressure: 2.5 + Math.random() * 1.5,
  ph: 6.8 + Math.random() * 0.8,
  turbidity: 0.5 + Math.random() * 0.8,
}));

export default function SCADADashboard() {
  const [scadaData, setScadaData] = useState<SCADAData[]>(mockSCADAData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulasi refresh data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update setiap 30 detik

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'critical': return <Error color="error" />;
      default: return <CheckCircle />;
    }
  };

  return (
    <AdminLayout title="Monitoring SCADA">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Monitoring SCADA Real-time
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Terakhir diperbarui: {lastUpdate.toLocaleString('id-ID')}
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} disabled={isRefreshing}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {plantData.map((plant) => (
          <Grid item xs={12} sm={6} md={4} key={plant.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {plant.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plant.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(plant.status)}
                    <Chip 
                      label={plant.status.toUpperCase()} 
                      size="small"
                      color={getStatusColor(plant.status) as any}
                    />
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Speed color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {plant.flowRate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        L/min
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <WaterDrop color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {plant.pressure}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        bar
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Efisiensi
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {plant.efficiency}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={plant.efficiency}
                    color={plant.efficiency >= 80 ? 'success' : plant.efficiency >= 60 ? 'warning' : 'error'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Real-time Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Parameter Real-time (24 Jam Terakhir)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'flowRate' ? `${value.toLocaleString('id-ID')} L/min` :
                        name === 'pressure' ? `${value} bar` :
                        name === 'ph' ? `${value}` :
                        `${value} NTU`,
                        name === 'flowRate' ? 'Aliran' :
                        name === 'pressure' ? 'Tekanan' :
                        name === 'ph' ? 'pH' : 'Kekeruhan'
                      ]}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="flowRate" stroke="#2196F3" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#4CAF50" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="ph" stroke="#FF9800" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="turbidity" stroke="#9C27B0" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Kualitas Air Saat Ini
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">pH</Typography>
                  <Typography variant="h6" color="success.main">7.2</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Kekeruhan</Typography>
                  <Typography variant="h6" color="success.main">0.8 NTU</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Klorin</Typography>
                  <Typography variant="h6" color="success.main">0.5 mg/L</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Suhu</Typography>
                  <Typography variant="h6" color="success.main">28°C</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status Kualitas
                  </Typography>
                  <Chip 
                    label="MEMENUHI STANDAR SNI" 
                    color="success" 
                    icon={<CheckCircle />}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts and Warnings */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Peringatan dan Alarm
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="warning" sx={{ alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning />
                    <Typography variant="body2">
                      Tekanan air di Plant B menurun hingga 2.8 bar (minimum: 3.0 bar)
                    </Typography>
                  </Box>
                </Alert>
                <Alert severity="info" sx={{ alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed />
                    <Typography variant="body2">
                      Pemeliharaan rutin Plant A dijadwalkan untuk besok pukul 08:00
                    </Typography>
                  </Box>
                </Alert>
                <Alert severity="success" sx={{ alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle />
                    <Typography variant="body2">
                      Semua parameter kualitas air dalam batas normal
                    </Typography>
                  </Box>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}
