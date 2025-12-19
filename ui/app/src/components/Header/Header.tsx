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

import { Link as RouterLink } from 'react-router-dom';
import { Button, Separator, useIcon } from '@perses-dev/components';
import React from 'react';
import { useIsLaptopSize, useIsMobileSize } from '../../utils/browser-size';
import { AdminRoute, ConfigRoute } from '../../model/route';
import { useIsAuthEnabled, useIsExplorerEnabled } from '../../context/Config';
import { GlobalProject, useHasPartialPermission } from '../../context/Authorization';
import WhitePersesLogo from '../logo/WhitePersesLogo';
import PersesLogoCropped from '../logo/PersesLogoCropped';
import { BannerInfo } from '../BannerInfo';
import { ToolMenu } from './ToolMenu';
import { AccountMenu } from './AccountMenu';
import { ThemeSwitch } from './ThemeSwitch';
import { SearchBar } from './SearchBar/SearchBar';
import './Header.css';

export default function Header(): JSX.Element {
  const ShieldStarIcon = useIcon('ShieldStar');
  const CogIcon = useIcon('Settings');
  const CompassIcon = useIcon('Compass');
  const isLaptopSize = useIsLaptopSize();
  const isMobileSize = useIsMobileSize();
  const isAuthEnabled = useIsAuthEnabled();
  const IsExplorerEnabled = useIsExplorerEnabled();

  const hasPartialPermission = useHasPartialPermission(['read'], GlobalProject, [
    'GlobalDatasource',
    'GlobalRole',
    'GlobalRoleBinding',
    'GlobalSecret',
    'GlobalVariable',
    'User',
  ]);

  return (
    <header className="ps-Header">
      <div className="ps-Header-toolbar">
        <div className="ps-Header-left" data-mobile={isMobileSize || undefined}>
          <RouterLink to="/" className="ps-Header-logo">
            {isLaptopSize ? <WhitePersesLogo /> : <PersesLogoCropped color="white" width={32} height={32} />}
          </RouterLink>
          <Separator orientation="vertical" className="ps-Header-divider" />
          {!isMobileSize ? (
            <>
              {hasPartialPermission && (
                <Button
                  variant="ghost"
                  aria-label="Administration"
                  aria-controls="menu-admin-appbar"
                  aria-haspopup="true"
                  className="ps-Header-navButton"
                >
                  <RouterLink to={AdminRoute}>
                    <ShieldStarIcon className="ps-Header-navIcon" /> Admin
                  </RouterLink>
                </Button>
              )}
              <Button
                variant="ghost"
                aria-label="Config"
                aria-controls="menu-config-appbar"
                aria-haspopup="true"
                className="ps-Header-navButton"
              >
                <RouterLink to={ConfigRoute}>
                  <CogIcon className="ps-Header-navIcon" /> Config
                </RouterLink>
              </Button>
              {IsExplorerEnabled && (
                <Button
                  variant="ghost"
                  aria-label="Explore"
                  aria-controls="menu-config-appbar"
                  aria-haspopup="true"
                  className="ps-Header-navButton"
                >
                  <RouterLink to="/explore">
                    <CompassIcon className="ps-Header-navIcon" /> Explore
                  </RouterLink>
                </Button>
              )}
            </>
          ) : (
            <ToolMenu />
          )}
        </div>
        <SearchBar />
        <div className="ps-Header-right" data-mobile={isMobileSize || undefined}>
          {isAuthEnabled ? <AccountMenu /> : <ThemeSwitch isAuthEnabled={false} />}
        </div>
      </div>
      <BannerInfo />
    </header>
  );
}
