import React from "react";
import ReactDOM from "react-dom";
import MainComponent from "./pages/MainComponent";
import {ScanLoadingScreen} from "./elements/LoadingScreens";
import constants from "./util/constants";
import CloseListener from "./util/CloseListener";
import TitleBar from "./util/TitleBar";
import log4js from "log4js";
import util from "./util/util";
import Theming from "./settings/Theming";
import BackStack from "./util/BackStack";
import "core-js/stable";
import "regenerator-runtime/runtime";

const logger = log4js.getLogger();

/**
 * The main class
 */
class Main {
    /**
     * The main function
     */
    public static main(): void {
        ReactDOM.render(
            <MainComponent ref={e => constants.mainComponent = e}/>,
            document.getElementById('content-root')
        );

        ReactDOM.render(
            <ScanLoadingScreen ref={e => constants.scanLoadingScreen = e}/>,
            document.getElementById('loading-screen-container')
        );

        document.addEventListener('mouseup', (e: MouseEvent) => {
            if (e.button === 3) {
                // Back button pressed
                BackStack.goBack();
            } else if (e.button === 4) {
                // Forward button pressed
                BackStack.goForward();
            }
        })
    }
}

window.addEventListener('DOMContentLoaded', () => {
    util.updateLogging();
    logger.info("Start loading");
    try {
        Main.main();
        TitleBar.create();

        Theming.updateTheme();
    } catch (e) {
        logger.error("Error while loading the main elements:", e);
        util.showNativeErrorDialog("Error", "An error occurred while loading the main elements");
    }
});

CloseListener.listen(async () => {
    if (constants.databaseManager) {
        await constants.databaseManager.close();
    }
});
