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

import { ReactElement } from 'react';
import { IconButton, Menu, MenuContent, MenuItem, MenuTrigger, Separator, useIcon } from '@perses-dev/components';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthToken } from '../../model/auth-client';
import { ProfileRoute } from '../../model/route';
import { ThemeSwitch } from './ThemeSwitch';
import './AccountMenu.css';

export function AccountMenu(): ReactElement {
  const AccountCircleIcon = useIcon('AccountCircle');
  const AccountBoxIcon = useIcon('AccountBox');
  const LogoutIcon = useIcon('Logout');
  const { data: decodedToken } = useAuthToken();

  return (
    <Menu>
      <MenuTrigger>
        <IconButton
          aria-label="Account menu"
          aria-controls="menu-account-list-appbar"
          aria-haspopup="true"
          className="ps-AccountMenu-trigger"
        >
          <AccountCircleIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent id="menu-account-list-appbar">
        <MenuItem disabled>
          <AccountCircleIcon className="ps-AccountMenu-icon" />
          {decodedToken?.sub}
        </MenuItem>
        <Separator />
        <ThemeSwitch isAuthEnabled />
        <MenuItem>
          <RouterLink to={ProfileRoute} className="ps-AccountMenu-item">
            <AccountBoxIcon className="ps-AccountMenu-icon" />
            Profile
          </RouterLink>
        </MenuItem>
        <MenuItem>
          <a href="/api/auth/logout" className="ps-AccountMenu-item">
            <LogoutIcon className="ps-AccountMenu-icon" />
            Logout
          </a>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
