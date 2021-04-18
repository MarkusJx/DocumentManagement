import React from "react";
import ReactDOM from "react-dom";
import {Dialog, Switch} from "../elements/MDCWrapper";
import {Recents, Settings} from "./recentConnections";
import Snackbars from "../util/Snackbars";
import {ipcRenderer} from "electron";
import MDCCSSProperties from "../util/MDCCSSProperties";
import {MDCRipple} from "@material/ripple";
import {getLogger} from "log4js";

const logger = getLogger();

/**
 * The settings dialog element
 */
class SettingsDialogElement extends React.Component {
    /**
     * The actual {@link Dialog}
     * @private
     */
    private dialog: Dialog = null;

    /**
     * The current {@link Settings}
     * @private
     */
    private currentSettings: Settings = null;

    /**
     * The load recent on startup {@link Switch}
     * @private
     */
    private loadRecentOnStartupSwitch: Switch = null;

    /**
     * A function to be called when the dialog closes
     * @private
     */
    private onClose: () => void = null;

    /**
     * The containers to attach a {@link MDCRipple} to
     * @private
     */
    private readonly containers: HTMLElement[] = [];

    public render(): React.ReactNode {
        const dialogContentStyle: MDCCSSProperties = {
            paddingLeft: 0,
            paddingRight: 0
        };

        const settingContainerStyle: MDCCSSProperties = {
            display: 'grid',
            gridTemplateColumns: 'auto min-content',
            columnGap: '20px',
            borderBottom: '0.5px solid #b7b7b7',
            fontFamily: '"Open Sans", sans-serif',
            padding: '0 30px'
        };

        const switchStyle: MDCCSSProperties = {
            margin: 'auto'
        };

        this.containers.length = 0;

        return (
            <Dialog titleId={"settings-dialog-title"} contentId={"settings-dialog-content"} title={"Settings"}
                    ref={e => this.dialog = e} contentStyle={dialogContentStyle}>
                <div style={settingContainerStyle} ref={e => this.containers.push(e)} className="mdc-ripple-surface">
                    <p>Load the most recent database on startup</p>
                    <Switch id={"load-recent-database-on-start-switch"} ref={e => this.loadRecentOnStartupSwitch = e}
                            style={switchStyle}/>
                </div>
            </Dialog>
        );
    }

    public componentDidMount(): void {
        // Listen for the dialog to close
        this.dialog.listen('MDCDialog:closing', (event) => {
            try {
                this.storeSettings();
                // Only show the settings saved/discarded dialog
                // when there were actual changes made
                if (JSON.stringify(this.currentSettings) != JSON.stringify(Recents.settings)) {
                    if (event.detail.action == 'accept') {
                        // Save the settings
                        Recents.settings = this.currentSettings;
                        Snackbars.settingsSnackbar.snackbarText = "Settings saved";
                        Snackbars.settingsSnackbar.open();
                    } else {
                        Snackbars.settingsSnackbar.snackbarText = "Settings discarded";
                        Snackbars.settingsSnackbar.open();
                    }
                }

                this.currentSettings = null;
                if (this.onClose) this.onClose();
            } catch (e) {
                logger.error("An error occurred while closing the settings dialog:", e);
            }
        });

        // Attach the mdc ripples
        this.containers.forEach(e => MDCRipple.attachTo(e));
    }

    /**
     * Open the settings dialog
     *
     * @param onClose the close listener function
     */
    public open(onClose: () => void): void {
        Snackbars.settingsSnackbar.close();

        // Only open the dialog if it isn't already opened
        if (!this.dialog.dialog.isOpen) {
            this.onClose = onClose;
            this.currentSettings = Recents.settings;
            this.loadSettings();
            this.dialog.open();
        }
    }

    /**
     * Store the settings in {@link this.currentSettings}
     * @private
     */
    private storeSettings(): void {
        this.currentSettings.loadRecentOnStartup = this.loadRecentOnStartupSwitch.checked;
    }

    /**
     * Load the settings from {@link this.currentSettings}
     * @private
     */
    private loadSettings(): void {
        this.loadRecentOnStartupSwitch.checked = this.currentSettings.loadRecentOnStartup;
    }
}

/**
 * The main settings dialog
 */
let settingsDialog: SettingsDialogElement = null

/**
 * The settings dialog
 */
export default class SettingsDialog {
    /**
     * Open the settings dialog
     *
     * @param onClose the close listener function
     */
    public static open(onClose: () => void = null): void {
        settingsDialog.open(onClose);
    }
}

// Listen for the 'open-settings' event and
// open the settings dialog if requested
ipcRenderer.on('open-settings', () => {
    try {
        SettingsDialog.open();
    } catch (e) {
        logger.error("An error occurred while opening the settings dialog:", e);
    }
});

// Generate the settings dialog into the HTML on load
window.addEventListener('DOMContentLoaded', () => {
    logger.info("Mounting the settings dialog");
    try {
        ReactDOM.render(
            <SettingsDialogElement ref={e => settingsDialog = e}/>,
            document.getElementById('settings-dialog-container')
        );
    } catch (e) {
        logger.error("An error occurred while mounting the settings dialog:", e);
    }
});