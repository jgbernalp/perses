// Copyright 2022 The Perses Authors
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

package config

import "time"

const (
	defaultPanelsPath      = "schemas/panels"
	defaultQueriesPath     = "schemas/queries"
	defaultDatasourcesPath = "schemas/datasources"
	defaultInterval        = 1 * time.Hour
)

type Schemas struct {
	PanelsPath      string        `yaml:"panels_path,omitempty"`
	QueriesPath     string        `yaml:"queries_path,omitempty"`
	DatasourcesPath string        `yaml:"datasources_path,omitempty"`
	Interval        time.Duration `yaml:"interval,omitempty"`
}

func (s *Schemas) Verify() error {
	if len(s.PanelsPath) == 0 {
		s.PanelsPath = defaultPanelsPath
	}
	if len(s.QueriesPath) == 0 {
		s.QueriesPath = defaultQueriesPath
	}
	if len(s.DatasourcesPath) == 0 {
		s.DatasourcesPath = defaultDatasourcesPath
	}
	if s.Interval <= 0 {
		s.Interval = defaultInterval
	}
	return nil
}
