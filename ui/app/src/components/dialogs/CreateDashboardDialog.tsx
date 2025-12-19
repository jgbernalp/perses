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

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Progress, Select, Switch, TextField } from '@perses-dev/components';
import { DashboardSelector, EphemeralDashboardInfo, getResourceDisplayName, ProjectResource } from '@perses-dev/core';
import { Dispatch, DispatchWithoutAction, ReactElement, useCallback, useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import {
  CreateDashboardValidationType,
  CreateEphemeralDashboardValidationType,
  useDashboardValidationSchema,
  useEphemeralDashboardValidationSchema,
} from '../../validation';
import './CreateDashboardDialog.css';

interface CreateDashboardProps {
  open: boolean;
  projects: ProjectResource[];
  hideProjectSelect?: boolean;
  mode?: 'create' | 'duplicate';
  name?: string;
  onClose: DispatchWithoutAction;
  onSuccess?: Dispatch<DashboardSelector | EphemeralDashboardInfo>;
  isEphemeralDashboardEnabled: boolean;
}

/**
 * Dialog used to create a dashboard.
 * @param props.open Define if the dialog should be opened or not.
 * @param props.projectOptions The project where the dashboard will be created.
 * If it contains only one element, it will be used as project value and will hide the project selection.
 * @param props.onClose Provides the function to close itself.
 * @param props.onSuccess Action to perform when user confirmed.
 * @param props.isEphemeralDashboardEnabled Display switch button if ephemeral dashboards are enabled in copy dialog.
 */
export const CreateDashboardDialog = (props: CreateDashboardProps): ReactElement => {
  const { open, projects, hideProjectSelect, mode, name, onClose, onSuccess, isEphemeralDashboardEnabled } = props;

  const [isTempCopyChecked, setTempCopyChecked] = useState<boolean>(false);
  const action = mode === 'duplicate' ? 'Duplicate' : 'Create';

  // Disables closing on click out. This is a quick-win solution to make sure the currently-existing form
  // will be reset by the related child DuplicationForm component before closing.
  const handleClickOut = (): void => {
    /* do nothing */
  };

  return (
    <Dialog open={open} onClose={handleClickOut} aria-labelledby="confirm-dialog" fullWidth={true}>
      <Dialog.Header>
        {action} Dashboard{name && ': ' + name}
      </Dialog.Header>
      {isEphemeralDashboardEnabled && mode === 'duplicate' && (
        <Dialog.Content>
          <Switch
            checked={isTempCopyChecked}
            onChange={(checked) => {
              setTempCopyChecked(checked);
            }}
          />
          <span>Create as a temporary copy</span>
        </Dialog.Content>
      )}
      {isTempCopyChecked ? (
        <EphemeralDashboardDuplicationForm {...{ projects: projects, hideProjectSelect, onClose, onSuccess }} />
      ) : (
        <DashboardDuplicationForm {...{ projects: projects, hideProjectSelect, onClose, onSuccess }} />
      )}
    </Dialog>
  );
};

interface DuplicationFormProps {
  projects: ProjectResource[];
  hideProjectSelect?: boolean;
  onClose: DispatchWithoutAction;
  onSuccess?: Dispatch<DashboardSelector | EphemeralDashboardInfo>;
}

/* TODO: Why does it receive an array of projects and not a single project?! */
const DashboardDuplicationForm = (props: DuplicationFormProps): ReactElement => {
  const { projects, hideProjectSelect, onClose, onSuccess } = props;

  const { schema: dashboardSchemaValidation, isSchemaLoading: isDashboardSchemaValidationLoading } =
    useDashboardValidationSchema(projects[0]?.metadata.name);

  const dashboardForm = useForm<CreateDashboardValidationType>({
    resolver: dashboardSchemaValidation ? zodResolver(dashboardSchemaValidation) : undefined,
    mode: 'onBlur',
    defaultValues: { dashboardName: '', projectName: projects[0]?.metadata.name ?? '' },
  });

  const handleProcessDashboardForm = useCallback((): SubmitHandler<CreateDashboardValidationType> => {
    return (data) => {
      onClose();
      if (onSuccess) {
        onSuccess({ project: data.projectName, dashboard: data.dashboardName } as DashboardSelector);
      }
    };
  }, [onClose, onSuccess]);

  const handleClose = (): void => {
    onClose();
    dashboardForm.reset();
  };

  if (!isDashboardSchemaValidationLoading)
    return (
      <div className="ps-CreateDashboardDialog-loading">
        <Progress />
      </div>
    );

  const projectOptions = projects.map((option) => ({
    value: option.metadata.name,
    label: getResourceDisplayName(option),
  }));

  return (
    <FormProvider {...dashboardForm}>
      <form onSubmit={dashboardForm.handleSubmit(handleProcessDashboardForm())}>
        <Dialog.Content>
          <div className="ps-CreateDashboardDialog-fields">
            {!hideProjectSelect && (
              <Controller
                control={dashboardForm.control}
                name="projectName"
                render={({ field, fieldState }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    options={projectOptions}
                    required
                    label="Project name"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            )}
            <Controller
              control={dashboardForm.control}
              name="dashboardName"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  required
                  id="name"
                  label="Dashboard Name"
                  type="text"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </div>
        </Dialog.Content>
        <Dialog.Actions>
          <Button variant="solid" disabled={!dashboardForm.formState.isValid} type="submit">
            Add
          </Button>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
        </Dialog.Actions>
      </form>
    </FormProvider>
  );
};

const EphemeralDashboardDuplicationForm = (props: DuplicationFormProps): ReactElement => {
  const { projects, hideProjectSelect, onClose, onSuccess } = props;

  const ephemeralDashboardSchemaValidation = useEphemeralDashboardValidationSchema();

  const ephemeralDashboardForm = useForm<CreateEphemeralDashboardValidationType>({
    resolver: zodResolver(ephemeralDashboardSchemaValidation),
    mode: 'onBlur',
    defaultValues: { dashboardName: '', projectName: projects[0]?.metadata.name ?? '', ttl: '' },
  });

  const processEphemeralDashboardForm: SubmitHandler<CreateEphemeralDashboardValidationType> = (data) => {
    onClose();
    if (onSuccess) {
      onSuccess({
        project: data.projectName,
        dashboard: data.dashboardName,
        ttl: data.ttl,
      } as EphemeralDashboardInfo);
    }
  };

  const handleClose = (): void => {
    onClose();
    ephemeralDashboardForm.reset();
  };

  const projectOptions = projects.map((option) => ({
    value: option.metadata.name,
    label: getResourceDisplayName(option),
  }));

  return (
    <FormProvider {...ephemeralDashboardForm}>
      <form onSubmit={ephemeralDashboardForm.handleSubmit(processEphemeralDashboardForm)}>
        <Dialog.Content>
          <div className="ps-CreateDashboardDialog-fields">
            {!hideProjectSelect && (
              <Controller
                control={ephemeralDashboardForm.control}
                name="projectName"
                render={({ field, fieldState }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    options={projectOptions}
                    required
                    label="Project name"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            )}
            <Controller
              control={ephemeralDashboardForm.control}
              name="dashboardName"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  required
                  id="name"
                  label="Dashboard Name"
                  type="text"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={ephemeralDashboardForm.control}
              name="ttl"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  required
                  id="ttl"
                  label="Time to live (TTL)"
                  type="text"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? 'Duration string like 1w, 3d12h..'}
                />
              )}
            />
          </div>
        </Dialog.Content>
        <Dialog.Actions>
          <Button variant="solid" disabled={!ephemeralDashboardForm.formState.isValid} type="submit">
            Add
          </Button>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
        </Dialog.Actions>
      </form>
    </FormProvider>
  );
};
