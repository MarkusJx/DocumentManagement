import React from "react";
import ReactDOM from "react-dom";
import {Dialog, OutlinedButton} from "../elements/MDCWrapper";
import {getLogger} from "log4js";
import DirectorySelector from "../elements/DirectorySelector";
import {ipcRenderer} from "electron";
import constants from "../util/constants";
import {showErrorDialog} from "../elements/ErrorDialog";

const logger = getLogger();

let instance: RootDirSelectorElement = null;

export default class RootDirSelector {
    public static open(): void {
        instance.open();
    }
}

class RootDirSelectorElement extends React.Component {
    private dialog: Dialog = null;
    private directorySelector: DirectorySelector = null;
    private selectDirectoryButton: OutlinedButton = null;

    public constructor(props: any) {
        super(props);

        this.selectDirectory = this.selectDirectory.bind(this);
    }

    public open(): void {
        if (constants.activeSetting != null && constants.activeSetting.localPath != null) {
            this.directorySelector.path = constants.activeSetting.localPath;
        }

        this.dialog.open();
    }

    public render(): React.ReactNode {
        return (
            <Dialog titleId={"root-dir-selector-title"} contentId={"root-dir-selector-content"}
                    title={"Select a root directory"} ref={e => this.dialog = e} hasCancelButton={true}>
                <p>
                    Select the database root directory on your local machine.<br/>
                    This step may be required if the database was created on a different machine or the root directory
                    was moved. If the directory is set up properly, you can open documents from this program eliminating
                    the need to search for the document on your local machine.<br/>
                    Once you've selected a valid directory, the setting will be stored on your local machine instead of
                    the database in order to keep the current configuration for different machines the same.
                    If you want to change the root path in the database (this changes the setting for all to the
                    database connected devices) use the 'synchronize' option.
                </p>

                <p>
                    Press 'ok' to save the selected directory. If no valid directory was selected, the default value
                    stored in the database will be used.<br/>
                    Press 'cancel' to cancel the operation.
                </p>

                <p className="centered">
                    <span className="after-space">
                        Selected directory:
                    </span>
                    <DirectorySelector ref={e => this.directorySelector = e}/>
                </p>

                <div className="centered">
                    <OutlinedButton text={"Select directory"} onClick={this.selectDirectory}
                                    ref={e => this.selectDirectoryButton = e}/>
                </div>
            </Dialog>
        );
    }

    public componentDidMount(): void {
        this.dialog.listen('MDCDialog:closing', (event) => {
            if (event.detail.action === 'accept') {
                constants.activeSetting.localPath = this.directorySelector.path;
                constants.saveActiveSetting();
                constants.databaseManager.clear().then(() => {
                    constants.mainDataTable.loadDatabase().then(() => {
                        logger.info("Main data table reloaded");
                    }).catch(e => {
                        logger.error("Could not reload the main data table:", e);
                        showErrorDialog("Could not reload the database. Error:", e.stack);
                        constants.mainComponent.gotoStartPage();
                    });
                }).catch(e => {
                    logger.error("Could not clear the database manager:", e);
                    showErrorDialog("Could not reload the database. Error:", e.stack);
                    constants.mainComponent.gotoStartPage();
                });
            }

            this.directorySelector.path = null;
        });
    }

    private async selectDirectory(): Promise<void> {
        this.selectDirectoryButton.enabled = false;
        this.directorySelector.path = await ipcRenderer.invoke('select-directory',
            "Select a directory to bind to");
        this.selectDirectoryButton.enabled = true;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    logger.info("Rendering the root directory selector");
    try {
        ReactDOM.render(
            <RootDirSelectorElement ref={e => instance = e}/>,
            document.getElementById('root-dir-selector-dialog-container')
        );
    } catch (e) {
        logger.error("Could not render the root directory selector:", e);
    }
})
