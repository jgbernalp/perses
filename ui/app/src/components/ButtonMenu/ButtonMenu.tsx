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

import { Button, Menu, MenuContent, MenuItem, MenuTrigger, useIcon } from '@perses-dev/components';
import { ReactElement } from 'react';
import './ButtonMenu.css';

export interface ButtonMenuProps {
  children: JSX.Element[];
}

/**
 * ButtonMenu is a button with a drop down menu for more actions.
 * The first child is the button, the other are the menu entries.
 **/
const ButtonMenu = ({ children }: ButtonMenuProps): ReactElement => {
  const ChevronDownIcon = useIcon('ChevronDown');
  const primary = children[0];
  const menuEntries = children.slice(1);

  return (
    <div className="ps-ButtonMenu">
      {primary}
      <Menu>
        <MenuTrigger>
          <Button size="sm" variant="solid" aria-haspopup="menu" className="ps-ButtonMenu-trigger">
            <ChevronDownIcon />
          </Button>
        </MenuTrigger>
        <MenuContent>
          {menuEntries.map((entry, index) => (
            <MenuItem key={index}>{entry}</MenuItem>
          ))}
        </MenuContent>
      </Menu>
    </div>
  );
};

export default ButtonMenu;
