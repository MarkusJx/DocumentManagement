import React from "react";
import ReactDOM from "react-dom";
import {MDCCheckbox} from '@material/checkbox';
import {MDCRipple} from "@material/ripple";
import {MDCLinearProgress} from "@material/linear-progress"
import {MDCMenu} from "@material/menu";
import {MDCDialog} from "@material/dialog";
import {MDCSnackbar} from "@material/snackbar";
import {MDCSwitch} from "@material/switch";
import {MDCTopAppBar} from "@material/top-app-bar";
import MDCCSSProperties from "../util/MDCCSSProperties";
import {
    TextArea,
    TextAreaProps,
    TextAreaWithAutoCompleteBase,
    TextAreaWithAutoCompletePropsBase,
    TextFieldAutoComplete
} from "./ChipTextArea";
import {MDCDataTable} from "@material/data-table";

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
    // The button title
    title: string;
}

/**
 * A material button
 */
export class Button<P extends ButtonProps = ButtonProps> extends React.Component<P, ButtonState> {
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
            enabled: true,
            title: props.text
        };

        this.className = props.className;
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

    /**
     * Set the button title
     *
     * @param val the new title
     */
    public set title(val: string) {
        this.setState({
            title: val
        });
    }

    public render(): React.ReactNode {
        const className = this.className ? `mdc-button themed-button ${this.className}` : 'mdc-button themed-button';
        return (
            <button className={className} onClick={this.onClick} style={this.props.style}
                    disabled={!this.state.enabled}>
                <span className="mdc-button__ripple"/>
                <span className="mdc-button__label">
                    {this.state.title}
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
        const className = this.className ?
            `mdc-button mdc-button--outlined themed-button ${this.className}` :
            'mdc-button mdc-button--outlined themed-button';
        return (
            <button className={className} onClick={this.onClick} style={this.props.style}
                    disabled={!this.state.enabled}>
                <span className="mdc-button__ripple"/>
                <span className="mdc-button__label">
                    {this.state.title}
                </span>
            </button>
        );
    }
}

/**
 * The progress bar properties
 */
interface ProgressBarProps {
    // An optional style
    style?: MDCCSSProperties;
}

/**
 * A progress bar
 */
export class ProgressBar extends React.Component<ProgressBarProps> {
    /**
     * The mdc progress bar element
     */
    public progressBar: MDCLinearProgress;
    /**
     * The html element
     * @private
     */
    private element: HTMLElement;

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
            <div className="mdc-linear-progress mdc-linear-progress--indeterminate themed-linear-progress"
                 role="progressbar" style={this.props.style} ref={e => this.element = e}>
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
        this.progressBar = new MDCLinearProgress(this.element);
    }
}

interface MenuProps {
    // The options in the menu
    options: string[];
    // A function to be called when an option is clicked
    onOptionClick: (selectedOption: string) => void;
    // Optional styles
    style?: MDCCSSProperties;
}

/**
 * A mdc menu
 */
export class Menu extends React.Component<MenuProps> {
    /**
     * The mdc menu
     */
    public menu: MDCMenu = null;
    /**
     * The menu surface element
     * @private
     */
    private menuItem: HTMLDivElement = null;

    /**
     * Check if the menu is open
     *
     * @return true if the menu is open
     */
    public get open(): boolean {
        return this.menu.open;
    }

