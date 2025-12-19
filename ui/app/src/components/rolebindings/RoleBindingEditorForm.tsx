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

import { RoleBinding, roleBindingsEditorSchema } from '@perses-dev/core';
import { getSubmitText, getTitleAction } from '@perses-dev/plugin-system';
import React, { ReactElement, useMemo, useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import {
  DiscardChangesConfirmationDialog,
  FormActions,
  IconButton,
  Separator,
  FormTextField,
  FormAutocomplete,
  useIcon,
} from '@perses-dev/components';
import './RoleBindingEditorForm.css';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserList } from '../../model/user-client';
import { FormEditorProps } from '../form-drawers';

interface RoleBindingEditorFormProps extends FormEditorProps<RoleBinding> {
  roleSuggestions: string[];
}

export function RoleBindingEditorForm({
  initialValue,
  action,
  roleSuggestions,
  isDraft,
  isReadonly,
  onActionChange,
  onSave,
  onClose,
  onDelete,
}: RoleBindingEditorFormProps): ReactElement {
  const AddIcon = useIcon('Plus');
  const MinusIcon = useIcon('Minus');
  const [isDiscardDialogOpened, setDiscardDialogOpened] = useState<boolean>(false);

  const titleAction = getTitleAction(action, isDraft);
  const submitText = getSubmitText(action, isDraft);

  const form = useForm<RoleBinding>({
    resolver: zodResolver(roleBindingsEditorSchema),
    mode: 'onBlur',
    defaultValues: initialValue,
  });

  const processForm: SubmitHandler<RoleBinding> = (data: RoleBinding) => {
    onSave(data);
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'spec.subjects',
  });

  const { data: users } = useUserList();
  const usernames = useMemo(() => {
    return (users ?? []).map((user) => user.metadata.name);
  }, [users]);

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
      <div className="ps-RoleBindingEditorForm-header">
        <h2>{titleAction} Role Binding</h2>
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
      <div className="ps-RoleBindingEditorForm-content">
        <div className="ps-RoleBindingEditorForm-row">
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
          <Controller
            control={form.control}
            name="spec.role"
            render={({ field, fieldState }) => (
              <FormAutocomplete
                {...field}
                disablePortal
                freeSolo
                options={roleSuggestions}
                fullWidth
                readOnly={action !== 'create'}
                label="Role"
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                onChange={(data) => {
                  field.onChange(data);
                }}
              />
            )}
          />
        </div>
        <Separator className="ps-RoleBindingEditorForm-divider" />
        <div className="ps-RoleBindingEditorForm-section">
          <h1 className="ps-RoleBindingEditorForm-sectionTitle">Subjects</h1>
          {fields && fields.length > 0 ? (
            fields.map((field, index) => (
              <div key={field.id} className="ps-RoleBindingEditorForm-row">
                <Controller
                  control={form.control}
                  name={`spec.subjects.${index}.name`}
                  render={({ field, fieldState }) => (
                    <FormAutocomplete
                      {...field}
                      disablePortal
                      freeSolo
                      options={usernames}
                      fullWidth
                      readOnly={action === 'read'}
                      label="Username"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(data) => {
                        field.onChange(data);
                      }}
                    />
                  )}
                />
                <IconButton
                  aria-label="Remove subject"
                  disabled={isReadonly || action === 'read'}
                  style={{ width: 'fit-content', height: 'fit-content' }}
                  onClick={() => remove(index)}
                >
                  <MinusIcon />
                </IconButton>
              </div>
            ))
          ) : (
            <span className="ps-RoleBindingEditorForm-emptyText">No subject defined</span>
          )}
          <IconButton
            aria-label="Add subject"
            disabled={isReadonly || action === 'read'}
            style={{ width: 'fit-content', height: 'fit-content' }}
            // Add a new subject
            onClick={() => append({ kind: 'User', name: '' })}
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
