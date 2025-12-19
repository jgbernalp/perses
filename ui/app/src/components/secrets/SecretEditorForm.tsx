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

import { Secret, secretsEditorSchema, SecretsEditorSchemaType } from '@perses-dev/core';
import React, { HTMLAttributes, ReactElement, SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { getSubmitText, getTitleAction } from '@perses-dev/plugin-system';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DiscardChangesConfirmationDialog,
  FormActions,
  IconButton,
  Separator,
  Button,
  Switch,
  Tooltip,
  FormTextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  useIcon,
} from '@perses-dev/components';
import './SecretEditorForm.css';
import { FormEditorProps } from '../form-drawers';

const noAuthIndex = 'noAuth';
const basicAuthIndex = 'basicAuth';
const authorizationIndex = 'authorization';
const oauthIndex = 'oauth';

type SecretEditorFormProps = FormEditorProps<Secret>;

type EndpointParams = Record<string, string[]> | undefined;

export function SecretEditorForm({
  initialValue,
  action,
  isDraft,
  isReadonly,
  onActionChange,
  onSave,
  onClose,
  onDelete,
}: SecretEditorFormProps): ReactElement {
  const TrashIcon = useIcon('Delete');
  const PlusIcon = useIcon('Plus');
  // Reset all attributes that are "hidden" by the API and are returning <secret> as value
  const initialSecretClean: Secret = useMemo(() => {
    const result = { ...initialValue };
    if (result.spec.basicAuth?.password) result.spec.basicAuth.password = '';
    if (result.spec.authorization?.credentials) result.spec.authorization.credentials = '';
    if (result.spec.oauth?.clientID) result.spec.oauth.clientID = '';
    if (result.spec.oauth?.clientSecret) result.spec.oauth.clientSecret = '';
    if (result.spec.tlsConfig?.ca) result.spec.tlsConfig.ca = '';
    if (result.spec.tlsConfig?.cert) result.spec.tlsConfig.cert = '';
    if (result.spec.tlsConfig?.key) result.spec.tlsConfig.key = '';
    return result;
  }, [initialValue]);

  const [isDiscardDialogOpened, setDiscardDialogOpened] = useState<boolean>(false);

  const titleAction = getTitleAction(action, isDraft);
  const submitText = getSubmitText(action, isDraft);

  const form = useForm<SecretsEditorSchemaType>({
    resolver: zodResolver(secretsEditorSchema),
    mode: 'onChange',
    defaultValues: initialSecretClean,
  });

  const [isTLSConfigEnabled, setTLSConfigEnabled] = useState<boolean>(initialSecretClean.spec.tlsConfig !== undefined);

  const processForm: SubmitHandler<SecretsEditorSchemaType> = (data: Secret) => {
    onSave(data);
  };

  // When user click on cancel, several possibilities:
  // - create action: ask for discard approval
  // - update action: ask for discard approval if changed
  // - read action: don´t ask for discard approval
  function handleCancel(): void {
    if (JSON.stringify(initialSecretClean) !== JSON.stringify(form.getValues())) {
      setDiscardDialogOpened(true);
    } else {
      onClose();
    }
  }

  // Form errors are removed only from latest input touched
  // This will remove errors for others inputs
  useEffect(() => {
    if (form.formState.isValid) {
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isValid]);

  const [tabValue, setTabValue] = useState<string>(
    initialSecretClean.spec.basicAuth
      ? basicAuthIndex
      : initialSecretClean.spec.authorization
        ? authorizationIndex
        : initialSecretClean.spec.oauth
          ? oauthIndex
          : noAuthIndex
  );

  const handleTabChange = (event: SyntheticEvent, newValue: string): void => {
    form.setValue('spec.authorization', undefined);
    form.setValue('spec.basicAuth', undefined);
    form.setValue('spec.oauth', undefined);

    if (newValue === basicAuthIndex) {
      form.setValue('spec.basicAuth', { username: '', password: '', passwordFile: '' });
    } else if (newValue === authorizationIndex) {
      form.setValue('spec.authorization', { type: '', credentials: '', credentialsFile: '' });
    } else if (newValue === oauthIndex) {
      form.setValue('spec.oauth', {
        clientID: '',
        clientSecret: '',
        clientSecretFile: '',
        tokenURL: '',
        scopes: [],
        endpointParams: {},
        authStyle: 0,
      });
    }
    form.trigger();

    setTabValue(newValue);
  };

  return (
    <FormProvider {...form}>
      <div className="ps-SecretEditorForm-header">
        <h2>{titleAction} Secret</h2>
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
      <div className="ps-SecretEditorForm-content">
        <div className="ps-Stack ps-Stack-row">
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
                onChange={(event) => {
                  field.onChange(event);
                }}
              />
            )}
          />
        </div>
        <Separator className="ps-SecretEditorForm-divider" />

        <div className="ps-SecretEditorForm-tabs">
          <div className="ps-SecretEditorForm-tabHeader">
            <RadioGroup row value={tabValue} onChange={handleTabChange} aria-labelledby="Secret Authorization Setup">
              <FormControlLabel
                disabled={isReadonly}
                value={noAuthIndex}
                control={<Radio />}
                label="No Authorization"
              />
              <FormControlLabel
                disabled={isReadonly}
                value={basicAuthIndex}
                control={<Radio />}
                label="Basic Authorization"
              />
              <FormControlLabel
                disabled={isReadonly}
                value={authorizationIndex}
                control={<Radio />}
                label="Custom Authorization"
              />
              <FormControlLabel disabled={isReadonly} value={oauthIndex} control={<Radio />} label="OAuth" />
            </RadioGroup>
          </div>
          <TabPanel value={tabValue} index={basicAuthIndex}>
            <div className="ps-Stack">
              <Controller
                name="spec.basicAuth.username"
                render={({ field, fieldState }) => (
                  <FormTextField
                    {...field}
                    required
                    fullWidth
                    label="Username"
                    InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                    InputProps={{
                      readOnly: action === 'read',
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(event) => {
                      field.onChange(event);
                    }}
                  />
                )}
              />
              <div className="ps-Stack ps-Stack-row">
                <Controller
                  control={form.control}
                  name="spec.basicAuth.password"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="Password"
                      type="password"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <div className="ps-SecretEditorForm-orDivider">
                  <span>OR</span>
                </div>
                <Controller
                  control={form.control}
                  name="spec.basicAuth.passwordFile"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="Password File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </TabPanel>
          <TabPanel value={tabValue} index={authorizationIndex}>
            <div className="ps-Stack">
              <Controller
                control={form.control}
                name="spec.authorization.type"
                render={({ field, fieldState }) => (
                  <FormTextField
                    {...field}
                    fullWidth
                    label="Type"
                    InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                    InputProps={{
                      readOnly: action === 'read',
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(event) => {
                      field.onChange(event);
                    }}
                  />
                )}
              />
              <div className="ps-Stack ps-Stack-row">
                <Controller
                  control={form.control}
                  name="spec.authorization.credentials"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="Credentials"
                      type="password"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <div className="ps-SecretEditorForm-orDivider">
                  <span>OR</span>
                </div>
                <Controller
                  control={form.control}
                  name="spec.authorization.credentialsFile"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="Credentials File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </TabPanel>
          <TabPanel value={tabValue} index={oauthIndex}>
            <div className="ps-Stack">
              <Controller
                control={form.control}
                name="spec.oauth.clientID"
                render={({ field, fieldState }) => (
                  <FormTextField
                    {...field}
                    required
                    fullWidth
                    label="Client ID"
                    type="password"
                    InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                    InputProps={{
                      readOnly: action === 'read',
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(event) => {
                      field.onChange(event);
                    }}
                  />
                )}
              />
              <div className="ps-Stack ps-Stack-row">
                <Controller
                  control={form.control}
                  name="spec.oauth.clientSecret"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="Client Secret"
                      type="password"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <div className="ps-SecretEditorForm-orDivider">
                  <span>OR</span>
                </div>
                <Controller
                  control={form.control}
                  name="spec.oauth.clientSecretFile"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="Client Secret File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </div>
              <div className="ps-Stack ps-Stack-row">
                <Controller
                  control={form.control}
                  name="spec.oauth.tokenURL"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      required
                      fullWidth
                      label="Token URL"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </div>
              <div className="ps-Stack">
                <span className="ps-SecretEditorForm-subtitle">Scopes</span>
                <Controller
                  control={form.control}
                  name="spec.oauth.scopes"
                  render={({ field }) => {
                    const scopes = field.value || [];

                    const addScope = (): void => {
                      field.onChange([...scopes, '']);
                    };

                    const removeScope = (index: number): void => {
                      const newScopes = scopes.filter((_, i) => i !== index);
                      field.onChange(newScopes);
                    };

                    const updateScope = (index: number, value: string): void => {
                      const newScopes = [...scopes];
                      newScopes[index] = value;
                      field.onChange(newScopes);
                    };

                    return (
                      <div className="ps-Stack">
                        {scopes.map((scope, index) => (
                          <div key={index} className="ps-Stack ps-Stack-row ps-Stack-sm ps-Stack-alignCenter">
                            <FormTextField
                              fullWidth
                              value={scope}
                              placeholder="Enter scope"
                              InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                              InputProps={{
                                readOnly: action === 'read',
                              }}
                              onChange={(e) => updateScope(index, e.target.value)}
                            />
                            {!isReadonly && (
                              <IconButton
                                aria-label="Remove scope"
                                onClick={() => removeScope(index)}
                                size="sm"
                                className="ps-SecretEditorForm-deleteBtn"
                              >
                                <TrashIcon />
                              </IconButton>
                            )}
                          </div>
                        ))}
                        {!isReadonly && (
                          <Button
                            startIcon={<PlusIcon />}
                            onClick={addScope}
                            variant="outlined"
                            style={{ width: 'fit-content' }}
                          >
                            Add Scope
                          </Button>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
              <div className="ps-Stack">
                <span className="ps-SecretEditorForm-subtitle">Endpoint Params</span>
                <Controller
                  control={form.control}
                  name="spec.oauth.endpointParams"
                  render={({ field }) => {
                    const params: EndpointParams = field.value || {};

                    const addParam = (): void => {
                      const newParams: EndpointParams = {
                        ...params,
                        '': [''],
                      };
                      field.onChange(newParams);
                    };

                    const removeParam = (keyToRemove: string): void => {
                      const newParams: EndpointParams = Object.entries(params)
                        .filter(([key]) => key !== keyToRemove)
                        .reduce(
                          (acc, [key, value]) => ({
                            ...acc,
                            [key]: value,
                          }),
                          {}
                        );
                      field.onChange(newParams);
                    };

                    const updateParamKey = (oldKey: string, newKey: string): void => {
                      const newParams: EndpointParams = Object.entries(params).reduce(
                        (acc, [key, val]) => ({
                          ...acc,
                          [key === oldKey ? newKey : key]: val,
                        }),
                        {}
                      );
                      field.onChange(newParams);
                    };

                    const updateParamValue = (key: string, values: string[]): void => {
                      const newParams: EndpointParams = {
                        ...params,
                        [key]: values,
                      };
                      field.onChange(newParams);
                    };

                    const addValueToParam = (key: string): void => {
                      const currentValues = params[key] || [];
                      updateParamValue(key, [...currentValues, '']);
                    };

                    const removeValueFromParam = (key: string, indexToRemove: number): void => {
                      const currentValues = params[key] || [];
                      updateParamValue(
                        key,
                        currentValues.filter((_, index) => index !== indexToRemove)
                      );
                    };

                    const updateValue = (key: string, valueIndex: number, newValue: string): void => {
                      const currentValues = [...(params[key] || [])];
                      currentValues[valueIndex] = newValue;
                      updateParamValue(key, currentValues);
                    };

                    return (
                      <div className="ps-Stack">
                        {Object.entries(params).map(([key, values], paramIndex) => (
                          <div key={paramIndex} className="ps-Stack ps-Stack-sm">
                            <div className="ps-Stack ps-Stack-row ps-Stack-sm ps-Stack-alignCenter">
                              <FormTextField
                                value={key}
                                placeholder="Parameter name"
                                InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                                InputProps={{
                                  readOnly: action === 'read',
                                }}
                                onChange={(e) => updateParamKey(key, e.target.value)}
                              />
                              {!isReadonly && (
                                <IconButton aria-label="Remove parameter" onClick={() => removeParam(key)} size="sm">
                                  <TrashIcon />
                                </IconButton>
                              )}
                            </div>
                            <div className="ps-Stack ps-Stack-sm ps-SecretEditorForm-nested">
                              {values.map((value, valueIndex) => (
                                <div
                                  key={valueIndex}
                                  className="ps-Stack ps-Stack-row ps-Stack-sm ps-Stack-alignCenter"
                                >
                                  <FormTextField
                                    fullWidth
                                    value={value}
                                    placeholder="Parameter value"
                                    InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                                    InputProps={{
                                      readOnly: action === 'read',
                                    }}
                                    onChange={(e) => updateValue(key, valueIndex, e.target.value)}
                                  />
                                  {!isReadonly && values.length > 1 && (
                                    <IconButton
                                      aria-label="Remove value"
                                      onClick={() => removeValueFromParam(key, valueIndex)}
                                      size="sm"
                                    >
                                      <TrashIcon />
                                    </IconButton>
                                  )}
                                </div>
                              ))}
                              {!isReadonly && (
                                <Button
                                  startIcon={<PlusIcon />}
                                  onClick={() => addValueToParam(key)}
                                  variant="outlined"
                                  style={{ width: 'fit-content' }}
                                >
                                  Add Value
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {!isReadonly && (
                          <Button
                            startIcon={<PlusIcon />}
                            onClick={addParam}
                            variant="outlined"
                            style={{ width: 'fit-content' }}
                          >
                            Add Parameter
                          </Button>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
              <div className="ps-Stack ps-Stack-row">
                <Controller
                  control={form.control}
                  name="spec.oauth.authStyle"
                  render={({ field, fieldState }) => (
                    <Tooltip
                      content={
                        field.value === 0
                          ? 'Automatically detect the best auth style to use based on the provider'
                          : field.value === 1
                            ? 'Send OAuth credentials as URL parameters'
                            : field.value === 2
                              ? 'Send OAuth credentials using HTTP Basic Authorization'
                              : ''
                      }
                      placement="right"
                    >
                      <FormTextField
                        select
                        fullWidth
                        label="Auth Style"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                        InputProps={{
                          readOnly: action === 'read',
                        }}
                        value={field.value ?? 0}
                        onChange={(event) => {
                          const val = (event.target as HTMLSelectElement).value;
                          field.onChange(val === '' ? undefined : +val);
                        }}
                      >
                        <option value={0}>Auto Detect</option>
                        <option value={1}>In Params</option>
                        <option value={2}>In Header</option>
                      </FormTextField>
                    </Tooltip>
                  )}
                />
              </div>
            </div>
          </TabPanel>
        </div>
        <div className="ps-Stack ps-Stack-sm">
          <div className="ps-Stack ps-Stack-row ps-Stack-spaceBetween">
            <h1>TLS Config</h1>
            {isTLSConfigEnabled && (
              <IconButton
                aria-label="Remove TLS config"
                onClick={() => {
                  setTLSConfigEnabled(false);
                  form.setValue('spec.tlsConfig', undefined);
                  form.trigger();
                }}
              >
                <TrashIcon />
              </IconButton>
            )}
          </div>
          {isTLSConfigEnabled ? (
            <div className="ps-Stack">
              <div className="ps-Stack ps-Stack-row">
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.ca"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      multiline
                      minRows={4}
                      maxRows={8}
                      label="CA"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <div className="ps-SecretEditorForm-orDivider">
                  <span>OR</span>
                </div>
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.caFile"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="CA File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </div>
              <div className="ps-Stack ps-Stack-row">
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.cert"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      multiline
                      minRows={4}
                      maxRows={8}
                      label="Cert"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <div className="ps-SecretEditorForm-orDivider">
                  <span>OR</span>
                </div>
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.certFile"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="Cert File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </div>
              <div className="ps-Stack ps-Stack-row">
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.key"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      multiline
                      minRows={4}
                      maxRows={8}
                      label="Key"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <div className="ps-SecretEditorForm-orDivider">
                  <span>OR</span>
                </div>
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.keyFile"
                  render={({ field, fieldState }) => (
                    <FormTextField
                      {...field}
                      fullWidth
                      label="Key File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </div>
              <Controller
                control={form.control}
                name="spec.tlsConfig.serverName"
                render={({ field, fieldState }) => (
                  <FormTextField
                    {...field}
                    fullWidth
                    label="Server Name"
                    InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                    InputProps={{
                      readOnly: action === 'read',
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(event) => {
                      field.onChange(event);
                    }}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="spec.tlsConfig.insecureSkipVerify"
                render={({ field }) => (
                  <Switch
                    label="Insecure Skip Verify"
                    checked={!!field.value}
                    disabled={action === 'read'}
                    onChange={(checked) => {
                      if (action === 'read') return;
                      field.onChange(checked);
                    }}
                  />
                )}
              />
            </div>
          ) : (
            <IconButton
              aria-label="Add TLS config"
              className="ps-SecretEditorForm-addBtn"
              onClick={() => {
                form.setValue('spec.tlsConfig', {
                  ca: '',
                  caFile: '',
                  cert: '',
                  certFile: '',
                  key: '',
                  keyFile: '',
                  serverName: '',
                  insecureSkipVerify: false,
                });
                setTLSConfigEnabled(true);
              }}
            >
              <PlusIcon />
            </IconButton>
          )}
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

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  index: string;
  value: string;
}

function TabPanel({ children, value, index, ...props }: TabPanelProps): ReactElement {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`secret-form-tabpanel-${index}`}
      aria-labelledby={`secret-form-tab-${index}`}
      {...props}
    >
      {value === index && children}
    </div>
  );
}
