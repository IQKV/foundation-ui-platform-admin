import { Badge } from "@mantine/core";

export type GatewayType = "STRIPE" | "LEMON_SQUEEZY";

function getGatewayConfig(type: string): { color: string; label: string } {
  const map: Record<GatewayType, { color: string; label: string }> = {
    STRIPE: { color: "violet", label: "Stripe" },
    LEMON_SQUEEZY: { color: "yellow", label: "Lemon Squeezy" },
  };
  return map[type as GatewayType] ?? { color: "gray", label: type };
}

interface GatewayTypeBadgeProps {
  gatewayType: string;
}

export function GatewayTypeBadge({ gatewayType }: GatewayTypeBadgeProps) {
  const config = getGatewayConfig(gatewayType);
  return (
    <Badge color={config.color} variant="light" size="sm">
      {config.label}
    </Badge>
  );
}
