import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const NotificationContext = createContext(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

const SOCKET_URL = import.meta.env.VITE_API_URL;
const socket = io(import.meta.env.VITE_API_URL);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('newClubMessage', (msg) => {
      setNotifications((prev) => [
        {
          clubId: msg.clubId || '',
          clubName: msg.clubName || '',
          senderName: msg.user?.name || 'Someone',
          text: msg.text,
          timestamp: msg.timestamp,
        },
        ...prev.slice(0, 9)
      ]);
    });
    return () => {
      socket.off('newClubMessage');
    };
  }, []);

  const clearNotifications = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{ notifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}
