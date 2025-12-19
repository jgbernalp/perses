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

import { Tabs, useIcon, useSnackbar } from '@perses-dev/components';
import {
  DashboardSelector,
  DatasourceResource,
  getResourceDisplayName,
  getResourceExtendedDisplayName,
  RoleBindingResource,
  RoleResource,
  SecretResource,
  VariableResource,
} from '@perses-dev/core';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CRUDButton, CRUDButtonProps } from '../../components/CRUDButton/CRUDButton';
import { DatasourceDrawer } from '../../components/datasource/DatasourceDrawer';
import { CreateDashboardDialog } from '../../components/dialogs';
import { RoleBindingDrawer } from '../../components/rolebindings/RoleBindingDrawer';
import { RoleDrawer } from '../../components/roles/RoleDrawer';
import { SecretDrawer } from '../../components/secrets/SecretDrawer';
import { MenuTab, MenuTabs } from '../../components/tabs';
import { VariableDrawer } from '../../components/variable/VariableDrawer';
import { useHasPermission } from '../../context/Authorization';
import {
  useIsAuthEnabled,
  useIsEphemeralDashboardEnabled,
  useIsProjectDatasourceEnabled,
  useIsProjectVariableEnabled,
  useIsReadonly,
} from '../../context/Config';
import { useCreateDatasourceMutation } from '../../model/datasource-client';
import { useEphemeralDashboardList } from '../../model/ephemeral-dashboard-client';
import { useCreateRoleMutation, useRoleList } from '../../model/role-client';
import { useCreateRoleBindingMutation } from '../../model/rolebinding-client';
import { useCreateSecretMutation } from '../../model/secret-client';
import { useCreateVariableMutation } from '../../model/variable-client';
import { useIsMobileSize } from '../../utils/browser-size';
import './ProjectTabs.css';
import { ProjectDashboards } from './tabs/ProjectDashboards';
import { ProjectDatasources } from './tabs/ProjectDatasources';
import { ProjectEphemeralDashboards } from './tabs/ProjectEphemeralDashboards';
import { ProjectRoleBindings } from './tabs/ProjectRoleBindings';
import { ProjectRoles } from './tabs/ProjectRoles';
import { ProjectSecrets } from './tabs/ProjectSecrets';
import { ProjectVariables } from './tabs/ProjectVariables';

const dashboardsTabIndex = 'dashboards';
const ephemeralDashboardsTabIndex = 'ephemeraldashboards';
const datasourcesTabIndex = 'datasources';
const rolesTabIndex = 'roles';
const roleBindingsTabIndex = 'rolesbindings';
const secretsTabIndex = 'secrets';
const variablesTabIndex = 'variables';

interface TabButtonProps extends CRUDButtonProps {
  index: string;
  projectName: string;
}

