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

import './GrafanaFlow.css';
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  JSONEditor,
  useSnackbar,
  Button,
  Progress,
  Alert,
  Checkbox,
  FormTextField,
  FormAutocomplete,
  useIcon,
} from '@perses-dev/components';
import { useMigrate } from '../../model/migrate-client';
import { useProjectList } from '../../model/project-client';
import { useCreateDashboardMutation } from '../../model/dashboard-client';
import { useIsReadonly } from '../../context/Config';

type Input = {
  name: string;
  value?: string;
};

// GrafanaLightDashboard is a Grafana dashboard that may have some variables that need to be replaced by the user.
interface GrafanaLightDashboard {
  // The only part that is interesting us is the list of the input that can exists in the Grafana dashboard definition.
  __inputs?: Input[];
  // In order to have an accurate type when matching this interface with the Grafana JSON,
  // we just say we have an unknown list of key that exists, but we don't really care about what they are.
  [key: string]: unknown;
}

interface GrafanaFlowProps {
  dashboard: GrafanaLightDashboard;
}

function GrafanaFlow({ dashboard }: GrafanaFlowProps): ReactElement {
  const ImportIcon = useIcon('Import');
  const SparklesIcon = useIcon('Sparkles');
  const migrateMutation = useMigrate();
  const navigate = useNavigate();
  const isReadonly = useIsReadonly();
  const { exceptionSnackbar } = useSnackbar();
  const [projectName, setProjectName] = useState<string>('');
  const [grafanaInput, setGrafanaInput] = useState<Record<string, string>>({});
  const [useDefaultDatasource, setUseDefaultDatasource] = useState(false);
  const { data, isLoading, error } = useProjectList();
  const dashboardMutation = useCreateDashboardMutation((data) => {
    navigate(`/projects/${data.metadata.project}/dashboards/${data.metadata.name}`);
  });

  // initialize the map with the provided input values if exist
  dashboard?.__inputs?.map((input) => {
    grafanaInput[input.name] = input.value ?? '';
  });

  const setInput = (key: string, value: string): void => {
    grafanaInput[key] = value;
    setGrafanaInput(grafanaInput);
  };

  const importOnClick = (): void => {
    const dashboard = migrateMutation.data;
    if (dashboard === undefined) {
      return;
    }
    dashboard.metadata.project = projectName;
    dashboardMutation.mutate(dashboard);
  };

  if (error) {
    exceptionSnackbar(error);
  }

  return (
    <>
      {// When you are getting a dashboard from the Grafana marketplace, it can happen there is a list of input that shall be used in a later stage to replace some variables.
      // The code below provide the possibility to the user to provide the list of the input value.
      // These values will be provided to the backend that will take care to replace the variables called with the input name with the values provided.
      dashboard?.__inputs?.map((input, index) => {
        return (
          <FormTextField
            key={`input-${index}`}
            label={input.name}
            defaultValue={input.value ?? ''}
            onBlur={(e) => setInput(input.name, e.target.value)}
          />
        );
      })}

      <Alert severity="warning">
        As we do not support every feature from Grafana, the migration to Perses can only be partial. For example,
        unsupported panels are replaced by &quot;placeholder&quot; Markdown panels, to at least preserve the dashboard
        structure.
      </Alert>
      <div className="ps-GrafanaFlow-formControls">
        <Checkbox
          checked={useDefaultDatasource}
          onChange={(checked) => setUseDefaultDatasource(checked)}
          label="Use default datasource in Perses"
        />
        <Button
          fullWidth
          variant="solid"
          disabled={migrateMutation.isPending}
          onClick={() => {
            migrateMutation.mutate({
              input: grafanaInput,
              grafanaDashboard: dashboard ?? {},
              useDefaultDatasource: useDefaultDatasource,
            });
          }}
        >
          <SparklesIcon style={{ marginRight: '8px' }} />
          Migrate
        </Button>
      </div>
      {migrateMutation.isPending && (
        <div className="ps-GrafanaFlow-loading">
          <Progress />
        </div>
      )}
      {migrateMutation.isError && <Alert severity="error">{migrateMutation.error.message}</Alert>}
      {!isLoading && data !== undefined && data !== null && migrateMutation.isSuccess && (
        <div className="ps-GrafanaFlow-outputSection">
          <h2 className="ps-GrafanaFlow-sectionTitle">2. Migration output</h2>
          <JSONEditor value={migrateMutation.data} maxHeight="50rem" width="100%" readOnly />
          <h2 className="ps-GrafanaFlow-sectionTitle">3. Import</h2>
          <div className="ps-GrafanaFlow-importSection">
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
              fullWidth
              variant="solid"
              disabled={dashboardMutation.isPending || projectName.length === 0 || isReadonly}
              onClick={importOnClick}
            >
              <ImportIcon style={{ marginRight: '8px' }} />
              Import
            </Button>
            {dashboardMutation.isError && <Alert severity="error">{dashboardMutation.error.message}</Alert>}
            {isReadonly && (
              <Alert severity="warning" className="ps-GrafanaFlow-readonlyAlert">
                Dashboard managed via code only.
              </Alert>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default GrafanaFlow;
