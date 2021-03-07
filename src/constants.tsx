import React from "react";
import * as ReactDOM from "react-dom";

import {FileEditor} from "./FileEditor";

export let fileEditor: FileEditor = null;

export function init(): void {
    fileEditor = ReactDOM.render(
        <FileEditor/>,
        document.getElementById('file-editor-dialog-container')
    ) as unknown as FileEditor;
}
