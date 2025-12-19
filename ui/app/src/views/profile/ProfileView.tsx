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

import { Avatar, Separator } from '@perses-dev/components';
import './ProfileView.css';
import { lazy, ReactElement, Suspense, useState } from 'react';
import { useIsMobileSize } from '../../utils/browser-size';
import { useAuthorizationContext } from '../../context/Authorization';
import { ProfileSettings } from './ProfileSettings';

export enum ProfileSections {
  AUTHENTICATION,
  PERMISSIONS,
}

const ProfilePermissions = lazy(() => import('./ProfilePermissions'));

const ProfileView = (): ReactElement => {
  const isMobileSize = useIsMobileSize();
  const [activeSection, setActiveSection] = useState<ProfileSections>(ProfileSections.PERMISSIONS);
  const { username } = useAuthorizationContext();

  const renderActiveSection = (): ReactElement | null => {
    switch (activeSection) {
      case ProfileSections.PERMISSIONS:
        return <ProfilePermissions />;
      default:
        return null;
    }
  };

  return (
    <div
      data-testid="profile-view-container"
      className={`ps-ProfileView ${isMobileSize ? 'ps-ProfileView--mobile' : ''}`}
    >
      <nav aria-label="Profile navigation" data-testid="profile-sidebar" className="ps-ProfileView-sidebar">
        <div className="ps-ProfileView-userInfo">
          {/* TODO: Shouldn't we later add the user profile image? */}
          <Avatar aria-label={`User profile image for ${username}`} />
          <h1 className="ps-ProfileView-username">{username}</h1>
        </div>
        <Separator className="ps-ProfileView-divider" />
        <ProfileSettings selectedView={activeSection} setSelectedView={setActiveSection} />
      </nav>
      <div
        aria-live="polite"
        data-testid="profile-section-container"
        className={`ps-ProfileView-section ${isMobileSize ? 'ps-ProfileView-section--mobile' : ''}`}
      >
        <Suspense>{renderActiveSection()}</Suspense>
      </div>
    </div>
  );
};

export default ProfileView;
