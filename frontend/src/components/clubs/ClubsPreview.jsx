import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555';

function ClubsPreview() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('uniplay_token');
        const res = await fetch(`${API_URL}/api/clubs?search=`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch clubs');
        const data = await res.json();
        setClubs(data.slice(0, 3)); // Show only first 3 clubs
      } catch (err) {
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>🏅</span> Clubs
        </h2>
        <Link to="/clubs" className="text-blue-600 font-semibold hover:underline">See all clubs</Link>
      </div>
      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading clubs...</div>
      ) : clubs.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No clubs found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {clubs.map(club => (
            <div key={club._id} className="bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 rounded-xl p-4 flex flex-col items-center shadow">
              <div className="text-4xl mb-2">{club.icon}</div>
              <div className="text-lg font-semibold text-gray-800 mb-1">{club.name}</div>
              <div className="text-xs text-gray-500 mb-2">{club.membersCount} Members</div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${club.joined ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                {club.joined ? 'Joined' : 'Join'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClubsPreview; 