import { create } from "zustand";

interface NotificationsReadState {
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
}

export const useNotificationsStore = create<NotificationsReadState>((set) => ({
  readIds: [],
  markRead: (id) => set((s) => (s.readIds.includes(id) ? s : { readIds: [...s.readIds, id] })),
  markAllRead: (ids) => set((s) => ({ readIds: [...new Set([...s.readIds, ...ids])] })),
}));
