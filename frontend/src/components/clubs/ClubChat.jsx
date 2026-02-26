import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { Users, MessageCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(import.meta.env.VITE_API_URL); // Use env var for socket connection

function ClubChat({ clubId, clubName, clubIcon }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'members'
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const token = localStorage.getItem('uniplay_token');
      const res = await fetch(`${API_URL}/api/clubs/${clubId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else {
        toast.error('Failed to fetch club members');
      }
    } catch (err) {
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
        const token = localStorage.getItem('uniplay_token');
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

  const handleSend = () => {
    if (!input.trim()) return;
    try {
      if (!user) {
        toast.error('User not found. Please log in again.');
        return;
      }
      socket.emit('clubChatMessage', {
        clubId,
        userId: user.id,
        text: input,
      });
      setInput('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading chat...</div>;
  if (forbidden) return <div className="text-center py-20 text-red-500">You must join this club to access the chat.</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-white rounded-none shadow-none p-0 flex flex-col">
      <div className="flex items-center gap-3 mb-4 px-8 pt-8">
        <span className="text-3xl">{clubIcon}</span>
        <h2 className="text-2xl font-bold text-gray-800">{clubName} Chat</h2>
      </div>
      {/* Tab Navigation - Always Visible */}
      <div className="flex mb-4 bg-blue-100 p-2 rounded-lg border-2 border-blue-300">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all ${activeTab === 'chat'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-300'
            }`}
        >
          <MessageCircle size={20} />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('members')}
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
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{msg.user.name}</span>
                      <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 mt-1 shadow text-gray-800">
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
  );
}

export default ClubChat; 