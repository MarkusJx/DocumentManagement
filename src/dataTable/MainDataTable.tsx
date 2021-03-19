import React from "react";
import ReactDOM from "react-dom";
import {MDCDataTable} from "@material/data-table";
import {database} from "../databaseWrapper";
import {DataTableDirectoryElement, DataTableDocumentElement, DirectoryUpElement} from "./DataTableElement";
import MDCCSSProperties from "../MDCCSSProperties";
import constants from "../constants";

/**
 * The main data table properties
 */
export interface MainDataTableProps {
    // The directory to display
    directory: database.Directory;
    // The database manager to use
    databaseManager: database.DatabaseManager;
    // Whether to show a progress bar
    showProgress?: boolean;
}

/**
 * The main data table state
 */
interface MainDataTableState {
    // The currently displayed directory
    directory: database.Directory;
}

/**
 * The main data table
 */
export class MainDataTable extends React.Component<MainDataTableProps, MainDataTableState> {
    /**
     * The database manager
     */
    public readonly databaseManager: database.DatabaseManager;

    /**
     * The actual mdc data table
     * @private
     */
    private dataTable: MDCDataTable;

    private dataTablePagination: MDCDataTablePagination;

    /**
     * Whether to show a progress bar on load
     * @private
     */
    private readonly showProgress: boolean;

    /**
     * Create the main data table
     *
     * @param props the properties
     */
    public constructor(props: MainDataTableProps) {
        super(props);
        this.dataTable = null;
        this.databaseManager = props.databaseManager;
        this.dataTablePagination = null;
        if (props.showProgress == undefined || typeof props.showProgress !== "boolean") {
            this.showProgress = false;
        } else {
            this.showProgress = props.showProgress;
        }

        this.state = {
            directory: props.directory
        };
    }

    /**
     * Get the current displayed directory
     *
     * @return the current directory
     */
    public get directory(): database.Directory {
        return this.state.directory;
    }

