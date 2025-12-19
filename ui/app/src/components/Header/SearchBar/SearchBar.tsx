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

import { Button, Dialog, IconButton, Input, useIcon } from '@perses-dev/components';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { isProjectMetadata, Resource } from '@perses-dev/core';
import { useIsMobileSize } from '../../../utils/browser-size';
import { isAppleDevice } from '../../../utils/os';
import { useDashboardList, useImportantDashboardList } from '../../../model/dashboard-client';
import { useProjectList } from '../../../model/project-client';
import { AdminRoute, ProjectRoute } from '../../../model/route';
import { useDatasourceList } from '../../../model/datasource-client';
import { useGlobalDatasourceList } from '../../../model/global-datasource-client';
import { SearchList } from './SearchList';
import './SearchBar.css';

function shortcutCTRL(): string {
  return isAppleDevice() ? '⌘' : 'ctrl';
}

type ResourceType = 'dashboards' | 'projects' | 'globalDatasources' | 'datasources';

interface ResourceListProps {
  query: string;
  onClick: () => void;
  isResources?: (type: ResourceType, available: boolean) => void;
}

function SearchProjectList(props: ResourceListProps): ReactElement {
  const ArchiveIcon = useIcon('Archive');
  const projectsQueryResult = useProjectList({ refetchOnMount: false });
  const { query, onClick, isResources } = props;
  return (
    <SearchList
      list={projectsQueryResult.data ?? []}
      query={query}
      onClick={onClick}
      icon={ArchiveIcon}
      isResource={(isAvailable) => isResources?.('projects', isAvailable)}
    />
  );
}

function SearchGlobalDatasource(props: ResourceListProps): ReactElement {
  const DatabaseIcon = useIcon('Database');
  const globalDatasourceQueryResult = useGlobalDatasourceList({ refetchOnMount: false });
  const { query, onClick, isResources } = props;
  return (
    <SearchList
      list={globalDatasourceQueryResult.data ?? []}
      query={query}
      onClick={onClick}
      icon={DatabaseIcon}
      buildRouting={() => `${AdminRoute}/datasources`}
      isResource={(isAvailable) => isResources?.('globalDatasources', isAvailable)}
    />
  );
}

function SearchDashboardList(props: ResourceListProps): ReactElement | null {
  const DashboardIcon = useIcon('Dashboard');
  const {
    data: dashboardList,
    isLoading: dashboardListLoading,
    error: dashboardListError,
  } = useDashboardList({
    metadataOnly: true,
    refetchOnMount: false,
  });
  const {
    data: importantDashboards,
    isLoading: importantDashboardsLoading,
    error: importantDashboardsError,
  } = useImportantDashboardList();

  const { query, isResources, onClick } = props;

  const list: Array<Resource & { highlight: boolean }> = useMemo(() => {
    if (query.length && dashboardList) {
      return dashboardList.map((d) => {
        const highlight = !!importantDashboards.some(
          (importantDashboard) =>
            importantDashboard.metadata.name === d.metadata.name &&
            importantDashboard.metadata.project === d.metadata.project
        );
        return { ...d, highlight };
      });
    } else {
      return importantDashboards.map((imp) => ({ ...imp, highlight: true }));
    }
  }, [importantDashboards, dashboardList, query]);

  if (dashboardListError || importantDashboardsError)
    return (
      <div className="ps-SearchBar-error">
        <div className="ps-SearchBar-alert" data-severity="error">
          <p>Failed to load dashboards! Error:</p>
          {importantDashboardsError?.message && <p>{importantDashboardsError.message}</p>}
          {dashboardListError?.message && <p>{dashboardListError.message}</p>}
        </div>
      </div>
    );

  return dashboardListLoading || importantDashboardsLoading ? null : (
    <SearchList
      list={list}
      query={query}
      onClick={onClick}
      icon={DashboardIcon}
      chip={true}
      isResource={(isAvailable) => isResources?.('dashboards', isAvailable)}
    />
  );
}

function SearchDatasourceList(props: ResourceListProps): ReactElement | null {
  const DatabaseIcon = useIcon('Database');
  const datasourceQueryResult = useDatasourceList({ refetchOnMount: false });
  const { isResources, onClick, query } = props;
  return (
    <SearchList
      list={datasourceQueryResult.data ?? []}
      query={query}
      onClick={onClick}
      icon={DatabaseIcon}
      chip={true}
      buildRouting={(resource) =>
        `${ProjectRoute}/${isProjectMetadata(resource.metadata) ? resource.metadata.project : ''}/datasources`
      }
      isResource={(isAvailable) => isResources?.('datasources', isAvailable)}
    />
  );
}

function useHandleShortCut(handleOpen: () => void): void {
  // handle what happens on key press
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const ctrlKey = isAppleDevice() ? event.metaKey : event.ctrlKey;
      if (ctrlKey && event.key === 'k') {
        event.preventDefault();
        handleOpen();
      }
    },
    [handleOpen]
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return (): void => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}

export function SearchBar(): ReactElement {
  const SearchIcon = useIcon('Search');
  const FrownIcon = useIcon('Frown');
  const CloseIcon = useIcon('Close');
  const isMobileSize = useIsMobileSize();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hasResource, setHasResource] = useState<Record<ResourceType, boolean>>({
    dashboards: false,
    projects: false,
    globalDatasources: false,
    datasources: false,
  });

  function handleIsResourceAvailable(type: ResourceType, available: boolean): void {
    setHasResource((prev) => (prev[type] === available ? prev : { ...prev, [type]: available }));
  }

  const handleOpen = (): void => setOpen(true);
  const handleClose = (): void => setOpen(false);
  useHandleShortCut(handleOpen);
  return (
    <div className="ps-SearchBar">
      <Button size="sm" className="ps-SearchBar-trigger" onClick={handleOpen}>
        <span className="ps-SearchBar-triggerContent">
          <SearchIcon className="ps-SearchBar-searchIcon" />
          <span>Search...</span>
        </span>
        {!isMobileSize && <span className="ps-SearchBar-shortcut">{`${shortcutCTRL()}+k`}</span>}
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="search-modal">
        <div className="ps-SearchBar-modal" data-mobile={isMobileSize || undefined}>
          <div className="ps-SearchBar-inputWrapper">
            <SearchIcon className="ps-SearchBar-inputIcon" />
            <Input
              /* eslint-disable-next-line jsx-a11y/no-autofocus */
              autoFocus={open}
              placeholder="What are you looking for?"
              className="ps-SearchBar-input"
              value={query}
              onChange={(value) => setQuery(value)}
            />
            {query && (
              <IconButton size="sm" variant="ghost" onClick={() => setQuery('')} aria-label="Clear search input">
                <CloseIcon />
              </IconButton>
            )}
            <button type="button" className="ps-SearchBar-escKey" onClick={handleClose}>
              esc
            </button>
          </div>
          {!!query.length && !Object.values(hasResource).some((v) => v) && (
            <div className="ps-SearchBar-noResults">
              <FrownIcon />
              <span>No records found for {query}</span>
            </div>
          )}
          <SearchDashboardList query={query} onClick={handleClose} isResources={handleIsResourceAvailable} />
          <SearchProjectList query={query} onClick={handleClose} isResources={handleIsResourceAvailable} />
          <SearchGlobalDatasource query={query} onClick={handleClose} isResources={handleIsResourceAvailable} />
          <SearchDatasourceList query={query} onClick={handleClose} isResources={handleIsResourceAvailable} />
        </div>
      </Dialog>
    </div>
  );
}
