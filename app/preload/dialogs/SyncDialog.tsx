import React from "react";
import ReactDOM from "react-dom";
import {Button, OutlinedButton, ProgressBar} from "../elements/MDCWrapper";
import util from "../util/util";
import {database, FileScanner} from "../databaseWrapper";
import {ipcRenderer} from "electron";
import {getLogger} from "log4js";
import {showErrorDialog} from "../elements/ErrorDialog";
import constants from "../util/constants";

// Import the css associated with this file
util.importCss("styles/dialogs/SyncDialog.css");

const logger = getLogger();

/**
 * The static sync dialog instance
 */
let instance: SyncDialogElement = null;

/**
 * The sync dialog
 */
export default class SyncDialog {
    /**
     * Open the sync dialog
     *
     * @param databaseManager the manager of the database to update
     */
    public static open(databaseManager: database.DatabaseManager): void {
        instance.show(databaseManager);
    }
}

/**
 * The sync dialog title properties
 */
interface SyncDialogTitleProps {
    // The (actual) sync dialog title
    title: string;
}

/**
 * The sync dialog title state
 */
interface SyncDialogTitleState {
    // The (actual) sync dialog title
    title: string;
}

/**
 * The sync dialog title element
 */
class SyncDialogTitle extends React.Component<SyncDialogTitleProps, SyncDialogTitleState> {
    /**
     * Create the sync dialog title
     *
     * @param props the properties
     */
    public constructor(props: SyncDialogTitleProps) {
        super(props);

        this.state = {
            title: props.title
        };
    }

    /**
     * Set the title
     *
     * @param title the new title
     */
    public set title(title: string) {
        this.setState({
            title: title
        });
    }

    public render(): React.ReactNode {
        return (
            <h1 className="sync-dialog__title">
                {this.state.title}
            </h1>
        );
    }
}

/**
 * The sync dialog path element state
 */
interface SyncDialogPathState {
    // The path to display
    path: string;
}

/**
 * The sync dialog path element
 */
class SyncDialogPath extends React.Component<{}, SyncDialogPathState> {
    /**
     * Create a sync dialog path element
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.state = {
            path: null
        };
    }

    /**
     * Get the shown path
     */
    public get path(): string {
        return this.state.path;
    }

    /**
     * Set the path to display
     *
     * @param path the new path
     */
    public set path(path: string) {
        this.setState({
            path: path
        });
    }

    public render(): React.ReactNode {
        return (
            <span className="start-scan-path">
                {this.state.path == null ? "none" : this.state.path}
            </span>
        );
    }
}

/**
 * The sync dialog to remove element state
 */
interface SyncDialogToRemoveState {
    // The number of directories to remove
    directories: number;
    // The number of documents to remove
    documents: number;
}

/**
 * THe sync dialog to remove element
 */
class SyncDialogToRemove extends React.Component<{}, SyncDialogToRemoveState> {
    /**
     * Create a sync dialog to remove element
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.state = {
            directories: 0,
            documents: 0
        };
    }

    /**
     * Get the number of directories to remove
     */
    public get directories(): number {
        return this.state.directories;
    }

    /**
     * Set the number of directories to remove
     *
     * @param dirs the number of directories to remove
     */
    public set directories(dirs: number) {
        this.setState({
            directories: dirs
        });
    }

    /**
     * Get the number of documents to remove
     */
    public get documents(): number {
        return this.state.documents;
    }

    /**
     * Set the number of documents to remove
     *
     * @param docs the number of documents to remove
     */
    public set documents(docs: number) {
        this.setState({
            documents: docs
        });
    }

    public render(): React.ReactNode {
        return (
            <p>
                The scan is now complete.<br/>
                The operation will remove {this.state.documents} documents<br/>
                and {this.state.directories} directories.
            </p>
        );
    }
}

/**
 * The sync dialog element
 */
class SyncDialogElement extends React.Component {
    /**
     * The sync dialog titles
     * @private
     */
    private static readonly titles: string[] = [
        "Synchronize",
        "Set directory",
        "Scanning",
        "Commit changes",
        "Updating database"
    ];

    /**
     * The top progress bar
     * @private
     */
    private progressBar: ProgressBar = null;

    /**
     * Whether the element is visible
     * @private
     */
    private visible: boolean = false;

    /**
     * The actual html element
     * @private
     */
    private element: HTMLElement = null;

