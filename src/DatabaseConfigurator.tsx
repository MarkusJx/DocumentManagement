import {Button, DropdownMenu, OutlinedButton} from "./MDCWrapper";
import React from "react";
import {ipcRenderer} from "electron";
import MDCCSSProperties from "./MDCCSSProperties";
import * as ReactDOM from "react-dom";
import {MDCDialog} from "@material/dialog";
import {TextArea} from "./ChipTextArea";

export enum DatabaseProvider {
    SQLite = "SQLite",
    MariaDB = "MariaDB",
    MySQL = "MySQL"
}

export interface DatabaseSettings {
    provider: DatabaseProvider;
}

export interface SQLiteSettings extends DatabaseSettings {
    file: string;
}

export interface AnySettings extends DatabaseSettings {
    url: string;
    user: string;
    password: string;
}

interface DatabaseConfiguratorProps {
    onChange: () => void;
}

export class DatabaseConfigurator extends React.Component<DatabaseConfiguratorProps> {
    private readonly onChange: () => void;
    private dropdownMenu: DropdownMenu;
    private setUpDBButton: Button;

    public constructor(props: DatabaseConfiguratorProps) {
        super(props);

        this.dropdownMenu = null;
        this.setUpDBButton = null;
        this._settings = null;

        this.onChange = props.onChange.bind(this);
        this.setUpDatabaseManager = this.setUpDatabaseManager.bind(this);
    }

    private _settings: SQLiteSettings | AnySettings;

    public get settings(): SQLiteSettings | AnySettings {
        if (this._settings != null && this._settings.provider === this.dropdownMenu.selectedOption) {
            return this._settings;
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        const subheadingStyle: React.CSSProperties = {
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 400,
            color: '#464646'
        };

        const dbProviderOptions: string[] = [
            DatabaseProvider.SQLite, DatabaseProvider.MySQL, DatabaseProvider.MariaDB
        ];

        const setupStyle: React.CSSProperties = {
            marginTop: '15px'
        };

        return (
            <div>
                <h2 style={subheadingStyle} className="centered">Select a database provider</h2>
                <div className="centered">
                    <DropdownMenu initialLabel={dbProviderOptions[0]} options={dbProviderOptions}
                                  ref={e => this.dropdownMenu = e} onChange={this.onChange}/>
                </div>
                <div className="centered" style={setupStyle}>
                    <OutlinedButton text={"Set up"} onClick={this.setUpDatabaseManager}
                                    ref={e => this.setUpDBButton = e}/>
                </div>
            </div>
        );
    }

    private async setUpDatabaseManager(): Promise<void> {
        if (this.dropdownMenu.selectedOption === DatabaseProvider.SQLite) {
            this.setUpDBButton.enabled = false;
            const file: string = await ipcRenderer.invoke('select-database', false, "Select a database file");

            if (file != null) {
                this._settings = {
                    provider: DatabaseProvider.SQLite,
                    file: file
                };
            } else {
                this._settings = null;
            }

            this.setUpDBButton.enabled = true;
        } else {
            this.setUpDBButton.enabled = false;
            this._settings = await new Promise<AnySettings>((resolve) => {
                DatabaseConfigDialog.instance.open(DatabaseProvider[this.dropdownMenu.selectedOption], () => {
                    if (DatabaseConfigDialog.instance.lastData !== null) {
                        const settings = DatabaseConfigDialog.instance.lastData;
                        DatabaseConfigDialog.instance.lastData = null;

                        resolve(settings);
                    } else {
                        resolve(null);
                    }
                });
            });
            this.setUpDBButton.enabled = true;
        }

        this.onChange();
    }
}

class DatabaseConfigDialog extends React.Component {
    public static instance: DatabaseConfigDialog = null;
    public lastData: AnySettings;
    private dialog: MDCDialog;
    private urlTextField: TextArea;
    private usernameTextField: TextArea;
    private passwordTextField: TextArea;
    private currentProvider: DatabaseProvider;
    private onclose: () => void;

    public constructor(props: {}) {
        super(props);

        this.dialog = null;
        this.urlTextField = null;
        this.usernameTextField = null;
        this.passwordTextField = null;
        this.lastData = null;
        this.currentProvider = null;
        this.onclose = null;
    }

    public open(provider: DatabaseProvider, onclose: () => void): void {
        this.currentProvider = provider;
        this.onclose = onclose;
        this.dialog.open();
    }

    public render() {
        const style: MDCCSSProperties = {
            "--mdc-theme-primary": '#0033ff'
        };

        const textStyle: React.CSSProperties = {
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 300,
            color: '#464646'
        }

        return (
            <div className="mdc-dialog" style={style}>
                <div className="mdc-dialog__container">
                    <div className="mdc-dialog__surface" role="alertdialog" aria-modal="true"
                         aria-labelledby="database-config-dialog-title"
                         aria-describedby="database-config-dialog-content">
                        <h2 className="mdc-dialog__title" id="database-config-dialog-title">
                            Edit database configuration
                        </h2>
                        <div className="mdc-dialog__content" id="database-config-dialog-content">
                            <p style={textStyle}>
                                In order to connect to the database, you need to enter the following connection details:
                            </p>
                            <TextArea title={"URL"} ref={e => this.urlTextField = e}/>
                            <TextArea title={"Username"} ref={e => this.usernameTextField = e}/>
                            <TextArea title={"Password"} ref={e => this.passwordTextField = e}/>
                        </div>
                        <div className="mdc-dialog__actions">
                            <button type="button" className="mdc-button mdc-dialog__button"
                                    data-mdc-dialog-action="cancel">
                                <div className="mdc-button__ripple"/>
                                <span className="mdc-button__label">Cancel</span>
                            </button>
                            <button type="button" className="mdc-button mdc-dialog__button"
                                    data-mdc-dialog-action="accept">
                                <div className="mdc-button__ripple"/>
                                <span className="mdc-button__label">Ok</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mdc-dialog__scrim"/>
            </div>
        );
    }

    public componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        this.dialog = new MDCDialog($this);

        // Listen for the dialog closing event
        this.dialog.listen('MDCDialog:closing', async (event: CustomEvent<{ action: string }>) => {
            if (event.detail.action === "accept" && this.urlTextField.value.length > 0 && this.usernameTextField.value.length > 0) {
                this.lastData = {
                    provider: this.currentProvider,
                    url: this.urlTextField.value,
                    user: this.usernameTextField.value,
                    password: this.passwordTextField.value
                };
            } else {
                this.lastData = null;
            }

            this.urlTextField.clear();
            this.usernameTextField.clear();
            this.passwordTextField.clear();
            this.onclose();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <DatabaseConfigDialog ref={e => DatabaseConfigDialog.instance = e}/>,
        document.getElementById('database-config-dialog-container')
    );
});