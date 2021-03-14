import React from "react";
import ReactDOM from "react-dom";

import {MDCChip} from "@material/chips";
import {MDCTextField} from "@material/textfield";
import {MDCRipple} from "@material/ripple";
import {MDCList} from '@material/list';
import {Tooltip} from "./Tooltip";
import MDCCSSProperties from "./MDCCSSProperties";

/**
 * A function to check if a chip value exists
 */
type ChipValueExists_t = (value: string) => boolean;

/**
 * The properties for an InputChip
 */
type InputChipProps = {
    // The id of the input chip
    id: string,
    // The inner text of the chip
    text: string,
    // The parent element
    parent: ChipTextArea,
    // The tooltip text
    tooltipText?: string,
    // A function to check whether the chip value exists
    chipValueExists?: ChipValueExists_t
};

/**
 * A mdc chip an a {@link ChipTextArea}
 */
class InputChip extends React.Component<InputChipProps> {
    /**
     * Whether a tooltip should be created
     * @private
     */
    private readonly requiresTooltip: boolean;

    /**
     * The parent element
     * @private
     */
    private readonly parent: ChipTextArea;

    /**
     * The text of the tooltip
     * @private
     */
    private readonly tooltipText: string;

    /**
     * The id of the tooltip (if created)
     * @private
     */
    private readonly tooltipId: string

    /**
     * The text of the chip
     * @private
     */
    private readonly text: string;

    /**
     * The id of the chip
     * @private
     */
    private readonly id: string;

    /**
     * The chip implementation
     * @private
     */
    private chip: MDCChip;

    /**
     * Create an InputChip
     *
     * @param props the properties
     */
    public constructor(props: InputChipProps) {
        super(props);
        this.text = props.text;
        this.parent = props.parent;
        this.chip = null;
        this.id = props.id;
        this.tooltipText = props.tooltipText;
        this.tooltipId = this.id + '-tooltip';
        this.requiresTooltip = props.chipValueExists && props.tooltipText && !props.chipValueExists(this.text);

        this.destroy = this.destroy.bind(this);
    }

    public render(): React.ReactNode {
        const style: React.CSSProperties = {
            marginRight: "5px",
            marginLeft: "5px",
            marginTop: "10px"
        }

        return (
            <div className="mdc-chip" role="row" style={style}>
                <div className="mdc-chip__ripple"/>
                {this.getLeadingIcon()}
                <span role="gridcell">
                    <span role="button" className="mdc-chip__primary-action">
                        <span className="mdc-chip__text">
                            {this.text}
                        </span>
                    </span>
                </span>
                <span role="gridcell">
                    <i className="material-icons mdc-chip__icon mdc-chip__icon--trailing" role="button"
                       onClick={this.destroy}>
                        cancel
                    </i>
                </span>
            </div>
        );
    }

    public componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        this.chip = new MDCChip($this);

        if (this.requiresTooltip) {
            // Create the tooltip
            Tooltip.create({
                id: this.tooltipId,
                text: this.tooltipText
            });
        }
    }

    public componentWillUnmount() {
        if (this.requiresTooltip) {
            // Delete the tooltip associated with this chip
            Tooltip.delete(this.tooltipId);
        }
    }

    /**
     * Destroy the input chip and remove it from its parent
     * @private
     */
    private destroy(): void {
        this.parent.currentChipValues.splice(this.parent.currentChipValues.indexOf(this.text), 1);
        this.chip.destroy();

        this.parent.forceUpdate();
    }

    /**
     * Get the leading icon. Only created if the tooltip will also be created
     *
     * @return the generated icon node
     * @private
     */
    private getLeadingIcon(): React.ReactNode {
        if (this.requiresTooltip) {
            return (
                <i className="material-icons mdc-chip__icon mdc-chip__icon--leading" aria-describedby={this.tooltipId}>
                    info
                </i>
            );
        } else {
            return null;
        }
    }
}

/**
 * A function to get autocomplete options for an input
 */
type getAutoCompleteOptions_t = (input: string) => string[];

/**
 * Properties for {@link TextFieldAutoComplete}
 */
type TextFieldAutoCompleteProps = {
    // A function to get the auto complete options
    getAutoCompleteOptions: getAutoCompleteOptions_t,
    // A function to be called when an auto complete option is clicked
    onClick: (value: string) => void,
    // The parent element
    parent: TextAreaWithAutoCompleteBase<any, any>
};

