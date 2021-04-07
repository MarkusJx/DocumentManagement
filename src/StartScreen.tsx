import React from "react";
import {ipcRenderer} from "electron";
import {
    Action,
    CustomPersistence,
    database,
    FileScanner,
    MariaDBProvider,
    MySQLProvider,
    PersistenceProvider
} from "./databaseWrapper";
import {MainDataTable} from "./dataTable/MainDataTable";
import constants from "./constants";
import {SearchBox} from "./SearchBox";
import {Button, OutlinedButton} from "./MDCWrapper";
import {AnySettings, DatabaseConfigurator, DatabaseProvider, SQLiteSettings} from "./DatabaseConfigurator";

/**
 * Whether to show the generated sql commands
 */
const SHOW_SQL: boolean = true;

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
     * Create the main component
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.searchBox = null;

        this.startScreenOnCreate = this.startScreenOnCreate.bind(this);
        this.startScreenOnLoad = this.startScreenOnLoad.bind(this);
        this.startScan = this.startScan.bind(this);
        this.startSearch = this.startSearch.bind(this);
        this.onLoad = this.onLoad.bind(this);

        this.currentPage = (
            <StartScreen onCreateClickImpl={this.startScreenOnCreate} onLoadClickImpl={this.startScreenOnLoad}/>
        );
        this.databaseManager = null;
    }

    /**
     * Start the search
     */
    public async startSearch(): Promise<void> {
        constants.mainDataTable.setLoading(true);
        const filter: database.DocumentFilter = await this.searchBox.getFilter();
        const documents: database.Document[] = await this.databaseManager.getDocumentsBy(filter, 0);
        await constants.mainDataTable.setSearchResults(documents, filter);
        constants.mainDataTable.setLoading(false);
    }

    public render(): React.ReactNode {
        return this.currentPage;
    }

    /**
     * Called when the start screen create button was pressed
     * @private
     */
    private async startScreenOnCreate(): Promise<void> {
        this.currentPage = (
            <StartScanScreen onStartClickImpl={this.startScan}/>
        );
        this.forceUpdate();
    }

    /**
     * Called when the start screen load button was pressed
     * @private
     */
    private async startScreenOnLoad(): Promise<void> {
        this.currentPage = (
            <LoadScreen onLoad={this.onLoad} key={0}/>
        );
        this.forceUpdate();
    }

    private async onLoad(loadScreen: LoadScreen): Promise<void> {
        this.currentPage = (
            <MainDataTable databaseManager={null} directory={null} showProgress={true} key={2}
                           ref={e => constants.mainDataTable = e}/>
        );

        this.forceUpdate();
        this.databaseManager = await loadScreen.getDatabaseManager(Action.UPDATE, SHOW_SQL);
        constants.init(this.databaseManager);

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
    }

    /**
     * Start the directory scan
     * @private
     */
    private async startScan(manager: database.DatabaseManager, file: string): Promise<void> {
        this.databaseManager = manager;

        const fileScanner = new FileScanner(file);
        const rootDir = await fileScanner.scan();
        await this.databaseManager.persistDirectory(rootDir, file);

        this.currentPage = (
            <div>
                <SearchBox databaseManager={this.databaseManager} searchStart={this.startSearch}
                           ref={e => this.searchBox = e}/>
                <MainDataTable directory={await this.databaseManager.getDirectory("")}
                               databaseManager={this.databaseManager} showProgress={false} key={1}
                               ref={e => constants.mainDataTable = e}/>
            </div>
        );
        this.forceUpdate();
        constants.scanLoadingScreen.visible = false;
    }
}

type onLoad_t = (loadScreen: LoadScreen) => Promise<void>;

interface LoadScreenProps {
    onLoad: onLoad_t;
}

class LoadScreen extends React.Component<LoadScreenProps> {
    private configurator: DatabaseConfigurator;
    private loadButton: Button;
    private readonly onLoad: onLoad_t;

    public constructor(props: LoadScreenProps) {
        super(props);

        this.configurator = null;
        this.loadButton = null;

        this.onLoad = props.onLoad.bind(this);
        this.onConfigChange = this.onConfigChange.bind(this);
        this.onLoadImpl = this.onLoadImpl.bind(this);
    }

