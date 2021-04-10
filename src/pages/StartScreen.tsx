import React from "react";
import {ipcRenderer} from "electron";
import {Action, database, FileScanner} from "../databaseWrapper";
import {MainDataTable} from "./dataTable/MainDataTable";
import constants from "../util/constants";
import {SearchBox} from "../elements/SearchBox";
import {Button, OutlinedButton} from "../elements/MDCWrapper";
import {DatabaseConfigurator} from "./DatabaseConfigurator";
import {showErrorDialog} from "../elements/ErrorDialog";
import {DatabaseSetting, RecentDatabase, Recents} from "../settings/recentConnections";
import util from "../util/util";
import LoadRecentPage from "./LoadRecentPage";
import SettingsDialog from "../settings/SettingsDialog";
import {getLogger} from "log4js";

/**
 * Whether to show the generated sql commands
 */
const SHOW_SQL: boolean = false;

const logger = getLogger();

/**
 * The main component class
 */
export class MainComponent extends React.Component<{}> {
    /**
     * The current page
     */
    public currentPage: React.CElement<any, any>;

    /**
     * The database manager
     */
    public databaseManager: database.DatabaseManager;

    /**
     * The search box
     * @private
     */
    private searchBox: SearchBox;

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

        this.searchBox = null;
        this.databaseManager = null;
        this.startScreenButtonsEnabled = true;

        this.startScreenOnCreate = this.startScreenOnCreate.bind(this);
        this.startScreenOnLoad = this.startScreenOnLoad.bind(this);
        this.startScan = this.startScan.bind(this);
        this.startSearch = this.startSearch.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.gotoLoadRecentPage = this.gotoLoadRecentPage.bind(this);

        this.currentPage = (
            <StartScreen onCreateClickImpl={this.startScreenOnCreate} onLoadClickImpl={this.startScreenOnLoad}
                         onLoadRecentClickImpl={this.gotoLoadRecentPage} ref={e => this.startScreen = e}/>
        );

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
     * Start the search
     */
    public async startSearch(): Promise<void> {
        try {
            constants.mainDataTable.setLoading(true);
            const filter: database.DocumentFilter = await this.searchBox.getFilter();
            const documents: database.Document[] = await this.databaseManager.getDocumentsBy(filter, 0);
            await constants.mainDataTable.setSearchResults(documents, filter);
            constants.mainDataTable.setLoading(false);
        } catch (e) {
            logger.error("An error occurred while searching for documents:", e);
            showErrorDialog("Could not start the search. Error:", e.message);
        }
    }

    /**
     * Called when the database should be loaded
     *
     * @param setting the database setting to load
     */
    public async onLoad(setting: DatabaseSetting): Promise<void> {
        logger.info("Loading database");
        this.currentPage = (
            <MainDataTable databaseManager={null} directory={null} showProgress={true} key={1}
                           ref={e => constants.mainDataTable = e}/>
        );

        this.forceUpdate();
        try {
            this.databaseManager = await util.getDatabaseManagerFromSettings(setting, Action.UPDATE, SHOW_SQL);
        } catch (e) {
            logger.error("Could not load the database", e);
            showErrorDialog("The database could not be loaded. If you are trying to connect to a remote database, " +
                "this error may be caused by invalid login credentials. Please check if your connection details are " +
                "correct. If they are correct or you did not try to connect to a remove database, here's the error:", e.message);

            this.gotoStartPage();
            return;
        }

        try {
            await Recents.add(setting);
        } catch (e) {
            logger.error("Could not add the setting to the list of recently used databases", e);
        }

        constants.init(this.databaseManager);

        this.currentPage = (
            <div>
                <SearchBox databaseManager={this.databaseManager} searchStart={this.startSearch}
                           ref={e => this.searchBox = e}/>
                <MainDataTable directory={await this.databaseManager.getDirectory("")}
                               databaseManager={this.databaseManager} showProgress={false} key={2}
                               ref={e => constants.mainDataTable = e}/>
            </div>
        );
        this.forceUpdate();
    }

    public render(): React.ReactNode {
        return this.currentPage;
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
        this.currentPage = (
            <StartScreen onCreateClickImpl={this.startScreenOnCreate} onLoadClickImpl={this.startScreenOnLoad}
                         onLoadRecentClickImpl={this.gotoLoadRecentPage} ref={e => this.startScreen = e}/>
        );
        this.forceUpdate();
        this.componentDidMount();
    }

    /**
     * Go to the load recent database page
     */
    public gotoLoadRecentPage(): void {
        this.currentPage = (
            <LoadRecentPage/>
        );
        this.forceUpdate();
    }

