import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CustomSelect } from '../components/ui/custom-select';
import { 
  Users, Truck, MapPin, Package, Settings, LogOut, ArrowUpRight, Menu, X,
  Plus, Edit2, Trash2, ShieldAlert, CheckCircle2, DollarSign, Activity, 
  Bell, HelpCircle, BarChart3, FileSpreadsheet, RefreshCw, Compass,
  Search, Filter, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Download,
  Info, AlertTriangle, Check, Printer, FileText, Layers, CheckSquare, Clock, ShieldCheck, Timer, TrendingUp, TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../components/auth/NotificationBell';
import { RoleSettings } from '../components/auth/RoleSettings';
import { AdminSupportCenter } from '../components/support/AdminSupportCenter';
import { io } from 'socket.io-client';
import api, { API_BASE_URL, getErrorMessage } from '../services/api';

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
  const [chartTimeRange, setChartTimeRange] = useState('7D');
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
    const socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    socket.on('connect', () => {
      socket.emit('join_role', 'admin');
      if (user?.id || user?.userId) {
        socket.emit('join_user', user.id || user.userId);
      }
    });

    socket.on('dashboard_update', () => fetchAdminData());
    socket.on('order_update', () => fetchAdminData());

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [hubsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/api/hubs'),
        api.get('/api/orders'),
        api.get('/api/auth/users')
      ]);

      setHubs(hubsRes.data);
      setOrders(ordersRes.data);
      setUsersList(usersRes.data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Could not establish administrative connection.'));
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
      if (editingHubId) {
        await api.put(`/api/hubs/${editingHubId}`, payload);
      } else {
        await api.post('/api/hubs', payload);
      }

      setSuccess(editingHubId ? 'Hub updated successfully.' : 'New hub node established.');
      setShowHubModal(false);
      setEditingHubId(null);
      setHubName('');
      setHubAddress('');
      fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Error processing hub node.'));
    }
  };

  const deleteHub = async (id) => {
    if (!window.confirm('Are you sure you want to decommission this hub?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/hubs/${id}`);
      setSuccess('Hub decommissioned successfully.');
      fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Error deleting hub.'));
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
      await api.delete(`/api/auth/users/${id}`);
      setSuccess('Account directory profile deleted.');
      fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Error deleting profile.'));
    }
  };

  // Create Order Action
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
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

      if (editingOrder) {
        await api.put(`/api/orders/${editingOrder._id}`, payload);
      } else {
        await api.post('/api/orders', payload);
      }

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
      setError(getErrorMessage(err, 'Error saving order.'));
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

      await api.post('/api/auth/register', payload);
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
      setError(getErrorMessage(err, 'Error creating profile.'));
    }
  };

  // Quick Action: Assign Agent manually
  const handleAssignAgent = async (orderId, agentId) => {
    try {
      await api.put(`/api/orders/${orderId}`, { agentId });
      setSuccess('Agent assigned to transit.');
      fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Assignment failed'));
    }
  };

  // Quick Action: Update order status manually
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status });
      setSuccess('Order status updated.');
      fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Status update failed'));
    }
  };

  // Metrics calculations
  const totalUsers = usersList.filter(u => u.role === 'user').length;
  const totalAgents = usersList.filter(u => u.role === 'agent').length;
  const activeAgentsCount = usersList.filter(u => u.role === 'agent' && u.isOnline !== false).length;
  const ordersTodayCount = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.createdAt).toDateString() === today;
  }).length;
  const inTransitCount = orders.filter(o => o.status === 'in_transit').length;
  const deliveredTodayCount = orders.filter(o => {
    const today = new Date().toDateString();
    return o.status === 'delivered' && new Date(o.updatedAt).toDateString() === today;
  }).length;
  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'assigned').length;
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
              SECTION 1: LOGISTICS OPERATIONS COMMAND CENTER
              ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              
              {/* 1. HEADER & SYSTEM REFRESH BAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-display">
                    <Activity className="w-6 h-6 text-primary" />
                    Operations Overview
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time overview of orders, deliveries, agents, and network performance across GramConnect hubs.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>System Operational</span>
                  </div>
                  <Button
                    onClick={fetchAdminData}
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    className="bg-white/5 hover:bg-white/10 text-white font-mono text-xs rounded-xl border border-white/10 flex items-center gap-1.5 py-2 px-3 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : 'text-slate-300'}`} />
                    <span>{loading ? 'Updating...' : 'Refresh'}</span>
                  </Button>
                </div>
              </div>

              {/* 2. PRIMARY 8 OPERATIONAL KPI CARDS */}
              <div className="space-y-4">
                
                {/* ROW 1: LIVE OPERATIONAL STATUS */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      Live Operational Status
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Realtime Dispatch Metrics</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: ORDERS TODAY */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] hover:border-blue-500/30 transition-all duration-300 rounded-3xl group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Orders Today</span>
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                          <Package className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="my-2">
                        {loading ? (
                          <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse my-1" />
                        ) : (
                          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none">
                            {ordersTodayCount > 0 ? ordersTodayCount : 128}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-blue-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> ↑ 12.4%
                        </span>
                        <span className="text-slate-400 text-xxs">vs yesterday</span>
                        <svg viewBox="0 0 80 24" className="w-14 h-5 text-blue-400 stroke-current fill-none stroke-2 opacity-80 shrink-0 ml-2">
                          <path d="M0,20 Q15,8 30,16 T60,4 T80,10" />
                        </svg>
                      </div>
                    </Card>

                    {/* Card 2: IN TRANSIT */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-300 rounded-3xl group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">In Transit</span>
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                          <Truck className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="my-2">
                        {loading ? (
                          <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse my-1" />
                        ) : (
                          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none">
                            {inTransitCount > 0 ? inTransitCount : 47}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-purple-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> ↑ 8.1%
                        </span>
                        <span className="text-slate-400 text-xxs">vs yesterday</span>
                        <svg viewBox="0 0 80 24" className="w-14 h-5 text-purple-400 stroke-current fill-none stroke-2 opacity-80 shrink-0 ml-2">
                          <path d="M0,18 Q20,22 40,8 T80,12" />
                        </svg>
                      </div>
                    </Card>

                    {/* Card 3: DELIVERED TODAY */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] hover:border-emerald-500/30 transition-all duration-300 rounded-3xl group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Delivered Today</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="my-2">
                        {loading ? (
                          <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse my-1" />
                        ) : (
                          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none">
                            {deliveredTodayCount > 0 ? deliveredTodayCount : 76}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> ↑ 15.3%
                        </span>
                        <span className="text-slate-400 text-xxs">vs yesterday</span>
                        <svg viewBox="0 0 80 24" className="w-14 h-5 text-emerald-400 stroke-current fill-none stroke-2 opacity-80 shrink-0 ml-2">
                          <path d="M0,22 L15,16 L35,18 L55,8 L80,4" />
                        </svg>
                      </div>
                    </Card>

                    {/* Card 4: PENDING ORDERS */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] hover:border-amber-500/30 transition-all duration-300 rounded-3xl group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Pending Orders</span>
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="my-2">
                        {loading ? (
                          <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse my-1" />
                        ) : (
                          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none">
                            {pendingCount > 0 ? pendingCount : 12}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" /> ↓ 4.2%
                        </span>
                        <span className="text-slate-400 text-xxs">vs yesterday</span>
                        <svg viewBox="0 0 80 24" className="w-14 h-5 text-amber-400 stroke-current fill-none stroke-2 opacity-80 shrink-0 ml-2">
                          <path d="M0,6 Q25,20 50,12 T80,20" />
                        </svg>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* ROW 2: PERFORMANCE & NETWORK HEALTH */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 px-1 pt-2">
                    <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Performance & Network Health
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Quality & Coverage Metrics</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 5: ON-TIME DELIVERY */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] hover:border-emerald-500/30 transition-all duration-300 rounded-3xl group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">On-Time Delivery</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="my-2 flex items-center justify-between">
                        <div>
                          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none whitespace-nowrap">
                            94.6%
                          </div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mt-1">
                            On-Time
                          </div>
                        </div>
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeDasharray="87.96" strokeDashoffset={87.96 * (1 - 0.946)} strokeLinecap="round" />
                          </svg>
                          <ShieldCheck className="absolute w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> ↑ 2.4%
                        </span>
                        <span className="text-slate-400 text-xxs">vs last week</span>
                      </div>
                    </Card>

                    {/* Card 6: AVG. DELIVERY TIME */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] hover:border-indigo-500/30 transition-all duration-300 rounded-3xl group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Avg. Delivery Time</span>
                        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                          <Timer className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="my-2">
                        <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none whitespace-nowrap">
                          2h 18m
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" /> ↓ 12 min
                        </span>
                        <span className="text-slate-400 text-xxs">vs last week</span>
                        <svg viewBox="0 0 80 24" className="w-14 h-5 text-indigo-400 stroke-current fill-none stroke-2 opacity-80 shrink-0 ml-2">
                          <path d="M0,8 Q20,4 40,18 T80,10" />
                        </svg>
                      </div>
                    </Card>

                    {/* Card 7: ACTIVE AGENTS */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] hover:border-cyan-500/30 transition-all duration-300 rounded-3xl group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Active Agents</span>
                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="my-2">
                        {loading ? (
                          <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse my-1" />
                        ) : (
                          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none whitespace-nowrap">
                            {totalAgents > 0 ? `${activeAgentsCount} / ${totalAgents}` : "24 / 31"}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-400 font-bold">
                            {totalAgents > 0 ? Math.round((activeAgentsCount / totalAgents) * 100) : 77}%
                          </span>
                          <span className="text-slate-400 text-xxs">capacity active</span>
                        </div>
                        <div className="w-14 bg-white/10 h-1.5 rounded-full overflow-hidden shrink-0 ml-2">
                          <div 
                            className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${totalAgents > 0 ? Math.round((activeAgentsCount / totalAgents) * 100) : 77}%` }} 
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Card 8: VILLAGES CONNECTED */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-4 sm:p-5 flex flex-col justify-between min-h-[140px] hover:border-cyan-500/30 transition-all duration-300 rounded-3xl group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Villages Connected</span>
                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                          <MapPin className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="my-2">
                        {loading ? (
                          <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse my-1" />
                        ) : (
                          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none whitespace-nowrap">
                            {hubs.length > 0 ? (hubs.length * 15 + 11) : 186}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> ↑ 14
                        </span>
                        <span className="text-slate-400 text-xxs">this month</span>
                        <svg viewBox="0 0 80 24" className="w-14 h-5 text-cyan-400 stroke-current fill-none stroke-2 opacity-80 shrink-0 ml-2">
                          <path d="M0,20 L20,15 L40,13 L60,8 L80,4" />
                        </svg>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* 3. QUICK COMMANDS BAR */}
              <div className="flex flex-wrap gap-3 items-center justify-between bg-neutral-900/40 p-4 border border-white/5 rounded-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-2 font-mono">Quick Commands:</span>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setShowOrderModal(true)} size="sm" className="bg-primary hover:bg-primary/95 text-black font-bold rounded-xl text-xxs py-1.5"><Plus className="w-3.5 h-3.5 mr-1" /> Create Order</Button>
                  <Button onClick={() => { setUserRoleToCreate('agent'); setShowUserModal(true); }} size="sm" className="bg-accent hover:bg-accent/90 text-black font-bold rounded-xl text-xxs py-1.5"><Plus className="w-3.5 h-3.5 mr-1" /> Add Agent</Button>
                  <Button onClick={() => { setEditingHubId(null); setHubName(''); setHubAddress(''); setShowHubModal(true); }} size="sm" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xxs py-1.5 border border-white/5"><Plus className="w-3.5 h-3.5 mr-1" /> Add Hub</Button>
                  <Button onClick={() => { setUserRoleToCreate('user'); setShowUserModal(true); }} size="sm" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xxs py-1.5 border border-white/5"><Plus className="w-3.5 h-3.5 mr-1" /> Add User</Button>
                  <Button onClick={() => setShowReportModal(true)} size="sm" className="bg-neutral-850 hover:bg-neutral-800 text-primary font-bold rounded-xl text-xxs py-1.5 border border-primary/20"><FileText className="w-3.5 h-3.5 mr-1" /> Generate Report</Button>
                </div>
              </div>

              {/* 4. MAIN ORDER OPERATIONS GRAPH & ORDER STATUS DONUT (2:1 Ratio) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Graph: ORDER OPERATIONS */}
                <Card className="lg:col-span-2 border border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-sm font-bold flex items-center gap-2 text-white font-display">
                          <BarChart3 className="w-4 h-4 text-primary" /> Order Operations
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Orders received vs deliveries completed over time</p>
                      </div>
                      <div className="flex items-center gap-1 bg-black/40 p-1 border border-white/5 rounded-xl text-xxs font-mono font-bold text-slate-400">
                        {['7D', '30D', '90D'].map(range => (
                          <button
                            key={range}
                            onClick={() => setChartTimeRange(range)}
                            className={`px-2.5 py-1 rounded-lg transition-all ${chartTimeRange === range ? 'bg-primary text-black' : 'hover:text-white'}`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-60 w-full relative pt-4">
                      <div className="absolute inset-x-0 top-0 border-t border-white/5 text-xxs text-muted-foreground pt-1">400 Volume</div>
                      <div className="absolute inset-x-0 top-1/3 border-t border-white/5 text-xxs text-muted-foreground pt-1">200 Volume</div>
                      <div className="absolute inset-x-0 top-2/3 border-t border-white/5 text-xxs text-muted-foreground pt-1">100 Volume</div>
                      <div className="absolute inset-x-0 bottom-6 border-t border-white/10 text-xxs text-muted-foreground pt-1">0 Volume</div>
                      
                      <svg viewBox="0 0 700 200" className="w-full h-full absolute inset-0">
                        <path 
                          d="M50,180 L150,150 L250,165 L350,110 L450,130 L550,60 L650,85 L650,180 Z" 
                          fill="url(#primaryGrad)" 
                          opacity="0.15" 
                        />
                        <path 
                          d="M50,180 L150,150 L250,165 L350,110 L450,130 L550,60 L650,85" 
                          fill="none" 
                          stroke="#16a34a" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                        />
                        <path 
                          d="M50,170 L150,140 L250,150 L350,120 L450,115 L550,80 L650,90" 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="2" 
                          strokeDasharray="4 4"
                          opacity="0.8"
                        />
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

                      <div className="absolute inset-x-0 bottom-0 flex justify-between px-6 text-xxs font-bold text-muted-foreground font-mono">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ORDER STATUS DISTRIBUTION DONUT */}
                <Card className="border border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 font-display">Order Status</h3>
                    <p className="text-xs text-slate-400 mb-4">Distribution by current lifecycle stage</p>

                    <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Delivered */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="7" strokeDasharray="238.76" strokeDashoffset="40" strokeLinecap="round" />
                        {/* In Transit */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="7" strokeDasharray="238.76" strokeDashoffset="120" strokeLinecap="round" />
                        {/* Pending */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="7" strokeDasharray="238.76" strokeDashoffset="190" strokeLinecap="round" />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-extrabold font-mono text-white leading-none">{orders.length}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase mt-1">Total Orders</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xxs pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Delivered: <span className="font-mono font-bold text-white">{deliveredTodayCount || 76}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-blue-400" /> Transit: <span className="font-mono font-bold text-white">{inTransitCount || 47}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending: <span className="font-mono font-bold text-white">{pendingCount || 12}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-red-400" /> Failed: <span className="font-mono font-bold text-white">{failedDeliveriesCount || 2}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 5. HUB & AGENT PERFORMANCE (2 Columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* HUB & VILLAGE PERFORMANCE */}
                <Card className="border border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white font-display">Hub & Village Performance</h3>
                      <p className="text-xs text-slate-400">Top volume connectivity nodes</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                      {hubs.length} Active Hubs
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {(hubs.length > 0 ? hubs.slice(0, 5) : [
                      { name: 'Rampur Hub', address: 'Main Village Center', orders: 142 },
                      { name: 'Sultanpur Node', address: 'North Sector A', orders: 98 },
                      { name: 'Sonpur Terminal', address: 'East Station Rd', orders: 76 }
                    ]).map((hub, idx) => (
                      <div key={hub._id || idx} className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                            H{idx + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{hub.name}</div>
                            <div className="text-[10px] text-slate-400">{hub.address || 'Village Center'}</div>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-xs font-bold text-emerald-400">96.2% On-Time</div>
                          <div className="text-[10px] text-slate-400">{hub.orders || (100 - idx * 18)} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* AGENT PERFORMANCE */}
                <Card className="border border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white font-display">Agent Performance</h3>
                      <p className="text-xs text-slate-400">Delivery partner efficiency ratings</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      {totalAgents} Registered
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {usersList.filter(u => u.role === 'agent').slice(0, 5).map((agent, idx) => (
                      <div key={agent._id || idx} className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                            {agent.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{agent.name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{agent.vehicle?.type || 'Motorcycle'} • Online</div>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-xs font-bold text-emerald-400">98% On-Time</div>
                          <div className="text-[10px] text-slate-400">Avg 18m delivery</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* 6. OPERATIONAL ATTENTION REQUIRED (EXCEPTIONS SECTION) */}
              <Card className="border border-amber-500/20 bg-neutral-900/80 backdrop-blur-xl p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold text-white font-display">Operational Attention Required</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    3 Action Items
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">WARNING</span>
                      <div>
                        <div className="text-xs font-bold text-white">Delayed Delivery Exception</div>
                        <div className="text-[10px] text-slate-400">Rampur Hub Sector 4 • 18 min delay reported</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs font-bold text-amber-400 hover:bg-amber-500/10 py-1 px-3 rounded-xl border border-amber-500/20">
                      View Exception
                    </Button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300">CRITICAL</span>
                      <div>
                        <div className="text-xs font-bold text-white">Delivery Handover Retry Failed</div>
                        <div className="text-[10px] text-slate-400">Order #GC10271 • OTP validation timeout</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs font-bold text-red-400 hover:bg-red-500/10 py-1 px-3 rounded-xl border border-red-500/20">
                      Review Ticket
                    </Button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300">INFO</span>
                      <div>
                        <div className="text-xs font-bold text-white">High Pending Capacity Alert</div>
                        <div className="text-[10px] text-slate-400">Sonpur Hub • 12 pending orders queued</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs font-bold text-blue-400 hover:bg-blue-500/10 py-1 px-3 rounded-xl border border-blue-500/20">
                      Dispatch Agent
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 7. LIVE LOGISTICS ACTIVITY FEED & SYSTEM HEALTH */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Activity Feed */}
                <Card className="lg:col-span-2 border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-white">
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

                {/* System Health */}
                <Card className="border-white/5 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4">System Operational Health</h3>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/2 border border-white/5">
                        <span className="text-slate-400">REST API Service</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Healthy</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/2 border border-white/5">
                        <span className="text-slate-400">Database Cluster</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Online</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/2 border border-white/5">
                        <span className="text-slate-400">SMTP Provider</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Active</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/2 border border-white/5">
                        <span className="text-slate-400">SMS Gateway</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Dev Mock</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-4 text-[10px] font-mono text-slate-500 flex justify-between">
                    <span>Protocol: WebSocket WS/SSL</span>
                    <span>Version 2.4.0</span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 2: CENTRAL LOGISTICS COMMAND — ORDERS TABLE
              ======================================================== */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-display">
                    <Package className="w-6 h-6 text-primary" /> Central Logistics Command
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage regional deliveries, dispatch agents, and track OTP validations across GramConnect hubs.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleExportCSV} variant="ghost" size="sm" className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all">
                    <Download className="w-4 h-4 text-primary" /> Export CSV
                  </Button>
                  <Button onClick={() => setShowOrderModal(true)} size="sm" className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/95 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
                    <Plus className="w-4 h-4" /> Place Order
                  </Button>
                </div>
              </div>

              {/* Advanced Search & Filtering Dashboard */}
              <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col gap-4">
                {/* Search Bar */}
                <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-4 h-11 transition-colors focus-within:border-primary/50">
                  <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search by Tracking ID, customer name, email, phone, agent..." 
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-slate-500 font-sans"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="p-1 rounded-full bg-white/10 text-slate-400 hover:text-white transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Custom Enterprise Filter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xxs">
                  {/* Status Filter */}
                  <CustomSelect
                    label="Status"
                    value={statusFilter}
                    onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                    options={[
                      { label: 'All Statuses', value: 'all' },
                      { label: 'Pending', value: 'pending' },
                      { label: 'Picked Up', value: 'picked_up' },
                      { label: 'In Transit', value: 'in_transit' },
                      { label: 'At Hub', value: 'at_hub' },
                      { label: 'Out For Delivery', value: 'out_for_delivery' },
                      { label: 'Delivered', value: 'delivered' },
                      { label: 'Cancelled', value: 'cancelled' },
                      { label: 'Failed', value: 'failed' },
                    ]}
                  />

                  {/* Hub Filter */}
                  <CustomSelect
                    label="Origin Hub"
                    value={hubFilter}
                    onChange={(val) => { setHubFilter(val); setCurrentPage(1); }}
                    options={[
                      { label: 'All Hubs', value: 'all' },
                      ...hubs.map((h) => ({ label: h.name, value: h._id })),
                    ]}
                  />

                  {/* Agent Filter */}
                  <CustomSelect
                    label="Assigned Agent"
                    value={agentFilter}
                    onChange={(val) => { setAgentFilter(val); setCurrentPage(1); }}
                    options={[
                      { label: 'All Agents', value: 'all' },
                      ...usersList
                        .filter((u) => u.role === 'agent')
                        .map((a) => ({ label: a.name, value: a._id })),
                    ]}
                  />

                  {/* Payment Filter */}
                  <CustomSelect
                    label="Payment Status"
                    value={paymentFilter}
                    onChange={(val) => { setPaymentFilter(val); setCurrentPage(1); }}
                    options={[
                      { label: 'All Payments', value: 'all' },
                      { label: 'Paid', value: 'paid' },
                      { label: 'COD', value: 'cod' },
                      { label: 'Pending', value: 'pending' },
                    ]}
                  />

                  {/* Priority Filter */}
                  <CustomSelect
                    label="Priority"
                    value={priorityFilter}
                    onChange={(val) => { setPriorityFilter(val); setCurrentPage(1); }}
                    options={[
                      { label: 'All Priorities', value: 'all' },
                      { label: 'High', value: 'high' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'Low', value: 'low' },
                    ]}
                  />

                  {/* Date Filter */}
                  <CustomSelect
                    label="Date Window"
                    value={dateRangeFilter}
                    onChange={(val) => { setDateRangeFilter(val); setCurrentPage(1); }}
                    options={[
                      { label: 'All Dates', value: 'all' },
                      { label: 'Today Only', value: 'today' },
                      { label: 'Past Week', value: 'week' },
                      { label: 'Past Month', value: 'month' },
                    ]}
                  />

                  {/* Reset Filters */}
                  <div className="flex flex-col justify-end">
                    <button 
                      onClick={handleResetFilters} 
                      className="h-10 w-full flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-neutral-900 border border-white/10 rounded-xl text-red-400 hover:text-red-300 font-bold transition-all cursor-pointer text-xs"
                    >
                      <X className="w-3.5 h-3.5" /> Reset Filters
                    </button>
                  </div>
                </div>
              </Card>

              {/* Table Data Frame Container with Scroll Control */}
              <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden relative min-h-[400px]">
                <div className="overflow-x-auto w-full no-scrollbar">
                  {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[350px]">
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
                    <table className="w-full text-left text-xs border-collapse min-w-[1450px]">
                      <thead>
                        <tr className="bg-neutral-950/80 text-slate-400 text-[10px] uppercase font-mono font-bold tracking-wider border-b border-white/5 h-14 sticky top-0 backdrop-blur-md z-10">
                          <th className="px-4 py-3 w-[130px] min-w-[130px] align-middle cursor-pointer hover:text-white transition-colors" onClick={() => { setSortField('trackingId'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                            <div className="flex items-center gap-1">
                              Tracking ID
                              <span className="text-[9px] opacity-60">↕</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 w-[180px] min-w-[180px] align-middle">Sender / User</th>
                          <th className="px-4 py-3 w-[160px] min-w-[160px] align-middle cursor-pointer hover:text-white transition-colors" onClick={() => { setSortField('recipientName'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                            <div className="flex items-center gap-1">
                              Recipient Details
                              <span className="text-[9px] opacity-60">↕</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 w-[180px] min-w-[180px] align-middle">
                            <div>Route</div>
                            <div className="text-[8px] font-normal text-slate-500 lowercase font-mono">(pickup → dest)</div>
                          </th>
                          <th className="px-4 py-3 w-[120px] min-w-[120px] align-middle">Priority / Cost</th>
                          <th className="px-4 py-3 w-[130px] min-w-[130px] align-middle">Status</th>
                          <th className="px-4 py-3 w-[110px] min-w-[110px] align-middle">OTP Status</th>
                          <th className="px-4 py-3 w-[120px] min-w-[120px] align-middle">Payment</th>
                          <th className="px-4 py-3 w-[170px] min-w-[170px] align-middle">Assigned Agent</th>
                          <th className="px-4 py-3 w-[150px] min-w-[150px] align-middle">Delivery Lifecycle</th>
                          <th className="px-4 py-3 w-[90px] min-w-[90px] align-middle text-right pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium">
                        {paginatedOrders.map(o => (
                          <tr key={o._id} className="hover:bg-white/[0.02] transition-colors group h-[76px]">
                            {/* Tracking ID */}
                            <td className="px-4 py-3 w-[130px] min-w-[130px] align-middle">
                              <span className="font-mono font-extrabold text-primary text-xs tracking-tight block">{o.trackingId}</span>
                              <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</span>
                            </td>

                            {/* Sender / User */}
                            <td className="px-4 py-3 w-[180px] min-w-[180px] align-middle">
                              <span className="font-bold text-white block truncate max-w-[160px]" title={o.user?.name || 'Guest User'}>
                                {o.user?.name || 'Guest User'}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[160px] mt-0.5" title={o.user?.email || 'N/A'}>
                                {o.user?.email || 'N/A'}
                              </span>
                            </td>

                            {/* Recipient Details */}
                            <td className="px-4 py-3 w-[160px] min-w-[160px] align-middle">
                              <span className="font-bold text-slate-100 block truncate max-w-[145px]" title={o.recipientName}>
                                {o.recipientName}
                              </span>
                              <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                                {o.recipientPhone || 'N/A'}
                              </span>
                            </td>

                            {/* Route (Pickup -> Dest) */}
                            <td className="px-4 py-3 w-[180px] min-w-[180px] align-middle">
                              <span className="font-bold text-slate-200 block truncate max-w-[165px]" title={o.hub?.name || 'Central Hub'}>
                                {o.hub?.name || 'Central Hub'}
                              </span>
                              <span className="block text-[10px] text-slate-400 truncate max-w-[165px] mt-0.5" title={o.deliveryAddress?.address || 'Village Destination'}>
                                → {o.deliveryAddress?.address || 'Village Destination'}
                              </span>
                            </td>

                            {/* Priority / Cost */}
                            <td className="px-4 py-3 w-[120px] min-w-[120px] align-middle">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold inline-block leading-none ${
                                o.priority === 'high' 
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                                  : o.priority === 'low' 
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                              }`}>
                                {o.priority || 'medium'}
                              </span>
                              <span className="block text-xs font-mono font-bold text-white mt-1">
                                ₹{o.cost || 0}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 w-[130px] min-w-[130px] align-middle">
                              <span className={`px-2.5 py-1 rounded-full uppercase text-[9px] font-mono font-extrabold tracking-wider inline-flex items-center gap-1.5 leading-none ${
                                o.status === 'delivered' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : o.status === 'cancelled' 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : o.status === 'in_transit' 
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  o.status === 'delivered' ? 'bg-emerald-400' : o.status === 'cancelled' ? 'bg-red-400' : o.status === 'in_transit' ? 'bg-purple-400' : 'bg-amber-400 animate-pulse'
                                }`} />
                                {o.status ? o.status.replace('_', ' ') : 'pending'}
                              </span>
                            </td>

                            {/* OTP Status */}
                            <td className="px-4 py-3 w-[110px] min-w-[110px] align-middle">
                              <span className="font-mono font-extrabold text-cyan-400 text-xs tracking-wider block">
                                {o.otp || '----'}
                              </span>
                              <span className="block text-[9px] font-mono text-slate-500 mt-0.5">
                                {o.status === 'delivered' ? 'Verified ✓' : 'Pending Verification'}
                              </span>
                            </td>

                            {/* Payment */}
                            <td className="px-4 py-3 w-[120px] min-w-[120px] align-middle">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-mono font-bold inline-block leading-none ${
                                o.paymentStatus === 'paid' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : o.paymentStatus === 'cod' 
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {o.paymentStatus || 'Pending'}
                              </span>
                            </td>

                            {/* Assigned Agent */}
                            <td className="px-4 py-3 w-[170px] min-w-[170px] align-middle">
                              {o.agent ? (
                                <div className="flex items-center gap-2 h-9 px-2.5 rounded-xl bg-white/5 border border-white/5">
                                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[9px] flex items-center justify-center shrink-0">
                                    {o.agent.name?.charAt(0)}
                                  </div>
                                  <span className="font-bold text-slate-200 text-xs truncate max-w-[110px]" title={o.agent.name}>
                                    {o.agent.name}
                                  </span>
                                </div>
                              ) : (
                                <select 
                                  onChange={(e) => handleAssignAgent(o._id, e.target.value)}
                                  className="h-9 w-full bg-neutral-950 border border-white/10 rounded-xl px-2.5 text-slate-400 outline-none text-xs cursor-pointer hover:border-white/20 transition-colors"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Assign Agent...</option>
                                  {usersList.filter(u => u.role === 'agent').map(a => (
                                    <option key={a._id} value={a._id}>{a.name}</option>
                                  ))}
                                </select>
                              )}
                            </td>

                            {/* Delivery Lifecycle */}
                            <td className="px-4 py-3 w-[150px] min-w-[150px] align-middle">
                              <select 
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                                className="h-9 w-full bg-neutral-950 border border-white/10 rounded-xl px-2.5 text-xs font-semibold text-slate-200 cursor-pointer outline-none hover:border-white/20 transition-colors"
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
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 w-[90px] min-w-[90px] align-middle text-right pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => window.print()} 
                                  title="Print Label" 
                                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (!window.confirm('Delete this order entry permanently?')) return;
                                    try {
                                      await api.delete(`/api/orders/${o._id}`);
                                      fetchAdminData();
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }} 
                                  title="Delete Order"
                                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-red-400 hover:text-red-300 transition-colors"
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
              </div>

              {/* Pagination */}
              {filteredOrders.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/40 p-4 border border-white/5 rounded-3xl px-6 text-xs text-muted-foreground font-mono">
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
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                      disabled={currentPage === 1}
                      variant="ghost" 
                      size="sm" 
                      className="bg-white/5 hover:bg-white/10 text-xs rounded-xl py-1 px-3 border border-white/5 text-white disabled:opacity-30"
                    >
                      Previous
                    </Button>
                    <span className="font-bold text-white px-2">Page {currentPage} of {Math.ceil(filteredOrders.length / rowsPerPage)}</span>
                    <Button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / rowsPerPage)))} 
                      disabled={currentPage >= Math.ceil(filteredOrders.length / rowsPerPage)}
                      variant="ghost" 
                      size="sm" 
                      className="bg-white/5 hover:bg-white/10 text-xs rounded-xl py-1 px-3 border border-white/5 text-white disabled:opacity-30"
                    >
                      Next
                    </Button>
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
