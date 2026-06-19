import { t } from "@lingui/core/macro";
import type { SiteAnnouncementStatus } from "@/shared/api";
import { z } from "zod";

export function buildAnnouncementTranslationSchema() {
  return z.object({
    locale: z.string().min(1, t`Locale is required`),
    title: z.string().min(1, t`Title is required`),
    message: z.string().min(1, t`Message is required`),
  });
}

export function buildAnnouncementSchema() {
  return z.object({
    type: z.string().min(1, t`Type is required`),
    status: z.string() as z.ZodType<SiteAnnouncementStatus>,
    translations: z
      .array(buildAnnouncementTranslationSchema())
      .min(1, t`At least one translation is required`),
  });
}

export type AnnouncementTranslationFormValues = z.infer<
  ReturnType<typeof buildAnnouncementTranslationSchema>
>;

export type AnnouncementFormValues = z.infer<ReturnType<typeof buildAnnouncementSchema>>;

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

export const SUPPORTED_LOCALES = [{ value: "en-US", label: "English (en-US)" }];
