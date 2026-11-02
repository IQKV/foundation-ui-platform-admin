import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/master-catalog")({
  component: () => <Outlet />,
});
