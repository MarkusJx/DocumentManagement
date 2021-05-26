import {Action, database} from "../databaseWrapper";
import React from "react";
import {Button, OutlinedButton} from "../elements/MDCWrapper";
import {DatabaseConfigurator} from "./DatabaseConfigurator";
import {ipcRenderer} from "electron";
import {showErrorDialog} from "../dialogs/ErrorDialog";
import constants from "../util/constants";
import util from "../util/util";
import {Recents} from "../settings/recentConnections";
import {getLogger} from "log4js";
import GoBackTopAppBar from "../elements/GoBackTopAppBar";

const logger = getLogger();

/**
 * The start scan callback function
 */
type startScanClick_t = (file: string, dbManager: database.DatabaseManager) => Promise<void>;

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
export default class StartScanScreen extends React.Component<StartScanScreenProps, StartScanScreenState> {
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
        return (
            <GoBackTopAppBar id={"start-scan-screen"} title={"Create a database"}>
                <div className="start-scan-screen-container">
                    <div className="start-scan-screen">
                        <div className="start-scan-screen-grid-element">
                            <h1 className="start-scan-screen-heading">
                                Create a new database
                            </h1>
                        </div>

                        <div className="start-scan-screen-grid-element start-scan-screen-explanation">
                            <p className="start-scan-screen-text">
                                The following steps must be performed in order to create a new database:
                            </p>
                            <ol className="start-scan-screen-text">
                                <li>
                                    You need to select a database file to store the collected data in
                                </li>
                                <li>
                                    A directory to scan must be selected
                                </li>
                                <li>
                                    The directory will be scanned recursively and the found directories and documents
                                    will
                                    be
                                    stored in the database
                                </li>
                            </ol>
                            <p className="start-scan-screen-text">
                                Note: If the selected database file already exists, it will be overwritten.
                            </p>
                        </div>

                        <div className="start-scan-screen-grid-element">
                            <DatabaseConfigurator onChange={this.enableButtons} ref={e => this.configurator = e}
                                                  createDatabase={true}/>
                        </div>

                        <div className="start-scan-screen-grid-element">
                            <h2 className="start-scan-screen-subheading centered">
                                Select a directory to scan
                            </h2>
                            <p className="start-scan-screen-text centered">
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

                        <div className="centered start-scan-screen-scan-button-container">
                            <OutlinedButton text={"Start scan"} onClick={this.onStartClick}
                                            ref={e => this.startScanButton = e}
                                            className="centered"/>
                        </div>
                    </div>
                </div>
            </GoBackTopAppBar>
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

        constants.databaseManager = null;
        let dbManager: database.DatabaseManager = null;
        try {
            dbManager = await util.getDatabaseManagerFromSettings(settings,
                Action.CREATE_DROP, constants.SHOW_SQL, true);
        } catch (e) {
            logger.error("Could not create a database", e);
            showErrorDialog("The database could not be created. If you are trying to connect to a remote database, " +
                "this error may be caused by invalid login credentials. Please check if your connection details are " +
                "correct. If they are correct or you did not try to connect to a remote database, here's the error:", e.message);
            constants.scanLoadingScreen.visible = false;
            this.enableButtons();
            return;
        }

        try {
            let id: string = await Recents.containsSetting(settings);
            if (id != null) {
                Recents.delete(id);
            }

            id = await Recents.add(settings);
            constants.activeSetting = await Recents.get(id);
        } catch (e) {
            logger.error("Could not add the database setting to the store:", e);
            constants.scanLoadingScreen.visible = false;
        }

        await this.onStartClickImpl(this.state.directory, dbManager);
    }
}