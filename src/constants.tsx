import React from "react";
import ReactDOM from "react-dom";

import {FileEditor} from "./FileEditor";
import {database} from "./databaseWrapper";
import {MainDataTable} from "./dataTable/MainDataTable";
import DatabaseManager = database.DatabaseManager;

/**
 * Constants to be used everywhere
 */
export default class constants {
    /**
     * The file editor
     */
    public static fileEditor: FileEditor = null;

    /**
     * The current main data table element
     */
    public static mainDataTable: MainDataTable = null;

    /**
     * Initialize the file editor
     *
     * @param databaseManager the database manager
     */
    public static init(databaseManager: DatabaseManager): void {
        ReactDOM.render(
            <FileEditor databaseManager={databaseManager} ref={e => constants.fileEditor = e}/>,
            document.getElementById('file-editor-dialog-container')
        );
    }
}
