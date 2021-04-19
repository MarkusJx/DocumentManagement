import React from "react";
import * as ReactDOM from "react-dom";

import util from "../../util/util";
import constants from "../../util/constants";
import {database} from "../../databaseWrapper";
import {MDCTooltip} from "@material/tooltip";
import {getLogger} from "log4js";
import {showErrorDialog} from "../../dialogs/ErrorDialog";
import FileEditor from "../../dialogs/FileEditor";

const logger = getLogger();

/**
 * Get an id
 *
 * @return the id
 */
function getId(): string {
    return 'tooltip-' + util.generateUid();
}

/**
 * A data table element
 */
export abstract class DataTableElement<T> extends React.Component<T> {
    /**
     * Set whether the buttons should be enabled
     *
     * @param enabled whether the buttons should be enabled
     */
    public abstract set enabled(enabled: boolean);

    /**
     * Check if the file or directory exists
     *
     * @return true if the file or directory exists
     */
    public abstract exists(): boolean;

    public abstract render(): React.ReactNode;
}

/**
 * A data table button
 */
export abstract class DataTableButton<T> extends React.Component<T> {
    /**
     * Set whether the button should be enabled
     *
     * @param enabled whether the button should be enabled
     */
    public abstract set enabled(enabled: boolean);
}

/**
 * Te document edit button properties
 */
type EditDocumentButtonProps = {
    // The document to edit
    document: database.Document
}

export class EditDocumentButton extends DataTableButton<EditDocumentButtonProps> {
    /**
     * The document to edit on click
     * @private
     */
    private readonly document: database.Document;

    private button: HTMLButtonElement = null;

    /**
     * Create an document edit button
     *
     * @param props the properties
     */
    public constructor(props: EditDocumentButtonProps) {
        super(props);
        this.document = props.document;

        this.onEditButtonClick = this.onEditButtonClick.bind(this);
    }

    public set enabled(enabled: boolean) {
        if (this.button) {
            this.button.disabled = !enabled;
        }
    }

    public render(): JSX.Element {
        return (
            <button className="mdc-icon-button material-icons main-data-table__action-button"
                    onClick={this.onEditButtonClick} ref={e => this.button = e}>
                <div className="mdc-button__icon">create</div>
            </button>
        );
    }

    /**
     * The function to be called on edit button click
     * @private
     */
    private onEditButtonClick(): void {
        try {
            FileEditor.open(this.document);
        } catch (e) {
            logger.error("An error occurred while trying to open the file editor:", e);
            showErrorDialog("Could not open the file editor", e.message);
        }
    }
}

/**
 * The open document button properties
 */
type OpenDocumentButtonProps = {
    // The path to the document to open on click
    documentPath: string
};

/**
 * A button for opening a document
 */
class OpenDocumentButton extends DataTableButton<OpenDocumentButtonProps> {
    /**
     * The path of the document to open on click
     * @private
     */
    private readonly documentPath: string;

    /**
     * The button element
     * @private
     */
    private button: HTMLButtonElement;

    /**
     * Create a open document button
     *
     * @param props the properties
     */
    public constructor(props: OpenDocumentButtonProps) {
        super(props);
        this.documentPath = props.documentPath;
        this.button = null;

        this.openDocument = this.openDocument.bind(this);
    }

    public set enabled(enabled: boolean) {
        if (this.button) {
            if (enabled) {
                this.button.disabled = this.documentPath == null;
            } else {
                this.button.disabled = true;
            }
        }
    }

    public render(): JSX.Element {
        return (
            <button className="mdc-icon-button material-icons main-data-table__action-button"
                    onClick={this.openDocument} disabled={this.documentPath == null} ref={e => this.button = e}>
                <div className="mdc-button__icon">open_in_new</div>
            </button>
        );
    }

    /**
     * Open the document
     * @private
     */
    private async openDocument(): Promise<void> {
        try {
            if (this.documentPath) {
                util.openFileUsingDefaultProgram(constants.databaseManager.getSourcePath()
                    + '/' + this.documentPath);
            }
        } catch (e) {
            logger.error("An error occurred while opening a document:", e);
            showErrorDialog("An error occurred while opening a document:", e.message);
        }
    }
}

/**
 * The tooltip properties
 */
type TooltipProps = {
    // The tooltip id
    id: string,
    // The tooltip title
    title: string
};

class Tooltip extends React.Component<TooltipProps> {
    /**
     * The tooltip id
     * @private
     */
    private readonly id: string;

    /**
     * The tooltip title
     * @private
     */
    private readonly title: string;

    /**
     * Create a tooltip
     *
     * @param props the properties
     */
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

/**
 * The table cell ok error icon properties
 */
type TableCellOkErrorIconProps = {
    // Whether to display the error or ok icon
    ok: boolean
}

/**
 * An icon displaying an error or ok icon
 */
class TableCellOkErrorIcon extends React.Component<TableCellOkErrorIconProps> {
    /**
     * Whether to display the error or ok icon
     * @private
     */
    private readonly ok: boolean;

    /**
     * Create a TableCellOkErrorIcon
     *
     * @param props the properties
     */
    public constructor(props: TableCellOkErrorIconProps) {
        super(props);
        this.ok = props.ok;
    }

    public render(): React.ReactNode {
        const iconClass: string = "material-icons " +
            (this.ok ? "data-table-element__ok-icon" : "data-table-element__error-icon");
        const tooltipId: string = getId();

        return (
            <td className="mdc-data-table__cell">
                <span className={iconClass} aria-describedby={tooltipId}>
                    {this.ok ? "check_circle" : "error"}
                </span>
                <Tooltip id={tooltipId} title={this.ok ? "The file exists" : "The file does not exist"}/>
            </td>
        );
    }
}

/**
 * The data table document element properties
 */
export type DataTableDocumentElementProps = {
    // The document to show
    document: database.Document
}

/**
 * A data table document element
 */
export class DataTableDocumentElement extends DataTableElement<DataTableDocumentElementProps> {
    /**
     * The open document button
     */
    public openButton: OpenDocumentButton = null;

