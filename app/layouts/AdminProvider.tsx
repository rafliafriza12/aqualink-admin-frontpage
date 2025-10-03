'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser, Permission, Notification } from '../types/admin.types';

interface AdminContextType {
  user: AdminUser | null;
  permissions: Permission[];
  notifications: Notification[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: React.ReactNode;
}

export default function AdminProvider({ children }: AdminProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulasi data admin untuk demo
  const mockAdminUser: AdminUser = {
    id: '1',
    username: 'admin',
    email: 'admin@pdam-tirtadaroy.ac.id',
    role: 'administrator',
    permissions: [
      { id: '1', name: 'Manage Users', resource: 'users', action: 'create' },
      { id: '2', name: 'View Users', resource: 'users', action: 'read' },
      { id: '3', name: 'Update Users', resource: 'users', action: 'update' },
      { id: '4', name: 'Delete Users', resource: 'users', action: 'delete' },
      { id: '5', name: 'Manage Customers', resource: 'customers', action: 'create' },
      { id: '6', name: 'View Customers', resource: 'customers', action: 'read' },
      { id: '7', name: 'Update Customers', resource: 'customers', action: 'update' },
      { id: '8', name: 'Manage Billing', resource: 'billing', action: 'create' },
      { id: '9', name: 'View Billing', resource: 'billing', action: 'read' },
      { id: '10', name: 'Update Billing', resource: 'billing', action: 'update' },
      { id: '11', name: 'Manage Work Orders', resource: 'workorders', action: 'create' },
      { id: '12', name: 'View Work Orders', resource: 'workorders', action: 'read' },
      { id: '13', name: 'Update Work Orders', resource: 'workorders', action: 'update' },
      { id: '14', name: 'View Reports', resource: 'reports', action: 'read' },
      { id: '15', name: 'Create Reports', resource: 'reports', action: 'create' },
      { id: '16', name: 'Manage System', resource: 'system', action: 'execute' },
    ],
    isActive: true,
    sessionTimeout: 30, // 30 menit
    maxConcurrentSessions: 2,
  };

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Tekanan Air Rendah',
      message: 'Tekanan air di zona A menurun hingga 1.2 bar',
      priority: 'high',
      isRead: false,
      createdAt: new Date(),
      actionUrl: '/dashboard/operational',
    },
    {
      id: '2',
      type: 'info',
      title: 'Pembacaan Meteran Selesai',
      message: 'Pembacaan meteran untuk 1,250 pelanggan telah selesai',
      priority: 'medium',
      isRead: false,
      createdAt: new Date(),
      actionUrl: '/billing/readings',
    },
    {
      id: '3',
      type: 'error',
      title: 'Gangguan Sistem',
      message: 'Koneksi ke server SCADA terputus',
      priority: 'critical',
      isRead: false,
      createdAt: new Date(),
      actionUrl: '/system/monitoring',
    },
  ];

  useEffect(() => {
    // Cek session yang tersimpan
    const savedUser = localStorage.getItem('admin_user');
    const savedPermissions = localStorage.getItem('admin_permissions');
    const savedNotifications = localStorage.getItem('admin_notifications');

    if (savedUser && savedPermissions) {
      setUser(JSON.parse(savedUser));
      setPermissions(JSON.parse(savedPermissions));
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      setNotifications(mockNotifications);
    }

    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulasi login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (normalizedUsername === 'admin' && normalizedPassword === 'admin123') {
      setUser(mockAdminUser);
      setPermissions(mockAdminUser.permissions);
      
      // Simpan ke localStorage
      localStorage.setItem('admin_user', JSON.stringify(mockAdminUser));
      localStorage.setItem('admin_permissions', JSON.stringify(mockAdminUser.permissions));
      
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_permissions');
    localStorage.removeItem('admin_notifications');
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || user.role === 'administrator') return true;
    
    return permissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    localStorage.setItem('admin_notifications', JSON.stringify([newNotification, ...notifications]));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const value: AdminContextType = {
    user,
    permissions,
    notifications,
    login,
    logout,
    hasPermission,
    addNotification,
    markNotificationAsRead,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
