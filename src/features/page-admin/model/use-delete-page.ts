import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { cmsApi } from "@/shared/api";

interface UseDeletePageOptions {
  tenantKey: string;
  onSuccess: () => void;
}

export function useDeletePage({ tenantKey, onSuccess }: UseDeletePageOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => cmsApi.deletePage(tenantKey, pageId),
    onSuccess: () => {
      notifications.show({
        title: "Page deleted",
        message: "The CMS page has been deleted.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "cms-pages", tenantKey] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Delete failed",
        message: "Could not delete the page. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
