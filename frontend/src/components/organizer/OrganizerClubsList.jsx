import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555';

function OrganizerClubsList() {
  const [search, setSearch] = useState('');
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchClubs = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('uniplay_organizer_token');
      const res = await fetch(`${API_URL}/api/clubs?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch clubs');
      const data = await res.json();
      setClubs(data);
    } catch (err) {
      setError('Error fetching clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs(search);
  }, [search]);

  const handleToggleJoin = async (club) => {
    setActionLoading(club._id);
    setError('');
    try {
      const token = localStorage.getItem('uniplay_organizer_token');
      const endpoint = club.joined ? `${API_URL}/api/clubs/exit` : `${API_URL}/api/clubs/join`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clubId: club._id }),
      });
      if (!res.ok) throw new Error('Failed to update club membership');
      await fetchClubs(search);
      toast.success(club.joined ? `Exited ${club.name}` : `Joined ${club.name}!`);
    } catch (err) {
      setError('Error updating club membership');
      toast.error('Error updating club membership');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-3xl shadow-xl p-10 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow z-10">🏅 Clubs</h1>
          <Link to="/organizer/dashboard" className="bg-white/90 text-blue-700 px-6 py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-100 transition-all z-10">
            ← Back to Dashboard
          </Link>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl z-0" />
          <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-white/10 rounded-full blur-2xl z-0" />
        </div>
        <input
          type="text"
          placeholder="Search clubs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-8 px-5 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg bg-white"
        />
        {loading ? (
          <div className="text-center text-gray-500 text-xl py-20">Loading clubs...</div>
        ) : error ? (
          <div className="text-center text-red-500 text-xl py-20">{error}</div>
        ) : clubs.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-20">No clubs found 😕</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {clubs.map(club => (
              <div
                key={club._id}
                className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center transition-transform hover:scale-105 border border-gray-100"
              >
                <div className="text-6xl mb-4">{club.icon}</div>
                <div className="text-2xl font-bold text-gray-800 mb-2">{club.name}</div>
                <div className="text-gray-500 mb-4 text-sm">{club.membersCount} Members Joined</div>
                <button
                  onClick={() => handleToggleJoin(club)}
                  disabled={actionLoading === club._id}
                  className={`w-full py-2 rounded-xl font-semibold text-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${club.joined
                      ? 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'}
                    ${actionLoading === club._id ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  {actionLoading === club._id
                    ? (club.joined ? 'Exiting...' : 'Joining...')
                    : club.joined ? 'Exit Club' : 'Join Now'}
                </button>
                {club.joined && (
                  <Link
                    to={`/organizer/clubs/${club._id}`}
                    className="mt-4 w-full py-2 rounded-xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-orange-400 text-white shadow hover:from-purple-600 hover:to-orange-500 transition-all text-center"
                  >
                    💬 Chat
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default OrganizerClubsList; 