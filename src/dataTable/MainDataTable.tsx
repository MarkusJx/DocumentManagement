import React from "react";
import ReactDOM from "react-dom";
import {MDCDataTable} from "@material/data-table";
import {database} from "../databaseWrapper";
import {DataTableDirectoryElement, DataTableDocumentElement, DirectoryUpElement} from "./DataTableElement";
import MDCCSSProperties from "../MDCCSSProperties";

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
        } else {
            this.dataTable.hideProgress();

            for (let i = 0; i < buttons.length; i++) {
                buttons[i].disabled = false;
            }
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