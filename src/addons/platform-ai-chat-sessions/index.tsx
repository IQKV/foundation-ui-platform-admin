import type { Addon } from "@/app/addons/types";
import { IconMessageChatbot } from "@tabler/icons-react";
import { vendorName } from "@/app/config/runtime-env";
import { aiChatSessionsApi } from "./api/ai-chat-sessions-api";
import { AiChatSessionsPage } from "./ui/ai-chat-sessions";

/**
 * platform-ai-chat-sessions addon
 *
 * Read-only PLATFORM_ADMIN oversight of all AI chat sessions across users.
 * No mutations — admin can inspect who is using the AI chat feature and what models are used.
 */
export default {
  manifest: {
    id: "platform-ai-chat-sessions",
    name: "AI Chat Sessions",
    version: "1.0.0",
    description:
      "Read-only oversight of all AI chat sessions across users. " +
      "Shows session title, user, model, and timestamps. PLATFORM_ADMIN only.",
    author: vendorName,
    permissions: {
      roles: ["PLATFORM_ADMIN"],
    },
  },

  initialize: ({ httpClient, extensions }) => {
    aiChatSessionsApi.init(httpClient);

    extensions.navigation.registerNavItem({
      id: "platform-ai-chat-sessions-nav",
      label: "AI Chat Sessions",
      to: "/admin/addons/ai-chat-sessions",
      icon: ({ size }) => <IconMessageChatbot size={size} />,
      section: "workspace",
      order: 60,
    });
  },

  routes: [
    {
      path: "/admin/addons/ai-chat-sessions",
      component: async () => ({ default: AiChatSessionsPage }),
      auth: true,
    },
  ],
} satisfies Addon;
