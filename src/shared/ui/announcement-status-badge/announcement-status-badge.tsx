import { Badge } from "@mantine/core";
import { t } from "@lingui/core/macro";
import type { SiteAnnouncementStatus } from "@/shared/api";

function getStatusConfig(status: SiteAnnouncementStatus): { color: string; label: string } {
  const map: Record<SiteAnnouncementStatus, { color: string; label: string }> = {
    DRAFT: { color: "gray", label: t`Draft` },
    PENDING: { color: "blue", label: t`Pending` },
    PUBLISHING: { color: "violet", label: t`Publishing` },
    PUBLISHED: { color: "green", label: t`Published` },
    FAILED: { color: "red", label: t`Failed` },
  };
  return map[status] ?? { color: "gray", label: status };
}

interface AnnouncementStatusBadgeProps {
  status: SiteAnnouncementStatus;
}

export function AnnouncementStatusBadge({ status }: AnnouncementStatusBadgeProps) {
  const config = getStatusConfig(status);
  return (
    <Badge color={config.color} variant="light" size="sm">
      {config.label}
    </Badge>
  );
}
