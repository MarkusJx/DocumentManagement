import React from "react";
import {database} from "../../databaseWrapper";
import constants from "../../util/constants";
import {DataTable, MDCDataTableContainer, MDCDataTableProgressIndicator,} from "../../elements/MDCWrapper";
import {getLogger} from "log4js";
import {showErrorDialog} from "../../elements/ErrorDialog";
import {SearchBox} from "../../elements/SearchBox";
import Tooltip from "../../elements/Tooltip";
import MainDataTableTopAppBar from "./MainDataTableTopAppBar";
import util from "../../util/util";
import Snackbars from "../../util/Snackbars";
import MainDataTablePagination from "./MainDataTablePagination";
import MainDataTableContent from "./MainDataTableContent";

const logger = getLogger();

/**
 * The main data table properties
 */
export interface MainDataTableProps {
    // The directory to display
    directory: database.Directory;
    // Whether to show a progress bar
    showProgress?: boolean;
}

/**
 * The main data table state
 */
interface MainDataTableState {
    // The content id
    contentId: string;
}

/**
 * The main data table
 */
export class MainDataTable extends React.Component<MainDataTableProps, MainDataTableState> {
    /**
     * The search box
     */
    public searchBox: SearchBox = null;

    /**
     * The actual mdc data table
     * @private
     */
    private dataTable: DataTable = null;

    /**
     * The data table pagination bar
     * @private
     */
    private dataTablePagination: MainDataTablePagination = null;

    /**
     * The top app bar
     * @private
     */
    private topAppBar: MainDataTableTopAppBar = null;

    /**
     * The content
     * @private
     */
    private content: MainDataTableContent = null;

    /**
     * Whether to show a progress bar on load
     * @private
     */
    private showProgress: boolean;

    /**
     * Create the main data table
     *
     * @param props the properties
     */
    public constructor(props: MainDataTableProps) {
        super(props);

        if (props.showProgress == undefined || typeof props.showProgress !== "boolean") {
            this.showProgress = false;
        } else {
            this.showProgress = props.showProgress;
        }

        this.state = {
            contentId: util.generateUid()
        };

        this.startSearch = this.startSearch.bind(this);
    }

    /**
     * Get the current displayed directory
     *
     * @return the current directory
     */
    public get directory(): database.Directory {
        return this.content.directory;
    }

    /**
     * Set the current directory
     *
     * @param directory the current directory
     */
    public set directory(directory: database.Directory) {
        this.setState({
            contentId: util.generateUid()
        });

        this.content.directory = directory;

        this.dataTablePagination.visible = false;
    }

    /**
     * Load a database
     */
    public loadDatabase(): Promise<void> {
        this.setLoading(true);
        return this.loadFinished();
    }

    /**
     * Set the database manager and load the root directory from the database
     */
    public async loadFinished(): Promise<void> {
        this.directory = await constants.databaseManager.getRootDirectory();
        if (this.directory == null) {
            throw new Error("The directory was not found");
        }

        const databaseInfo: database.DatabaseInfo = await constants.databaseManager.getDatabaseInfo();
        if (databaseInfo == null) {
            throw new Error("The database info could not be retrieved");
        }

        // Check if the source path exists on the hard drive
        if ((constants.activeSetting.localPath == null && !await util.fileExists(databaseInfo.sourcePath)) ||
            (constants.activeSetting.localPath != null && !await util.fileExists(constants.activeSetting.localPath))) {
            logger.warn("The source directory could not be found");
            Snackbars.sourceDirNotFoundSnackbar.snackbarText = "The source directory could not be found. " +
                "You may want to set/update the local path manually.";
            Snackbars.sourceDirNotFoundSnackbar.open();
        }

        this.setLoading(false);
    }

