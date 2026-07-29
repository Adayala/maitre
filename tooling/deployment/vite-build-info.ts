import { execFileSync } from "node:child_process";

export interface DeploymentBuildInfo {
  commitSha: string;
  deployedAt: string;
  environment: string;
}

export function deploymentBuildInfoDefine() {
  const buildInfo: DeploymentBuildInfo = {
    commitSha:
      process.env["VITE_GIT_COMMIT_SHA"] ??
      process.env["VERCEL_GIT_COMMIT_SHA"] ??
      process.env["GITHUB_SHA"] ??
      readGitCommit(),
    deployedAt:
      process.env["VITE_DEPLOYED_AT"] ??
      process.env["VERCEL_DEPLOYMENT_CREATED_AT"] ??
      new Date().toISOString(),
    environment:
      process.env["VERCEL_ENV"] ?? process.env["NODE_ENV"] ?? "development",
  };

  return { __MAITRE_BUILD_INFO__: JSON.stringify(buildInfo) };
}

function readGitCommit() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}