    /**
     * Set whether the menu should be opened
     *
     * @param value whether the menu should be opened
     */
    public set open(value: boolean) {
        this.menu.open = value;
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-menu mdc-menu-surface themed-menu-surface" ref={e => this.menuItem = e}
                 style={this.props.style}>
                <ul className="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabIndex={-1}>
                    {this.generateMenuItems()}
                </ul>
            </div>
        );
    }

    public componentDidMount(): void {
        this.menu = new MDCMenu(this.menuItem);
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

    private optionClick(option: string): void {
        this.props.onOptionClick(option);
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
     * The current open button label
     * @private
     */
    private cur: string;

    /**
     * The menu element
     * @private
     */
    private menu: Menu;

    /**
     * Create a dropdown menu
     *
     * @param props the properties
     */
    public constructor(props: DropdownMenuProps) {
        super(props);

        this.openButton = null;
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
                <button className="mdc-button mdc-button--outlined themed-button" ref={e => this.openButton = e}
                        onClick={this.openButtonClick}>
                    <span className="mdc-button__ripple"/>
                    <span className="mdc-button__label">
                        {this.buttonLabel}
                    </span>
                    <i className="material-icons mdc-button__icon" aria-hidden="true"
                       style={{marginLeft: 'auto'}}>arrow_drop_down</i>
                </button>

                <Menu options={this.props.options} onOptionClick={this.optionClick} ref={e => this.menu = e}/>
            </div>
        );
    }

    public componentDidMount(): void {
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
    // The accept button text
    acceptButtonText?: string;
}

/**
 * A mdc dialog wrapper
 */
export class Dialog extends React.Component<DialogProps> {
    /**
     * The mdc dialog
     */
    public dialog: MDCDialog;

    /**
     * The dialog element
     * @private
     */
    private element: HTMLElement;

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
            <div className="mdc-dialog themed-dialog" style={this.props.style} ref={e => this.element = e}>
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
                                    <button type="button" className="mdc-button mdc-dialog__button themed-dialog-button"
                                            data-mdc-dialog-action="cancel">
                                        <div className="mdc-button__ripple"/>
                                        <span className="mdc-button__label">Cancel</span>
                                    </button>
                                ) : null
                            }
                            <button type="button" className="mdc-button mdc-dialog__button themed-dialog-button"
                                    data-mdc-dialog-action="accept">
                                <div className="mdc-button__ripple"/>
                                <span className="mdc-button__label">
                                    {this.props.acceptButtonText ? this.props.acceptButtonText : "Ok"}
                                </span>
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
            <label className="mdc-text-field mdc-text-field--outlined themed-text-field" style={style}
                   ref={e => this.$this = e}>
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
     * @private
     */
    private onAutoCompleteOptionClick(option: string): void {
        this.autoComplete.hide();
        this.textArea.textField.value = option;
    }
}

/**
 * The mdc data table row properties
 */
interface MDCDataTableRowProps {
    // The row values
    values: string[];
}

/**
 * A mdc data table row
 */
export class MDCDataTableRow extends React.Component<MDCDataTableRowProps> {
    /**
     * The id of the next element
     * @private
     */
    private id: number = 0;

    public render(): React.ReactNode {
        return (
            <tr className="mdc-data-table__row">
                {this.getRows()}
            </tr>
        );
    }

    /**
     * Generate the row cells
     *
     * @return the generated row cells
     * @private
     */
    private getRows(): React.ReactNode {
        let firstElement: boolean = true;
        return this.props.values.map(value => {
            // Add some special properties to the first cell
            if (firstElement) {
                firstElement = false;
                return (
                    <th className="mdc-data-table__cell" scope="row" key={`${value}-${this.id++}`}>
                        {value}
                    </th>
                );
            } else {
                return (
                    <td className="mdc-data-table__cell" key={`${value}-${this.id++}`}>
                        {value}
                    </td>
                );
            }
        });
    }
}

/**
 * The mdc data table container properties
 */
interface MDCDataTableContainerProps {
    // The data table headers
    headers: string[];
}

/**
 * The mdc data table container
 */
export class MDCDataTableContainer extends React.Component<MDCDataTableContainerProps> {
    public render(): React.ReactNode {
        return (
            <div className="mdc-data-table__table-container">
                <table aria-label="Documents" className="mdc-data-table__table">
                    <thead>
                    <tr className="mdc-data-table__header-row">
                        {this.generateHeaderRow()}
                    </tr>
                    </thead>
                    <tbody className="mdc-data-table__content">
                    {this.props.children}
                    </tbody>
                </table>
            </div>
        );
    }

