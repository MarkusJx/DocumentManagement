import React from "react";
import ReactDOM from "react-dom";
import {Dialog} from "../elements/MDCWrapper";

/**
 * The static error dialog
 */
let errorDialog: ErrorDialog = null;

/**
 * The error dialog state
 */
interface ErrorDialogState {
    // The error text
    text: string;
    // The exception message
    error: string;
}

/**
 * An error dialog
 */
class ErrorDialog extends React.Component<{}, ErrorDialogState> {
    /**
     * The dialog
     * @private
     */
    private dialog: Dialog;

    /**
     * Create an error dialog
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.dialog = null;
        this.state = {
            text: null,
            error: null
        };
    }

    /**
     * Open the dialog
     *
     * @param text the error info text
     * @param error the exception message
     */
    public open(text: string, error: string): void {
        this.setState({
            text: text,
            error: error
        });

        this.dialog.open();
    }

    public render() {
        const contentStyle: React.CSSProperties = {
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 300
        };

        const surfaceStyle: React.CSSProperties = {
            maxWidth: 'max(80vw, 560px)'
        };

        return (
            <Dialog titleId={"error-dialog-title"} contentId={"error-dialog-content"} title={"An error occurred"}
                    ref={e => this.dialog = e} hasCancelButton={false} contentStyle={contentStyle}
                    surfaceStyle={surfaceStyle} className="error-dialog__dialog">
                <p className="error-dialog__text">
                    {this.state.text}
                </p>
                {
                    this.state.error ? (
                        <div className="error-dialog__error-container">
                            {this.state.error}
                        </div>
                    ) : null
                }
            </Dialog>
        );
    }
}

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <ErrorDialog ref={e => errorDialog = e}/>,
        document.getElementById('error-dialog-container')
    );
});

/**
 * Show an error dialog
 *
 * @param text the error info text
 * @param error the error caught
 */
export function showErrorDialog(text: string, error: string = null): void {
    if (errorDialog) {
        errorDialog.open(text, error);
    }
}