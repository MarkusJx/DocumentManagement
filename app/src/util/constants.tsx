import React from "react";
import ReactDOM from "react-dom";

import {FileEditor} from "../elements/FileEditor";
import {database} from "../databaseWrapper";
import {MainDataTable} from "../pages/dataTable/MainDataTable";
import {SearchBox} from "../elements/SearchBox";
import {ScanLoadingScreen} from "../elements/LoadingScreens";
import {MainComponent} from "../pages/StartScreen";
import {getLogger} from "log4js";
import DatabaseManager = database.DatabaseManager;

const logger = getLogger();

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
     * The main component
     */
    public static mainComponent: MainComponent = null;

    /**
     * The search box
     */
    public static searchBox: SearchBox = null;

    /**
     * The loading screen for the file scan operation
     */
    public static scanLoadingScreen: ScanLoadingScreen = null;

    /**
     * Initialize the file editor
     *
     * @param databaseManager the database manager
     */
    public static init(databaseManager: DatabaseManager): void {
        logger.info("Initializing file editor");
        try {
            ReactDOM.render(
                <FileEditor databaseManager={databaseManager} ref={e => constants.fileEditor = e}/>,
                document.getElementById('file-editor-dialog-container')
            );
        } catch (e) {
            logger.error("Error while initializing the file editor:", e);
        }
    }
}
