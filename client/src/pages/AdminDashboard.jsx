import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Truck, MapPin, Package, Settings, LogOut, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    { title: "Total Users", value: "2,841", icon: Users, increment: "+12% this month" },
    { title: "Active Agents", value: "142", icon: Truck, increment: "+4 new today" },
    { title: "Village Hubs", value: "8", icon: MapPin, increment: "All operational" },
    { title: "Today's Deliveries", value: "314", icon: Package, increment: "94% success rate" }
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card/50 flex flex-col hidden md:flex">
         <div className="h-16 flex items-center px-6 border-b font-bold tracking-tight text-lg">
           <span className="text-primary mr-2"><Settings className="w-5 h-5"/></span>
           Admin Panel
         </div>
         <nav className="flex-1 py-6 px-4 space-y-2">
            {['Dashboard', 'Hub Management', 'Agent Management', 'User Management', 'Analytics'].map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${i === 0 ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>
                 {item}
              </button>
            ))}
         </nav>
         <div className="p-4 border-t">
           <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
             <LogOut className="w-4 h-4 mr-2"/> Logout
           </Button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b flex items-center justify-between px-8 bg-background/95 backdrop-blur z-10 sticky top-0">
          <h1 className="text-xl font-semibold">Overview</h1>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium">System Status: <span className="text-green-500">Healthy</span></span>
          </div>
        </header>

        <div className="p-8 space-y-8 flex-1">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <Card key={i} className="shadow-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-primary"/>
                       </div>
                       <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2"><ArrowUpRight className="w-4 h-4 opacity-50"/></Button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold tracking-tight mb-2">{stat.value}</h3>
                      <p className="text-xs text-muted-foreground">{stat.increment}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
           </div>

           <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Live feed of system operations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                     {[
                       { msg: "Order GC82914 delivered successfully by Agent Ramesh.", time: "2 mins ago", type: 'success' },
                       { msg: "New Hub 'North District Panchayat' registered.", time: "1 hour ago", type: 'info' },
                       { msg: "Delivery delayed for GC10294 (Weather conditions).", time: "3 hours ago", type: 'warning' },
                       { msg: "Agent Suresh marked active in zone 4.", time: "5 hours ago", type: 'info' }
                     ].map((log, i) => (
                       <div key={i} className="flex gap-4 items-start p-3 rounded-lg border bg-accent/20">
                          <div className={`mt-0.5 w-2 h-2 rounded-full mt-1.5 ${log.type === 'success' ? 'bg-green-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                          <div>
                            <p className="text-sm font-medium">{log.msg}</p>
                            <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle>Hub Status map</CardTitle>
                  <CardDescription>Real-time node health</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="h-[300px] rounded-xl border bg-accent/20 overflow-hidden relative flex items-center justify-center">
                     <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=India&zoom=4&size=400x400&sensor=false')] bg-cover bg-center mix-blend-luminosity"></div>
                     <div className="relative z-10 flex flex-col items-center">
                       <MapPin className="w-8 h-8 text-primary"/>
                       <span className="text-xs font-semibold mt-2 px-2 py-1 bg-background rounded shadow">8 Nodes Online</span>
                     </div>
                   </div>
                </CardContent>
              </Card>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
