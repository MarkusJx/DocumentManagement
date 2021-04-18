// This file contains the world's finest loading screens
import React from "react";
import {ProgressBar} from "./MDCWrapper";

/**
 * The scan loading screen state
 */
interface ScanLoadingScreenState {
    // Whether the loading screen is visible
    visible: boolean;
}

/**
 * The scan loading screen
 */
export class ScanLoadingScreen extends React.Component<{}, ScanLoadingScreenState> {
    private element: HTMLElement = null;

    /**
     * Create the scan loading screen
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.state = {
            visible: false
        };
    }

    /**
     * Set the visible of the loading screen
     *
     * @param val whether the loading screen should be visible
     */
    public set visible(val: boolean) {
        if (val) {
            this.element.classList.add("visible");
        } else {
            this.element.classList.remove("visible");
        }
    }

    public render(): React.ReactNode {
        return (
            <div ref={e => this.element = e} className="scan-loading-screen__background">
                <div className="scan-loading-screen__dialog">
                    <ProgressBar/>
                    <h1 className="scan-loading-screen__heading">Scanning...</h1>
                    <p className="scan-loading-screen__text">
                        We are now scanning through your file system. This may take a while.
                    </p>
                </div>
            </div>
        );
    }
}