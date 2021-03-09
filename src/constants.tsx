import React from "react";
import * as ReactDOM from "react-dom";

import {FileEditor} from "./FileEditor";
import {database} from "./databaseWrapper";
import DatabaseManager = database.DatabaseManager;

export let fileEditor: FileEditor = null;

export function init(databaseManager: DatabaseManager): void {
    fileEditor = ReactDOM.render(
        <FileEditor databaseManager={databaseManager}/>,
        document.getElementById('file-editor-dialog-container')
    ) as unknown as FileEditor;
}
