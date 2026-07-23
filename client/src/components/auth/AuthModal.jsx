import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Loader2, Mail, Phone, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, Navigation, Package, Home, Bike, Radio, RotateCcw } from 'lucide-react';
import { OTPInput } from './OTPInput';
import { Button } from '../ui/button';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RoleSelector } from './RoleSelector';
import api, { getErrorMessage } from '../../services/api';

const steps = {
  WELCOME: 'WELCOME',
  METHOD: 'METHOD',
  INPUT: 'INPUT',
  OTP: 'OTP',
  REGISTER: 'REGISTER',
  AGENT_DETAILS: 'AGENT_DETAILS',
  SUCCESS: 'SUCCESS'
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.94, y: 30, transition: { duration: 0.2 } }
};

const contentVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" }
  },
  exit: (direction) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" }
  })
};

export function AuthModal({ show, onClose, defaultRole = 'user' }) {
  const [step, setStep] = useState(steps.WELCOME);
  const [authMethod, setAuthMethod] = useState('email');
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Inputs
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otp, setOtp] = useState('');
  
  // Registration Inputs
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [village, setVillage] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Agent details Inputs
  const [vehicleType, setVehicleType] = useState('motorcycle');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // OTP Timer
  const [timer, setTimer] = useState(30);
  const [resendCount, setResendCount] = useState(0);

  // Authenticated user payload before success transition
  const [pendingAuthUser, setPendingAuthUser] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Initialize modal state
  useEffect(() => {
    if (show) {
      setStep(steps.WELCOME);
      setRole(defaultRole);
      setDirection(1);
      setError('');
      setSuccess('');
      setFieldErrors({});
      setEmailInput('');
      setPhoneInput('');
      setOtp('');
      setName('');
      setVillage('');
      setTermsAccepted(false);
      setResendCount(0);
      setPendingAuthUser(null);
    }
  }, [show, defaultRole]);

  // Timer cooldown
  useEffect(() => {
    let interval;
    if (step === steps.OTP && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (show) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show]);

  const goToStep = (newStep, dir = 1) => {
    setDirection(dir);
    setStep(newStep);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const getTarget = () => {
    return authMethod === 'email' ? emailInput.trim() : phoneInput.trim();
  };

  const setFieldError = (field, msg) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      if (msg) updated[field] = msg;
      else delete updated[field];
      return updated;
    });
  };

  const handleSendOTP = async () => {
    const target = getTarget();
    setError('');
    let errs = {};

    if (authMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!target) errs.emailInput = 'Email address is required.';
      else if (!emailRegex.test(target)) errs.emailInput = 'Please enter a valid email address.';
    } else {
      const digitsOnly = target.replace(/\D/g, '');
      if (!target) errs.phoneInput = 'Mobile phone number is required.';
      else if (digitsOnly.length !== 10) errs.phoneInput = 'Please enter a valid 10-digit mobile number.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/otp/send', { target, type: authMethod });
      const data = response.data;

      setTimer(30);
      let successMsg = 'Verification code sent successfully.';
      if (data.devOtp) successMsg += ` (Dev Mode OTP: ${data.devOtp})`;
      setSuccess(successMsg);
      goToStep(steps.OTP, 1);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send verification code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    if (resendCount >= 5) {
      setError('Maximum code request attempts reached. Please try later.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const target = getTarget();
      const response = await api.post('/api/otp/send', { target, type: authMethod });
      const data = response.data;

      setTimer(30);
      setResendCount(c => c + 1);
      let successMsg = 'A new verification code was sent.';
      if (data.devOtp) successMsg += ` (Dev Mode OTP: ${data.devOtp})`;
      setSuccess(successMsg);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not dispatch OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccessRedirect = (user, token, refreshToken) => {
    setPendingAuthUser({ user, token, refreshToken });
    goToStep(steps.SUCCESS, 1);
    
    setTimeout(() => {
      login(user, token, refreshToken);
      onClose();
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'agent') navigate('/agent-dashboard');
      else navigate('/dashboard');
    }, 2200);
  };

  const handleVerifyOTP = async () => {
    const target = getTarget();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setFieldErrors({ otp: 'Please enter the complete 6-digit code.' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/otp/verify', { target, otp, role });
      const data = response.data;

      if (data.exists) {
        triggerSuccessRedirect(data.user, data.token, data.refreshToken);
      } else {
        if (authMethod === 'email') {
          setRegEmail(target);
          setRegPhone('');
        } else {
          setRegPhone(target);
          setRegEmail('');
        }
        goToStep(steps.REGISTER, 1);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid or expired OTP code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    let errs = {};

    if (!name.trim()) errs.name = 'Full name is required.';
    if (!regEmail.trim()) errs.regEmail = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) errs.regEmail = 'Please enter a valid email address.';
    if (regPhone && regPhone.replace(/\D/g, '').length !== 10) errs.regPhone = 'Mobile number must be 10 digits.';
    if (!village.trim()) errs.village = 'Village / Landmark address is required.';
    if (!termsAccepted) errs.terms = 'You must accept terms & conditions.';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    if (role === 'agent') {
      goToStep(steps.AGENT_DETAILS, 1);
    } else {
      submitRegistration();
    }
  };

  const submitRegistration = async () => {
    setError('');

    if (role === 'agent' && !vehicleNumber.trim()) {
      setFieldErrors({ vehicleNumber: 'Vehicle registration number is required.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email: regEmail,
        phone: regPhone || undefined,
        role,
        location: {
          address: village,
          landmark: 'Village Center',
          lat: 20.5937,
          lng: 78.9629
        },
        termsAccepted
      };

      if (role === 'agent') {
        payload.vehicle = {
          type: vehicleType,
          number: vehicleNumber,
          licenseNumber
        };
      }

      const response = await api.post('/api/auth/register', payload);
      const data = response.data;

      triggerSuccessRedirect(data.user, data.token, data.refreshToken);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to complete registration.'));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  // Stepper Calculation
  const progressPercentage = 
    step === steps.WELCOME ? 15 :
    step === steps.METHOD ? 35 :
    step === steps.INPUT ? 55 :
    step === steps.OTP ? 75 :
    step === steps.REGISTER || step === steps.AGENT_DETAILS ? 90 : 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Immersive Dark Backdrop with Soft Blurred Map Mesh */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050816]/85 backdrop-blur-2xl"
        >
          {/* Subtle Canvas Background Pattern */}
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-cyan-400/15 rounded-full blur-[140px] pointer-events-none" />
        </motion.div>
        
        {/* Floating Authentication Sheet Panel */}
        <motion.div
          ref={modalRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg rounded-3xl sm:rounded-[36px] overflow-hidden glass-card border border-white/15 bg-[#080d26]/95 backdrop-blur-3xl shadow-2xl shadow-blue-950/90 flex flex-col min-h-[560px] text-white z-10 my-auto"
        >
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 relative z-20">
            <div className="flex items-center gap-3">
              {step !== steps.WELCOME && step !== steps.SUCCESS ? (
                <button 
                  onClick={() => {
                    if (step === steps.METHOD) goToStep(steps.WELCOME, -1);
                    else if (step === steps.INPUT) goToStep(steps.METHOD, -1);
                    else if (step === steps.OTP) goToStep(steps.INPUT, -1);
                    else if (step === steps.REGISTER) goToStep(steps.OTP, -1);
                    else if (step === steps.AGENT_DETAILS) goToStep(steps.REGISTER, -1);
                  }}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px]">
                  <div className="w-full h-full bg-[#050816] rounded-[11px] flex items-center justify-center font-bold text-xs text-cyan-400">
                    G
                  </div>
                </div>
              )}

              <div>
                <span className="font-bold text-sm text-white tracking-tight flex items-center gap-2 font-display">
                  GramConnect
                </span>
                <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Connecting Every Village
                </div>
              </div>
            </div>

            {/* Circular Close Icon Button */}
            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all hover:rotate-90 duration-300" 
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Animated Delivery Progress Line */}
          <div className="w-full bg-white/5 h-1.5 relative overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 shadow-sm shadow-cyan-400/50" 
              initial={{ width: "15%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* Work Area Content */}
          <div className="flex-1 relative overflow-hidden p-6 sm:p-8 flex flex-col">
            
            {/* Global Error Alerts */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && step !== steps.SUCCESS && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <AnimatePresence custom={direction} mode="wait">
              
              {/* STEP 0: WELCOME SCREEN */}
              {step === steps.WELCOME && (
                <motion.div 
                  key="welcome" 
                  custom={direction} 
                  variants={contentVariants} 
                  initial="enter" 
                  animate="center" 
                  exit="exit" 
                  className="flex flex-col justify-between h-full"
                >
                  <div className="text-center flex flex-col items-center pt-2">
                    <motion.div 
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/30 via-indigo-600/30 to-cyan-400/30 border border-white/15 p-4 flex items-center justify-center text-cyan-400 shadow-xl shadow-blue-600/20 mb-6"
                    >
                      <Navigation className="w-10 h-10" />
                    </motion.div>

                    <span className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full mb-3">
                      Entering GramConnect Network
                    </span>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                      Welcome to GramConnect
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
                      Delivering Opportunities & Modern Commerce to Every Village across India.
                    </p>

                    {/* Animated Visual Badges */}
                    <div className="mt-8 grid grid-cols-3 gap-3 w-full">
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                        <Package className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="text-[10px] font-bold text-white">1M+ Parcels</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                        <Home className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                        <div className="text-[10px] font-bold text-white">500+ Hubs</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                        <Bike className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-[10px] font-bold text-white">2,500+ Agents</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-auto">
                    <button
                      onClick={() => goToStep(steps.METHOD, 1)}
                      className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                    >
                      Enter Network
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: METHOD SELECTION */}
              {step === steps.METHOD && (
                <motion.div 
                  key="method" 
                  custom={direction} 
                  variants={contentVariants} 
                  initial="enter" 
                  animate="center" 
                  exit="exit" 
                  className="flex flex-col justify-between h-full space-y-6"
                >
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display mb-1.5">
                      Choose Verification Method
                    </h2>
                    <p className="text-xs text-slate-400 mb-6">
                      Authenticate securely to manage dispatches or request deliveries.
                    </p>

                    <div className="space-y-4">
                      {/* Card 1: Email */}
                      <motion.button 
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setAuthMethod('email'); goToStep(steps.INPUT, 1); }}
                        className="w-full p-5 rounded-2xl glass-card border border-white/10 hover:border-cyan-400/50 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-cyan-400 group-hover:text-[#050816] transition-colors">
                            <Mail className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              Continue with Email
                              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-full">Secure OTP</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">Receive verification passkey via inbox</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </motion.button>

                      {/* Card 2: Mobile */}
                      <motion.button 
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setAuthMethod('phone'); goToStep(steps.INPUT, 1); }}
                        className="w-full p-5 rounded-2xl glass-card border border-white/10 hover:border-cyan-400/50 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-cyan-400 group-hover:text-[#050816] transition-colors">
                            <Phone className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              Continue with Mobile
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded-full">SMS Fast</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">Fast authentication using 10-digit mobile</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 text-center">
                    <span className="text-[10px] text-slate-500 font-mono">Encrypted 256-bit GramConnect Authentication Protocol</span>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: INPUT TARGET */}
              {step === steps.INPUT && (
                <motion.div 
                  key="input" 
                  custom={direction} 
                  variants={contentVariants} 
                  initial="enter" 
                  animate="center" 
                  exit="exit" 
                  className="flex flex-col justify-between h-full space-y-6"
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display mb-1.5">
                        {authMethod === 'email' ? 'Enter Your Email' : 'Enter Mobile Number'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        We will dispatch a 6-digit confirmation code to verify your identity.
                      </p>
                    </div>

                    {authMethod === 'email' ? (
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1">Email Address</label>
                        <div className="relative">
                          <input 
                            id="input-emailInput"
                            type="email" 
                            placeholder="name@domain.com"
                            value={emailInput}
                            onChange={e => {
                              setEmailInput(e.target.value);
                              if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) setFieldError('emailInput', null);
                            }}
                            className={`w-full bg-white/[0.04] border rounded-2xl py-4 px-4 outline-none transition-all text-sm text-white ${fieldErrors.emailInput ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'}`}
                            disabled={loading}
                          />
                        </div>
                        {fieldErrors.emailInput && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.emailInput}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-bold text-slate-400 block mb-1">10-Digit Mobile Number</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-4 text-cyan-400 font-mono font-bold text-sm">+91</span>
                          <input 
                            id="input-phoneInput"
                            type="tel" 
                            placeholder="98765 43210"
                            value={phoneInput}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                              setPhoneInput(val);
                              if (val.length === 10) setFieldError('phoneInput', null);
                            }}
                            className={`w-full bg-white/[0.04] border rounded-2xl py-4 pl-14 pr-4 outline-none transition-all text-sm font-mono font-bold text-white tracking-widest ${fieldErrors.phoneInput ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'}`}
                            disabled={loading}
                          />
                        </div>
                        {fieldErrors.phoneInput && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.phoneInput}</p>
                        )}
                      </div>
                    )}

                    {/* Role Selector Integration */}
                    <RoleSelector value={role} onChange={setRole} disabled={loading} />
                  </div>

                  <div className="pt-4">
                    <button 
                      className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                      onClick={handleSendOTP}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Request Verification Code"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: OTP VERIFICATION */}
              {step === steps.OTP && (
                <motion.div 
                  key="otp" 
                  custom={direction} 
                  variants={contentVariants} 
                  initial="enter" 
                  animate="center" 
                  exit="exit" 
                  className="flex flex-col justify-between h-full space-y-6 text-center"
                >
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display mb-1.5">
                      Verify Passcode
                    </h2>
                    <p className="text-xs text-slate-400 mb-6">
                      Enter 6-digit code dispatched to <span className="text-cyan-400 font-mono font-bold">{getTarget()}</span>
                    </p>

                    <div className="mb-6 flex flex-col items-center">
                      <OTPInput length={6} value={otp} onChange={(val) => {
                        setOtp(val);
                        if (val.length === 6) setFieldError('otp', null);
                      }} />
                      {fieldErrors.otp && (
                        <p className="text-red-400 text-xs mt-3 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.otp}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      {timer > 0 ? (
                        <span>Resend code in <span className="text-cyan-400 font-mono font-bold">00:{timer < 10 ? `0${timer}` : timer}</span></span>
                      ) : (
                        <button className="text-cyan-400 font-bold hover:underline flex items-center gap-1" onClick={handleResendOTP} disabled={loading}>
                          <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Verify & Connect"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: REGISTER PROFILE */}
              {step === steps.REGISTER && (
                <motion.div 
                  key="register" 
                  custom={direction} 
                  variants={contentVariants} 
                  initial="enter" 
                  animate="center" 
                  exit="exit" 
                  className="flex flex-col justify-between h-full space-y-4 overflow-y-auto no-scrollbar"
                >
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display mb-1">
                      Complete Profile Registration
                    </h2>
                    <p className="text-xs text-slate-400 mb-4">
                      Create your GramConnect identity for local deliveries.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1">Full Name</label>
                        <input 
                          id="input-name"
                          type="text" placeholder="Suresh Kumar" value={name} onChange={e => {
                            setName(e.target.value);
                            if (e.target.value.trim()) setFieldError('name', null);
                          }}
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-2xl px-4 py-3 text-xs text-white outline-none"
                          disabled={loading}
                        />
                        {fieldErrors.name && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.name}</p>}
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1">Email Address</label>
                        <input 
                          id="input-regEmail"
                          type="email" placeholder="suresh@gmail.com" value={regEmail} onChange={e => {
                            setRegEmail(e.target.value);
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) setFieldError('regEmail', null);
                          }}
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-2xl px-4 py-3 text-xs text-white outline-none disabled:opacity-50"
                          disabled={authMethod === 'email' || loading}
                        />
                        {fieldErrors.regEmail && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.regEmail}</p>}
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1">Village / Landmark Address</label>
                        <input 
                          id="input-village"
                          type="text" placeholder="Rampur Sector B, Near Panchayat Well" value={village} onChange={e => {
                            setVillage(e.target.value);
                            if (e.target.value.trim()) setFieldError('village', null);
                          }}
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-2xl px-4 py-3 text-xs text-white outline-none"
                          disabled={loading}
                        />
                        {fieldErrors.village && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.village}</p>}
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                          <input 
                            type="checkbox" 
                            checked={termsAccepted} 
                            onChange={e => {
                              setTermsAccepted(e.target.checked);
                              if (e.target.checked) setFieldError('terms', null);
                            }}
                            className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-0"
                          />
                          Accept GramConnect Terms & Partner Policy
                        </label>
                        {fieldErrors.terms && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.terms}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                      onClick={handleRegister}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (role === 'agent' ? "Next: Vehicle Logs" : "Create Account")}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: AGENT DETAILS */}
              {step === steps.AGENT_DETAILS && (
                <motion.div 
                  key="agent" 
                  custom={direction} 
                  variants={contentVariants} 
                  initial="enter" 
                  animate="center" 
                  exit="exit" 
                  className="flex flex-col justify-between h-full space-y-4 overflow-y-auto no-scrollbar"
                >
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display mb-1">
                      Delivery Partner Log
                    </h2>
                    <p className="text-xs text-slate-400 mb-4">
                      Supply transportation metrics to start earning daily dispatches.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1">Vehicle Type</label>
                        <select 
                          className="w-full bg-[#050816] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                          value={vehicleType} 
                          onChange={e => setVehicleType(e.target.value)}
                          disabled={loading}
                        >
                          <option value="bicycle font-sans">Bicycle / EV Cycle</option>
                          <option value="motorcycle">Motorcycle / Scooter</option>
                          <option value="auto">Auto Rickshaw / Cargo EV</option>
                          <option value="pickup">Pickup Mini Truck</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1">Vehicle Registration Number</label>
                        <input 
                          id="input-vehicleNumber"
                          type="text" 
                          placeholder="e.g. MH-12-AB-9876" 
                          value={vehicleNumber} 
                          onChange={e => {
                            const val = e.target.value.toUpperCase();
                            setVehicleNumber(val);
                            if (val.trim()) setFieldError('vehicleNumber', null);
                          }}
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-cyan-400 rounded-2xl px-4 py-3 text-xs text-white outline-none font-mono font-bold uppercase"
                          disabled={loading}
                        />
                        {fieldErrors.vehicleNumber && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.vehicleNumber}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                      onClick={submitRegistration}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Complete Partner Registration"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: SUCCESS VERIFICATION */}
              {step === steps.SUCCESS && (
                <motion.div 
                  key="success" 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center text-center my-auto py-8 space-y-4"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[2px] shadow-2xl shadow-emerald-500/40"
                  >
                    <div className="w-full h-full bg-[#050816] rounded-full flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                  </motion.div>

                  <h3 className="text-2xl font-extrabold text-white font-display">
                    Verified Successfully!
                  </h3>

                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Package Handover Passkey Validated. Entering GramConnect Network Dashboard...
                  </p>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    Network Session Active
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
