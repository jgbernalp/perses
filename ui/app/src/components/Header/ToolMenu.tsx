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

import React, { ReactElement } from 'react';
import { IconButton, Menu, MenuContent, MenuItem, MenuTrigger, useIcon } from '@perses-dev/components';
import { Link as RouterLink } from 'react-router-dom';
import { AdminRoute, ConfigRoute, ExploreRoute } from '../../model/route';
import { GlobalProject, useHasPartialPermission } from '../../context/Authorization';
import './ToolMenu.css';

export function ToolMenu(): ReactElement {
  const MenuIcon = useIcon('Menu');
  const ShieldStarIcon = useIcon('ShieldStar');
  const CogIcon = useIcon('Settings');
  const CompassIcon = useIcon('Compass');
  const hasPartialPermission = useHasPartialPermission(['read'], GlobalProject, [
    'GlobalDatasource',
    'GlobalRole',
    'GlobalRoleBinding',
    'GlobalSecret',
    'GlobalVariable',
    'User',
  ]);

  return (
    <Menu>
      <MenuTrigger>
        <IconButton
          aria-label="Tooling menu"
          aria-controls="menu-tool-list-appbar"
          aria-haspopup="true"
          className="ps-ToolMenu-trigger"
        >
          <MenuIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent id="menu-tool-list-appbar">
        {hasPartialPermission && (
          <MenuItem>
            <RouterLink to={AdminRoute} className="ps-ToolMenu-item">
              <ShieldStarIcon className="ps-ToolMenu-icon" />
              <span>Admin</span>
            </RouterLink>
          </MenuItem>
        )}
        <MenuItem>
          <RouterLink to={ConfigRoute} className="ps-ToolMenu-item">
            <CogIcon className="ps-ToolMenu-icon" />
            <span>Config</span>
          </RouterLink>
        </MenuItem>
        <MenuItem>
          <RouterLink to={ExploreRoute} className="ps-ToolMenu-item">
            <CompassIcon className="ps-ToolMenu-icon" />
            <span>Explore</span>
          </RouterLink>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
