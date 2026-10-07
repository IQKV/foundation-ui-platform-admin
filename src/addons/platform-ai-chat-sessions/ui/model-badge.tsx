import { Badge } from "@mantine/core";
import { MODEL_COLORS } from "../model";

interface ModelBadgeProps {
  model: string;
}

export function ModelBadge({ model }: ModelBadgeProps) {
  const color = MODEL_COLORS[model] ?? "gray";
  return (
    <Badge size="xs" variant="light" color={color}>
      {model}
    </Badge>
  );
}
