import React from "react";
import ReactDOM from "react-dom";
import {MDCCheckbox} from '@material/checkbox';
import {MDCRipple} from "@material/ripple";
import {MDCLinearProgress} from "@material/linear-progress"
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
    // The class name
    className?: string;
}

/**
 * A state for a button
 */
export interface ButtonState {
    // Whether the button is enabled
    enabled: boolean;
}

/**
 * A material button
 */
export class Button<P extends ButtonProps = ButtonProps> extends React.Component<P, ButtonState> {
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
     * The class name of the element
     * @protected
     */
    protected readonly className: string;

    /**
     * Create a button
     *
     * @param props the properties
     */
    public constructor(props: P) {
        super(props);

        this.state = {
            enabled: true
        };

        this.className = props.className;
        this.text = props.text;
        this.onClick = props.onClick.bind(this);
    }

    /**
     * Set whether the button should be enabled
     *
     * @param val whether the button should be enabled
     */
    public set enabled(val: boolean) {
        this.setState({
            enabled: val
        });
    }

    public render(): React.ReactNode {
        const className = this.className ? `mdc-button ${this.className}` : 'mdc-button';
        return (
            <button className={className} onClick={this.onClick} style={this.props.style}
                    disabled={!this.state.enabled}>
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
        const className = this.className ? `mdc-button mdc-button--outlined ${this.className}` : 'mdc-button mdc-button--outlined';
        return (
            <button className={className} onClick={this.onClick} style={this.props.style}
                    disabled={!this.state.enabled}>
                <span className="mdc-button__ripple"/>
                <span className="mdc-button__label">
                    {this.text}
                </span>
            </button>
        );
    }
}

/**
 * A progress bar
 */
export class ProgressBar extends React.Component {
    /**
     * The mdc progress bar element
     */
    public element: MDCLinearProgress;

    /**
     * Create a progress bar
     *
     * @param props the properties
     */
    public constructor(props) {
        super(props);

        this.element = null;
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-linear-progress mdc-linear-progress--indeterminate" role="progressbar">
                <div className="mdc-linear-progress__buffer">
                    <div className="mdc-linear-progress__buffer-bar"/>
                    <div className="mdc-linear-progress__buffer-dots"/>
                </div>
                <div className="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                    <span className="mdc-linear-progress__bar-inner"/>
                </div>
                <div className="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                    <span className="mdc-linear-progress__bar-inner"/>
                </div>
            </div>
        );
    }

    public componentDidMount() {
        const $this = ReactDOM.findDOMNode(this) as Element;
        this.element = new MDCLinearProgress($this);
    }
}
