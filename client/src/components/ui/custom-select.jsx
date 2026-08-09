import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  label,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, opensUp: false });
  
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  // Normalize options to { label, value } objects
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { label: opt.label, value: opt.value };
    }
    return { label: String(opt), value: opt };
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Calculate dynamic portal position relative to trigger button & viewport
  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const estimatedMenuHeight = Math.min(normalizedOptions.length * 36 + 12, 240);
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensUp = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

      let top = opensUp ? rect.top - estimatedMenuHeight - 6 : rect.bottom + 6;
      let left = rect.left;
      let width = Math.max(rect.width, 160);

      // Check right edge boundary
      if (left + width > window.innerWidth - 12) {
        left = window.innerWidth - width - 12;
      }

      setCoords({
        top: Math.max(8, top),
        left: Math.max(8, left),
        width,
        opensUp,
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
    }
  }, [isOpen, options.length]);

  // Listen to window resize and scroll to recalculate or close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Handle click outside to close dropdown (checking both trigger and portalled menu)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inTrigger = containerRef.current && containerRef.current.contains(event.target);
      const inMenu = menuRef.current && menuRef.current.contains(event.target);
      if (!inTrigger && !inMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Keyboard accessibility
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex(
          (opt) => String(opt.value) === String(value)
        );
        const nextIndex = (currentIndex + 1) % normalizedOptions.length;
        onChange(normalizedOptions[nextIndex].value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex(
          (opt) => String(opt.value) === String(value)
        );
        const prevIndex =
          (currentIndex - 1 + normalizedOptions.length) % normalizedOptions.length;
        onChange(normalizedOptions[prevIndex].value);
      }
    }
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-1.5 ${className}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 h-4 flex items-center">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-10 w-full bg-neutral-950/90 hover:bg-neutral-950 border rounded-xl px-3 flex items-center justify-between text-xs font-semibold text-white outline-none cursor-pointer transition-all duration-200 select-none ${
          isOpen
            ? 'border-primary/60 ring-2 ring-primary/20 shadow-lg shadow-primary/10'
            : 'border-white/10 hover:border-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate pr-2 text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : 'text-slate-400'
          }`}
        />
      </button>

      {/* React Portal Floating Options Menu attached directly to document.body */}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="max-h-60 overflow-y-auto no-scrollbar rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-1.5 font-sans animate-in fade-in-0 zoom-in-95 duration-150"
            role="listbox"
          >
            {normalizedOptions.length === 0 ? (
              <div className="p-2.5 text-center text-xxs text-slate-500 font-mono">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => handleSelect(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    className={`h-9 px-3 rounded-xl flex items-center justify-between text-xs transition-colors duration-150 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-primary/15 text-primary font-bold border border-primary/20'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomSelect;
