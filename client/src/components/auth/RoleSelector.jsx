import React from 'react';
import { motion } from 'framer-motion';
import { Home, Bike, ShieldCheck, Check } from 'lucide-react';

const allRoles = [
  { 
    id: 'user', 
    label: 'Villager', 
    desc: 'Receive doorstep deliveries in your village', 
    icon: Home,
    badge: 'CUSTOMER'
  },
  { 
    id: 'agent', 
    label: 'Delivery Partner', 
    desc: 'Deliver parcels locally and earn daily payout', 
    icon: Bike,
    badge: 'PARTNER'
  },
  { 
    id: 'admin', 
    label: 'Admin', 
    desc: 'Manage GramConnect operations, users and platform activity', 
    icon: ShieldCheck,
    badge: 'MANAGEMENT'
  }
];

export function RoleSelector({ value, onChange, disabled, showAdmin = false, targetEmail = '' }) {
  const isAdminAuthorized = showAdmin || value === 'admin' || targetEmail?.trim().toLowerCase() === 'darjidev4350@gmail.com';
  
  const activeRoles = allRoles.filter(roleItem => {
    if (roleItem.id === 'admin') {
      return isAdminAuthorized;
    }
    return true;
  });

  return (
    <div className="w-full text-left space-y-2.5">
      <div>
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#AAB5C6] block mb-0.5">
          Select Your Network Role
        </label>
        <p className="text-xs text-[#9BA8BC]">
          Choose how you use GramConnect.
        </p>
      </div>

      <div className={`grid grid-cols-1 ${activeRoles.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
        {activeRoles.map((roleItem) => {
          const Icon = roleItem.icon;
          const isSelected = roleItem.id === value;

          return (
            <motion.div
              key={roleItem.id}
              whileHover={{ y: disabled ? 0 : -2 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => !disabled && onChange(roleItem.id)}
              style={isSelected ? {
                background: 'linear-gradient(135deg, rgba(28, 57, 105, 0.95), rgba(17, 35, 68, 0.95))',
                border: '1px solid #18C7E8'
              } : {
                background: 'rgba(15, 23, 40, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.09)'
              }}
              className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected ? 'text-white shadow-md shadow-[#18C7E8]/10' : 'text-[#9BA8BC] hover:border-white/20'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#18C7E8] flex items-center justify-center text-[#050A16] shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </motion.div>
              )}

              <div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isSelected ? 'bg-[#18C7E8] text-[#050A16]' : 'bg-[#121B2D] text-[#18C7E8] border border-white/10'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>

                <div className="text-sm font-bold text-white tracking-tight">{roleItem.label}</div>
                <div className="text-[11px] text-[#9BA8BC] leading-snug mt-1">{roleItem.desc}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#AAB5C6] font-bold">{roleItem.badge}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


