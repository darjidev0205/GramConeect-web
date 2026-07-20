import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { AuthContext } from '../../context/AuthContext';
import { AvatarUpload } from './AvatarUpload';
import API_BASE_URL from '../../config/api';
import { 
  User, Truck, Shield, ShieldCheck, Mail, Phone, MapPin, Key, 
  Trash2, Bell, Globe, Moon, RefreshCw, AlertCircle, PlayCircle 
} from 'lucide-react';

export const RoleSettings = () => {
  const { user, setUser, logout } = useContext(AuthContext);

  // General profile states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.profileImage || '');
  const [address, setAddress] = useState(user?.location?.address || '');
  const [village, setVillage] = useState(user?.location?.landmark || '');
  const [password, setPassword] = useState('');

  // Preference states
  const [emergencyContact, setEmergencyContact] = useState(user?.settings?.emergencyContact || '');
  const [language, setLanguage] = useState(user?.settings?.language || 'en');
  const [theme, setTheme] = useState(user?.settings?.theme || 'dark');
  const [pushNotif, setPushNotif] = useState(user?.settings?.notificationPreferences?.push !== false);
  const [emailNotif, setEmailNotif] = useState(user?.settings?.notificationPreferences?.email !== false);

  // Agent vehicle state
  const [vehicleType, setVehicleType] = useState(user?.vehicle?.type || 'motorcycle');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicle?.number || '');
  const [licenseNumber, setLicenseNumber] = useState(user?.vehicle?.licenseNumber || '');
  const [availability, setAvailability] = useState(user?.availability !== false);

  // Admin-only state
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Status flags
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchAuditLogs();
    }
  }, [user]);

  // Sync state if user changes from another tab profile sync
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatar(user.profileImage || '');
      setAddress(user.location?.address || '');
      setVillage(user.location?.landmark || '');
      setEmergencyContact(user.settings?.emergencyContact || '');
      setLanguage(user.settings?.language || 'en');
      setTheme(user.settings?.theme || 'dark');
      setPushNotif(user.settings?.notificationPreferences?.push !== false);
      setEmailNotif(user.settings?.notificationPreferences?.email !== false);
      if (user.role === 'agent') {
        setVehicleType(user.vehicle?.type || 'motorcycle');
        setVehicleNumber(user.vehicle?.number || '');
        setLicenseNumber(user.vehicle?.licenseNumber || '');
        setAvailability(user.availability !== false);
      }
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/audit-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          avatar,
          address,
          village,
          password: password || undefined,
          emergencyContact,
          language,
          theme,
          notificationPreferences: {
            push: pushNotif,
            email: emailNotif
          },
          vehicle: user?.role === 'agent' ? {
            type: vehicleType,
            number: vehicleNumber,
            licenseNumber
          } : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');

      // Update AuthContext session state
      setUser(data);
      setSuccessMsg('Profile and preferences updated successfully.');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailability = async (checked) => {
    setAvailability(checked);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/auth/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ availability: checked })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        logout();
      } else {
        const data = await response.json();
        setErrorMsg(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setErrorMsg('Error deleting account');
    }
  };

  const handleAdminDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsersList(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderVillagerSettings = () => (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-white/5 pb-6">
        <AvatarUpload 
          currentImage={avatar} 
          onUploadSuccess={(url) => setAvatar(url)} 
          onRemoveSuccess={() => setAvatar('')} 
        />
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} required className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Village Name / Landmark</label>
            <Input value={village} onChange={e => setVillage(e.target.value)} placeholder="e.g. Near Panchayat Circle" className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Village Complete Address</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Preferences</h3>
          <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">Push Notifications</p>
                <p className="text-[10px] text-muted-foreground">Logistics updates, active tracking alerts</p>
              </div>
              <input type="checkbox" checked={pushNotif} onChange={e => setPushNotif(e.target.checked)} className="rounded bg-neutral-950 w-4 h-4 text-primary border-white/10" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <p className="text-xs font-bold">Email Notifications</p>
                <p className="text-[10px] text-muted-foreground">Receives OTP codes and delivery reports</p>
              </div>
              <input type="checkbox" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} className="rounded bg-neutral-950 w-4 h-4 text-primary border-white/10" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Language & Theme</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xxs font-semibold text-muted-foreground">Interface Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white">
                <option value="en">English (US)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xxs font-semibold text-muted-foreground">Workspace Theme</label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white">
                <option value="dark">Charcoal Dark (SaaS)</option>
                <option value="light">Vanilla Light</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Security & Credentials</h3>
        <div className="space-y-2 max-w-sm">
          <label className="text-xs font-semibold text-muted-foreground">Change Password (leave blank to keep current)</label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-neutral-950 border-white/5 h-11 text-xs" />
        </div>
      </div>

      <div className="border-t border-white/5 pt-6 flex justify-between items-center flex-wrap gap-4">
        <Button type="submit" disabled={isSaving} className="bg-primary text-black font-bold h-11 px-8 rounded-xl cursor-pointer">
          {isSaving ? 'Saving Changes...' : 'Save Settings'}
        </Button>

        <Button type="button" onClick={handleDeleteAccount} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold border border-red-500/20 h-11 px-6 rounded-xl text-xs transition-all cursor-pointer">
          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
        </Button>
      </div>
    </form>
  );

  const renderAgentSettings = () => (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <div className="flex items-center justify-between bg-white/2 border border-white/5 p-4 rounded-2xl mb-4">
        <div>
          <p className="text-sm font-bold text-white">Duty Availability Status</p>
          <p className="text-xxs text-muted-foreground">Toggle off to stop receiving active logistics notifications</p>
        </div>
        <input 
          type="checkbox" 
          checked={availability}
          onChange={e => handleToggleAvailability(e.target.checked)}
          className="rounded border-white/20 bg-neutral-950 text-primary w-5 h-5 cursor-pointer"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-white/5 pb-6">
        <AvatarUpload 
          currentImage={avatar} 
          onUploadSuccess={(url) => setAvatar(url)} 
          onRemoveSuccess={() => setAvatar('')} 
        />
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} required className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Operating Zone / Hub</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Vehicle Registration Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Vehicle Type</label>
            <select 
              value={vehicleType} 
              onChange={e => setVehicleType(e.target.value)}
              className="w-full bg-neutral-950 border border-white/5 rounded-xl px-3 py-3 text-xs outline-none text-white cursor-pointer"
            >
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="auto">Auto Rikshaw</option>
              <option value="pickup">Pickup Truck</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Vehicle Number Plate</label>
            <Input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} placeholder="e.g. GJ-01-XX-9999" className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Driving License Number</label>
            <Input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="e.g. DL-XXXXXXXXXXXX" className="bg-neutral-950 border-white/5 h-11 text-xs" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Emergency Contact Name & Phone</label>
          <Input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="e.g. Ramesh Patel (+91 99000 00000)" className="bg-neutral-950 border-white/5 h-11 text-xs" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Interface Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-xs text-white">
            <option value="en">English (US)</option>
            <option value="gu">ગુજરાતી (Gujarati)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      <div className="border-t border-white/5 pt-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Security & Credentials</h3>
        <div className="space-y-2 max-w-sm">
          <label className="text-xs font-semibold text-muted-foreground">Change Password (leave blank to keep current)</label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-neutral-950 border-white/5 h-11 text-xs" />
        </div>
      </div>

      <div className="border-t border-white/5 pt-6 text-left">
        <Button type="submit" disabled={isSaving} className="bg-primary text-black font-bold h-11 px-8 rounded-xl cursor-pointer">
          {isSaving ? 'Saving Changes...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );

  const renderAdminSettings = () => (
    <div className="space-y-8">
      {/* 1. Profile parameters updates */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[10px] tracking-widest">Admin Profile settings</h3>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-white/5 pb-6">
          <AvatarUpload 
            currentImage={avatar} 
            onUploadSuccess={(url) => setAvatar(url)} 
            onRemoveSuccess={() => setAvatar('')} 
          />
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} required className="bg-neutral-950 border-white/5 h-11 text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-neutral-950 border-white/5 h-11 text-xs" />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button type="submit" disabled={isSaving} className="bg-primary text-black font-bold h-11 px-8 rounded-xl cursor-pointer">
            {isSaving ? 'Saving Profile...' : 'Save Admin Profile'}
          </Button>
        </div>
      </form>

      {/* 2. User Accounts Management List */}
      <div className="border-t border-white/5 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Registered User Accounts ({usersList.length})</h3>
          <button onClick={fetchUsers} className="text-xxs font-bold text-primary hover:underline flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Refresh</button>
        </div>
        {loadingUsers ? (
          <div className="text-xs text-muted-foreground flex gap-2"><RefreshCw className="w-4 h-4 animate-spin text-primary" /> Syncing list...</div>
        ) : (
          <div className="max-h-[220px] overflow-y-auto border border-white/5 rounded-2xl divide-y divide-white/5">
            {usersList.map(u => (
              <div key={u._id} className="p-3 flex items-center justify-between hover:bg-white/2 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    {u.profileImage && (
                      <img src={u.profileImage} alt="" className="w-5 h-5 rounded-full object-cover inline-block mr-1.5" />
                    )}
                    {u.name} 
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground capitalize">{u.role}</span>
                  </p>
                  <p className="text-xxs text-muted-foreground">{u.email} | {u.phone || 'No phone'}</p>
                </div>
                {u._id !== user._id && u._id !== user.id && u._id !== user.userId && (
                  <button onClick={() => handleAdminDeleteUser(u._id)} className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. System Audit logs */}
      <div className="border-t border-white/5 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Security Audit Logs ({auditLogs.length})</h3>
          <button onClick={fetchAuditLogs} className="text-xxs font-bold text-primary hover:underline flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Sync Logs</button>
        </div>
        {loadingLogs ? (
          <div className="text-xs text-muted-foreground flex gap-2"><RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading security log database...</div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto border border-white/5 rounded-2xl text-[11px] divide-y divide-white/5">
            {auditLogs.map(l => (
              <div key={l._id} className="p-3 flex justify-between gap-4 font-mono text-[10px]">
                <div className="space-y-1 flex-1">
                  <p className="text-white"><span className="text-primary font-bold">{l.action.toUpperCase()}</span> - {l.details}</p>
                  <p className="text-neutral-500">By: {l.actor?.name || 'Unknown'} ({l.actor?.email})</p>
                </div>
                <div className="text-right text-neutral-500 space-y-1">
                  <p>{new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString()}</p>
                  <p>{l.ipAddress || 'No IP recorded'}</p>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">No security logs compiled.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">System Settings & Profile</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your configuration values, contact details, vehicle properties, and preferences.</p>
      </div>

      <Card className="border border-white/5 bg-neutral-900 p-6 rounded-3xl">
        <CardContent className="p-0">
          {successMsg && (
            <div className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2 animate-in fade-in">
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4.5 h-4.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {user?.role === 'user' && renderVillagerSettings()}
          {user?.role === 'agent' && renderAgentSettings()}
          {user?.role === 'admin' && renderAdminSettings()}
        </CardContent>
      </Card>
    </div>
  );
};
