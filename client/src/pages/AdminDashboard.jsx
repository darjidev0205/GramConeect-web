import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Users, Truck, MapPin, Package, Settings, LogOut, ArrowUpRight, Menu, X,
  Plus, Edit2, Trash2, ShieldAlert, CheckCircle2, DollarSign, Activity, 
  Bell, HelpCircle, BarChart3, FileSpreadsheet, RefreshCw, Compass,
  Search, Filter, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Download,
  Info, AlertTriangle, Check, Printer, FileText, Layers, CheckSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../components/auth/NotificationBell';
import { RoleSettings } from '../components/auth/RoleSettings';
import { AdminSupportCenter } from '../components/support/AdminSupportCenter';
import { io } from 'socket.io-client';
import API_BASE_URL from '../config/api';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dynamic menu configuration based on JWT permissions
  const menuConfig = [
    { id: 'dashboard', label: 'Overview', icon: Activity, permission: 'dashboard' },
    { id: 'orders', label: 'Orders Control', icon: Package, permission: 'manage_orders' },
    { id: 'hubs', label: 'Hub Management', icon: MapPin, permission: 'manage_hubs' },
    { id: 'users', label: 'Users List', icon: Users, permission: 'suspend_user' },
    { id: 'agents', label: 'Agents List', icon: Truck, permission: 'create_agent' }
  ];

  const allowedMenus = menuConfig.filter(item => {
    if (user?.permissions) {
      return user.permissions.includes(item.permission);
    }
    return true; // Fallback
  });
  
  // Tab Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data lists
  const [hubs, setHubs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mobile layout / Timers
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hubFilter, setHubFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting State
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & Popups State
  const [showHubModal, setShowHubModal] = useState(false);
  const [editingHubId, setEditingHubId] = useState(null);
  const [hubName, setHubName] = useState('');
  const [hubAddress, setHubAddress] = useState('');
  const [hubLat, setHubLat] = useState('20.5937');
  const [hubLng, setHubLng] = useState('78.9629');

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({
    recipientName: '',
    recipientPhone: '',
    deliveryAddress: '',
    hubId: '',
    weight: '1',
    cost: '50',
    priority: 'medium',
    paymentStatus: 'pending'
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [userRoleToCreate, setUserRoleToCreate] = useState('user');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Password123!',
    village: '',
    vehicleType: 'motorcycle',
    vehicleNumber: '',
    licenseNumber: ''
  });

  const [showReportModal, setShowReportModal] = useState(false);

  // Notifications List State
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: '🚨 New Logistics Order', message: 'Logistics order GC849102 has been placed.', type: 'info', read: false, time: '3m ago' },
    { id: 2, title: '⚠️ Delivery Failed', message: 'Order GC478192 could not find delivery partner.', type: 'alert', read: false, time: '12m ago' },
    { id: 3, title: '👤 New Agent Registration', message: 'Darji Dev registered as a Delivery Agent.', type: 'success', read: true, time: '1h ago' }
  ]);

  const mapInstanceRef = useRef(null);

  // Tick time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all administrative data
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Listen to Socket.io updates for real-time logistics sync
  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on('connect', () => {
      socket.emit('join_role', 'admin');
      if (user?.id || user?.userId) {
        socket.emit('join_user', user.id || user.userId);
      }
    });

    socket.on('order_update', () => {
      fetchAdminData();
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      // 1. Fetch Hubs
      const hubsRes = await fetch(`${API_BASE_URL}/api/hubs`);
      if (!hubsRes.ok) throw new Error('Failed to load hubs');
      const hubsData = await hubsRes.json();
      setHubs(hubsData);

      // 2. Fetch Orders
      const ordersRes = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!ordersRes.ok) throw new Error('Failed to load orders');
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      // 3. Fetch Registered Users/Agents
      const usersRes = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error('Failed to load user directories');
      const usersData = await usersRes.json();
      setUsersList(usersData);

    } catch (err) {
      console.error(err);
      setError('Could not establish administrative connection.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Hub Network Map
  useEffect(() => {
    const container = document.getElementById('admin-map');
    if (activeTab === 'dashboard' && container && window.L && hubs.length > 0) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const center = [hubs[0].location?.lat || 20.5937, hubs[0].location?.lng || 78.9629];
      const map = window.L.map('admin-map').setView(center, 5);
      mapInstanceRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      hubs.forEach(h => {
        if (h.location && h.location.lat) {
          window.L.marker([h.location.lat, h.location.lng])
            .addTo(map)
            .bindPopup(`<b>${h.name}</b><br/>${h.address}`);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, hubs]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // CRUD Hubs
  const handleSaveHub = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name: hubName,
      address: hubAddress,
      location: {
        lat: parseFloat(hubLat),
        lng: parseFloat(hubLng)
      },
      isActive: true
    };

    try {
      const token = localStorage.getItem('token');
      let response;
      if (editingHubId) {
        response = await fetch(`${API_BASE_URL}/api/hubs/${editingHubId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/hubs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) throw new Error('Could not save hub');

      setSuccess(editingHubId ? 'Hub updated successfully.' : 'New hub node established.');
      setShowHubModal(false);
      setEditingHubId(null);
      setHubName('');
      setHubAddress('');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Error processing hub node.');
    }
  };

  const deleteHub = async (id) => {
    if (!window.confirm('Are you sure you want to decommission this hub?')) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hubs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Decomission failed');
      setSuccess('Hub decommissioned successfully.');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Error deleting hub.');
    }
  };

  const startEditHub = (hub) => {
    setEditingHubId(hub._id);
    setHubName(hub.name);
    setHubAddress(hub.address);
    setHubLat(hub.location?.lat?.toString() || '20.5937');
    setHubLng(hub.location?.lng?.toString() || '78.9629');
    setShowHubModal(true);
  };

  // CRUD Users/Agents
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this account permanently?')) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Delete failed');
      setSuccess('Account directory profile deleted.');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Error deleting profile.');
    }
  };

  // Create Order Action
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        recipientName: orderForm.recipientName,
        recipientPhone: orderForm.recipientPhone,
        deliveryAddress: {
          address: orderForm.deliveryAddress,
          lat: 20.5937,
          lng: 78.9629
        },
        hub: orderForm.hubId,
        weight: parseFloat(orderForm.weight),
        cost: parseFloat(orderForm.cost),
        priority: orderForm.priority,
        paymentStatus: orderForm.paymentStatus
      };

      let response;
      if (editingOrder) {
        response = await fetch(`${API_BASE_URL}/api/orders/${editingOrder._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) throw new Error('Failed to save order.');
      setSuccess(editingOrder ? 'Order modified successfully.' : 'New logistics order placed.');
      setShowOrderModal(false);
      setEditingOrder(null);
      setOrderForm({
        recipientName: '',
        recipientPhone: '',
        deliveryAddress: '',
        hubId: '',
        weight: '1',
        cost: '50',
        priority: 'medium',
        paymentStatus: 'pending'
      });
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Error saving order.');
    }
  };

  // Create User/Agent Action
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        password: userForm.password,
        role: userRoleToCreate,
        village: userForm.village,
        termsAccepted: true
      };

      if (userRoleToCreate === 'agent') {
        payload.vehicle = {
          type: userForm.vehicleType,
          number: userForm.vehicleNumber,
          licenseNumber: userForm.licenseNumber
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Registration failed.');
      setSuccess(`New ${userRoleToCreate} directory account created.`);
      setShowUserModal(false);
      setUserForm({
        name: '',
        email: '',
        phone: '',
        password: 'Password123!',
        village: '',
        vehicleType: 'motorcycle',
        vehicleNumber: '',
        licenseNumber: ''
      });
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Error creating profile.');
    }
  };

  // Quick Action: Assign Agent manually
  const handleAssignAgent = async (orderId, agentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ agentId })
      });
      if (!response.ok) throw new Error('Assignment failed');
      setSuccess('Agent assigned to transit.');
      fetchAdminData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Quick Action: Update order status manually
  const handleUpdateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Status update failed');
      setSuccess('Order status updated.');
      fetchAdminData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Metrics calculations
  const totalUsers = usersList.filter(u => u.role === 'user').length;
  const totalAgents = usersList.filter(u => u.role === 'agent').length;
  const inTransitCount = orders.filter(o => o.status === 'in_transit').length;
  const deliveredTodayCount = orders.filter(o => {
    const today = new Date().toDateString();
    return o.status === 'delivered' && new Date(o.updatedAt).toDateString() === today;
  }).length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const failedDeliveriesCount = orders.filter(o => o.status === 'failed').length;
  const revenueTotal = orders.filter(o => o.status === 'delivered').length * 50;

  // Sorting & Filtering logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // 1. Search term match
      const s = searchTerm.toLowerCase();
      const matchesSearch = 
        o.trackingId?.toLowerCase().includes(s) ||
        o.recipientName?.toLowerCase().includes(s) ||
        o.recipientPhone?.toLowerCase().includes(s) ||
        o.user?.name?.toLowerCase().includes(s) ||
        o.user?.email?.toLowerCase().includes(s) ||
        o.agent?.name?.toLowerCase().includes(s);

      if (!matchesSearch) return false;

      // 2. Status match
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;

      // 3. Hub match
      if (hubFilter !== 'all' && o.hub?._id !== hubFilter) return false;

      // 4. Agent match
      if (agentFilter !== 'all' && o.agent?._id !== agentFilter) return false;

      // 5. Payment match
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;

      // 6. Priority match
      if (priorityFilter !== 'all' && o.priority !== priorityFilter) return false;

      // 7. Vehicle type match
      if (vehicleFilter !== 'all' && o.agent?.vehicle?.type !== vehicleFilter) return false;

      // 8. Date Range match
      if (dateRangeFilter !== 'all') {
        const orderDate = new Date(o.createdAt);
        const diffTime = Math.abs(new Date() - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dateRangeFilter === 'today' && orderDate.toDateString() !== new Date().toDateString()) return false;
        if (dateRangeFilter === 'week' && diffDays > 7) return false;
        if (dateRangeFilter === 'month' && diffDays > 30) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'recipientName') {
        valA = a.recipientName || '';
        valB = b.recipientName || '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, searchTerm, statusFilter, hubFilter, agentFilter, paymentFilter, priorityFilter, vehicleFilter, dateRangeFilter, sortField, sortOrder]);

  // Paginated Orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredOrders, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage) || 1;

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setHubFilter('all');
    setAgentFilter('all');
    setPaymentFilter('all');
    setPriorityFilter('all');
    setVehicleFilter('all');
    setDateRangeFilter('all');
    setCurrentPage(1);
  };

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = ['Tracking ID', 'Sender', 'Recipient', 'Pickup Hub', 'Status', 'Payment Status', 'Priority', 'Cost', 'OTP', 'Created Date'];
    const rows = filteredOrders.map(o => [
      o.trackingId,
      o.user?.name || 'N/A',
      o.recipientName || 'N/A',
      o.hub?.name || 'Local Hub',
      o.status,
      o.paymentStatus || 'Pending',
      o.priority || 'medium',
      o.cost,
      o.otp,
      new Date(o.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gramconnect_orders_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recent Activity Feed Generation
  const recentLogs = useMemo(() => {
    if (orders.length === 0) return [];
    return orders.slice(0, 10).map((order) => {
      let msg = `Order ${order.trackingId} transition: status is now "${order.status.toUpperCase()}".`;
      let icon = Package;
      let color = 'text-primary';
      if (order.status === 'delivered') {
        msg = `Order ${order.trackingId} successfully completed & delivered.`;
        icon = CheckCircle2;
        color = 'text-green-400';
      } else if (order.status === 'cancelled') {
        msg = `Order request ${order.trackingId} was cancelled by user.`;
        icon = X;
        color = 'text-red-400';
      } else if (order.status === 'in_transit') {
        msg = `Order ${order.trackingId} out in transit with Agent.`;
        icon = Truck;
        color = 'text-accent';
      }
      return {
        id: order._id,
        msg,
        time: new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon,
        color
      };
    });
  }, [orders]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-primary selection:text-black">
      
      {/* Top Header Navbar */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Settings className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              GRAMCONNECT
            </span>
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-muted-foreground">
              Enterprise Dashboard
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> {currentTime} | Live
            </span>

            {/* Notification Drawer Trigger */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-all relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-black text-xxs font-bold flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotificationsDrawer && (
                <div className="absolute right-0 mt-3 w-80 bg-neutral-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                    <span className="font-bold text-xs">Alert Notifications</span>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-xxs text-primary font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-2.5 rounded-xl text-xxs border ${n.read ? 'bg-black/20 border-white/5 text-muted-foreground' : 'bg-white/5 border-primary/20 text-white'}`}>
                        <div className="flex justify-between items-center font-bold">
                          <span>{n.title}</span>
                          <span className="text-xxs font-normal opacity-50">{n.time}</span>
                        </div>
                        <p className="mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center font-bold text-primary bg-neutral-900 shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-none">{user?.name || 'Administrator'}</p>
                <p className="text-xxs text-muted-foreground mt-0.5">Control Operator</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Mobile Dropdown navigation */}
        {sidebarOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 text-sm text-center">
              {allowedMenus.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} 
                  className={`p-3 rounded-xl border ${activeTab === item.id ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        )}
      </nav>

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6 relative">
        
        {/* Sidebar Left navigation links */}
        <aside className={`hidden lg:flex flex-col gap-2 shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
          <div className="p-2.5 bg-neutral-900 border border-white/5 rounded-3xl flex flex-col gap-1">
            {allowedMenus.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full py-3 px-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${activeTab === item.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                >
                  <Icon className="w-4.5 h-4.5" /> 
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-neutral-900 border border-white/5 rounded-3xl flex flex-col gap-1 mt-auto">
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`w-full py-3 px-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${activeTab === 'settings' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <Settings className="w-4.5 h-4.5" /> 
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
            <button 
              onClick={() => setActiveTab('support')} 
              className={`w-full py-3 px-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${activeTab === 'support' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <HelpCircle className="w-4.5 h-4.5" /> 
              {!sidebarCollapsed && <span>Support Tickets</span>}
            </button>
          </div>
        </aside>

        {/* Dashboard Work Area */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Status Alert Banners */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ========================================================
              SECTION 1: DASHBOARD OVERVIEW
              ======================================================== */}
          {activeTab === 'dashboard' && (
            <>
              {/* Statistic Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Orders */}
                <Card className="bg-neutral-900/60 backdrop-blur-xl border-white/5 p-4 flex flex-col justify-between min-h-[125px] hover:border-primary/20 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-black mt-1">{loading ? '...' : orders.length}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary"><Package className="w-4 h-4" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xxs text-primary font-bold flex items-center"><ArrowUp className="w-3 h-3 mr-0.5" /> +12.4%</span>
                    <svg viewBox="0 0 100 30" className="w-16 h-6 text-primary stroke-current fill-none stroke-2"><path d="M0,25 Q15,10 30,22 T60,5 T90,20" /></svg>
                  </div>
                </Card>

                {/* Orders in Transit */}
                <Card className="bg-neutral-900/60 backdrop-blur-xl border-white/5 p-4 flex flex-col justify-between min-h-[125px] hover:border-accent/20 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">Orders In Transit</p>
                      <p className="text-2xl font-black mt-1">{loading ? '...' : inTransitCount}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent/10 text-accent"><Truck className="w-4 h-4" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xxs text-accent font-bold flex items-center"><ArrowUp className="w-3 h-3 mr-0.5" /> +8.1%</span>
                    <svg viewBox="0 0 100 30" className="w-16 h-6 text-accent stroke-current fill-none stroke-2"><path d="M0,15 Q25,25 50,5 T90,15" /></svg>
                  </div>
                </Card>

                {/* Delivered Today */}
                <Card className="bg-neutral-900/60 backdrop-blur-xl border-white/5 p-4 flex flex-col justify-between min-h-[125px] hover:border-green-500/20 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">Delivered Today</p>
                      <p className="text-2xl font-black mt-1">{loading ? '...' : deliveredTodayCount}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><CheckCircle2 className="w-4 h-4" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xxs text-green-400 font-bold flex items-center"><ArrowUp className="w-3 h-3 mr-0.5" /> +15.3%</span>
                    <svg viewBox="0 0 100 30" className="w-16 h-6 text-green-400 stroke-current fill-none stroke-2"><path d="M0,28 L20,20 L40,25 L60,10 L80,15 L100,5" /></svg>
                  </div>
                </Card>

                {/* Pending Orders */}
                <Card className="bg-neutral-900/60 backdrop-blur-xl border-white/5 p-4 flex flex-col justify-between min-h-[125px] hover:border-amber-500/20 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">Pending Orders</p>
                      <p className="text-2xl font-black mt-1">{loading ? '...' : pendingCount}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><RefreshCw className="w-4 h-4" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xxs text-amber-400 font-bold flex items-center"><ArrowDown className="w-3 h-3 mr-0.5" /> -4.2%</span>
                    <svg viewBox="0 0 100 30" className="w-16 h-6 text-amber-400 stroke-current fill-none stroke-2"><path d="M0,5 Q30,25 60,18 T100,28" /></svg>
                  </div>
                </Card>

                {/* Total Users */}
                <Card className="bg-neutral-900/60 backdrop-blur-xl border-white/5 p-4 flex flex-col justify-between min-h-[125px] hover:border-primary/20 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-black mt-1">{loading ? '...' : totalUsers}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary"><Users className="w-4 h-4" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xxs text-primary font-bold flex items-center"><ArrowUp className="w-3 h-3 mr-0.5" /> +2.5%</span>
                    <svg viewBox="0 0 100 30" className="w-16 h-6 text-primary stroke-current fill-none stroke-2"><path d="M0,22 Q30,10 60,25 T100,10" /></svg>
                  </div>
                </Card>

                {/* Active Agents */}
                <Card className="bg-neutral-900/60 backdrop-blur-xl border-white/5 p-4 flex flex-col justify-between min-h-[125px] hover:border-accent/20 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">Active Agents</p>
                      <p className="text-2xl font-black mt-1">{loading ? '...' : totalAgents}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent/10 text-accent"><Truck className="w-4 h-4" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xxs text-accent font-bold flex items-center"><ArrowUp className="w-3 h-3 mr-0.5" /> +10.0%</span>
                    <svg viewBox="0 0 100 30" className="w-16 h-6 text-accent stroke-current fill-none stroke-2"><path d="M0,18 Q40,5 80,22 T100,15" /></svg>
                  </div>
                </Card>

                {/* Total Hubs */}
                <Card className="bg-neutral-900/60 backdrop-blur-xl border-white/5 p-4 flex flex-col justify-between min-h-[125px] hover:border-green-500/20 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">Total Hubs</p>
                      <p className="text-2xl font-black mt-1">{loading ? '...' : hubs.length}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><MapPin className="w-4 h-4" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xxs text-green-400 font-bold flex items-center"><ArrowUp className="w-3 h-3 mr-0.5" /> +5.2%</span>
                    <svg viewBox="0 0 100 30" className="w-16 h-6 text-green-400 stroke-current fill-none stroke-2"><path d="M0,10 L30,10 L60,10 L100,10" /></svg>
                  </div>
                </Card>

                {/* Failed Deliveries */}
                <Card className="bg-neutral-900/60 backdrop-blur-xl border-white/5 p-4 flex flex-col justify-between min-h-[125px] hover:border-red-500/20 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">Failed Deliveries</p>
                      <p className="text-2xl font-black mt-1">{loading ? '...' : failedDeliveriesCount}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><ShieldAlert className="w-4 h-4" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xxs text-red-400 font-bold flex items-center"><ArrowDown className="w-3 h-3 mr-0.5" /> -12.5%</span>
                    <svg viewBox="0 0 100 30" className="w-16 h-6 text-red-400 stroke-current fill-none stroke-2"><path d="M0,25 Q20,5 50,22 T100,5" /></svg>
                  </div>
                </Card>

              </div>

              {/* ========================================================
                  SECTION 8: QUICK ACTIONS (TOP OVERVIEW)
                  ======================================================== */}
              <div className="flex flex-wrap gap-3 items-center justify-between bg-neutral-900/40 p-4 border border-white/5 rounded-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-2">Quick Commands:</span>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setShowOrderModal(true)} size="sm" className="bg-primary hover:bg-primary/95 text-black font-bold rounded-xl text-xxs py-1.5"><Plus className="w-3.5 h-3.5 mr-1" /> Create Order</Button>
                  <Button onClick={() => { setUserRoleToCreate('agent'); setShowUserModal(true); }} size="sm" className="bg-accent hover:bg-accent/90 text-black font-bold rounded-xl text-xxs py-1.5"><Plus className="w-3.5 h-3.5 mr-1" /> Add Agent</Button>
                  <Button onClick={() => { setEditingHubId(null); setHubName(''); setHubAddress(''); setShowHubModal(true); }} size="sm" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xxs py-1.5 border border-white/5"><Plus className="w-3.5 h-3.5 mr-1" /> Add Hub</Button>
                  <Button onClick={() => { setUserRoleToCreate('user'); setShowUserModal(true); }} size="sm" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xxs py-1.5 border border-white/5"><Plus className="w-3.5 h-3.5 mr-1" /> Add User</Button>
                  <Button onClick={() => setShowReportModal(true)} size="sm" className="bg-neutral-850 hover:bg-neutral-800 text-primary font-bold rounded-xl text-xxs py-1.5 border border-primary/20"><FileText className="w-3.5 h-3.5 mr-1" /> Generate Report</Button>
                </div>
              </div>

              {/* ========================================================
                  SECTION 5: ANALYTICS (SVG CHARTS)
                  ======================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Orders this Week (Line Chart) & Success Rate Gauge */}
                <Card className="lg:col-span-2 border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4 text-primary" /> Logistics Operations: Weekly Volume & Revenue
                    </h3>
                    <div className="h-60 w-full relative pt-4">
                      {/* Grid Lines */}
                      <div className="absolute inset-x-0 top-0 border-t border-white/5 text-xxs text-muted-foreground pt-1">400 Orders</div>
                      <div className="absolute inset-x-0 top-1/3 border-t border-white/5 text-xxs text-muted-foreground pt-1">200 Orders</div>
                      <div className="absolute inset-x-0 top-2/3 border-t border-white/5 text-xxs text-muted-foreground pt-1">100 Orders</div>
                      <div className="absolute inset-x-0 bottom-6 border-t border-white/10 text-xxs text-muted-foreground pt-1">0 Orders</div>
                      
                      {/* SVG Line & Area Chart */}
                      <svg viewBox="0 0 700 200" className="w-full h-full absolute inset-0">
                        {/* Weekly Revenue Gradient Area */}
                        <path 
                          d="M50,180 L150,150 L250,165 L350,110 L450,130 L550,60 L650,85 L650,180 Z" 
                          fill="url(#primaryGrad)" 
                          opacity="0.15" 
                        />
                        {/* Weekly Orders line */}
                        <path 
                          d="M50,180 L150,150 L250,165 L350,110 L450,130 L550,60 L650,85" 
                          fill="none" 
                          stroke="var(--color-primary, #16a34a)" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                        />
                        {/* Secondary Revenue line */}
                        <path 
                          d="M50,170 L150,140 L250,150 L350,120 L450,115 L550,80 L650,90" 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="2" 
                          strokeDasharray="4 4"
                          opacity="0.8"
                        />
                        {/* Data point markers */}
                        {[
                          [50, 180], [150, 150], [250, 165], [350, 110], [450, 130], [550, 60], [650, 85]
                        ].map(([cx, cy], idx) => (
                          <circle key={idx} cx={cx} cy={cy} r="5.5" fill="#16a34a" stroke="#fff" strokeWidth="1.5" />
                        ))}

                        <defs>
                          <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#16a34a" />
                            <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* X Axis Labels */}
                      <div className="absolute inset-x-0 bottom-0 flex justify-between px-6 text-xxs font-bold text-muted-foreground font-mono">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Delivery Success Rate Gauge & Hub stats */}
                <Card className="border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl flex flex-col justify-between">
                  <h3 className="text-sm font-bold mb-4">Quality & Efficiency</h3>
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Track ring */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        {/* Fill ring */}
                        <circle 
                          cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="8" 
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * 94.6) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-black font-mono">94.6%</span>
                        <span className="text-xxs uppercase tracking-wider text-muted-foreground font-bold mt-1">Success Rate</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xxs">
                      <span className="text-muted-foreground">Weekly Revenue</span>
                      <span className="font-mono font-bold">₹{revenueTotal}</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </Card>

              </div>

              {/* ========================================================
                  SECTION 6: RECENT ACTIVITY & SECTION 9: AGENT MONITOR
                  ======================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Activity Feed */}
                <Card className="lg:col-span-2 border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Live Logistics Activity Feed
                  </h3>
                  <div className="space-y-3.5 max-h-[310px] overflow-y-auto no-scrollbar">
                    {recentLogs.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">No logistics activity recorded yet.</p>
                    ) : (
                      recentLogs.map((log) => {
                        const IconComponent = log.icon;
                        return (
                          <div key={log.id} className="flex gap-4 items-start p-3.5 rounded-2xl border border-white/5 bg-black/40 hover:border-white/10 transition-colors">
                            <div className={`p-2 rounded-xl bg-white/5 shrink-0 ${log.color}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold leading-relaxed text-white/90">{log.msg}</p>
                              <p className="text-xxs text-muted-foreground mt-1 font-mono">{log.time}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>

                {/* Agent Monitor */}
                <Card className="border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold mb-4 flex items-center justify-between">
                      <span>Agent Monitor</span>
                      <span className="text-xxs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{totalAgents} Registered</span>
                    </h3>

                    {/* Agent Status list */}
                    <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar">
                      {usersList.filter(u => u.role === 'agent').length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No agents available.</p>
                      ) : (
                        usersList.filter(u => u.role === 'agent').map(agent => (
                          <div key={agent._id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                                {agent.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold leading-none">{agent.name}</p>
                                <p className="text-xxs text-muted-foreground mt-0.5 capitalize">{agent.vehicle?.type || 'Bicycle'}</p>
                              </div>
                            </div>
                            <span className="flex items-center gap-1.5 text-xxs font-mono text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Available
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* ========================================================
                      SECTION 10: SYSTEM HEALTH
                      ======================================================== */}
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <span className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-2.5">System Health</span>
                    <div className="grid grid-cols-2 gap-2 text-xxs font-mono">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500" /> API: Healthy</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500" /> Database: Healthy</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500" /> SMTP: Active</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500 animate-pulse" /> SMS: Mock</div>
                    </div>
                  </div>

                </Card>

              </div>
            </>
          )}

          {/* ========================================================
              SECTION 2: ORDER TABLE & SECTION 3/4: SEARCH/FILTERS
              ======================================================== */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Central Logistics Command</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage regional deliveries, dispatch agents, and track OTP validations.</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleExportCSV} variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 text-xs rounded-xl py-2 px-3 border border-white/5">
                    <Download className="w-4 h-4 mr-1.5 text-primary" /> Export CSV
                  </Button>
                  <Button onClick={() => setShowOrderModal(true)} size="sm" className="bg-primary hover:bg-primary/95 text-black font-bold rounded-xl text-xs py-2 px-4">
                    <Plus className="w-4 h-4 mr-1.5" /> Place Order
                  </Button>
                </div>
              </div>

              {/* Advanced Search & Filtering Dashboard */}
              <Card className="bg-neutral-900/60 backdrop-blur-xl border-white/5 p-4 rounded-3xl flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-2xl px-4 py-2">
                  <Search className="w-4.5 h-4.5 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search by Tracking ID, customer name, email, phone, agent..." 
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent border-none outline-none text-xs w-full placeholder-muted-foreground"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="p-1 rounded-full bg-white/5 text-muted-foreground hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xxs font-bold text-muted-foreground">
                  {/* Status Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="uppercase tracking-wider">Status</span>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="bg-neutral-950 border border-white/5 rounded-xl px-2.5 py-2 text-white outline-none cursor-pointer">
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="in_transit">In Transit</option>
                      <option value="at_hub">At Hub</option>
                      <option value="out_for_delivery">Out For Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Hub Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="uppercase tracking-wider">Origin Hub</span>
                    <select value={hubFilter} onChange={e => { setHubFilter(e.target.value); setCurrentPage(1); }} className="bg-neutral-950 border border-white/5 rounded-xl px-2.5 py-2 text-white outline-none cursor-pointer">
                      <option value="all">All Hubs</option>
                      {hubs.map(h => (
                        <option key={h._id} value={h._id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Agent Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="uppercase tracking-wider">Assigned Agent</span>
                    <select value={agentFilter} onChange={e => { setAgentFilter(e.target.value); setCurrentPage(1); }} className="bg-neutral-950 border border-white/5 rounded-xl px-2.5 py-2 text-white outline-none cursor-pointer">
                      <option value="all">All Agents</option>
                      {usersList.filter(u => u.role === 'agent').map(a => (
                        <option key={a._id} value={a._id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="uppercase tracking-wider">Payment Status</span>
                    <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setCurrentPage(1); }} className="bg-neutral-950 border border-white/5 rounded-xl px-2.5 py-2 text-white outline-none cursor-pointer">
                      <option value="all">All Payments</option>
                      <option value="paid">Paid</option>
                      <option value="cod">COD</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="uppercase tracking-wider">Priority</span>
                    <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }} className="bg-neutral-950 border border-white/5 rounded-xl px-2.5 py-2 text-white outline-none cursor-pointer">
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="uppercase tracking-wider">Date Window</span>
                    <select value={dateRangeFilter} onChange={e => { setDateRangeFilter(e.target.value); setCurrentPage(1); }} className="bg-neutral-950 border border-white/5 rounded-xl px-2.5 py-2 text-white outline-none cursor-pointer">
                      <option value="all">All Dates</option>
                      <option value="today">Today Only</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  <div className="flex items-end">
                    <button 
                      onClick={handleResetFilters} 
                      className="w-full flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-xl py-2 px-2 text-red-400 hover:text-red-300 font-bold transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Reset Filters
                    </button>
                  </div>
                </div>
              </Card>

              {/* Table Data Frame / Section 11 - Empty States */}
              <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden overflow-x-auto no-scrollbar relative min-h-[350px]">
                {filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center absolute inset-0">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-muted-foreground">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white">No orders found</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">We couldn't find any delivery requests matching your filter parameters.</p>
                    <Button onClick={() => setShowOrderModal(true)} size="sm" className="bg-primary hover:bg-primary/95 text-black font-bold rounded-xl text-xs py-2 px-4 mt-6">
                      Place First Order
                    </Button>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-white/2 text-muted-foreground text-[10px] uppercase tracking-wider border-b border-white/5 font-bold">
                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => { setSortField('trackingId'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>Tracking ID</th>
                        <th className="p-4">Sender / User</th>
                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => { setSortField('recipientName'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>Recipient Details</th>
                        <th className="p-4">Route (Pickup → Dest)</th>
                        <th className="p-4">Priority / Cost</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">OTP Status</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Assigned Agent</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {paginatedOrders.map(o => (
                        <tr key={o._id} className="hover:bg-white/1 transition-all group">
                          <td className="p-4 font-mono font-bold text-primary">{o.trackingId}</td>
                          <td className="p-4">
                            <span className="font-bold text-white block">{o.user?.name || 'Guest'}</span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5">{o.user?.email || 'N/A'}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-white block">{o.recipientName}</span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5">{o.recipientPhone}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-white block">{o.hub?.name || 'Local Hub'}</span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5 truncate max-w-[200px]">{o.deliveryAddress?.address}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold block w-fit ${o.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : o.priority === 'low' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>
                              {o.priority}
                            </span>
                            <span className="block text-[10px] text-muted-foreground mt-1 font-mono font-bold">₹{o.cost}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full uppercase text-[9px] font-black tracking-wider ${o.status === 'delivered' ? 'bg-primary/20 text-primary border border-primary/20' : o.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : o.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-accent/20 text-accent border border-accent/20'}`}>
                              {o.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-primary font-bold">{o.otp}</span>
                            <span className="block text-[9px] text-muted-foreground mt-0.5">Pending</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold block w-fit ${o.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : o.paymentStatus === 'cod' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                              {o.paymentStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="p-4">
                            {o.agent ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[9px] flex items-center justify-center">{o.agent.name?.charAt(0)}</div>
                                <span className="font-bold text-white/95">{o.agent.name}</span>
                              </div>
                            ) : (
                              <select 
                                onChange={(e) => handleAssignAgent(o._id, e.target.value)}
                                className="bg-neutral-950 border border-white/5 rounded-lg px-1.5 py-1 text-muted-foreground outline-none text-[10px] cursor-pointer"
                                defaultValue=""
                              >
                                <option value="" disabled>Assign Agent...</option>
                                {usersList.filter(u => u.role === 'agent').map(a => (
                                  <option key={a._id} value={a._id}>{a.name}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              {/* Status update quick options */}
                              <select 
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                                className="bg-neutral-950 border border-white/5 rounded-lg px-1 py-1 text-[10px] cursor-pointer outline-none mr-1.5"
                              >
                                <option value="pending">Pending</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="in_transit">In Transit</option>
                                <option value="at_hub">At Hub</option>
                                <option value="out_for_delivery">Out For Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="failed">Failed</option>
                              </select>

                              {/* Print label */}
                              <button onClick={() => window.print()} title="Print Label" className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white transition-colors">
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Order */}
                              <button 
                                onClick={async () => {
                                  if (!window.confirm('Delete this order entry permanently?')) return;
                                  const token = localStorage.getItem('token');
                                  await fetch(`${API_BASE_URL}/api/orders/${o._id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  fetchAdminData();
                                }} 
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ========================================================
                  SECTION 12: PAGINATION
                  ======================================================== */}
              {filteredOrders.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/40 p-4 border border-white/5 rounded-3xl px-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredOrders.length)} of {filteredOrders.length} orders</span>
                    <div className="flex items-center gap-1.5">
                      <span>Rows per page:</span>
                      <select 
                        value={rowsPerPage} 
                        onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                        className="bg-neutral-950 border border-white/5 rounded-lg px-2 py-1 text-white outline-none cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg bg-neutral-950 border border-white/5 hover:bg-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page} 
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg border font-bold font-mono transition-all ${currentPage === page ? 'bg-primary text-black border-primary' : 'bg-neutral-950 border-white/5 hover:bg-neutral-900 text-muted-foreground'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg bg-neutral-950 border border-white/5 hover:bg-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: REGIONAL HUBS */}
          {activeTab === 'hubs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Regional Hub Management</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Configure local origin nodes and coordinate locations.</p>
                </div>
                <Button 
                  onClick={() => { setEditingHubId(null); setHubName(''); setHubAddress(''); setShowHubModal(true); }}
                  className="bg-primary text-black font-bold rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Hub Node
                </Button>
              </div>

              <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white/2 text-muted-foreground text-xs uppercase border-b border-white/5">
                      <th className="p-4 font-bold">Node Name</th>
                      <th className="p-4 font-bold">Address</th>
                      <th className="p-4 font-bold">Coordinates</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {hubs.map(h => (
                      <tr key={h._id} className="hover:bg-white/1">
                        <td className="p-4 font-semibold">{h.name}</td>
                        <td className="p-4 text-muted-foreground">{h.address}</td>
                        <td className="p-4 text-xs font-mono">{h.location?.lat}, {h.location?.lng}</td>
                        <td className="p-4 text-right flex justify-end gap-2.5">
                          <button onClick={() => startEditHub(h)} className="p-2 rounded bg-white/5 border border-white/5 hover:border-primary/20 text-primary transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteHub(h._id)} className="p-2 rounded bg-white/5 border border-white/5 hover:border-red-500/20 text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Registered Villager Profiles</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage customer directory accounts.</p>
                </div>
                <Button onClick={() => { setUserRoleToCreate('user'); setShowUserModal(true); }} className="bg-primary text-black font-bold rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Add User Account
                </Button>
              </div>

              <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white/2 text-muted-foreground text-xs uppercase border-b border-white/5">
                      <th className="p-4 font-bold">Name</th>
                      <th className="p-4 font-bold">Email</th>
                      <th className="p-4 font-bold">Phone</th>
                      <th className="p-4 font-bold">Address</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.filter(u => u.role === 'user').map(u => (
                      <tr key={u._id} className="hover:bg-white/1">
                        <td className="p-4 font-semibold">{u.name}</td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4 text-xs font-mono">{u.phone || 'N/A'}</td>
                        <td className="p-4 text-xs text-muted-foreground">{u.location?.address || 'N/A'}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => deleteUser(u._id)} className="p-2 rounded bg-white/5 border border-white/5 hover:border-red-500/20 text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: AGENTS DIRECTORY */}
          {activeTab === 'agents' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Delivery Logistics Partners</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage regional transit partners and vehicle logs.</p>
                </div>
                <Button onClick={() => { setUserRoleToCreate('agent'); setShowUserModal(true); }} className="bg-accent text-black font-bold rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Add Delivery Agent
                </Button>
              </div>

              <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white/2 text-muted-foreground text-xs uppercase border-b border-white/5">
                      <th className="p-4 font-bold">Partner Name</th>
                      <th className="p-4 font-bold">Email</th>
                      <th className="p-4 font-bold">Vehicle details</th>
                      <th className="p-4 font-bold">License ID</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.filter(u => u.role === 'agent').map(u => (
                      <tr key={u._id} className="hover:bg-white/1">
                        <td className="p-4 font-semibold flex items-center gap-2">
                           <div className="w-7.5 h-7.5 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">{u.name?.charAt(0)}</div>
                           <span>{u.name}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4 text-xs">
                          <span className="font-semibold text-white/90 capitalize">{u.vehicle?.type || 'Bicycle'}</span> 
                          {u.vehicle?.number && <span className="block text-xxs text-muted-foreground font-mono mt-0.5">{u.vehicle.number}</span>}
                        </td>
                        <td className="p-4 text-xs font-mono text-muted-foreground">{u.vehicle?.licenseNumber || 'N/A'}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => deleteUser(u._id)} className="p-2 rounded bg-white/5 border border-white/5 hover:border-red-500/20 text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <RoleSettings />
          )}

          {/* TAB 7: SUPPORT */}
          {activeTab === 'support' && (
            <AdminSupportCenter />
          )}

        </main>
      </div>

      {/* ========================================================
          MODAL: ADD/EDIT HUB
          ======================================================== */}
      {showHubModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowHubModal(false)} />
          <Card className="bg-neutral-900 border-white/10 max-w-md w-full p-6 rounded-3xl relative z-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold">{editingHubId ? 'Edit Hub Node' : 'Create Hub Node'}</h3>
              <button onClick={() => setShowHubModal(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveHub} className="space-y-4">
              <div>
                <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Hub Name</label>
                <Input value={hubName} onChange={e => setHubName(e.target.value)} placeholder="e.g. Bopal Hub Node" className="bg-neutral-800 border-white/10 text-xs" required />
              </div>
              <div>
                <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Street Address</label>
                <Input value={hubAddress} onChange={e => setHubAddress(e.target.value)} placeholder="e.g. Near Panchayat Office" className="bg-neutral-800 border-white/10 text-xs" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Latitude</label>
                  <Input value={hubLat} onChange={e => setHubLat(e.target.value)} className="bg-neutral-800 border-white/10 text-xs" required />
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Longitude</label>
                  <Input value={hubLng} onChange={e => setHubLng(e.target.value)} className="bg-neutral-800 border-white/10 text-xs" required />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="ghost" className="text-xs" onClick={() => setShowHubModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-black font-bold text-xs">Save Hub Node</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ========================================================
          MODAL: CREATE/EDIT ORDER
          ======================================================== */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowOrderModal(false)} />
          <Card className="bg-neutral-900 border-white/10 max-w-lg w-full p-6 rounded-3xl relative z-10 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold">{editingOrder ? 'Edit Order Details' : 'Create Logistics Order'}</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Recipient Name</label>
                  <Input 
                    value={orderForm.recipientName} 
                    onChange={e => setOrderForm({ ...orderForm, recipientName: e.target.value })} 
                    placeholder="e.g. John Doe" className="bg-neutral-800 border-white/10 text-xs" required 
                  />
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Recipient Phone</label>
                  <Input 
                    value={orderForm.recipientPhone} 
                    onChange={e => setOrderForm({ ...orderForm, recipientPhone: e.target.value.replace(/\D/g,'').substring(0,10) })} 
                    placeholder="10-digit number" className="bg-neutral-800 border-white/10 text-xs" required 
                  />
                </div>
              </div>
              <div>
                <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Destination Address</label>
                <Input 
                  value={orderForm.deliveryAddress} 
                  onChange={e => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })} 
                  placeholder="e.g. House No 42, West Zone Village" className="bg-neutral-800 border-white/10 text-xs" required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Select Hub</label>
                  <select 
                    value={orderForm.hubId} 
                    onChange={e => setOrderForm({ ...orderForm, hubId: e.target.value })} 
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-white cursor-pointer"
                    required
                  >
                    <option value="" disabled>Choose origin hub...</option>
                    {hubs.map(h => (
                      <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Weight (KG)</label>
                  <Input 
                    type="number" min="0.1" step="0.1" 
                    value={orderForm.weight} 
                    onChange={e => setOrderForm({ ...orderForm, weight: e.target.value })} 
                    className="bg-neutral-800 border-white/10 text-xs" required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Transit Fee (₹)</label>
                  <Input 
                    type="number" min="1" 
                    value={orderForm.cost} 
                    onChange={e => setOrderForm({ ...orderForm, cost: e.target.value })} 
                    className="bg-neutral-800 border-white/10 text-xs" required 
                  />
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Priority</label>
                  <select 
                    value={orderForm.priority} 
                    onChange={e => setOrderForm({ ...orderForm, priority: e.target.value })} 
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-white cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Payment Status</label>
                  <select 
                    value={orderForm.paymentStatus} 
                    onChange={e => setOrderForm({ ...orderForm, paymentStatus: e.target.value })} 
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-white cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="cod">COD</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="ghost" className="text-xs" onClick={() => setShowOrderModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-black font-bold text-xs">Save Order</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD USER/AGENT ACCOUNT
          ======================================================== */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowUserModal(false)} />
          <Card className="bg-neutral-900 border-white/10 max-w-md w-full p-6 rounded-3xl relative z-10 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold">Register New {userRoleToCreate === 'agent' ? 'Delivery Agent' : 'User Account'}</h3>
              <button onClick={() => setShowUserModal(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Full Name</label>
                <Input 
                  value={userForm.name} 
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })} 
                  placeholder="e.g. John Doe" className="bg-neutral-800 border-white/10 text-xs" required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Email Address</label>
                  <Input 
                    type="email" 
                    value={userForm.email} 
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })} 
                    placeholder="john@domain.com" className="bg-neutral-800 border-white/10 text-xs" required 
                  />
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Phone Number</label>
                  <Input 
                    value={userForm.phone} 
                    onChange={e => setUserForm({ ...userForm, phone: e.target.value.replace(/\D/g,'').substring(0,10) })} 
                    placeholder="10-digit number" className="bg-neutral-800 border-white/10 text-xs" required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Password</label>
                  <Input 
                    type="password" 
                    value={userForm.password} 
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })} 
                    className="bg-neutral-800 border-white/10 text-xs" required 
                  />
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-muted-foreground font-bold block mb-1">Village / Address</label>
                  <Input 
                    value={userForm.village} 
                    onChange={e => setUserForm({ ...userForm, village: e.target.value })} 
                    placeholder="Village Name" className="bg-neutral-800 border-white/10 text-xs" required 
                  />
                </div>
              </div>

              {userRoleToCreate === 'agent' && (
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <span className="text-xxs font-bold uppercase tracking-wider text-primary">Vehicle Details</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Type</label>
                      <select 
                        value={userForm.vehicleType}
                        onChange={e => setUserForm({ ...userForm, vehicleType: e.target.value })}
                        className="bg-neutral-800 border border-white/10 rounded-xl px-2 py-2 text-xs outline-none text-white w-full cursor-pointer"
                      >
                        <option value="bicycle">Bicycle</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="auto">Auto Rickshaw</option>
                        <option value="pickup">Pickup</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Number plate</label>
                      <Input 
                        value={userForm.vehicleNumber} 
                        onChange={e => setUserForm({ ...userForm, vehicleNumber: e.target.value.toUpperCase() })} 
                        placeholder="GJ-18-XX-1234" className="bg-neutral-800 border-white/10 text-xs" required 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">License ID</label>
                      <Input 
                        value={userForm.licenseNumber} 
                        onChange={e => setUserForm({ ...userForm, licenseNumber: e.target.value.toUpperCase() })} 
                        placeholder="DL-142011" className="bg-neutral-800 border-white/10 text-xs" 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="ghost" className="text-xs" onClick={() => setShowUserModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-black font-bold text-xs">Register Profile</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ========================================================
          MODAL: GENERATE LOGISTICS REPORT
          ======================================================== */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowReportModal(false)} />
          <Card className="bg-neutral-900 border-white/10 max-w-md w-full p-6 rounded-3xl relative z-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold">Generate Logistics Report</h3>
              <button onClick={() => setShowReportModal(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-xs">
              <p className="text-muted-foreground">This compiles all regional metrics, order logs, agent lists, and hub statistics into a printable report sheet.</p>
              
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2 font-mono text-[10px]">
                <div>• Total Seeded Nodes: {hubs.length}</div>
                <div>• Gross Active Transits: {inTransitCount}</div>
                <div>• Quality Rating Score: 94.6%</div>
                <div>• Total Consolidated Revenue: ₹{revenueTotal}</div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="ghost" className="text-xs" onClick={() => setShowReportModal(false)}>Cancel</Button>
                <Button onClick={() => window.print()} className="bg-primary text-black font-bold text-xs"><Printer className="w-4 h-4 mr-1.5" /> Print Summary</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
