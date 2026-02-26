import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '', location: '', sportType: '' });
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(null);

  const token = localStorage.getItem('uniplay_organizer_token');

  const fetchOrganizer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/organizer/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrganizer(data);
      }
    } catch (err) { }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/organizer/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setEvents(data);
      else setError(data.error || 'Failed to fetch events');
    } catch {
      setError('Failed to fetch events');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizer();
    fetchEvents();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ title: '', date: '', time: '', description: '', location: '', sportType: '' });
    setShowForm(true);
  };

  const handleEdit = (event) => {
    setEditing(event);
    setForm({ ...event });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await fetch(`${API_URL}/api/organizer/events/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchEvents();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await fetch(`${API_URL}/api/organizer/events/${editing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
    } else {
      await fetch(`${API_URL}/api/organizer/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
    }
    setShowForm(false);
    fetchEvents();
  };

  const handleViewParticipants = async (id) => {
    setShowParticipants(id);
    const res = await fetch(`${API_URL}/api/organizer/events/${id}/participants`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setParticipants(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('uniplay_organizer_token');
    window.location.href = '/organizer/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-3xl shadow-xl p-10 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          <div className="z-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow">Organizer Dashboard</h1>
            {organizer && (
              <p className="text-white/90 text-lg mt-2">Welcome back, {organizer.name}!</p>
            )}
          </div>
          <div className="flex gap-4 z-10 flex-wrap">
            <Link to="/organizer/clubs" className="bg-white/90 text-blue-700 px-6 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-100 transition-all">
              🏅 Browse Clubs
            </Link>
            <button onClick={handleAdd} className="bg-white/90 text-blue-700 px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-100 transition-all">
              ➕ Add Event
            </button>
            <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-red-600 transition-all">
              🚪 Logout
            </button>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl z-0" />
          <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-white/10 rounded-full blur-2xl z-0" />
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📅</div>
              <div>
                <div className="text-2xl font-bold text-blue-900">{events.length}</div>
                <div className="text-blue-600 font-semibold">Total Events</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="text-3xl">👥</div>
              <div>
                <div className="text-2xl font-bold text-purple-900">{participants.length}</div>
                <div className="text-purple-600 font-semibold">Active Participants</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <div className="text-2xl font-bold text-orange-900">{organizer?.clubs?.length || 0}</div>
                <div className="text-orange-600 font-semibold">Clubs Joined</div>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Link to="/organizer/clubs" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all group">
            <div className="text-center">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏅</div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Browse Clubs</h3>
              <p className="text-blue-600">Join clubs and participate in discussions</p>
            </div>
          </Link>
          <Link to="/organizer/clubs" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all group">
            <div className="text-center">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💬</div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">Club Chat</h3>
              <p className="text-purple-600">Chat with club members</p>
            </div>
          </Link>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-orange-900 mb-2">Event Management</h3>
              <p className="text-orange-600">Create and manage your events</p>
            </div>
          </div>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-lg shadow">{error}</div>}
        {/* Events Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Your Events</h2>
          {loading ? (
            <div className="text-center py-16 text-xl text-blue-400 font-bold">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <div className="text-2xl font-bold text-blue-900 mb-2">No Events Yet</div>
              <div className="text-blue-600 mb-6">Create your first event to get started!</div>
              <button onClick={handleAdd} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all">
                Create Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(event => (
                <div key={event._id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-100 p-6">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{event.title}</h3>
                  <div className="text-blue-600 mb-1 font-semibold">{event.sportType}</div>
                  <div className="text-blue-700 mb-1">📅 {event.date} at {event.time}</div>
                  <div className="text-blue-700 mb-2">📍 {event.location}</div>
                  <div className="text-blue-800 mb-4 text-sm">{event.description}</div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleEdit(event)} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-all">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(event._id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all">
                      🗑️ Delete
                    </button>
                    <button onClick={() => handleViewParticipants(event._id)} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-all">
                      👥 Participants
                    </button>
                  </div>
                  {showParticipants === event._id && (
                    <div className="mt-4 bg-white rounded-xl p-4 shadow-inner border border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-2">📋 Participants</h4>
                      {participants.length === 0 ? (
                        <div className="text-blue-400">No participants yet.</div>
                      ) : (
                        <ul className="space-y-1">
                          {participants.map((p) => (
                            <li key={p._id} className="text-blue-900 font-semibold">
                              👤 {p.name} <span className="text-blue-400">({p.email})</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Event Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-blue-400 hover:text-blue-700 text-3xl font-bold">&times;</button>
              <h2 className="text-2xl font-bold text-blue-900 mb-6">{editing ? 'Edit Event' : 'Create New Event'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-bold text-blue-900 mb-1">Event Title</label>
                  <input name="title" type="text" value={form.title} onChange={handleFormChange} required className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-blue-900" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-base font-bold text-blue-900 mb-1">Date</label>
                    <input name="date" type="date" value={form.date} onChange={handleFormChange} required className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-blue-900" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-base font-bold text-blue-900 mb-1">Time</label>
                    <input name="time" type="time" value={form.time} onChange={handleFormChange} required className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-blue-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-base font-bold text-blue-900 mb-1">Location</label>
                  <input name="location" type="text" value={form.location} onChange={handleFormChange} required className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-blue-900" />
                </div>
                <div>
                  <label className="block text-base font-bold text-blue-900 mb-1">Sport Type</label>
                  <input name="sportType" type="text" value={form.sportType} onChange={handleFormChange} required className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-blue-900" />
                </div>
                <div>
                  <label className="block text-base font-bold text-blue-900 mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange} required rows={3} className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-blue-900" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
                    {editing ? 'Update Event' : 'Create Event'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 