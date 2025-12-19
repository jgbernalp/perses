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

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Chip,
  Separator,
  SimpleTable,
  SimpleTableBody,
  SimpleTableCell,
  SimpleTableContainer,
  SimpleTableHead,
  SimpleTableRow,
  useIcon,
} from '@perses-dev/components';
import './ProfilePermissions.css';

import { ReactElement, useMemo, useState } from 'react';
import { useUserPermissions } from '../../model/user-client';
import { useAuthorizationContext } from '../../context/Authorization';
import { normalizePermissions } from './profile-permissions-utils';

const ProfilePermissions = (): ReactElement => {
  const ShieldAccountIcon = useIcon('ShieldAccount');
  const ArchiveIcon = useIcon('Archive');
  const ChevronDownIcon = useIcon('ChevronDown');
  const { username } = useAuthorizationContext();
  const { data: permissions } = useUserPermissions(username);
  const [expandedAccording, setExpandedAccording] = useState<string[]>(['*']);

  const normalizedPermissions = useMemo(
    () =>
      normalizePermissions(
        Object.keys(permissions || {}).map((key) => ({
          key,
          permissions: permissions?.[key] || [],
        }))
      ),
    [permissions]
  );

  return (
    <div data-testid="permissions-container" className="ps-ProfilePermissions">
      <div className="ps-ProfilePermissions-header">
        <ShieldAccountIcon style={{ fontSize: 24 }} />
        <h1 className="ps-ProfilePermissions-title">Permissions and roles</h1>
      </div>
      <Separator className="ps-ProfilePermissions-divider" />
      <div className="ps-ProfilePermissions-content">
        {normalizedPermissions.map((item) => (
          <Accordion
            data-testid={`${item.key}-according`}
            className={`ps-ProfilePermissions-accordion ${expandedAccording.includes(item.key) ? 'ps-ProfilePermissions-accordion--expanded' : ''}`}
            value={expandedAccording}
            onValueChange={(value) => setExpandedAccording(Array.isArray(value) ? value : [value])}
            key={item.key}
          >
            <AccordionItem value={item.key}>
              <AccordionTrigger
                className={`ps-ProfilePermissions-accordionTrigger ${expandedAccording.includes(item.key) ? 'ps-ProfilePermissions-accordionTrigger--expanded' : ''}`}
              >
                <div className="ps-ProfilePermissions-accordionTitle">
                  {item.key !== '*' && <ArchiveIcon style={{ fontSize: 24 }} />}
                  <h2>{item.key === '*' ? 'Global' : item.key}</h2>
                </div>
                <ChevronDownIcon className="ps-ProfilePermissions-accordionIcon" />
              </AccordionTrigger>
              <AccordionContent className="ps-ProfilePermissions-accordionPanel">
                <SimpleTableContainer>
                  <SimpleTable size="small">
                    <SimpleTableHead>
                      <SimpleTableRow>
                        <SimpleTableCell>
                          <strong className="ps-ProfilePermissions-tableHeader">Actions</strong>
                        </SimpleTableCell>
                        <SimpleTableCell>
                          <strong className="ps-ProfilePermissions-tableHeader">Scopes</strong>
                        </SimpleTableCell>
                      </SimpleTableRow>
                    </SimpleTableHead>
                    <SimpleTableBody>
                      {(item.permissions || []).map((permission, index) =>
                        permission.actions.length && permission.scopes.length ? (
                          <SimpleTableRow
                            data-testid={`${item.key}-permission-${index}`}
                            key={`permission-${index}`}
                            className={`ps-ProfilePermissions-tableRow ${index !== item.permissions.length - 1 ? 'ps-ProfilePermissions-tableRow--border' : ''}`}
                          >
                            <SimpleTableCell className="ps-ProfilePermissions-tableCell">
                              <div className="ps-ProfilePermissions-chips">
                                {!permission.actions.includes('*') ? (
                                  permission.actions.map((a) => (
                                    <Chip
                                      data-testid={`${item.key}-permission-${index}-action-${a}`}
                                      key={`permission-${index}-${a}`}
                                      label={a}
                                    />
                                  ))
                                ) : (
                                  <Chip
                                    data-testid={`${item.key}-permission-${index}-action-all`}
                                    key={`permission-${index}-all`}
                                    className="ps-ProfilePermissions-chip--bold"
                                    label="All Actions"
                                  />
                                )}
                              </div>
                            </SimpleTableCell>
                            <SimpleTableCell className="ps-ProfilePermissions-tableCell">
                              <div className="ps-ProfilePermissions-chips">
                                {!permission.scopes.includes('*') ? (
                                  permission.scopes.map((s) => (
                                    <Chip
                                      data-testid={`${item.key}-permission-${index}-scope-${s}`}
                                      key={`permission-${index}-${s}`}
                                      label={s}
                                    />
                                  ))
                                ) : (
                                  <Chip
                                    data-testid={`${item.key}-permission-${index}-scope-all`}
                                    key={`permission-${index}-all`}
                                    className="ps-ProfilePermissions-chip--bold"
                                    label="All Resources"
                                  />
                                )}
                              </div>
                            </SimpleTableCell>
                          </SimpleTableRow>
                        ) : null
                      )}
                    </SimpleTableBody>
                  </SimpleTable>
                </SimpleTableContainer>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default ProfilePermissions;
