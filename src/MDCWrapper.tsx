import React from "react";
import ReactDOM from "react-dom";
import {MDCCheckbox} from '@material/checkbox';
import {MDCRipple} from "@material/ripple";
import MDCCSSProperties from "./MDCCSSProperties";

/**
 * A checkbox
 */
export class Checkbox extends React.Component<{}> {
    /**
     * The next checkbox id
     * @private
     */
    private static nextId: number = 0;

    /**
     * The mdc checkbox
     * @private
     */
    private checkbox: MDCCheckbox;

    /**
     * Create a checkbox
     *
     * @param props the properties
     */
    public constructor(props: {}) {
        super(props);

        this.checkbox = null;
    }

    /**
     * Get whether the checkbox is checked
     *
     * @return true if the box is checked
     */
    public get checked(): boolean {
        return this.checkbox.checked;
    }

    /**
     * Set whether the checkbox should be checked
     *
     * @param checked true if the box should be checked
     */
    public set checked(checked: boolean) {
        this.checkbox.checked = checked;
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-checkbox">
                <input type="checkbox" className="mdc-checkbox__native-control" id={"checkbox-" + Checkbox.nextId++}/>
                <div className="mdc-checkbox__background">
                    <svg className="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                        <path className="mdc-checkbox__checkmark-path" fill="none"
                              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                    </svg>
                    <div className="mdc-checkbox__mixedmark"/>
                </div>
                <div className="mdc-checkbox__ripple"/>
            </div>
        );
    }

    public componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        this.checkbox = new MDCCheckbox($this);
    }
}

/**
 * Properties for a button
 */
export interface ButtonProps {
    // The button text
    text: string;
    // The on click listener
    onClick: () => void;
    // The button style
    style?: MDCCSSProperties;
}

/**
 * A material button
 */
export class Button<P extends ButtonProps = ButtonProps> extends React.Component<P> {
    /**
     * The button text
     * @protected
     */
    protected readonly text: string;

    /**
     * The on click listener
     * @protected
     */
    protected readonly onClick: () => void;

    /**
     * Create a button
     *
     * @param props the properties
     */
    public constructor(props: P) {
        super(props);

        this.text = props.text;
        this.onClick = props.onClick.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <button className="mdc-button" onClick={this.onClick} style={this.props.style}>
                <span className="mdc-button__ripple"/>
                <span className="mdc-button__label">
                    {this.text}
                </span>
            </button>
        );
    }

    public componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        MDCRipple.attachTo($this);
    }
}

/**
 * A outlined button
 */
export class OutlinedButton extends Button {
    /**
     * Create an outline button
     *
     * @param props the properties
     */
    public constructor(props: ButtonProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <button className="mdc-button mdc-button--outlined" onClick={this.onClick} style={this.props.style}>
                <span className="mdc-button__ripple"/>
                <span className="mdc-button__label">
                    {this.text}
                </span>
            </button>
        );
    }
}
