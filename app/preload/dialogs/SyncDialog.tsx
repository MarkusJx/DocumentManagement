import React from "react";
import ReactDOM from "react-dom";
import {OutlinedButton} from "../elements/MDCWrapper";
import util from "../util/util";
import {database, FileScanner} from "../databaseWrapper";
import {ipcRenderer} from "electron";
import {getLogger} from "log4js";
import {showErrorDialog} from "./ErrorDialog";
import constants from "../util/constants";
import DoneDialog from "./DoneDialog";
import DirectorySelector from "../elements/DirectorySelector";
import {SwipeDialog, SwipeDialogSwipeElement} from "./SwipeDialog";

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
     */
    public static open(): void {
        instance.show();
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
     * The select directory button
     * @private
     */
    private selectDirectoryButton: OutlinedButton = null;

    /**
     * The selected directory to sync path
     * @private
     */
    private selectedPath: DirectorySelector = null;

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
     * The content pages of the swipe dialog
     * @private
     */
    private contentPages: SwipeDialogSwipeElement[] = [];

    /**
     * The actual dialog
     * @private
     */
    private swipeDialog: SwipeDialog = null;

    /**
     * Create the sync dialog
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.onContinue = this.onContinue.bind(this);
        this.selectDirectory = this.selectDirectory.bind(this);
    }

    public render(): React.ReactNode {
        this.contentPages = [];

        return (
            <SwipeDialog contentPages={this.contentPages} startTitle={"Synchronize"}
                         ref={e => this.swipeDialog = e} onContinue={this.onContinue}>
                <SwipeDialogSwipeElement ref={e => this.contentPages.push(e)} title="Synchronize">
                    <p>Synchronize the database with your file system</p>
                    <ul>
                        <li>This will re-scan through your file system searching for documents</li>
                        <li>
                            Documents that were deleted from your file system will be removed from the database
                        </li>
                        <li>Documents that were added will be added to the database</li>
                        <li>You should make a copy of the current database before continuing</li>
                    </ul>
                </SwipeDialogSwipeElement>

                <SwipeDialogSwipeElement ref={e => this.contentPages.push(e)} title="Set directory">
                    <p>
                        Select a directory to synchronize with.<br/>
                        This should be the same directory you selected when the database was created.
                    </p>

                    <p className="centered">
                        <span className="after-space">
                            Selected directory:
                        </span>
                        <DirectorySelector ref={e => this.selectedPath = e}/>
                    </p>

                    <div className="centered">
                        <OutlinedButton text={"Select directory"} onClick={this.selectDirectory}
                                        ref={e => this.selectDirectoryButton = e}/>
                    </div>
                </SwipeDialogSwipeElement>

                <SwipeDialogSwipeElement ref={e => this.contentPages.push(e)} title="Scanning">
                    <p>
                        We are now scanning through your file system.<br/>
                        This may take a while.
                    </p>
                </SwipeDialogSwipeElement>

                <SwipeDialogSwipeElement ref={e => this.contentPages.push(e)} title="Commit changes">
                    <SyncDialogToRemove ref={e => this.elementsToRemove = e}/>
                    <p>
                        Press "commit" to remove all non-existent documents and directories
                        from the database and add all newly created ones.
                    </p>
                </SwipeDialogSwipeElement>

                <SwipeDialogSwipeElement ref={e => this.contentPages.push(e)} title="Updating database">
                    <p>
                        We are now updating the database.<br/>
                        This may take a while.
                    </p>
                </SwipeDialogSwipeElement>
            </SwipeDialog>
        );
    }

    /**
     * Show the sync dialog
     */
    public show(): void {
        this.selectedPath.path = null;
        this.swipeDialog.show();
    }

    /**
     * Hide the sync dialog
     */
    public hide(): void {
        this.swipeDialog.hide();
    }

    /**
     * Called when the continue button is pressed
     * @private
     */
    private onContinue(): void {
        switch (this.swipeDialog.currentPage) {
            case 1: {
                this.swipeDialog.continueButtonText = "Start scan";
                this.swipeDialog.continueButton.enabled = false;
                break;
            }
            case 2: {
                this.scanDirectory();
                break;
            }
            case 3: {
                this.swipeDialog.continueButton.title = "Commit";
                break;
            }
            case 4: {
                this.synchronize().then(() => {
                    logger.info("The sync operation was successful");
                }).catch(e => {
                    logger.error("Could not synchronize the database:", e);
                    showErrorDialog("Could not commit the changes to the database. Error:", e.stack);
                    this.hide();
                });
                break;
            }
        }
    }

    /**
     * Scan the selected directory
     * @private
     */
    private scanDirectory(): void {
        this.swipeDialog.continueButton.enabled = false;
        this.swipeDialog.cancelButton.enabled = false;
        this.swipeDialog.progressBar.progressBar.determinate = false;
        const scanner: FileScanner = new FileScanner(this.selectedPath.path);
        scanner.scan().then(async (directory: database.DirectoryProxy) => {
            this.updatedDirectory = directory;
            this.elementsToRemove.directories = Number(await constants.databaseManager.getDirectoriesNotIn(directory));
            this.elementsToRemove.documents = Number(await constants.databaseManager.getDocumentsNotIn(directory));
            this.swipeDialog.continueButton.enabled = true;
            this.swipeDialog.cancelButton.enabled = true;
            this.swipeDialog.progressBar.progressBar.determinate = true;
            this.swipeDialog.onContinue();
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
    private async synchronize(): Promise<void> {
        this.swipeDialog.continueButton.enabled = false;
        this.swipeDialog.cancelButton.enabled = false;
        this.swipeDialog.progressBar.progressBar.determinate = false;
        const couldSync = await constants.databaseManager.synchronizeDirectory(this.updatedDirectory, this.selectedPath.path);
        if (couldSync) {
            if (constants.activeSetting.localPath != null) {
                logger.info("The local path is set, deleting it");
                constants.activeSetting.localPath = null;
                constants.saveActiveSetting();
            }

            await constants.mainDataTable.loadDatabase();
            logger.debug("Main data table loaded");
            this.hide();

            await util.sleep(250);
            DoneDialog.show("Database successfully updated");

            await util.sleep(2000);
            DoneDialog.hide();
        } else {
            throw new Error("DatabaseManager.synchronizeDirectory returned false");
        }
    }

    /**
     * Select a directory to sync with
     * @private
     */
    private async selectDirectory(): Promise<void> {
        this.selectDirectoryButton.enabled = false;
        this.swipeDialog.continueButton.enabled = false;
        this.selectedPath.path = await ipcRenderer.invoke('select-directory', "Select a directory to scan");

        this.selectDirectoryButton.enabled = true;
        this.swipeDialog.continueButton.enabled = this.selectedPath.path != null;
    }
}

// Create the sync dialog element on content load
window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <SyncDialogElement ref={e => instance = e}/>,
        document.getElementById('sync-dialog-container'),
    );
});
