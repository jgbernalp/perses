// Copyright 2025 The Perses Authors
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

import { ReactElement, useState } from 'react';
import './ConfigView.css';
import { JSONEditor, Tabs, useIcon } from '@perses-dev/components';
import { MenuTab, MenuTabs } from '../../components/tabs';

import AppBreadcrumbs from '../../components/breadcrumbs/AppBreadcrumbs';
import { useConfigContext } from '../../context/Config';
import { useIsMobileSize } from '../../utils/browser-size';
import { PluginsList } from './PluginsList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps): ReactElement | null {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <div className="ps-ConfigView-tabContent">{children}</div>}
    </div>
  );
}

function ConfigView(): ReactElement {
  const SettingsIcon = useIcon('Settings');
  const PuzzleIcon = useIcon('Puzzle');
  const { config } = useConfigContext();
  const isMobileSize = useIsMobileSize();
  const [tabIndex, setTabIndex] = useState('0');

  const handleTabChange = (newValue: string): void => {
    setTabIndex(newValue);
  };

  return (
    <div className={`ps-ConfigView ${isMobileSize ? 'ps-ConfigView--mobile' : ''}`}>
      <AppBreadcrumbs rootPageName="Configuration" icon={<SettingsIcon fontSize="large" />} />
      <div className="ps-ConfigView-content">
        <Tabs value={tabIndex} onValueChange={handleTabChange} aria-label="configuration tabs">
          <div className="ps-ConfigView-header">
            <MenuTabs aria-label="configuration tabs">
              <MenuTab
                icon={<SettingsIcon />}
                label="Server Configuration"
                id="tab-0"
                value="0"
                aria-controls="tabpanel-0"
              />
              <MenuTab
                icon={<PuzzleIcon />}
                label="Installed Plugins"
                id="tab-1"
                value="1"
                aria-controls="tabpanel-1"
              />
            </MenuTabs>
          </div>
          <TabPanel value={tabIndex} index="0">
            <JSONEditor value={config} readOnly />
          </TabPanel>
          <TabPanel value={tabIndex} index="1">
            <PluginsList />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

export default ConfigView;
