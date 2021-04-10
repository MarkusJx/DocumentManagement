import React from "react";
import ReactDOM from "react-dom";
import {Snackbar} from "../elements/MDCWrapper";

/**
 * A class for storing snackbars
 */
export default class Snackbars {
    /**
     * The settings snackbar
     */
    public static settingsSnackbar: Snackbar = null;
}

// Generate all snackbars
window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <div>
            <Snackbar closeButtonText={"ok"} ref={e => Snackbars.settingsSnackbar = e}/>
        </div>,
        document.getElementById('snackbars-container')
    );
});