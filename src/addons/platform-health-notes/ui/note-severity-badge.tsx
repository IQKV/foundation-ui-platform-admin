import { Badge } from "@mantine/core";
import type { PlatformNoteSeverity } from "../types";
import { SEVERITY_COLORS } from "../model";

interface Props {
  severity: PlatformNoteSeverity;
}

export function NoteSeverityBadge({ severity }: Props) {
  return (
    <Badge color={SEVERITY_COLORS[severity] ?? "gray"} variant="light" size="sm">
      {severity}
    </Badge>
  );
}
