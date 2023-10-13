// Copyright 2023 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useMemo, useState, useCallback, createContext, useContext } from 'react';
import {
  AbsoluteTimeRange,
  DurationString,
  isRelativeTimeRange,
  parseDurationString,
  TimeRangeValue,
  toAbsoluteTimeRange,
} from '@perses-dev/core';
import { milliseconds } from 'date-fns';
import { useSetRefreshIntervalParams, useTimeRangeParams } from './query-params';

export interface TimeRangeProviderProps {
  initialTimeRange: TimeRangeValue;
  initialRefreshInterval?: DurationString;
  enabledURLParams?: boolean;
  children?: React.ReactNode;
}

export interface TimeRange {
  timeRange: TimeRangeValue;
  absoluteTimeRange: AbsoluteTimeRange; // resolved absolute time for plugins to use
  setTimeRange: (value: TimeRangeValue) => void;
  refresh: () => void;
  refreshKey: string;
  refreshInterval?: DurationString;
  refreshIntervalInMs: number;
  setRefreshInterval: (value: DurationString) => void;
}

export const TimeRangeContext = createContext<TimeRange | undefined>(undefined);

export function useTimeRangeContext() {
  const ctx = useContext(TimeRangeContext);
  if (ctx === undefined) {
    throw new Error('No TimeRangeContext found. Did you forget a Provider?');
  }
  return ctx;
}

/**
 * Get and set the current resolved time range at runtime.
 */
export function useTimeRange(): TimeRange {
  return useTimeRangeContext();
}

/**
 * Build the time range context from some initial state.
 * The values inside the initial state can be different depending on if the query params has been enabled and/or if we
 * gave some initial time range / refresh interval.
 * @param ctx
 */
function useContextMemo(
  ctx: Omit<TimeRange, 'refreshKey' | 'absoluteTimeRange' | 'refresh' | 'refreshIntervalInMs'>
): TimeRange {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refresh = useCallback(() => {
    setRefreshCounter((prevCounter) => prevCounter + 1);
  }, [setRefreshCounter]);

  return useMemo(() => {
    const absoluteTimeRange = isRelativeTimeRange(ctx.timeRange) ? toAbsoluteTimeRange(ctx.timeRange) : ctx.timeRange;
    return {
      ...ctx,
      refresh,
      absoluteTimeRange,
      refreshKey: `${absoluteTimeRange.start}:${absoluteTimeRange.end}:${ctx.refreshInterval}:${refreshCounter}`,
      refreshIntervalInMs: getRefreshIntervalInMs(ctx.refreshInterval),
    };
  }, [ctx, refresh, refreshCounter]);
}

/**
 * Utils function to transform a refresh interval in {@link DurationString} format into a number of ms.
 * @param refreshInterval
 */
function getRefreshIntervalInMs(refreshInterval?: DurationString): number {
  if (refreshInterval) {
    const refreshIntervalDuration = parseDurationString(refreshInterval);
    return milliseconds(refreshIntervalDuration);
  }
  return 0;
}

/**
 * Provider implementation that supplies the time range state at runtime.
 */
export function TimeRangeProvider(props: TimeRangeProviderProps) {
  const { initialTimeRange, initialRefreshInterval, enabledURLParams, children } = props;
  if (enabledURLParams) {
    return (
      <WithURLTimeRangeProvider initialTimeRange={initialTimeRange} initialRefreshInterval={initialRefreshInterval}>
        {children}
      </WithURLTimeRangeProvider>
    );
  }
  return (
    <WithoutURLTimeRangeProvider initialTimeRange={initialTimeRange} initialRefreshInterval={initialRefreshInterval}>
      {children}
    </WithoutURLTimeRangeProvider>
  );
}

/**
 * Internal version of the {@link TimeRangeProvider} used if user set `enabledURLParams` to true.
 * @param props
 * @constructor
 */
function WithURLTimeRangeProvider(props: Omit<TimeRangeProviderProps, 'enabledURLParams'>) {
  const { initialTimeRange, initialRefreshInterval, children } = props;

  const { timeRange, setTimeRange } = useTimeRangeParams(initialTimeRange);
  const { refreshInterval, setRefreshInterval } = useSetRefreshIntervalParams(initialRefreshInterval);

  const ctx = useContextMemo({
    timeRange,
    setTimeRange,
    refreshInterval,
    setRefreshInterval,
  });

  return <TimeRangeContext.Provider value={ctx}>{children}</TimeRangeContext.Provider>;
}

/**
 * Internal version of the {@link TimeRangeProvider} used if user set `enabledURLParams` to false.
 * @param props
 * @constructor
 */
function WithoutURLTimeRangeProvider(props: Omit<TimeRangeProviderProps, 'enabledURLParams'>) {
  const { initialTimeRange, initialRefreshInterval, children } = props;
  const [timeRange, setTimeRange] = useState<TimeRangeValue>(initialTimeRange);
  const [refreshInterval, setRefreshInterval] = useState<DurationString | undefined>(initialRefreshInterval);

  const ctx = useContextMemo({
    timeRange,
    setTimeRange,
    refreshInterval,
    setRefreshInterval,
  });

  return <TimeRangeContext.Provider value={ctx}>{children}</TimeRangeContext.Provider>;
}
