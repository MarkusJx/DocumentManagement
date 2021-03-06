import React from "react";

import {database} from "../databaseWrapper";

abstract class DataTableElement extends React.Component {
    /*componentDidMount(): void {
        const $this: Element = ReactDOM.findDOMNode(this) as Element;
        const buttons = $this.getElementsByClassName('mdc-icon-button');
        for (let i = 0; i < buttons.length; i++) {
            MDCRipple.attachTo(buttons[i]);
        }
    }*/
}

export class DataTableDocumentElement extends DataTableElement {
    readonly document: database.Document;

    constructor(props: any) {
        super(props);
        this.document = props.document;
    }

    render(): JSX.Element {
        return (
            <tr className="mdc-data-table__row" key={this.document.absolutePath}>
                <th className="mdc-data-table__cell" scope="row">{this.document.filename}</th>
                <td className="mdc-data-table__cell">Ok</td>
                <td className="mdc-data-table__cell">
                    <div className="material-icons">insert_drive_file</div>
                </td>
                <td className="mdc-data-table__cell">
                    <button className="mdc-icon-button material-icons">
                        <div className="mdc-button__icon">create</div>
                    </button>
                </td>
                <td className="mdc-data-table__cell">
                    <button className="mdc-icon-button material-icons">
                        <div className="mdc-button__icon">open_in_new</div>
                    </button>
                </td>
            </tr>
        );
    }
}

export class DataTableDirectoryElement extends DataTableElement {
    readonly directory: database.Directory;

    constructor(props: any) {
        super(props);
        this.directory = props.directory;
    }

    render(): JSX.Element {
        return (
            <tr className="mdc-data-table__row" key={this.directory.path}>
                <th className="mdc-data-table__cell" scope="row">{this.directory.name}</th>
                <td className="mdc-data-table__cell">Ok</td>
                <td className="mdc-data-table__cell">
                    <div className="material-icons">folder</div>
                </td>
                <td className="mdc-data-table__cell"/>
                <td className="mdc-data-table__cell">
                    <button className="mdc-icon-button material-icons">
                        <div className="mdc-button__icon">keyboard_arrow_right</div>
                    </button>
                </td>
            </tr>
        );
    }
}