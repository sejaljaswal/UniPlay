import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { Trash2, Users, MessageCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(import.meta.env.VITE_API_URL); // Use env var for socket connection

function OrganizerClubChat({ clubId, clubName, clubIcon }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [organizer, setOrganizer] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'members'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const token = localStorage.getItem('uniplay_organizer_token');
        const res = await fetch(`${API_URL}/api/organizer/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrganizer(data);
        }
      } catch (err) { }
    };
    fetchOrganizer();
  }, []);

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const token = localStorage.getItem('uniplay_organizer_token');
      console.log('Fetching members for club:', clubId);
      console.log('API URL:', `${API_URL}/api/clubs/clubs/${clubId}/members`);
      const res = await fetch(`${API_URL}/api/clubs/${clubId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Members response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Members data:', data);
        setMembers(data);
      } else {
        const errorData = await res.text();
        console.error('Members fetch error:', errorData);
        toast.error('Failed to fetch club members');
      }
    } catch (err) {
      console.error('Members fetch exception:', err);
      toast.error('Error fetching club members');
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      setError('');
      setForbidden(false);
      try {
        const token = localStorage.getItem('uniplay_organizer_token');
        const res = await fetch(`${API_URL}/api/clubs/${clubId}/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 403) {
          setForbidden(true);
          setLoading(false);
          toast.error('You must join this club to access the chat.');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch chat');
        const data = await res.json();
        console.log('Chat messages:', data);
        setMessages(data);
      } catch (err) {
        setError('Error fetching chat');
        toast.error('Error fetching chat');
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [clubId]);

  useEffect(() => {
    socket.emit('joinClubRoom', clubId);
    socket.off('newClubMessage');
    socket.on('newClubMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      socket.off('newClubMessage');
    };
  }, [clubId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    }
  }, [activeTab]);

  const handleSend = () => {
    if (!input.trim()) return;
    try {
      if (!organizer) {
        toast.error('Organizer not found. Please log in again.');
        return;
      }
      socket.emit('clubChatMessage', {
        clubId,
        userId: organizer.organizer._id,
        text: input,
      });
      setInput('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    console.log('Deleting message with ID:', messageId);
    try {
      const token = localStorage.getItem('uniplay_organizer_token');
      const res = await fetch(`${API_URL}/api/clubs/${clubId}/chat/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Remove the message from local state
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        toast.success('Message deleted successfully');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete message');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading chat...</div>;
  if (forbidden) return <div className="text-center py-20 text-red-500">You must join this club to access the chat.</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  console.log('Current active tab:', activeTab);
  console.log('Members count:', members.length);
  console.log('Component rendering with tabs visible');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-3xl shadow-xl p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{clubIcon}</span>
            <h2 className="text-2xl font-bold text-white">{clubName} Chat</h2>
          </div>
          <Link to="/organizer/clubs" className="bg-white/90 text-blue-700 px-4 py-2 rounded-xl font-bold shadow hover:bg-blue-100 transition-all">
            ← Back to Clubs
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col h-[70vh]">
          {/* Tab Navigation - Always Visible */}
          <div className="flex mb-4 bg-blue-100 p-2 rounded-lg border-2 border-blue-300">
            <button
              onClick={() => {
                console.log('Switching to chat tab');
                setActiveTab('chat');
              }}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all ${activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-300'
                }`}
            >
              <MessageCircle size={20} />
              Chat
            </button>
            <button
              onClick={() => {
                console.log('Switching to members tab');
                setActiveTab('members');
              }}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all ${activeTab === 'members'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-300'
                }`}
            >
              <Users size={20} />
              Members ({members.length})
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-xl p-4">
                {messages.length === 0 ? (
                  <div className="text-gray-400 text-center">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className="mb-4 flex items-start gap-3">
                      <img
                        src={msg.user.avatar || `https://ui-avatars.com/api/?name=${msg.user.name}`}
                        alt={msg.user.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-blue-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-700">{msg.user.name}</span>
                          <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <button
                            onClick={() => {
                              console.log('Delete button clicked for message:', msg);
                              handleDeleteMessage(msg._id);
                            }}
                            className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Delete message"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="bg-white rounded-lg px-4 py-2 shadow text-gray-800">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2 mt-auto">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg bg-white"
                />
                <button
                  onClick={handleSend}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Send
                </button>
              </div>
            </>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="flex-1 overflow-y-auto">
              {membersLoading ? (
                <div className="text-center py-8 text-gray-500">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No members found.</div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <img
                        src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        {member.studentId && (
                          <div className="text-xs text-gray-400">ID: {member.studentId}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizerClubChat; 