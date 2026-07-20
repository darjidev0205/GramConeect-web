import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  Plus, MessageSquare, AlertCircle, Clock, CheckCircle2, ChevronRight, 
  Send, Paperclip, Star, RefreshCw, X, FileText, CornerDownRight 
} from 'lucide-react';
import API_BASE_URL from '../../config/api';

export const SupportCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create ticket state
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical');
  const [priority, setPriority] = useState('Low');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Selected ticket chat view
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachment, setReplyAttachment] = useState(null);
  const replyFileRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        throw new Error('Failed to load tickets');
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve support tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('priority', priority);

    Array.from(attachments).forEach(file => {
      formData.append('attachments', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit ticket');

      setSuccess(`Ticket ${data.ticketId} created successfully.`);
      setTitle('');
      setDescription('');
      setCategory('Technical');
      setPriority('Low');
      setAttachments([]);
      setIsCreating(false);
      fetchTickets();
    } catch (err) {
      setError(err.message || 'Error creating ticket');
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() && !replyAttachment) return;

    const formData = new FormData();
    formData.append('message', replyMessage);
    if (replyAttachment) {
      formData.append('attachment', replyAttachment);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets/${selectedTicket._id}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data);
        setReplyMessage('');
        setReplyAttachment(null);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Close this ticket?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Closed' })
      });

      if (response.ok) {
        const data = await response.json();
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket(prev => ({ ...prev, status: 'Closed', closedAt: data.closedAt }));
        }
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateResolution = async (ticketId, rating) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/rate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });
      if (response.ok) {
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket(prev => ({ ...prev, rating }));
        }
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Assigned':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'In Progress':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Resolved':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Closed':
        return 'bg-neutral-500/10 text-neutral-400 border-white/5';
      default:
        return 'bg-white/5 text-muted-foreground';
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Low':
        return 'text-neutral-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'High':
        return 'text-orange-400';
      case 'Critical':
        return 'text-red-400 font-bold';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Logistics Support Center</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Submit technical problems, route queries, or payment feedback directly to managers.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTickets} variant="outline" className="border-white/5 bg-neutral-900 rounded-xl h-11 px-4 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setIsCreating(!isCreating)} className="bg-primary text-black font-bold rounded-xl h-11 px-6">
            <Plus className="w-4 h-4 mr-2" /> Raise Ticket
          </Button>
        </div>
      </div>

      {success && (
        <div className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs p-4 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isCreating && (
        <Card className="border border-white/5 bg-neutral-900 rounded-3xl p-6">
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-xs text-white cursor-pointer"
                >
                  <option value="Technical">Technical Issue</option>
                  <option value="Delivery">Delivery & Logistics</option>
                  <option value="Payment">Payment & Pricing</option>
                  <option value="Account">Account Access</option>
                  <option value="Bug Report">System Bug Report</option>
                  <option value="Feature Request">Request Feature</option>
                  <option value="Other">Other Problems</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Priority Rating</label>
                <select 
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-xl px-3 py-3 text-xs text-white cursor-pointer"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">🚨 Critical Action Required</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Problem Title Summary</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                placeholder="Brief summary of the issue..." 
                className="bg-black border-white/5 h-11 text-xs" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Elaborated Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required 
                rows={4}
                placeholder="Explain the details of your issue clearly so developers/admins can resolve it..." 
                className="w-full bg-black border border-white/5 rounded-xl p-3 text-xs text-white placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Attach Screenshot (Optional)</label>
              <input 
                type="file" 
                ref={fileInputRef}
                multiple
                onChange={e => setAttachments(e.target.files)}
                accept="image/*"
                className="hidden" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:bg-white/2 transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
                <p className="text-xxs text-muted-foreground">
                  {attachments.length > 0 ? `${attachments.length} files selected` : 'Click to select screenshots/images (max 3)'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="rounded-xl h-11 px-6">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-black font-bold rounded-xl h-11 px-8">
                Submit Support Request
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ticket list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">My Ticket Log Registry ({tickets.length})</h3>
          {tickets.map(t => (
            <Card 
              key={t._id} 
              onClick={() => setSelectedTicket(t)}
              className={`border transition-all cursor-pointer rounded-2xl p-4 ${selectedTicket?._id === t._id ? 'border-primary bg-primary/5' : 'border-white/5 bg-neutral-900 hover:border-white/10'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xxs text-primary font-bold">{t.ticketId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                    <span className={`text-[10px] font-semibold ${getPriorityBadge(t.priority)}`}>
                      • {t.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{t.title}</h4>
                  <p className="text-xxs text-muted-foreground">
                    Category: <b className="text-white/80">{t.category}</b> • Raised: {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Card>
          ))}

          {tickets.length === 0 && !loading && (
            <div className="text-center py-16 border border-dashed border-white/5 rounded-3xl bg-neutral-900/40">
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-bold text-sm">No Active Tickets</h4>
              <p className="text-xxs text-muted-foreground max-w-xs mx-auto mt-1">If you have any issues with delivery timings, cost, or account access, please submit a ticket.</p>
            </div>
          )}
        </div>

        {/* Reply/Chat View Panel */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <Card className="border border-white/5 bg-neutral-900 rounded-3xl overflow-hidden flex flex-col h-[520px]">
              {/* Panel Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xxs text-primary font-bold">{selectedTicket.ticketId}</span>
                    <span className={`text-[9px] px-1.5 py-0.25 rounded-full border ${getStatusBadge(selectedTicket.status)}`}>{selectedTicket.status}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[150px] mt-1">{selectedTicket.title}</h4>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-1 rounded bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">Original Issue Description:</p>
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-3 text-white">
                    {selectedTicket.description}
                    {selectedTicket.attachments?.map((url, i) => (
                      <div key={i} className="mt-2 border border-white/5 rounded-lg overflow-hidden max-w-[200px]">
                        <img src={url} alt="attachment" className="w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTicket.replies?.map((rep, idx) => {
                  const isAdmin = rep.sender?.role === 'admin';
                  return (
                    <div key={idx} className={`flex gap-2 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl border ${isAdmin ? 'bg-primary/5 border-primary/20 text-white rounded-tl-none' : 'bg-neutral-800 border-white/5 text-white rounded-tr-none'}`}>
                        <p className="text-[9px] font-bold text-muted-foreground mb-0.5">{rep.sender?.name || 'Sender'} ({rep.sender?.role})</p>
                        <p>{rep.message}</p>
                        {rep.attachment && (
                          <div className="mt-2 border border-white/5 rounded-lg overflow-hidden max-w-[160px]">
                            <img src={rep.attachment} alt="reply attach" className="w-full object-cover" />
                          </div>
                        )}
                        <p className="text-[8px] text-muted-foreground text-right mt-1">{new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Close & Resolution Star Ratings */}
              {selectedTicket.status === 'Resolved' && (
                <div className="p-3 border-t border-white/5 bg-green-500/5 text-center space-y-2">
                  <p className="text-[10px] text-green-400 font-bold">This issue has been marked resolved. Rate the assistance:</p>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        onClick={() => handleRateResolution(selectedTicket._id, star)}
                        className="cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= (selectedTicket.rating || 0) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      </button>
                    ))}
                  </div>
                  {selectedTicket.rating && (
                    <Button onClick={() => handleCloseTicket(selectedTicket._id)} className="w-full bg-green-500 text-black font-bold h-8 text-xxs rounded-lg mt-1">
                      Accept and Close Ticket
                    </Button>
                  )}
                </div>
              )}

              {/* Input Area */}
              {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Resolved' && (
                <form onSubmit={handlePostReply} className="p-3 border-t border-white/5 bg-black/40 flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => replyFileRef.current?.click()}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    ref={replyFileRef}
                    onChange={e => setReplyAttachment(e.target.files[0])}
                    className="hidden" 
                  />
                  <Input 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Type message response..." 
                    className="bg-black border-white/5 flex-1 h-9 text-xs" 
                  />
                  <Button type="submit" className="bg-primary text-black h-9 w-9 rounded-xl p-0 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}

              {/* Closed Banner */}
              {selectedTicket.status === 'Closed' && (
                <div className="p-4 border-t border-white/5 bg-white/2 text-center text-muted-foreground text-xxs font-semibold">
                  This ticket has been permanently closed.
                </div>
              )}
            </Card>
          ) : (
            <div className="border border-dashed border-white/10 rounded-3xl p-8 text-center bg-neutral-900/10 text-muted-foreground text-xxs h-[300px] flex flex-col justify-center items-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/45 mb-2" />
              Select a support ticket from log to view messages and replies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
