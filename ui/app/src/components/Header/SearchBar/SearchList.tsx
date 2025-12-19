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

import { isProjectMetadata, Resource } from '@perses-dev/core';
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { KVSearch, KVSearchConfiguration, KVSearchResult } from '@nexucis/kvsearch';
import { Button, useIcon, useIsDarkMode } from '@perses-dev/components';
import { ComponentType } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ProjectRoute } from '../../../model/route';
import './SearchList.css';

const kvSearchConfig: KVSearchConfiguration = {
  indexedKeys: [['metadata', 'name']],
  shouldSort: true,
  includeMatches: true,
  shouldRender: false,
  excludedChars: [' '],
};

const SIZE_LIST = 10;

function buildBoxSearchKey(resource: Resource): string {
  return isProjectMetadata(resource.metadata)
    ? `${resource.kind}-${resource.metadata.project}-${resource.metadata.name}`
    : `${resource.kind}-${resource.metadata.name}`;
}

function buildRouting(resource: Resource): string {
  return isProjectMetadata(resource.metadata)
    ? `${ProjectRoute}/${resource.metadata.project}/${resource.kind.toLowerCase()}s/${resource.metadata.name}`
    : `/${resource.kind.toLowerCase()}s/${resource.metadata.name}`;
}

export interface SearchListProps {
  list: Array<Resource & { highlight?: boolean }>;
  query: string;
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  chip?: boolean;
  buildRouting?: (resource: Resource) => string;
  isResource?: (isAvailable: boolean) => void;
}

export function SearchList(props: SearchListProps): ReactElement | null {
  const [currentSizeList, setCurrentSizeList] = useState<number>(SIZE_LIST);
  const kvSearch = useRef(new KVSearch<Resource>(kvSearchConfig)).current;
  const filteredList: Array<KVSearchResult<Resource & { highlight?: boolean }>> = useMemo(() => {
    if (!props.query && props.list?.[0]?.kind === 'Dashboard') {
      return props.list.map((item, idx) => ({
        original: item,
        rendered: item,
        score: 0,
        index: idx,
        matched: [],
      }));
    }
    return kvSearch.filter(props.query, props.list);
  }, [kvSearch, props.list, props.query]);

  useEffect(() => {
    // Reset the size of the filtered list when query or the actual list change.
    // Otherwise, we would keep the old size that can have been changed using the button to see more data.
    setCurrentSizeList(SIZE_LIST);
  }, [props.query, props.list]);

  useEffect(() => {
    props.isResource?.(!!filteredList.length);
  }, [filteredList.length, props]);

  if (!filteredList.length) return null;

  return (
    <SearchListContent
      filteredList={filteredList}
      currentSizeList={currentSizeList}
      setCurrentSizeList={setCurrentSizeList}
      icon={props.icon}
      chip={props.chip}
      buildRouting={props.buildRouting}
      onClick={props.onClick}
      kvSearch={kvSearch}
    />
  );
}

interface SearchListContentProps {
  filteredList: Array<KVSearchResult<Resource & { highlight?: boolean }>>;
  currentSizeList: number;
  setCurrentSizeList: (size: number) => void;
  icon: ComponentType<{ className?: string }>;
  chip?: boolean;
  buildRouting?: (resource: Resource) => string;
  onClick: () => void;
  kvSearch: KVSearch<Resource>;
}

function SearchListContent(props: SearchListContentProps): ReactElement {
  const { filteredList, currentSizeList, setCurrentSizeList, chip, onClick, kvSearch } = props;
  const isDarkMode = useIsDarkMode();
  const HighlightIcon = useIcon('Sparkles');

  return (
    <div className="ps-SearchList">
      <div className="ps-SearchList-header">
        <props.icon className="ps-SearchList-headerIcon" />
        <h3 className="ps-SearchList-title">{filteredList[0]?.original.kind}s</h3>
      </div>

      {filteredList.slice(0, currentSizeList).map((search) => (
        <Button
          variant="outlined"
          className="ps-SearchList-item"
          data-highlight={search.original.highlight || undefined}
          data-dark={isDarkMode || undefined}
          key={`${buildBoxSearchKey(search.original)}`}
        >
          <RouterLink
            onClick={onClick}
            to={`${props.buildRouting ? props.buildRouting(search.original) : buildRouting(search.original)}`}
          >
            <span className="ps-SearchList-itemContent">
              {search.original.highlight && <HighlightIcon className="ps-SearchList-highlightIcon" />}
              <span
                dangerouslySetInnerHTML={{
                  __html: kvSearch.render(search.original, search.matched, {
                    pre: '<strong style="color:darkorange">',
                    post: '</strong>',
                    escapeHTML: true,
                  }).metadata.name,
                }}
              />
            </span>
            {isProjectMetadata(search.original.metadata) && chip && (
              <span className="ps-SearchList-chip">{search.original.metadata.project}</span>
            )}
          </RouterLink>
        </Button>
      ))}
      {filteredList.length > currentSizeList && (
        <Button variant="ghost" onClick={() => setCurrentSizeList(currentSizeList + 10)}>
          see more...
        </Button>
      )}
    </div>
  );
}
