import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Loader2, User, Truck } from 'lucide-react';
import { OTPInput } from './OTPInput';
import { Button } from '../ui/button';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const steps = {
  PHONE: 'PHONE',
  OTP: 'OTP',
  REGISTER: 'REGISTER',
  AGENT: 'AGENT'
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.5 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

const contentVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: (direction) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    transition: { duration: 0.3 }
  })
};

export function AuthModal({ show, onClose, defaultRole = 'user' }) {
  const [step, setStep] = useState(steps.PHONE);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [vehicle, setVehicle] = useState('bike');
  
  const [timer, setTimer] = useState(30);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      setStep(steps.PHONE);
      setRole(defaultRole);
      setDirection(1);
    }
  }, [show, defaultRole]);

  useEffect(() => {
    let interval;
    if (step === steps.OTP && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const goToStep = (newStep, dir = 1) => {
    setDirection(dir);
    setStep(newStep);
  };

  const handleSendOTP = () => {
    if (phone.length < 10) return;
    setLoading(true);
    // Simulate network
    setTimeout(() => {
      setLoading(false);
      setTimer(30);
      goToStep(steps.OTP, 1);
    }, 1500);
  };

  const handleVerifyOTP = () => {
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Let's assume new user for this flow demo to show all screens
      goToStep(steps.REGISTER, 1);
    }, 1500);
  };

  const handleRegisterNext = () => {
    if (!name || !village) return;
    if (role === 'agent') {
      goToStep(steps.AGENT, 1);
    } else {
      finalizeLogin({ role: 'user', name, village, phone });
    }
  };

  const handleAgentComplete = () => {
    finalizeLogin({ role: 'agent', name, village, phone, vehicle });
  };

  const finalizeLogin = (userData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Dummy token
      login(userData, 'dummy-jwt-token-12345');
      onClose();
      if (userData.role === 'agent') navigate('/agent-dashboard');
      else navigate('/dashboard');
    }, 1000);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-black/80 glass-dark border border-white/10 w-full max-w-md rounded-3xl overflow-hidden relative shadow-2xl flex flex-col min-h-[400px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 relative z-10">
            <button 
              onClick={() => step !== steps.PHONE ? goToStep(step === steps.AGENT ? steps.REGISTER : step === steps.REGISTER ? steps.OTP : steps.PHONE, -1) : null}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${step === steps.PHONE ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-lg font-bold tracking-tight">GramConnect</div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Stepper progress bar */}
          <div className="w-full bg-white/5 h-1">
             <motion.div 
               className="h-full bg-primary" 
               initial={{ width: "25%" }}
               animate={{ width: step === steps.PHONE ? "25%" : step === steps.OTP ? "50%" : step === steps.REGISTER ? "75%" : "100%" }}
             />
          </div>

          <div className="flex-1 relative overflow-hidden p-6">
            <AnimatePresence custom={direction} mode="wait">
              {step === steps.PHONE && (
                <motion.div key="phone" custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 p-6 flex flex-col">
                  <h2 className="text-2xl font-bold mb-2">Welcome</h2>
                  <p className="text-muted-foreground mb-8">Enter your phone number to continue.</p>
                  
                  <div className="relative mb-8">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">+91</span>
                    <input 
                      type="tel" 
                      placeholder="00000 00000"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-14 pr-4 outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,222,128,0.2)] transition-all text-xl tracking-wider"
                    />
                  </div>
                  
                  <Button 
                    className="w-full py-6 text-lg rounded-xl mt-auto shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] transition-all"
                    onClick={handleSendOTP}
                    disabled={phone.length !== 10 || loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                  </Button>
                </motion.div>
              )}

              {step === steps.OTP && (
                <motion.div key="otp" custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 p-6 flex flex-col">
                  <h2 className="text-2xl font-bold mb-2">Verify Phone</h2>
                  <p className="text-muted-foreground mb-8">Enter the 4-digit code sent to +91 {phone}</p>
                  
                  <div className="mb-8 flex justify-center">
                    <OTPInput length={4} value={otp} onChange={setOtp} />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground mb-8">
                    {timer > 0 ? (
                      <span>Resend code in <span className="text-primary font-bold">00:{timer < 10 ? `0${timer}` : timer}</span></span>
                    ) : (
                      <button className="text-primary font-bold hover:underline" onClick={() => setTimer(30)}>Resend OTP</button>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full py-6 text-lg rounded-xl mt-auto shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all"
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 4 || loading}
                  >
                     {loading ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
                  </Button>
                </motion.div>
              )}

              {step === steps.REGISTER && (
                <motion.div key="register" custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 p-6 flex flex-col overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-2">Create Account</h2>
                  <p className="text-muted-foreground mb-6">Looks like you are new here. Please fill in your details.</p>
                  
                  <div className="space-y-4 mb-6">
                    <input 
                      type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all"
                    />
                    <input 
                      type="text" placeholder="Village / Landmark" value={village} onChange={e => setVillage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <p className="text-sm font-semibold mb-3">How do you want to use GramConnect?</p>
                  <div className="flex gap-3 mb-8">
                    <div 
                      className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${role === 'user' ? 'border-primary bg-primary/10 shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 'border-white/10 hover:bg-white/5'}`}
                      onClick={() => setRole('user')}
                    >
                      <User className={`w-8 h-8 ${role === 'user' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">Villager</span>
                    </div>
                    <div 
                      className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${role === 'agent' ? 'border-accent bg-accent/10 shadow-[0_0_10px_rgba(0,229,255,0.2)]' : 'border-white/10 hover:bg-white/5'}`}
                      onClick={() => setRole('agent')}
                    >
                      <Truck className={`w-8 h-8 ${role === 'agent' ? 'text-accent' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">Delivery Agent</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full py-6 text-lg rounded-xl mt-auto"
                    onClick={handleRegisterNext}
                    disabled={!name || !village || loading}
                  >
                     {loading ? <Loader2 className="animate-spin" /> : "Continue"}
                     {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                </motion.div>
              )}

              {step === steps.AGENT && (
                <motion.div key="agent" custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 p-6 flex flex-col">
                  <h2 className="text-2xl font-bold mb-2">Agent Details</h2>
                  <p className="text-muted-foreground mb-8">Almost there! Tell us about your delivery capability.</p>
                  
                  <div className="space-y-6 mb-8">
                    <div>
                      <p className="text-sm mb-3 text-muted-foreground">Vehicle Type</p>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all appearance-none text-white font-medium"
                        value={vehicle} onChange={e => setVehicle(e.target.value)}
                      >
                         <option className="bg-background" value="bike">Bicycle</option>
                         <option className="bg-background" value="motorcycle">Motorcycle</option>
                         <option className="bg-background" value="auto">Auto Rickshaw</option>
                         <option className="bg-background" value="pickup">Pickup Truck</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div>
                        <p className="font-medium">Ready to deliver now?</p>
                        <p className="text-xs text-muted-foreground">You can toggle this later.</p>
                      </div>
                      <div className="w-12 h-6 bg-accent/20 rounded-full relative cursor-pointer border border-accent/50 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                        <div className="w-6 h-6 absolute right-0 -top-[1px] bg-accent rounded-full border-2 border-background shadow-md"></div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full py-6 text-lg rounded-xl mt-auto border-accent/50 text-accent hover:bg-accent/10 hover:text-accent shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all"
                    onClick={handleAgentComplete}
                    disabled={loading}
                  >
                     {loading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
