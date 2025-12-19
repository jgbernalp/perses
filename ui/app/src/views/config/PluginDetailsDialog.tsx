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

import { PluginModuleResource } from '@perses-dev/plugin-system';
import { Dialog, Separator, List, ListItem, ListItemText } from '@perses-dev/components';
import './PluginDetailsDialog.css';
import { Fragment, ReactElement } from 'react';

interface PluginDetailsDialogProps {
  selectedPluginModule: PluginModuleResource | null;
  onClose: () => void;
}

export function PluginDetailsDialog({ selectedPluginModule, onClose }: PluginDetailsDialogProps): ReactElement | null {
  if (!selectedPluginModule) {
    return null;
  }

  return (
    <Dialog open={!!selectedPluginModule} onClose={onClose}>
      <Dialog.Header onClose={onClose}>Plugins for {selectedPluginModule.metadata.name} Module</Dialog.Header>
      <Dialog.Content className="ps-PluginDetailsDialog-content">
        <List>
          <div className="ps-PluginDetailsDialog-list">
            {selectedPluginModule.spec.plugins.map((pluginItem, index) => (
              <Fragment key={index}>
                {index > 0 && <Separator />}
                <ListItem>
                  <ListItemText
                    primary={<strong>{pluginItem.spec.name}</strong>}
                    secondary={<span className="ps-PluginDetailsDialog-kind">Kind: {pluginItem.kind}</span>}
                  />
                </ListItem>
              </Fragment>
            ))}
          </div>
        </List>
      </Dialog.Content>
    </Dialog>
  );
}
