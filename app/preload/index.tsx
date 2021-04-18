import React from "react";
import ReactDOM from "react-dom";
import MainComponent from "./pages/MainComponent";
import {ScanLoadingScreen} from "./elements/LoadingScreens";
import constants from "./util/constants";
import CloseListener from "./util/CloseListener";
import TitleBar from "./util/TitleBar";
import log4js from "log4js";
import util from "./util/util";

log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%f{2}:%l] [%p] %m'
            }
        },
        app: {
            type: 'file',
            filename: 'preload.log',
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%f{2}:%l] [%p] %m'
            },
            maxLogSize: 50000000
        }
    },
    categories: {
        default: {
            appenders: ['out', 'app'],
            level: 'info',
            enableCallStack: true
        }
    }
});

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
        )
    }
}

window.addEventListener('DOMContentLoaded', () => {
    logger.info("Start loading");
    try {
        Main.main();
        TitleBar.create();
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