    /**
     * Set the current directory
     *
     * @param directory the current directory
     */
    public set directory(directory: database.Directory) {
        this.setState({
            directory: directory
        });

        this.dataTablePagination.visible = false;
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
        this.setState({
            directory: new database.Directory(searchResults, [], null, "")
        });

        // Set the filter used
        this.dataTablePagination.setFilter(filter);

        // Show the pagination bar and set the elements
        this.dataTablePagination.visible = true;
        if (total == null) {
            this.dataTablePagination.setTotalElements(await this.databaseManager.getNumDocumentsBy(filter), offset);
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
        const $this: Element = ReactDOM.findDOMNode(this) as Element;
        const buttons = $this.getElementsByTagName('button');
        if (loading) {
            this.dataTable.showProgress();

            for (let i = 0; i < buttons.length; i++) {
                buttons[i].disabled = true;
            }

            this.dataTablePagination.disableAllButtons();
        } else {
            this.dataTable.hideProgress();

            for (let i = 0; i < buttons.length; i++) {
                buttons[i].disabled = false;
            }

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
        this.directory = await this.databaseManager.getDirectory(directoryPath);
        this.setLoading(false);
    }

    public render(): React.ReactNode {
        const style: MDCCSSProperties = {
            "--mdc-theme-primary": "#0056ff",
            width: "100%"
        }

        return (
            <div className="mdc-data-table" style={style}>
                <div className="mdc-data-table__table-container">
                    <table aria-label="Documents" className="mdc-data-table__table">
                        <thead>
                        <tr className="mdc-data-table__header-row">
                            <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Name</th>
                            <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Status</th>
                            <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Type</th>
                            <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Edit</th>
                            <th className="mdc-data-table__header-cell" role="columnheader" scope="col">Open</th>
                        </tr>
                        </thead>
                        {this.getTableBody()}
                    </table>
                </div>

                <div className="mdc-data-table__progress-indicator">
                    <div className="mdc-data-table__scrim"/>
                    <div
                        className="mdc-linear-progress mdc-linear-progress--indeterminate mdc-data-table__linear-progress"
                        role="progressbar" aria-label="Data is being loaded...">
                        <div className="mdc-linear-progress__buffer">
                            <div className="mdc-linear-progress__buffer-bar"/>
                            <div className="mdc-linear-progress__buffer-dots"/>
                        </div>
                        <div className="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                            <span className="mdc-linear-progress__bar-inner"/>
                        </div>
                        <div className="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                            <span className="mdc-linear-progress__bar-inner"/>
                        </div>
                    </div>
                </div>

                <MDCDataTablePagination visible={false} databaseManager={this.databaseManager}
                                        ref={e => this.dataTablePagination = e}/>
            </div>
        );
    }

    public componentDidMount(): void {
        const $this: Element = ReactDOM.findDOMNode(this) as Element;
        this.dataTable = new MDCDataTable($this);

        if (this.showProgress) {
            this.dataTable.showProgress();
        } else {
            this.dataTable.hideProgress();
        }
    }

    /**
     * Generate the table body
     *
     * @return the table HTML node
     * @private
     */
    private getTableBody(): React.ReactNode {
        if (this.directory == null) {
            return (
                <tbody className="mdc-data-table__content">
                <tr className="mdc-data-table__row">
                    <th className="mdc-data-table__cell" scope="row">Loading...</th>
                    <td className="mdc-data-table__cell"/>
                    <td className="mdc-data-table__cell"/>
                    <td className="mdc-data-table__cell"/>
                    <td className="mdc-data-table__cell"/>
                </tr>
                </tbody>
            );
        } else {
            return (
                <tbody className="mdc-data-table__content">
                {
                    (this.directory.path != null && this.directory.path.length > 0) ?
                        <DirectoryUpElement currentDirectory={this.directory} key={this.directory.path}/> : null
                }
                {
                    this.directory.documents.map(doc => (
                        <DataTableDocumentElement document={doc} key={doc.absolutePath}/>
                    ))
                }
                {
                    this.directory.directories.map(dir => (
                        <DataTableDirectoryElement directory={dir} key={dir.name}/>
                    ))
                }
                </tbody>
            );
        }
    }
}

/**
 * The data table pagination properties
 */
interface MDCDataTablePaginationProps {
    // Whether the pagination bar should be visible
    visible?: boolean;
    // The database manager
    databaseManager: database.DatabaseManager;
}

/**
 * The data table pagination state
 */
interface MDCDataTablePaginationState {
    // The current offset in the query
    offset: number;
    // The limit in the query = min(offset + elementsPerPage, total - (total % elementsPerPage))
    limit: number;
    // The total amount of rows in this query
    total: number;
    // Whether the pagination bar is visible
    visible: boolean;
    // True if the 'first page' button is enabled
    first_enabled: boolean;
    // True if the 'previous page' button is enabled
    prev_enabled: boolean;
    // True if the 'next page' button is enabled
    next_enabled: boolean;
    // True if the 'last page' button is enabled
    last_enabled: boolean;
}

/**
 * A data table pagination bar
 */
class MDCDataTablePagination extends React.Component<MDCDataTablePaginationProps, MDCDataTablePaginationState> {
    /**
     * The number of elements per page
     * @private
     */
    private readonly ELEMENTS_PER_PAGE: number = 100;

    /**
     * The database manager
     * @private
     */
    private readonly databaseManager: database.DatabaseManager;

    /**
     * The 'first page' button element
     * @private
     */
    private first_button: HTMLButtonElement;

    /**
     * The 'previous page' button element
     * @private
     */
    private prev_button: HTMLButtonElement;

    /**
     * The 'next page' button element
     * @private
     */
    private next_button: HTMLButtonElement;

    /**
     * The 'last page' button element
     * @private
     */
    private last_button: HTMLButtonElement;

    /**
     * The current filter used to create the query
     * @private
     */
    private filter: database.DocumentFilter;

    /**
     * Create a pagination bar
     *
     * @param props the properties
     */
    public constructor(props: MDCDataTablePaginationProps) {
        super(props);

        // Set all buttons to null
        this.first_button = null;
        this.prev_button = null;
        this.next_button = null;
        this.last_button = null;

        this.filter = null;
        this.databaseManager = props.databaseManager;

        // Set the state
        this.state = {
            offset: 0,
            limit: 0,
            total: 0,
            visible: props.visible != undefined ? props.visible : true,
            first_enabled: false,
            prev_enabled: false,
            next_enabled: false,
            last_enabled: false
        };

        // Bind all functions
        this.firstClicked = this.firstClicked.bind(this);
        this.prevClicked = this.prevClicked.bind(this);
        this.nextClicked = this.nextClicked.bind(this);
        this.lastClicked = this.lastClicked.bind(this);
    }

    /**
     * Set the pagination bar visibility
     *
     * @param value whether the bar should be visible
     */
    public set visible(value: boolean) {
        this.setState({
            visible: value
        });

        // Enable/disable all buttons
        this.componentDidMount();
    }

    /**
     * Set the filter used to create the current query
     *
     * @param filter the filter used
     */
    public setFilter(filter: database.DocumentFilter): void {
        this.filter = filter;
    }

    /**
     * Set the number of total elements on the query and the current offset
     *
     * @param num the number of elements
     * @param offset the current offset
     */
    public setTotalElements(num: number, offset: number = 0) {
        // Set the state
        this.setState({
            offset: offset,
            limit: Math.min(num, offset + this.ELEMENTS_PER_PAGE),
            total: num,
            first_enabled: offset > 0,
            prev_enabled: offset > 0,
            next_enabled: num > this.ELEMENTS_PER_PAGE && offset + this.ELEMENTS_PER_PAGE < num,
            last_enabled: num > this.ELEMENTS_PER_PAGE && offset + this.ELEMENTS_PER_PAGE < num
        });

        // Enable/disable all buttons properly
        this.componentDidMount();
    }

    /**
     * Disable all buttons
     */
    public disableAllButtons(): void {
        this.setState({
            first_enabled: false,
            prev_enabled: false,
            next_enabled: false,
            last_enabled: false
        });
    }

    public render(): React.ReactNode {
        let style: React.CSSProperties = {};
        if (!this.state.visible) {
            style = {
                visibility: "hidden",
                display: "none"
            };
        }

        return (
            <div className="mdc-data-table__pagination" style={style}>
                <div className="mdc-data-table__pagination-trailing">
                    <div className="mdc-data-table__pagination-navigation">
                        <div className="mdc-data-table__pagination-total">
                            {`${this.state.offset + 1}-${this.state.limit} of ${this.state.total}`}
                        </div>
                        <button className="mdc-icon-button material-icons mdc-data-table__pagination-button"
                                data-first-page="true" ref={e => this.first_button = e} onClick={this.firstClicked}>
                            <div className="mdc-button__icon">first_page</div>
                        </button>
                        <button className="mdc-icon-button material-icons mdc-data-table__pagination-button"
                                data-prev-page="true" ref={e => this.prev_button = e} onClick={this.prevClicked}>
                            <div className="mdc-button__icon">chevron_left</div>
                        </button>
                        <button className="mdc-icon-button material-icons mdc-data-table__pagination-button"
                                data-next-page="true" ref={e => this.next_button = e} onClick={this.nextClicked}>
                            <div className="mdc-button__icon">chevron_right</div>
                        </button>
                        <button className="mdc-icon-button material-icons mdc-data-table__pagination-button"
                                data-last-page="true" ref={e => this.last_button = e} onClick={this.lastClicked}>
                            <div className="mdc-button__icon">last_page</div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.first_button.disabled = !this.state.first_enabled;
        this.prev_button.disabled = !this.state.prev_enabled;
        this.next_button.disabled = !this.state.next_enabled;
        this.last_button.disabled = !this.state.last_enabled;
    }

    /**
     * Update the search results
     *
     * @param offset the offset to go to in the query
     * @private
     */
    private async updateSearchResults(offset: number): Promise<void> {
        // Get the documents
        const documents: database.Document[] = await this.databaseManager.getDocumentsBy(this.filter, offset);
        // No need to set the offset and limit, MainDataTable#setSearchResults will handle this
        await constants.mainDataTable.setSearchResults(documents, this.filter, offset, this.state.total);
    }

    /**
     * Called when the 'first page' button is clicked
     * @private
     */
    private async firstClicked(): Promise<void> {
        await this.updateSearchResults(0);
    }

    /**
     * Called when the 'previous page' button is clicked
     * @private
     */
    private async prevClicked(): Promise<void> {
        const offset = Math.max(0, this.state.offset - this.ELEMENTS_PER_PAGE);
        await this.updateSearchResults(offset);
    }

    /**
     * Called when the 'next page' button is clicked
     * @private
     */
    private async nextClicked(): Promise<void> {
        const offset = Math.min(this.state.offset + this.ELEMENTS_PER_PAGE, this.state.total - (this.state.total % this.ELEMENTS_PER_PAGE));
        await this.updateSearchResults(offset);
    }

    /**
     * Called when the 'last page' button is clicked
     * @private
     */
    private async lastClicked(): Promise<void> {
        const offset = this.state.total - (this.state.total % this.ELEMENTS_PER_PAGE);
        await this.updateSearchResults(offset);
    }
}