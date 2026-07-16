import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Truck, Shield, ChevronDown } from 'lucide-react';

const roles = [
  { id: 'user', label: 'Villager / User', icon: Home, desc: 'Customer placing delivery requests' },
  { id: 'agent', label: 'Delivery Partner', icon: Truck, desc: 'Local agent fulfilling transits' },
  { id: 'admin', label: 'Admin Manager', icon: Shield, desc: 'System management & analytics' }
];

export function RoleSelector({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedRole = roles.find(r => r.id === value) || roles[0];
  const SelectedIcon = selectedRole.icon;

  // Keyboard navigation support
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        onChange(roles[activeIndex].id);
        setIsOpen(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setActiveIndex(prev => (prev + 1) % roles.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setActiveIndex(prev => (prev - 1 + roles.length) % roles.length);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full text-left" ref={containerRef} onKeyDown={handleKeyDown}>
      <label className="text-xs font-semibold text-muted-foreground block mb-2">Select Your Role</label>
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:bg-neutral-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <SelectedIcon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white">{selectedRole.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute z-50 w-full bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl overflow-hidden mt-1 focus:outline-none"
          >
            {roles.map((roleItem, index) => {
              const Icon = roleItem.icon;
              const isSelected = roleItem.id === value;
              const isFocused = index === activeIndex;

              return (
                <li
                  key={roleItem.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(roleItem.id);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'bg-primary text-black font-semibold' : 
                    isFocused ? 'bg-white/5 text-white' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-black/10 text-black' : 'bg-white/5 text-primary'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{roleItem.label}</p>
                      <p className={`text-xxs mt-0.5 ${isSelected ? 'text-black/70' : 'text-muted-foreground'}`}>{roleItem.desc}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
