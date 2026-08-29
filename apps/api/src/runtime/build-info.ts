export interface RuntimeBuildInfo {
  commitSha: string;
  deployedAt: string;
  environment: string;
}

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

export function runtimeBuildInfo(
  environment: RuntimeEnvironment = process.env,
): RuntimeBuildInfo {
  return {
    commitSha:
      environment["MAITRE_GIT_COMMIT_SHA"] ??
      environment["VERCEL_GIT_COMMIT_SHA"] ??
      environment["GITHUB_SHA"] ??
      "unknown",
    deployedAt:
      environment["MAITRE_DEPLOYED_AT"] ??
      environment["VERCEL_DEPLOYMENT_CREATED_AT"] ??
      "unknown",
    environment:
      environment["VERCEL_ENV"] ?? environment["NODE_ENV"] ?? "development",
  };
}
