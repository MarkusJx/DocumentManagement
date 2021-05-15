import {database} from "../../databaseWrapper";
import React from "react";
import constants from "../../util/constants";
import {showErrorDialog} from "../../dialogs/ErrorDialog";
import {getLogger} from "log4js";

const logger = getLogger();

/**
 * The data table pagination properties
 */
interface MainDataTablePaginationProps {
    // Whether the pagination bar should be visible
    visible?: boolean;
}

/**
 * The data table pagination state
 */
interface MainDataTablePaginationState {
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
export default class MainDataTablePagination extends React.Component<MainDataTablePaginationProps, MainDataTablePaginationState> {
    /**
     * The number of elements per page
     * @private
     */
    private readonly ELEMENTS_PER_PAGE: number = 100;

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
    public constructor(props: MainDataTablePaginationProps) {
        super(props);

        // Set all buttons to null
        this.first_button = null;
        this.prev_button = null;
        this.next_button = null;
        this.last_button = null;

        this.filter = null;

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
        try {
            constants.mainDataTable.setLoading(true);
            // Get the documents
            const documents: database.Document[] = await constants.databaseManager.getDocumentsByFilter(this.filter, offset);
            // No need to set the offset and limit, MainDataTable#setSearchResults will handle this
            await constants.mainDataTable.setSearchResults(documents, this.filter, offset, this.state.total);
            constants.mainDataTable.setLoading(false);
            constants.mainDataTable.topAppBar.navButtonEnabled = true;
        } catch (e) {
            logger.error("An error occurred while updating the search results:", e);
            showErrorDialog("An error occurred while updating the search results", e.message);
            constants.mainComponent.gotoStartPage();
        }
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