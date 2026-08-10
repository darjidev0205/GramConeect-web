import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { RoleSelector } from '../components/auth/RoleSelector';
import { GramConnectLogo } from '../components/branding/GramConnectLogo';
import api, { getErrorMessage } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!email || !password || !role) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password, role });
      const data = response.data;
      
      login(data.user, data.token, data.refreshToken);

      if (data.user.role === 'admin') navigate('/admin-dashboard');
      else if (data.user.role === 'agent') navigate('/agent-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-cyan-400/15 rounded-full blur-[140px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.35, ease: "easeOut" }} 
        className="w-full max-w-[500px]"
      >
        <Link to="/" className="flex flex-col items-center justify-center mb-8 group">
          <GramConnectLogo variant="full" size="lg" />
          <span className="text-xs text-cyan-400 font-mono font-medium flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Connecting Every Village
          </span>
        </Link>

        <Card className="w-full shadow-2xl border border-white/10 bg-[#0d1428]/95 backdrop-blur-2xl text-white rounded-3xl p-2 sm:p-4">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-extrabold tracking-tight font-display text-white">Welcome back</CardTitle>
            <CardDescription className="text-xs text-slate-400">Enter your credentials to access your GramConnect account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-500/10 text-red-300 text-xs p-3.5 rounded-2xl border border-red-500/30 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase font-bold text-slate-300 block mb-1">EMAIL ADDRESS</label>
                <Input 
                  type="email" placeholder="name@domain.com" 
                  value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
                  className="h-12 bg-white/[0.04] border-white/10 text-white rounded-2xl focus:border-cyan-400 focus:ring-cyan-400/20 text-sm px-4"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase font-bold text-slate-300 block mb-1">PASSWORD</label>
                <Input 
                  type="password" placeholder="••••••••" 
                  value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}
                  className="h-12 bg-white/[0.04] border-white/10 text-white rounded-2xl focus:border-cyan-400 focus:ring-cyan-400/20 text-sm px-4"
                />
              </div>

              <div className="space-y-2 pt-1">
                <RoleSelector value={role} onChange={setRole} disabled={isLoading} targetEmail={email} />
              </div>

              <Button type="submit" className="w-full h-12 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all mt-2" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Signing In...
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4 text-xs text-slate-400 pt-4 border-t border-white/10 mt-4">
            <div>
              Don't have an account? <Link to="/register" className="ml-1 text-cyan-400 hover:underline font-bold">Sign up</Link>
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Secure authentication • Your information is protected
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;

