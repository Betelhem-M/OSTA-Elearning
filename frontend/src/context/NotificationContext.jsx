import { createContext, useContext, useState } from 'react';
import { initialNotifications } from '@mocks/notifications';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = id =>
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)));

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  const dismiss = id => setNotifications(prev => prev.filter(n => n.id !== id));

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, markAllAsRead, dismiss, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
