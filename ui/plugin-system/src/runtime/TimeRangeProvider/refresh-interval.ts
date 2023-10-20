import { DurationString, parseDurationString } from '@perses-dev/core';

/**
 * Utils function to transform a refresh interval in {@link DurationString} format into a number of ms.
 * @param refreshInterval
 */
export function getRefreshIntervalInMs(refreshInterval?: DurationString) {
  let refreshIntervalInMs = 0;
  if (refreshInterval) {
    const refreshIntervalDuration = parseDurationString(refreshInterval);
    if (refreshIntervalDuration && refreshIntervalDuration.seconds) {
      refreshIntervalInMs = refreshIntervalDuration?.seconds * 1000;
    }
  }
  return refreshIntervalInMs;
}
