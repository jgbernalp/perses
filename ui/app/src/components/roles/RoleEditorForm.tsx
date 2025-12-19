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

import { Action, ACTIONS, GLOBAL_SCOPES, PROJECT_SCOPES, Role, rolesEditorSchema } from '@perses-dev/core';
import { getSubmitText, getTitleAction } from '@perses-dev/plugin-system';
import React, { Fragment, ReactElement, useMemo, useState } from 'react';
import { Control, Controller, FormProvider, SubmitHandler, useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  DiscardChangesConfirmationDialog,
  FormActions,
  IconButton,
  Separator,
  FormTextField,
  useIcon,
} from '@perses-dev/components';
import './RoleEditorForm.css';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormEditorProps } from '../form-drawers';

type RoleEditorFormProps = FormEditorProps<Role>;

export function RoleEditorForm({
  initialValue,
  action,
  isDraft,
  isReadonly,
  onActionChange,
  onSave,
  onClose,
  onDelete,
}: RoleEditorFormProps): ReactElement {
  const AddIcon = useIcon('Plus');
  const MinusIcon = useIcon('Minus');
  const [isDiscardDialogOpened, setDiscardDialogOpened] = useState<boolean>(false);

  const titleAction = getTitleAction(action, isDraft);
  const submitText = getSubmitText(action, isDraft);

  const form = useForm<Role>({
    resolver: zodResolver(rolesEditorSchema),
    mode: 'onBlur',
    defaultValues: initialValue,
  });

  const processForm: SubmitHandler<Role> = (data: Role) => {
    onSave(data);
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'spec.permissions',
  });

  // When user click on cancel, several possibilities:
  // - create action: ask for discard approval
  // - update action: ask for discard approval if changed
  // - read action: don´t ask for discard approval
  function handleCancel(): void {
    if (JSON.stringify(initialValue) !== JSON.stringify(form.getValues())) {
      setDiscardDialogOpened(true);
    } else {
      onClose();
    }
  }

  return (
    <FormProvider {...form}>
      <div className="ps-RoleEditorForm-header">
        <h2>{titleAction} Role</h2>
        <FormActions
          action={action}
          submitText={submitText}
          isReadonly={isReadonly}
          isValid={form.formState.isValid}
          onActionChange={onActionChange}
          onSubmit={form.handleSubmit(processForm)}
          onDelete={onDelete}
          onCancel={handleCancel}
        />
      </div>
      <div className="ps-RoleEditorForm-content">
        <div className="ps-RoleEditorForm-row">
          <Controller
            control={form.control}
            name="metadata.name"
            render={({ field, fieldState }) => (
              <FormTextField
                {...field}
                required
                fullWidth
                label="Name"
                InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                InputProps={{
                  disabled: action === 'update',
                  readOnly: action === 'read',
                }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </div>
        <Separator className="ps-RoleEditorForm-divider" />
        <div className="ps-RoleEditorForm-section">
          <h1 className="ps-RoleEditorForm-sectionTitle">Permissions</h1>
          {fields && fields.length > 0 ? (
            fields.map((field, index) => (
              <Fragment key={field.id}>
                <div key={field.id} className="ps-RoleEditorForm-permissionRow">
                  <PermissionControl control={form.control} index={index} action={action} />
                  <IconButton
                    aria-label="Remove permission"
                    disabled={isReadonly || action === 'read'}
                    style={{ width: 'fit-content', height: 'fit-content' }}
                    onClick={() => remove(index)}
                  >
                    <MinusIcon />
                  </IconButton>
                </div>
                <Separator className="ps-RoleEditorForm-divider" />
              </Fragment>
            ))
          ) : (
            <span className="ps-RoleEditorForm-emptyText">No permission defined</span>
          )}
          <IconButton
            aria-label="Add permission"
            disabled={isReadonly || action === 'read'}
            style={{ width: 'fit-content', height: 'fit-content' }}
            // Add a new subject
            onClick={() => append({ actions: ['read'], scopes: ['*'] })}
          >
            <AddIcon />
          </IconButton>
        </div>
      </div>
      <DiscardChangesConfirmationDialog
        description="Are you sure you want to discard these changes? Changes cannot be recovered."
        isOpen={isDiscardDialogOpened}
        onCancel={() => {
          setDiscardDialogOpened(false);
        }}
        onDiscardChanges={() => {
          setDiscardDialogOpened(false);
          onClose();
        }}
      />
    </FormProvider>
  );
}

interface PermissionControl {
  control: Control<Role>;
  index: number;
  action: Action;
}

function PermissionControl({ control, index, action }: PermissionControl): ReactElement {
  const kind = useWatch({ control, name: 'kind' });
  // Role and GlobalRole don't have same scopes
  const availableScopes = useMemo(() => {
    if (kind === 'Role') {
      return PROJECT_SCOPES;
    } else {
      // Else GlobalRole
      return PROJECT_SCOPES.concat(GLOBAL_SCOPES).sort();
    }
  }, [kind]);

  return (
    <div className="ps-RoleEditorForm-permissionControl">
      <div className="ps-RoleEditorForm-permissionColumn">
        <h3 className="ps-RoleEditorForm-columnTitle">Actions</h3>

        <Controller
          control={control}
          name={`spec.permissions.${index}.actions`}
          render={({ field, fieldState }) => (
            <FormTextField
              select
              {...field}
              required
              fullWidth
              label="Actions"
              InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
              InputProps={{
                readOnly: action === 'read',
              }}
              SelectProps={{
                multiple: true,
              }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {ACTIONS.map((actionOption: string) => (
                <option key={`actionOption-${actionOption}`} value={actionOption}>
                  {actionOption}
                </option>
              ))}
            </FormTextField>
          )}
        />
      </div>
      <div className="ps-RoleEditorForm-permissionColumn">
        <h3 className="ps-RoleEditorForm-columnTitle">Scopes</h3>

        <Controller
          control={control}
          name={`spec.permissions.${index}.scopes`}
          render={({ field, fieldState }) => (
            <FormTextField
              select
              {...field}
              required
              fullWidth
              label="Scopes"
              InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
              InputProps={{
                readOnly: action === 'read',
              }}
              SelectProps={{
                multiple: true,
              }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {availableScopes.map((scopeOption: string) => (
                <option key={`scopeAction-${scopeOption}`} value={scopeOption}>
                  {scopeOption}
                </option>
              ))}
            </FormTextField>
          )}
        />
      </div>
    </div>
  );
}
