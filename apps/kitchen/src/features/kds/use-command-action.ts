import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client.js";
import { useAuth } from "../../app/auth-context.js";
import { useSession } from "../../app/session-context.js";
import type { ApiData, Command } from "../../lib/kitchen-types.js";

// The cook-tier transitions of the SPEC-110 Command state machine, mapped to
// their command endpoints. Manager-tier moves (transfer, reprioritize,
// rollback, station management) are intentionally NOT exposed here.
export type CommandAction =
  | "claim"
  | "release"
  | "start"
  | "hold"
  | "resume"
  | "mark-ready"
  | "complete-handoff";

interface ActionVars {
  commandId: string;
  action: CommandAction;
  reason?: string;
}

export function useCommandAction(queryKey: unknown[]) {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useSession();
  const queryClient = useQueryClient();

  return useMutation<Command, Error, ActionVars>({
    mutationFn: async ({ commandId, action, reason }) => {
      const res = await apiRequest<ApiData<Command>>(
        `/v1/kitchen/commands/${commandId}/${action}`,
        {
          accessToken: accessToken!,
          tenantId: selectedTenantId!,
          method: "POST",
          ...(reason !== undefined ? { body: { reason } } : {}),
        },
      );
      return res.data;
    },
    // Refetch the queue so the card reflects its new status / drops off if
    // terminal. Polling would catch up anyway; this makes taps feel instant.
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
