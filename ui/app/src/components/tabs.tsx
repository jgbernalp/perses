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

import { Tabs, TabsList, TabTrigger } from '@perses-dev/components';
import clsx from 'clsx';
import { ComponentPropsWithoutRef, forwardRef, ForwardRefExoticComponent, RefAttributes } from 'react';
import './tabs.css';

export const MENU_TABS_HEIGHT = '54px';

type TabsListProps = ComponentPropsWithoutRef<typeof TabsList>;
type TabTriggerProps = ComponentPropsWithoutRef<typeof TabTrigger>;

export const MenuTabs: ForwardRefExoticComponent<TabsListProps & RefAttributes<HTMLDivElement>> = forwardRef<
  HTMLDivElement,
  TabsListProps
>(function MenuTabs({ className, ...props }, ref) {
  return <TabsList ref={ref} className={clsx('ps-MenuTabs', className)} {...props} />;
});

export const MenuTab: ForwardRefExoticComponent<TabTriggerProps & RefAttributes<HTMLButtonElement>> = forwardRef<
  HTMLButtonElement,
  TabTriggerProps
>(function MenuTab({ className, ...props }, ref) {
  return <TabTrigger ref={ref} className={clsx('ps-MenuTab', className)} {...props} />;
});
