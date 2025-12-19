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

import { Button, Tooltip, ButtonProps } from '@perses-dev/components';
import { Action, Scope } from '@perses-dev/core';
import { ReactElement, ReactNode, MouseEventHandler } from 'react';
import { useIsReadonly } from '../../context/Config';
import { GlobalProject, useHasPermission } from '../../context/Authorization';
import { useIsMobileSize } from '../../utils/browser-size';
import './CRUDButton.css';

export interface CRUDButtonProps extends Omit<ButtonProps, 'action'> {
  action?: Action;
  scope?: Scope;
  project?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/*
 * CRUDButton is an alias of Button, that will add a Tooltip with a reason if the button need to be disabled.
 * If action, scope and project are provided, it will check if the user has the permission to execute the action.
 */
export function CRUDButton({
  children,
  action,
  scope,
  project,
  variant,
  disabled,
  onClick,
  ...props
}: CRUDButtonProps): ReactElement {
  const isReadonly = useIsReadonly();
  const isMobileSize = useIsMobileSize();
  const hasPermission = useHasPermission(action ?? '*', project ?? GlobalProject, scope ?? '*');

  if (isReadonly) {
    return (
      <Tooltip content="Resource managed via code only">
        <span>
          <Button
            variant={variant}
            size="sm"
            className={isMobileSize ? 'ps-CRUDButton-mobile' : undefined}
            onClick={onClick}
            disabled
            {...props}
          >
            {children}
          </Button>
        </span>
      </Tooltip>
    );
  }

  if (!hasPermission && action && scope && project) {
    const errorMessage =
      project === GlobalProject
        ? `Missing '${action}' global permission for '${scope}' kind`
        : `Missing '${action}' permission in '${project}' project for '${scope}' kind`;

    return (
      <Tooltip content={errorMessage}>
        <span>
          <Button
            variant={variant}
            size="sm"
            className={isMobileSize ? 'ps-CRUDButton-mobile' : undefined}
            onClick={onClick}
            disabled
            {...props}
          >
            {children}
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={variant}
      size="sm"
      className={isMobileSize ? 'ps-CRUDButton-mobile' : undefined}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
}