function TabButton({ index, projectName, ...props }: TabButtonProps): ReactElement {
  const navigate = useNavigate();
  const { successSnackbar, exceptionSnackbar } = useSnackbar();

  const createDatasourceMutation = useCreateDatasourceMutation(projectName);
  const createRoleMutation = useCreateRoleMutation(projectName);
  const createRoleBindingMutation = useCreateRoleBindingMutation(projectName);
  const createSecretMutation = useCreateSecretMutation(projectName);
  const createVariableMutation = useCreateVariableMutation(projectName);

  const [isCreateDashboardDialogOpened, setCreateDashboardDialogOpened] = useState(false);
  const [isDatasourceDrawerOpened, setDatasourceDrawerOpened] = useState(false);
  const [isRoleDrawerOpened, setRoleDrawerOpened] = useState(false);
  const [isRoleBindingDrawerOpened, setRoleBindingDrawerOpened] = useState(false);
  const [isSecretDrawerOpened, setSecretDrawerOpened] = useState(false);
  const [isVariableDrawerOpened, setVariableDrawerOpened] = useState(false);

  const isReadonly = useIsReadonly();
  const isEphemeralDashboardEnabled = useIsEphemeralDashboardEnabled();

  const handleDashboardCreation = (dashboardSelector: DashboardSelector): void => {
    navigate(`/projects/${dashboardSelector.project}/dashboard/new`, { state: { name: dashboardSelector.dashboard } });
  };

  const { data } = useRoleList(projectName);
  const roleSuggestions = useMemo(() => {
    return (data ?? []).map((role) => role.metadata.name);
  }, [data]);

  const handleDatasourceCreation = useCallback(
    (datasource: DatasourceResource) => {
      createDatasourceMutation.mutate(datasource, {
        onSuccess: (createdDatasource: DatasourceResource) => {
          successSnackbar(`Datasource ${getResourceDisplayName(createdDatasource)} has been successfully created`);
          setDatasourceDrawerOpened(false);
        },
        onError: (err) => {
          exceptionSnackbar(err);
          throw err;
        },
      });
    },
    [exceptionSnackbar, successSnackbar, createDatasourceMutation]
  );

  const handleRoleCreation = useCallback(
    (role: RoleResource) => {
      createRoleMutation.mutate(role, {
        onSuccess: (createdRole: RoleResource) => {
          successSnackbar(`Role ${createdRole.metadata.name} has been successfully created`);
          setRoleDrawerOpened(false);
        },
        onError: (err) => {
          exceptionSnackbar(err);
          throw err;
        },
      });
    },
    [exceptionSnackbar, successSnackbar, createRoleMutation]
  );

  const handleRoleBindingCreation = useCallback(
    (roleBinding: RoleBindingResource) => {
      createRoleBindingMutation.mutate(roleBinding, {
        onSuccess: (createdRoleBinding: RoleBindingResource) => {
          successSnackbar(`RoleBinding ${createdRoleBinding.metadata.name} has been successfully created`);
          setRoleBindingDrawerOpened(false);
        },
        onError: (err) => {
          exceptionSnackbar(err);
          throw err;
        },
      });
    },
    [exceptionSnackbar, successSnackbar, createRoleBindingMutation]
  );

  const handleSecretCreation = useCallback(
    (secret: SecretResource) => {
      createSecretMutation.mutate(secret, {
        onSuccess: (createdSecret: SecretResource) => {
          successSnackbar(`Secret ${createdSecret.metadata.name} has been successfully created`);
          setSecretDrawerOpened(false);
        },
        onError: (err) => {
          exceptionSnackbar(err);
          throw err;
        },
      });
    },
    [exceptionSnackbar, successSnackbar, createSecretMutation]
  );

  const handleVariableCreation = useCallback(
    (variable: VariableResource) => {
      createVariableMutation.mutate(variable, {
        onSuccess: (updatedVariable: VariableResource) => {
          successSnackbar(`Variable ${getResourceExtendedDisplayName(updatedVariable)} has been successfully created`);
          setVariableDrawerOpened(false);
        },
        onError: (err) => {
          exceptionSnackbar(err);
          throw err;
        },
      });
    },
    [exceptionSnackbar, successSnackbar, createVariableMutation]
  );

  switch (index) {
    case dashboardsTabIndex:
      return (
        <>
          <CRUDButton
            action="create"
            scope="Dashboard"
            project={projectName}
            variant="solid"
            onClick={() => setCreateDashboardDialogOpened(true)}
            {...props}
          >
            Add Dashboard
          </CRUDButton>
          <CreateDashboardDialog
            open={isCreateDashboardDialogOpened}
            projects={[{ kind: 'Project', metadata: { name: projectName }, spec: {} }]}
            hideProjectSelect={true}
            onClose={() => setCreateDashboardDialogOpened(false)}
            onSuccess={handleDashboardCreation}
            isEphemeralDashboardEnabled={isEphemeralDashboardEnabled}
          />
        </>
      );
    case datasourcesTabIndex:
      return (
        <>
          <CRUDButton
            action="create"
            scope="Datasource"
            project={projectName}
            variant="solid"
            onClick={() => setDatasourceDrawerOpened(true)}
            {...props}
          >
            Add Datasource
          </CRUDButton>
          <DatasourceDrawer
            datasource={{
              kind: 'Datasource',
              metadata: {
                name: 'NewDatasource',
                project: projectName,
              },
              spec: {
                default: false,
                plugin: {
                  // TODO: find a way to avoid assuming that the PrometheusDatasource plugin is installed
                  kind: 'PrometheusDatasource',
                  spec: {},
                },
              },
            }}
            isOpen={isDatasourceDrawerOpened}
            action="create"
            isReadonly={isReadonly}
            onSave={handleDatasourceCreation}
            onClose={() => setDatasourceDrawerOpened(false)}
          />
        </>
      );
    case rolesTabIndex:
      return (
        <>
          <CRUDButton
            action="create"
            scope="Role"
            project={projectName}
            variant="solid"
            onClick={() => setRoleDrawerOpened(true)}
            {...props}
          >
            Add Role
          </CRUDButton>
          <RoleDrawer
            role={{
              kind: 'Role',
              metadata: {
                name: 'NewRole',
                project: projectName,
              },
              spec: {
                permissions: [],
              },
            }}
            isOpen={isRoleDrawerOpened}
            action="create"
            isReadonly={isReadonly}
            onSave={handleRoleCreation}
            onClose={() => setRoleDrawerOpened(false)}
          />
        </>
      );
    case roleBindingsTabIndex:
      return (
        <>
          <CRUDButton
            action="create"
            scope="RoleBinding"
            project={projectName}
            variant="solid"
            onClick={() => setRoleBindingDrawerOpened(true)}
            {...props}
          >
            Add Role Binding
          </CRUDButton>
          <RoleBindingDrawer
            roleBinding={{
              kind: 'RoleBinding',
              metadata: {
                name: 'NewRoleBinding',
                project: projectName,
              },
              spec: {
                role: '',
                subjects: [],
              },
            }}
            roleSuggestions={roleSuggestions}
            isOpen={isRoleBindingDrawerOpened}
            action="create"
            isReadonly={isReadonly}
            onSave={handleRoleBindingCreation}
            onClose={() => setRoleBindingDrawerOpened(false)}
          />
        </>
      );
    case secretsTabIndex:
      return (
        <>
          <CRUDButton
            action="create"
            scope="Secret"
            project={projectName}
            variant="solid"
            onClick={() => setSecretDrawerOpened(true)}
            {...props}
          >
            Add Secret
          </CRUDButton>
          <SecretDrawer
            secret={{
              kind: 'Secret',
              metadata: {
                name: 'NewSecret',
                project: projectName,
              },
              spec: {},
            }}
            isOpen={isSecretDrawerOpened}
            action="create"
            isReadonly={isReadonly}
            onSave={handleSecretCreation}
            onClose={() => setSecretDrawerOpened(false)}
          />
        </>
      );
    case variablesTabIndex:
      return (
        <>
          <CRUDButton
            action="create"
            scope="Variable"
            project={projectName}
            variant="solid"
            onClick={() => setVariableDrawerOpened(true)}
            {...props}
          >
            Add Variable
          </CRUDButton>
          <VariableDrawer
            variable={{
              kind: 'Variable',
              metadata: {
                name: 'NewVariable',
                project: projectName,
              },
              spec: {
                kind: 'TextVariable',
                spec: {
                  name: 'NewVariable',
                  value: '',
                },
              },
            }}
            isOpen={isVariableDrawerOpened}
            action="create"
            isReadonly={isReadonly}
            onSave={handleVariableCreation}
            onClose={() => setVariableDrawerOpened(false)}
          />
        </>
      );
    default:
      return <></>;
  }
}

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  index: string;
  value: string;
}

