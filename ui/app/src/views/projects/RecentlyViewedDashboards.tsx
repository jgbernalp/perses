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

import './RecentlyViewedDashboards.css';
import { ErrorAlert, ErrorBoundary, useIcon } from '@perses-dev/components';
import { ReactElement } from 'react';
import { useRecentDashboardList } from '../../model/dashboard-client';
import { RecentDashboardList } from '../../components/DashboardList/RecentDashboardList';

interface RecentlyViewedDashboardsProps {
  projectName: string;
  id?: string;
}

export function RecentlyViewedDashboards(props: RecentlyViewedDashboardsProps): ReactElement {
  const HistoryIcon = useIcon('History');
  const { data, isLoading } = useRecentDashboardList(props.projectName);

  return (
    <div id={props.id} className="ps-RecentlyViewedDashboards">
      <div className="ps-RecentlyViewedDashboards-headerContainer">
        <div className="ps-RecentlyViewedDashboards-header">
          <HistoryIcon />
          <h3 className="ps-RecentlyViewedDashboards-title">Recently Viewed Dashboards</h3>
        </div>
      </div>
      <ErrorBoundary FallbackComponent={ErrorAlert}>
        <div className="ps-RecentlyViewedDashboards-card">
          <RecentDashboardList dashboardList={data} isLoading={isLoading} hideProject={true} />
        </div>
      </ErrorBoundary>
    </div>
  );
}
