import React from "react";
import ReactDOM from "react-dom";
import {Snackbar} from "../elements/MDCWrapper";
import {getLogger} from "log4js";

const logger = getLogger();

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
    logger.info("Rendering snackbars");
    try {
        ReactDOM.render(
            <div>
                <Snackbar closeButtonText={"ok"} ref={e => Snackbars.settingsSnackbar = e}/>
            </div>,
            document.getElementById('snackbars-container')
        );
    } catch (e) {
        logger.error("An error occurred while rendering snackbars:", e);
    }
});