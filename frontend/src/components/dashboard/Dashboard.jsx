import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  Trophy,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Users2,
  Calendar,
  UserPlus,
  UserMinus,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555';

function Dashboard() {
  const { user, refreshUser } = useAuth();
  const { games } = useApp();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [enrollingEvents, setEnrollingEvents] = useState(new Set());
  const [clubs, setClubs] = useState([]);
  const [clubsLoading, setClubsLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      setClubsLoading(true);
      try {
        const token = localStorage.getItem('uniplay_token');
        const res = await fetch(`${API_URL}/api/clubs?search=`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch clubs');
        const data = await res.json();
        setClubs(data);
      } catch (err) {
        setClubs([]);
      } finally {
        setClubsLoading(false);
      }
    };
    fetchClubs();
  }, []);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      setEventsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/organizer/events/public`);
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setUpcomingEvents(data);
      } catch (err) {
        setUpcomingEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchUpcomingEvents();
  }, []);

  const handleEnroll = async (eventId) => {
    const token = localStorage.getItem('uniplay_token');
    if (!token) return;
    setEnrollingEvents(prev => new Set(prev).add(eventId));
    try {
      const res = await fetch(`${API_URL}/api/organizer/events/${eventId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updatedEvent = await res.json();
        setUpcomingEvents(prev => prev.map(event => event._id === eventId ? updatedEvent : event));
        await refreshUser();
      }
    } catch (err) { } finally {
      setEnrollingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleUnenroll = async (eventId) => {
    const token = localStorage.getItem('uniplay_token');
    if (!token) return;
    setEnrollingEvents(prev => new Set(prev).add(eventId));
    try {
      const res = await fetch(`${API_URL}/api/organizer/events/${eventId}/enroll`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updatedEvent = await res.json();
        setUpcomingEvents(prev => prev.map(event => event._id === eventId ? updatedEvent : event));
        await refreshUser();
      }
    } catch (err) { } finally {
      setEnrollingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const isEnrolled = (event) => {
    return event.participants.some(participant => participant._id === user?.id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (clubsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const joinedClubs = clubs.filter(club => club.joined);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-indigo-100">Ready to dominate the sports scene today?</p>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Trophy className="h-6 w-6 text-yellow-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-100">Points</p>
              <p className="text-lg font-semibold text-white">{user?.points || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 shadow-lg text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6 text-emerald-200" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-emerald-100">Clubs Joined</p>
              <p className="text-lg font-semibold text-white">{joinedClubs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 shadow-lg text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-violet-200" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-violet-100">Rank</p>
              <p className="text-lg font-semibold text-white">{user?.rank || '-'}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl p-4 shadow-lg text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Clock className="h-6 w-6 text-orange-200" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-100">Upcoming Events</p>
              <p className="text-lg font-semibold text-white">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Clubs Section */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users2 className="w-7 h-7 text-blue-500" /> Clubs
          </h2>
          <Link to="/clubs" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
            See all clubs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {clubs.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No clubs found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {joinedClubs.slice(0, 3).map(club => (
              <div key={club._id} className="bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 rounded-xl p-4 flex flex-col items-center shadow">
                <div className="text-4xl mb-2">{club.icon}</div>
                <div className="text-lg font-semibold text-gray-800 mb-1">{club.name}</div>
                <div className="text-xs text-gray-500 mb-2">{club.membersCount} Members</div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Joined</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Upcoming Events Section */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-purple-500" /> Upcoming Events
          </h2>
        </div>
        {eventsLoading ? (
          <div className="text-gray-500 text-center py-8">Loading events...</div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No upcoming events.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingEvents.map(event => (
              <div key={event._id} className="bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 rounded-xl p-6 shadow flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-lg text-gray-800">{event.title}</span>
                </div>
                <div className="text-gray-600 mb-2">{event.description}</div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span><Clock className="inline w-4 h-4 mr-1" /> {formatDate(event.date)} {formatTime(event.time)}</span>
                  <span><Users className="inline w-4 h-4 mr-1" /> {event.participants.length} Participants</span>
                  <span><UserPlus className="inline w-4 h-4 mr-1" /> Organizer: {event.organizer.name}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {isEnrolled(event) ? (
                    <button
                      onClick={() => handleUnenroll(event._id)}
                      disabled={enrollingEvents.has(event._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <UserMinus className="w-4 h-4" /> Unenroll
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(event._id)}
                      disabled={enrollingEvents.has(event._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Enroll
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 