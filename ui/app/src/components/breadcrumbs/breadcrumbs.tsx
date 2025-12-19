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

import React, { ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import './breadcrumbs.css';

export interface BreadcrumbsProps {
  children?: React.ReactNode;
  id?: string;
  className?: string;
}

export function Breadcrumbs(props: BreadcrumbsProps): ReactElement {
  const { children, id, className } = props;
  return (
    <nav id={id} className={`ps-Breadcrumbs ${className || ''}`} aria-label="breadcrumb">
      <ol className="ps-Breadcrumbs-list">
        {React.Children.map(children, (child, index) => (
          <li key={index} className="ps-Breadcrumbs-item">
            {index > 0 && <span className="ps-Breadcrumbs-separator">/</span>}
            {child}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function HomeLinkCrumb(): ReactElement {
  return <LinkCrumb to="/">Home</LinkCrumb>;
}

export interface StackCrumbProps {
  children?: React.ReactNode;
}

export function StackCrumb(props: StackCrumbProps): ReactElement {
  const { children } = props;

  return <span className="ps-StackCrumb">{children}</span>;
}

export interface LinkCrumbProps {
  children?: React.ReactNode;
  to: string;
}

export function LinkCrumb(props: LinkCrumbProps): ReactElement {
  const { children, to } = props;

  return (
    <RouterLink to={to} className="ps-LinkCrumb">
      {children}
    </RouterLink>
  );
}

export interface TitleCrumbProps {
  children?: React.ReactNode;
}

export function TitleCrumb(props: TitleCrumbProps): ReactElement {
  const { children } = props;

  return <h1 className="ps-TitleCrumb">{children}</h1>;
}
