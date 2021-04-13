// This file contains the world's finest loading screens
import React from "react";
import {ProgressBar} from "./MDCWrapper";
import MDCCSSProperties from "../util/MDCCSSProperties";

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
        this.setState({
            visible: val
        });
    }

    public render(): React.ReactNode {
        const backgroundStyle: React.CSSProperties = {
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            backgroundColor: '#2d2d2d6e',
            top: '0',
            left: '0',
            display: this.state.visible ? 'block' : 'none',
            zIndex: 999
        };

        const style: MDCCSSProperties = {
            position: 'absolute',
            backgroundColor: 'white',
            width: '400px',
            height: '150px',
            top: '50%',
            left: '50%',
            marginTop: '-75px',
            marginLeft: '-200px',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
            "--mdc-theme-primary": 'blue'
        };

        const headingStyle: React.CSSProperties = {
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 400,
            width: 'max-content',
            marginLeft: 'auto',
            marginRight: 'auto',
            color: '#2b2b2b',
        };

        const textStyle: React.CSSProperties = {
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 300,
            color: '#2b2b2b',
            marginLeft: '30px',
            marginRight: '30px'
        }

        return (
            <div style={backgroundStyle}>
                <div style={style}>
                    <ProgressBar/>
                    <h1 style={headingStyle}>Scanning...</h1>
                    <p style={textStyle}>
                        We are now scanning through your file system. This may take a while.
                    </p>
                </div>
            </div>
        );
    }
}