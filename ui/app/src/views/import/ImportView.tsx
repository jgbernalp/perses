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

import { Button, JSONEditor, Separator, useIcon } from '@perses-dev/components';
import { DashboardResource } from '@perses-dev/core';
import { ChangeEvent, ReactElement, useState } from 'react';
import { useIsMobileSize } from '../../utils/browser-size';
import GrafanaFlow from './GrafanaFlow';
import './ImportView.css';
import PersesFlow from './PersesFlow';

type DashboardType = 'grafana' | 'perses';

type Dashboard = GrafanaDashboard | PersesDashboard | undefined;

interface GrafanaDashboard {
  kind: 'grafana';
  data: Record<string, unknown>;
}

interface PersesDashboard {
  kind: 'perses';
  data: DashboardResource;
}

function ImportView(): ReactElement {
  const SparklesIcon = useIcon('Sparkles');
  const UploadIcon = useIcon('Upload');
  const [dashboard, setDashboard] = useState<Dashboard>();
  const isMobileSize = useIsMobileSize();

  const getDashboardType = (dashboard: Record<string, unknown>): DashboardType | undefined => {
    if ('kind' in dashboard) {
      return 'perses';
    }

    return 'grafana';
  };

  const fileUploadOnChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files;
    if (files === null) {
      return;
    }
    const value = await files[0]?.text();
    if (value !== undefined) {
      completeDashboard(value);
    }
  };

  const completeDashboard = (dashboard: string | undefined): void => {
    try {
      const json = JSON.parse(dashboard ?? '{}');
      const type = getDashboardType(json);
      if (type !== undefined) {
        setDashboard({
          kind: type,
          data: json,
        });
      }
    } catch (_) {
      setDashboard(undefined);
    }
  };

  return (
    <div className={`ps-ImportView ${isMobileSize ? 'ps-ImportView--mobile' : ''}`}>
      <div className="ps-ImportView-header">
        <SparklesIcon fontSize="large" />
        <h1>Import</h1>
      </div>
      <div className="ps-ImportView-content">
        <h2 className="ps-ImportView-sectionTitle">1. Provide a dashboard</h2>
        <Button fullWidth variant="outlined">
          <label className="ps-ImportView-uploadLabel">
            <UploadIcon style={{ marginRight: '8px' }} />
            Upload JSON file
            <input type="file" onChange={fileUploadOnChange} hidden style={{ width: '100%' }} />
          </label>
        </Button>
        <div className="ps-ImportView-divider">
          <Separator />
          <span>OR</span>
          <Separator />
        </div>
        <JSONEditor
          value={dashboard?.data}
          onChange={(value: string) => completeDashboard(value)}
          minHeight="10rem"
          maxHeight="30rem"
          width="100%"
          placeholder="Paste your Dashboard JSON here..."
        />
        {dashboard !== undefined && dashboard.kind === 'grafana' && <GrafanaFlow dashboard={dashboard?.data} />}
        {dashboard !== undefined && dashboard.kind === 'perses' && <PersesFlow dashboard={dashboard?.data} />}
      </div>
    </div>
  );
}

export default ImportView;