function TabPanel({ children, value, index, className, ...props }: TabPanelProps): ReactElement {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      className={`ps-ProjectTabs-tabPanel ${className || ''}`}
      {...props}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: string): Record<string, unknown> {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  };
}

interface DashboardVariableTabsProps {
  projectName: string;
  initialTab?: string;
}

export function ProjectTabs(props: DashboardVariableTabsProps): ReactElement {
  const { projectName, initialTab } = props;
  const DashboardIcon = useIcon('Dashboard');
  const CodeIcon = useIcon('Code');
  const DatabaseIcon = useIcon('Database');
  const KeyIcon = useIcon('Key');
  const ShieldIcon = useIcon('Shield');
  const ShieldAccountIcon = useIcon('ShieldAccount');
  const { tab } = useParams();
  const isAuthEnabled = useIsAuthEnabled();
  const isProjectDatasourceEnabled = useIsProjectDatasourceEnabled();
  const isProjectVariableEnabled = useIsProjectVariableEnabled();

  const navigate = useNavigate();
  const isMobileSize = useIsMobileSize();
  const isEphemeralDashboardEnabled = useIsEphemeralDashboardEnabled();
  const { data } = useEphemeralDashboardList(projectName);
  const hasEphemeralDashboards = (data ?? []).length > 0;

  const [value, setValue] = useState((initialTab ?? dashboardsTabIndex).toLowerCase());

  const hasDashboardReadPermission = useHasPermission('read', projectName, 'Dashboard');
  const hasDatasourceReadPermission = useHasPermission('read', projectName, 'Datasource');
  const hasEphemeralDashboardReadPermission = useHasPermission('read', projectName, 'EphemeralDashboard');
  const hasRoleReadPermission = useHasPermission('read', projectName, 'Role');
  const hasRoleBindingReadPermission = useHasPermission('read', projectName, 'RoleBinding');
  const hasSecretReadPermission = useHasPermission('read', projectName, 'Secret');
  const hasVariableReadPermission = useHasPermission('read', projectName, 'Variable');

  const handleChange = (newTabIndex: string): void => {
    setValue(newTabIndex);
    navigate(`/projects/${projectName}/${newTabIndex}`);
  };

  return (
    <div className="ps-ProjectTabs">
      <Tabs value={value} onValueChange={handleChange}>
        <div className="ps-ProjectTabs-header">
          <MenuTabs
            // TODO: enable scrollable tabs when we have too many tabs to fit
            // variant="scrollable"
            // scrollButtons="auto"
            // allowScrollButtonsMobile
            aria-label="Project tabs"
            className="ps-ProjectTabs-header"
          >
            <MenuTab
              label="Dashboards"
              icon={<DashboardIcon />}
              {...a11yProps(dashboardsTabIndex)}
              value={dashboardsTabIndex}
              disabled={!hasDashboardReadPermission}
            />
            {(hasEphemeralDashboards || tab === ephemeralDashboardsTabIndex) && (
              <MenuTab
                label="Ephemeral Dashboards"
                icon={<DashboardIcon />}
                {...a11yProps(ephemeralDashboardsTabIndex)}
                value={ephemeralDashboardsTabIndex}
                disabled={!hasEphemeralDashboardReadPermission}
              />
            )}
            {isProjectVariableEnabled && (
              <MenuTab
                label="Variables"
                icon={<CodeIcon />}
                {...a11yProps(variablesTabIndex)}
                value={variablesTabIndex}
                disabled={!hasVariableReadPermission}
              />
            )}
            {isProjectDatasourceEnabled && (
              <MenuTab
                label="Datasources"
                icon={<DatabaseIcon />}
                {...a11yProps(datasourcesTabIndex)}
                value={datasourcesTabIndex}
                disabled={!hasDatasourceReadPermission}
              />
            )}
            <MenuTab
              label="Secrets"
              icon={<KeyIcon />}
              {...a11yProps(secretsTabIndex)}
              value={secretsTabIndex}
              disabled={!hasSecretReadPermission}
            />
            {isAuthEnabled && (
              <MenuTab
                label="Roles"
                icon={<ShieldIcon />}
                {...a11yProps(rolesTabIndex)}
                value={rolesTabIndex}
                disabled={!hasRoleReadPermission}
              />
            )}
            {isAuthEnabled && (
              <MenuTab
                label="Role Bindings"
                icon={<ShieldAccountIcon />}
                {...a11yProps(roleBindingsTabIndex)}
                value={roleBindingsTabIndex}
                disabled={!hasRoleBindingReadPermission}
              />
            )}
          </MenuTabs>
          {!isMobileSize && <TabButton index={value} projectName={projectName} />}
        </div>
        {isMobileSize && <TabButton index={value} projectName={projectName} fullWidth style={{ marginTop: '4px' }} />}
        <TabPanel
          value={value}
          index={dashboardsTabIndex}
          className={isMobileSize ? 'ps-ProjectTabs-tabPanel--mobile' : ''}
        >
          <ProjectDashboards projectName={projectName} id="main-dashboard-list" />
        </TabPanel>
        {isEphemeralDashboardEnabled && hasEphemeralDashboards && (
          <TabPanel
            value={value}
            index={ephemeralDashboardsTabIndex}
            className={isMobileSize ? 'ps-ProjectTabs-tabPanel--mobile' : ''}
          >
            <ProjectEphemeralDashboards projectName={projectName} id="project-ephemeral-dashboard-list" />
          </TabPanel>
        )}
        {isProjectVariableEnabled && (
          <TabPanel
            value={value}
            index={variablesTabIndex}
            className={isMobileSize ? 'ps-ProjectTabs-tabPanel--mobile' : ''}
          >
            <ProjectVariables projectName={projectName} id="project-variable-list" />
          </TabPanel>
        )}
        {isProjectDatasourceEnabled && (
          <TabPanel
            value={value}
            index={datasourcesTabIndex}
            className={isMobileSize ? 'ps-ProjectTabs-tabPanel--mobile' : ''}
          >
            <ProjectDatasources projectName={projectName} id="project-datasource-list" />
          </TabPanel>
        )}
        <TabPanel
          value={value}
          index={secretsTabIndex}
          className={isMobileSize ? 'ps-ProjectTabs-tabPanel--mobile' : ''}
        >
          <ProjectSecrets projectName={projectName} id="project-secret-list" />
        </TabPanel>
        {isAuthEnabled && (
          <>
            <TabPanel
              value={value}
              index={rolesTabIndex}
              className={isMobileSize ? 'ps-ProjectTabs-tabPanel--mobile' : ''}
            >
              <ProjectRoles projectName={projectName} id="project-role-list" />
            </TabPanel>
            <TabPanel
              value={value}
              index={roleBindingsTabIndex}
              className={isMobileSize ? 'ps-ProjectTabs-tabPanel--mobile' : ''}
            >
              <ProjectRoleBindings projectName={projectName} id="project-rolebinding-list" />
            </TabPanel>
          </>
        )}
      </Tabs>
    </div>
  );
}