    /**
     * The edit document button
     */
    public editButton: EditDocumentButton = null;

    /**
     * The document to show
     * @private
     */
    private readonly document: database.Document;

    /**
     * Create a data table document element
     *
     * @param props the properties
     */
    public constructor(props: DataTableDocumentElementProps) {
        super(props);
        this.document = props.document;
    }

    public set enabled(enabled: boolean) {
        this.editButton.enabled = enabled;
        this.openButton.enabled = enabled;
    }

    public exists(): boolean {
        return this.document.exists;
    }

    public render(): JSX.Element {
        const tooltipId: string = getId();

        return (
            <tr className="mdc-data-table__row" key={this.document.absolutePath}>
                <th className="mdc-data-table__cell" scope="row">{this.document.filename}</th>
                <TableCellOkErrorIcon ok={this.document.exists}/>
                <td className="mdc-data-table__cell">
                    <div className="material-icons data-table-element__document-icon" aria-describedby={tooltipId}>
                        insert_drive_file
                    </div>
                    <Tooltip id={tooltipId} title={"File"}/>
                </td>
                <td className="mdc-data-table__cell">
                    <EditDocumentButton document={this.document} ref={e => this.editButton = e}/>
                </td>
                <td className="mdc-data-table__cell">
                    <OpenDocumentButton documentPath={this.document.exists ? this.document.absolutePath : null}
                                        ref={e => this.openButton = e}/>
                </td>
            </tr>
        );
    }
}

/**
 * The open directory button properties
 */
type OpenDirectoryButtonProps = {
    // The directory path
    dirPath: string
};

/**
 * An open directory button
 */
class OpenDirectoryButton extends DataTableButton<OpenDirectoryButtonProps> {
    /**
     * The directory path
     * @private
     */
    private readonly dirPath: string;

    /**
     * The button element
     * @private
     */
    private button: HTMLButtonElement;

    /**
     * Create an open directory button
     *
     * @param props the properties
     */
    public constructor(props: OpenDirectoryButtonProps) {
        super(props);
        this.dirPath = props.dirPath
        this.button = null;

        this.onDirectoryOpen = this.onDirectoryOpen.bind(this);
    }

    public set enabled(enabled: boolean) {
        if (this.button) {
            if (enabled) {
                this.button.disabled = this.dirPath == null;
            } else {
                this.button.disabled = true;
            }
        }
    }

    public render(): JSX.Element {
        return (
            <button className="mdc-icon-button material-icons main-data-table__action-button"
                    onClick={this.onDirectoryOpen} disabled={this.dirPath == null} ref={e => this.button = e}>
                <div className="mdc-button__icon">
                    keyboard_arrow_right
                </div>
            </button>
        );
    }

    /**
     * The function to be called to open the directory
     * @private
     */
    private async onDirectoryOpen(): Promise<void> {
        try {
            if (this.dirPath != null) {
                await constants.mainDataTable.setDirectory(this.dirPath);
            }
        } catch (e) {
            logger.error("An error occurred while opening a directory:", e);
            showErrorDialog("An error occurred while opening a directory:", e.message);
            constants.mainComponent.gotoStartPage();
        }
    }
}

/**
 * The data table directory element properties
 */
export type DataTableDirectoryElementProps = {
    // The directory to display
    directory: database.DirectoryProxy
};

/**
 * A data table directory element
 */
export class DataTableDirectoryElement extends DataTableElement<DataTableDirectoryElementProps> {
    /**
     * The open directory button
     */
    public button: OpenDirectoryButton = null;

    /**
     * The directory to display
     * @private
     */
    private readonly directory: database.DirectoryProxy;

    /**
     * Create a data table directory element
     *
     * @param props the properties
     */
    public constructor(props: DataTableDirectoryElementProps) {
        super(props);
        this.directory = props.directory;
    }

    public exists(): boolean {
        return this.directory.exists;
    }

    public set enabled(enabled: boolean) {
        this.button.enabled = enabled;
    }

    public render(): JSX.Element {
        const tooltipId: string = getId();

        return (
            <tr className="mdc-data-table__row">
                <th className="mdc-data-table__cell" scope="row">{this.directory.name}</th>
                <TableCellOkErrorIcon ok={this.directory.exists}/>
                <td className="mdc-data-table__cell">
                    <div className="material-icons data-table-element__folder-icon" aria-describedby={tooltipId}>
                        folder
                    </div>
                    <Tooltip id={tooltipId} title={"Folder"}/>
                </td>
                <td className="mdc-data-table__cell"/>
                <td className="mdc-data-table__cell">
                    <OpenDirectoryButton dirPath={this.directory.exists ? this.directory.path : null}
                                         ref={e => this.button = e}/>
                </td>
            </tr>
        );
    }
}

/**
 * The directory up element properties
 */
export type DirectoryUpElementProps = {
    // The current directory
    currentDirectory: database.Directory
};

/**
 * An element to move one directory level up
 */
export class DirectoryUpElement extends React.Component<DirectoryUpElementProps> {
    /**
     * The path to the directory one level above the current one
     * @private
     */
    private readonly upPath: string;

    /**
     * Create a directory up element
     *
     * @param props the properties
     */
    public constructor(props: DirectoryUpElementProps) {
        super(props);

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
                    <OpenDirectoryButton dirPath={this.upPath}/>
                </td>
            </tr>
        );
    }
}