import React from "react";
import {Menu, topAppBar} from "../../elements/MDCWrapper";
import constants from "../../util/constants";
import MDCCSSProperties from "../../util/MDCCSSProperties";
import {MainDataTable} from "./MainDataTable";
import SettingsDialog from "../../settings/SettingsDialog";
import SyncDialog from "../../dialogs/SyncDialog";
import {getLogger} from "log4js";
import {showErrorDialog} from "../../elements/ErrorDialog";

const logger = getLogger();

/**
 * The main data table top app bar properties
 */
interface MainDataTableTopAppBarProps {
    // The parent element
    parent: MainDataTable;
}

/**
 * The main data table top app bar state
 */
interface MainDataTableTopAppBarState {
    // Whether all buttons should be enabled
    buttonsEnabled: boolean;
}

/**
 * The top app bar menu options
 */
enum settings {
    SETTINGS = "Settings",
    SYNCHRONIZE = "Synchronize",
    RELOAD = "Reload"
}

/**
 * The main data table top app bar
 */
export default class MainDataTableTopAppBar extends React.Component<MainDataTableTopAppBarProps, MainDataTableTopAppBarState> {
    /**
     * The top app bar menu
     * @private
     */
    private topAppBarMenu: Menu = null;

    /**
     * The top app bar object
     * @private
     */
    private topAppBar: topAppBar.Header = null;

    /**
     * Create a main data table top app bar
     *
     * @param props the properties
     */
    public constructor(props: MainDataTableTopAppBarProps) {
        super(props);

        this.state = {
            buttonsEnabled: true
        };

        this.openTopAppBarMenu = this.openTopAppBarMenu.bind(this);
        this.showHideSearch = this.showHideSearch.bind(this);
        this.topAppBarOptionClick = this.topAppBarOptionClick.bind(this);
    }

    /**
     * Set whether all buttons should be enabled
     *
     * @param value true if all buttons should be enabled
     */
    public set buttonsEnabled(value: boolean) {
        this.setState({
            buttonsEnabled: value
        });
    }

    /**
     * Called when the back button is clicked
     * @private
     */
    private static backButtonClick(): void {
        constants.mainComponent.gotoStartPage();
    }

    public render(): React.ReactNode {
        const topAppBarStyle: MDCCSSProperties = {
            "--mdc-theme-primary": "#214456"
        };

        const menuOptions: string[] = [
            settings.SETTINGS,
            settings.SYNCHRONIZE,
            settings.RELOAD
        ];

        return (
            <>
                <topAppBar.Header style={topAppBarStyle} ref={e => this.topAppBar = e}>
                    <topAppBar.NavigationSection title="Browse">
                        <topAppBar.NavigationButton onClick={MainDataTableTopAppBar.backButtonClick} label="Back"
                                                    iconName="arrow_back" describedby="main-top-app-bar-nav-tooltip"
                                                    enabled={this.state.buttonsEnabled}/>
                    </topAppBar.NavigationSection>
                    <topAppBar.ActionButtonsSection>
                        <topAppBar.ActionButton onClick={this.showHideSearch} label="Search" iconName="search"
                                                describedby="main-top-app-bar-action-search-tooltip"
                                                enabled={this.state.buttonsEnabled}/>
                        <div className="mdc-menu-surface--anchor">
                            <topAppBar.ActionButton onClick={this.openTopAppBarMenu} label="More" iconName="more_vert"
                                                    enabled={this.state.buttonsEnabled}/>
                            <Menu options={menuOptions} onOptionClick={this.topAppBarOptionClick}
                                  ref={e => this.topAppBarMenu = e} style={{marginTop: '48px'}}/>
                        </div>
                    </topAppBar.ActionButtonsSection>
                </topAppBar.Header>
                <topAppBar.Main>
                    {this.props.children}
                </topAppBar.Main>
            </>
        );
    }

    /**
     * Called when a top app bar menu option is clicked
     *
     * @param option the selected option
     * @private
     */
    private topAppBarOptionClick(option: string): void {
        switch (option) {
            case settings.SETTINGS: {
                SettingsDialog.open();
                break;
            }
            case settings.SYNCHRONIZE: {
                SyncDialog.open(constants.mainDataTable.databaseManager);
                break;
            }
            case settings.RELOAD: {
                logger.info("Reloading the database");
                this.props.parent.setLoading(true);
                this.props.parent.databaseManager.clear().then(() => {
                    this.props.parent.loadDatabase(this.props.parent.databaseManager).then(() => {
                        logger.info("Database reloaded");
                    }).catch(e => {
                        showErrorDialog("Could not reload the database. Error:", e.stack);
                        logger.error("Could not reload the database:", e);
                        constants.mainComponent.gotoStartPage();
                    });
                }).catch(e => {
                    showErrorDialog("Could not reload the database. Error:", e.stack);
                    logger.error("Could not clear the entity manager:", e);
                    constants.mainComponent.gotoStartPage();
                });

                break;
            }
        }
    }

    /**
     * Open the top app bar menu
     * @private
     */
    private openTopAppBarMenu(): void {
        this.topAppBarMenu.open = !this.topAppBarMenu.open;
    }

    /**
     * Show or hide the search element
     * @private
     */
    private showHideSearch(): void {
        this.props.parent.searchBox.showHideMainContent();
    }
}