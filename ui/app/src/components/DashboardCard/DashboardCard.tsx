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

import { Button, useIcon } from '@perses-dev/components';
import { DashboardResource, getResourceDisplayName } from '@perses-dev/core';
import { Link as RouterLink } from 'react-router-dom';
import { ReactElement } from 'react';
import './DashboardCard.css';

interface DashboardCardProps {
  dashboard: DashboardResource;
  hideIcon?: boolean;
}

export function DashboardCard({ dashboard, hideIcon }: DashboardCardProps): ReactElement {
  const DashboardIcon = useIcon('Dashboard');
  const ArchiveIcon = useIcon('Archive');
  return (
    <Button
      variant="solid"
      className="ps-DashboardCard"
      title={getResourceDisplayName(dashboard)}
      data-testid={`dashboard-card-${dashboard.metadata.project}-${dashboard.metadata.name}`}
    >
      <RouterLink to={`/projects/${dashboard.metadata.project}/dashboards/${dashboard.metadata.name}`}>
        <span className="ps-DashboardCard-content">
          {!hideIcon && <DashboardIcon />}
          <span className="ps-DashboardCard-info">
            <span className="ps-DashboardCard-title" title={getResourceDisplayName(dashboard)}>
              {getResourceDisplayName(dashboard)}
            </span>
            <span className="ps-DashboardCard-project" title={dashboard.metadata.project}>
              <ArchiveIcon fontSize="small" /> {dashboard.metadata.project}
            </span>
          </span>
        </span>
      </RouterLink>
    </Button>
  );
}
