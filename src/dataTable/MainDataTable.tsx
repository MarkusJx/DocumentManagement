import React from "react";
import * as ReactDOM from "react-dom";
import {MDCDataTable} from "@material/data-table";
import {database} from "../databaseWrapper";
import {DataTableDirectoryElement, DataTableDocumentElement, DirectoryUpElement} from "./DataTableElement";
import MDCCSSProperties from "../MDCCSSProperties";

export class MainDataTable extends React.Component {
    public readonly databaseManager: database.DatabaseManager;
    private dataTable: MDCDataTable;
    private directory: database.Directory;
    private showProgress: boolean;

    public constructor(props: any) {
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

    public async setDirectory(directoryPath: string): Promise<void> {
        this.setLoading(true);

        this.directory = await this.databaseManager.getDirectory(directoryPath);
        this.showProgress = false;
        this.forceUpdate();

        this.setLoading(false);
    }

    public render(): JSX.Element {
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

    private getTableBody(): JSX.Element {
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
                        <DirectoryUpElement parent={this} currentDirectory={this.directory}
                                            key={this.directory.path}/> : null
                }
                {
                    this.directory.documents.map(doc => (
                        <DataTableDocumentElement document={doc} parent={this} key={doc.absolutePath}/>
                    ))
                }
                {
                    this.directory.directories.map(dir => (
                        <DataTableDirectoryElement directory={dir} parent={this} key={dir.name}/>
                    ))
                }
                </tbody>
            );
        }
    }
}