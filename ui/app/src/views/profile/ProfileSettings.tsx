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

import { List, ListItem, ListItemIcon, ListItemText, useIcon } from '@perses-dev/components';
import './ProfileSettings.css';
import React, { ReactElement } from 'react';
import { ProfileSections } from './ProfileView';

interface IAccountSettingItem {
  title: string;
  view: ProfileSections;
  icon: ReactElement;
}

interface ISettingItems {
  title: string;
  items: IAccountSettingItem[];
}

interface IProps {
  setSelectedView: (selectedView: ProfileSections) => void;
  selectedView: ProfileSections;
}

export const ProfileSettings = ({ selectedView, setSelectedView }: IProps): ReactElement => {
  const ShieldAccountIcon = useIcon('ShieldAccount');
  const accountSettingsItems: IAccountSettingItem[] = [
    {
      title: 'Permissions and roles',
      view: ProfileSections.PERMISSIONS,
      icon: <ShieldAccountIcon className="ps-ProfileSettings-icon" />,
    },
  ];

  const settings: ISettingItems[] = [{ title: 'Account settings', items: accountSettingsItems }];

  const handleViewChange = (view: ProfileSections): void => {
    setSelectedView(view);
  };

  return (
    <div data-testid="profile-settings-container" className="ps-ProfileSettings">
      {settings.map((s) => (
        <React.Fragment key={s.title}>
          <div key={s.title} className="ps-ProfileSettings-titleRow">
            <h2>{s.title}</h2>
          </div>
          <List>
            {s.items.map((i) => (
              <ListItem
                role="button"
                key={i.view}
                onClick={() => handleViewChange(i.view)}
                className={`ps-ProfileSettings-listItem ${selectedView === i.view ? 'ps-ProfileSettings-listItem--selected' : ''}`}
              >
                <ListItemIcon className="ps-ProfileSettings-listItemIcon">{i.icon}</ListItemIcon>
                <ListItemText>
                  <h3 className="ps-ProfileSettings-itemTitle">{i.title}</h3>
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </React.Fragment>
      ))}
    </div>
  );
};