/**
 * Properties for an {@link TextFieldAutoComplete.MenuItem}
 */
type MenuItemProps = {
    // The menu item content
    text: string,
    // A function to be called when an auto complete option is clicked
    onClick: () => void
};

/**
 * An autocomplete suggestion element for a text field
 */
class TextFieldAutoComplete extends React.Component<TextFieldAutoCompleteProps> {
    /**
     * A menu item in the autocomplete menu
     * @protected
     */
    protected static readonly MenuItem = class extends React.Component<MenuItemProps> {
        /**
         * The text of the menu item
         * @private
         */
        private readonly text: string;

        /**
         * A function to be called when an auto complete option is clicked
         * @private
         */
        private readonly onClick: () => void;

        /**
         * Create a menu item
         *
         * @param props the properties
         */
        public constructor(props: MenuItemProps) {
            super(props);
            this.text = props.text;
            this.onClick = props.onClick.bind(this);
        }

        public render(): React.ReactNode {
            return (
                <li className="mdc-list-item" role="menuitem" onClick={this.onClick}>
                    <span className="mdc-list-item__ripple"/>
                    <span className="mdc-list-item__text">
                        {this.text}
                    </span>
                </li>
            );
        }

        public componentDidMount(): void {
            const $this = ReactDOM.findDOMNode(this) as Element;
            MDCRipple.attachTo($this);
        }
    }

    /**
     * The html element created by this class
     */
    public $this: HTMLDivElement;

    /**
     * The function to get the auto complete options
     * @private
     */
    private readonly getAutoCompleteOptions: getAutoCompleteOptions_t;

    /**
     * A function to be called when an auto complete option is clicked
     * @private
     */
    private readonly onClick: (value: string) => void;

    /**
     * The parent class
     * @private
     */
    private readonly parent: TextAreaWithAutoCompleteBase<any, any>;

    /**
     * The number of child menu elements this has
     * @private
     */
    private numChildren: number;

    /**
     * The id for the next child menu item to be generated
     * @private
     */
    private currentKey: number;

    /**
     * Create a autocomplete menu
     *
     * @param props the properties
     */
    public constructor(props: TextFieldAutoCompleteProps) {
        super(props);
        this.parent = props.parent;
        this.numChildren = 0;
        this.currentKey = 0;
        this.$this = null;

        this.getAutoCompleteOptions = props.getAutoCompleteOptions;
        this.onClick = props.onClick.bind(this);
        this.onTextFieldInput = this.onTextFieldInput.bind(this);
    }

    public render(): React.ReactNode {
        // Calculate the top value
        const top: string = (this.parent.$this != null) ? this.parent.$this.offsetHeight + 'px' : '76px';

        // Set the css style
        const style: React.CSSProperties = {
            position: 'absolute',
            borderRadius: '5px',
            boxShadow: '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0,0,0,.12)',
            display: 'inline-block',
            transition: 'opacity 0.125s ease-in-out',
            width: '100%',
            right: 0,
            background: 'white',
            zIndex: 999,
            opacity: 0,
            visibility: 'hidden',
            top: top
        };

        return (
            <div style={style}>
                <ul className="mdc-list">
                    {this.generateMenuItems()}
                </ul>
            </div>
        );
    }

    public componentDidMount(): void {
        this.$this = ReactDOM.findDOMNode(this) as HTMLDivElement;
        MDCList.attachTo(this.$this.querySelector('.mdc-list'));

        this.parent.textArea.inputListener = this.onTextFieldInput;
    }

    public componentWillUnmount() {
        if (this.parent.textArea) {
            this.parent.textArea.inputListener = null;
        }
    }