    public async getDatabaseManager(action: Action, showSQL: boolean): Promise<database.DatabaseManager> {
        const fromProvider = async (provider: PersistenceProvider): Promise<database.DatabaseManager> => {
            const em = await CustomPersistence.createEntityManager("documents", provider);
            return await database.DatabaseManager.create(em);
        };

        switch (this.configurator.settings.provider) {
            case DatabaseProvider.SQLite: {
                const settings = this.configurator.settings as SQLiteSettings;
                return await database.createSQLiteDatabaseManager(settings.file, action, showSQL);
            }
            case DatabaseProvider.MariaDB: {
                const settings = this.configurator.settings as AnySettings;
                const provider = await MariaDBProvider.create(settings.url, settings.user, settings.password, action, showSQL);
                return await fromProvider(provider);
            }
            case DatabaseProvider.MySQL: {
                const settings = this.configurator.settings as AnySettings;
                const provider = await MySQLProvider.create(settings.url, settings.user, settings.password, action, showSQL);
                return await fromProvider(provider);
            }
            default:
                return null;
        }
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

    private onConfigChange(): void {
        this.loadButton.enabled = this.configurator.settings != null;
    }

    private async onLoadImpl(): Promise<void> {
        await this.onLoad(this);
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
    // The selected database file
    databaseFile: string;
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
     * The select database file button
     * @private
     */
    private selectFileButton: Button;

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
     * Create the start scan screen
     *
     * @param props the properties
     */
    public constructor(props: StartScanScreenProps) {
        super(props);

        this.state = {
            directory: null,
            databaseFile: null
        };

        this.selectFileButton = null;
        this.selectDirectoryButton = null;
        this.startScanButton = null;

        this.onStartClickImpl = props.onStartClickImpl;

        this.onStartClick = this.onStartClick.bind(this);
        this.selectDirectory = this.selectDirectory.bind(this);
        this.selectDatabaseFile = this.selectDatabaseFile.bind(this);
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

    /**
     * Set the database file to populate
     *
     * @param file the database file location
     * @private
     */
    private set databaseFile(file: string) {
        this.setState({
            databaseFile: file
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
                    <h2 style={subHeadingStyle} className="centered">
                        Select a database file
                    </h2>
                    <p style={textStyle} className="centered">
                        {"Selected database file: "}
                        <span className="start-scan-path">
                            {this.state.databaseFile == null ? "none" : this.state.databaseFile}
                        </span>
                    </p>
                    <div className="centered">
                        <OutlinedButton text={"Select"} onClick={this.selectDatabaseFile}
                                        ref={e => this.selectFileButton = e}/>
                    </div>
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
        this.selectFileButton.enabled = false;
        this.startScanButton.enabled = false;
    }

    /**
     * Enable all buttons if required
     * @private
     */
    private enableButtons(): void {
        this.selectDirectoryButton.enabled = true;
        this.selectFileButton.enabled = true;
        this.startScanButton.enabled = this.state.directory != null && this.state.databaseFile != null;
    }

    /**
     * Select a directory
     * @private
     */
    private async selectDirectory(): Promise<void> {
        this.disableAllButtons();
        this.directory = await ipcRenderer.invoke('select-directory', "Select a directory to scan");
    }

    /**
     * Select a database file
     * @private
     */
    private async selectDatabaseFile(): Promise<void> {
        this.disableAllButtons();
        this.databaseFile = await ipcRenderer.invoke('select-database', true, "Select or create a database file");
    }

    /**
     * Called when the start scan button was clicked
     * @private
     */
    private async onStartClick(): Promise<void> {
        this.disableAllButtons();
        constants.scanLoadingScreen.visible = true;
        const databaseManager: database.DatabaseManager = await database.createSQLiteDatabaseManager(
            this.state.databaseFile,
            Action.CREATE_DROP,
            SHOW_SQL
        );

        constants.init(databaseManager);
        await this.onStartClickImpl(databaseManager, this.state.directory);
    }
}

/**
 * The start screen properties
 */
interface StartScreenProps {
    // Called when the create button was clicked
    onCreateClickImpl: () => Promise<void>;
    // Called when the load button was clicked
    onLoadClickImpl: () => Promise<void>;
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
     * Called when the create button was clicked
     * @private
     */
    private readonly onCreateClickImpl: () => Promise<void>;

    /**
     * Called when the load button was clicked
     * @private
     */
    private readonly onLoadClickImpl: () => Promise<void>;

    /**
     * Create the start screen
     *
     * @param props the properties
     */
    public constructor(props: StartScreenProps) {
        super(props);
        this.createButton = null;
        this.loadButton = null;

        this.onCreateClickImpl = props.onCreateClickImpl;
        this.onLoadClickImpl = props.onLoadClickImpl;

        this.onCreateClick = this.onCreateClick.bind(this);
        this.onLoadClick = this.onLoadClick.bind(this);
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
                        <li>You must select a valid database file</li>
                        <li>Database files have the ending *.db</li>
                    </ul>

                    <div className="start-screen-button-alignment">
                        <OutlinedButton text={"Load"} onClick={this.onLoadClick}
                                        ref={e => this.loadButton = e}/>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Set whether all buttons should be enabled
     *
     * @param enabled set to true if the buttons should be enabled
     * @private
     */
    private setButtonsEnabled(enabled: boolean): void {
        if (this.createButton)
            this.createButton.enabled = enabled;
        if (this.loadButton)
            this.loadButton.enabled = enabled;
    }

    /**
     * Called when the create button was clicked
     * @private
     */
    private async onCreateClick(): Promise<void> {
        this.setButtonsEnabled(false);
        await this.onCreateClickImpl();
        //this.setButtonsEnabled(true);
    }

    /**
     * Called when the load button was clicked
     * @private
     */
    private async onLoadClick(): Promise<void> {
        this.setButtonsEnabled(false);
        await this.onLoadClickImpl();
        //this.setButtonsEnabled(true);
    }
}
