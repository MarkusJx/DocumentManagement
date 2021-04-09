import {Button, Dialog, DropdownMenu, OutlinedButton, OutlinedTextField} from "../elements/MDCWrapper";
import React from "react";
import {ipcRenderer} from "electron";
import MDCCSSProperties from "../util/MDCCSSProperties";
import * as ReactDOM from "react-dom";

/**
 * A database provider
 */
export enum DatabaseProvider {
    SQLite = "SQLite",
    MariaDB = "MariaDB",
    MySQL = "MySQL"
}

/**
 * General database settings
 */
export interface DatabaseSettings {
    // The selected provider
    provider: DatabaseProvider;
}

/**
 * SQLite database settings
 */
export interface SQLiteSettings extends DatabaseSettings {
    // The selected file
    file: string;
}

/**
 * Settings for any database (not SQLite)
 */
export interface AnySettings extends DatabaseSettings {
    // The connection url
    url: string;
    // The username to use
    user: string;
    // The password to use
    password: string;
}

/**
 * The database configurator props
 */
interface DatabaseConfiguratorProps {
    // A function to be called when a value is changed
    onChange: () => void;
}

/**
 * A database configuration element
 */
export class DatabaseConfigurator extends React.Component<DatabaseConfiguratorProps> {
    /**
     * A function to be called when a value is changed
     * @private
     */
    private readonly onChange: () => void;

    /**
     * The dropdown menu
     * @private
     */
    private dropdownMenu: DropdownMenu;

    /**
     * The set up database button
     * @private
     */
    private setUpDBButton: Button;

    /**
     * Create a configurator
     *
     * @param props the properties
     */
    public constructor(props: DatabaseConfiguratorProps) {
        super(props);

        this.dropdownMenu = null;
        this.setUpDBButton = null;
        this._settings = null;

        this.onChange = props.onChange.bind(this);
        this.setUpDatabaseManager = this.setUpDatabaseManager.bind(this);

        this.clear();
    }

    /**
     * The currently selected settings
     * @private
     */
    private _settings: SQLiteSettings | AnySettings;

    /**
     * Get the currently selected settings
     *
     * @return the currently selected settings
     */
    public get settings(): SQLiteSettings | AnySettings | null {
        if (this.ok) {
            return this._settings;
        } else {
            return null;
        }
    }

    /**
     * Check whether the supplied data is enough to load the database
     */
    public get ok(): boolean {
        return this._settings != null && this._settings.provider === this.dropdownMenu.selectedOption &&
            (this._settings.provider === DatabaseProvider.SQLite || ((this._settings as AnySettings).url.length > 0 &&
                (this._settings as AnySettings).user.length > 0));
    }

    /**
     * Clear all settings
     */
    public clear(): void {
        this._settings = null;
        DatabaseConfigDialog.instance.clear();
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

        const infoTextStyle: React.CSSProperties = {
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 300,
            color: '#464646'
        };

        return (
            <div>
                <h2 style={subheadingStyle} className="centered">Select a database provider</h2>
                <div className="centered">
                    <DropdownMenu initialLabel={dbProviderOptions[0]} options={dbProviderOptions}
                                  ref={e => this.dropdownMenu = e} onChange={this.onChange}/>
                </div>

                <div className="centered" style={infoTextStyle}>
                    <p style={{marginBottom: '5px'}}>
                        Select a database provider. Once selected, you must set up the provider:
                    </p>
                    <ul style={{marginTop: 0}}>
                        <li>When using SQLite, you must select a location to store the database file on your system</li>
                        <li>
                            When using any other provider, you'll need to enter the connection details such as the
                            url to connect to, the user name and password to use. In order to continue, at least a
                            connection url and a user name must be specified.
                        </li>
                    </ul>
                </div>

                <div className="centered" style={setupStyle}>
                    <OutlinedButton text={"Set up"} onClick={this.setUpDatabaseManager}
                                    ref={e => this.setUpDBButton = e}/>
                </div>
            </div>
        );
    }

    /**
     * Set up the database configuration
     * @private
     */
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

/**
 * A database configuration dialog
 */
class DatabaseConfigDialog extends React.Component {
    /**
     * A static instance
     */
    public static instance: DatabaseConfigDialog = null;

    /**
     * The last stored data
     */
    public lastData: AnySettings;

    /**
     * The dialog
     * @private
     */
    private dialog: Dialog;

    /**
     * The database url text field
     * @private
     */
    private urlTextField: OutlinedTextField;

    /**
     * The user name text field
     * @private
     */
    private usernameTextField: OutlinedTextField;

    /**
     * The password text field
     * @private
     */
    private passwordTextField: OutlinedTextField;

    /**
     * The current database provider
     * @private
     */
    private currentProvider: DatabaseProvider;

    /**
     * The close listener
     * @private
     */
    private onclose: () => void;

    /**
     * Create a config dialog
     *
     * @param props the properties
     */
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

    /**
     * Open the dialog
     *
     * @param provider the selected provider
     * @param onclose the close listener
     */
    public open(provider: DatabaseProvider, onclose: () => void): void {
        this.currentProvider = provider;
        this.onclose = onclose;
        if (this.lastData != null && this.lastData.provider === provider) {
            this.urlTextField.value = this.lastData.url;
            this.usernameTextField.value = this.lastData.user;
            this.passwordTextField.value = this.lastData.password;
        }

        this.dialog.open();
    }

    public clear(): void {
        this.urlTextField.clear();
        this.usernameTextField.clear();
        this.passwordTextField.clear();
        this.lastData = null;
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
            <Dialog titleId={"database-config-dialog-title"} contentId={"database-config-dialog-content"}
                    title={"Edit database configuration"} style={style} ref={e => this.dialog = e}>
                <p style={textStyle}>
                    In order to connect to the database, you need to enter the following connection details:
                </p>
                <OutlinedTextField title={"URL"} ref={e => this.urlTextField = e} labelId={"database-config-url"}/>
                <OutlinedTextField title={"Username"} ref={e => this.usernameTextField = e}
                                   labelId={"database-config-user"}/>
                <OutlinedTextField title={"Password"} ref={e => this.passwordTextField = e}
                                   labelId={"database-config-pass"}/>
            </Dialog>
        );
    }

    public componentDidMount(): void {
        // Listen for the dialog closing event
        this.dialog.listen('MDCDialog:closing', async (event: CustomEvent<{ action: string }>) => {
            if (event.detail.action === "accept") {
                this.lastData = {
                    provider: this.currentProvider,
                    url: this.urlTextField.value,
                    user: this.usernameTextField.value,
                    password: this.passwordTextField.value
                };
            }

            this.urlTextField.clear();
            this.usernameTextField.clear();
            this.passwordTextField.clear();
            this.onclose();
        });
    }
}

// Add a config dialog to the DOM
window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <DatabaseConfigDialog ref={e => DatabaseConfigDialog.instance = e}/>,
        document.getElementById('database-config-dialog-container')
    );
});