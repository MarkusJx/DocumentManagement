import React from "react";
import {Menu, topAppBar} from "../../elements/MDCWrapper";
import constants from "../../util/constants";
import {MainDataTable} from "./MainDataTable";
import SettingsDialog from "../../settings/SettingsDialog";
import SyncDialog from "../../dialogs/SyncDialog";
import {getLogger} from "log4js";
import {showErrorDialog} from "../../dialogs/ErrorDialog";
import Snackbars from "../../util/Snackbars";
import RootDirSelector from "../../dialogs/RootDirSelector";
import CopyDatabaseDialog from "../../dialogs/CopyDatabaseDialog";
import DatabaseInfo from "../../dialogs/DatabaseInfo";
import LicenseViewer from "../../dialogs/LicenseViewer";

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
    RELOAD = "Reload",
    SET_ROOT_DIR = "Set root directory",
    COPY_DATABASE = "Copy the database",
    DATABASE_INFO = "Show database info",
    VIEW_LICENSE = "View License"
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
     * The navigation button
     * @private
     */
    private navbarButton: topAppBar.NavigationButton = null;

    /**
     * The top app bar navigation section
     * @private
     */
    private navSection: topAppBar.NavigationSection = null;

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
     * Set whether the nav button should be enabled
     *
     * @param value whether the nav button should be enabled
     */
    public set navButtonEnabled(value: boolean) {
        this.navbarButton.element.disabled = !value;
    }

    /**
     * Set the title
     *
     * @param value the new title
     */
    public set title(value: string) {
        this.navSection.title = value;
    }

    /**
     * Called when the back button is clicked
     * @private
     */
    private static backButtonClick(): void {
        const path = constants.mainDataTable.directory.path;
        const upPath = path.substring(0, path.lastIndexOf('/'));
        constants.mainDataTable.setDirectory(upPath).then().catch((e) => {
            logger.error("Could not go one directory up:", e);
            showErrorDialog("Could not go one directory up. Error:", e.stack);
            constants.mainComponent.gotoStartPage();
        });
    }

    private static goHome(): void {
        constants.mainComponent.gotoStartPage();
    }

    public render(): React.ReactNode {
        const menuOptions: string[] = [
            settings.SETTINGS,
            settings.SYNCHRONIZE,
            settings.SET_ROOT_DIR,
            settings.COPY_DATABASE,
            settings.DATABASE_INFO,
            settings.RELOAD,
            settings.VIEW_LICENSE
        ];

        return (
            <>
                <topAppBar.Header ref={e => this.topAppBar = e}>
                    <topAppBar.NavigationSection title="Browse" ref={e => this.navSection = e}>
                        <topAppBar.NavigationButton onClick={MainDataTableTopAppBar.backButtonClick} label="Back"
                                                    iconName="arrow_back_ios_new"
                                                    describedby="main-top-app-bar-nav-tooltip"
                                                    enabled={this.state.buttonsEnabled}
                                                    ref={e => this.navbarButton = e}/>
                    </topAppBar.NavigationSection>
                    <topAppBar.ActionButtonsSection>
                        <topAppBar.ActionButton label="Go home" onClick={MainDataTableTopAppBar.goHome}
                                                iconName="home" enabled={this.state.buttonsEnabled}
                                                describedby="main-top-app-bar-go-home-tooltip"/>
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
                SyncDialog.open();
                break;
            }
            case settings.RELOAD: {
                logger.info("Reloading the database");
                this.props.parent.setLoading(true);
                constants.databaseManager.clear().then(() => {
                    this.props.parent.loadDatabase().then(() => {
                        logger.info("Database reloaded");
                        Snackbars.genericSnackbar.snackbarText = "Database reloaded";
                        Snackbars.genericSnackbar.open();
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
            case settings.SET_ROOT_DIR: {
                RootDirSelector.open();
                break;
            }
            case settings.COPY_DATABASE: {
                CopyDatabaseDialog.open();
                break;
            }
            case settings.DATABASE_INFO: {
                DatabaseInfo.show();
                break;
            }
            case settings.VIEW_LICENSE: {
                LicenseViewer.open();
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