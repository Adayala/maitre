export type ArcaEnvironment = "homologation" | "production";

export interface ArcaEndpoints {
  wsaaUrl: string;
  wsfev1Url: string;
}

export const ARCA_ENDPOINTS: Readonly<Record<ArcaEnvironment, ArcaEndpoints>> = {
  homologation: {
    wsaaUrl: "https://wsaahomo.afip.gov.ar/ws/services/LoginCms",
    wsfev1Url: "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
  },
  production: {
    wsaaUrl: "https://wsaa.afip.gov.ar/ws/services/LoginCms",
    wsfev1Url: "https://servicios1.afip.gov.ar/wsfev1/service.asmx",
  },
};

export function resolveArcaEndpoints(
  environment: ArcaEnvironment,
  overrides: Partial<ArcaEndpoints> = {},
): ArcaEndpoints {
  return { ...ARCA_ENDPOINTS[environment], ...overrides };
}
