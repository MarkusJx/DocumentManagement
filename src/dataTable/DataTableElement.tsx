import React from "react";
import * as ReactDOM from "react-dom";

import * as util from "../util";
import * as constants from "../constants";
import {database} from "../databaseWrapper";
import {MainDataTable} from "./MainDataTable";
import {MDCTooltip} from "@material/tooltip";

let lastId = 0;

function getId(): string {
    return 'tooltip-' + lastId++;
}

abstract class DataTableElement extends React.Component {
    /*componentDidMount(): void {
        const $this: Element = ReactDOM.findDOMNode(this) as Element;
        const buttons = $this.getElementsByClassName('mdc-icon-button');
        for (let i = 0; i < buttons.length; i++) {
            MDCRipple.attachTo(buttons[i]);
        }
    }*/
}

class EditDocumentButton extends React.Component {
    readonly document: database.Document;
    readonly dataTable: MainDataTable;

    constructor(props: any) {
        super(props);
        this.document = props.document;
        this.dataTable = props.dataTable;

        this.onEditButtonClick = this.onEditButtonClick.bind(this);
    }

    onEditButtonClick(): void {
        constants.fileEditor.open(this.document, this.dataTable);
    }

    render(): JSX.Element {
        return (
            <button className="mdc-icon-button material-icons" onClick={this.onEditButtonClick}>
                <div className="mdc-button__icon">create</div>
            </button>
        );
    }
}

class OpenDocumentButton extends React.Component {
    readonly documentPath: string;
    readonly dataTable: MainDataTable;

    constructor(props: any) {
        super(props);
        this.documentPath = props.documentPath;
        this.dataTable = props.dataTable;

        this.openDocument = this.openDocument.bind(this);
    }

    async openDocument(): Promise<void> {
        util.openFileUsingDefaultProgram(this.dataTable.databaseManager.databaseInfo.sourcePath + '/' + this.documentPath);
    }

    render(): JSX.Element {
        return (
            <button className="mdc-icon-button material-icons" onClick={this.openDocument}>
                <div className="mdc-button__icon">open_in_new</div>
            </button>
        );
    }
}

class Tooltip extends React.Component {
    readonly id: string;
    readonly title: string;

    constructor(props: any) {
        super(props);
        this.id = props.id;
        this.title = props.title;
    }

    render(): React.ReactNode {
        return (
            <div id={this.id} className="mdc-tooltip" role="tooltip" aria-hidden="true">
                <div className="mdc-tooltip__surface">
                    {this.title}
                </div>
            </div>
        );
    }

    componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        MDCTooltip.attachTo($this);
    }
}

class TableCellOkErrorIcon extends React.Component {
    readonly ok: boolean;

    constructor(props: any) {
        super(props);
        this.ok = props.ok;
    }

    render(): React.ReactNode {
        const style: React.CSSProperties = {
            color: this.ok ? "green" : "red"
        };

        const tooltip_id: string = getId();

        return (
            <td className="mdc-data-table__cell" style={style}>
                <span className="material-icons" aria-describedby={tooltip_id}>
                    {this.ok ? "check_circle" : "error"}
                </span>
                {
                    React.createElement(Tooltip, {
                        id: tooltip_id,
                        title: this.ok ? "The file exists" : "The file does not exist"
                    }, null)
                }
            </td>
        );
    }
}

export class DataTableDocumentElement extends DataTableElement {
    readonly document: database.Document;
    readonly parent: MainDataTable;

    constructor(props: any) {
        super(props);
        this.document = props.document;
        this.parent = props.parent;
    }

    render(): JSX.Element {
        const tooltipId: string = getId();

        return (
            <tr className="mdc-data-table__row" key={this.document.absolutePath}>
                <th className="mdc-data-table__cell" scope="row">{this.document.filename}</th>
                {
                    React.createElement(TableCellOkErrorIcon, {
                        ok: this.document.exists
                    }, null)
                }
                <td className="mdc-data-table__cell">
                    <div className="material-icons" aria-describedby={tooltipId}>
                        insert_drive_file
                    </div>
                    {
                        React.createElement(Tooltip, {
                            id: tooltipId,
                            title: "File"
                        }, null)
                    }
                </td>
                <td className="mdc-data-table__cell">
                    {
                        React.createElement(EditDocumentButton, {
                            document: this.document,
                            dataTable: this.parent
                        }, null)
                    }
                </td>
                <td className="mdc-data-table__cell">
                    {
                        React.createElement(OpenDocumentButton, {
                            documentPath: this.document.absolutePath,
                            dataTable: this.parent
                        }, null)
                    }
                </td>
            </tr>
        );
    }
}

class OpenDirectoryButton extends React.Component {
    readonly dirPath: string;
    readonly dataTable: MainDataTable;

    constructor(props: any) {
        super(props);
        this.dirPath = props.dirPath
        this.dataTable = props.dataTable;

        this.onDirectoryOpen = this.onDirectoryOpen.bind(this);
    }

    async onDirectoryOpen(): Promise<void> {
        await this.dataTable.setDirectory(this.dirPath);
    }

    render(): JSX.Element {
        return (
            <button className="mdc-icon-button material-icons" onClick={this.onDirectoryOpen}>
                <div className="mdc-button__icon">
                    keyboard_arrow_right
                </div>
            </button>
        );
    }
}

export class DataTableDirectoryElement extends DataTableElement {
    readonly directory: database.DirectoryImpl;
    readonly parent: MainDataTable;

    constructor(props: any) {
        super(props);
        this.directory = props.directory;
        this.parent = props.parent;
    }

    render(): JSX.Element {
        const tooltipId: string = getId();

        return (
            <tr className="mdc-data-table__row">
                <th className="mdc-data-table__cell" scope="row">{this.directory.name}</th>
                {
                    React.createElement(TableCellOkErrorIcon, {
                        ok: this.directory.exists
                    }, null)
                }
                <td className="mdc-data-table__cell">
                    <div className="material-icons" aria-describedby={tooltipId}>
                        folder
                    </div>
                    {
                        React.createElement(Tooltip, {
                            id: tooltipId,
                            title: "Folder"
                        }, null)
                    }
                </td>
                <td className="mdc-data-table__cell"/>
                <td className="mdc-data-table__cell">
                    {
                        React.createElement(OpenDirectoryButton, {
                            dirPath: this.directory.path,
                            dataTable: this.parent
                        }, null)
                    }
                </td>
            </tr>
        );
    }
}