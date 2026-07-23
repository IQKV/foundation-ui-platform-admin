import { Badge } from "@mantine/core";
import type { PlatformNoteStatus } from "../types";
import { STATUS_COLORS } from "../model";

interface Props {
  status: PlatformNoteStatus;
}

export function NoteStatusBadge({ status }: Props) {
  return (
    <Badge color={STATUS_COLORS[status] ?? "gray"} variant="dot" size="sm">
      {status}
    </Badge>
  );
}
