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

abstract class DataTableElement<T> extends React.Component<T> {
}

type EditDocumentButtonProps = {
    document: database.Document,
    dataTable: MainDataTable
}

class EditDocumentButton extends React.Component<EditDocumentButtonProps> {
    private readonly document: database.Document;
    private readonly dataTable: MainDataTable;

    public constructor(props: EditDocumentButtonProps) {
        super(props);
        this.document = props.document;
        this.dataTable = props.dataTable;

        this.onEditButtonClick = this.onEditButtonClick.bind(this);
    }

    public render(): JSX.Element {
        return (
            <button className="mdc-icon-button material-icons" onClick={this.onEditButtonClick}>
                <div className="mdc-button__icon">create</div>
            </button>
        );
    }

    private onEditButtonClick(): void {
        constants.fileEditor.open(this.document);
    }
}

type OpenDocumentButtonProps = {
    documentPath: string,
    dataTable: MainDataTable
};

class OpenDocumentButton extends React.Component<OpenDocumentButtonProps> {
    private readonly documentPath: string;
    private readonly dataTable: MainDataTable;

    public constructor(props: OpenDocumentButtonProps) {
        super(props);
        this.documentPath = props.documentPath;
        this.dataTable = props.dataTable;

        this.openDocument = this.openDocument.bind(this);
    }

    public render(): JSX.Element {
        return (
            <button className="mdc-icon-button material-icons" onClick={this.openDocument}>
                <div className="mdc-button__icon">open_in_new</div>
            </button>
        );
    }

    private async openDocument(): Promise<void> {
        util.openFileUsingDefaultProgram(this.dataTable.databaseManager.databaseInfo.sourcePath + '/' + this.documentPath);
    }
}

type TooltipProps = {
    id: string,
    title: string
};

class Tooltip extends React.Component<TooltipProps> {
    private readonly id: string;
    private readonly title: string;

    public constructor(props: TooltipProps) {
        super(props);
        this.id = props.id;
        this.title = props.title;
    }

    public render(): React.ReactNode {
        return (
            <div id={this.id} className="mdc-tooltip" role="tooltip" aria-hidden="true">
                <div className="mdc-tooltip__surface">
                    {this.title}
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        MDCTooltip.attachTo($this);
    }
}

type TableCellOkErrorIconProps = {
    ok: boolean;
}

class TableCellOkErrorIcon extends React.Component<TableCellOkErrorIconProps> {
    private readonly ok: boolean;

    public constructor(props: TableCellOkErrorIconProps) {
        super(props);
        this.ok = props.ok;
    }

    public render(): React.ReactNode {
        const style: React.CSSProperties = {
            color: this.ok ? "green" : "red"
        };

        const tooltip_id: string = getId();

        return (
            <td className="mdc-data-table__cell" style={style}>
                <span className="material-icons" aria-describedby={tooltip_id}>
                    {this.ok ? "check_circle" : "error"}
                </span>
                <Tooltip id={tooltip_id} title={this.ok ? "The file exists" : "The file does not exist"}/>
            </td>
        );
    }
}

export type DataTableDocumentElementProps = {
    document: database.Document,
    parent: MainDataTable
}

export class DataTableDocumentElement extends DataTableElement<DataTableDocumentElementProps> {
    private readonly document: database.Document;
    private readonly parent: MainDataTable;

    public constructor(props: DataTableDocumentElementProps) {
        super(props);
        this.document = props.document;
        this.parent = props.parent;
    }

    public render(): JSX.Element {
        const tooltipId: string = getId();

        return (
            <tr className="mdc-data-table__row" key={this.document.absolutePath}>
                <th className="mdc-data-table__cell" scope="row">{this.document.filename}</th>
                <TableCellOkErrorIcon ok={this.document.exists}/>
                <td className="mdc-data-table__cell">
                    <div className="material-icons" aria-describedby={tooltipId}>
                        insert_drive_file
                    </div>
                    <Tooltip id={tooltipId} title={"File"}/>
                </td>
                <td className="mdc-data-table__cell">
                    <EditDocumentButton document={this.document} dataTable={this.parent}/>
                </td>
                <td className="mdc-data-table__cell">
                    <OpenDocumentButton documentPath={this.document.absolutePath} dataTable={this.parent}/>
                </td>
            </tr>
        );
    }
}

type OpenDirectoryButtonProps = {
    dirPath: string,
    dataTable: MainDataTable
};

class OpenDirectoryButton extends React.Component<OpenDirectoryButtonProps> {
    private readonly dirPath: string;
    private readonly dataTable: MainDataTable;

    public constructor(props: OpenDirectoryButtonProps) {
        super(props);
        this.dirPath = props.dirPath
        this.dataTable = props.dataTable;

        this.onDirectoryOpen = this.onDirectoryOpen.bind(this);
    }

    public async onDirectoryOpen(): Promise<void> {
        await this.dataTable.setDirectory(this.dirPath);
    }

    public render(): JSX.Element {
        return (
            <button className="mdc-icon-button material-icons" onClick={this.onDirectoryOpen}>
                <div className="mdc-button__icon">
                    keyboard_arrow_right
                </div>
            </button>
        );
    }
}

export type DataTableDirectoryElementProps = {
    directory: database.DirectoryImpl,
    parent: MainDataTable
};

export class DataTableDirectoryElement extends DataTableElement<DataTableDirectoryElementProps> {
    private readonly directory: database.DirectoryImpl;
    private readonly parent: MainDataTable;

    public constructor(props: DataTableDirectoryElementProps) {
        super(props);
        this.directory = props.directory;
        this.parent = props.parent;
    }

    public render(): JSX.Element {
        const tooltipId: string = getId();

        return (
            <tr className="mdc-data-table__row">
                <th className="mdc-data-table__cell" scope="row">{this.directory.name}</th>
                <TableCellOkErrorIcon ok={this.directory.exists}/>
                <td className="mdc-data-table__cell">
                    <div className="material-icons" aria-describedby={tooltipId}>
                        folder
                    </div>
                    <Tooltip id={tooltipId} title={"Folder"}/>
                </td>
                <td className="mdc-data-table__cell"/>
                <td className="mdc-data-table__cell">
                    <OpenDirectoryButton dirPath={this.directory.path} dataTable={this.parent}/>
                </td>
            </tr>
        );
    }
}

export type DirectoryUpElementProps = {
    parent: MainDataTable,
    currentDirectory: database.Directory
};

export class DirectoryUpElement extends React.Component<DirectoryUpElementProps> {
    private readonly parent: MainDataTable;
    private readonly upPath: string;

    public constructor(props: DirectoryUpElementProps) {
        super(props);

        this.parent = props.parent;
        const path = props.currentDirectory.path;
        this.upPath = path.substring(0, path.lastIndexOf('/'));
    }

    public render(): React.ReactNode {
        return (
            <tr className="mdc-data-table__row">
                <th className="mdc-data-table__cell" scope="row">Directory up</th>
                <td className="mdc-data-table__cell"/>
                <td className="mdc-data-table__cell"/>
                <td className="mdc-data-table__cell"/>
                <td className="mdc-data-table__cell">
                    <OpenDirectoryButton dirPath={this.upPath} dataTable={this.parent}/>
                </td>
            </tr>
        );
    }
}