    /**
     * Update the values
     */
    public update(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.forceUpdate(resolve);
            } catch (e: any) {
                reject(e);
            }
        });
    }

    /**
     * Show the autocomplete menu if there are items to display
     */
    public show(): void {
        if (this.numChildren > 0) {
            this.$this.style.top = (this.parent.$this != null) ? this.parent.$this.offsetHeight + 'px' : '76px'
            this.$this.style.visibility = 'visible';
            this.$this.style.opacity = '1';
        } else {
            this.hide();
        }
    }

    /**
     * Hide the menu
     */
    public hide(): void {
        this.$this.style.opacity = '0';
        this.$this.style.visibility = 'hidden';
        this.$this.style.top = '0';
    }

    /**
     * Called on input on the text field
     * @private
     */
    private onTextFieldInput(): void {
        if (this.parent.textArea.textField.value.trim().length > 0) {
            this.update().then(this.show.bind(this));
        } else {
            this.hide();
        }
    }

    /**
     * Generate the menu items
     *
     * @return the menu items node
     * @private
     */
    private generateMenuItems(): React.ReactNode {
        if (this.parent.textArea != null) {
            const value: string = this.parent.textArea.getTextFieldValues()[0];
            if (value.length > 0) {
                const options = this.getAutoCompleteOptions(value);
                this.numChildren = options.length;

                return (
                    options.map((option: string, index: number) => {
                        const onClick = this.onClick.bind(this, option);
                        return <TextFieldAutoComplete.MenuItem text={option} key={index + '-' + this.currentKey++}
                                                               onClick={onClick}/>;
                    })
                );
            }
        }

        this.numChildren = 0;
        return null;
    }
}

/**
 * The text area properties
 */
export interface TextAreaProps {
    // The text area title
    title: string

    // The text field value to set when it is first created
    value?: string;
}

/**
 * An empty function
 */
export type EmptyFunction = () => void;

/**
 * A text area
 */
export class TextArea<P extends TextAreaProps = TextAreaProps> extends React.Component<P> {
    /**
     * The splitter function for the values
     * @private
     */
    private static readonly textFieldValue_splitter: RegExp = /[\n]+/gi;

    /**
     * The text field implementation
     */
    public textField: MDCTextField;

    /**
     * The element created by this class
     */
    public $this: HTMLLabelElement;

    /**
     * The input listener
     */
    public inputListener: EmptyFunction;

    /**
     * The title of the text area
     * @protected
     */
    protected title: string;

    /**
     * The text field value to set when it is first created
     * @protected
     */
    protected readonly value: string;

    /**
     * Create a text area
     *
     * @param props the properties
     */
    constructor(props: P) {
        super(props);

        this.textField = null;
        this.$this = null;
        this.title = props.title;
        this.value = props.value;

        this.inputListener = null;
        this.onInput = this.onInput.bind(this);
    }

    public render(): React.ReactNode {
        // The style for the main element
        const style: MDCCSSProperties = {
            marginTop: "20px",
            "--mdc-theme-primary": "#4a6eff",
            width: "100%"
        };

        return (
            <label className="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea" style={style}>
                <span className="mdc-notched-outline">
                    <span className="mdc-notched-outline__leading"/>
                    <span className="mdc-notched-outline__notch">
                        <span className="mdc-floating-label text-area-label" id="tag-text-area-label">
                            {this.title}
                        </span>
                    </span>
                    <span className="mdc-notched-outline__trailing"/>
                </span>
                <textarea className="mdc-text-field__input" rows={1} cols={40} aria-label="tag-text-area-label"
                          onInput={this.onInput}/>
            </label>
        );
    }

    public componentDidMount(): void {
        this.$this = ReactDOM.findDOMNode(this) as HTMLLabelElement;
        this.textField = new MDCTextField(this.$this);

        if (this.value) {
            this.textField.value = this.value;
        }
    }

    /**
     * Get the values in the text field
     */
    public getTextFieldValues(): string[] {
        return this.textField.value.trim().split(TextArea.textFieldValue_splitter).map(s => s.trim());
    }

    /**
     * On input event callback function
     *
     * @param event the input event
     * @protected
     */
    protected onInput(event: any): void {
        if (this.inputListener) {
            this.inputListener();
        }
    }
}

/**
 * Properties for a {@link ChipTextArea}
 */
export interface ChipTextAreaProps extends TextAreaProps {
    // A function to check if a chip value exists
    chipValueExists?: ChipValueExists_t

    // A tooltip for the chip if the value does not exist
    chipTooltipText?: string
}

/**
 * A text area where the whole input gets converted to a chip when enter is pressed
 */
export class ChipTextArea extends TextArea<ChipTextAreaProps> {
    /**
     * The values of the chips created
     */
    public currentChipValues: string[];

    /**
     * The function to check if a chip value exists
     * @private
     */
    private readonly chipValueExists: ChipValueExists_t;

    /**
     * The chip tooltip text
     * @private
     */
    private readonly chipTooltipText: string;

    /**
     * The id of the next chip to generate
     * @private
     */
    private lastChipId: number;

