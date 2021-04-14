import React from "react";
import {Menu, topAppBar} from "../../elements/MDCWrapper";
import constants from "../../util/constants";
import MDCCSSProperties from "../../util/MDCCSSProperties";
import {MainDataTable} from "./MainDataTable";
import SettingsDialog from "../../settings/SettingsDialog";
import SyncDialog from "../../dialogs/SyncDialog";

/**
 * The main data table top app bar properties
 */
interface MainDataTableTopAppBarProps {
    // The parent element
    parent: MainDataTable;
}

enum settings {
    SETTINGS = "Settings",
    SYNCHRONIZE = "Synchronize"
}

/**
 * The main data table top app bar
 */
export default class MainDataTableTopAppBar extends React.Component<MainDataTableTopAppBarProps> {
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

        this.openTopAppBarMenu = this.openTopAppBarMenu.bind(this);
        this.showHideSearch = this.showHideSearch.bind(this);
    }

    /**
     * Called when the back button is clicked
     * @private
     */
    private static backButtonClick(): void {
        constants.mainComponent.gotoStartPage();
    }

    /**
     * Called when a top app bar menu option is clicked
     *
     * @param option the selected option
     * @private
     */
    private static topAppBarOptionClick(option: string): void {
        switch (option) {
            case settings.SETTINGS: {
                SettingsDialog.open();
                break;
            }
            case settings.SYNCHRONIZE: {
                SyncDialog.open(constants.mainDataTable.databaseManager).then();
                // TODO
                break;
            }
        }
    }

    public render(): React.ReactNode {
        const topAppBarStyle: MDCCSSProperties = {
            "--mdc-theme-primary": "#214456"
        };

        const menuOptions: string[] = [
            settings.SETTINGS,
            settings.SYNCHRONIZE
        ];

        return (
            <>
                <topAppBar.Header style={topAppBarStyle} ref={e => this.topAppBar = e}>
                    <topAppBar.NavigationSection title="Browse">
                        <topAppBar.NavigationButton onClick={MainDataTableTopAppBar.backButtonClick} label="Back"
                                                    iconName="arrow_back" describedby="main-top-app-bar-nav-tooltip"/>
                    </topAppBar.NavigationSection>
                    <topAppBar.ActionButtonsSection>
                        <topAppBar.ActionButton onClick={this.showHideSearch} label="Search" iconName="search"
                                                describedby="main-top-app-bar-action-search-tooltip"/>
                        <div className="mdc-menu-surface--anchor">
                            <topAppBar.ActionButton onClick={this.openTopAppBarMenu} label="More" iconName="more_vert"/>
                            <Menu options={menuOptions} onOptionClick={MainDataTableTopAppBar.topAppBarOptionClick}
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