import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Users, Truck, MapPin, Package, Settings, LogOut, ArrowUpRight, Menu, X,
  Plus, Edit2, Trash2, ShieldAlert, CheckCircle2, DollarSign, Activity, 
  Bell, HelpCircle, BarChart3, FileSpreadsheet, RefreshCw, Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../components/auth/NotificationBell';
import { RoleSettings } from '../components/auth/RoleSettings';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dynamic menu configuration based on JWT permissions
  const menuConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, permission: 'dashboard' },
    { id: 'hubs', label: 'Hub Management', icon: MapPin, permission: 'manage_hubs' },
    { id: 'users', label: 'Users List', icon: Users, permission: 'suspend_user' },
    { id: 'agents', label: 'Agents List', icon: Truck, permission: 'create_agent' },
    { id: 'orders', label: 'Orders Control', icon: Package, permission: 'manage_orders' }
  ];

  const allowedMenus = menuConfig.filter(item => {
    if (user?.permissions) {
      return user.permissions.includes(item.permission);
    }
    return true; // Fallback
  });
  
  // Tab Navigation
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'hubs', 'users', 'agents', 'orders'
  
  // Data lists
  const [hubs, setHubs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hub Form Modal State
  const [showHubModal, setShowHubModal] = useState(false);
  const [editingHubId, setEditingHubId] = useState(null);
  const [hubName, setHubName] = useState('');
  const [hubAddress, setHubAddress] = useState('');
  const [hubLat, setHubLat] = useState('20.5937');
  const [hubLng, setHubLng] = useState('78.9629');

  // Mobile layout
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

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
    const socket = io('http://localhost:5000');
    socket.on('connect', () => {
      socket.emit('join_role', 'admin');
      if (user?.id || user?.userId) {
        socket.emit('join_user', user.id || user.userId);
      }
    });

    socket.on('order_update', (updatedOrder) => {
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
      const hubsRes = await fetch('http://localhost:5000/api/hubs');
      if (!hubsRes.ok) throw new Error('Failed to load hubs');
      const hubsData = await hubsRes.json();
      setHubs(hubsData);

      // 2. Fetch Orders
      const ordersRes = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!ordersRes.ok) throw new Error('Failed to load orders');
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      // 3. Fetch Registered Users/Agents (Admin only)
      const usersRes = await fetch('http://localhost:5000/api/auth/users', {
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
        // Edit Hub
        response = await fetch(`http://localhost:5000/api/hubs/${editingHubId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Hub
        response = await fetch('http://localhost:5000/api/hubs', {
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
      const response = await fetch(`http://localhost:5000/api/hubs/${id}`, {
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
      const response = await fetch(`http://localhost:5000/api/auth/users/${id}`, {
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

  // Calculations for Admin Analytics Metrics
  const totalUsers = usersList.filter(u => u.role === 'user').length;
  const totalAgents = usersList.filter(u => u.role === 'agent').length;
  const activeDeliveries = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const completedDeliveries = orders.filter(o => o.status === 'delivered').length;
  const revenueTotal = completedDeliveries * 50; 
  const totalHubsCount = hubs.length;
  const pendingRequests = orders.filter(o => o.status === 'pending').length;
  const todayOrdersCount = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.createdAt).toDateString() === today;
  }).length;

  const getRecentLogs = () => {
    if (orders.length === 0) return [{ msg: "System idle. Ready for logistics dispatch.", time: "System Log", type: 'info' }];
    return orders.slice(0, 5).map((order) => {
      let msg = `Order ${order.trackingId} transit update: ${order.status.replace('_', ' ')}.`;
      let type = 'info';
      if (order.status === 'delivered') {
        msg = `Delivery confirmed for ID ${order.trackingId}.`;
        type = 'success';
      } else if (order.status === 'cancelled') {
        msg = `Request ${order.trackingId} was cancelled.`;
        type = 'warning';
      }
      
      const timeDiff = Math.abs(new Date() - new Date(order.createdAt));
      const minsDiff = Math.floor(timeDiff / (1000 * 60));
      const hoursDiff = Math.floor(minsDiff / 60);
      const timeStr = hoursDiff > 0 ? `${hoursDiff}h ago` : minsDiff > 0 ? `${minsDiff}m ago` : 'Just now';

      return { msg, time: timeStr, type };
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-primary selection:text-black">
      
      {/* Top Header Navbar */}
      <nav className="sticky top-0 z-50 bg-black/90 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Settings className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              GRAMCONNECT
            </span>
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-muted-foreground">
              Admin Control Center
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> System Node Status: Healthy
            </span>

            {/* Notifications */}
            <NotificationBell />

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center font-bold text-primary">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-none">{user?.name || 'Administrator'}</p>
                <p className="text-xxs text-muted-foreground mt-0.5">Role: System Admin</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          {/* Mobile Hamburguer trigger */}
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
        <aside className="hidden lg:flex w-64 flex-col gap-2 shrink-0">
          <div className="p-4 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-1.5">
            {allowedMenus.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${activeTab === item.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                >
                  <Icon className="w-4.5 h-4.5" /> {item.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-1.5 mt-auto">
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${activeTab === 'settings' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" /> System Settings
            </button>
            <button className="w-full py-3 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white flex items-center gap-3 transition-all"><HelpCircle className="w-4 h-4" /> Support Tickets</button>
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

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Dynamic stats cards grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Total Users</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold">{loading ? '...' : totalUsers}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">Villagers</span>
                  </div>
                </Card>
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Total Agents</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold">{loading ? '...' : totalAgents}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/20">Delivery</span>
                  </div>
                </Card>
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Active Transits</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold">{loading ? '...' : activeDeliveries}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">In-Flight</span>
                  </div>
                </Card>
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Gross Revenue</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold text-green-400">₹{loading ? '...' : revenueTotal}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">Revenue</span>
                  </div>
                </Card>
              </div>

              {/* Secondary Stats metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                  <p className="text-xxs uppercase tracking-wider text-muted-foreground">Total Seeded Hubs</p>
                  <p className="text-xl font-bold mt-1">{totalHubsCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                  <p className="text-xxs uppercase tracking-wider text-muted-foreground">Pending Requests</p>
                  <p className="text-xl font-bold mt-1 text-accent">{pendingRequests}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                  <p className="text-xxs uppercase tracking-wider text-muted-foreground">Today's Orders</p>
                  <p className="text-xl font-bold mt-1 text-primary">{todayOrdersCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                  <p className="text-xxs uppercase tracking-wider text-muted-foreground">Completed Deliveries</p>
                  <p className="text-xl font-bold mt-1 text-green-400">{completedDeliveries}</p>
                </div>
              </div>

              {/* Activity Log and Map */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Activities feed */}
                <Card className="lg:col-span-2 border-white/5 bg-neutral-900 p-6 rounded-3xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Live Logistics Activity Feed
                  </h3>
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto no-scrollbar">
                    {getRecentLogs().map((log, i) => (
                      <div key={i} className="flex gap-4 items-start p-3.5 rounded-2xl border border-white/5 bg-black/40">
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.type === 'success' ? 'bg-primary' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold leading-relaxed text-white/90">{log.msg}</p>
                          <p className="text-xxs text-muted-foreground mt-1 font-mono">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Hub Map */}
                <Card className="border-white/5 bg-neutral-900 p-6 rounded-3xl">
                  <h3 className="text-lg font-bold mb-4">Hub Topology Map</h3>
                  <div className="h-[240px] rounded-2xl border border-white/5 overflow-hidden relative flex flex-col justify-end">
                    <div id="admin-map" className="w-full h-full min-h-[180px]"></div>
                    <div className="relative z-10 p-2.5 bg-neutral-900 border-t border-white/5 text-center text-xxs text-muted-foreground">
                      {hubs.length} Active Hub Nodes Seeded
                    </div>
                  </div>
                </Card>

              </div>
            </>
          )}

          {/* TAB 2: HUBS MANAGEMENT */}
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

              {/* Hub Modal */}
              {showHubModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowHubModal(false)} />
                  <Card className="bg-neutral-900 border-white/10 max-w-md w-full p-6 rounded-3xl relative z-10">
                    <h3 className="text-lg font-bold mb-4">{editingHubId ? 'Edit Hub Node' : 'Create Hub Node'}</h3>
                    <form onSubmit={handleSaveHub} className="space-y-4">
                      <div>
                        <label className="text-xxs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Hub Name</label>
                        <Input value={hubName} onChange={e => setHubName(e.target.value)} placeholder="e.g. Village West Hub" className="bg-neutral-800 border-white/10" required />
                      </div>
                      <div>
                        <label className="text-xxs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Street Address</label>
                        <Input value={hubAddress} onChange={e => setHubAddress(e.target.value)} placeholder="e.g. Near Old Panchayat Bhavan" className="bg-neutral-800 border-white/10" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xxs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Latitude</label>
                          <Input value={hubLat} onChange={e => setHubLat(e.target.value)} className="bg-neutral-800 border-white/10" required />
                        </div>
                        <div>
                          <label className="text-xxs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Longitude</label>
                          <Input value={hubLng} onChange={e => setHubLng(e.target.value)} className="bg-neutral-800 border-white/10" required />
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowHubModal(false)}>Cancel</Button>
                        <Button type="submit" className="bg-primary text-black font-bold">Save Hub Node</Button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}

              {/* Hubs list table */}
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

          {/* TAB 3: USER DIRECTORIES */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-6">Registered Villager Profiles</h2>
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

          {/* TAB 4: AGENTS LIST */}
          {activeTab === 'agents' && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-6">Delivery Logistics Partners</h2>
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

          {/* TAB 5: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-6">Central Orders Registry</h2>
              <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-white/2 text-muted-foreground text-xs uppercase border-b border-white/5">
                      <th className="p-4 font-bold">Tracking ID</th>
                      <th className="p-4 font-bold">Sender / Recipient</th>
                      <th className="p-4 font-bold">Hub Point</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">OTP</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map(o => (
                      <tr key={o._id} className="hover:bg-white/1">
                        <td className="p-4 font-mono font-bold text-xs">{o.trackingId}</td>
                        <td className="p-4 text-xs">
                          <span className="font-semibold text-white/90">Recipient: {o.recipientName}</span>
                          <span className="block text-xxs text-muted-foreground mt-0.5">Dest: {o.deliveryAddress?.address}</span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">{o.hub?.name || 'Local Hub'}</td>
                        <td className="p-4 text-xs">
                          <span className={`px-2 py-0.5 rounded-full uppercase text-xxs tracking-wider ${o.status === 'delivered' ? 'bg-primary/20 text-primary border border-primary/20' : o.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-accent/20 text-accent border border-accent/20'}`}>
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs font-semibold text-primary">{o.otp}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={async () => {
                              if (!window.confirm('Delete this order entry permanently?')) return;
                              const token = localStorage.getItem('token');
                              await fetch(`http://localhost:5000/api/orders/${o._id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              fetchAdminData();
                            }} 
                            className="p-2 rounded bg-white/5 border border-white/5 hover:border-red-500/20 text-red-400 transition-colors"
                          >
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

          {/* TAB 6: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <RoleSettings />
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