    /**
     * Start the search
     */
    public async startSearch(): Promise<void> {
        try {
            this.setLoading(true);
            const filter: database.DocumentFilter = await this.searchBox.getFilter();
            const documents: database.Document[] = await constants.databaseManager.getDocumentsBy(filter, 0);
            await this.setSearchResults(documents, filter);
            this.setLoading(false);
        } catch (e) {
            logger.error("An error occurred while searching for documents:", e);
            showErrorDialog("Could not start the search. Error:", e.message);
        }
    }

    /**
     * Set the results of a search query
     *
     * @param searchResults the search results
     * @param filter the filter used to create the query
     * @param offset the current offset in the query
     * @param total the total number of rows in the query
     */
    public async setSearchResults(searchResults: database.Document[], filter: database.DocumentFilter, offset: number = 0, total: number = null): Promise<void> {
        // Set the current state
        this.content.directory = new database.Directory(searchResults, [], null, "")

        // Set the filter used
        this.dataTablePagination.setFilter(filter);

        // Show the pagination bar and set the elements
        this.dataTablePagination.visible = true;
        if (total == null) {
            this.dataTablePagination.setTotalElements(await constants.databaseManager.getNumDocumentsBy(filter), offset);
        } else {
            this.dataTablePagination.setTotalElements(total, offset);
        }
    }

    /**
     * Show the progress bar on the data table
     *
     * @param loading whether to show it
     */
    public setLoading(loading: boolean): void {
        constants.searchBox.startButtonEnabled = !loading
        this.topAppBar.buttonsEnabled = !loading;
        this.showProgress = loading;
        this.content.loading = loading;

        if (loading) {
            this.dataTable.dataTable.showProgress();
            this.dataTablePagination.disableAllButtons();
        } else {
            this.dataTable.dataTable.hideProgress();

            // Call componentDidMount on the pagination element to disable the buttons
            this.dataTablePagination.componentDidMount();
        }
    }

    /**
     * Set the directory with a directory path
     *
     * @param directoryPath the directory path to display
     */
    public async setDirectory(directoryPath: string): Promise<void> {
        this.setLoading(true);
        this.directory = await constants.databaseManager.getDirectory(directoryPath);
        this.setLoading(false);
    }

    public render(): React.ReactNode {
        const style: React.CSSProperties = {
            width: "100%"
        };

        return (
            <MainDataTableTopAppBar parent={this} ref={e => this.topAppBar = e}>
                {constants.databaseManager ?
                    <SearchBox searchStart={this.startSearch}
                               ref={e => this.searchBox = e}/> : null}
                <DataTable style={style} ref={e => this.dataTable = e}>
                    <MDCDataTableContainer headers={["Name", "Status", "Type", "Edit", "Open"]}>
                        <MainDataTableContent key={this.state.contentId} directory={this.props.directory}
                                              ref={e => this.content = e}/>
                    </MDCDataTableContainer>
                    <MDCDataTableProgressIndicator/>
                    <MainDataTablePagination visible={false} ref={e => this.dataTablePagination = e}/>
                </DataTable>
            </MainDataTableTopAppBar>
        );
    }

    public componentDidMount(): void {
        if (this.showProgress) {
            this.topAppBar.buttonsEnabled = false;

            // Sleep for some time before showing
            // the progress bar the first time.
            // If there was no sleep before showing
            // the progress bar, it would be in the
            // wrong place, probably because this event
            // seems to fire before everything
            // is actually properly mounted.
            setTimeout(() => {
                if (this.showProgress) {
                    this.dataTable.dataTable.showProgress();
                }
            }, 50);
        } else {
            this.topAppBar.buttonsEnabled = true;
            this.dataTable.dataTable.hideProgress();
        }

        Tooltip.create({
            text: "Go to the start page",
            id: "main-top-app-bar-nav-tooltip"
        });

        Tooltip.create({
            text: "Show/Hide the search bar",
            id: "main-top-app-bar-action-search-tooltip"
        });
    }

    public componentWillUnmount(): void {
        Tooltip.delete("main-top-app-bar-nav-tooltip");
        Tooltip.delete("main-top-app-bar-action-search-tooltip");
    }
}
