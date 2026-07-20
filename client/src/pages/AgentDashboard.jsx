import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  MapPin, Package, Check, X, Phone, Navigation, Bell, Settings, HelpCircle, 
  LogOut, Clock, DollarSign, Award, Star, List, History, Wallet, UserCheck, 
  ShieldAlert, RefreshCw, Compass, AlertCircle, Menu, User, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../components/auth/NotificationBell';
import { RoleSettings } from '../components/auth/RoleSettings';
import { SupportCenter } from '../components/support/SupportCenter';
import { io } from 'socket.io-client';
import API_BASE_URL from '../config/api';

const AgentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Dashboard state
  const [tasks, setTasks] = useState([]);
  const [historyTasks, setHistoryTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'tasks', 'history', 'wallet', 'profile'
  const [isOnline, setIsOnline] = useState(true);
  const [otpMode, setOtpMode] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  
  // App alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Interactive menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Date/Time Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch orders from server
  useEffect(() => {
    fetchTasks();
  }, []);

  // Listen to Socket.io updates for real-time logistics sync
  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on('connect', () => {
      socket.emit('join_role', 'agent');
      if (user?.id || user?.userId) {
        socket.emit('join_user', user.id || user.userId);
      }
    });

    socket.on('order_update', (updatedOrder) => {
      fetchTasks();
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      
      // Active pool: pending (unassigned) and out_for_delivery (assigned to me)
      const active = data.filter(t => t.status !== 'delivered' && t.status !== 'cancelled');
      // History pool: completed/delivered by this agent
      const history = data.filter(t => t.status === 'delivered' && t.agent === user.id);

      setTasks(active);
      setHistoryTasks(history);
    } catch (err) {
      console.error(err);
      setError('Could not sync logistics feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const acceptTask = async (taskId) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'out_for_delivery',
          agentId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to accept task');
      setSuccess('Task assigned to your queue.');
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError('Could not accept package.');
    }
  };

  const rejectTask = async (taskId) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'pending',
          agentId: null
        })
      });

      if (!response.ok) throw new Error('Failed to return task to pool');
      setSuccess('Task returned to available pool.');
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError('Could not release task.');
    }
  };

  const verifyOTP = async (taskId) => {
    setError('');
    setSuccess('');
    const targetOrder = tasks.find(t => t._id === taskId);
    if (!targetOrder) return;

    if (otpInput !== targetOrder.otp) {
      setError('Incorrect verification code. Please confirm with the recipient.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'delivered'
        })
      });

      if (!response.ok) throw new Error('Failed to deliver task');

      setSuccess('Delivery completed and confirmed successfully!');
      setOtpMode(null);
      setOtpInput('');
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError('Error verifying delivery code.');
    }
  };

  // Dynamic Metrics derived from existing database tasks
  const availableTasks = tasks.filter(t => !t.agent && t.status === 'pending');
  const assignedTasks = tasks.filter(t => t.agent === user.id && t.status === 'out_for_delivery');
  
  const completedTodayCount = historyTasks.length; 
  const totalEarnings = completedTodayCount * 50; 
  const rating = 4.9;
  const completionRate = completedTodayCount > 0 ? '100%' : 'N/A';

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-primary selection:text-black">
      
      {/* Navbar Header */}
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
              Agent Portal
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {/* Status Toggle */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-medium text-white/80">{isOnline ? 'Online' : 'Offline'}</span>
              <button 
                onClick={() => setIsOnline(!isOnline)}
                className={`w-8 h-4 rounded-full transition-colors relative ml-1 ${isOnline ? 'bg-primary' : 'bg-white/20'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.25 transition-all ${isOnline ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* User Profile Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex items-center justify-center font-bold text-primary bg-neutral-900 shrink-0">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'A'
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-none">{user?.name || 'Agent'}</p>
                <p className="text-xxs text-muted-foreground font-mono mt-0.5">ID: {user?.id?.substring(0, 8) || 'N/A'}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          {/* Mobile Hamburguer Menu Trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {user?.name?.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">ID: {user?.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOnline(!isOnline)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${isOnline ? 'bg-primary/20 border-primary text-primary' : 'bg-red-500/20 border-red-500 text-red-500'}`}
              >
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-center">
              <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-xl border ${activeTab === 'dashboard' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'}`}>Dashboard</button>
              <button onClick={() => { setActiveTab('tasks'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-xl border ${activeTab === 'tasks' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'}`}>Deliveries</button>
              <button onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-xl border ${activeTab === 'history' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'}`}>History</button>
              <button onClick={() => { setActiveTab('wallet'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-xl border ${activeTab === 'wallet' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'}`}>Wallet</button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        )}
      </nav>

      {/* Main Dashboard Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6 relative">
        
        {/* Sidebar Left navigation */}
        <aside className="hidden lg:flex w-64 flex-col gap-2 shrink-0">
          <div className="p-4 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <Navigation className="w-4.5 h-4.5" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${activeTab === 'tasks' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <Package className="w-4.5 h-4.5" /> Live Tasks
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${activeTab === 'history' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <History className="w-4.5 h-4.5" /> Delivery History
            </button>
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${activeTab === 'wallet' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <Wallet className="w-4.5 h-4.5" /> Earnings Wallet
            </button>
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
              <HelpCircle className="w-4 h-4" /> Help Center
            </button>
          </div>
        </aside>

        {/* Dashboard Work Area */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Notification Banners */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              {/* Hero welcome header */}
              <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-neutral-900 to-black relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-widest text-primary flex items-center gap-1.5 mb-2">
                      <Award className="w-4 h-4 text-primary" /> Active Logistics Officer
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight">{getGreeting()}, {user?.name}!</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {currentTime}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-center min-w-[90px]">
                      <p className="text-xxs uppercase tracking-wider text-muted-foreground">Rating</p>
                      <p className="text-lg font-bold text-yellow-400 mt-0.5 flex items-center justify-center gap-1">
                        {rating} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </p>
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-center min-w-[90px]">
                      <p className="text-xxs uppercase tracking-wider text-muted-foreground">Level</p>
                      <p className="text-lg font-bold text-primary mt-0.5 flex items-center justify-center gap-1">
                        Gold <Award className="w-4 h-4 text-primary" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all text-left flex flex-col justify-between h-28 group"
                >
                  <Compass className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">Accept Deliveries</span>
                </button>
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all text-left flex flex-col justify-between h-28 group"
                >
                  <Clock className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">Active Queue</span>
                </button>
                <button 
                  onClick={() => setActiveTab('wallet')}
                  className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all text-left flex flex-col justify-between h-28 group"
                >
                  <Wallet className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">Payout Status</span>
                </button>
                <button 
                  onClick={fetchTasks}
                  className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all text-left flex flex-col justify-between h-28 group"
                >
                  <RefreshCw className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-semibold text-sm">Refresh Feed</span>
                </button>
              </div>

              {/* Grid Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Available Tasks</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold">{availableTasks.length}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">Open Pool</span>
                  </div>
                </Card>
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Assigned Tasks</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold">{assignedTasks.length}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/20">My Queue</span>
                  </div>
                </Card>
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Completed Today</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold">{completedTodayCount}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">Delivered</span>
                  </div>
                </Card>
                <Card className="bg-neutral-900 border-white/5 p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs font-semibold text-muted-foreground">Today's Earnings</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-3xl font-extrabold text-green-400">₹{totalEarnings}</p>
                    <span className="text-xxs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">Wallet</span>
                  </div>
                </Card>
              </div>

              {/* Active Deliveries Quick List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">My Active Queue ({assignedTasks.length})</h2>
                  <button onClick={() => setActiveTab('tasks')} className="text-xs font-semibold text-primary hover:underline">View All</button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground gap-3">
                    <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading metrics...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedTasks.map(task => (
                      <DeliveryCard 
                        key={task._id} 
                        task={task} 
                        agentId={user.id}
                        acceptTask={acceptTask}
                        rejectTask={rejectTask}
                        otpMode={otpMode}
                        setOtpMode={setOtpMode}
                        otpInput={otpInput}
                        setOtpInput={setOtpInput}
                        verifyOTP={verifyOTP}
                      />
                    ))}
                    {assignedTasks.length === 0 && (
                      <EmptyTasksState message="You don't have any deliveries in progress right now. Accept an open task to begin earning!" onRefresh={fetchTasks} />
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: LIVE TASKS LIST */}
          {activeTab === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Available Delivery Pool</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Claim tasks below to assign them to your profile.</p>
                </div>
                <button onClick={fetchTasks} className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <RefreshCw className="w-4 h-4 text-muted-foreground hover:text-white" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" /> Syncing live logistics queue...
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <DeliveryCard 
                      key={task._id} 
                      task={task} 
                      agentId={user.id}
                      acceptTask={acceptTask}
                      rejectTask={rejectTask}
                      otpMode={otpMode}
                      setOtpMode={setOtpMode}
                      otpInput={otpInput}
                      setOtpInput={setOtpInput}
                      verifyOTP={verifyOTP}
                    />
                  ))}
                  {tasks.length === 0 && (
                    <EmptyTasksState message="No tasks are available in the regional pool at this time." onRefresh={fetchTasks} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DELIVERY HISTORY */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-6">Your Completed Deliveries</h2>
              <div className="space-y-4">
                {historyTasks.map(task => (
                  <Card key={task._id} className="bg-neutral-900 border-white/5 p-5 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{task.user?.name || 'Registered Customer'}</p>
                          <span className="text-xxs px-2 py-0.5 rounded bg-white/5 font-mono border text-muted-foreground">{task.trackingId}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> Hub: {task.hub?.name || 'Local Hub'} • {task.deliveryAddress?.address || 'Village Address'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                      <p className="text-sm font-semibold text-green-400">+₹50.00 Earned</p>
                      <p className="text-xxs text-muted-foreground font-mono mt-1">Confirmed OTP: {task.otp}</p>
                    </div>
                  </Card>
                ))}
                {historyTasks.length === 0 && (
                  <EmptyTasksState message="You haven't completed any deliveries yet. Start accepting tasks to build your delivery logs!" onRefresh={fetchTasks} />
                )}
              </div>
            </div>
          )}

          {/* TAB 4: WALLET */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight">Earnings Wallet</h2>
              
              <div className="p-6 rounded-3xl border border-white/5 bg-gradient-to-r from-emerald-950/20 to-neutral-950 p-6 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Settled Balance</p>
                  <h3 className="text-4xl font-extrabold text-green-400 mt-2">₹{totalEarnings}.00</h3>
                  <p className="text-xs text-muted-foreground mt-1">Next automatic settlement: Weekly Friday Payouts</p>
                </div>
                <Button className="bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl py-6 px-6">
                  <Wallet className="w-5 h-5 mr-2" /> Request Instant Payout
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Payout Transaction Logs</h3>
                <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                  {historyTasks.map(task => (
                    <div key={task._id} className="p-4 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="font-semibold">Delivery Reward Payout</p>
                          <p className="text-xxs text-muted-foreground">Order ID: {task.trackingId}</p>
                        </div>
                      </div>
                      <p className="font-bold text-green-400">+₹50.00</p>
                    </div>
                  ))}
                  {historyTasks.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">No payout records generated.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <RoleSettings />
          )}

          {/* TAB 6: SUPPORT CENTER */}
          {activeTab === 'support' && (
            <SupportCenter />
          )}

        </main>
      </div>
    </div>
  );
};

// Delivery Card component
const DeliveryCard = ({ 
  task, 
  agentId, 
  acceptTask, 
  rejectTask, 
  otpMode, 
  setOtpMode, 
  otpInput, 
  setOtpInput, 
  verifyOTP 
}) => {
  const isAssignedToMe = task.agent === agentId || task.status === 'out_for_delivery';
  
  return (
    <Card className="border border-white/5 bg-neutral-900 hover:border-white/10 transition-all overflow-hidden group shadow-md rounded-3xl">
      <div className="flex flex-col md:flex-row">
        
        {/* Left Side Status indicator */}
        <div className={`p-6 flex flex-col items-center justify-center md:w-32 md:border-r border-white/5 shrink-0 transition-colors ${isAssignedToMe ? 'bg-primary/5' : 'bg-white/2'}`}>
          <Package className={`w-10 h-10 ${isAssignedToMe ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`text-xxs font-mono uppercase tracking-wider mt-2.5 px-2 py-0.5 rounded ${isAssignedToMe ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-muted-foreground border border-white/5'}`}>
            {isAssignedToMe ? 'Assigned' : 'Open'}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-lg">{task.user?.name || 'Registered Customer'}</span>
                <span className="text-xxs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground">{task.trackingId}</span>
              </div>
              
              <div className="text-muted-foreground flex items-start gap-2 text-xs mt-2 leading-relaxed">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/80 font-medium">Hub: {task.hub?.name || 'Local Hub'}</p>
                  <p className="mt-0.5">Recipient Address: {task.deliveryAddress?.address || 'Village Address'}</p>
                </div>
              </div>
            </div>

            {/* OTP Verification entry */}
            {otpMode === task._id ? (
              <div className="flex items-center gap-2 max-w-sm animate-in slide-in-from-left-2 mt-4 bg-black/40 border border-white/5 p-2 rounded-xl">
                 <Input 
                   placeholder="Enter 4-digit OTP" 
                   value={otpInput} 
                   onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').substring(0, 4))} 
                   className="font-mono tracking-widest text-center h-11 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                   maxLength={4} 
                 />
                 <Button onClick={() => verifyOTP(task._id)} className="h-11 bg-primary text-black hover:bg-primary/90 font-bold px-6">Confirm</Button>
                 <Button variant="ghost" onClick={() => setOtpMode(null)} className="h-11 text-muted-foreground hover:text-white">Cancel</Button>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap pt-2">
                <a href={`tel:${task.user?.phone || '9876543210'}`}>
                  <Button variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-white/5 text-xs px-4 h-9">
                    <Phone className="w-3.5 h-3.5 mr-2" /> Call Customer
                  </Button>
                </a>
                
                {/* Delivery parameters */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground ml-2">
                  <span>Distance: <b className="text-white">~{((task.cost || 50) / 10).toFixed(1)} km</b></span>
                  <span>Est. Time: <b className="text-white">{Math.round((((task.cost || 50) / 10) / 30) * 60)} mins</b></span>
                  <span>Fee: <b className="text-green-400">₹{(task.cost || 50).toFixed(2)}</b></span>
                </div>
              </div>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex md:flex-col justify-end gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
             {!isAssignedToMe ? (
                <Button onClick={() => acceptTask(task._id)} className="w-full md:w-auto bg-primary hover:bg-primary/95 text-black font-bold py-5 px-6 rounded-xl">
                  <Check className="w-4 h-4 mr-2" /> Accept Package
                </Button>
             ) : (
               otpMode !== task._id && (
                 <div className="flex gap-2.5 md:flex-col w-full">
                   <Button className="w-full text-sm bg-primary hover:bg-primary/95 text-black font-bold py-5 px-6 rounded-xl" onClick={() => { setOtpMode(task._id); setOtpInput(''); }}>
                     Verify & Deliver
                   </Button>
                   <Button variant="ghost" size="sm" onClick={() => rejectTask(task._id)} className="text-red-400 hover:bg-red-500/10 py-5 rounded-xl text-xs font-semibold">
                     Return to Pool
                   </Button>
                 </div>
               )
             )}
          </div>

        </div>
      </div>
    </Card>
  );
};

// Empty Tasks placeholder component
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

export default AgentDashboard;
