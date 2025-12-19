// Copyright 2024 The Perses Authors
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

import './PersesFlow.css';
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSnackbar, Button, Alert, FormAutocomplete, useIcon } from '@perses-dev/components';
import { DashboardResource } from '@perses-dev/core';
import { useProjectList } from '../../model/project-client';
import { useCreateDashboardMutation } from '../../model/dashboard-client';
import { useIsReadonly } from '../../context/Config';

interface PersesFlowProps {
  dashboard: DashboardResource;
}

function PersesFlow({ dashboard }: PersesFlowProps): ReactElement {
  const ImportIcon = useIcon('Import');
  const navigate = useNavigate();
  const isReadonly = useIsReadonly();
  const { exceptionSnackbar } = useSnackbar();
  const [projectName, setProjectName] = useState<string>('');
  const { data, error } = useProjectList();
  const dashboardMutation = useCreateDashboardMutation((data) => {
    navigate(`/projects/${data.metadata.project}/dashboards/${data.metadata.name}`);
  });

  const importOnClick = (): void => {
    dashboard.metadata.project = projectName;
    dashboardMutation.mutate(dashboard);
  };

  if (error) {
    exceptionSnackbar(error);
  }

  return (
    <>
      {data !== undefined && data !== null && (
        <div className="ps-PersesFlow">
          <h2 className="ps-PersesFlow-sectionTitle">2. Import</h2>
          <div className="ps-PersesFlow-content">
            <FormAutocomplete
              disablePortal
              label="Project name"
              required
              options={data.map((project) => project.metadata.name)}
              onChange={(value) => {
                if (value && typeof value === 'string') {
                  setProjectName(value);
                }
              }}
            />
            <Button
              variant="solid"
              disabled={dashboardMutation.isPending || projectName.length === 0 || isReadonly}
              onClick={importOnClick}
            >
              <ImportIcon style={{ marginRight: '8px' }} />
              Import
            </Button>
            {dashboardMutation.isError && <Alert severity="error">{dashboardMutation.error.message}</Alert>}
            {isReadonly && (
              <Alert severity="warning" className="ps-PersesFlow-readonlyAlert">
                Dashboard managed via code only.
              </Alert>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default PersesFlow;
