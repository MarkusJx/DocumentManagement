import React from "react";
import {OutlinedButton} from "../elements/MDCWrapper";
import SettingsDialog from "../settings/SettingsDialog";
import util from "../util/util";

util.importCss("styles/pages/StartScreen.css");

/**
 * The start screen properties
 */
interface StartScreenProps {
    // Called when the create button was clicked
    onCreateClickImpl: () => void;
    // Called when the load button was clicked
    onLoadClickImpl: () => void;
    // Called when the load recent button was clicked
    onLoadRecentClickImpl: () => void;
}

/**
 * The start screen
 */
export default class StartScreen extends React.Component<StartScreenProps> {
    /**
     * The create database button
     * @private
     */
    private createButton: OutlinedButton;

    /**
     * The load database button
     * @private
     */
    private loadButton: OutlinedButton;

    /**
     * The load recent database button
     * @private
     */
    private loadRecentButton: OutlinedButton;

    /**
     * The open settings button
     * @private
     */
    private openSettingsButton: OutlinedButton;

    /**
     * Create the start screen
     *
     * @param props the properties
     */
    public constructor(props: StartScreenProps) {
        super(props);
        this.createButton = null;
        this.loadButton = null;
        this.loadRecentButton = null;
        this.openSettingsButton = null;

        this.onCreateClick = this.onCreateClick.bind(this);
        this.onLoadClick = this.onLoadClick.bind(this);
        this.onLoadRecentClick = this.onLoadRecentClick.bind(this);
        this.onOpenSettings = this.onOpenSettings.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <div className="start-screen-selector">
                <div className="start-screen-container">
                    <div className="start-screen-heading-container">
                        <h2 className="start-screen-heading">
                            Create a database
                        </h2>
                    </div>

                    <ul className="start-screen-list">
                        <li>This indexes all files inside a selected directory and adds those to the database</li>
                        <li>A search start location must be selected</li>
                        <li>A database file must be selected to be either created or overridden</li>
                    </ul>

                    <div className="start-screen-button-alignment">
                        <OutlinedButton text={"Create"} onClick={this.onCreateClick}
                                        ref={e => this.createButton = e}/>
                    </div>
                </div>

                <div className="start-screen-container">
                    <div className="start-screen-heading-container">
                        <h2 className="start-screen-heading">
                            Load a database
                        </h2>
                    </div>

                    <ul className="start-screen-list">
                        <li>This loads an existing database</li>
                        <li>You must select a valid database</li>
                    </ul>

                    <div className="start-screen-button-alignment">
                        <OutlinedButton text={"Load"} onClick={this.onLoadClick}
                                        ref={e => this.loadButton = e}/>
                    </div>
                </div>

                <div className="start-screen-container">
                    <div className="start-screen-heading-container">
                        <h2 className="start-screen-heading">
                            Load a recently used database
                        </h2>
                    </div>

                    <ul className="start-screen-list">
                        <li>This lets you select a recently used database</li>
                    </ul>

                    <div className="start-screen-button-alignment">
                        <OutlinedButton text={"Load"} onClick={this.onLoadRecentClick}
                                        ref={e => this.loadRecentButton = e}/>
                    </div>
                </div>

                <div className="start-screen-container">
                    <div className="start-screen-heading-container">
                        <h2 className="start-screen-heading">
                            Settings
                        </h2>
                    </div>

                    <ul className="start-screen-list">
                        <li>Open and edit the settings</li>
                    </ul>

                    <div className="start-screen-button-alignment">
                        <OutlinedButton text={"Open"} onClick={this.onOpenSettings}
                                        ref={e => this.openSettingsButton = e}/>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Set whether all buttons should be enabled
     *
     * @param enabled set to true if the buttons should be enabled
     */
    public setButtonsEnabled(enabled: boolean): void {
        if (this.createButton)
            this.createButton.enabled = enabled;
        if (this.loadButton)
            this.loadButton.enabled = enabled;
        if (this.loadRecentButton)
            this.loadRecentButton.enabled = enabled;
        if (this.openSettingsButton)
            this.openSettingsButton.enabled = enabled;
    }

    /**
     * Called when the create button was clicked
     * @private
     */
    private onCreateClick(): void {
        this.setButtonsEnabled(false);
        this.props.onCreateClickImpl();
    }

    /**
     * Called when the load button was clicked
     * @private
     */
    private onLoadClick(): void {
        this.setButtonsEnabled(false);
        this.props.onLoadClickImpl();
    }

    /**
     * Called when a recent database should be loaded
     * @private
     */
    private onLoadRecentClick(): void {
        this.setButtonsEnabled(false);
        this.props.onLoadRecentClickImpl();
    }

    /**
     * Called when the settings should be opened
     * @private
     */
    private onOpenSettings(): void {
        this.setButtonsEnabled(false);
        SettingsDialog.open(() => {
            this.setButtonsEnabled(true);
        });
    }
}
