import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export function OTPInput({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  isError = false,
  authSequenceStep = 0, // 0: normal input, 1: morphing dots, 2: light sweep, 3: converged dots, 4: success text
  onAutoSubmit
}) {
  const [activeOTPIndex, setActiveOTPIndex] = useState(0);
  const inputRefs = useRef([]);

  // Sync ref array length
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Keep focus on active index when in normal input mode
  useEffect(() => {
    if (authSequenceStep === 0 && !disabled) {
      inputRefs.current[activeOTPIndex]?.focus();
    }
  }, [activeOTPIndex, authSequenceStep, disabled]);

  // Handle single character change with strict numeric filtering
  const handleOnChange = (e, index) => {
    if (disabled || authSequenceStep > 0) return;
    const text = e.target.value;
    
    // Extract only digits
    const cleanDigits = text.replace(/\D/g, '');
    if (!cleanDigits && text !== '') return;

    const char = cleanDigits.slice(-1);

    // Build new value
    const valArray = value.padEnd(length, ' ').split('');
    valArray[index] = char || ' ';
    const newValue = valArray.join('').slice(0, length);
    
    onChange(newValue.trimEnd());

    // Advance focus if digit was entered
    if (char && index < length - 1) {
      setActiveOTPIndex(index + 1);
    }

    // Auto submit if last digit entered and code is 6 digits long
    const cleanFullCode = newValue.replace(/\s/g, '');
    if (char && index === length - 1 && cleanFullCode.length === length) {
      if (onAutoSubmit) {
        onAutoSubmit(cleanFullCode);
      }
    }
  };

  const handleOnKeyDown = (e, index) => {
    if (disabled || authSequenceStep > 0) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const valArray = value.padEnd(length, ' ').split('');
      
      if (valArray[index] && valArray[index] !== ' ') {
        // Clear current index digit
        valArray[index] = ' ';
        const newValue = valArray.join('').slice(0, length);
        onChange(newValue.trimEnd());
      } else if (index > 0) {
        // Move to previous index and clear it
        valArray[index - 1] = ' ';
        const newValue = valArray.join('').slice(0, length);
        onChange(newValue.trimEnd());
        setActiveOTPIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) setActiveOTPIndex(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < length - 1) setActiveOTPIndex(index + 1);
    }
  };

  const handleOnPaste = (e) => {
    if (disabled || authSequenceStep > 0) return;
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, length);
    if (!digits) return;

    onChange(digits);
    const nextIndex = Math.min(digits.length, length - 1);
    setActiveOTPIndex(nextIndex);

    if (digits.length === length && onAutoSubmit) {
      onAutoSubmit(digits);
    }
  };

  // Sequence status flags
  const isMorphing = authSequenceStep >= 1;
  const isSweep = authSequenceStep >= 2;
  const isConverged = authSequenceStep >= 3;

  // Shake animation variant for invalid OTP attempts
  const errorShakeVariants = {
    error: {
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      transition: { duration: 0.45, ease: "easeInOut" }
    },
    idle: { x: 0 }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-1 select-none">
      <motion.div
        variants={errorShakeVariants}
        animate={isError ? "error" : "idle"}
        className={cn(
          "flex items-center justify-center transition-all duration-500 ease-out",
          isConverged ? "gap-2.5 sm:gap-3" : "gap-2 sm:gap-3.5"
        )}
      >
        {Array.from({ length }).map((_, index) => {
          const digit = value[index] && value[index] !== ' ' ? value[index] : '';
          const isFocused = index === activeOTPIndex && !isMorphing && !disabled;
          const isFilled = Boolean(digit);

          return (
            <motion.div
              key={index}
              layout
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 26,
                delay: isMorphing ? index * 0.04 : 0
              }}
              className="relative flex items-center justify-center"
            >
              {isMorphing ? (
                /* SECURITY DOT MORPH STATE */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: isSweep
                      ? [1, 1.4, 1]
                      : isConverged
                      ? 1.15
                      : 1,
                    opacity: 1,
                    boxShadow: isSweep || isConverged
                      ? "0 0 16px rgba(34, 211, 238, 0.95), 0 0 30px rgba(59, 130, 246, 0.7)"
                      : "0 0 10px rgba(34, 211, 238, 0.5)"
                  }}
                  transition={{
                    duration: isSweep ? 0.45 : 0.35,
                    delay: isSweep ? index * 0.08 : 0,
                    ease: "easeInOut"
                  }}
                  className={cn(
                    "rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 transition-all duration-300",
                    isConverged
                      ? "w-4 h-4 sm:w-5 sm:h-5 bg-cyan-300"
                      : "w-3.5 h-3.5 sm:w-4 sm:h-4"
                  )}
                />
              ) : (
                /* STANDARD OTP FIELD INPUT */
                <motion.div
                  whileTap={!disabled ? { scale: 0.96 } : {}}
                  className="relative"
                >
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete="one-time-code"
                    disabled={disabled}
                    value={digit}
                    onClick={() => setActiveOTPIndex(index)}
                    onChange={(e) => handleOnChange(e, index)}
                    onKeyDown={(e) => handleOnKeyDown(e, index)}
                    onPaste={handleOnPaste}
                    className={cn(
                      "w-11 h-13 sm:w-13 sm:h-15 md:w-14 md:h-16 text-center text-xl sm:text-2xl font-extrabold font-mono rounded-2xl outline-none transition-all duration-200",
                      "bg-[#090d26]/80 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]",
                      isFocused
                        ? "border-2 border-cyan-400 text-white bg-cyan-500/10 ring-4 ring-cyan-400/20 shadow-[0_0_22px_rgba(34,211,238,0.35),inset_0_2px_4px_rgba(0,0,0,0.3)] scale-[1.03]"
                        : isFilled
                        ? "border border-white/25 text-white bg-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                        : "border border-white/10 text-white/40 hover:border-white/20 hover:bg-white/[0.06]",
                      isError && "border-red-500/90 text-red-200 bg-red-500/10 shadow-[0_0_16px_rgba(239,68,68,0.3)]"
                    )}
                  />
                  {/* Subtle active glow highlight ring */}
                  {isFocused && (
                    <motion.span
                      layoutId="activeGlow"
                      className="absolute inset-0 rounded-2xl border-2 border-cyan-400/80 pointer-events-none"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Success Animated Check Indicator when sequence reaches converged/success */}
      {isConverged && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-4 flex items-center justify-center gap-2 text-cyan-400 font-bold text-xs sm:text-sm font-display tracking-wide"
        >
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)]">
            <Check className="w-3.5 h-3.5 text-cyan-300 stroke-[3]" />
          </div>
          <span>Identity Authenticated</span>
        </motion.div>
      )}
    </div>
  );
}
