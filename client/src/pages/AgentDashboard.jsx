import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Package, Check, X, Phone, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_TASKS = [
  { id: 'GC82914', customer: 'Ramesh Singh', phone: '+91 9876543210', dist: '500m', hub: 'Panchayat Hub', status: 'assigned' },
  { id: 'GC44102', customer: 'Suresh Kumar', phone: '+91 9123456789', dist: '2.1km', hub: 'Market Hub', status: 'pending' }
];

const AgentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [otpMode, setOtpMode] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const acceptTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'assigned' } : t));
  };

  const handleDeliver = (taskId) => {
    setOtpMode(taskId);
  };

  const verifyOTP = (taskId) => {
    // Mock OTP verify
    setTasks(tasks.filter(t => t.id !== taskId));
    setOtpMode(null);
    setOtpInput('');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex gap-2 items-center font-bold text-lg">
            <span className="text-secondary"><Navigation className="w-5 h-5"/></span>
            Agent Portal
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </nav>

      <div className="container py-8 max-w-4xl">
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
           <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name}</h1>
           <p className="opacity-90">You have {tasks.length} active tasks today. Drive safe!</p>
           
           <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-background/20 backdrop-blur rounded-xl p-4">
                <div className="text-sm opacity-80 mb-1">Today's Earnings</div>
                <div className="text-2xl font-bold">₹450</div>
              </div>
              <div className="bg-background/20 backdrop-blur rounded-xl p-4">
                <div className="text-sm opacity-80 mb-1">Deliveries</div>
                <div className="text-2xl font-bold">12</div>
              </div>
              <div className="bg-background/20 backdrop-blur rounded-xl p-4">
                <div className="text-sm opacity-80 mb-1">Rating</div>
                <div className="text-2xl font-bold">4.8 ⭐️</div>
              </div>
           </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Assigned Deliveries</h2>
        <div className="space-y-4">
          {tasks.map(task => (
            <Card key={task.id} className="border-border/50 shadow-sm overflow-hidden group">
              <div className="flex flex-col sm:flex-row">
                 <div className="bg-secondary/10 p-6 flex items-center justify-center sm:w-32 sm:border-r border-border/50">
                    <Package className="w-10 h-10 text-secondary" />
                 </div>
                 <div className="p-6 flex-1 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{task.customer}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent/50 border">{task.id}</span>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm mb-3">
                        <MapPin className="w-4 h-4"/> {task.dist} • Deliver from {task.hub}
                      </div>

                      {otpMode === task.id ? (
                        <div className="flex items-center gap-2 max-w-xs animate-in slide-in-from-left-2">
                           <Input placeholder="Enter 4-digit OTP" value={otpInput} onChange={e => setOtpInput(e.target.value)} className="font-mono tracking-widest text-center" maxLength={4} />
                           <Button onClick={() => verifyOTP(task.id)}>Verify</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm"><Phone className="w-4 h-4 mr-2"/> Call</Button>
                          <Button variant="outline" size="sm"><Navigation className="w-4 h-4 mr-2"/> Navigate</Button>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                       {task.status === 'pending' ? (
                          <>
                           <Button onClick={() => acceptTask(task.id)} className="w-full sm:w-auto"><Check className="w-4 h-4 mr-2"/> Accept</Button>
                           <Button variant="destructive" className="w-full sm:w-auto"><X className="w-4 h-4 mr-2"/> Reject</Button>
                          </>
                       ) : otpMode !== task.id && (
                          <Button className="w-full sm:w-auto h-full text-base bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => handleDeliver(task.id)}>
                            Mark Delivered
                          </Button>
                       )}
                    </div>
                 </div>
              </div>
            </Card>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
              No active tasks right now. Great job!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
