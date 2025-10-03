'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Receipt,
  Build,
  Assessment,
  Settings,
  Notifications,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ChevronLeft,
  AdminPanelSettings,
  WaterDrop,
  Speed,
  Report,
  AccountTree,
  Security,
} from '@mui/icons-material';
import { useAdmin } from '../../layouts/AdminProvider';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  permission?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    id: 'customers',
    title: 'Manajemen Pelanggan',
    icon: <People />,
    children: [
      { id: 'customer-list', title: 'Daftar Pelanggan', icon: <People />, path: '/customers', permission: 'customers:read' },
      { id: 'customer-registration', title: 'Registrasi Baru', icon: <People />, path: '/customers/register', permission: 'customers:create' },
      { id: 'customer-accounts', title: 'Akun Pelanggan', icon: <AccountTree />, path: '/customers/accounts', permission: 'customers:read' },
    ],
  },
  {
    id: 'billing',
    title: 'Penagihan & Keuangan',
    icon: <Receipt />,
    children: [
      { id: 'billing-list', title: 'Tagihan', icon: <Receipt />, path: '/billing', permission: 'billing:read' },
      { id: 'billing-generate', title: 'Generate Tagihan', icon: <Receipt />, path: '/billing/generate', permission: 'billing:create' },
      { id: 'billing-payments', title: 'Pembayaran', icon: <Receipt />, path: '/billing/payments', permission: 'billing:read' },
      { id: 'billing-tariffs', title: 'Struktur Tarif', icon: <Receipt />, path: '/billing/tariffs', permission: 'billing:update' },
    ],
  },
  {
    id: 'operations',
    title: 'Operasi Lapangan',
    icon: <Build />,
    children: [
      { id: 'work-orders', title: 'Perintah Kerja', icon: <Build />, path: '/operations/work-orders', permission: 'workorders:read' },
      { id: 'technicians', title: 'Teknisi', icon: <Build />, path: '/operations/technicians', permission: 'workorders:read' },
      { id: 'materials', title: 'Material & Inventaris', icon: <Build />, path: '/operations/materials', permission: 'workorders:read' },
    ],
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    icon: <Speed />,
    children: [
      { id: 'scada', title: 'SCADA Real-time', icon: <Speed />, path: '/monitoring/scada', permission: 'system:execute' },
      { id: 'water-quality', title: 'Kualitas Air', icon: <WaterDrop />, path: '/monitoring/water-quality', permission: 'system:execute' },
      { id: 'smart-meters', title: 'Meteran Pintar', icon: <Speed />, path: '/monitoring/smart-meters', permission: 'system:execute' },
    ],
  },
  {
    id: 'reports',
    title: 'Laporan & Analitik',
    icon: <Assessment />,
    children: [
      { id: 'operational-reports', title: 'Laporan Operasional', icon: <Report />, path: '/reports/operational', permission: 'reports:read' },
      { id: 'financial-reports', title: 'Laporan Keuangan', icon: <Report />, path: '/reports/financial', permission: 'reports:read' },
      { id: 'compliance-reports', title: 'Laporan Kepatuhan', icon: <Report />, path: '/reports/compliance', permission: 'reports:read' },
      { id: 'custom-reports', title: 'Laporan Kustom', icon: <Report />, path: '/reports/custom', permission: 'reports:create' },
    ],
  },
  {
    id: 'system',
    title: 'Sistem',
    icon: <Settings />,
    children: [
      { id: 'users', title: 'Manajemen User', icon: <AdminPanelSettings />, path: '/system/users', permission: 'users:read' },
      { id: 'permissions', title: 'Izin & Role', icon: <Security />, path: '/system/permissions', permission: 'users:update' },
      { id: 'audit-logs', title: 'Log Audit', icon: <Security />, path: '/system/audit-logs', permission: 'system:execute' },
      { id: 'system-config', title: 'Konfigurasi', icon: <Settings />, path: '/system/config', permission: 'system:execute' },
    ],
  },
];

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission } = useAdmin();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      setExpandedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasAccess = !item.permission || hasPermission(
      item.permission.split(':')[0], 
      item.permission.split(':')[1]
    );

    if (!hasAccess) return null;

    const isExpanded = expandedItems.includes(item.id);
    const isActive = item.path === pathname;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              pl: 2 + level * 2,
              backgroundColor: isActive ? 'primary.main' : 'transparent',
              color: isActive ? 'primary.contrastText' : 'inherit',
              '&:hover': {
                backgroundColor: isActive ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontSize: level > 0 ? '0.875rem' : '1rem',
                fontWeight: isActive ? 600 : 400,
              }}
            />
            {item.children && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {item.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? 280 : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Flowin Admin
          </Typography>
          <IconButton onClick={onToggle} size="small">
            <ChevronLeft />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          PDAM Tirta Daroy
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          v1.0.0 - Admin Panel
        </Typography>
      </Box>
    </Drawer>
  );
}
