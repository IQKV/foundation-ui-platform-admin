import { createElement } from "react";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { catalogApi } from "@/shared/api";
import { setFieldValue } from "./metadata-utils";

export interface VenueMetadataChange {
  key: string;
  value: unknown;
}

export interface SaveVenueMetadataPayload {
  base: Record<string, unknown>;
  changes: VenueMetadataChange[];
}

interface UseUpdateVenueMetadataOptions {
  venueId: string;
  sectionLabel: string;
  onSuccess: () => void;
}

/**
 * Saves a single metadata section by merging its changed fields into the
 * current document and PATCHing the full metadata string.
 *
 * shortcut: last write wins — concurrent section edits from two operators can
 * clobber each other. Acceptable for a single-editor admin console.
 */
export function useUpdateVenueMetadata({
  venueId,
  sectionLabel,
  onSuccess,
}: UseUpdateVenueMetadataOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ base, changes }: SaveVenueMetadataPayload) => {
      const next = changes.reduce(
        (acc, change) => setFieldValue(acc, change.key, change.value),
        base,
      );
      return catalogApi.patchMasterVenue(venueId, { metadata: JSON.stringify(next) });
    },
    onSuccess: () => {
      notifications.show({
        title: "Metadata updated",
        message: `${sectionLabel} saved.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "master-venues"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "master-venue", venueId] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not save the metadata. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