    /**
     * Generate the header row
     *
     * @return the generated header row
     * @private
     */
    private generateHeaderRow(): React.ReactNode {
        return (
            this.props.headers.map(value => (
                <th className="mdc-data-table__header-cell" role="columnheader" scope="col" key={value}>
                    {value}
                </th>
            ))
        )
    }
}

/**
 * A mdc data table progress indicator
 */
export class MDCDataTableProgressIndicator extends React.Component {
    public render(): React.ReactNode {
        return (
            <div className="mdc-data-table__progress-indicator themed-linear-progress">
                <div className="mdc-data-table__scrim"/>
                <div
                    className="mdc-linear-progress mdc-linear-progress--indeterminate mdc-data-table__linear-progress"
                    role="progressbar" aria-label="Data is being loaded...">
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
            </div>
        );
    }
}

/**
 * The data table properties
 */
interface DataTableProps {
    // The data table style
    style?: MDCCSSProperties;
}

/**
 * A mdc data table
 */
export class DataTable extends React.Component<DataTableProps> {
    /**
     * The underlying html element
     */
    public element: HTMLElement = null;

    /**
     * The actual mdc data table
     */
    public dataTable: MDCDataTable = null;

    public render(): React.ReactNode {
        return (
            <div className="mdc-data-table themed-data-table" style={this.props.style} ref={e => this.element = e}>
                {this.props.children}
            </div>
        );
    }

    public componentDidMount(): void {
        this.dataTable = new MDCDataTable(this.element);
    }
}

/**
 * The snackbar properties
 */
export interface SnackbarProps {
    // The text of the close button
    closeButtonText: string;
    // The text of the snackbar
    snackbarText?: string;
    // The snackbar style
    style?: MDCCSSProperties;
}

interface SnackbarState {
    // The text of the snackbar
    snackbarText: string;
}

/**
 * A mdc snackbar
 */
export class Snackbar extends React.Component<SnackbarProps, SnackbarState> {
    /**
     * The actual snackbar implementation
     */
    public snackbar: MDCSnackbar = null;
    /**
     * The actual HTML element
     * @private
     */
    private element: HTMLElement = null;

    /**
     * Create a snackbar
     *
     * @param props the properties
     */
    public constructor(props: SnackbarProps) {
        super(props);

        this.state = {
            snackbarText: this.props.snackbarText
        };
    }

    /**
     * Set the snackbar text
     *
     * @param text the new text
     */
    public set snackbarText(text: string) {
        this.setState({
            snackbarText: text
        });
    }

    /**
     * Open the snackbar
     */
    public open(): void {
        this.snackbar.open();
    }

    /**
     * Close the snackbar
     */
    public close(): void {
        this.snackbar.close();
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-snackbar" style={this.props.style} ref={e => this.element = e}>
                <div className="mdc-snackbar__surface" role="status" aria-relevant="additions">
                    <div className="mdc-snackbar__label" aria-atomic="false">
                        {this.state.snackbarText}
                    </div>
                    <div className="mdc-snackbar__actions" aria-atomic="true">
                        <button type="button" className="mdc-button mdc-snackbar__action">
                            <div className="mdc-button__ripple"/>
                            <span className="mdc-button__label">
                                {this.props.closeButtonText}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.snackbar = new MDCSnackbar(this.element);
    }
}

/**
 * The switch properties
 */
interface SwitchProps {
    // The switch id
    id: string;
    // The switch style
    style?: MDCCSSProperties;
}

/**
 * A mdc switch
 */
export class Switch extends React.Component<SwitchProps> {
    /**
     * The switch implementation
     */
    public switch: MDCSwitch = null;
    /**
     * The switch html element
     * @private
     */
    private element: HTMLElement = null;

