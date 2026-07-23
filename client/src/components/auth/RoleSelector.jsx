import React from 'react';
import { motion } from 'framer-motion';
import { Home, Bike, Shield, Check } from 'lucide-react';

const roles = [
  { 
    id: 'user', 
    label: 'Villager', 
    desc: 'Receive doorstep deliveries in your village', 
    icon: Home,
    badge: 'Customer'
  },
  { 
    id: 'agent', 
    label: 'Delivery Partner', 
    desc: 'Deliver parcels locally and earn daily payout', 
    icon: Bike,
    badge: 'Partner'
  },
  { 
    id: 'admin', 
    label: 'Platform Admin', 
    desc: 'Manage logistics hubs & network routes', 
    icon: Shield,
    badge: 'Management'
  }
];

export function RoleSelector({ value, onChange, disabled }) {
  return (
    <div className="w-full text-left space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Select Your Network Role
        </label>
        <span className="text-[10px] text-blue-400 font-mono">No Dropdown • Direct Select</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {roles.map((roleItem) => {
          const Icon = roleItem.icon;
          const isSelected = roleItem.id === value;

          return (
            <motion.div
              key={roleItem.id}
              whileHover={{ y: disabled ? 0 : -2 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => !disabled && onChange(roleItem.id)}
              className={`relative p-4 rounded-2xl cursor-pointer border transition-all duration-300 flex flex-col justify-between ${
                isSelected 
                  ? 'bg-gradient-to-b from-blue-600/20 to-indigo-600/20 border-cyan-400 shadow-lg shadow-blue-600/20 text-white' 
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-[#050816]"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </motion.div>
              )}

              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isSelected ? 'bg-cyan-400 text-[#050816]' : 'bg-white/5 text-blue-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="text-sm font-bold text-white tracking-tight">{roleItem.label}</div>
                <div className="text-[11px] text-slate-400 leading-snug mt-1">{roleItem.desc}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{roleItem.badge}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