    private closeDatabaseManager(): void {
        if (this.databaseManager) {
            this.databaseManager.close().then().catch(e => {
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
        this.currentPage = (
            <StartScanScreen onStartClickImpl={this.startScan}/>
        );
        this.forceUpdate();
    }

    /**
     * Called when the start screen load button was pressed
     * @private
     */
    private startScreenOnLoad(): void {
        this.currentPage = (
            <LoadScreen onLoad={this.onLoad} key={0}/>
        );
        this.forceUpdate();
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

        this.currentPage = (
            <div>
                <SearchBox databaseManager={this.databaseManager} searchStart={this.startSearch}
                           ref={e => this.searchBox = e}/>
                <MainDataTable directory={await this.databaseManager.getDirectory("")}
                               databaseManager={this.databaseManager} showProgress={false} key={3}
                               ref={e => constants.mainDataTable = e}/>
            </div>
        );
        this.forceUpdate();
        constants.scanLoadingScreen.visible = false;
    }
}

/**
 * The on load listener function
 */
type onLoad_t = (setting: DatabaseSetting) => Promise<void>;

/**
 * The load screen props
 */
interface LoadScreenProps {
    // The on load listener function
    onLoad: onLoad_t;
}

/**
 * The load database screen
 */
class LoadScreen extends React.Component<LoadScreenProps> {
    /**
     * The database configurator
     * @private
     */
    private configurator: DatabaseConfigurator;

    /**
     * The load button
     * @private
     */
    private loadButton: Button;

    /**
     * Create a load screen
     *
     * @param props the properties
     */
    public constructor(props: LoadScreenProps) {
        super(props);

        this.configurator = null;
        this.loadButton = null;

        this.onConfigChange = this.onConfigChange.bind(this);
        this.onLoadImpl = this.onLoadImpl.bind(this);
    }

    public render(): React.ReactNode {
        const headingStyle: React.CSSProperties = {
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 400,
            margin: '0px auto',
            width: 'max-content',
            color: '#464646'
        };

        const loadButtonStyle: React.CSSProperties = {
            marginTop: '15px',
            marginBottom: '15px'
        };

        return (
            <div className="start-scan-screen">
                <div className="start-scan-screen-grid-element">
                    <h1 style={headingStyle}>Load an existing Database</h1>
                </div>

                <div className="start-scan-screen-grid-element">
                    <DatabaseConfigurator ref={e => this.configurator = e} onChange={this.onConfigChange}/>
                </div>

                <div className="centered" style={loadButtonStyle}>
                    <OutlinedButton text={"Load"} onClick={this.onLoadImpl}
                                    ref={e => this.loadButton = e}/>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.onConfigChange();
    }

    /**
     * The on config changed listener
     * @private
     */
    private onConfigChange(): void {
        this.loadButton.enabled = this.configurator.settings != null;
    }

    /**
     * The on load implementation
     * @private
     */
    private async onLoadImpl(): Promise<void> {
        await this.props.onLoad(this.configurator.settings);
    }
}

/**
 * The start scan callback function
 */
type startScanClick_t = (manager: database.DatabaseManager, file: string) => Promise<void>;

/**
 * The start scan screen properties
 */
interface StartScanScreenProps {
    // Called when start scan button was clicked
    onStartClickImpl: startScanClick_t;
}

/**
 * The start scan screen state
 */
interface StartScanScreenState {
    // The selected directory
    directory: string;
}

/**
 * The start scan screen
 */
class StartScanScreen extends React.Component<StartScanScreenProps, StartScanScreenState> {
    /**
     * Called when start scan button was clicked
     * @private
     */
    private readonly onStartClickImpl: startScanClick_t;

    /**
     * The select directory to scan button
     * @private
     */
    private selectDirectoryButton: Button;

    /**
     * The start scan button
     * @private
     */
    private startScanButton: Button;

    /**
     * The database configurator
     * @private
     */
    private configurator: DatabaseConfigurator;

    /**
     * Create the start scan screen
     *
     * @param props the properties
     */
    public constructor(props: StartScanScreenProps) {
        super(props);

        this.state = {
            directory: null
        };

        this.selectDirectoryButton = null;
        this.startScanButton = null;
        this.configurator = null;

        this.onStartClickImpl = props.onStartClickImpl;

        this.onStartClick = this.onStartClick.bind(this);
        this.selectDirectory = this.selectDirectory.bind(this);
        this.enableButtons = this.enableButtons.bind(this);
    }

    /**
     * Set the directory to scan
     *
     * @param dir the directory location
     * @private
     */
    private set directory(dir: string) {
        this.setState({
            directory: dir
        });
        this.enableButtons();
    }

    public render(): React.ReactNode {
        const headingStyle: React.CSSProperties = {
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 400,
            margin: '0 auto',
            width: 'max-content',
            color: '#464646',
        };

        const subHeadingStyle: React.CSSProperties = {
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 400,
            color: '#464646',
        };

        const textStyle: React.CSSProperties = {
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 300,
            color: '#464646',
        }

        const explanationStyle: React.CSSProperties = {
            padding: '0px 20px'
        };

        const startScanButtonContainerStyle: React.CSSProperties = {
            marginTop: '20px',
            marginBottom: '20px'
        }

        return (
            <div className="start-scan-screen">
                <div className="start-scan-screen-grid-element">
                    <h1 style={headingStyle}>
                        Create a new database
                    </h1>
                </div>

                <div className="start-scan-screen-grid-element" style={explanationStyle}>
                    <p style={textStyle}>
                        The following steps must be performed in order to create a new database:
                    </p>
                    <ol style={textStyle}>
                        <li>
                            You need to select a database file to store the collected data in
                        </li>
                        <li>
                            A directory to scan must be selected
                        </li>
                        <li>
                            The directory will be scanned recursively and the found directories and documents will be
                            stored in the database
                        </li>
                    </ol>
                    <p style={textStyle}>
                        Note: If the selected database file already exists, it will be overwritten.
                    </p>
                </div>

                <div className="start-scan-screen-grid-element">
                    <DatabaseConfigurator onChange={this.enableButtons} ref={e => this.configurator = e}/>
                </div>

                <div className="start-scan-screen-grid-element">
                    <h2 style={subHeadingStyle} className="centered">
                        Select a directory to scan
                    </h2>
                    <p style={textStyle} className="centered">
                        {"Selected directory: "}
                        <span className="start-scan-path">
                            {this.state.directory == null ? "none" : this.state.directory}
                        </span>
                    </p>
                    <div className="centered">
                        <OutlinedButton text={"Select"} onClick={this.selectDirectory}
                                        ref={e => this.selectDirectoryButton = e}/>
                    </div>

                </div>

                <div className="centered" style={startScanButtonContainerStyle}>
                    <OutlinedButton text={"Start scan"} onClick={this.onStartClick} ref={e => this.startScanButton = e}
                                    className="centered"/>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.enableButtons();
    }

    /**
     * Disable all buttons
     * @private
     */
    private disableAllButtons(): void {
        this.selectDirectoryButton.enabled = false;
        this.startScanButton.enabled = false;
    }

    /**
     * Enable all buttons if required
     * @private
     */
    private enableButtons(): void {
        this.selectDirectoryButton.enabled = true;
        this.startScanButton.enabled = this.state.directory != null && this.configurator.settings != null;
    }

    /**
     * Select a directory
     * @private
     */
    private async selectDirectory(): Promise<void> {
        try {
            this.disableAllButtons();
            this.directory = await ipcRenderer.invoke('select-directory', "Select a directory to scan");
        } catch (e) {
            logger.error("Could not select an directory:", e);
            showErrorDialog("The directory select operation failed");
        }
    }

    /**
     * Called when the start scan button was clicked
     * @private
     */
    private async onStartClick(): Promise<void> {
        this.disableAllButtons();
        constants.scanLoadingScreen.visible = true;
        const settings = this.configurator.settings;
        let databaseManager: database.DatabaseManager;

        try {
            databaseManager = await util.getDatabaseManagerFromSettings(settings, Action.CREATE_DROP, SHOW_SQL);
        } catch (e) {
            logger.error("Could not create a database", e);
            showErrorDialog("The database could not be created. If you are trying to connect to a remote database, " +
                "this error may be caused by invalid login credentials. Please check if your connection details are " +
                "correct. If they are correct or you did not try to connect to a remove database, here's the error:", e.message);
            constants.scanLoadingScreen.visible = false;
            this.enableButtons();
            return;
        }

        try {
            await Recents.add(settings);
        } catch (e) {
            logger.error("Could not add the database setting to the store:", e);
        }

        constants.init(databaseManager);
        await this.onStartClickImpl(databaseManager, this.state.directory);
    }
}

/**
 * The start screen properties
 */
interface StartScreenProps {
    // Called when the create button was clicked
    onCreateClickImpl: () => void;
    // Called when the load button was clicked
    onLoadClickImpl: () => void;
    // Called when the load recent button was clicked
    onLoadRecentClickImpl: () => void;
}

/**
 * The start screen
 */
class StartScreen extends React.Component<StartScreenProps, {}> {
    /**
     * The create database button
     * @private
     */
    private createButton: OutlinedButton;

    /**
     * The load database button
     * @private
     */
    private loadButton: OutlinedButton;

    /**
     * The load recent database button
     * @private
     */
    private loadRecentButton: OutlinedButton;

    /**
     * The open settings button
     * @private
     */
    private openSettingsButton: OutlinedButton;

    /**
     * Create the start screen
     *
     * @param props the properties
     */
    public constructor(props: StartScreenProps) {
        super(props);
        this.createButton = null;
        this.loadButton = null;
        this.loadRecentButton = null;
        this.openSettingsButton = null;

        this.onCreateClick = this.onCreateClick.bind(this);
        this.onLoadClick = this.onLoadClick.bind(this);
        this.onLoadRecentClick = this.onLoadRecentClick.bind(this);
        this.onOpenSettings = this.onOpenSettings.bind(this);
    }

    public render(): React.ReactNode {
        const containerStyle: React.CSSProperties = {
            borderRadius: '5px',
            borderWidth: '1px',
            borderColor: '#b7b7b7',
            margin: '20px',
            borderStyle: 'solid',
            padding: '0 20px 20px 20px',
            display: 'grid',
            gridTemplateRows: 'min-content auto auto'
        };

        const headingStyle: React.CSSProperties = {
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 400,
            color: '#4a4a4a',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '0',
            width: 'max-content'
        };

        const headingContainerStyle: React.CSSProperties = {
            borderBottom: '1px solid #b7b7b7'
        };

        const listStyle: React.CSSProperties = {
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 300,
            color: '#4a4a4a'
        };

        return (
            <div className="start-screen-selector">
                <div style={containerStyle}>
                    <div style={headingContainerStyle}>
                        <h2 style={headingStyle}>Create a database</h2>
                    </div>

                    <ul style={listStyle}>
                        <li>This indexes all files inside a selected directory and adds those to the database</li>
                        <li>A search start location must be selected</li>
                        <li>A database file must be selected to be either created or overridden</li>
                    </ul>

                    <div className="start-screen-button-alignment">
                        <OutlinedButton text={"Create"} onClick={this.onCreateClick}
                                        ref={e => this.createButton = e}/>
                    </div>
                </div>

                <div style={containerStyle}>
                    <div style={headingContainerStyle}>
                        <h2 style={headingStyle}>Load a database</h2>
                    </div>

                    <ul style={listStyle}>
                        <li>This loads an existing database</li>
                        <li>You must select a valid database</li>
                    </ul>

                    <div className="start-screen-button-alignment">
                        <OutlinedButton text={"Load"} onClick={this.onLoadClick}
                                        ref={e => this.loadButton = e}/>
                    </div>
                </div>

                <div style={containerStyle}>
                    <div style={headingContainerStyle}>
                        <h2 style={headingStyle}>Load a recently used database</h2>
                    </div>

                    <ul style={listStyle}>
                        <li>This lets you select a recently used database</li>
                    </ul>

                    <div className="start-screen-button-alignment">
                        <OutlinedButton text={"Load"} onClick={this.onLoadRecentClick}
                                        ref={e => this.loadRecentButton = e}/>
                    </div>
                </div>

                <div style={containerStyle}>
                    <div style={headingContainerStyle}>
                        <h2 style={headingStyle}>Settings</h2>
                    </div>

                    <ul style={listStyle}>
                        <li>Open and edit the settings</li>
                    </ul>

                    <div className="start-screen-button-alignment">
                        <OutlinedButton text={"Open"} onClick={this.onOpenSettings}
                                        ref={e => this.openSettingsButton = e}/>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Set whether all buttons should be enabled
     *
     * @param enabled set to true if the buttons should be enabled
     */
    public setButtonsEnabled(enabled: boolean): void {
        if (this.createButton)
            this.createButton.enabled = enabled;
        if (this.loadButton)
            this.loadButton.enabled = enabled;
        if (this.loadRecentButton)
            this.loadRecentButton.enabled = enabled;
        if (this.openSettingsButton)
            this.openSettingsButton.enabled = enabled;
    }

    /**
     * Called when the create button was clicked
     * @private
     */
    private onCreateClick(): void {
        this.setButtonsEnabled(false);
        this.props.onCreateClickImpl();
    }

    /**
     * Called when the load button was clicked
     * @private
     */
    private onLoadClick(): void {
        this.setButtonsEnabled(false);
        this.props.onLoadClickImpl();
    }

    /**
     * Called when a recent database should be loaded
     * @private
     */
    private onLoadRecentClick(): void {
        this.setButtonsEnabled(false);
        this.props.onLoadRecentClickImpl();
    }

    /**
     * Called when the settings should be opened
     * @private
     */
    private onOpenSettings(): void {
        this.setButtonsEnabled(false);
        SettingsDialog.open(() => {
            this.setButtonsEnabled(true);
        });
    }
}
