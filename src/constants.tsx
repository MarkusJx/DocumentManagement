import React from "react";
import * as ReactDOM from "react-dom";

import {FileEditor} from "./FileEditor";
import {database} from "./databaseWrapper";
import {MainDataTable} from "./dataTable/MainDataTable";
import DatabaseManager = database.DatabaseManager;

export default class constants {
    public static fileEditor: FileEditor = null;
    public static mainDataTable: MainDataTable = null;

    public static init(databaseManager: DatabaseManager): void {
        ReactDOM.render(
            <FileEditor databaseManager={databaseManager} ref={e => constants.fileEditor = e}/>,
            document.getElementById('file-editor-dialog-container')
        );
    }
}
