import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, CheckCircle2, Info, AlertTriangle, Volume2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import API_BASE_URL from '../../config/api';

export const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Audio notifier
  const playSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Setup Socket.io client
    const socket = io(API_BASE_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket client connected:', socket.id);
      if (user?.id || user?.userId) {
        socket.emit('join_user', user.id || user.userId);
      }
      if (user?.role) {
        socket.emit('join_role', user.role);
      }
    });

    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      playSound();
    });

    // Close dropdown on outside clicks
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      socket.disconnect();
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === id ? { ...n, read: true } : n)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center text-muted-foreground hover:text-white"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 max-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/95 shadow-2xl backdrop-blur-md z-[2000] flex flex-col"
          >
            {/* Dropdown Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <span className="font-bold text-sm text-white">Logistics Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xxs font-bold text-primary hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification items list */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkAsRead(n._id)}
                  className={`p-3.5 flex gap-3 text-left transition-all cursor-pointer hover:bg-white/5 ${n.read ? 'opacity-55' : 'bg-white/2 border-l-2 border-primary'}`}
                >
                  {getIcon(n.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-white leading-tight">{n.title}</p>
                    <p className="text-xxs text-muted-foreground leading-normal">{n.message}</p>
                    <p className="text-[9px] text-neutral-500">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(n._id, e)}
                    className="p-1 rounded hover:bg-white/10 text-neutral-500 hover:text-red-400 self-start shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="p-10 text-center text-xs text-muted-foreground">
                  No notifications recorded yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