    /**
     * The manager of the database to synchronize
     * @private
     */
    private databaseManager: database.DatabaseManager = null;

    /**
     * The current page number
     * @private
     */
    private currentPage: number = 0;

    /**
     * The continue button
     * @private
     */
    private continueButton: Button = null;

    /**
     * The cancel button
     * @private
     */
    private cancelButton: Button = null;

    /**
     * The content page html elements
     * @private
     */
    private contentPages: HTMLElement[] = [];

    /**
     * The sync dialog title
     * @private
     */
    private title: SyncDialogTitle = null;

    /**
     * The select directory button
     * @private
     */
    private selectDirectoryButton: OutlinedButton = null;

    /**
     * The selected directory to sync path
     * @private
     */
    private selectedPath: SyncDialogPath = null;

    /**
     * The number of element to remove element
     * @private
     */
    private elementsToRemove: SyncDialogToRemove = null;

    /**
     * The updated directory to persist
     * @private
     */
    private updatedDirectory: database.DirectoryProxy = null;

    /**
     * Create the sync dialog
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.onContinue = this.onContinue.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.selectDirectory = this.selectDirectory.bind(this);
    }

    /**
     * Set the continue button text
     *
     * @param text the new continue button text
     * @private
     */
    private set continueButtonText(text: string) {
        this.continueButton.title = text;
    }

