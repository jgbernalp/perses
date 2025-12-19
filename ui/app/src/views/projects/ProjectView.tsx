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

import { useNavigate, useParams } from 'react-router-dom';
import './ProjectView.css';
import React, { ReactElement, useState } from 'react';
import { ProjectResource } from '@perses-dev/core';
import { useSnackbar, Progress, useIcon } from '@perses-dev/components';
import { DeleteResourceDialog, RenameResourceDialog } from '../../components/dialogs';
import ProjectBreadcrumbs from '../../components/breadcrumbs/ProjectBreadcrumbs';
import { CRUDButton } from '../../components/CRUDButton/CRUDButton';
import { useIsMobileSize } from '../../utils/browser-size';
import { useDeleteProjectMutation, useProject, useUpdateProjectMutation } from '../../model/project-client';
import { RecentlyViewedDashboards } from './RecentlyViewedDashboards';
import { ProjectTabs } from './ProjectTabs';

function ProjectView(): ReactElement {
  const DeleteIcon = useIcon('Delete');
  const EditIcon = useIcon('Edit');
  const { projectName, tab } = useParams();
  if (projectName === undefined) {
    throw new Error('Unable to get the project name');
  }

  const { data: project, isLoading } = useProject(projectName);
  // Navigate to the home page if the project has been successfully deleted
  const navigate = useNavigate();
  const isMobileSize = useIsMobileSize();
  const { successSnackbar, exceptionSnackbar } = useSnackbar();

  const updateProjectMutation = useUpdateProjectMutation();
  const deleteProjectMutation = useDeleteProjectMutation();

  // Open/Close management for the "Delete Project" dialog
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState<boolean>(false);
  const [isRenameProjectDialogOpen, setIsRenameProjectDialogOpen] = useState<boolean>(false);

  function handleProjectRename(project: ProjectResource, projectName: string): void {
    updateProjectMutation.mutate(
      { ...project, spec: { display: { ...project.spec.display, name: projectName } } },
      {
        onSuccess: (updatedProject: ProjectResource) => {
          successSnackbar(`Project ${updatedProject.metadata.name} has been successfully updated`);
          setIsRenameProjectDialogOpen(false);
        },
        onError: (err) => {
          exceptionSnackbar(err);
          throw err;
        },
      }
    );
  }

  function handleProjectDelete(project: string): void {
    deleteProjectMutation.mutate(
      { kind: 'Project', metadata: { name: project }, spec: {} },
      {
        onSuccess: (deletedProject: ProjectResource) => {
          successSnackbar(`Project ${deletedProject.metadata.name} has been successfully deleted`);
          setIsDeleteProjectDialogOpen(false);
          navigate(`/`);
        },
        onError: (err) => {
          exceptionSnackbar(err);
          throw err;
        },
      }
    );
  }

  if (isLoading || project === undefined) {
    return (
      <div className="ps-ProjectView-loading">
        <Progress variant="circular" />
      </div>
    );
  }

  return (
    <div className={`ps-ProjectView ${isMobileSize ? 'ps-ProjectView--mobile' : ''}`}>
      <div className="ps-ProjectView-header">
        <ProjectBreadcrumbs project={project} />
        <div className="ps-ProjectView-actions">
          <CRUDButton
            action="update"
            scope="Project"
            project={projectName}
            variant="solid"
            onClick={() => setIsRenameProjectDialogOpen(true)}
          >
            {isMobileSize ? <EditIcon /> : 'Rename project'}
          </CRUDButton>
          <CRUDButton
            action="delete"
            scope="Project"
            project={projectName}
            variant="outlined"
            color="error"
            onClick={() => setIsDeleteProjectDialogOpen(true)}
          >
            {isMobileSize ? <DeleteIcon /> : 'Delete project'}
          </CRUDButton>
        </div>
        <RenameResourceDialog
          resource={project}
          open={isRenameProjectDialogOpen}
          onSubmit={(projectName) => handleProjectRename(project, projectName)}
          onClose={() => setIsRenameProjectDialogOpen(false)}
        />
        <DeleteResourceDialog
          resource={project}
          open={isDeleteProjectDialogOpen}
          onSubmit={() => handleProjectDelete(projectName)}
          onClose={() => setIsDeleteProjectDialogOpen(false)}
        />
      </div>
      <div className="ps-ProjectView-grid">
        <div className="ps-ProjectView-main">
          <ProjectTabs projectName={projectName} initialTab={tab} />
        </div>
        <div className="ps-ProjectView-sidebar">
          <RecentlyViewedDashboards projectName={projectName} id="recent-dashboard-list" />
        </div>
      </div>
    </div>
  );
}

export default ProjectView;
