"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  dbId?: string;        // MongoDB _id for DB-sourced notifications
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'mission' | 'join' | 'alert';
}

interface NotificationState {
  notifications: Notification[];
  /** DB notification IDs already ingested into local store (avoids duplicates on re-poll) */
  ingestedDbIds: string[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  addDbNotification: (notification: { _id: string; title: string; message: string; type: string }) => void;
  hasIngested: (dbId: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          title: 'System Active',
          message: 'Crisis Connect orchestration engine is online and monitoring nodes.',
          time: 'Just now',
          read: false,
          type: 'alert'
        }
      ],
      ingestedDbIds: [],
      addNotification: (notif) => set((state) => ({
        notifications: [
          {
            ...notif,
            id: Math.random().toString(36).substring(7),
            time: 'Just now',
            read: false
          },
          ...state.notifications
        ]
      })),
      addDbNotification: (notif) => {
        const state = get();
        // Skip if already ingested
        if (state.ingestedDbIds.includes(notif._id)) return;
        set({
          ingestedDbIds: [...state.ingestedDbIds, notif._id],
          notifications: [
            {
              id: Math.random().toString(36).substring(7),
              dbId: notif._id,
              title: notif.title,
              message: notif.message,
              type: (notif.type as any) || 'alert',
              time: 'Just now',
              read: false
            },
            ...state.notifications
          ]
        });
      },
      hasIngested: (dbId) => get().ingestedDbIds.includes(dbId),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      clearNotifications: () => set({ notifications: [], ingestedDbIds: [] })
    }),
    {
      name: 'notification-storage'
    }
  )
);
