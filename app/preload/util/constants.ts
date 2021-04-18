import {database} from "../databaseWrapper";
import {MainDataTable} from "../pages/dataTable/MainDataTable";
import {SearchBox} from "../elements/SearchBox";
import {ScanLoadingScreen} from "../elements/LoadingScreens";
import MainComponent from "../pages/MainComponent";
import {getLogger} from "log4js";
import {Recents} from "../settings/recentConnections";
import Snackbars from "./Snackbars";
import {RecentDatabase} from "../../shared/Settings";

const logger = getLogger();

/**
 * Constants to be used everywhere
 */
export default class constants {
    /**
     * Whether to show the generated sql commands
     */
    public static readonly SHOW_SQL: boolean = false;

    /**
     * Whether to log to the console
     */
    public static readonly LOG_TO_CONSOLE: boolean = false;

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
     * The currently active database manager
     */
    public static databaseManager: database.DatabaseManager = null;

    /**
     * The active database setting
     */
    public static activeSetting: RecentDatabase = null;

    /**
     * Save the active setting
     */
    public static saveActiveSetting(): void {
        Recents.set(constants.activeSetting).then(() => {
            logger.info("Updated the active setting");
            Snackbars.genericSnackbar.snackbarText = "Database setting saved successfully.";
            Snackbars.genericSnackbar.open();
        }).catch(e => {
            logger.error("Could not save the active setting:", e);
            Snackbars.genericSnackbar.snackbarText = "Could not save the database setting.";
            Snackbars.genericSnackbar.open();
        });
    }

    /**
     * Close the database manager
     */
    public static closeDatabaseManager(): void {
        if (constants.databaseManager != null) {
            constants.activeSetting = null;
            constants.databaseManager.close().then(() => {
                logger.info("Closed the database manager");
            }).catch(e => {
                logger.error("Could not close the database manager:", e);
            });
            constants.databaseManager = null;
        }
    }
}
