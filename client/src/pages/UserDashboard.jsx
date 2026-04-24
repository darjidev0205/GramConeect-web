import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Search, Package, Map as MapIcon, LogOut, CheckCircle2, Navigation, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_HUBS = [
  { id: 1, name: "Panchayat Hub", dist: "1.2 km" },
  { id: 2, name: "School Hub", dist: "2.5 km" },
  { id: 3, name: "Market Hub", dist: "3.8 km" }
];

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new');
  const [selectedHub, setSelectedHub] = useState(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  
  // Mock State
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleVoiceInput = () => {
    setIsVoiceRecording(true);
    setTimeout(() => {
      setIsVoiceRecording(false);
      // Mock action after voice input
    }, 2000);
  };

  const placeOrder = () => setOrderPlaced(true);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex gap-2 items-center font-bold text-lg">
            <span className="text-primary"><Package className="w-5 h-5"/></span>
            GramConnect
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground mr-2">Hi, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2"/> Logout</Button>
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-5xl">
        <div className="flex gap-4 mb-8 border-b pb-1">
          <button 
            className={`pb-2 font-medium transition-colors ${activeTab === 'new' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('new')}
          >
            New Delivery
          </button>
          <button 
            className={`pb-2 font-medium transition-colors ${activeTab === 'track' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('track')}
          >
            Track Order
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'new' && (
            <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {!orderPlaced ? (
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="shadow-lg border-border/50">
                  <CardHeader>
                    <CardTitle>Select Nearest Hub</CardTitle>
                    <CardDescription>We will deliver to this hub. Agents will bring it to your door.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Enter your village or landmark..." className="pl-9 h-10" />
                      <Button 
                        size="icon" variant="ghost" 
                        onMouseDown={handleVoiceInput}
                        className={`absolute right-1 top-1 h-8 w-8 transition-colors ${isVoiceRecording ? 'text-destructive animate-pulse bg-destructive/10' : 'text-muted-foreground'}`}
                      >
                         <Mic className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3 mt-4">
                      {MOCK_HUBS.map(hub => (
                        <div 
                          key={hub.id}
                          onClick={() => setSelectedHub(hub.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedHub === hub.id 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border/50 hover:border-border hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${selectedHub === hub.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                <MapPin className="w-4 h-4" />
                              </div>
                              <span className="font-medium">{hub.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-primary">{hub.dist}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full h-12 mt-4 text-base" disabled={!selectedHub} onClick={placeOrder}>
                      Confirm Delivery Location
                    </Button>
                  </CardContent>
                </Card>

                {/* Mock Map View */}
                <div className="rounded-2xl border bg-card relative overflow-hidden flex items-center justify-center min-h-[400px] shadow-lg border-border/50 group">
                   <div className="absolute inset-0 opacity-10 dark:opacity-5 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=20.5937,78.9629&zoom=5&size=600x400&sensor=false')] bg-cover bg-center"></div>
                   <div className="relative z-10 flex flex-col items-center gap-4 text-muted-foreground">
                     <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapIcon className="w-8 h-8 text-primary" />
                     </div>
                     <p>Interactive Map Simulation</p>
                   </div>
                </div>
              </div>
              ) : (
                <Card className="text-center py-16 shadow-lg border-primary/20 bg-primary/5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-6">
                    <CheckCircle2 className="w-16 h-16 text-primary" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                  <p className="text-muted-foreground mb-8">Your package will be delivered to Panchayat Hub. Tracking ID: GC82914</p>
                  <Button variant="outline" onClick={() => { setOrderPlaced(false); setActiveTab('track'); }}>Track Order</Button>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === 'track' && (
            <motion.div key="track" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Active Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 border rounded-xl p-6 relative overflow-hidden">
                       <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
                       <div className="flex justify-between mb-8 text-sm">
                         <span className="font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">ID: GC82914</span>
                         <span className="text-muted-foreground text-xs font-mono">OTP: 4812</span>
                       </div>
                       
                       <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                          
                          {/* Step 1 */}
                          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                             <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <Package className="w-4 h-4"/>
                             </div>
                             <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                                <div className="font-bold mb-1">Package Arrived at Hub</div>
                                <div className="text-sm text-muted-foreground">Panchayat Hub • 10:00 AM</div>
                             </div>
                          </div>

                          {/* Step 2 */}
                          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                             <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <Truck className="w-4 h-4"/>
                             </div>
                             <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm border-primary/20 bg-primary/5">
                                <div className="font-bold mb-1">Out for Delivery</div>
                                <div className="text-sm text-muted-foreground">Agent Ramesh is approaching your location.</div>
                             </div>
                          </div>

                       </div>
                    </div>
                    
                    <div className="flex-1 rounded-2xl border bg-card relative overflow-hidden flex items-center justify-center min-h-[300px]">
                      <div className="absolute inset-0 bg-accent/20 flex flex-col items-center justify-center gap-4">
                        <Navigation className="w-8 h-8 text-primary animate-bounce shadow-lg rounded-full bg-background p-1" />
                        <span className="bg-background px-4 py-2 rounded-full border shadow-sm text-sm font-medium">Agent is 500m away</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserDashboard;
