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

import { Button, Separator, useSnackbar } from '@perses-dev/components';
import { PluginModuleResource } from '@perses-dev/plugin-system';
import { ReactElement, useMemo, useState } from 'react';
import { PersesLoader } from '../../components/PersesLoader';
import { usePlugins } from '../../model/plugin-client';
import { PluginDetailsDialog } from './PluginDetailsDialog';
import './PluginsList.css';

export function PluginsList(): ReactElement {
  const [selectedPluginModule, setSelectedPluginModule] = useState<PluginModuleResource | null>(null);
  const { exceptionSnackbar } = useSnackbar();

  const { data: pluginModules, isLoading, error } = usePlugins();

  const sortedPluginModules = useMemo(() => {
    return (pluginModules ?? []).toSorted((a, b) => a.metadata.name.localeCompare(b.metadata.name));
  }, [pluginModules]);

  if (isLoading || pluginModules === undefined) {
    return <PersesLoader />;
  }

  if (error) {
    exceptionSnackbar(error);
  }

  const handleOpenPluginDetails = (pluginModule: PluginModuleResource): void => {
    setSelectedPluginModule(pluginModule);
  };

  const handleClosePluginDetails = (): void => {
    setSelectedPluginModule(null);
  };

  return (
    <div className="ps-PluginsList">
      <div className="ps-PluginsList-grid">
        {sortedPluginModules.map((pluginModule) => (
          <div className="ps-PluginsList-gridItem" key={pluginModule.metadata.name}>
            <div className="ps-PluginsList-card">
              <div className="ps-PluginsList-cardContent">
                <h3 className="ps-PluginsList-title">{pluginModule?.metadata?.name}</h3>
                <span>Version {pluginModule.metadata.version}</span>
                <Separator className="ps-PluginsList-divider" />
                <div>
                  {
                    // Case 1: No plugins available
                    (!pluginModule?.spec?.plugins || pluginModule?.spec?.plugins.length === 0) && (
                      <span className="ps-PluginsList-noPlugins">No plugins available 😢</span>
                    )
                  }
                  {
                    // Case 2: Single plugin
                    pluginModule?.spec?.plugins.length === 1 && (
                      <div className="ps-PluginsList-singlePlugin">
                        <span className="ps-PluginsList-kindText">
                          <strong>Kind:</strong> {pluginModule?.spec?.plugins[0]?.kind}
                        </span>
                      </div>
                    )
                  }
                  {
                    // Case 3: Multiple plugins
                    pluginModule?.spec?.plugins.length > 1 && (
                      <div>
                        <Button color="secondary" onClick={() => handleOpenPluginDetails(pluginModule)}>
                          View {pluginModule.spec.plugins.length} Plugins
                        </Button>
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PluginDetailsDialog selectedPluginModule={selectedPluginModule} onClose={handleClosePluginDetails} />
    </div>
  );
}
