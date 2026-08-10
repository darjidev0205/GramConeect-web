import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Loader2, Mail, Phone, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, Navigation, Package, Home, Bike, Radio, RotateCcw } from 'lucide-react';
import { OTPInput } from './OTPInput';
import { Button } from '../ui/button';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RoleSelector } from './RoleSelector';
import api, { getErrorMessage } from '../../services/api';
import { GramConnectLogo } from '../branding/GramConnectLogo';

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
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
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
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: (direction) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" }
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

  // OTP Verification Sequence States
  const [authSequenceStep, setAuthSequenceStep] = useState(0); // 0: idle, 1: morphing dots, 2: light sweep, 3: checkmark badge, 4: success text
  const [otpError, setOtpError] = useState(false);

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
      setAuthSequenceStep(0);
      setOtpError(false);
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
    setAuthSequenceStep(0);
    setOtpError(false);
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

  const handleVerifyOTP = async (codeOverride) => {
    const target = getTarget();
    const verifyCode = codeOverride || otp;
    setError('');
    setSuccess('');
    setOtpError(false);

    if (!verifyCode || verifyCode.length !== 6) {
      setFieldErrors({ otp: 'Please enter the complete 6-digit code.' });
      setOtpError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/otp/verify', { target, otp: verifyCode, role });
      const data = response.data;

      // 1. Morph OTP digits to 6 security dots
      setAuthSequenceStep(1);

      // 2. Cyan light sweep
      setTimeout(() => {
        setAuthSequenceStep(2);
      }, 400);

      // 3. Convergence & checkmark badge
      setTimeout(() => {
        setAuthSequenceStep(3);
      }, 1100);

      // 4. Connection Verified text
      setTimeout(() => {
        setAuthSequenceStep(4);
      }, 1700);

      // 5. Final navigation / redirect transition
      setTimeout(() => {
        setLoading(false);
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
      }, 2500);

    } catch (err) {
      setLoading(false);
      setAuthSequenceStep(0);
      setOtpError(true);
      const errMsg = getErrorMessage(err, 'Invalid or expired verification code.');
      setError(errMsg);
      setFieldErrors({ otp: errMsg });
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
    step === steps.OTP ? (authSequenceStep >= 4 ? 100 : 75) :
    step === steps.REGISTER || step === steps.AGENT_DETAILS ? 90 : 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Full-Page Backdrop: Dedicated GramConnect Rural Environment (75-85% Visible) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#02070F] transition-opacity overflow-hidden"
        >
          {/* Realistic Indian Rural Village Visual */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.80] sm:opacity-[0.85] brightness-90 contrast-105 pointer-events-none transition-opacity duration-700"
            style={{ backgroundImage: `url('/auth-village-bg.png')` }}
          />

          {/* Dark Overlay Layer (rgba(2, 7, 15, 0.38) for Night / Blue-Hour Readability) */}
          <div className="absolute inset-0 bg-[#02070F]/38 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,9,20,0.45)_0%,rgba(2,7,15,0.65)_60%,rgba(1,4,10,0.82)_100%)] pointer-events-none" />
          
          {/* Soft Dark Blue Atmospheric Lighting behind card */}
          <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-[#2875F5]/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 w-[550px] h-[550px] bg-[#18C7E8]/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Subtle Digital Logistics Network Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
            <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
              <path d="M 100 220 C 380 140, 720 320, 1020 180" stroke="#18C7E8" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              <path d="M 180 620 C 480 480, 800 580, 1100 420" stroke="#2875F5" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              <circle cx="380" cy="140" r="3.5" fill="#18C7E8" />
              <circle cx="720" cy="320" r="4" fill="#18C7E8" />
              <circle cx="1020" cy="180" r="3.5" fill="#2875F5" />
            </svg>
          </div>
        </motion.div>
        
        {/* Floating Authentication Surface Panel: ELEGANT DARK GLASS CARD rgba(5, 10, 22, 0.78) */}
        <motion.div
          ref={modalRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            backgroundColor: 'rgba(5, 10, 22, 0.78)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.55)'
          }}
          className="relative w-full max-w-[480px] rounded-[28px] overflow-hidden flex flex-col min-h-[540px] text-[#F7F9FC] z-10 my-auto mx-auto"
        >
          
          {/* Header Bar: Solid Dark Surface rgba(4, 9, 20, 0.72) */}
          <div 
            style={{
              backgroundColor: 'rgba(4, 9, 20, 0.72)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            className="flex items-center justify-between px-6 sm:px-7 py-4 relative z-20"
          >
            {/* Left Circular Control: Back Button or Logo */}
            <div>
              {step !== steps.WELCOME && step !== steps.SUCCESS ? (
                <button 
                  onClick={() => {
                    if (step === steps.METHOD) goToStep(steps.WELCOME, -1);
                    else if (step === steps.INPUT) goToStep(steps.METHOD, -1);
                    else if (step === steps.OTP) goToStep(steps.INPUT, -1);
                    else if (step === steps.REGISTER) goToStep(steps.OTP, -1);
                    else if (step === steps.AGENT_DETAILS) goToStep(steps.REGISTER, -1);
                  }}
                  className="w-9 h-9 rounded-full bg-[#121B2D] border border-white/10 flex items-center justify-center text-[#9BA8BC] hover:text-white transition-all shrink-0 cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <GramConnectLogo variant="mark" size="sm" />
              )}
            </div>

            {/* Center Brand Identity */}
            <div className="flex flex-col items-center text-center">
              <span className="font-extrabold text-sm text-[#F7F9FC] tracking-tight font-display">
                GramConnect
              </span>
              <div className="text-[11px] text-[#18C7E8] font-mono font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18C7E8] animate-pulse" />
                Connecting Every Village
              </div>
            </div>

            {/* Right Circular Control: Close Button */}
            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-full bg-[#121B2D] border border-white/10 flex items-center justify-center text-[#9BA8BC] hover:text-white transition-all hover:rotate-90 duration-300 shrink-0 cursor-pointer" 
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Thin 4px Delivery Progress Line */}
          <div className="w-full bg-white/[0.06] h-1 relative overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#3268F5] to-[#18C7E8] shadow-sm shadow-[#18C7E8]/30" 
              initial={{ width: "15%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
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
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 rounded-2xl bg-[#121B2D] border border-white/10 p-3.5 flex items-center justify-center text-[#18C7E8] shadow-md mb-5"
                    >
                      <Navigation className="w-8 h-8" />
                    </motion.div>

                    <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-[#18C7E8] bg-[#18C7E8]/10 border border-[#18C7E8]/20 px-3 py-1 rounded-full mb-3">
                      Entering GramConnect Network
                    </span>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F7F9FC] tracking-tight font-display">
                      Welcome to GramConnect
                    </h2>
                    <p className="text-xs sm:text-sm text-[#9BA8BC] mt-2 max-w-sm leading-relaxed font-normal">
                      Delivering Opportunities & Modern Commerce to Every Village across India.
                    </p>

                    {/* Solid Dark Metric Cards rgba(15, 23, 40, 0.92) */}
                    <div className="mt-7 grid grid-cols-3 gap-3 w-full">
                      <div 
                        style={{ backgroundColor: 'rgba(15, 23, 40, 0.92)', border: '1px solid rgba(255, 255, 255, 0.09)' }}
                        className="p-3 rounded-2xl text-center"
                      >
                        <Package className="w-5 h-5 text-[#3268F5] mx-auto mb-1" />
                        <div className="text-[10px] font-bold text-white">1M+ Parcels</div>
                      </div>
                      <div 
                        style={{ backgroundColor: 'rgba(15, 23, 40, 0.92)', border: '1px solid rgba(255, 255, 255, 0.09)' }}
                        className="p-3 rounded-2xl text-center"
                      >
                        <Home className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                        <div className="text-[10px] font-bold text-white">500+ Hubs</div>
                      </div>
                      <div 
                        style={{ backgroundColor: 'rgba(15, 23, 40, 0.92)', border: '1px solid rgba(255, 255, 255, 0.09)' }}
                        className="p-3 rounded-2xl text-center"
                      >
                        <Bike className="w-5 h-5 text-[#18C7E8] mx-auto mb-1" />
                        <div className="text-[10px] font-bold text-white">2,500+ Agents</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-auto">
                    <button
                      onClick={() => goToStep(steps.METHOD, 1)}
                      className="w-full h-14 sm:h-15 rounded-2xl bg-gradient-to-r from-[#3268F5] via-[#2558E5] to-[#18C7E8] text-white font-extrabold text-base tracking-wide shadow-lg shadow-[#3268F5]/35 hover:shadow-xl hover:shadow-[#18C7E8]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                    >
                      <span>Enter Network</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                  <div className="w-full text-left">
                    <div className="text-left mb-6">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#F7F9FC] font-display tracking-tight text-left mb-1.5">
                        Choose verification method
                      </h2>
                      <p className="text-xs sm:text-sm text-[#9BA8BC] leading-relaxed text-left">
                        Authenticate securely to manage dispatches or request deliveries.
                      </p>
                    </div>

                    <div className="space-y-4 w-full">
                      {/* Card 1: Email */}
                      <button 
                        onClick={() => { setAuthMethod('email'); goToStep(steps.INPUT, 1); }}
                        style={{ backgroundColor: 'rgba(15, 23, 40, 0.92)', border: '1px solid rgba(255, 255, 255, 0.09)' }}
                        className="w-full p-5 min-h-[130px] rounded-2xl hover:border-[#18C7E8]/50 grid grid-cols-[44px_minmax(0,1fr)_56px] sm:grid-cols-[48px_minmax(0,1fr)_64px] gap-3 sm:gap-4 items-center group transition-all text-left cursor-pointer"
                      >
                        {/* COLUMN 1: ICON */}
                        <div className="w-11 h-11 rounded-xl bg-[#121B2D] border border-white/10 flex items-center justify-center text-[#18C7E8] group-hover:bg-[#18C7E8] group-hover:text-[#050A16] transition-colors shrink-0 my-auto">
                          <Mail className="w-5 h-5" />
                        </div>

                        {/* COLUMN 2: CONTENT */}
                        <div className="flex flex-col justify-center text-left my-auto">
                          <h3 className="text-base font-bold text-[#F7F9FC] leading-tight font-display tracking-tight text-left">
                            Continue with Email
                          </h3>
                          <p className="text-xs text-[#9BA8BC] leading-snug mt-1 text-left">
                            Receive a verification passcode via your inbox
                          </p>
                        </div>

                        {/* COLUMN 3: ACTION */}
                        <div className="flex flex-col items-end justify-between h-full py-0.5 my-auto shrink-0">
                          <span className="text-[10px] bg-[#18C7E8]/10 text-[#18C7E8] font-mono px-2 py-1 rounded font-bold uppercase tracking-wider text-center border border-[#18C7E8]/20">
                            OTP
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#9BA8BC] group-hover:text-[#18C7E8] group-hover:translate-x-1 transition-all mt-3" />
                        </div>
                      </button>

                      {/* Card 2: Mobile */}
                      <button 
                        onClick={() => { setAuthMethod('phone'); goToStep(steps.INPUT, 1); }}
                        style={{ backgroundColor: 'rgba(15, 23, 40, 0.92)', border: '1px solid rgba(255, 255, 255, 0.09)' }}
                        className="w-full p-5 min-h-[130px] rounded-2xl hover:border-[#18C7E8]/50 grid grid-cols-[44px_minmax(0,1fr)_56px] sm:grid-cols-[48px_minmax(0,1fr)_64px] gap-3 sm:gap-4 items-center group transition-all text-left cursor-pointer"
                      >
                        {/* COLUMN 1: ICON */}
                        <div className="w-11 h-11 rounded-xl bg-[#121B2D] border border-white/10 flex items-center justify-center text-[#3268F5] group-hover:bg-[#18C7E8] group-hover:text-[#050A16] transition-colors shrink-0 my-auto">
                          <Phone className="w-5 h-5" />
                        </div>

                        {/* COLUMN 2: CONTENT */}
                        <div className="flex flex-col justify-center text-left my-auto">
                          <h3 className="text-base font-bold text-[#F7F9FC] leading-tight font-display tracking-tight text-left">
                            Continue with Mobile
                          </h3>
                          <p className="text-xs text-[#9BA8BC] leading-snug mt-1 text-left">
                            Fast authentication using your 10-digit mobile number
                          </p>
                        </div>

                        {/* COLUMN 3: ACTION */}
                        <div className="flex flex-col items-end justify-between h-full py-0.5 my-auto shrink-0">
                          <span className="text-[10px] bg-[#3268F5]/10 text-[#3268F5] font-mono px-2 py-1 rounded font-bold uppercase tracking-wider text-center border border-[#3268F5]/20">
                            SMS
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#9BA8BC] group-hover:text-[#18C7E8] group-hover:translate-x-1 transition-all mt-3" />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-white/[0.08] flex items-start justify-center gap-2 text-center text-xs text-[#687285] font-medium leading-relaxed max-w-sm mx-auto">
                    <ShieldCheck className="w-4 h-4 text-[#18C7E8] shrink-0 mt-0.5" />
                    <span>Secure authentication • Your information is protected</span>
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
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#F7F9FC] font-display mb-1">
                        {authMethod === 'email' ? 'Enter your email' : 'Enter mobile number'}
                      </h2>
                      <p className="text-xs text-[#9BA8BC]">
                        We will dispatch a 6-digit confirmation code to verify your identity.
                      </p>
                    </div>

                    {authMethod === 'email' ? (
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-bold text-[#AAB5C6] block mb-1">EMAIL ADDRESS</label>
                        <input 
                          id="input-emailInput"
                          type="email" 
                          placeholder="name@domain.com"
                          value={emailInput}
                          onChange={e => {
                            setEmailInput(e.target.value);
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) setFieldError('emailInput', null);
                          }}
                          style={{
                            backgroundColor: 'rgba(18, 27, 45, 0.88)',
                            border: '1px solid rgba(255, 255, 255, 0.10)'
                          }}
                          className={`w-full rounded-2xl py-3.5 px-4 outline-none transition-all text-sm text-[#F7F9FC] ${fieldErrors.emailInput ? 'border-red-500 focus:border-red-500' : 'focus:border-[#18C7E8] focus:ring-2 focus:ring-[#18C7E8]/20'}`}
                          disabled={loading}
                        />
                        <div className="min-h-[18px]">
                          {fieldErrors.emailInput && (
                            <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.emailInput}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-bold text-[#AAB5C6] block mb-1">10-DIGIT MOBILE NUMBER</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-4 text-[#18C7E8] font-mono font-bold text-sm">+91</span>
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
                            style={{
                              backgroundColor: 'rgba(18, 27, 45, 0.88)',
                              border: '1px solid rgba(255, 255, 255, 0.10)'
                            }}
                            className={`w-full rounded-2xl py-3.5 pl-14 pr-4 outline-none transition-all text-sm font-mono font-bold text-[#F7F9FC] tracking-widest ${fieldErrors.phoneInput ? 'border-red-500 focus:border-red-500' : 'focus:border-[#18C7E8] focus:ring-2 focus:ring-[#18C7E8]/20'}`}
                            disabled={loading}
                          />
                        </div>
                        <div className="min-h-[18px]">
                          {fieldErrors.phoneInput && (
                            <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.phoneInput}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Solid Dark Role Selector Integration */}
                    <RoleSelector value={role} onChange={setRole} disabled={loading} targetEmail={emailInput} />
                  </div>

                  <div className="pt-4">
                    <button 
                      className="w-full h-14 sm:h-15 rounded-2xl bg-gradient-to-r from-[#3268F5] via-[#2558E5] to-[#18C7E8] text-white font-extrabold text-base tracking-wide shadow-lg shadow-[#3268F5]/35 hover:shadow-xl hover:shadow-[#18C7E8]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                      onClick={handleSendOTP}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (
                        <span className="flex items-center justify-center gap-2">
                          Request Verification Code
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: OTP VERIFICATION SCREEN */}
              {step === steps.OTP && (
                <motion.div 
                  key="otp" 
                  custom={direction} 
                  variants={contentVariants} 
                  initial="enter" 
                  animate="center" 
                  exit="exit" 
                  className="flex flex-col justify-between items-center h-full text-center my-auto py-2"
                >
                  <div className="w-full flex flex-col items-center my-auto">
                    {/* Passcode Verification Headline */}
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F7F9FC] font-display mb-2 tracking-tight transition-all duration-300">
                      {authSequenceStep >= 4 ? (
                        <span className="text-emerald-400 flex items-center justify-center gap-2">
                          <ShieldCheck className="w-8 h-8 text-emerald-400" /> Connection Verified
                        </span>
                      ) : (
                        "Verify Passcode"
                      )}
                    </h2>

                    {/* Dynamic Email / Phone Display Subheading */}
                    <p className="text-xs sm:text-sm text-[#929CAE] mb-6 transition-all duration-300 max-w-xs sm:max-w-sm leading-relaxed">
                      {authSequenceStep >= 4 ? (
                        <span className="text-emerald-300/90 font-medium">Secure connection established</span>
                      ) : (
                        <>Enter the 6-digit code dispatched to <br className="hidden sm:inline" /><span className="text-[#18C7E8] font-mono font-bold">{getTarget()}</span></>
                      )}
                    </p>

                    {/* 6-Digit OTP Field Container */}
                    <div className="my-auto py-2 flex flex-col items-center justify-center w-full">
                      <OTPInput 
                        length={6} 
                        value={otp} 
                        disabled={loading || authSequenceStep > 0}
                        isError={otpError}
                        authSequenceStep={authSequenceStep}
                        onChange={(val) => {
                          setOtp(val);
                          setOtpError(false);
                          if (val.length === 6) setFieldError('otp', null);
                        }}
                        onAutoSubmit={(code) => {
                          handleVerifyOTP(code);
                        }}
                      />
                      {fieldErrors.otp && authSequenceStep === 0 && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-xs mt-3 flex items-center justify-center gap-1.5 font-medium"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.otp}
                        </motion.p>
                      )}
                    </div>

                    {/* Resend Timer Cooldown */}
                    <div className="h-6 flex items-center justify-center text-xs text-[#929CAE] mt-4">
                      {authSequenceStep === 0 && (
                        timer > 0 ? (
                          <span>Resend code in <span className="text-[#18C7E8] font-mono font-bold">00:{timer < 10 ? `0${timer}` : timer}</span></span>
                        ) : (
                          <button className="text-[#18C7E8] font-bold hover:underline flex items-center gap-1 transition-all cursor-pointer" onClick={handleResendOTP} disabled={loading}>
                            <RotateCcw className="w-3.5 h-3.5" /> Resend Code
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Primary CTA Button: Default State vs Active Loading State */}
                  <div className="pt-6 w-full mt-auto">
                    <button 
                      className={`w-full h-14 sm:h-15 rounded-2xl text-white font-extrabold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ${
                        authSequenceStep >= 4 
                          ? "bg-gradient-to-r from-emerald-600 to-cyan-500 shadow-emerald-500/30 scale-[1.01]" 
                          : "bg-gradient-to-r from-[#3268F5] via-[#2558E5] to-[#18C7E8] shadow-[#3268F5]/35 hover:shadow-xl hover:shadow-[#18C7E8]/40 hover:scale-[1.01] active:scale-[0.99]"
                      }`}
                      onClick={() => handleVerifyOTP()}
                      disabled={otp.length !== 6 || loading || authSequenceStep > 0}
                    >
                      {authSequenceStep >= 4 ? (
                        <span className="flex items-center gap-2">Connected <CheckCircle2 className="w-5 h-5" /></span>
                      ) : (loading || authSequenceStep > 0) ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Verify & Continue
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </button>

                    {/* Security Footer */}
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#687285] font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#18C7E8] shrink-0" />
                      <span>Secure authentication • Your information is protected</span>
                    </div>
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
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#F7F9FC] font-display mb-1">
                      Complete Profile Registration
                    </h2>
                    <p className="text-xs text-[#929CAE] mb-4">
                      Create your GramConnect identity for local deliveries.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-[#929CAE] block mb-1">Full Name</label>
                        <input 
                          id="input-name"
                          type="text" placeholder="Suresh Kumar" value={name} onChange={e => {
                            setName(e.target.value);
                            if (e.target.value.trim()) setFieldError('name', null);
                          }}
                          className="w-full bg-white/[0.035] border border-white/10 focus:border-[#18C7E8] rounded-2xl px-4 py-3 text-xs text-[#F7F9FC] outline-none"
                          disabled={loading}
                        />
                        {fieldErrors.name && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.name}</p>}
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-[#929CAE] block mb-1">Email Address</label>
                        <input 
                          id="input-regEmail"
                          type="email" placeholder="suresh@gmail.com" value={regEmail} onChange={e => {
                            setRegEmail(e.target.value);
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) setFieldError('regEmail', null);
                          }}
                          className="w-full bg-white/[0.035] border border-white/10 focus:border-[#18C7E8] rounded-2xl px-4 py-3 text-xs text-[#F7F9FC] outline-none disabled:opacity-50"
                          disabled={authMethod === 'email' || loading}
                        />
                        {fieldErrors.regEmail && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.regEmail}</p>}
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-[#929CAE] block mb-1">Village / Landmark Address</label>
                        <input 
                          id="input-village"
                          type="text" placeholder="Rampur Sector B, Near Panchayat Well" value={village} onChange={e => {
                            setVillage(e.target.value);
                            if (e.target.value.trim()) setFieldError('village', null);
                          }}
                          className="w-full bg-white/[0.035] border border-white/10 focus:border-[#18C7E8] rounded-2xl px-4 py-3 text-xs text-[#F7F9FC] outline-none"
                          disabled={loading}
                        />
                        {fieldErrors.village && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.village}</p>}
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#929CAE]">
                          <input 
                            type="checkbox" 
                            checked={termsAccepted} 
                            onChange={e => {
                              setTermsAccepted(e.target.checked);
                              if (e.target.checked) setFieldError('terms', null);
                            }}
                            className="rounded border-white/20 bg-white/5 text-[#18C7E8] focus:ring-0"
                          />
                          Accept GramConnect Terms & Partner Policy
                        </label>
                        {fieldErrors.terms && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.terms}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      className="w-full h-14 sm:h-15 rounded-2xl bg-gradient-to-r from-[#3268F5] via-[#2558E5] to-[#18C7E8] text-white font-extrabold text-base tracking-wide shadow-lg shadow-[#3268F5]/35 hover:shadow-xl hover:shadow-[#18C7E8]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
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
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#F7F9FC] font-display mb-1">
                      Delivery Partner Log
                    </h2>
                    <p className="text-xs text-[#929CAE] mb-4">
                      Supply transportation metrics to start earning daily dispatches.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-[#929CAE] block mb-1">Vehicle Type</label>
                        <select 
                          className="w-full bg-[#0B1120] border border-white/10 rounded-2xl px-4 py-3 text-xs text-[#F7F9FC] outline-none focus:border-[#18C7E8]"
                          value={vehicleType} 
                          onChange={e => setVehicleType(e.target.value)}
                          disabled={loading}
                        >
                          <option value="bicycle">Bicycle / EV Cycle</option>
                          <option value="motorcycle">Motorcycle / Scooter</option>
                          <option value="auto">Auto Rickshaw / Cargo EV</option>
                          <option value="pickup">Pickup Mini Truck</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-[#929CAE] block mb-1">Vehicle Registration Number</label>
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
                          className="w-full bg-white/[0.035] border border-white/10 focus:border-[#18C7E8] rounded-2xl px-4 py-3 text-xs text-[#F7F9FC] outline-none font-mono font-bold uppercase"
                          disabled={loading}
                        />
                        {fieldErrors.vehicleNumber && <p className="text-red-400 text-[10px] mt-0.5">{fieldErrors.vehicleNumber}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      className="w-full h-14 sm:h-15 rounded-2xl bg-gradient-to-r from-[#3268F5] via-[#2558E5] to-[#18C7E8] text-white font-extrabold text-base tracking-wide shadow-lg shadow-[#3268F5]/35 hover:shadow-xl hover:shadow-[#18C7E8]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
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
                    <div className="w-full h-full bg-[#05070D] rounded-full flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                  </motion.div>

                  <h3 className="text-2xl font-extrabold text-[#F7F9FC] font-display">
                    Verified Successfully!
                  </h3>

                  <p className="text-xs text-[#929CAE] max-w-xs leading-relaxed">
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

