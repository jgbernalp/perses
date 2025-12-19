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

import { ReactElement } from 'react';
import { CommonRow, DATA_GRID_INITIAL_STATE_SORT_BY_NAME, DataGridPropertiesWithCallback, DataGridTable } from '@perses-dev/components';

export interface Row extends CommonRow {
  project: string;
  noAuth: boolean;
  basicAuth: boolean;
  authorization: boolean;
  oauth: boolean;
  tlsConfig: boolean;
}

export function SecretDataGrid(props: DataGridPropertiesWithCallback<Row>): ReactElement {
  const { columns, rows, initialState, hideToolbar, isLoading, onRowClick } = props;

  return (
    <DataGridTable
      columns={columns}
      rows={rows}
      initialState={initialState}
      hideToolbar={hideToolbar}
      isLoading={isLoading}
      onRowClick={onRowClick}
      emptyResource="secrets"
      defaultInitialState={DATA_GRID_INITIAL_STATE_SORT_BY_NAME}
    />
  );
}
