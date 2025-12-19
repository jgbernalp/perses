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

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  ErrorAlert,
  ErrorBoundary,
  IconButton,
  useSnackbar,
  Progress,
  TextField,
  useIcon,
} from '@perses-dev/components';
import './ProjectsAndDashboards.css';
import { MouseEvent, ReactElement, useMemo, useState } from 'react';
import { getResourceDisplayName, ProjectResource } from '@perses-dev/core';
import { Link as RouterLink } from 'react-router-dom';
import { KVSearch } from '@nexucis/kvsearch';
import { DashboardList } from '../../components/DashboardList/DashboardList';
import { useIsEphemeralDashboardEnabled, useIsReadonly } from '../../context/Config';
import { useHasPermission } from '../../context/Authorization';
import { DeleteResourceDialog } from '../../components/dialogs';
import { ProjectWithDashboards, useProjectsWithDashboards, useDeleteProjectMutation } from '../../model/project-client';

interface ProjectAccordionProps {
  row: ProjectWithDashboards;
}

function ProjectAccordion({ row }: ProjectAccordionProps): ReactElement {
  const ChevronDownIcon = useIcon('ChevronDown');
  const ArchiveIcon = useIcon('Archive');
  const DeleteIcon = useIcon('Delete');
  const isReadonly = useIsReadonly();
  const isEphemeralDashboardEnabled = useIsEphemeralDashboardEnabled();
  const { successSnackbar, exceptionSnackbar } = useSnackbar();

  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState<boolean>(false);

  const hasPermission = useHasPermission('delete', row.project.metadata.name, 'Project');
  const deleteProjectMutation = useDeleteProjectMutation();

  function openDeleteProjectConfirmDialog($event: MouseEvent): void {
    $event.stopPropagation(); // Preventing the accordion to toggle when we click on the button
    setIsDeleteProjectDialogOpen(true);
  }

  function closeDeleteProjectConfirmDialog(): void {
    setIsDeleteProjectDialogOpen(false);
  }

  function handleProjectDelete(project: ProjectResource): void {
    deleteProjectMutation.mutate(project, {
      onSuccess: (deletedProject: ProjectResource): void => {
        successSnackbar(`Project ${deletedProject.metadata.name} has been successfully deleted`);
        closeDeleteProjectConfirmDialog();
      },
      onError: (err) => {
        exceptionSnackbar(err);
        throw err;
      },
    });
  }

  return (
    <>
      <Accordion key={row.project.metadata.name}>
        <AccordionItem value={row.project.metadata.name}>
          <AccordionTrigger className="ps-ProjectAccordion-trigger">
            <div className="ps-ProjectAccordion-summaryRow">
              <div className="ps-ProjectAccordion-projectInfo">
                <ArchiveIcon style={{ margin: '8px' }} />
                <RouterLink
                  to={`/projects/${row.project.metadata.name}`}
                  className="ps-ProjectAccordion-projectLink"
                  onClick={(e: MouseEvent) => e.stopPropagation()}
                >
                  {getResourceDisplayName(row.project)}
                </RouterLink>
              </div>
              {hasPermission && (
                <IconButton
                  aria-label={`Delete project ${row.project.metadata.name}`}
                  onClick={(event: MouseEvent) => openDeleteProjectConfirmDialog(event)}
                  disabled={isReadonly}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </div>
            <ChevronDownIcon className="ps-ProjectAccordion-expandIcon" />
          </AccordionTrigger>
          <AccordionContent id={`${row.project.metadata.name}-dashboard-list`} className="ps-ProjectAccordion-details">
            <DashboardList
              dashboardList={row.dashboards}
              hideToolbar={true}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25, page: 0 },
                },
                columns: {
                  columnVisibilityModel: {
                    id: false,
                    project: false,
                    version: false,
                  },
                },
              }}
              isEphemeralDashboardEnabled={isEphemeralDashboardEnabled}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <DeleteResourceDialog
        resource={row.project}
        open={isDeleteProjectDialogOpen}
        onSubmit={() => handleProjectDelete(row.project)}
        onClose={closeDeleteProjectConfirmDialog}
      />
    </>
  );
}

interface RenderDashboardListProps {
  projectRows: ProjectWithDashboards[];
}

function RenderDashboardList(props: RenderDashboardListProps): ReactElement {
  const { projectRows } = props;

  if (projectRows.length === 0) {
    return <span className="ps-ProjectsAndDashboards-emptyText">No projects with dashboards found!</span>;
  }

  return (
    <div>
      {projectRows.map((row) => (
        <ProjectAccordion key={row.project.metadata.name} row={row} />
      ))}
    </div>
  );
}

interface SearchableDashboardsProps {
  id?: string;
}

export function SearchableDashboards(props: SearchableDashboardsProps): ReactElement {
  const kvSearch = useMemo(
    () =>
      new KVSearch<ProjectWithDashboards>({
        indexedKeys: [
          ['dashboards', 'metadata', 'project'], // Matching on the dashboard project name
          ['dashboards', 'metadata', 'name'], // Matching on the dashboard name
          ['dashboards', 'spec', 'display', 'name'], // Matching on the dashboard display name
          ['project', 'metadata', 'name'], // Matching on the project name
          ['project', 'metadata', 'display', 'name'], // Matching on the project display name
        ],
      }),
    []
  );

  const { data: projectRows, isLoading } = useProjectsWithDashboards();

  const [search, setSearch] = useState<string>('');

  const filteredProjectRows: ProjectWithDashboards[] = useMemo(() => {
    if (search) {
      return kvSearch.filter(search, projectRows ?? []).map((res) => res.original);
    } else {
      return projectRows ?? [];
    }
  }, [kvSearch, projectRows, search]);

  if (isLoading) {
    return (
      <div className="ps-ProjectsAndDashboards-loading">
        <Progress />
      </div>
    );
  }

  return (
    <div className="ps-ProjectsAndDashboards-searchable" id={props.id}>
      <TextField
        id="search"
        label="Search a Project or a Dashboard"
        onChange={(value) => {
          if (value) {
            setSearch(value);
          } else {
            setSearch('');
          }
        }}
        fullWidth
      />
      <ErrorBoundary FallbackComponent={ErrorAlert}>
        <RenderDashboardList projectRows={filteredProjectRows} />
      </ErrorBoundary>
    </div>
  );
}

export function ProjectsAndDashboards(): ReactElement {
  const ListIcon = useIcon('List');
  return (
    <div className="ps-ProjectsAndDashboards">
      <div className="ps-ProjectsAndDashboards-header">
        <ListIcon />
        <h2>Projects & Dashboards</h2>
      </div>
      <SearchableDashboards id="project-dashboard-list" />
    </div>
  );
}
