import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Truck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { RoleSelector } from '../components/auth/RoleSelector';
import api, { getErrorMessage } from '../services/api';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the terms & conditions.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        role,
        termsAccepted
      });
      const data = response.data;

      login(data.user, data.token, data.refreshToken);

      if (data.user.role === 'admin') navigate('/admin-dashboard');
      else if (data.user.role === 'agent') navigate('/agent-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-3xl -z-10"></div>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8 gap-2 items-center font-bold text-2xl tracking-tight">
          <span className="text-primary"><Truck className="w-8 h-8" /></span>
          GramConnect.
        </Link>

        <Card className="w-full shadow-2xl border-border/50 bg-card/60 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-8">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join the rural delivery revolution</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg border border-destructive/20 mb-4 animate-in fade-in">
                {error}
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="text" placeholder="Full Name" 
                  value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading}
                  className="h-12 bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Input 
                  type="email" placeholder="Email" 
                  value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
                  className="h-12 bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Input 
                  type="password" placeholder="Password" 
                  value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}
                  className="h-12 bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-2 pb-2">
                <RoleSelector value={role} onChange={setRole} disabled={isLoading} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={termsAccepted} 
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="rounded border-border/50 bg-background/50 text-primary focus:ring-0 cursor-pointer w-4 h-4"
                  required
                />
                <label htmlFor="terms" className="cursor-pointer select-none">I accept the terms & conditions</label>
              </div>
              <Button type="submit" className="w-full h-12 text-base rounded-lg shadow-lg hover:shadow-primary/25 transition-all animate-in" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    Signing Up...
                  </span>
                ) : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground pt-4 border-t border-border/50 mt-4">
            Already have an account? <Link to="/login" className="ml-1 text-primary hover:underline font-medium">Sign in</Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
