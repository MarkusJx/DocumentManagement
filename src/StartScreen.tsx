import React from "react";
import ReactDOM from "react-dom";
import {MDCRipple} from '@material/ripple';
import {ipcRenderer} from "electron";
import {Action, database, FileScanner} from "./databaseWrapper";
import {MainDataTable} from "./dataTable/MainDataTable";
import constants from "./constants";
import MDCCSSProperties from "./MDCCSSProperties";
import {SearchBox} from "./SearchBox";

const SHOW_SQL: boolean = true;

export class MainComponent extends React.Component<{}> {
    public currentPage: React.CElement<any, any>;
    public databaseManager: database.DatabaseManager;
    private searchBox: SearchBox;

    public constructor(props: {}) {
        super(props);

        this.searchBox = null;

        this.startScreenOnCreate = this.startScreenOnCreate.bind(this);
        this.startScreenOnLoad = this.startScreenOnLoad.bind(this);
        this.startScan = this.startScan.bind(this);
        this.startSearch = this.startSearch.bind(this);

        this.currentPage = (
            <StartScreen onCreateClickImpl={this.startScreenOnCreate} onLoadClickImpl={this.startScreenOnLoad}/>
        );
        this.databaseManager = null;
    }

    public async startSearch(): Promise<void> {
        constants.mainDataTable.setLoading(true);
        const filter: database.DocumentFilter = await this.searchBox.getFilter();
        const documents: database.Document[] = await this.databaseManager.getDocumentsBy(filter);
        constants.mainDataTable.directory = new database.Directory(documents, [], null, "");
        constants.mainDataTable.setLoading(false);
    }

    public render(): React.ReactNode {
        return this.currentPage;
    }

    private async startScreenOnCreate(): Promise<void> {
        const file: string = await ipcRenderer.invoke('select-database', true, "Select or create a database file");
        if (file != null) {
            this.databaseManager = await database.createSQLiteDatabaseManager(file, Action.CREATE_DROP, SHOW_SQL);
            constants.init(this.databaseManager);

            this.currentPage = (
                <StartScanScreen onStartClickImpl={this.startScan}/>
            );
            this.forceUpdate();
        }
    }

    private async startScreenOnLoad(): Promise<void> {
        const file: string = await ipcRenderer.invoke('select-database', false, "Select a database file");
        if (file != null) {
            this.currentPage = (
                <MainDataTable databaseManager={null} directory={null} showProgress={true} key={0}
                               ref={e => constants.mainDataTable = e}/>
            );

            this.forceUpdate();
            this.databaseManager = await database.createSQLiteDatabaseManager(file, Action.UPDATE, SHOW_SQL);
            constants.init(this.databaseManager);

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
        }
    }

    private async startScan(): Promise<boolean> {
        const file: string = await ipcRenderer.invoke('select-directory', "Select a directory to scan");

        if (file != null) {
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

            return true;
        } else {
            return false;
        }
    }
}

interface StartScanScreenProps {
    onStartClickImpl: () => Promise<boolean>;
}

class StartScanScreen extends React.Component<StartScanScreenProps> {
    private readonly onStartClickImpl: () => Promise<boolean>;
    private button: HTMLButtonElement;

    public constructor(props: StartScanScreenProps) {
        super(props);
        this.button = null;

        this.onStartClickImpl = props.onStartClickImpl;

        this.onStartClick = this.onStartClick.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <button className="mdc-button mdc-button--outlined" onClick={this.onStartClick}>
                <span className="mdc-button__ripple"/>
                <span className="mdc-button__label">Start scan</span>
            </button>
        );
    }

    public componentDidMount(): void {
        this.button = ReactDOM.findDOMNode(this) as HTMLButtonElement;
        MDCRipple.attachTo(this.button);
    }

    private async onStartClick(): Promise<void> {
        this.button.disabled = true;
        this.button.disabled = await this.onStartClickImpl();
    }
}

interface StartScreenProps {
    onCreateClickImpl: () => Promise<void>;
    onLoadClickImpl: () => Promise<void>;
}

interface StartScreenState {
    visible: boolean;
}

class StartScreen extends React.Component<StartScreenProps, StartScreenState> {
    private buttons: HTMLCollectionOf<HTMLButtonElement>;
    private readonly onCreateClickImpl: () => Promise<void>;
    private readonly onLoadClickImpl: () => Promise<void>;

    public constructor(props: StartScreenProps) {
        super(props);
        this.buttons = null;
        this.state = {
            visible: true
        };

        this.onCreateClickImpl = props.onCreateClickImpl;
        this.onLoadClickImpl = props.onLoadClickImpl;

        this.onCreateClick = this.onCreateClick.bind(this);
        this.onLoadClick = this.onLoadClick.bind(this);
    }

    public render(): React.ReactNode {
        const style: MDCCSSProperties = {
            display: "grid",
            "--mdc-theme-primary": "blue"
        };

        return this.state.visible ? (
            <div style={style}>
                <button className="mdc-button mdc-button--outlined" onClick={this.onCreateClick}>
                    <span className="mdc-button__ripple"/>
                    <span className="mdc-button__label">Create Database</span>
                </button>

                <button className="mdc-button mdc-button--outlined" onClick={this.onLoadClick}>
                    <span className="mdc-button__ripple"/>
                    <span className="mdc-button__label">Load Database</span>
                </button>
            </div>
        ) : null;
    }

    public componentDidMount(): void {
        const $this: Element = ReactDOM.findDOMNode(this) as Element;
        this.buttons = $this.getElementsByClassName('mdc-button') as HTMLCollectionOf<HTMLButtonElement>;

        for (let i: number = 0; i < this.buttons.length; i++) {
            MDCRipple.attachTo(this.buttons[i]);
        }
    }

    private setButtonsEnabled(enabled: boolean): void {
        for (let i: number = 0; i < this.buttons.length; i++) {
            this.buttons[i].disabled = !enabled;
        }
    }

    private async onCreateClick(): Promise<void> {
        this.setButtonsEnabled(false);
        await this.onCreateClickImpl();
        this.setButtonsEnabled(true);
    }

    private async onLoadClick(): Promise<void> {
        this.setButtonsEnabled(false);
        await this.onLoadClickImpl();
        this.setButtonsEnabled(true);
    }
}
