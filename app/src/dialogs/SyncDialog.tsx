import React from "react";
import ReactDOM from "react-dom";
import {Button, ProgressBar} from "../elements/MDCWrapper";
import util from "../util/util";
import {database} from "../databaseWrapper";

util.importCss("styles/dialogs/SyncDialog.css");

let instance: SyncDialogElement = null;

export default class SyncDialog {
    public static async open(databaseManager: database.DatabaseManager): Promise<void> {
        instance.show(databaseManager);
    }
}

interface SyncDialogElementState {
    title: string;
    continueButtonText: string;
}

class SyncDialogElement extends React.Component<{}, SyncDialogElementState> {
    private progressBar: ProgressBar = null;
    private visible: boolean = false;
    private element: HTMLElement = null;
    private databaseManager: database.DatabaseManager = null;

    public constructor(props: {}) {
        super(props);

        this.state = {
            title: "Sync",
            continueButtonText: "Next"
        };

        this.onContinue = this.onContinue.bind(this);
        this.onCancel = this.onCancel.bind(this);
    }

    public render(): React.ReactNode {
        // TODO
        return (
            <div className="sync-dialog-background" ref={e => this.element = e}>
                <div className="sync-dialog-dialog">
                    <div className="sync-dialog-dialog-top-bar">
                        <ProgressBar ref={e => this.progressBar = e}/>
                        <h1>{this.state.title}</h1>
                    </div>

                    <div className="sync-dialog-actions">
                        <Button text={"Cancel"} onClick={this.onCancel}/>
                        <Button text={this.state.continueButtonText} onClick={this.onContinue}/>
                    </div>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.progressBar.element.determinate = true;
        this.progressBar.element.progress = 0;
    }

    public show(databaseManager: database.DatabaseManager): void {
        this.databaseManager = databaseManager;
        if (!this.visible) {
            this.visible = true;
            this.element.classList.add("visible");
            this.element.classList.remove("hidden");
        }
    }

    public hide(): void {
        if (this.visible) {
            this.visible = false;
            this.element.classList.remove("visible");
            this.element.classList.add("hidden");
        }
    }

    private onContinue(): void {

    }

    private onCancel(): void {
        this.hide();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <SyncDialogElement ref={e => instance = e}/>,
        document.getElementById('sync-dialog-container'),
    );
});