    /**
     * Create a chip text area
     *
     * @param props the properties
     */
    public constructor(props: ChipTextAreaProps) {
        super(props);
        this.chipValueExists = props.chipValueExists ? props.chipValueExists.bind(this) : null;
        this.chipTooltipText = props.chipTooltipText;
        this.currentChipValues = [];
        this.lastChipId = 0;

        this.onInput = this.onInput.bind(this);
    }

    /**
     * Clear the text area
     */
    public clear(): void {
        this.textField.value = "";
        this.currentChipValues = [];

        this.forceUpdate();
    }

    public render(): React.ReactNode {
        // The style for the main element
        const style: MDCCSSProperties = {
            marginTop: "20px",
            "--mdc-theme-primary": "#4a6eff",
            width: "100%"
        };

        // The style for the chip container
        const tagChipContainer_style: React.CSSProperties = {
            marginRight: "auto"
        }

        return (
            <label className="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea" style={style}>
                <span className="mdc-notched-outline">
                    <span className="mdc-notched-outline__leading"/>
                    <span className="mdc-notched-outline__notch">
                        <span className="mdc-floating-label text-area-label" id="tag-text-area-label">
                            {this.title}
                        </span>
                    </span>
                    <span className="mdc-notched-outline__trailing"/>
                </span>
                <div style={tagChipContainer_style}>
                    {this.generateChips()}
                </div>
                <textarea className="mdc-text-field__input" rows={1} cols={40} aria-label="tag-text-area-label"
                          onInput={this.onInput}/>
            </label>
        );
    }

    public componentDidMount(): void {
        this.$this = ReactDOM.findDOMNode(this) as HTMLLabelElement;
        this.textField = new MDCTextField(this.$this);

        if (this.value) {
            this.textField.value = this.value;
        }

        this.$this.addEventListener('focusout', () => {
            if (this.currentChipValues.length > 0 && this.textField.value.length === 0) {
                this.textField.value = " ";
            }
        });

        this.$this.addEventListener('focusin', () => {
            if (this.textField.value === " ") {
                this.textField.value = "";
            }
        });
    }

    /**
     * The function to be called on input
     *
     * @param event the input event
     * @private
     */
    protected onInput(event: any): void {
        const inputEvent = event.nativeEvent as InputEvent;

        // Check if enter was pressed
        if (inputEvent.data === null && (inputEvent.inputType === "insertLineBreak" || inputEvent.inputType === "insertText")) {
            const tags: string[] = this.getTextFieldValues();
            for (let i = 0; i < tags.length; i++) {
                // Push all unique values to this.currentChipValues
                if (tags[i].length > 0 && this.currentChipValues.indexOf(tags[i]) === -1) {
                    this.currentChipValues.push(tags[i]);
                }
            }

            // Clear the text field and update
            this.textField.value = "";
            this.forceUpdate();
            this.componentDidMount();
        }

        if (this.inputListener) {
            this.inputListener();
        }
    }

    /**
     * Generate the chips
     *
     * @return the generated chips node
     * @private
     */
    private generateChips(): React.ReactNode {
        return (
            this.currentChipValues.map((tag: string) => {
                // Get the chip id
                const id: string = 'chip-text-area-input-chip-' + this.lastChipId++;
                return <InputChip text={tag} parent={this} key={id} id={id} chipValueExists={this.chipValueExists}
                                  tooltipText={this.chipTooltipText}/>
            })
        );
    }
}

export interface TextAreaWithAutoCompletePropsBase {
    // A function to get the auto complete options
    getAutoCompleteOptions: getAutoCompleteOptions_t;

    // The title of the text area
    title: string;

    // The value of the text field to set when it is first created
    value?: string;
}

abstract class TextAreaWithAutoCompleteBase<T extends TextArea, P extends TextAreaWithAutoCompletePropsBase> extends React.Component<P> {
    /**
     * The HTML element created by this class
     */
    public $this: HTMLDivElement;

    /**
     * The actual text area
     */
    public textArea: T;

    /**
     * The auto complete suggestion element
     */
    public autoComplete: TextFieldAutoComplete;

    /**
     * The function to get the auto complete options
     * @protected
     */
    protected readonly getAutoCompleteOptions: getAutoCompleteOptions_t;

    /**
     * The title of the text area
     * @protected
     */
    protected readonly title: string;

    /**
     * The value to set the text field to when it is first created
     * @protected
     */
    protected readonly _value: string;

