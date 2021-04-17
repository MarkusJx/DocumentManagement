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

    /**
     * The 'source directory not found' snackbar
     */
    public static sourceDirNotFoundSnackbar: Snackbar = null;

    /**
     * A generic snackbar
     */
    public static genericSnackbar: Snackbar = null;

    /**
     * The documents not found snackbar
     */
    public static docsNotFoundSnackbar: Snackbar = null;
}

// Generate all snackbars
window.addEventListener('DOMContentLoaded', () => {
    logger.info("Rendering snackbars");
    try {
        ReactDOM.render(
            <div>
                <Snackbar closeButtonText={"ok"} ref={e => Snackbars.settingsSnackbar = e}/>
                <Snackbar closeButtonText={"ok"} ref={e => Snackbars.sourceDirNotFoundSnackbar = e}/>
                <Snackbar closeButtonText={"ok"} ref={e => Snackbars.genericSnackbar = e}/>
                <Snackbar closeButtonText={"ok"} ref={e => Snackbars.docsNotFoundSnackbar = e}/>
            </div>,
            document.getElementById('snackbars-container')
        );
    } catch (e) {
        logger.error("An error occurred while rendering snackbars:", e);
    }
});