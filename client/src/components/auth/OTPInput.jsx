import React, { useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export function OTPInput({ length = 4, value = "", onChange }) {
  const [activeOTPIndex, setActiveOTPIndex] = useState(0);
  const inputRef = useRef(null);

  const handleOnChange = (e, index) => {
    const text = e.target.value;
    if (!text) return;
    
    // Get only last character to prevent pasting multiple inside one box
    const char = text.substring(text.length - 1);
    
    const newValue = value.substring(0, index) + char + value.substring(index + 1);
    onChange(newValue);
    
    if (activeOTPIndex < length - 1) {
      setActiveOTPIndex(activeOTPIndex + 1);
    }
  };

  const handleOnKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = value.substring(0, index) + ' ' + value.substring(index + 1);
      onChange(newValue.trim());
      
      if (activeOTPIndex > 0) {
        setActiveOTPIndex(activeOTPIndex - 1);
      }
    }
  };

  // Always keep focus on active input
  React.useEffect(() => {
    inputRef.current?.focus();
  }, [activeOTPIndex]);

  return (
    <div className="flex justify-center items-center gap-3">
      {Array(length).fill("").map((_, index) => (
        <React.Fragment key={index}>
          <input
            ref={index === activeOTPIndex ? inputRef : null}
            type="number"
            className={cn(
              "w-12 h-14 md:w-14 md:h-16 flex items-center justify-center text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl transition-all outline-none",
              index === activeOTPIndex ? "border-primary shadow-[0_0_15px_rgba(74,222,128,0.3)] bg-white/10" : "hover:border-white/30 text-white/80"
            )}
            onChange={(e) => handleOnChange(e, index)}
            onKeyDown={(e) => handleOnKeyDown(e, index)}
            value={value[index] && value[index] !== ' ' ? value[index] : ""}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
