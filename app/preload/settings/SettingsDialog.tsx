import React from "react";
import ReactDOM from "react-dom";
import {Dialog, Switch} from "../elements/MDCWrapper";
import {Recents, Settings} from "./recentConnections";
import Snackbars from "../util/Snackbars";
import {ipcRenderer} from "electron";
import MDCCSSProperties from "../util/MDCCSSProperties";
import {MDCRipple} from "@material/ripple";
import {getLogger} from "log4js";
import Theming from "./Theming";

const logger = getLogger();

/**
 * A setting container
 */
class SettingContainer extends React.Component {
    /**
     * The actual html element
     * @private
     */
    private element: HTMLElement = null;

    public render(): React.ReactNode {
        return (
            <div className="mdc-ripple-surface settings-dialog__setting-container themed-ripple"
                 ref={e => this.element = e}>
                {this.props.children}
            </div>
        );
    }

    public componentDidMount() {
        MDCRipple.attachTo(this.element);
    }
}

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
     * The dark theme switch
     * @private
     */
    private darkThemeSwitch: Switch = null;

    /**
     * A function to be called when the dialog closes
     * @private
     */
    private onClose: () => void = null;

    public render(): React.ReactNode {
        const dialogContentStyle: MDCCSSProperties = {
            paddingLeft: 0,
            paddingRight: 0
        };

        const switchStyle: MDCCSSProperties = {
            margin: 'auto'
        };

        return (
            <Dialog titleId={"settings-dialog-title"} contentId={"settings-dialog-content"} title={"Settings"}
                    ref={e => this.dialog = e} contentStyle={dialogContentStyle}>
                <SettingContainer>
                    <p>Load the most recent database on startup</p>
                    <Switch id={"load-recent-database-on-start-switch"} ref={e => this.loadRecentOnStartupSwitch = e}
                            style={switchStyle}/>
                </SettingContainer>
                <SettingContainer>
                    <p>Dark theme</p>
                    <Switch id={"dark-theme-switch"} ref={e => this.darkThemeSwitch = e} style={switchStyle}/>
                </SettingContainer>
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
                        Theming.updateTheme();
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
        this.currentSettings.darkTheme = this.darkThemeSwitch.checked;
    }

    /**
     * Load the settings from {@link this.currentSettings}
     * @private
     */
    private loadSettings(): void {
        this.loadRecentOnStartupSwitch.checked = this.currentSettings.loadRecentOnStartup;
        this.darkThemeSwitch.checked = this.currentSettings.darkTheme;
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