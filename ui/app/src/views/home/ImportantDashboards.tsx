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

import { Progress, useIcon } from '@perses-dev/components';
import { DashboardResource } from '@perses-dev/core';
import { ReactElement } from 'react';
import { useImportantDashboardList } from '../../model/dashboard-client';
import { DashboardCard } from '../../components/DashboardCard/DashboardCard';
import { useIsMobileSize } from '../../utils/browser-size';
import { useConfig } from '../../model/config-client';
import './ImportantDashboards.css';

interface DashboardMosaicProps {
  dashboards: DashboardResource[];
}

function DashboardMosaic({ dashboards }: DashboardMosaicProps): ReactElement {
  const isMobileSize = useIsMobileSize();

  if (dashboards.length === 0) {
    return (
      <div className="ps-ImportantDashboards-empty">
        <span className="ps-ImportantDashboards-emptyText">Empty</span>
      </div>
    );
  }

  return (
    <div
      className={`ps-ImportantDashboards-grid ${isMobileSize ? 'ps-ImportantDashboards-grid--mobile' : ''}`}
      data-testid="important-dashboards-mosaic"
    >
      {dashboards.map((dashboard) => (
        <div
          key={`${dashboard.metadata.project}-${dashboard.metadata.name}`}
          className="ps-ImportantDashboards-gridItem"
        >
          <DashboardCard dashboard={dashboard} hideIcon={isMobileSize}></DashboardCard>
        </div>
      ))}
    </div>
  );
}

export function ImportantDashboards(): ReactElement {
  const SparklesIcon = useIcon('Sparkles');
  const { data: config } = useConfig();
  const { data: dashboards, isLoading } = useImportantDashboardList();

  // If no important dashboard defined, hide the section
  if (!config?.frontend.important_dashboards?.length || dashboards.length === 0) {
    return <></>;
  }

  return (
    <div className="ps-ImportantDashboards">
      <div className="ps-ImportantDashboards-header">
        <SparklesIcon />
        <h2>Important Dashboards</h2>
      </div>
      {isLoading ? (
        <div className="ps-ImportantDashboards-loading">
          <Progress />
        </div>
      ) : (
        <DashboardMosaic dashboards={dashboards} />
      )}
    </div>
  );
}
