import React from "react";
import ReactDOM from "react-dom";
import {SwipeDialog, SwipeDialogSwipeElement} from "./SwipeDialog";
import {DatabaseConfigurator} from "../pages/DatabaseConfigurator";
import {getLogger} from "log4js";
import {showErrorDialog} from "../elements/ErrorDialog";
import util from "../util/util";
import {Action} from "../databaseWrapper";
import constants from "../util/constants";
import DoneDialog from "./DoneDialog";
import {Recents} from "../settings/recentConnections";

const logger = getLogger();

/**
 * The static instance
 */
let instance: CopyDatabaseDialogElement = null;

/**
 * The copy database dialog
 */
export default class CopyDatabaseDialog {
    /**
     * Open the copy database dialog
     */
    public static open(): void {
        instance.open();
    }
}

/**
 * The copy database dialog element
 */
class CopyDatabaseDialogElement extends React.Component {
    /**
     * The swipe dialog swipe elements
     * @private
     */
    private contentPages: SwipeDialogSwipeElement[] = [];

    /**
     * The swipe dialog
     * @private
     */
    private swipeDialog: SwipeDialog = null;

    /**
     * The database dialog
     * @private
     */
    private configurator: DatabaseConfigurator = null;

    /**
     * Create an copy database dialog element
     *
     * @param props the properties
     */
    public constructor(props: any) {
        super(props);

        this.onContinue = this.onContinue.bind(this);
        this.onConfigChange = this.onConfigChange.bind(this);
    }

    public render(): React.ReactNode {
        this.contentPages = [];

        return (
            <SwipeDialog startTitle="Copy database" contentPages={this.contentPages} ref={e => this.swipeDialog = e}
                         onContinue={this.onContinue}>
                <SwipeDialogSwipeElement ref={e => this.contentPages.push(e)} title="Copy database">
                    <p>Copy the currently selected database to another database</p>
                    <ul>
                        <li>
                            This will copy all documents, directories, properties and tags to the selected database
                        </li>
                        <li>
                            First, you'll have to select a database to copy the data to
                        </li>
                        <li>
                            If a valid database was selected, the data will be copied to the new database
                        </li>
                        <li>
                            Please note that any data in the new database will be overridden.
                        </li>
                    </ul>
                </SwipeDialogSwipeElement>

                <SwipeDialogSwipeElement ref={e => this.contentPages.push(e)} title="Select a database">
                    <DatabaseConfigurator ref={e => this.configurator = e} onChange={this.onConfigChange}
                                          createDatabase={true}/>
                </SwipeDialogSwipeElement>

                <SwipeDialogSwipeElement ref={e => this.contentPages.push(e)} title="Commit changes">
                    <p>Press 'start' to start the copy process. Remember:</p>
                    <ul>
                        <li>No changes will be made to the original database where the data will be copied from</li>
                        <li>Any data in the new database will be overridden (or at least the required tables)</li>
                        <li>The new database will be added to the list of recently used databases</li>
                        <li>Once completed, you will be redirected to the original database</li>
                    </ul>
                </SwipeDialogSwipeElement>

                <SwipeDialogSwipeElement ref={e => this.contentPages.push(e)} title="Copying the data">
                    <p className="centered">We are now copying the data to the new database</p>
                    <p className="centered">This may take a while, depending on the size of your database.</p>
                    <p className="centered">Please don't turn off your pc.</p>
                    <p className="centered">
                        Once the operation is complete, you will be redirected to the original database
                    </p>
                </SwipeDialogSwipeElement>
            </SwipeDialog>
        );
    }

    /**
     * Open the dialog
     */
    public open(): void {
        this.configurator.clear();
        this.swipeDialog.show();
    }

    /**
     * Hide the dialog
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
                this.swipeDialog.continueButton.enabled = false;
                break;
            }
            case 2: {
                this.swipeDialog.continueButton.title = "Start";
                break;
            }
            case 3: {
                this.copyData().then(() => {
                    logger.info("The data was copied successfully");
                }).catch(e => {
                    logger.error("Could not copy the data:", e);
                    showErrorDialog("Could not copy the data. Error:", e.stack);
                    this.hide();
                });
                break;
            }
        }
    }

    /**
     * Copy the data to the new database
     * @private
     */
    private async copyData(): Promise<void> {
        this.swipeDialog.progressBar.progressBar.determinate = false;
        this.swipeDialog.continueButton.enabled = false;
        this.swipeDialog.cancelButton.enabled = false;

        // Get the database manager and copy the data
        const manager = await util.getDatabaseManagerFromSettings(this.configurator.settings, Action.CREATE_DROP,
            constants.SHOW_SQL, true);
        if (!await constants.databaseManager.copyDatabaseTo(manager)) {
            throw new Error("The copy operation failed");
        }

        logger.info("Saving the database setting");
        await Recents.add(this.configurator.settings, false);

        // Hide this and show the done dialog
        this.hide();
        await util.sleep(250);
        DoneDialog.show("Data copied successfully");

        await util.sleep(2000);
        DoneDialog.hide();
    }

    /**
     * Called when the database configuration is changed
     * @private
     */
    private onConfigChange(): void {
        this.swipeDialog.continueButton.enabled = this.configurator.ok;
    }
}

// Create the static instance on load
window.addEventListener('DOMContentLoaded', () => {
    logger.info("Rendering the copy database dialog");
    try {
        ReactDOM.render(
            <CopyDatabaseDialogElement ref={e => instance = e}/>,
            document.getElementById('copy-database-dialog-container')
        );
    } catch (e) {
        logger.error("Could not render the copy database dialog:", e);
    }
});