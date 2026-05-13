import { useEffect } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Group,
  Button,
  Text,
  NumberInput,
  Textarea,
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { isAxiosError } from "axios";
import { Trans, useLingui } from "@lingui/react/macro";
import { billingApi } from "@/shared/api";
import type { PlanRequest } from "@/shared/api";

export interface CreatePlanFormValues {
  planCode: string;
  displayName: string;
  billingPeriod: string;
  priceMinor: number;
  currency: string;
  featureSet: string;
  scope: string;
  active: boolean;
}

interface CreatePlanModalProps {
  opened: boolean;
  onClose: () => void;
}

function toRequest(values: CreatePlanFormValues): PlanRequest {
  return {
    planCode: values.planCode.trim(),
    displayName: values.displayName.trim(),
    billingPeriod: values.billingPeriod,
    priceMinor: values.priceMinor,
    currency: values.currency.trim().toUpperCase() || "USD",
    featureSet: values.featureSet.trim() ? values.featureSet.trim() : null,
    scope: values.scope,
    active: values.active,
  };
}

export function CreatePlanModal({ opened, onClose }: CreatePlanModalProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const form = useForm<CreatePlanFormValues>({
    initialValues: {
      planCode: "",
      displayName: "",
      billingPeriod: "MONTHLY",
      priceMinor: 1000,
      currency: "USD",
      featureSet: "",
      scope: "TENANT",
      active: true,
    },
    validate: {
      planCode: (v) => (v.trim().length < 1 ? t`Plan code is required` : null),
      displayName: (v) => (v.trim().length < 1 ? t`Display name is required` : null),
      priceMinor: (v) =>
        typeof v !== "number" || !Number.isFinite(v) || v < 1
          ? t`Enter a positive price (minor units, e.g. cents)`
          : null,
      currency: (v) => (v.trim().length !== 3 ? t`Currency must be a 3-letter ISO code` : null),
    },
  });

  useEffect(() => {
    if (!opened) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const mutation = useMutation({
    mutationFn: (body: PlanRequest) => billingApi.createPlan(body),
    onSuccess: () => {
      notifications.show({
        title: "Plan created",
        message: "The plan has been added to the catalog.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
      form.reset();
      onClose();
    },
    onError: (err: unknown) => {
      if (isAxiosError(err) && err.response?.status === 409) {
        notifications.show({
          title: "Duplicate plan code",
          message: "A plan with this code already exists.",
          color: "red",
          icon: createElement(IconX, { size: 16 }),
        });
        return;
      }
      notifications.show({
        title: "Create failed",
        message: "Could not create the plan. Check the form and try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });

  const handleClose = () => {
    if (!mutation.isPending) {
      form.reset();
      mutation.reset();
      onClose();
    }
  };

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(toRequest(values));
  });

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="md">
          <Trans>New plan</Trans>
        </Text>
      }
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t`Plan code`}
            placeholder={t`e.g. pro-monthly`}
            description={t`Unique identifier; use lowercase letters, numbers, and hyphens.`}
            {...form.getInputProps("planCode")}
          />
          <TextInput label={t`Display name`} {...form.getInputProps("displayName")} />
          <Select
            label={t`Billing period`}
            data={[
              { value: "MONTHLY", label: t`Monthly` },
              { value: "ANNUAL", label: t`Annual` },
            ]}
            {...form.getInputProps("billingPeriod")}
          />
          <NumberInput
            label={t`Price (minor units)`}
            description={t`Smallest currency unit (e.g. cents for USD).`}
            min={1}
            {...form.getInputProps("priceMinor")}
          />
          <TextInput
            label={t`Currency`}
            placeholder="USD"
            maxLength={3}
            {...form.getInputProps("currency")}
          />
          <Select
            label={t`Scope`}
            data={[
              { value: "TENANT", label: t`Tenant` },
              { value: "USER", label: t`User` },
            ]}
            {...form.getInputProps("scope")}
          />
          <Textarea
            label={t`Feature set (JSON)`}
            placeholder='{"seats": 10}'
            minRows={3}
            autosize
            {...form.getInputProps("featureSet")}
          />
          <Switch label={t`Active`} {...form.getInputProps("active", { type: "checkbox" })} />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              <Trans>Create plan</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
