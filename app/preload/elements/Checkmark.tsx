import React from "react";
import util from "../util/util";

util.importCss("styles/elements/Checkmark.css");

/**
 * An animated checkmark.
 * Source: https://jsfiddle.net/Hybrid8287/gtb1avet/1/
 */
export default class Checkmark extends React.Component {
    /**
     * The html element
     * @private
     */
    private element: SVGSVGElement = null

    /**
     * Run the checkmark animation
     */
    public animate(): void {
        if (!this.element.classList.contains("animate")) {
            this.element.classList.add("animate");
        }
    }

    /**
     * Reset the animation state
     */
    public reset(): void {
        this.element.classList.remove("animate");
    }

    public render(): React.ReactNode {
        return (
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"
                 ref={e => this.element = e}>
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
        );
    }
}