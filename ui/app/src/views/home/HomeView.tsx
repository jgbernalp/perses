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

import './HomeView.css';
import { ReactElement, useState } from 'react';
import { useIcon } from '@perses-dev/components';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { DashboardSelector, ProjectResource } from '@perses-dev/core';
import { CreateProjectDialog, CreateDashboardDialog } from '../../components/dialogs';
import { StackCrumb, TitleCrumb } from '../../components/breadcrumbs/breadcrumbs';
import { useIsMobileSize } from '../../utils/browser-size';
import { CRUDButton } from '../../components/CRUDButton/CRUDButton';
import ButtonMenu from '../../components/ButtonMenu/ButtonMenu';
import { ImportRoute } from '../../model/route';
import { useDashboardCreateAllowedProjects } from '../../context/Authorization';
import { useIsEphemeralDashboardEnabled } from '../../context/Config';
import { InformationSection } from './InformationSection';
import { RecentDashboards } from './RecentDashboards';
import { ProjectsAndDashboards } from './ProjectsAndDashboards';
import { ImportantDashboards } from './ImportantDashboards';

function HomeView(): ReactElement {
  const HomeIcon = useIcon('Home');
  // Navigate to the project page if the project has been successfully added
  const navigate = useNavigate();
  const isMobileSize = useIsMobileSize();
  const userProjects = useDashboardCreateAllowedProjects();
  const isEphemeralDashboardEnabled = useIsEphemeralDashboardEnabled();

  const handleAddProjectDialogSubmit = (entity: ProjectResource): void => navigate(`/projects/${entity.metadata.name}`);
  const handleAddDashboardDialogSubmit = (dashboardSelector: DashboardSelector): void =>
    navigate(`/projects/${dashboardSelector.project}/dashboard/new`, { state: { name: dashboardSelector.dashboard } });

  // Open/Close management for dialogs
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [isAddDashboardDialogOpen, setIsAddDashboardDialogOpen] = useState(false);

  const handleAddProjectDialogOpen = (): void => {
    setIsAddProjectDialogOpen(true);
  };
  const handleAddProjectDialogClose = (): void => {
    setIsAddProjectDialogOpen(false);
  };
  const handleAddDashboardDialogOpen = (): void => {
    setIsAddDashboardDialogOpen(true);
  };
  const handleAddDashboardDialogClose = (): void => {
    setIsAddDashboardDialogOpen(false);
  };

  return (
    <div className={`ps-HomeView ${isMobileSize ? 'ps-HomeView--mobile' : ''}`}>
      <div className="ps-HomeView-header">
        <div className="ps-HomeView-headerRow">
          <StackCrumb>
            <HomeIcon fontSize="large" />
            <TitleCrumb>Home</TitleCrumb>
          </StackCrumb>
          <div className={`ps-HomeView-actions ${isMobileSize ? 'ps-HomeView-actions--mobile' : ''}`}>
            <CRUDButton action="create" scope="Project" variant="solid" onClick={handleAddProjectDialogOpen}>
              Add Project
            </CRUDButton>

            <ButtonMenu>
              <CRUDButton variant="solid" onClick={handleAddDashboardDialogOpen} disabled={userProjects.length === 0}>
                Add Dashboard
              </CRUDButton>
              <RouterLink
                to={ImportRoute}
                className={`ps-HomeView-menuLink ${userProjects.length === 0 ? 'ps-HomeView-menuLink--disabled' : ''}`}
                onClick={(e) => userProjects.length === 0 && e.preventDefault()}
              >
                <CRUDButton style={{ backgroundColor: 'transparent' }} disabled={userProjects.length === 0}>
                  Import Dashboard
                </CRUDButton>
              </RouterLink>
            </ButtonMenu>
            <CreateProjectDialog
              open={isAddProjectDialogOpen}
              onClose={handleAddProjectDialogClose}
              onSuccess={handleAddProjectDialogSubmit}
            />
            <CreateDashboardDialog
              open={isAddDashboardDialogOpen}
              projects={userProjects}
              onClose={handleAddDashboardDialogClose}
              onSuccess={handleAddDashboardDialogSubmit}
              isEphemeralDashboardEnabled={isEphemeralDashboardEnabled}
            />
          </div>
        </div>
      </div>
      <div className="ps-HomeView-grid">
        <div className="ps-HomeView-main">
          <div className="ps-HomeView-mainContent">
            <ImportantDashboards />
            <ProjectsAndDashboards />
          </div>
        </div>
        <div className="ps-HomeView-sidebar">
          <div className="ps-HomeView-sidebarContent">
            <InformationSection />
            <RecentDashboards />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeView;
