import React from "react";
import ReactDOM from "react-dom";
import {MDCCheckbox} from '@material/checkbox';
import {MDCRipple} from "@material/ripple";
import MDCCSSProperties from "./MDCCSSProperties";

let checkbox_id: number = 0;

export class Checkbox extends React.Component<{}> {
    public checkbox: MDCCheckbox;

    public constructor(props: {}) {
        super(props);

        this.checkbox = null;
    }

    public get checked(): boolean {
        return this.checkbox.checked;
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-checkbox">
                <input type="checkbox" className="mdc-checkbox__native-control" id={"checkbox-" + checkbox_id++}/>
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

export interface ButtonProps {
    text: string;
    onClick: () => void;
    style?: MDCCSSProperties;
}

export class Button<P extends ButtonProps = ButtonProps> extends React.Component<P> {
    protected readonly text: string;
    protected readonly onClick: () => void;

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

export class OutlinedButton extends Button {
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
