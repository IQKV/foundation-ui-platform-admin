export type AnnouncementStatus = "DRAFT" | "PENDING" | "PUBLISHING" | "PUBLISHED" | "FAILED";

export interface AnnouncementTranslation {
  locale: string;
  title: string;
  message: string;
}

export interface Announcement {
  id: string;
  type: string;
  status: AnnouncementStatus;
  createdAt: string;
  translations: AnnouncementTranslation[];
}
