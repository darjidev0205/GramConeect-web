import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  Search, MessageSquare, AlertCircle, RefreshCw, X, Send, 
  Paperclip, CheckCircle2, ChevronRight, ShieldCheck, UserCheck, Trash2 
} from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';

export const AdminSupportCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtering / Search state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Selected ticket chat view
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachment, setReplyAttachment] = useState(null);
  const replyFileRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const response = await api.get(`/api/tickets?${params.toString()}`);
      setTickets(response.data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Could not retrieve support tickets.'));
    } finally {
      setLoading(false);
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
      const response = await api.post(`/api/tickets/${selectedTicket._id}/replies`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedTicket(response.data);
      setReplyMessage('');
      setReplyAttachment(null);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      const response = await api.put(`/api/tickets/${ticketId}/status`, { status });
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status }));
      }
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignToMe = async (ticketId) => {
    try {
      await api.put(`/api/tickets/${ticketId}/assign`, { adminId: 'me' });
      fetchTickets();
      const detailsRes = await api.get(`/api/tickets/${ticketId}`);
      setSelectedTicket(detailsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('WARNING: Delete this support ticket permanently?')) return;
    try {
      await api.delete(`/api/tickets/${ticketId}`);
      setSelectedTicket(null);
      fetchTickets();
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Support Ticket Inbox Control</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Moderate complaints, assign priority rankings, reply to users, and close tickets.</p>
      </div>

      {/* Searching & Filters */}
      <Card className="border border-white/5 bg-neutral-900 rounded-3xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 min-w-[260px] gap-2">
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search Ticket ID or keyword..." 
            className="bg-black border-white/5 text-xs h-10" 
          />
          <Button onClick={fetchTickets} className="bg-primary text-black font-bold h-10 px-4 rounded-xl">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-black border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-black border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-black border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Delivery">Delivery</option>
            <option value="Payment">Payment</option>
            <option value="Account">Account</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ticket List Table */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground flex gap-2 justify-center"><RefreshCw className="w-5 h-5 animate-spin text-primary" /> Syncing tickets...</div>
          ) : (
            <div className="border border-white/5 rounded-3xl bg-neutral-900 overflow-hidden overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-white/2 text-muted-foreground border-b border-white/5 text-[10px] uppercase font-bold">
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">User (Role)</th>
                    <th className="p-3">Topic / Title</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.map(t => (
                    <tr 
                      key={t._id} 
                      onClick={() => setSelectedTicket(t)}
                      className={`hover:bg-white/1 cursor-pointer transition-colors ${selectedTicket?._id === t._id ? 'bg-primary/5' : ''}`}
                    >
                      <td className="p-3 font-mono font-bold text-primary">{t.ticketId}</td>
                      <td className="p-3 font-medium text-white/90">
                        {t.user?.name}
                        <span className="block text-[9px] text-muted-foreground capitalize">{t.user?.role}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold">{t.title}</span>
                        <span className="block text-[9px] text-muted-foreground truncate max-w-[200px]">{t.description}</span>
                      </td>
                      <td className="p-3 font-semibold">{t.priority}</td>
                      <td className="p-3">
                        <span className={`text-[9px] px-2 py-0.5 border rounded-full ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleDeleteTicket(t._id)}
                          className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-muted-foreground">No matching support tickets found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reply/Chat View Panel */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <Card className="border border-white/5 bg-neutral-900 rounded-3xl overflow-hidden flex flex-col h-[520px]">
              {/* Header details */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div>
                  <span className="font-mono text-xxs text-primary font-bold">{selectedTicket.ticketId}</span>
                  <p className="text-xs font-bold text-white truncate max-w-[150px] mt-0.5">{selectedTicket.title}</p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleAssignToMe(selectedTicket._id)}
                    title="Assign to me"
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setSelectedTicket(null)} className="p-1 rounded bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[11px] select-text">
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground">User Description:</p>
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-3 text-white">
                    {selectedTicket.description}
                    {selectedTicket.attachments?.map((url, i) => (
                      <div key={i} className="mt-2 border border-white/5 rounded-lg overflow-hidden max-w-[200px]">
                        <a href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt="attachment" className="w-full object-cover cursor-zoom-in" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTicket.replies?.map((rep, idx) => {
                  const isAdmin = rep.sender?.role === 'admin';
                  return (
                    <div key={idx} className={`flex gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl border ${isAdmin ? 'bg-neutral-800 border-white/5 text-white rounded-tr-none' : 'bg-primary/5 border-primary/20 text-white rounded-tl-none'}`}>
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

              {/* State Controls Toggles */}
              <div className="p-3 border-t border-white/5 bg-black/20 flex gap-2 justify-center">
                <Button 
                  onClick={() => handleStatusChange(selectedTicket._id, 'In Progress')}
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-[10px] h-8 rounded-lg"
                >
                  In Progress
                </Button>
                <Button 
                  onClick={() => handleStatusChange(selectedTicket._id, 'Resolved')}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-[10px] h-8 rounded-lg"
                >
                  Resolve Issue
                </Button>
                <Button 
                  onClick={() => handleCloseTicket(selectedTicket._id)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-white/5 text-[10px] h-8 rounded-lg"
                >
                  Close Ticket
                </Button>
              </div>

              {/* Input reply form */}
              {selectedTicket.status !== 'Closed' && (
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
                    placeholder="Reply back to user..." 
                    className="bg-black border-white/5 flex-1 h-9 text-[11px]" 
                  />
                  <Button type="submit" className="bg-primary text-black h-9 w-9 rounded-xl p-0 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </Card>
          ) : (
            <div className="border border-dashed border-white/10 rounded-3xl p-8 text-center bg-neutral-900/10 text-muted-foreground text-xxs h-[300px] flex flex-col justify-center items-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/45 mb-2" />
              Select a ticket to review user logs, write comments, or update resolve states.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
