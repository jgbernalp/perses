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

import { useSnackbar, IconButton, Tooltip, MenuItem, useIcon } from '@perses-dev/components';
import React, { ReactElement } from 'react';
import { useDarkMode } from '../../context/DarkMode';
import './ThemeSwitch.css';

export function ThemeSwitch(props: { isAuthEnabled: boolean }): ReactElement {
  const SunIcon = useIcon('Sun');
  const MoonIcon = useIcon('Moon');
  const { isDarkModeEnabled, setDarkMode } = useDarkMode();
  const { exceptionSnackbar } = useSnackbar();
  const handleDarkModeChange = (): void => {
    try {
      setDarkMode(!isDarkModeEnabled);
    } catch (e) {
      exceptionSnackbar(e);
    }
  };
  const swapIcon = (): ReactElement => {
    return isDarkModeEnabled ? <SunIcon id="dark" /> : <MoonIcon id="light" />;
  };
  if (props.isAuthEnabled) {
    return (
      <MenuItem onSelect={handleDarkModeChange} startIcon={swapIcon()}>
        Switch Theme
      </MenuItem>
    );
  }
  return (
    <Tooltip content="Switch Theme">
      <IconButton onClick={handleDarkModeChange} aria-label="Theme" className="ps-ThemeSwitch-button">
        {swapIcon()}
      </IconButton>
    </Tooltip>
  );
}
