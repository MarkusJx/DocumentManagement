import React from "react";
import {Action, database, FileScanner} from "../databaseWrapper";
import {DatabaseSetting, RecentDatabase, Recents} from "../settings/recentConnections";
import {showErrorDialog} from "../elements/ErrorDialog";
import {ipcRenderer} from "electron";
import {MainDataTable} from "./dataTable/MainDataTable";
import constants from "../util/constants";
import util from "../util/util";
import LoadRecentPage from "./LoadRecentPage";
import StartScanScreen from "./StartScanScreen";
import LoadScreen from "./LoadScreen";
import {getLogger} from "log4js";
import StartScreen from "./StartScreen";

const logger = getLogger();

/**
 * The main component state
 */
interface MainComponentState {
    // The currently visible page
    currentPage: React.CElement<any, any>;
}

/**
 * The main component class
 */
export default class MainComponent extends React.Component<{}, MainComponentState> {
    /**
     * The database manager
     */
    public databaseManager: database.DatabaseManager;

    /**
     * The start screen
     * @private
     */
    private startScreen: StartScreen;

    /**
     * Whether the start screen buttons should be enabled
     * @private
     */
    private startScreenButtonsEnabled: boolean;

    /**
     * Create the main component
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.databaseManager = null;
        this.startScreenButtonsEnabled = true;

        this.startScreenOnCreate = this.startScreenOnCreate.bind(this);
        this.startScreenOnLoad = this.startScreenOnLoad.bind(this);
        this.startScan = this.startScan.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.gotoLoadRecentPage = this.gotoLoadRecentPage.bind(this);

        this.state = {
            currentPage: (
                <StartScreen onCreateClickImpl={this.startScreenOnCreate} onLoadClickImpl={this.startScreenOnLoad}
                             onLoadRecentClickImpl={this.gotoLoadRecentPage} ref={e => this.startScreen = e}/>
            )
        };

        // Load the most recently used database if requested (and possible)
        if (Recents.settings.loadRecentOnStartup && Recents.mostRecentId) {
            logger.info("Loading the most recently used database");
            this.startScreenButtonsEnabled = false;
            Recents.getMostRecent().then((setting: RecentDatabase) => {
                this.onLoad(setting.setting).then().catch((e) => {
                    logger.error("Could not load the most recent database", e);
                    showErrorDialog("Could not load the most recent database", e.message);
                    this.gotoStartPage();
                });
            }).catch((e) => {
                logger.error("Could not load the most recent database", e);
                showErrorDialog("Could not load the most recent database", e.message);
                this.gotoStartPage();
            });
        }

        ipcRenderer.on('load-database', () => {
            this.closeDatabaseManager();
            this.startScreenOnLoad();
        });

        ipcRenderer.on('create-database', () => {
            this.closeDatabaseManager();
            this.startScreenOnCreate();
        });

        ipcRenderer.on('load-recent-database', () => {
            this.closeDatabaseManager();
            this.gotoLoadRecentPage();
        });

        ipcRenderer.on('goto-start-screen', () => {
            this.closeDatabaseManager();
            this.gotoStartPage();
        });
    }

    /**
     * Called when the database should be loaded
     *
     * @param setting the database setting to load
     */
    public async onLoad(setting: DatabaseSetting): Promise<void> {
        logger.info("Loading database");
        this.setState({
            currentPage: (
                <MainDataTable databaseManager={null} directory={null} showProgress={true} key={1}
                               ref={e => constants.mainDataTable = e}/>
            )
        });

        try {
            this.databaseManager = await util.getDatabaseManagerFromSettings(setting, Action.UPDATE, constants.SHOW_SQL);
        } catch (e) {
            logger.error("Could not load the database:", e);
            showErrorDialog("The database could not be loaded. If you are trying to connect to a remote database, " +
                "this error may be caused by invalid login credentials. Please check if your connection details are " +
                "correct. If they are correct or you did not try to connect to a remove database, here's the error:", e.stack);

            this.gotoStartPage();
            return;
        }

        // Check if the database info is set. If not, the database must be invalid.
        if (await this.databaseManager.getDatabaseInfo() == null) {
            showErrorDialog("The requested database could not be loaded: The database info could not be retrieved. " +
                "Probably the selected database was never initialized properly. The fastest way to fix this " +
                "would be to re-create the database using the 'Create Database' option in the main menu.");
            logger.error("The setting with provider", setting.provider, "could not be loaded:",
                "databaseManager.getDatabaseInfo() returned null");
            this.gotoStartPage();
            return;
        }

        try {
            await Recents.add(setting);
        } catch (e) {
            logger.error("Could not add the setting to the list of recently used databases", e);
        }

        constants.init(this.databaseManager);

        try {
            await constants.mainDataTable.loadFinished(this.databaseManager);
        } catch (e) {
            logger.error("Could not load the main data table:", e);
            showErrorDialog("Could not load the data table", e.stack);
            this.gotoStartPage();
        }
    }

    public render(): React.ReactNode {
        return this.state.currentPage;
    }

    public componentDidMount(): void {
        if (this.startScreen) {
            this.startScreen.setButtonsEnabled(this.startScreenButtonsEnabled);
        }
    }

    /**
     * Go to the start page
     */
    public gotoStartPage(): void {
        this.startScreenButtonsEnabled = true;
        this.setState({
            currentPage: (
                <StartScreen onCreateClickImpl={this.startScreenOnCreate} onLoadClickImpl={this.startScreenOnLoad}
                             onLoadRecentClickImpl={this.gotoLoadRecentPage} ref={e => this.startScreen = e}/>
            )
        });
        this.componentDidMount();
    }

    /**
     * Go to the load recent database page
     */
    public gotoLoadRecentPage(): void {
        this.setState({
            currentPage: (
                <LoadRecentPage/>
            )
        });
    }

    /**
     * Close the database manager
     * @private
     */
    private closeDatabaseManager(): void {
        if (this.databaseManager) {
            this.databaseManager.close().then(() => {
                logger.info("Closed the database manager");
            }).catch(e => {
                logger.error("Could not close the database manager:", e);
            });
            this.databaseManager = null;
        }
    }

    /**
     * Called when the start screen create button was pressed
     * @private
     */
    private startScreenOnCreate(): void {
        this.setState({
            currentPage: (
                <StartScanScreen onStartClickImpl={this.startScan}/>
            )
        });
    }

    /**
     * Called when the start screen load button was pressed
     * @private
     */
    private startScreenOnLoad(): void {
        this.setState({
            currentPage: (
                <LoadScreen onLoad={this.onLoad} key={0}/>
            )
        });
    }

    /**
     * Start the directory scan
     * @private
     */
    private async startScan(manager: database.DatabaseManager, file: string): Promise<void> {
        this.databaseManager = manager;

        try {
            logger.info("Running file scan");
            const fileScanner = new FileScanner(file);
            const rootDir = await fileScanner.scan();
            await this.databaseManager.persistDirectory(rootDir, file);
        } catch (e) {
            logger.error("An error occurred while scanning the file system:", e);
            showErrorDialog("An error occurred while scanning the file system", e.message);
            this.gotoStartPage();
            return;
        }

        this.setState({
            currentPage: (
                <MainDataTable directory={await this.databaseManager.getDirectory("")}
                               databaseManager={this.databaseManager} showProgress={false} key={3}
                               ref={e => constants.mainDataTable = e}/>
            )
        });
        constants.scanLoadingScreen.visible = false;
    }
}