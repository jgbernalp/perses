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

import { Action, UserEditorSchemaType, UserResource, userSchema } from '@perses-dev/core';
import { getSubmitText, getTitleAction } from '@perses-dev/plugin-system';
import React, { Fragment, ReactElement, useMemo, useState } from 'react';
import { Control, Controller, FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import {
  Alert,
  DiscardChangesConfirmationDialog,
  FormActions,
  IconButton,
  Separator,
  FormTextField,
  useIcon,
} from '@perses-dev/components';
import './UserEditorForm.css';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsExternalProviderEnabled, useIsNativeProviderEnabled } from '../../context/Config';
import { FormEditorProps } from '../form-drawers';

type UserEditorFormProps = FormEditorProps<UserResource>;

export function UserEditorForm({
  initialValue,
  action,
  isDraft,
  isReadonly,
  onActionChange,
  onSave,
  onClose,
  onDelete,
}: UserEditorFormProps): ReactElement {
  const AddIcon = useIcon('Plus');
  const MinusIcon = useIcon('Minus');
  const DeleteIcon = useIcon('Delete');
  const externalProvidersEnabled = useIsExternalProviderEnabled();
  const nativeProviderEnabled = useIsNativeProviderEnabled();

  // Reset all attributes that are "hidden" by the API and are returning <secret> as value
  const initialUserClean: UserResource = useMemo(() => {
    const result = { ...initialValue };
    if (result.spec.nativeProvider?.password) result.spec.nativeProvider.password = '';
    if (result.spec.oauthProviders === undefined) result.spec.oauthProviders = [];
    return result;
  }, [initialValue]);

  const [isDiscardDialogOpened, setDiscardDialogOpened] = useState<boolean>(false);

  const titleAction = getTitleAction(action, isDraft);
  const submitText = getSubmitText(action, isDraft);

  const form = useForm<UserEditorSchemaType>({
    resolver: zodResolver(userSchema),
    mode: 'onBlur',
    defaultValues: initialUserClean,
  });

  const { spec } = form.watch();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'spec.oauthProviders',
  });

  const processForm: SubmitHandler<UserEditorSchemaType> = (data: UserResource) => {
    onSave(data);
  };

  // When user click on cancel, several possibilities:
  // - create action: ask for discard approval
  // - update action: ask for discard approval if changed
  // - read action: don´t ask for discard approval
  function handleCancel(): void {
    if (JSON.stringify(initialUserClean) !== JSON.stringify(form.getValues())) {
      setDiscardDialogOpened(true);
    } else {
      onClose();
    }
  }

  return (
    <FormProvider {...form}>
      <div className="ps-UserEditorForm-header">
        <h2>{titleAction} User</h2>
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
      <div className="ps-UserEditorForm-content">
        <div className="ps-UserEditorForm-row">
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
        <Separator className="ps-UserEditorForm-divider" />
        <div className="ps-UserEditorForm-section">
          <h1 className="ps-UserEditorForm-sectionTitle">General</h1>
          <div className="ps-UserEditorForm-row">
            <Controller
              control={form.control}
              name="spec.firstName"
              render={({ field, fieldState }) => (
                <FormTextField
                  {...field}
                  fullWidth
                  label="First Name"
                  InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                  InputProps={{
                    readOnly: action === 'read',
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="spec.lastName"
              render={({ field, fieldState }) => (
                <FormTextField
                  {...field}
                  fullWidth
                  label="Last Name"
                  InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                  InputProps={{
                    readOnly: action === 'read',
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </div>
        </div>
        <Separator className="ps-UserEditorForm-divider" />
        <div className="ps-UserEditorForm-section">
          <h1 className="ps-UserEditorForm-sectionTitle">Native Provider</h1>
          {spec.nativeProvider?.password === undefined ? (
            <IconButton
              aria-label="Add native provider"
              disabled={isReadonly || action === 'read'}
              style={{ width: 'fit-content', height: 'fit-content' }}
              onClick={() => form.setValue('spec.nativeProvider', { password: '' })}
            >
              <AddIcon />
            </IconButton>
          ) : (
            <div className="ps-UserEditorForm-providerContent">
              {!nativeProviderEnabled && (
                <Alert severity="warning">Native provider is currently disabled in the config!</Alert>
              )}
              <div className="ps-UserEditorForm-providerRow">
                <Controller
                  control={form.control}
                  name="spec.nativeProvider.password"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="Password"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <IconButton
                  aria-label="Remove native provider"
                  disabled={isReadonly || action === 'read'}
                  style={{ width: 'fit-content', height: 'fit-content' }}
                  onClick={() => form.setValue('spec.nativeProvider', { password: undefined })}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
          )}
        </div>
        <Separator className="ps-UserEditorForm-divider" />
        <div className="ps-UserEditorForm-section">
          <h1 className="ps-UserEditorForm-sectionTitle">OAuth & OIDC Providers</h1>
          {!externalProvidersEnabled && (
            <Alert severity="warning">No OAuth or OIDC providers are currently enabled in the config!</Alert>
          )}
          <div className="ps-UserEditorForm-providerContent">
            {fields && fields.length > 0 ? (
              fields.map((field, index) => (
                <Fragment key={field.id}>
                  <div key={field.id} className="ps-UserEditorForm-providerRow">
                    <OAuthProvider control={form.control} index={index} action={action} />
                    <IconButton
                      aria-label="Remove provider"
                      disabled={isReadonly || action === 'read'}
                      style={{ width: 'fit-content', height: 'fit-content' }}
                      onClick={() => remove(index)}
                    >
                      <MinusIcon />
                    </IconButton>
                  </div>
                </Fragment>
              ))
            ) : (
              <span className="ps-UserEditorForm-emptyText">No OAuth or OIDC provider defined</span>
            )}
            <IconButton
              aria-label="Add OIDC or OAuth provider"
              disabled={isReadonly || action === 'read'}
              style={{ width: 'fit-content', height: 'fit-content' }}
              onClick={() => append({ issuer: '', email: '', subject: '' })}
            >
              <AddIcon />
            </IconButton>
          </div>
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

function OAuthProvider({
  control,
  index,
  action,
}: {
  control: Control<UserResource>;
  index: number;
  action: Action;
}): ReactElement {
  return (
    <div className="ps-UserEditorForm-oauthControl">
      <div className="ps-UserEditorForm-oauthColumn">
        <h3 className="ps-UserEditorForm-columnTitle">Issuer</h3>

        <Controller
          control={control}
          name={`spec.oauthProviders.${index}.issuer`}
          render={({ field, fieldState }) => (
            <FormTextField
              {...field}
              fullWidth
              label="Issuer"
              InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
              InputProps={{
                readOnly: action === 'read',
              }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </div>
      <div className="ps-UserEditorForm-oauthColumn">
        <h3 className="ps-UserEditorForm-columnTitle">Email</h3>

        <Controller
          control={control}
          name={`spec.oauthProviders.${index}.email`}
          render={({ field, fieldState }) => (
            <FormTextField
              {...field}
              fullWidth
              label="Email"
              InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
              InputProps={{
                readOnly: action === 'read',
              }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </div>
      <div className="ps-UserEditorForm-oauthColumn">
        <h3 className="ps-UserEditorForm-columnTitle">Subject</h3>

        <Controller
          control={control}
          name={`spec.oauthProviders.${index}.subject`}
          render={({ field, fieldState }) => (
            <FormTextField
              {...field}
              fullWidth
              label="Subject"
              InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
              InputProps={{
                readOnly: action === 'read',
              }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </div>
    </div>
  );
}
