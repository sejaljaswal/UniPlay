import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

const API_URL = import.meta.env.VITE_API_URL;

export function AppProvider({ children }) {
  const [games, setGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [messages, setMessages] = useState([]);

  const fetchGames = async () => {
    const res = await fetch(`${API_URL}/api/games`);
    const data = await res.json();
    setGames(data);
  };

  const fetchLeaderboard = async () => {
    const res = await fetch(`${API_URL}/api/leaderboard`);
    const data = await res.json();
    setLeaderboard(data);
  };

  const fetchMessages = async (gameId) => {
    const res = await fetch(`${API_URL}/api/messages/${gameId}`);
    const data = await res.json();
    setMessages(data);
  };

  const joinGame = async (gameId, userId) => {
    const token = localStorage.getItem('uniplay_token');
    await fetch(`${API_URL}/api/games/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });
    await fetchGames();
  };

  const sendMessage = async (gameId, userId, userName, userAvatar, message) => {
    const token = localStorage.getItem('uniplay_token');
    await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ gameId, message })
    });
    await fetchMessages(gameId);
  };

  const getGameMessages = (gameId) => {
    return messages.filter(msg => msg.gameId === gameId);
  };

  useEffect(() => {
    fetchGames();
    fetchLeaderboard();
  }, []);

  const value = {
    games,
    leaderboard,
    messages,
    fetchGames,
    fetchLeaderboard,
    fetchMessages,
    joinGame,
    sendMessage,
    getGameMessages
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
} 