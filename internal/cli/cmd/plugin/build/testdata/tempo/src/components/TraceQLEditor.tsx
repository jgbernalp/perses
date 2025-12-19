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

import { ReactElement, useMemo } from "react";
import CodeMirror, {
  EditorView,
  ReactCodeMirrorProps,
} from "@uiw/react-codemirror";
import { isValidTraceId } from "@perses-dev/core";
import { CompletionConfig, TraceQLExtension } from "./TraceQLExtension";

export interface TraceQLEditorProps
  extends Omit<ReactCodeMirrorProps, "theme" | "extensions"> {
  completeConfig: CompletionConfig;
}

export function TraceQLEditor({
  completeConfig,
  ...rest
}: TraceQLEditorProps): ReactElement {
  const isDarkMode = false;

  const traceQLExtension = useMemo(() => {
    return TraceQLExtension(completeConfig);
  }, [completeConfig]);

  const codemirrorTheme = useMemo(() => {
    // https://github.com/mui/material-ui/blob/v5.16.7/packages/mui-material/src/OutlinedInput/OutlinedInput.js#L43
    const borderColor = isDarkMode
      ? "rgba(255, 255, 255, 0.23)"
      : "rgba(0, 0, 0, 0.23)";

    return EditorView.theme({
      "&": {
        backgroundColor: "transparent !important", // required for dark mode
        border: `1px solid ${borderColor}`,
        borderRadius: `4px`,
      },
      "&.cm-focused.cm-editor": {
        outline: "none", // remove dotted outline on focus
      },
      ".cm-content": {
        padding: "8px",
      },
    });
  }, [isDarkMode]);

  return (
    <div style={{ position: "relative", flexGrow: 1 }}>
      <label
        style={{
          position: "absolute",
          top: "-6px",
          left: "10px",
          padding: "0 4px",
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.default,
          zIndex: 1,
        }}
      >
        TraceQL Expression
      </label>
      <CodeMirror
        {...rest}
        theme={isDarkMode ? "dark" : "light"}
        basicSetup={{
          lineNumbers: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          foldGutter: false,
          // The explore view accepts either a TraceQL query or a Trace ID as input. The lezer grammar marks Trace IDs as invalid,
          // therefore let's disable syntax highlighting if the input is a Trace ID.
          syntaxHighlighting: !isValidTraceId(rest.value ?? ""),
        }}
        extensions={[
          EditorView.lineWrapping,
          traceQLExtension,
          codemirrorTheme,
        ]}
        placeholder='Example: {span.http.method = "GET"}'
      />
    </div>
  );
}