    /**
     * Get if the switch is checked
     *
     * @return true if the switch is checked
     */
    public get checked(): boolean {
        return this.switch.checked;
    }

    /**
     * Set whether the switch should be checked
     *
     * @param checked whether the switch should be checked
     */
    public set checked(checked: boolean) {
        this.switch.checked = checked;
    }

    public render() {
        return (
            <div className="mdc-switch" ref={e => this.element = e} style={this.props.style}>
                <div className="mdc-switch__track"/>
                <div className="mdc-switch__thumb-underlay">
                    <div className="mdc-switch__thumb"/>
                    <input type="checkbox" id={this.props.id} className="mdc-switch__native-control" role="switch"
                           aria-checked="false"/>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.switch = new MDCSwitch(this.element);
    }
}

/**
 * Properties with just an optional style element
 */
interface StyleProps {
    // The optional style
    style?: MDCCSSProperties;
}

/**
 * Classes for creating a top app bar
 */
export namespace topAppBar {
    /**
     * The top app bar header
     */
    export class Header extends React.Component<StyleProps> {
        /**
         * The mdc top app bar object
         */
        public topAppBar: MDCTopAppBar = null;
        /**
         * The header html element
         * @private
         */
        private element: HTMLElement = null;

        public render(): React.ReactNode {
            return (
                <header className="mdc-top-app-bar mdc-top-app-bar--dense themed-top-app-bar"
                        ref={e => this.element = e}
                        style={this.props.style}>
                    <div className="mdc-top-app-bar__row">
                        {this.props.children}
                    </div>
                </header>
            );
        }

        public componentDidMount() {
            this.topAppBar = new MDCTopAppBar(this.element);
        }
    }

    /**
     * The navigation section properties
     */
    interface NavigationSectionProps {
        // The top app bar title
        title: string;
    }

    /**
     * The navigation section.
     * Usually contains the navigation button,
     * which is a {@link topAppBar.NavigationButton}
     */
    export class NavigationSection extends React.Component<NavigationSectionProps> {
        public render(): React.ReactNode {
            return (
                <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
                    {this.props.children}
                    <span className="mdc-top-app-bar__title">{this.props.title}</span>
                </section>
            );
        }
    }

    /**
     * The top app bar button properties
     */
    interface ButtonProps extends StyleProps {
        // Called when the element is clicked
        onClick: () => void;
        // The button label
        label: string;
        // The button icon name
        iconName: string;
        // The element this is described by
        describedby?: string;
        // Whether the button is enabled
        enabled?: boolean;
    }

    export class NavigationButton extends React.Component<ButtonProps> {
        public render(): React.ReactNode {
            return (
                <button className="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button"
                        aria-label={this.props.label} onClick={this.props.onClick} style={this.props.style}
                        aria-describedby={this.props.describedby} disabled={this.props.enabled === false}>
                    {this.props.iconName}
                </button>
            );
        }
    }

    /**
     * The action buttons section.
     * Usually contains {@link topAppBar.ActionButton}s
     */
    export class ActionButtonsSection extends React.Component {
        public render(): React.ReactNode {
            return (
                <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end"
                         role="toolbar">
                    {this.props.children}
                </section>
            );
        }
    }

    /**
     * A top app bar action button
     */
    export class ActionButton extends React.Component<ButtonProps> {
        public render(): React.ReactNode {
            return (
                <button className="material-icons mdc-top-app-bar__action-item mdc-icon-button"
                        disabled={this.props.enabled === false} aria-label={this.props.label}
                        onClick={this.props.onClick} aria-describedby={this.props.describedby}>
                    {this.props.iconName}
                </button>
            );
        }
    }

    /**
     * The main element which contains all
     * elements below the top app bar
     */
    export class Main extends React.Component {
        public render(): React.ReactNode {
            return (
                <main className="mdc-top-app-bar--dense-fixed-adjust">
                    {this.props.children}
                </main>
            );
        }
    }
}
