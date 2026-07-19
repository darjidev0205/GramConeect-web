import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Loader2, User, Truck, Check, Mail, Phone, AlertCircle } from 'lucide-react';
import { OTPInput } from './OTPInput';
import { Button } from '../ui/button';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RoleSelector } from './RoleSelector';

const steps = {
  METHOD: 'METHOD',
  INPUT: 'INPUT',
  OTP: 'OTP',
  REGISTER: 'REGISTER',
  AGENT_DETAILS: 'AGENT_DETAILS'
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.5 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

const contentVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: (direction) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    transition: { duration: 0.3 }
  })
};

export function AuthModal({ show, onClose, defaultRole = 'user' }) {
  const [step, setStep] = useState(steps.METHOD);
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // General alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Inputs state
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

  // OTP triggers
  const [timer, setTimer] = useState(30);
  const [resendCount, setResendCount] = useState(0);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Initialize values when opening
  useEffect(() => {
    if (show) {
      setStep(steps.METHOD);
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

  // Tab Accessibility & Escape Key close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (show) {
      window.addEventListener('keydown', handleKeyDown);
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, input, select');
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, step]);

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

  // Helper to update field errors on-the-fly
  const setFieldError = (field, msg) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      if (msg) {
        updated[field] = msg;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  // Scroll and focus on first invalid input
  const focusFirstError = (errorsObj) => {
    const errorKeys = Object.keys(errorsObj).filter(k => errorsObj[k]);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const element = document.getElementById(`input-${firstKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const handleSendOTP = async () => {
    const target = getTarget();
    setError('');
    let errs = {};

    // Validate inputs
    if (authMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!target) {
        errs.emailInput = 'Email address is required.';
      } else if (!emailRegex.test(target)) {
        errs.emailInput = 'Please enter a valid email address.';
      }
    } else {
      const digitsOnly = target.replace(/\D/g, '');
      if (!target) {
        errs.phoneInput = 'Mobile phone number is required.';
      } else if (digitsOnly.length !== 10) {
        errs.phoneInput = 'Please enter a valid 10-digit mobile number.';
      }
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setTimeout(() => focusFirstError(errs), 50);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type: authMethod })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setTimer(30);
      let successMsg = 'Verification code sent successfully.';
      if (data.devOtp) {
        successMsg += ` (Dev Mode OTP: ${data.devOtp})`;
      }
      setSuccess(successMsg);
      goToStep(steps.OTP, 1);
    } catch (err) {
      setError(err.message || 'Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    if (resendCount >= 5) {
      setError('Maximum code request attempts reached. Please request a new one later.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const target = getTarget();
      const response = await fetch('http://localhost:5000/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type: authMethod })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code.');
      }

      setTimer(30);
      setResendCount(c => c + 1);
      let successMsg = 'A new verification code was sent.';
      if (data.devOtp) {
        successMsg += ` (Dev Mode OTP: ${data.devOtp})`;
      }
      setSuccess(successMsg);
    } catch (err) {
      setError(err.message || 'Could not dispatch OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const target = getTarget();
    setError('');
    setSuccess('');
    let errs = {};

    if (otp.length !== 6) {
      errs.otp = 'Please enter the complete 6-digit code.';
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, otp, role })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed.');
      }

      if (data.exists) {
        login(data.user, data.token, data.refreshToken);
        onClose();
        if (data.user.role === 'admin') navigate('/admin-dashboard');
        else if (data.user.role === 'agent') navigate('/agent-dashboard');
        else navigate('/dashboard');
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
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    let errs = {};

    if (!name.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!regEmail.trim()) {
      errs.regEmail = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      errs.regEmail = 'Please enter a valid email address.';
    }
    if (regPhone && regPhone.replace(/\D/g, '').length !== 10) {
      errs.regPhone = 'Mobile number must be exactly 10 digits.';
    }
    if (!village.trim()) {
      errs.village = 'Village / Landmark address is required.';
    }
    if (!termsAccepted) {
      errs.terms = 'You must accept the terms & conditions.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setTimeout(() => focusFirstError(errs), 50);
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
    let errs = {};

    if (role === 'agent') {
      if (!vehicleNumber.trim()) {
        errs.vehicleNumber = 'Vehicle registration number is required.';
      }
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setTimeout(() => focusFirstError(errs), 50);
        return;
      }
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
          landmark: 'Village Entrance',
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

      console.log('Registration Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      login(data.user, data.token, data.refreshToken);
      onClose();
      if (data.user.role === 'agent') navigate('/agent-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        
        {/* Dark Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />
        
        {/* Modal Sheet */}
        <motion.div
          ref={modalRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden relative shadow-2xl flex flex-col min-h-[500px] max-h-[90vh] text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 relative z-10">
            <button 
              onClick={() => {
                if (step === steps.INPUT) goToStep(steps.METHOD, -1);
                else if (step === steps.OTP) goToStep(steps.INPUT, -1);
                else if (step === steps.REGISTER) goToStep(steps.OTP, -1);
                else if (step === steps.AGENT_DETAILS) goToStep(steps.REGISTER, -1);
              }}
              className={`p-2 rounded-full hover:bg-white/5 transition-colors ${step === steps.METHOD ? 'invisible' : ''}`}
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-sm font-bold tracking-widest uppercase text-muted-foreground">GramConnect Verification</div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors" aria-label="Close">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Stepper Progress bar */}
          <div className="w-full bg-white/5 h-1">
             <motion.div 
               className="h-full bg-primary" 
               initial={{ width: "20%" }}
               animate={{ 
                 width: step === steps.METHOD ? "20%" : 
                        step === steps.INPUT ? "40%" : 
                        step === steps.OTP ? "60%" : 
                        step === steps.REGISTER ? "80%" : "100%" 
               }}
             />
          </div>

          {/* Work Area Content */}
          <div className="flex-1 relative overflow-hidden p-6">
            
            {/* Global Errors / Success Alerts */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-primary/10 border border-primary/20 text-primary text-xs p-4 rounded-xl mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <Check className="w-4.5 h-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <AnimatePresence custom={direction} mode="wait">
              
              {/* Step 1: Select Authentication Method */}
              {step === steps.METHOD && (
                <motion.div key="method" custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-black mb-1.5">Sign In or Register</h2>
                    <p className="text-xs text-muted-foreground mb-8">Access your GramConnect dashboard securely.</p>

                    <div className="space-y-4">
                      <button 
                        onClick={() => { setAuthMethod('email'); goToStep(steps.INPUT, 1); }}
                        className="w-full p-4 rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-white/2 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Mail className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-sm text-left">Continue with Email Address</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </button>

                      <button 
                        onClick={() => { setAuthMethod('phone'); goToStep(steps.INPUT, 1); }}
                        className="w-full p-4 rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-white/2 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Phone className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-sm text-left">Continue with Mobile Number</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Input target */}
              {step === steps.INPUT && (
                <motion.div key="input" custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-black mb-1.5">
                      {authMethod === 'email' ? 'Enter Email' : 'Enter Phone'}
                    </h2>
                    <p className="text-xs text-muted-foreground mb-8">
                      We will transmit a 6-digit confirmation code to this address.
                    </p>

                    {authMethod === 'email' ? (
                      <div className="space-y-1">
                        <input 
                          id="input-emailInput"
                          type="email" 
                          placeholder="name@domain.com"
                          value={emailInput}
                          onChange={e => {
                            setEmailInput(e.target.value);
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                              setFieldError('emailInput', null);
                            }
                          }}
                          className={`w-full bg-white/5 border rounded-xl py-3.5 px-4 outline-none transition-all text-sm ${fieldErrors.emailInput ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:border-primary'}`}
                          disabled={loading}
                        />
                        {fieldErrors.emailInput && (
                          <div className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{fieldErrors.emailInput}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">+91</span>
                          <input 
                            id="input-phoneInput"
                            type="tel" 
                            placeholder="00000 00000"
                            value={phoneInput}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                              setPhoneInput(val);
                              if (val.length === 10) {
                                setFieldError('phoneInput', null);
                              }
                            }}
                            className={`w-full bg-white/5 border rounded-xl py-3.5 pl-14 pr-4 outline-none transition-all text-sm font-semibold tracking-wider ${fieldErrors.phoneInput ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:border-primary'}`}
                            disabled={loading}
                          />
                        </div>
                        {fieldErrors.phoneInput && (
                          <div className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{fieldErrors.phoneInput}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6">
                      <RoleSelector value={role} onChange={setRole} disabled={loading} />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full py-5 rounded-xl text-sm font-bold mt-auto"
                    onClick={handleSendOTP}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin text-black" /> : "Request Verification Code"}
                  </Button>
                </motion.div>
              )}

              {/* Step 3: Enter 6-digit OTP */}
              {step === steps.OTP && (
                <motion.div key="otp" custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-black mb-1.5">Verify Code</h2>
                    <p className="text-xs text-muted-foreground mb-6">
                      Code sent to <span className="text-white font-bold">{getTarget()}</span>
                    </p>

                    <div className="mb-6 flex flex-col items-center">
                      <OTPInput length={6} value={otp} onChange={(val) => {
                        setOtp(val);
                        if (val.length === 6) {
                          setFieldError('otp', null);
                        }
                      }} />
                      {fieldErrors.otp && (
                        <div className="text-red-400 text-xs mt-3 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{fieldErrors.otp}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                      {timer > 0 ? (
                        <span>Resend in <span className="text-primary font-bold">00:{timer < 10 ? `0${timer}` : timer}</span></span>
                      ) : (
                        <button className="text-primary font-bold hover:underline" onClick={handleResendOTP} disabled={loading}>
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full py-5 rounded-xl text-sm font-bold mt-auto"
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6 || loading}
                  >
                    {loading ? <Loader2 className="animate-spin text-black" /> : "Verify & Continue"}
                  </Button>
                </motion.div>
              )}

              {/* Step 4: Register Account */}
              {step === steps.REGISTER && (
                <motion.div key="register" custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 p-6 flex flex-col overflow-y-auto no-scrollbar">
                  <h2 className="text-2xl font-black mb-1.5">Create Profile</h2>
                  <p className="text-xs text-muted-foreground mb-6">Complete your profile details to join GramConnect.</p>

                  <div className="space-y-4 mb-6">
                    <div className="space-y-1">
                      <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                      <input 
                        id="input-name"
                        type="text" placeholder="John Doe" value={name} onChange={e => {
                          setName(e.target.value);
                          if (e.target.value.trim()) {
                            setFieldError('name', null);
                          }
                        }}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs outline-none transition-all ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'}`}
                        disabled={loading}
                      />
                      {fieldErrors.name && (
                        <p className="text-red-400 text-xxs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldErrors.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                      <input 
                        id="input-regEmail"
                        type="email" placeholder="john@domain.com" value={regEmail} onChange={e => {
                          setRegEmail(e.target.value);
                          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                            setFieldError('regEmail', null);
                          }
                        }}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs outline-none transition-all disabled:opacity-50 ${fieldErrors.regEmail ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'}`}
                        disabled={authMethod === 'email' || loading}
                      />
                      {fieldErrors.regEmail && (
                        <p className="text-red-400 text-xxs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldErrors.regEmail}</p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                      <input 
                        id="input-regPhone"
                        type="tel" placeholder="10-digit number" value={regPhone} onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                          setRegPhone(val);
                          if (val.length === 10) {
                            setFieldError('regPhone', null);
                          }
                        }}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs outline-none transition-all disabled:opacity-50 ${fieldErrors.regPhone ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'}`}
                        disabled={authMethod === 'phone' || loading}
                      />
                      {fieldErrors.regPhone && (
                        <p className="text-red-400 text-xxs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldErrors.regPhone}</p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">Village / Landmark Address</label>
                      <input 
                        id="input-village"
                        type="text" placeholder="Village name or main landmark" value={village} onChange={e => {
                          setVillage(e.target.value);
                          if (e.target.value.trim()) {
                            setFieldError('village', null);
                          }
                        }}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs outline-none transition-all ${fieldErrors.village ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'}`}
                        disabled={loading}
                      />
                      {fieldErrors.village && (
                        <p className="text-red-400 text-xxs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldErrors.village}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-xxs font-bold uppercase tracking-wider text-muted-foreground mb-2">Register profile as:</p>
                  <div className="flex gap-3 mb-6 shrink-0">
                    <div 
                      className={`flex-1 p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${role === 'user' ? 'border-primary bg-primary/5 text-primary' : 'border-white/5 bg-white/2 hover:bg-white/5 text-muted-foreground'}`}
                      onClick={() => !loading && setRole('user')}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-xs font-bold">Villager</span>
                    </div>
                    <div 
                      className={`flex-1 p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${role === 'agent' ? 'border-primary bg-primary/5 text-primary' : 'border-white/5 bg-white/2 hover:bg-white/5 text-muted-foreground'}`}
                      onClick={() => !loading && setRole('agent')}
                    >
                      <Truck className="w-5 h-5" />
                      <span className="text-xs font-bold">Delivery Agent</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-6">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <input 
                        id="input-terms"
                        type="checkbox" 
                        checked={termsAccepted} 
                        onChange={e => {
                          setTermsAccepted(e.target.checked);
                          if (e.target.checked) {
                            setFieldError('terms', null);
                          }
                        }}
                        className="rounded border-white/20 bg-white/5 text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                        disabled={loading}
                      />
                      <label htmlFor="input-terms" className="cursor-pointer">I accept the terms & conditions</label>
                    </div>
                    {fieldErrors.terms && (
                      <p className="text-red-400 text-xxs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldErrors.terms}</p>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full py-5 rounded-xl text-sm font-bold mt-auto"
                    onClick={handleRegister}
                    disabled={loading}
                  >
                     {loading ? <Loader2 className="animate-spin text-black" /> : (role === 'agent' ? "Next: Vehicle Details" : "Create Account")}
                  </Button>
                </motion.div>
              )}

              {/* Step 5: Agent Vehicle details */}
              {step === steps.AGENT_DETAILS && (
                <motion.div key="agent" custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 p-6 flex flex-col justify-between overflow-y-auto no-scrollbar">
                  <div>
                    <h2 className="text-2xl font-black mb-1.5">Agent Details</h2>
                    <p className="text-xs text-muted-foreground mb-8">Supply transportation logs to complete agent sign up.</p>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider block">Vehicle Type</label>
                        <select 
                          className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary transition-all text-white font-medium cursor-pointer"
                          value={vehicleType} 
                          onChange={e => setVehicleType(e.target.value)}
                          disabled={loading}
                        >
                           <option value="bicycle">Bicycle</option>
                           <option value="motorcycle">Motorcycle</option>
                           <option value="auto">Auto Rickshaw</option>
                           <option value="pickup">Pickup Truck</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider block">Vehicle Registration Number</label>
                        <input 
                          id="input-vehicleNumber"
                          type="text" 
                          placeholder="e.g. GJ-18-CB-1128" 
                          value={vehicleNumber} 
                          onChange={e => {
                            const val = e.target.value.toUpperCase();
                            setVehicleNumber(val);
                            if (val.trim()) {
                              setFieldError('vehicleNumber', null);
                            }
                          }}
                          className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs outline-none transition-all ${fieldErrors.vehicleNumber ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'}`}
                          disabled={loading}
                        />
                        {fieldErrors.vehicleNumber && (
                          <p className="text-red-400 text-xxs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldErrors.vehicleNumber}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider block">Driver License Number (Optional)</label>
                        <input 
                          id="input-licenseNumber"
                          type="text" 
                          placeholder="e.g. DL-14201100682" 
                          value={licenseNumber} 
                          onChange={e => setLicenseNumber(e.target.value.toUpperCase())}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary transition-all text-white"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full py-5 rounded-xl text-sm font-bold mt-auto"
                    onClick={submitRegistration}
                    disabled={loading}
                  >
                     {loading ? <Loader2 className="animate-spin text-black" /> : "Complete Registration"}
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
