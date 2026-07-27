import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client.js";
import { useAuth } from "./auth-context.js";
import { useSession } from "./session-context.js";
import type { ApiData, Station } from "../lib/kitchen-types.js";

// Which Station this physical device represents. A kitchen tablet is usually
// mounted at one station for a whole shift, so the choice is sticky in
// localStorage and survives reloads. The list is scoped to the active branch.

interface StationState {
  stations: Station[];
  isLoading: boolean;
  error?: Error;
  selectedStationId: string | null;
  selectedStation: Station | null;
  selectStation: (stationId: string) => void;
  clearStation: () => void;
}

const StationContext = createContext<StationState | null>(null);

const STATION_KEY = "maitre.kitchen.selectedStationId";

export function StationProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const { selectedTenantId, selectedBranchId } = useSession();
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    () => localStorage.getItem(STATION_KEY),
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["stations", selectedTenantId, selectedBranchId],
    queryFn: () =>
      apiRequest<ApiData<Station[]>>(
        `/v1/branches/${selectedBranchId}/kitchen/stations`,
        { accessToken: accessToken!, tenantId: selectedTenantId! },
      ),
    enabled: Boolean(accessToken && selectedTenantId && selectedBranchId),
  });

  const stations = (data?.data ?? []).filter((s) => s.status === "ACTIVE");
  const resolvedStationId =
    selectedStationId ?? (stations.length === 1 ? stations[0]!.id : null);

  // Drop a stale selection if the persisted station is not in the current
  // branch's active list (e.g. the branch was switched, or it was deactivated).
  useEffect(() => {
    if (!data) return;
    if (selectedStationId && !stations.some((s) => s.id === selectedStationId)) {
      localStorage.removeItem(STATION_KEY);
      setSelectedStationId(null);
    }
  }, [data, selectedStationId, stations]);

  // Keep the kiosk "sticky" even when the station was auto-resolved because
  // there is only one active option in the branch.
  useEffect(() => {
    if (!data) return;
    if (!selectedStationId && stations.length === 1) {
      localStorage.setItem(STATION_KEY, stations[0]!.id);
      setSelectedStationId(stations[0]!.id);
    }
  }, [data, selectedStationId, stations]);

  function selectStation(stationId: string) {
    localStorage.setItem(STATION_KEY, stationId);
    setSelectedStationId(stationId);
  }

  function clearStation() {
    localStorage.removeItem(STATION_KEY);
    setSelectedStationId(null);
  }

  const selectedStation = stations.find((s) => s.id === resolvedStationId) ?? null;

  return (
    <StationContext.Provider
      value={{
        stations,
        isLoading,
        ...(error ? { error: error as Error } : {}),
        selectedStationId: selectedStation ? resolvedStationId : null,
        selectedStation,
        selectStation,
        clearStation,
      }}
    >
      {children}
    </StationContext.Provider>
  );
}

export function useStation(): StationState {
  const ctx = useContext(StationContext);
  if (!ctx) throw new Error("useStation must be used within StationProvider");
  return ctx;
}
