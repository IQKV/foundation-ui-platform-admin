import { t } from "@lingui/core/macro";
import type { SiteAnnouncementStatus } from "@/shared/api";

export interface AnnouncementTranslationFormValues {
  locale: string;
  title: string;
  message: string;
}

export interface AnnouncementFormValues {
  type: string;
  status: SiteAnnouncementStatus;
  translations: AnnouncementTranslationFormValues[];
}

export const ANNOUNCEMENT_TYPE_OPTIONS = [
  "INFO",
  "WARNING",
  "MAINTENANCE",
  "FEATURE",
  "SECURITY",
] as const;

export type AnnouncementType = (typeof ANNOUNCEMENT_TYPE_OPTIONS)[number];

export function getTypeOptions(): { value: string; label: string }[] {
  return [
    { value: "INFO", label: t`Info` },
    { value: "WARNING", label: t`Warning` },
    { value: "MAINTENANCE", label: t`Maintenance` },
    { value: "FEATURE", label: t`Feature` },
    { value: "SECURITY", label: t`Security` },
  ];
}

export function getStatusOptions(): { value: SiteAnnouncementStatus; label: string }[] {
  return [
    { value: "DRAFT", label: t`Draft` },
    { value: "FAILED", label: t`Failed` },
  ];
}

export const SUPPORTED_LOCALES = [
  { value: "en-US", label: "English (en-US)" },
  { value: "de-DE", label: "German (de-DE)" },
  { value: "fr-FR", label: "French (fr-FR)" },
  { value: "es-ES", label: "Spanish (es-ES)" },
  { value: "pt-BR", label: "Portuguese (pt-BR)" },
  { value: "ja-JP", label: "Japanese (ja-JP)" },
  { value: "zh-CN", label: "Chinese Simplified (zh-CN)" },
];
