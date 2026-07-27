import type { HTMLAttributes } from "react";
import { getSupabaseClient } from "./supabase.js";

type PrefetchIntentHandlers = Pick<
  HTMLAttributes<HTMLElement>,
  "onMouseEnter" | "onFocus" | "onTouchStart"
>;

let loginExperiencePromise: Promise<void> | null = null;
let reservationCreationPromise: Promise<void> | null = null;
let reservationManagementPromise: Promise<void> | null = null;

export function preloadLoginExperience() {
  loginExperiencePromise ??= Promise.all([
    import("../features/login/login-page.js"),
    getSupabaseClient(),
  ])
    .then(() => undefined)
    .catch(() => undefined);

  return loginExperiencePromise;
}

export function preloadReservationCreationExperience() {
  reservationCreationPromise ??= Promise.all([
    preloadLoginExperience(),
    import("../features/public/customer-reservation-page.js"),
    import("../features/public/customer-reservation-confirmation-page.js"),
  ])
    .then(() => undefined)
    .catch(() => undefined);

  return reservationCreationPromise;
}

export function preloadReservationManagementExperience() {
  reservationManagementPromise ??= Promise.all([
    preloadLoginExperience(),
    import("../features/public/customer-reservations-page.js"),
    import("../features/public/customer-reservation-detail-page.js"),
  ])
    .then(() => undefined)
    .catch(() => undefined);

  return reservationManagementPromise;
}

export function prefetchOnIntent(prefetch: () => Promise<void>): PrefetchIntentHandlers {
  const trigger = () => {
    void prefetch();
  };

  return {
    onMouseEnter: trigger,
    onFocus: trigger,
    onTouchStart: trigger,
  };
}
