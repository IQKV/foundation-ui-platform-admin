export interface Notification {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string | null;
  payload: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}
