import React from "react";
import * as ReactDOM from "react-dom";
import {MDCDataTable} from "@material/data-table";
import {database} from "../databaseWrapper";
import {DataTableDirectoryElement, DataTableDocumentElement} from "./DataTableElement";

export class MainDataTable extends React.Component {
    dataTable: MDCDataTable;
    directory: database.Directory;
    showProgress: boolean;

    constructor(props: any) {
        super(props);
        this.dataTable = null;
        this.directory = props.directory;
        if (props.showProgress == undefined || typeof props.showProgress !== "boolean") {
            console.log(typeof props.showProgress)
            this.showProgress = false;
        } else {
            this.showProgress = props.showProgress;
        }
    }

    getTableContents(): JSX.Element {
        if (this.directory == null) {
            return (
                <tbody className="mdc-data-table__content">
                <tr className="mdc-data-table__row">
                    <th className="mdc-data-table__cell" scope="row"/>
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
                        <DataTableDocumentElement document={doc}/>
                    ))
                }
                {
                    this.directory.directories.map(dir => (
                        // @ts-ignore
                        <DataTableDirectoryElement directory={dir}/>
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

                        {this.getTableContents()}
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