import React from "react";
import * as ReactDOM from "react-dom";
import {MDCDataTable} from "@material/data-table";
import {database} from "../databaseWrapper";
import {DataTableDirectoryElement, DataTableDocumentElement} from "./DataTableElement";

export class MainDataTable extends React.Component {
    dataTable: MDCDataTable;
    directory: database.Directory;
    showProgress: boolean;
    readonly databaseManager: database.DatabaseManager;

    constructor(props: any) {
        super(props);
        this.dataTable = null;
        this.directory = props.directory;
        this.databaseManager = props.databaseManager;
        if (props.showProgress == undefined || typeof props.showProgress !== "boolean") {
            this.showProgress = false;
        } else {
            this.showProgress = props.showProgress;
        }
    }

    setLoading(loading: boolean): void {
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

    async setDirectory(directoryPath: string): Promise<void> {
        this.setLoading(true);

        this.directory = await this.databaseManager.getDirectory(directoryPath);
        this.showProgress = false;
        this.forceUpdate();

        this.setLoading(false);
    }

    getTableBody(): JSX.Element {
        console.log(this.directory);
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
                    this.directory.documents.map(doc => (
                        // @ts-ignore
                        <DataTableDocumentElement document={doc} parent={this} key={doc.absolutePath}/>
                    ))
                }
                {
                    this.directory.directories.map(dir => (
                        // @ts-ignore
                        <DataTableDirectoryElement directory={dir} parent={this} key={dir.name}/>
                    ))
                }
                </tbody>
            );
        }
    }

    render(): JSX.Element {
        return (
            <div className="mdc-data-table">
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

    componentDidMount(): void {
        const $this: Element = ReactDOM.findDOMNode(this) as Element;
        this.dataTable = new MDCDataTable($this);

        if (this.showProgress) {
            this.dataTable.showProgress();
        } else {
            this.dataTable.hideProgress();
        }
    }
}