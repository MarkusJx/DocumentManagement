import React from "react";
import ReactDOM from "react-dom";
import {MDCCheckbox} from '@material/checkbox';
import {MDCRipple} from "@material/ripple";
import {MDCLinearProgress} from "@material/linear-progress"
import {MDCMenu} from "@material/menu";
import MDCCSSProperties from "./MDCCSSProperties";
import {MDCDialog} from "@material/dialog";
import {
    TextArea,
    TextAreaProps,
    TextAreaWithAutoCompleteBase,
    TextAreaWithAutoCompletePropsBase,
    TextFieldAutoComplete
} from "./ChipTextArea";

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
    public constructor(props: {}) {
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

/**
 * The dropdown menu properties
 */
interface DropdownMenuProps {
    // The initial label of the open button
    initialLabel: string;
    // The options in the menu
    options: string[];
    // A function to be called when the value is changed
    onChange?: () => void;
}

/**
 * The dropdown menu state
 */
interface DropdownMenuState {
    // The current open button label
    buttonLabel: string;
}

/**
 * A dropdown menu
 */
export class DropdownMenu extends React.Component<DropdownMenuProps, DropdownMenuState> {
    /**
     * The open button element
     * @private
     */
    private openButton: HTMLButtonElement;

    /**
     * The menu surface element
     * @private
     */
    private menuItem: HTMLDivElement;

    /**
     * The mdc menu
     * @private
     */
    private menu: MDCMenu;

    /**
     * The current open button label
     * @private
     */
    private cur: string;

    /**
     * Create a dropdown menu
     *
     * @param props the properties
     */
    public constructor(props: DropdownMenuProps) {
        super(props);

        this.openButton = null;
        this.menuItem = null;
        this.menu = null;
        this.cur = this.props.initialLabel;

        this.state = {
            buttonLabel: props.initialLabel
        };

        this.openButtonClick = this.openButtonClick.bind(this);
        this.optionClick = this.optionClick.bind(this);
    }

    /**
     * Get the currently selected option
     *
     * @return the currently selected option
     */
    public get selectedOption(): string {
        return this.cur;
    }

    /**
     * Set the currently selected option
     *
     * @param option the new option
     */
    public set selectedOption(option: string) {
        this.buttonLabel = option;
        this.cur = option;
    }

    /**
     * Get the button label
     * @private
     */
    private get buttonLabel(): string {
        return this.state.buttonLabel;
    }

    /**
     * Set the button label
     *
     * @param label the new open button label
     * @private
     */
    private set buttonLabel(label: string) {
        this.setState({
            buttonLabel: label
        });
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-menu-surface--anchor">
                <button className="mdc-button mdc-button--outlined" ref={e => this.openButton = e}
                        onClick={this.openButtonClick}>
                    <span className="mdc-button__ripple"/>
                    <span className="mdc-button__label">
                        {this.buttonLabel}
                    </span>
                    <i className="material-icons mdc-button__icon" aria-hidden="true"
                       style={{marginLeft: 'auto'}}>arrow_drop_down</i>
                </button>

                <div className="mdc-menu mdc-menu-surface" ref={e => this.menuItem = e}>
                    <ul className="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabIndex={-1}>
                        {this.generateMenuItems()}
                    </ul>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.menu = new MDCMenu(this.menuItem);
        MDCRipple.attachTo(this.openButton);
    }

    private optionClick(option: string): void {
        this.selectedOption = option;
        if (this.props.onChange) {
            this.props.onChange();
        }
    }

    /**
     * A listener for when the open button is clicked
     * @private
     */
    private openButtonClick(): void {
        this.menu.open = !this.menu.open;
    }

    /**
     * Generate the menu items
     *
     * @return the generated menu items
     * @private
     */
    private generateMenuItems(): React.ReactNode {
        return (
            this.props.options.map(option => (
                <li className="mdc-list-item" role="menuitem" onClick={this.optionClick.bind(this, option)}
                    key={`list-item-${option}`}>
                    <span className="mdc-list-item__ripple"/>
                    <span className="mdc-list-item__text">{option}</span>
                </li>
            ))
        );
    }
}

/**
 * The dialog properties
 */
interface DialogProps {
    // The children of the dialog content
    children?: React.ReactNode[] | React.ReactNode;
    // The style of the dialog
    style?: React.CSSProperties;
    // The style of the dialog content element
    contentStyle?: React.CSSProperties;
    // The style of the dialog surface
    surfaceStyle?: React.CSSProperties;
    // Whether the dialog has a cancel button
    hasCancelButton?: boolean;
    // The id of the title element
    titleId: string;
    // The id of the content element
    contentId: string;
    // The dialog title
    title: string;
}

/**
 * A mdc dialog wrapper
 */
export class Dialog extends React.Component<DialogProps> {
    /**
     * The dialog element
     * @private
     */
    private element: HTMLElement;

    /**
     * The mdc dialog
     * @private
     */
    private dialog: MDCDialog;

    /**
     * Create a dialog
     *
     * @param props the properties
     */
    public constructor(props: DialogProps) {
        super(props);

        this.element = null;
        this.dialog = null;
    }

    /**
     * Listen for an event
     *
     * @param evtType the event type
     * @param handler the event handler
     */
    public listen(evtType: string, handler: (event: CustomEvent<{ action: string }>) => void) {
        this.dialog.listen(evtType, handler);
    }

    /**
     * Open the dialog
     */
    public open(): void {
        this.dialog.open();
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-dialog" style={this.props.style} ref={e => this.element = e}>
                <div className="mdc-dialog__container">
                    <div className="mdc-dialog__surface" role="alertdialog" aria-modal="true"
                         aria-labelledby={this.props.titleId} aria-describedby={this.props.contentId}
                         style={this.props.surfaceStyle}>
                        <h2 className="mdc-dialog__title" id={this.props.titleId}>
                            {this.props.title}
                        </h2>
                        <div className="mdc-dialog__content" id={this.props.contentId} style={this.props.contentStyle}>
                            {this.props.children}
                        </div>
                        <div className="mdc-dialog__actions">
                            {
                                this.props.hasCancelButton !== false ? (
                                    <button type="button" className="mdc-button mdc-dialog__button"
                                            data-mdc-dialog-action="cancel">
                                        <div className="mdc-button__ripple"/>
                                        <span className="mdc-button__label">Cancel</span>
                                    </button>
                                ) : null
                            }
                            <button type="button" className="mdc-button mdc-dialog__button"
                                    data-mdc-dialog-action="accept">
                                <div className="mdc-button__ripple"/>
                                <span className="mdc-button__label">Ok</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mdc-dialog__scrim"/>
            </div>
        );
    }

    public componentDidMount(): void {
        this.dialog = new MDCDialog(this.element);
    }
}

