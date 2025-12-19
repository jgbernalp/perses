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

import { useParams } from 'react-router-dom';
import { ReactElement } from 'react';
import { useIcon } from '@perses-dev/components';
import AppBreadcrumbs from '../../components/breadcrumbs/AppBreadcrumbs';
import { useIsMobileSize } from '../../utils/browser-size';
import { AdminTabs } from './AdminTabs';
import './AdminView.css';

function AdminView(): ReactElement {
  const ShieldStarIcon = useIcon('ShieldStar');
  const { tab } = useParams();
  const isMobileSize = useIsMobileSize();

  return (
    <div className={`ps-AdminView ${isMobileSize ? 'ps-AdminView--mobile' : ''}`}>
      <AppBreadcrumbs rootPageName="Administration" icon={<ShieldStarIcon fontSize="large" />} />
      <AdminTabs initialTab={tab} />
    </div>
  );
}

export default AdminView;
