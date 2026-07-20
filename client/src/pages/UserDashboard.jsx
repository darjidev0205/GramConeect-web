import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  MapPin, Search, Package, LogOut, CheckCircle2, Navigation, Bell, Settings, 
  HelpCircle, Compass, CreditCard, Clock, ArrowRight, ShieldCheck, AlertCircle, 
  List, History, User, UserCheck, Menu, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../components/auth/NotificationBell';
import { RoleSettings } from '../components/auth/RoleSettings';
import { SupportCenter } from '../components/support/SupportCenter';
import { io } from 'socket.io-client';
import API_BASE_URL from '../config/api';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dynamic menu configuration based on JWT permissions
  const menuConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: Navigation, permission: 'view_hubs' },
    { id: 'create', label: 'Create Delivery', icon: Compass, permission: 'create_delivery' },
    { id: 'track', label: 'Track Package', icon: Package, permission: 'track_package' },
    { id: 'history', label: 'Delivery History', icon: History, permission: 'delivery_history' }
  ];

  const allowedMenus = menuConfig.filter(item => {
    if (user?.permissions) {
      return user.permissions.includes(item.permission);
    }
    return true; // Fallback
  });

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'create', 'track', 'history'
  
  // Form states
  const [selectedHub, setSelectedHub] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [description, setDescription] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // API Lists
  const [hubs, setHubs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Layout triggers
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const mapInstanceRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied', 'ignored'

  // Expose hub selection helper on window object
  useEffect(() => {
    window.selectHubAndRedirect = (hubId) => {
      setSelectedHub(hubId);
      setActiveTab('create');
    };
    return () => {
      delete window.selectHubAndRedirect;
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // km
  };

  const getSortedHubs = () => {
    if (!userLocation) return hubs;
    return [...hubs].map(h => {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, h.location?.lat, h.location?.lng);
      const travelTime = distance ? Math.round((distance / 30) * 60) : null;
      return { ...h, distance, travelTime };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationPermissionStatus('granted');
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 11);
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setLocationPermissionStatus('denied');
        }
      );
    } else {
      setLocationPermissionStatus('denied');
    }
  };

  // Pre-select nearest hub automatically
  useEffect(() => {
    if (userLocation && hubs.length > 0 && !selectedHub) {
      const sorted = getSortedHubs();
      if (sorted.length > 0) {
        setSelectedHub(sorted[0]._id);
      }
    }
  }, [userLocation, hubs]);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request browser location permission & track GPS on tab change
  useEffect(() => {
    if (activeTab === 'dashboard') {
      detectLocation();
    }
  }, [activeTab]);

  // Fetch Hubs on Mount
  useEffect(() => {
    fetchHubs();
    fetchOrders();
  }, []);

  // Listen to Socket.io updates for real-time logistics sync
  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on('connect', () => {
      if (user?.id || user?.userId) {
        socket.emit('join_user', user.id || user.userId);
      }
    });

    socket.on('order_update', (updatedOrder) => {
      setOrders((prev) => {
        if (updatedOrder.deleted) {
          return prev.filter(o => o._id !== updatedOrder._id);
        }
        const exists = prev.some(o => o._id === updatedOrder._id);
        if (exists) {
          return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
        } else {
          // If it belongs to this villager, append it
          const ownerId = updatedOrder.user?._id || updatedOrder.user;
          const currentUserId = user?.id || user?.userId;
          if (ownerId && currentUserId && String(ownerId) === String(currentUserId)) {
            return [updatedOrder, ...prev];
          }
          return prev;
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchHubs = async () => {
    setLoadingHubs(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/hubs`);
      if (!response.ok) throw new Error('Failed to fetch hubs');
      const data = await response.json();
      setHubs(data);
    } catch (err) {
      console.error(err);
      setError('Could not load delivery hubs.');
    } finally {
      setLoadingHubs(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError('Could not sync logistics feed.');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    const container = document.getElementById('user-map');
    if (activeTab === 'dashboard' && container && window.L && hubs.length > 0) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center map on user location if available, otherwise first hub
      const centerLat = userLocation?.lat || hubs[0].location?.lat || 20.5937;
      const centerLng = userLocation?.lng || hubs[0].location?.lng || 78.9629;
      const zoomLevel = userLocation ? 12 : 9;

      const map = window.L.map('user-map').setView([centerLat, centerLng], zoomLevel);
      mapInstanceRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Plot user location marker if detected
      if (userLocation) {
        const pulsingDot = window.L.divIcon({
          className: 'relative flex h-5 w-5 justify-center items-center',
          html: '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white"></span>'
        });
        window.L.marker([userLocation.lat, userLocation.lng], { icon: pulsingDot })
          .addTo(map)
          .bindPopup('<b>Your Live GPS Location</b>');
      }

      // Plot Hub markers with relative stats
      hubs.forEach(h => {
        if (h.location && h.location.lat) {
          const distance = userLocation 
            ? calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng)
            : null;
          const travelTime = distance ? Math.round((distance / 30) * 60) : null;

          const popupHtml = `
            <div class="text-neutral-900 font-sans p-1 min-w-[220px]">
              <h3 class="font-extrabold text-sm border-b border-neutral-100 pb-1.5 mb-1.5">${h.name}</h3>
              <p class="text-xxs text-neutral-500 mb-2">${h.address}</p>
              <div class="space-y-1 text-xs">
                ${distance ? `<p class="flex justify-between font-semibold"><span>Distance:</span> <span class="text-blue-600">${distance.toFixed(1)} km</span></p>` : ''}
                ${travelTime ? `<p class="flex justify-between font-semibold"><span>Est. Time:</span> <span class="text-blue-600">${travelTime} mins</span></p>` : ''}
                <p class="text-neutral-600 flex justify-between"><span>Services:</span> <span>Last-Mile, Express</span></p>
                <p class="text-neutral-600 flex justify-between"><span>Manager:</span> <span>Rajesh Kumar</span></p>
                <p class="text-neutral-600 flex justify-between"><span>Working Hours:</span> <span>9 AM - 6 PM</span></p>
                <p class="text-neutral-600 flex justify-between"><span>Slots Available:</span> <span class="text-green-600 font-semibold">12 open</span></p>
              </div>
              <button onclick="window.selectHubAndRedirect('${h._id}')" class="w-full mt-3 bg-blue-600 text-white font-bold text-center py-2 rounded-lg border-none cursor-pointer text-xs hover:bg-blue-700 transition-colors shadow">
                Create Delivery Here
              </button>
            </div>
          `;

          window.L.marker([h.location.lat, h.location.lng])
            .addTo(map)
            .bindPopup(popupHtml);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, hubs, userLocation]);

  const selectedHubObj = hubs.find(h => h._id === selectedHub);
  const deliveryDistance = (userLocation && selectedHubObj && selectedHubObj.location)
    ? calculateDistance(userLocation.lat, userLocation.lng, selectedHubObj.location.lat, selectedHubObj.location.lng)
    : null;
  const deliveryTime = deliveryDistance ? Math.round((deliveryDistance / 30) * 60) : null;
  const deliveryCost = deliveryDistance ? Math.max(30, Math.round(deliveryDistance * 10)) : 50;

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedHub || !deliveryAddress || !recipientPhone || !recipientName) {
      setError('Please fill in all required fields.');
      return;
    }

    setPlacingOrder(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hub: selectedHub,
          deliveryAddress: {
            address: deliveryAddress,
            landmark: 'Village Entrance',
            lat: 20.5937,
            lng: 78.9629
          },
          recipientName,
          recipientPhone,
          description,
          price: deliveryCost
        })
      });

      if (!response.ok) throw new Error('Order creation failed');
      
      setSuccess('Your delivery request has been placed successfully!');
      setSelectedHub('');
      setDeliveryAddress('');
      setDescription('');
      setRecipientPhone('');
      setRecipientName('');
      fetchOrders();
      setActiveTab('track');
    } catch (err) {
      setError(err.message || 'Could not place delivery request.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const cancelOrder = async (orderId) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      });
      if (!response.ok) throw new Error('Could not cancel order');
      setSuccess('Delivery request cancelled successfully.');
      fetchOrders();
    } catch (err) {
      setError(err.message || 'Could not process cancellation request.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Metrics derived from dynamic database orders
  const activeDeliveries = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pendingDeliveries = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-primary selection:text-black">
      
      {/* Top Header Navbar */}
      <nav className="sticky top-0 z-50 bg-black/90 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Navigation className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              GRAMCONNECT
            </span>
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-muted-foreground">
              Villager Portal
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {/* Notifications */}
            <NotificationBell />

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex items-center justify-center font-bold text-primary bg-neutral-900 shrink-0">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-none">{user?.name || 'Villager User'}</p>
                <p className="text-xxs text-muted-foreground mt-0.5">Role: Villager</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          {/* Mobile Hamburger menu */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Mobile Dropdown menu content */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {user?.name?.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Villager Account</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-center">
              {allowedMenus.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
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

      {/* Main Workspace Layout */}
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
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button 
              onClick={() => setActiveTab('support')} 
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${activeTab === 'support' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <HelpCircle className="w-4 h-4" /> Support
            </button>
          </div>
        </aside>

        {/* Dashboard Work Area */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Status Alert Banners */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              {/* Hero welcomer */}
              <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-neutral-900 to-black relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-widest text-primary flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Active Account Checked
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.name}!</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {currentTime}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-center min-w-[95px]">
                      <p className="text-xxs uppercase tracking-wider text-muted-foreground">Zone Status</p>
                      <p className="text-sm font-bold text-green-400 mt-1.5 flex items-center justify-center gap-1">
                        Active 🟢
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => setActiveTab('create')}
                  className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all text-left flex flex-col justify-between h-28 group"
                >
                  <Compass className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">Create Request</span>
                </button>
                <button 
                  onClick={() => setActiveTab('track')}
                  className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all text-left flex flex-col justify-between h-28 group"
                >
                  <Clock className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">Track Package</span>
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all text-left flex flex-col justify-between h-28 group"
                >
                  <History className="w-6 h-6 text-muted-foreground group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">History Log</span>
                </button>
                <button 
                  onClick={fetchOrders}
                  className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all text-left flex flex-col justify-between h-28 group"
                >
                  <RefreshCw className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-semibold text-sm">Refresh Feed</span>
                </button>
              </div>

              {/* Stats metric cards grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Active Deliveries</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold">{activeDeliveries.length}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">Transit</span>
                  </div>
                </Card>
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Pending Assignment</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold">{pendingDeliveries.length}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/20">Pool</span>
                  </div>
                </Card>
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Completed Deliveries</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold">{completedOrders.length}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">Delivered</span>
                  </div>
                </Card>
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Wallet Balance (Future)</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold text-muted-foreground">₹0.00</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5">N/A</span>
                  </div>
                </Card>
              </div>

              {/* Interactive map of seeded delivery nodes or friendly permission denied fallback card */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Regional Delivery Hub Networks</h2>
                  <span className="text-xs text-muted-foreground">{hubs.length} Active Nodes</span>
                </div>

                {locationPermissionStatus === 'denied' ? (
                  <div className="bg-neutral-900 border border-white/5 p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-4 min-h-[320px] animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                      <MapPin className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="font-extrabold text-lg text-white">📍 Location Access Required</h3>
                    <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                      We use your location to show nearby delivery hubs, estimate delivery time, and calculate the closest pickup point.
                    </p>
                    
                    {/* Detailed settings instructions for Chrome, Firefox, Edge, Safari */}
                    <div className="text-xxs text-left text-muted-foreground bg-white/2 border border-white/5 rounded-2xl p-4 max-w-md w-full space-y-1.5 font-mono">
                      <p className="font-bold text-white mb-1 uppercase tracking-wider text-[9px]">How to restore location access:</p>
                      <p>• <b>Google Chrome / Edge:</b> Click the lock icon next to the URL address bar, and switch Location permission to "Allow".</p>
                      <p>• <b>Mozilla Firefox:</b> Click the permission permissions icon next to the URL, and click "Clear" next to blocked status.</p>
                      <p>• <b>Apple Safari:</b> Open Settings/Preferences &gt; Websites &gt; Location, and choose "Allow" for this portal.</p>
                    </div>

                    <div className="flex gap-2.5 flex-wrap justify-center mt-2.5">
                      <Button onClick={detectLocation} className="bg-primary text-black font-bold text-xs h-10 px-5 rounded-xl hover:bg-primary/95 transition-all">
                        Enable Location / Retry
                      </Button>
                      <Button variant="ghost" onClick={() => setLocationPermissionStatus('ignored')} className="text-white bg-white/5 hover:bg-white/10 border border-white/5 text-xs h-10 px-5 rounded-xl transition-all">
                        Continue without location
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[320px] rounded-3xl border border-white/5 bg-neutral-900/50 overflow-hidden relative flex flex-col justify-end">
                     <div id="user-map" className="w-full h-full min-h-[220px]"></div>
                     <button 
                       type="button"
                       onClick={detectLocation}
                       className="absolute top-4 right-4 z-[1000] p-2.5 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-xl text-primary text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                     >
                       <MapPin className="w-3.5 h-3.5 text-primary" /> Locate Me
                     </button>
                     <div className="relative z-10 flex flex-col items-center p-3.5 bg-neutral-900 border-t border-white/5 text-xs text-muted-foreground text-center">
                       {loadingHubs ? 'Mapping Hub points...' : 'Select a hub node to use as pickup location during checkout.'}
                     </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: CREATE DELIVERY REQUEST */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Place Delivery Request</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Initiate a last-mile delivery from a regional hub to any local village address.</p>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-6 bg-neutral-900 border border-white/5 p-6 rounded-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">Select Pickup Hub (Origin)</label>
                    <select
                      className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary transition-all text-white cursor-pointer"
                      value={selectedHub}
                      onChange={e => setSelectedHub(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Hub Point --</option>
                      {getSortedHubs().map(h => {
                        const distStr = h.distance !== undefined && h.distance !== null 
                          ? ` (${h.distance.toFixed(1)} km - ${h.travelTime} min)` 
                          : '';
                        return (
                          <option key={h._id} value={h._id}>
                            {h.name} - {h.address}{distStr}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">Destination Address (Villager Home/Landmark)</label>
                    <Input
                      placeholder="e.g. Panchayat Gate, Ward No. 3"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="bg-neutral-800 border-white/10 text-white rounded-xl h-11 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">Recipient Full Name</label>
                    <Input
                      placeholder="Enter recipient's name"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      className="bg-neutral-800 border-white/10 text-white rounded-xl h-11 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">Recipient Phone Number (10 digits)</label>
                    <Input
                      placeholder="e.g. 9974712552"
                      value={recipientPhone}
                      onChange={e => setRecipientPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                      className="bg-neutral-800 border-white/10 text-white rounded-xl h-11 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground block">Package Contents Description</label>
                  <textarea
                    placeholder="Describe contents (e.g. Seeds pack, medical supplies)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary transition-all text-white h-24"
                  />
                </div>

                {deliveryDistance !== null && (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 mt-4 text-xs">
                    <p className="font-bold text-white mb-2 uppercase tracking-wider text-xxs">Logistics Estimates</p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calculated Distance:</span>
                      <span className="font-semibold text-white">{deliveryDistance.toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Delivery Time:</span>
                      <span className="font-semibold text-white">{deliveryTime} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Delivery Cost:</span>
                      <span className="font-semibold text-green-400">₹{deliveryCost}.00</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-4">
                  <div className="text-left">
                    <p className="text-xxs uppercase tracking-wider text-muted-foreground">Calculated Delivery Fee</p>
                    <p className="text-2xl font-bold text-green-400">₹{deliveryCost}.00</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-primary text-black font-bold px-8 py-6 rounded-xl hover:bg-primary/90"
                    disabled={placingOrder}
                  >
                    {placingOrder ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm Order placement'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: TRACK PACKAGE VIEW */}
          {activeTab === 'track' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Active Delivery Requests</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Monitor progress status and get delivery confirmation OTP codes.</p>
                </div>
                <button onClick={fetchOrders} className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <RefreshCw className="w-4 h-4 text-muted-foreground hover:text-white" />
                </button>
              </div>

              {loadingOrders ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" /> Fetching live transit logs...
                </div>
              ) : (
                <div className="space-y-4">
                  {activeDeliveries.map(order => (
                    <Card key={order._id} className="border border-white/5 bg-neutral-900 p-6 rounded-3xl">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-extrabold text-base">{order.recipientName || 'Recipient'}</span>
                            <span className="text-xxs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground">{order.trackingId}</span>
                            <span className={`text-xxs px-2.5 py-0.5 rounded-full uppercase tracking-wider ${order.status === 'out_for_delivery' ? 'bg-primary/20 text-primary border border-primary/20' : order.status === 'pending' ? 'bg-accent/20 text-accent border border-accent/20' : 'bg-white/5 text-muted-foreground border'}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="text-muted-foreground text-xs leading-relaxed">
                            <p>Origin: <b className="text-white">{order.hub?.name || 'Local Hub'}</b></p>
                            <p>Recipient Destination: <b className="text-white">{order.deliveryAddress?.address || 'Village Address'}</b></p>
                            {order.description && <p className="mt-1">Contents: <i>{order.description}</i></p>}
                          </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0 self-stretch md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                          {/* OTP verification display */}
                          <div className="text-left md:text-right bg-primary/10 border border-primary/20 rounded-xl p-3">
                            <p className="text-xxs uppercase tracking-wider text-primary">Confirmation OTP</p>
                            <p className="text-xl font-bold tracking-widest text-white mt-0.5">{order.otp}</p>
                          </div>

                          {order.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              onClick={() => cancelOrder(order._id)}
                              className="text-red-400 hover:bg-red-500/10 text-xs font-semibold h-8 rounded-lg"
                            >
                              Cancel Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {activeDeliveries.length === 0 && (
                    <EmptyTasksState message="You do not have any packages currently in transit. Place a delivery request to begin!" onRefresh={fetchOrders} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DELIVERY HISTORY */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-6">Delivery History Logs</h2>
              <div className="space-y-4">
                {completedOrders.map(order => (
                  <Card key={order._id} className="bg-neutral-900 border-white/5 p-5 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{order.recipientName || 'Recipient'}</p>
                          <span className="text-xxs px-2 py-0.5 rounded bg-white/5 font-mono border text-muted-foreground">{order.trackingId}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pickup Hub: {order.hub?.name || 'Local Hub'} • Delivered to: {order.deliveryAddress?.address || 'Village Address'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-center items-end shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                      <p className="text-xs font-semibold text-green-400">Delivered Successfully</p>
                      <p className="text-xxs text-muted-foreground mt-1">Confirmed OTP: {order.otp}</p>
                    </div>
                  </Card>
                ))}
                {completedOrders.length === 0 && (
                  <EmptyTasksState message="No completed deliveries found in your log feed." onRefresh={fetchOrders} />
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <RoleSettings />
          )}

          {/* TAB 6: SUPPORT CENTER VIEW */}
          {activeTab === 'support' && (
            <SupportCenter />
          )}

        </main>
      </div>
    </div>
  );
};

// Empty logs state
const EmptyTasksState = ({ message, onRefresh }) => (
  <div className="text-center py-16 px-6 border border-dashed border-white/10 rounded-3xl bg-neutral-900/40 flex flex-col items-center justify-center">
    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground mb-4">
      <Compass className="w-7 h-7" />
    </div>
    <h3 className="font-bold text-lg mb-1">Queue Synchronized</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
      {message}
    </p>
    <Button variant="outline" onClick={onRefresh} className="rounded-xl border-white/10 hover:bg-white/5 px-6">
      <RefreshCw className="w-4 h-4 mr-2" /> Refresh Feed
    </Button>
  </div>
);

export default UserDashboard;
