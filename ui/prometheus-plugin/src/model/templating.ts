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

import { useTemplateVariableValues } from '@perses-dev/plugin-system';
import { replaceTemplateVariables, parseTemplateVariables } from '../utils';

/**
 * Type alias to indicate what parts of the API support template variables.
 */
export type TemplateString = string;

export function useReplaceTemplateString(templateString?: TemplateString) {
  const templateVariablesInTemplate = parseTemplateVariables(templateString || '');
  const variables = useTemplateVariableValues(templateVariablesInTemplate);
  return replaceTemplateVariables(templateString || '', variables);
}
