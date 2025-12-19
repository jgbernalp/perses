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

import { useIcon } from '@perses-dev/components';
import { getResourceDisplayName, ProjectResource } from '@perses-dev/core';
import { ReactElement } from 'react';
import { HomeLinkCrumb, Breadcrumbs, LinkCrumb, StackCrumb, TitleCrumb } from './breadcrumbs';
import './ProjectBreadcrumbs.css';

interface ProjectBreadcrumbsProps {
  project: ProjectResource;
  dashboardName?: string;
}

function ProjectBreadcrumbs(props: ProjectBreadcrumbsProps): ReactElement {
  const ArchiveIcon = useIcon('Archive');
  const DashboardIcon = useIcon('Dashboard');
  const { project, dashboardName } = props;

  if (dashboardName) {
    return (
      <Breadcrumbs id="breadcrumbs" className="ps-ProjectBreadcrumbs-scrollable">
        <HomeLinkCrumb />
        <LinkCrumb to={`/projects/${project.metadata.name}`}>
          <StackCrumb>
            <ArchiveIcon fontSize="small" /> {getResourceDisplayName(project)}
          </StackCrumb>
        </LinkCrumb>
        <StackCrumb>
          <DashboardIcon fontSize="small" />
          <span className="ps-ProjectBreadcrumbs-dashboardName">{dashboardName}</span>
        </StackCrumb>
      </Breadcrumbs>
    );
  }

  return (
    <Breadcrumbs id="breadcrumbs" className="ps-ProjectBreadcrumbs-scrollable">
      <HomeLinkCrumb />
      <StackCrumb>
        <ArchiveIcon fontSize="large" />
        <TitleCrumb>{getResourceDisplayName(project)}</TitleCrumb>
      </StackCrumb>
    </Breadcrumbs>
  );
}

export default ProjectBreadcrumbs;
