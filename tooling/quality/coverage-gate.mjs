export function parseCoverageSummary(output) {
  const match = output.match(
    /(?:#|ℹ)?\s*all files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|/,
  );
  if (!match) {
    throw new Error("Node test coverage summary was not found");
  }
  return {
    lines: Number(match[1]),
    branches: Number(match[2]),
    functions: Number(match[3]),
  };
}

export function coverageFailures(summary, thresholds) {
  return Object.entries(thresholds).flatMap(([metric, minimum]) => {
    const actual = summary[metric];
    if (!Number.isFinite(actual)) return [`Unknown coverage metric: ${metric}`];
    return actual < minimum
      ? [
          `${metric} coverage ${actual.toFixed(2)}% is below ${minimum.toFixed(2)}%`,
        ]
      : [];
  });
}
