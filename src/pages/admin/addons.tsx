import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo, useState, useEffect, Suspense } from "react";
import { Container, Stack, Text, Loader } from "@mantine/core";
import { PageHeader } from "@/shared/ui";
import { PageTitle } from "@/shared/lib/page-title";
import { Trans, useLingui } from "@lingui/react/macro";
import { addonRegistry } from "@/app/addons";

export const Route = createFileRoute("/admin/addons")({
  component: AddonsRoot,
});

function AddonsRoot() {
  const { t } = useLingui();
  // We need a way to get the current path, use useRouterState
  // Wait, no, useMatch or useParams? Wait, let's use a catch-all route!
  // Let's create a sub-route with $!
  // Wait, let's create /admin/addons/$addonPath.tsx instead!
  return <Outlet />;
}

// Now create the catch-all route
export const AddonCatchAllRoute = ({}) => {
  // Wait no, let's create /src/pages/admin/addons/$addonPath.tsx
  return null;
};
