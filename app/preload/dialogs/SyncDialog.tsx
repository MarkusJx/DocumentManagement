import React from "react";
import ReactDOM from "react-dom";
import {Button, OutlinedButton, ProgressBar} from "../elements/MDCWrapper";
import util from "../util/util";
import {database} from "../databaseWrapper";
import {ipcRenderer} from "electron";

util.importCss("styles/dialogs/SyncDialog.css");

let instance: SyncDialogElement = null;

export default class SyncDialog {
    public static async open(databaseManager: database.DatabaseManager): Promise<void> {
        instance.show(databaseManager);
    }
}

interface SyncDialogTitleProps {
    title: string;
}

interface SyncDialogTitleState {
    title: string;
}

class SyncDialogTitle extends React.Component<SyncDialogTitleProps, SyncDialogTitleState> {
    public constructor(props: SyncDialogTitleProps) {
        super(props);

        this.state = {
            title: props.title
        };
    }

    public set title(title: string) {
        this.setState({
            title: title
        });
    }

    public render(): React.ReactNode {
        return (
            <h1 className="sync-dialog__title">
                {this.state.title}
            </h1>
        );
    }
}

interface SyncDialogPathState {
    path: string;
}

class SyncDialogPath extends React.Component<{}, SyncDialogPathState> {
    public constructor(props: {}) {
        super(props);

        this.state = {
            path: null
        };
    }

    public get path(): string {
        return this.state.path;
    }

    public set path(path: string) {
        this.setState({
            path: path
        });
    }

    public render(): React.ReactNode {
        return (
            <span className="start-scan-path">
                {this.state.path == null ? "none" : this.state.path}
            </span>
        );
    }
}

class SyncDialogElement extends React.Component {
    private static readonly titles: string[] = ["Synchronize", "Set directory", "Start"];
    private progressBar: ProgressBar = null;
    private visible: boolean = false;
    private element: HTMLElement = null;
    private databaseManager: database.DatabaseManager = null;
    private currentPage: number = 0;
    private continueButton: Button = null;
    private contentPages: HTMLElement[] = [];
    private title: SyncDialogTitle = null;
    private selectDirectoryButton: OutlinedButton = null;
    private selectedPath: SyncDialogPath = null;

    public constructor(props: {}) {
        super(props);

        this.onContinue = this.onContinue.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.selectDirectory = this.selectDirectory.bind(this);
    }

    private set continueButtonText(text: string) {
        this.continueButton.title = text;
    }

    public render(): React.ReactNode {
        this.contentPages = [];
        // TODO
        return (
            <div className="sync-dialog__background" ref={e => this.element = e}>
                <div className="sync-dialog__dialog">
                    <div className="sync-dialog__dialog-top-bar">
                        <ProgressBar ref={e => this.progressBar = e} style={{"--mdc-theme-primary": '#00d8b4'}}/>
                        <SyncDialogTitle title={SyncDialogElement.titles[0]} ref={e => this.title = e}/>
                    </div>

                    <div className="sync-dialog__content">
                        <div className="sync-dialog__swipe-element start-page" ref={e => this.contentPages.push(e)}>
                            <p>Synchronize the database with your file system</p>
                            <ul>
                                <li>This will re-scan through your file system searching for documents</li>
                                <li>
                                    Documents that were deleted from your file system will be removed from the database
                                </li>
                                <li>Documents that were added will be added to the database</li>
                            </ul>
                        </div>

                        <div className="sync-dialog__swipe-element" ref={e => this.contentPages.push(e)}>
                            <p>
                                Select a directory to synchronize with.<br/>
                                This should be the same directory you selected when the database was created.
                            </p>

                            <p className="centered">
                                <span className="after-space">
                                    Selected directory:
                                </span>
                                <SyncDialogPath ref={e => this.selectedPath = e}/>
                            </p>

                            <OutlinedButton text={"Select directory"} onClick={this.selectDirectory}
                                            ref={e => this.selectDirectoryButton = e}/>
                        </div>
                    </div>

                    <div className="sync-dialog__actions">
                        <Button text="Cancel" onClick={this.onCancel}/>
                        <Button text="Next" onClick={this.onContinue}
                                ref={e => this.continueButton = e}/>
                    </div>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.progressBar.progressBar.determinate = true;
        this.progressBar.progressBar.progress = 0;
    }

    public show(databaseManager: database.DatabaseManager): void {
        this.databaseManager = databaseManager;
        this.contentPages.forEach(e => e.classList.remove("centered", "left"));
        this.contentPages[0].classList.add("start-page");
        this.currentPage = 0;
        this.progressBar.progressBar.progress = 0;
        this.continueButtonText = "Next";

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
            setTimeout(() => {
                this.element.classList.remove("hidden");
            }, 125);
        }
    }

    private async selectDirectory(): Promise<void> {
        this.selectDirectoryButton.enabled = false;
        this.continueButton.enabled = false;
        this.selectedPath.path = await ipcRenderer.invoke('select-directory', "Select a directory to scan");

        this.selectDirectoryButton.enabled = true;
        this.continueButton.enabled = this.selectedPath != null;
    }

    private onContinue(): void {
        if ((this.currentPage + 1) < this.contentPages.length) {
            this.contentPages[this.currentPage].classList.add("left");
            this.contentPages[this.currentPage].classList.remove("centered", "start-page");
            this.currentPage++;
            this.contentPages[this.currentPage].classList.add("centered");
            this.title.title = SyncDialogElement.titles[this.currentPage];
        }

        if (this.currentPage == (this.contentPages.length - 1)) {
            this.continueButtonText = "Start";
        }

        this.progressBar.progressBar.progress = this.currentPage / (this.contentPages.length - 1);
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
