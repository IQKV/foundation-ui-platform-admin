import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/master-venue")({
  component: () => <Outlet />,
});
