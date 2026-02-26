import React from 'react';
import { useParams } from 'react-router-dom';
import OrganizerClubChat from './OrganizerClubChat';

const API_URL = import.meta.env.VITE_API_URL;

function OrganizerClubChatWrapper() {
  const { clubId } = useParams();
  const [clubDetails, setClubDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchClubDetails = async () => {
      if (!clubId) return;
      try {
        const token = localStorage.getItem('uniplay_organizer_token');
        const response = await fetch(`${API_URL}/api/clubs/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setClubDetails({ name: data.name, icon: data.icon });
        }
      } catch (error) {
        console.error('Error fetching club details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClubDetails();
  }, [clubId]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading club details...</div>;
  if (!clubDetails) return <div className="text-center py-20 text-red-500">Club not found</div>;

  return <OrganizerClubChat clubId={clubId} clubName={clubDetails.name} clubIcon={clubDetails.icon} />;
}

export default OrganizerClubChatWrapper; 