import type { Addon } from "@/app/addons/types";
import { IconNotes } from "@tabler/icons-react";
// ── Addon-local imports only ──────────────────────────────────────────────────
import { platformNotesApi } from "./api/platform-notes-api";
import { SampleMetricsWidget } from "./ui/sample-metrics-widget";
import { SamplePage } from "./ui/sample-page";

/**
 * platform-health-notes addon
 *
 * Reference implementation covering the full addon capability set:
 *
 *   Isolation  — the addon owns its own API module (api/platform-notes-api.ts).
 *                The host's httpClient is injected once at initialize() time via
 *                AddonContext, so the addon inherits auth interceptors and baseURL
 *                without importing anything from @/shared/*.
 *
 *   Routing    — lazy page route at /admin/addons/sample
 *   Navigation — sidebar nav item injected via NavigationExtensionPoint
 *   Widget     — dashboard widget registered via WidgetExtensionPoint
 *   Backend    — GET|POST|PUT|PATCH|DELETE /api/v1/iam/admin/platform-notes
 *                (PLATFORM_ADMIN required; JWT attached by the host's interceptor)
 *   Data       — TanStack Query: useQuery for fetching, cache invalidation on mutate
 *   Forms      — Mantine useForm + Zod schema validation
 *   Mutations  — useMutation + Mantine notifications on success/error
 *   Tabs       — Mantine Tabs (Notes list + Add note)
 *   Table      — paginated, filterable table with skeleton + empty state
 *   Modal      — edit form in a modal with pre-populated data
 */
export default {
  manifest: {
    id: "platform-health-notes",
    name: "Platform Health Notes",
    version: "2.0.0",
    description:
      "Reference addon demonstrating routing, tabs, forms, validation, data fetching, " +
      "mutations, and a real PLATFORM_ADMIN backend API — with a fully isolated API layer.",
    author: "IQKV Foundation Team",
    permissions: {
      roles: ["PLATFORM_ADMIN"],
    },
  },

  initialize: ({ httpClient, extensions }) => {
    // ── Wire the addon's own API client ──────────────────────────────────
    // The host passes its configured AxiosInstance (with auth + baseURL interceptors).
    // After this call, all platformNotesApi.* functions are ready to use.
    platformNotesApi.init(httpClient);

    // ── Navigation item ──────────────────────────────────────────────────
    extensions.navigation.registerNavItem({
      id: "platform-health-notes-nav",
      label: "Health Notes",
      to: "/admin/addons/sample",
      icon: ({ size }) => <IconNotes size={size} />,
      section: "workspace",
      order: 50,
    });

    // ── Dashboard widget ─────────────────────────────────────────────────
    extensions.widgets.registerWidget({
      id: "platform-health-notes-widget",
      component: SampleMetricsWidget,
      location: "dashboard",
      order: 30,
    });
  },

  routes: [
    {
      path: "/admin/addons/sample",
      component: async () => ({ default: SamplePage }),
      auth: true,
    },
  ],
} satisfies Addon;
