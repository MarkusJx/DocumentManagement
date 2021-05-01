import React from "react";
import ReactDOM from "react-dom";
import {MDCFab} from "./MDCWrapper";
import {getLogger} from "log4js";
import EmptyProps from "../util/EmptyProps";
import MultiFileEditor from "../dialogs/MultiFileEditor";
import constants from "../util/constants";

const logger = getLogger();

let instance: BulkEditFabElement = null;

export default class BulkEditFab {
    public static show(): void {
        instance.show();
    }

    public static hide(): void {
        instance.hide();
    }
}

class BulkEditFabElement extends React.Component<EmptyProps> {
    private element: HTMLElement = null;
    private visible: boolean = false;

    private static onClick(): void {
        const rows = constants.mainDataTable.getSelectedRows();
        if (rows != null) {
            MultiFileEditor.open(rows);
        }
    }

    public show(): void {
        if (!this.visible) {
            this.element.classList.remove("hidden");
            this.element.classList.add("visible");
            this.visible = true;
        }
    }

    public hide(): void {
        if (this.visible) {
            this.element.classList.remove("visible");
            this.element.classList.add("hidden");
            this.visible = false;
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="bulk-edit-button" ref={e => this.element = e}>
                <MDCFab icon="edit" onClick={BulkEditFabElement.onClick}/>
            </div>
        );
    }
}

window.addEventListener('DOMContentLoaded', () => {
    try {
        ReactDOM.render(
            <BulkEditFabElement ref={e => instance = e}/>,
            document.getElementById('bulk-edit-fab-container')
        );
    } catch (e) {
        logger.error("Could not render the bulk edit element", e);
    }
});