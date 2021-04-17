import React from "react";
import ReactDOM from "react-dom";
import Checkmark from "../elements/Checkmark";
import util from "../util/util";

util.importCss("styles/dialogs/DoneDialog.css");

/**
 * A static done dialog instance
 */
let instance: DoneDialogElement = null;

/**
 * The done dialog
 */
export default class DoneDialog {
    /**
     * Show the done dialog
     *
     * @param text the dialog text
     */
    public static show(text: string): void {
        instance.show(text);
    }

    /**
     * Hide the done dialog
     */
    public static hide(): void {
        instance.hide();
    }
}

/**
 * The done dialog state
 */
interface DoneDialogState {
    // The done dialog text
    text: string;
}

/**
 * The done dialog element.
 */
class DoneDialogElement extends React.Component<{}, DoneDialogState> {
    /**
     * The actual html element
     * @private
     */
    private element: HTMLElement = null;

    /**
     * The checkmark object
     * @private
     */
    private checkmark: Checkmark = null;

    /**
     * Whether the dialog is visible
     * @private
     */
    private visible: boolean = false;

    /**
     * Create a done dialog
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.state = {
            text: ""
        };
    }

    /**
     * Show the done dialog
     *
     * @param text the text of the dialog
     */
    public show(text: string): void {
        this.setState({
            text: text
        });

        if (!this.visible) {
            this.visible = true;
            this.element.classList.add("visible");
            this.element.classList.remove("hidden");

            setTimeout(() => {
                this.checkmark.animate();
            }, 250);
        }
    }

    /**
     * Hide the done dialog
     */
    public hide(): void {
        if (this.visible) {
            this.visible = false;
            this.element.classList.remove("visible");
            this.element.classList.add("hidden");
            setTimeout(() => {
                this.element.classList.remove("hidden");
                this.checkmark.reset();
            }, 125);
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="done-dialog__background" ref={e => this.element = e}>
                <div className="done-dialog__dialog">
                    <Checkmark ref={e => this.checkmark = e}/>
                    <h1 className="done-dialog__text">
                        {this.state.text}
                    </h1>
                </div>
            </div>
        );
    }
}

// Load the static dialog instance on dom load
window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <DoneDialogElement ref={e => instance = e}/>,
        document.getElementById('done-dialog-container')
    );
});