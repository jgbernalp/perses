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

import { ReactElement } from 'react';
import { useIcon } from '@perses-dev/components';
import { useInformation } from '../../context/Config';
import './InformationSection.css';

/*
 * Information section is displayed if there is information provided by the config
 */
export function InformationSection(): ReactElement {
  const InfoIcon = useIcon('Info');
  const data = useInformation();

  if (!data) {
    return <></>;
  }

  return (
    <div className="ps-InformationSection">
      <div className="ps-InformationSection-header">
        <InfoIcon />
        <h2>Information</h2>
      </div>
      <div className="ps-InformationSection-card">
        <div className="ps-InformationSection-content" dangerouslySetInnerHTML={{ __html: data }}></div>
      </div>
    </div>
  );
}
