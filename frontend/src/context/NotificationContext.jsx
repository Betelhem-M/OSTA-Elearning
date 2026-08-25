import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiRequest } from "@services/api";
import { useAuth } from "@context/AuthContext";

const NotificationContext =
  createContext(null);

export function NotificationProvider({
  children,
}) {
  const {
    token,
    isAuthenticated,
  } = useAuth();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            !Boolean(
              item.is_read
            )
        ).length,
      [notifications]
    );

  async function loadNotifications() {
    if (
      !isAuthenticated ||
      !token
    ) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);

      const data =
        await apiRequest(
          "/notifications/my",
          {
            token,
          }
        );

      setNotifications(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Notification context error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function markNotificationRead(
    id
  ) {
    await apiRequest(
      `/notifications/${id}/read`,
      {
        token,
        method: "PUT",
      }
    );

    setNotifications(
      (previous) =>
        previous.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  is_read: 1,
                }
              : item
        )
    );
  }

  async function markAllNotificationsRead() {
    await apiRequest(
      "/notifications/my/read-all",
      {
        token,
        method: "PUT",
      }
    );

    setNotifications(
      (previous) =>
        previous.map(
          (item) => ({
            ...item,
            is_read: 1,
          })
        )
    );
  }

  async function removeNotification(
    id
  ) {
    await apiRequest(
      `/notifications/${id}`,
      {
        token,
        method: "DELETE",
      }
    );

    setNotifications(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  useEffect(() => {
    loadNotifications();

    if (
      !isAuthenticated ||
      !token
    ) {
      return undefined;
    }

    const timer =
      setInterval(
        loadNotifications,
        30000
      );

    return () =>
      clearInterval(timer);
  }, [
    isAuthenticated,
    token,
  ]);

  useEffect(() => {
    function handleRefresh() {
      loadNotifications();
    }

    window.addEventListener(
      "osta-notifications-refresh",
      handleRefresh
    );

    return () =>
      window.removeEventListener(
        "osta-notifications-refresh",
        handleRefresh
      );
  }, [
    isAuthenticated,
    token,
  ]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        loadNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context =
    useContext(
      NotificationContext
    );

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }

  return context;
}