    public render(): React.ReactNode {
        this.contentPages = [];

        return (
            <div className="sync-dialog__background" ref={e => this.element = e}>
                <div className="sync-dialog__dialog">
                    <div className="sync-dialog__dialog-top-bar">
                        <ProgressBar ref={e => this.progressBar = e} style={{"--mdc-theme-primary": '#00d8b4'}}/>
                        <SyncDialogTitle title={SyncDialogElement.titles[0]} ref={e => this.title = e}/>
                    </div>

                    <div className="sync-dialog__content">
                        <div className="sync-dialog__swipe-element start-page" ref={e => this.contentPages.push(e)}>
                            <p>Synchronize the database with your file system</p>
                            <ul>
                                <li>This will re-scan through your file system searching for documents</li>
                                <li>
                                    Documents that were deleted from your file system will be removed from the database
                                </li>
                                <li>Documents that were added will be added to the database</li>
                            </ul>
                        </div>

                        <div className="sync-dialog__swipe-element" ref={e => this.contentPages.push(e)}>
                            <p>
                                Select a directory to synchronize with.<br/>
                                This should be the same directory you selected when the database was created.
                            </p>

                            <p className="centered">
                                <span className="after-space">
                                    Selected directory:
                                </span>
                                <SyncDialogPath ref={e => this.selectedPath = e}/>
                            </p>

                            <div className="centered">
                                <OutlinedButton text={"Select directory"} onClick={this.selectDirectory}
                                                ref={e => this.selectDirectoryButton = e}/>
                            </div>
                        </div>

                        <div className="sync-dialog__swipe-element" ref={e => this.contentPages.push(e)}>
                            <p>
                                We are now scanning through your file system.<br/>
                                This may take a while.
                            </p>
                        </div>

                        <div className="sync-dialog__swipe-element" ref={e => this.contentPages.push(e)}>
                            <SyncDialogToRemove ref={e => this.elementsToRemove = e}/>
                            <p>
                                Press "commit" to remove all non-existent documents and directories
                                from the database and add all newly created ones.
                            </p>
                        </div>

                        <div className="sync-dialog__swipe-element" ref={e => this.contentPages.push(e)}>
                            <p>
                                We are now updating the database.<br/>
                                This may take a while.
                            </p>
                        </div>
                    </div>

                    <div className="sync-dialog__actions">
                        <Button text="Cancel" onClick={this.onCancel} ref={e => this.cancelButton = e}/>
                        <Button text="Next" onClick={this.onContinue}
                                ref={e => this.continueButton = e}/>
                    </div>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.progressBar.progressBar.determinate = true;
        this.progressBar.progressBar.progress = 0;
    }

    /**
     * Show the sync dialog
     *
     * @param databaseManager the manager of the database to update
     */
    public show(databaseManager: database.DatabaseManager): void {
        this.databaseManager = databaseManager;
        this.contentPages.forEach(e => e.classList.remove("centered", "left"));
        this.contentPages[0].classList.add("start-page");
        this.currentPage = 0;
        this.progressBar.progressBar.progress = 0;
        this.progressBar.progressBar.determinate = true;
        this.continueButtonText = "Next";
        this.selectedPath.path = null;

        if (!this.visible) {
            this.visible = true;
            this.element.classList.add("visible");
            this.element.classList.remove("hidden");
        }

        this.continueButton.enabled = true;
        this.cancelButton.enabled = true;
    }

    /**
     * Hide the sync dialog
     */
    public hide(): void {
        if (this.visible) {
            this.visible = false;
            this.element.classList.remove("visible");
            this.element.classList.add("hidden");
            setTimeout(() => {
                this.element.classList.remove("hidden");
            }, 125);
        }
    }

    /**
     * Called when the continue button is pressed
     * @private
     */
    private onContinue(): void {
        if ((this.currentPage + 1) < this.contentPages.length) {
            this.contentPages[this.currentPage].classList.add("left");
            this.contentPages[this.currentPage].classList.remove("centered", "start-page");
            this.currentPage++;
            this.contentPages[this.currentPage].classList.add("centered");
            this.title.title = SyncDialogElement.titles[this.currentPage];
        }

        this.progressBar.progressBar.progress = this.currentPage / (this.contentPages.length - 1);
        switch (this.currentPage) {
            case 1: {
                this.continueButtonText = "Start scan";
                this.continueButton.enabled = false;
                break;
            }
            case 2: {
                this.scanDirectory();
                break;
            }
            case 3: {
                this.continueButton.title = "Commit";
                break;
            }
            case 4: {
                this.synchronize();
                break;
            }
        }
    }

    /**
     * Scan the selected directory
     * @private
     */
    private scanDirectory(): void {
        this.continueButton.enabled = false;
        this.cancelButton.enabled = false;
        this.progressBar.progressBar.determinate = false;
        const scanner: FileScanner = new FileScanner(this.selectedPath.path);
        scanner.scan().then(async (directory: database.DirectoryProxy) => {
            this.updatedDirectory = directory;
            this.elementsToRemove.directories = Number(await this.databaseManager.getDirectoriesNotIn(directory));
            this.elementsToRemove.documents = Number(await this.databaseManager.getDocumentsNotIn(directory));
            this.continueButton.enabled = true;
            this.cancelButton.enabled = true;
            this.progressBar.progressBar.determinate = true;
            this.onContinue();
        }).catch(e => {
            logger.error("Could not scan through the file system:", e);
            showErrorDialog("Could not scan through the file system. Error:", e.stack);
            this.hide();
        });
    }

    /**
     * Synchronize the database with the selected directory
     * @private
     */
    private synchronize(): void {
        this.continueButton.enabled = false;
        this.cancelButton.enabled = false;
        this.progressBar.progressBar.determinate = false;
        this.databaseManager.synchronizeDirectory(this.updatedDirectory).then((result: boolean) => {
            if (result) {
                constants.mainDataTable.loadDatabase(this.databaseManager).then(() => {
                    logger.debug("Main data table loaded");
                }).catch(e => {
                    logger.error("Could not load the database:", e);
                    showErrorDialog("Could not load the database. Error:", e.stack);
                    constants.mainComponent.gotoStartPage();
                });
                this.hide();
            } else {
                logger.error("DatabaseManager.synchronizeDirectory returned false");
                showErrorDialog("Could not commit the changes to the database.");
                this.hide();
            }
        }).catch(e => {
            logger.error("Could not synchronize the database:", e);
            showErrorDialog("Could not commit the changes to the database. Error:", e.stack);
            this.hide();
        });
    }

    /**
     * Select a directory to sync with
     * @private
     */
    private async selectDirectory(): Promise<void> {
        this.selectDirectoryButton.enabled = false;
        this.continueButton.enabled = false;
        this.selectedPath.path = await ipcRenderer.invoke('select-directory', "Select a directory to scan");

        this.selectDirectoryButton.enabled = true;
        this.continueButton.enabled = this.selectedPath.path != null;
    }

    /**
     * Called when the cancel button is pressed
     * @private
     */
    private onCancel(): void {
        this.hide();
    }
}

// Create the sync dialog element on content load
window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <SyncDialogElement ref={e => instance = e}/>,
        document.getElementById('sync-dialog-container'),
    );
});