/**
 * The outlined text field properties
 */
interface OutlinedTextFieldProps extends TextAreaProps {
    // The label id
    labelId: string;
}

/**
 * A outlined text field
 */
export class OutlinedTextField extends TextArea<OutlinedTextFieldProps> {
    public render() {
        // The style for the main element
        const style: MDCCSSProperties = {
            marginTop: "20px",
            "--mdc-theme-primary": "#4a6eff",
            width: "100%"
        };

        return (
            <label className="mdc-text-field mdc-text-field--outlined" style={style} ref={e => this.$this = e}>
                <span className="mdc-notched-outline">
                    <span className="mdc-notched-outline__leading"/>
                    <span className="mdc-notched-outline__notch">
                        <span className="mdc-floating-label" id={this.props.labelId}>{this.props.title}</span>
                    </span>
                    <span className="mdc-notched-outline__trailing"/>
                </span>
                <input type="text" className="mdc-text-field__input" aria-labelledby={this.props.labelId}
                       onInput={this.onInput}/>
            </label>
        );
    }
}

/**
 * Outlined text field with auto complete properties
 */
interface OutlinedTextFieldWithAutoCompleteProps extends TextAreaWithAutoCompletePropsBase {
    // The label id
    labelId: string;
}

/**
 * A outlined text field with auto complete
 */
export class OutlinedTextFieldWithAutoComplete extends TextAreaWithAutoCompleteBase<OutlinedTextField, OutlinedTextFieldWithAutoCompleteProps> {
    /**
     * Create the text field
     *
     * @param props the properties
     */
    public constructor(props: OutlinedTextFieldWithAutoCompleteProps) {
        super(props);

        this.onAutoCompleteOptionClick = this.onAutoCompleteOptionClick.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-menu-surface--anchor">
                <OutlinedTextField ref={e => this.textArea = e} title={this.title} value={this._value}
                                   labelId={this.props.labelId}/>
                <TextFieldAutoComplete getAutoCompleteOptions={this.getAutoCompleteOptions} parent={this}
                                       ref={e => this.autoComplete = e} onClick={this.onAutoCompleteOptionClick}/>
            </div>
        );
    }

    /**
     * On auto complete option click
     *
     * @param option the selected option
     * @protected
     */
    protected onAutoCompleteOptionClick(option: string): void {
        this.autoComplete.hide();
        this.textArea.textField.value = option;
    }
}