    /**
     * Create a text area
     *
     * @param props the properties
     */
    protected constructor(props: P) {
        super(props);

        this.textArea = null;
        this.autoComplete = null;
        this.$this = null;

        this.getAutoCompleteOptions = props.getAutoCompleteOptions.bind(this);
        this.title = props.title;
        this._value = props.value;
    }

    public get value(): string {
        return this.textArea.textField.value;
    }

    abstract render(): React.ReactNode;
}

export class TextAreaWithAutoComplete extends TextAreaWithAutoCompleteBase<TextArea, TextAreaWithAutoCompletePropsBase> {
    /**
     * Create a text area
     *
     * @param props the properties
     */
    public constructor(props: TextAreaWithAutoCompletePropsBase) {
        super(props);

        this.onAutoCompleteOptionClick = this.onAutoCompleteOptionClick.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-menu-surface--anchor">
                <TextArea ref={e => super.textArea = e} title={this.title} value={this._value}/>
                <TextFieldAutoComplete getAutoCompleteOptions={this.getAutoCompleteOptions} parent={this}
                                       ref={e => this.autoComplete = e} onClick={this.onAutoCompleteOptionClick}/>
            </div>
        );
    }

    protected onAutoCompleteOptionClick(option: string): void {
        this.autoComplete.hide();
        this.textArea.textField.value = option;
    }
}

/**
 * Properties for a {@link ChipTextAreaWithAutoComplete}
 */
export interface ChipTextAreaWithAutoCompleteProps extends TextAreaWithAutoCompletePropsBase {
    // A function to check if a chip value exists
    chipValueExists?: ChipValueExists_t

    // The tooltip for a chip if the value does not exist
    chipTooltipText?: string
}

/**
 * A chip text area with autocomplete suggestions
 */
export class ChipTextAreaWithAutoComplete extends TextAreaWithAutoCompleteBase<ChipTextArea, ChipTextAreaWithAutoCompleteProps> {
    /**
     * The function to check if a chip value exists
     * @private
     */
    private readonly chipValueExists: ChipValueExists_t;

    /**
     * The tooltip for a chip if the value does not exist
     * @private
     */
    private readonly chipTooltipText: string;

    /**
     * Create the chip text area with autocomplete suggestions
     *
     * @param props the properties
     */
    public constructor(props: ChipTextAreaWithAutoCompleteProps) {
        super(props);
        this.chipValueExists = props.chipValueExists ? props.chipValueExists.bind(this) : null;
        this.chipTooltipText = props.chipTooltipText;

        this.onAutoCompleteOptionClick = this.onAutoCompleteOptionClick.bind(this);
    }

    /**
     * Get the chip values
     *
     * @return the chip values
     */
    public get chipValues(): string[] {
        return this.textArea.currentChipValues;
    }

    /**
     * Set the chip values
     *
     * @param values the chip values to set
     */
    public set chipValues(values: string[]) {
        this.textArea.currentChipValues = values;
        this.forceUpdate();
    }

    /**
     * Clear the text field
     */
    public clear(): void {
        this.$this = null;

        this.autoComplete.hide();
        this.textArea.clear();
        this.forceUpdate();
        this.componentDidMount();
    }

    public render(): React.ReactNode {
        return (
            <div className="mdc-menu-surface--anchor">
                <ChipTextArea ref={e => super.textArea = e} chipValueExists={this.chipValueExists}
                              chipTooltipText={this.chipTooltipText} title={this.title} value={this._value}/>
                <TextFieldAutoComplete getAutoCompleteOptions={this.getAutoCompleteOptions} parent={this}
                                       ref={e => this.autoComplete = e} onClick={this.onAutoCompleteOptionClick}/>
            </div>
        );
    }

    public componentDidMount(): void {
        this.$this = ReactDOM.findDOMNode(this) as HTMLDivElement;

        this.textArea.$this.addEventListener('focusin', () => {
            if (this.textArea.textField.value.trim().length > 0) {
                this.autoComplete.show();
            }
        });

        this.textArea.$this.addEventListener('focusout', () => {
            setTimeout(() => {
                this.autoComplete.hide();
            }, 200);
        });
    }

    /**
     * A function to be called when an auto complete option is clicked
     *
     * @param option the selected option
     * @protected
     */
    protected onAutoCompleteOptionClick(option: string): void {
        if (this.chipValues.indexOf(option) === -1) {
            this.chipValues.push(option);
        }

        this.autoComplete.hide();
        this.textArea.textField.value = " ";
        this.forceUpdate();
    }
}
