import React from "react";
import util from "../util/util";

util.importCss("styles/elements/Checkmark.css");

export default class Checkmark extends React.Component {
    private element: SVGSVGElement = null

    public animate(): void {
        if (!this.element.classList.contains("animate")) {
            this.element.classList.add("animate");
        }
    }

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