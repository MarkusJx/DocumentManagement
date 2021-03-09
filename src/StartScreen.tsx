import React from "react";
import * as ReactDOM from "react-dom";
import {MDCRipple} from '@material/ripple';
import {ipcRenderer} from "electron";
import {Action, database, FileScanner} from "./databaseWrapper";
import {MainDataTable} from "./dataTable/MainDataTable";
import * as constants from "./constants";

export class MainComponent extends React.Component {
    currentPage: React.CElement<any, any>;
    databaseManager: database.DatabaseManager;

    constructor(props: any) {
        super(props);

        this.startScreenOnCreate = this.startScreenOnCreate.bind(this);
        this.startScreenOnLoad = this.startScreenOnLoad.bind(this);
        this.startScan = this.startScan.bind(this);

        this.currentPage = React.createElement(StartScreen, {
            onCreateClickImpl: this.startScreenOnCreate,
            onLoadClickImpl: this.startScreenOnLoad
        }, null);
        this.databaseManager = null;
    }

    async startScreenOnCreate(): Promise<void> {
        const file: string = await ipcRenderer.invoke('select-database', true, "Select or create a database file");
        if (file != null) {
            this.databaseManager = await database.createSQLiteDatabaseManager(file, Action.CREATE_DROP);
            constants.init(this.databaseManager);

            this.currentPage = React.createElement(StartScanScreen, {
                onStartClickImpl: this.startScan
            }, null);
            this.forceUpdate();
        }
    }

    async startScreenOnLoad(): Promise<void> {
        const file: string = await ipcRenderer.invoke('select-database', false, "Select a database file");
        if (file != null) {
            this.currentPage = React.createElement(MainDataTable, {
                directory: null,
                databaseManager: null,
                showProgress: true,
                key: 0
            }, null);

            this.forceUpdate();
            this.databaseManager = await database.createSQLiteDatabaseManager(file, Action.UPDATE, true);
            constants.init(this.databaseManager);

            this.currentPage = React.createElement(MainDataTable, {
                directory: await this.databaseManager.getDirectory(""),
                databaseManager: this.databaseManager,
                showProgress: false,
                key: 1
            }, null);
            this.forceUpdate();
        }
    }

    async startScan(): Promise<boolean> {
        const file: string = await ipcRenderer.invoke('select-directory', "Select a directory to scan");

        if (file != null) {
            const fileScanner = new FileScanner(file);
            const rootDir = await fileScanner.scan();
            await this.databaseManager.persistDirectory(rootDir, file);

            this.currentPage = React.createElement(MainDataTable, {
                directory: await this.databaseManager.getDirectory(""),
                databaseManager: this.databaseManager
            }, null);
            this.forceUpdate();

            return true;
        } else {
            return false;
        }
    }

    render(): React.ReactNode {
        return this.currentPage;
    }
}

class StartScanScreen extends React.Component {
    readonly onStartClickImpl: () => Promise<boolean>;
    button: HTMLButtonElement;

    constructor(props: any) {
        super(props);
        this.button = null;

        this.onStartClickImpl = props.onStartClickImpl;

        this.onStartClick = this.onStartClick.bind(this);
    }

    async onStartClick(): Promise<void> {
        this.button.disabled = true;
        this.button.disabled = await this.onStartClickImpl();
    }

    render(): React.ReactNode {
        return (
            <button className="mdc-button mdc-button--outlined" onClick={this.onStartClick}>
                <span className="mdc-button__ripple"/>
                <span className="mdc-button__label">Start scan</span>
            </button>
        );
    }

    componentDidMount(): void {
        //const $this = ReactDOM.findDOMNode(this) as Element;
        //this.button = $this.getElementsByClassName('mdc-button')[0] as HTMLButtonElement;
        this.button = ReactDOM.findDOMNode(this) as HTMLButtonElement;

        MDCRipple.attachTo(this.button);
    }
}

class StartScreen extends React.Component {
    static readonly mainStyle: React.CSSProperties = {
        display: "grid",
        // @ts-ignore
        "--mdc-theme-primary": "blue"
    };

    buttons: HTMLCollectionOf<HTMLButtonElement>;
    readonly onCreateClickImpl: () => Promise<void>;
    readonly onLoadClickImpl: () => Promise<void>;

    constructor(props: any) {
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

    setButtonsEnabled(enabled: boolean): void {
        for (let i: number = 0; i < this.buttons.length; i++) {
            this.buttons[i].disabled = !enabled;
        }
    }

    async onCreateClick(): Promise<void> {
        this.setButtonsEnabled(false);
        await this.onCreateClickImpl();
        this.setButtonsEnabled(true);
    }

    async onLoadClick(): Promise<void> {
        this.setButtonsEnabled(false);
        await this.onLoadClickImpl();
        this.setButtonsEnabled(true);
    }

    render(): React.ReactNode {
        // @ts-ignore
        return this.state.visible ? (
            <div style={StartScreen.mainStyle}>
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

    componentDidMount(): void {
        const $this: Element = ReactDOM.findDOMNode(this) as Element;
        this.buttons = $this.getElementsByClassName('mdc-button') as HTMLCollectionOf<HTMLButtonElement>;

        for (let i: number = 0; i < this.buttons.length; i++) {
            MDCRipple.attachTo(this.buttons[i]);
        }
    }
}
