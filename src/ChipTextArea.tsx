import React from "react";
import * as ReactDOM from "react-dom";

import {MDCChip} from "@material/chips";
import {MDCTextField} from "@material/textfield";
import {MDCRipple} from "@material/ripple";
import {MDCList} from '@material/list';
import {MDCTooltip} from "@material/tooltip";

type ChipValueExists_t = (value: string) => boolean;

type InputChipProps = {
    id: string,
    text: string,
    parent: ChipTextArea,
    tooltipText?: string,
    chipValueExists?: ChipValueExists_t
};

class InputChip extends React.Component<InputChipProps> {
    private readonly chipValueExists: boolean;
    private readonly parent: ChipTextArea;
    private readonly tooltipText: string;
    private readonly text: string;
    private readonly id: string;
    private chip: MDCChip;

    constructor(props: InputChipProps) {
        super(props);
        this.text = props.text;
        this.parent = props.parent;
        this.chip = null;
        this.id = props.id;
        this.tooltipText = props.tooltipText;

        if (props.chipValueExists) {
            this.chipValueExists = props.chipValueExists(this.text);
        } else {
            this.chipValueExists = null;
        }

        this.onDelete = this.onDelete.bind(this);
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
                       onClick={this.onDelete}>
                        cancel
                    </i>
                </span>
            </div>
        );
    }

    public componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        this.chip = new MDCChip($this);

        if (this.chipValueExists != null && !this.chipValueExists) {
            MDCTooltip.attachTo($this.querySelector('.mdc-tooltip--rich'));
        }
    }

    private onDelete(): void {
        this.parent.currentTags.splice(this.parent.currentTags.indexOf(this.text), 1);
        this.chip.destroy();

        this.parent.forceUpdate();
    }

    private getLeadingIcon(): React.ReactNode {
        if (this.chipValueExists != null && !this.chipValueExists) {
            const tooltipId: string = this.id + '-tooltip';
            const tooltipWrapperStyle: React.CSSProperties = {
                width: '20px',
                height: '20px'
            }

            return (
                <div className="mdc-tooltip-wrapper--rich" style={tooltipWrapperStyle}>
                    <i className="material-icons mdc-chip__icon mdc-chip__icon--leading" aria-describedby={tooltipId}>
                        info
                    </i>
                    <div id={tooltipId} className="mdc-tooltip--rich" aria-hidden="true" role="tooltip">
                        <div className="mdc-tooltip__surface">
                            <p className="mdc-tooltip__content">
                                {this.tooltipText}
                            </p>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}

type getAutoCompleteOptions_t = (input: string) => string[];

type TextFieldAutoCompleteProps = {
    getAutoCompleteOptions: getAutoCompleteOptions_t,
    parent: ChipTextAreaWithAutoComplete
};

type MenuItemProps = {
    text: string
};

class TextFieldAutoComplete extends React.Component<TextFieldAutoCompleteProps> {
    protected static readonly MenuItem = class extends React.Component<MenuItemProps> {
        private readonly text: string;

        public constructor(props: MenuItemProps) {
            super(props);
            this.text = props.text;
        }

        public render(): React.ReactNode {
            return (
                <li className="mdc-list-item" role="menuitem">
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
    public $this: HTMLDivElement;
    private readonly getAutoCompleteOptions: getAutoCompleteOptions_t;
    private readonly parent: ChipTextAreaWithAutoComplete;
    private currentKey: number;

    public constructor(props: TextFieldAutoCompleteProps) {
        super(props);
        this.parent = props.parent;
        this.currentKey = 0;
        this.$this = null;

        this.getAutoCompleteOptions = props.getAutoCompleteOptions.bind(this);
    }

    public render(): React.ReactNode {
        const top: string = (this.parent.$this != null) ? this.parent.$this.offsetHeight + 'px' : '76px';

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
    }

    public show(): void {
        this.$this.style.top = (this.parent.$this != null) ? this.parent.$this.offsetHeight + 'px' : '76px'
        this.$this.style.visibility = 'visible';
        this.$this.style.opacity = '1';
    }

    public hide(): void {
        this.$this.style.opacity = '0';
        this.$this.style.visibility = 'hidden';
        this.$this.style.top = '0';
    }

    private generateMenuItems(): React.ReactNode {
        if (this.parent.textArea != null) {
            const options = this.getAutoCompleteOptions(this.parent.textArea.getTextFieldValues()[0]);
            return (
                options.map((option: string, index: number) =>
                    <TextFieldAutoComplete.MenuItem text={option} key={index + '-' + this.currentKey++}/>
                )
            );
        } else {
            return null;
        }
    }
}

export interface MDCCSSProperties extends React.CSSProperties {
    "--mdc-theme-primary": string
}

export type ChipTextAreaProps = {
    onInputCallback: () => void,
    chipValueExists?: ChipValueExists_t,
    chipTooltipText?: string
};

export class ChipTextArea extends React.Component<ChipTextAreaProps> {
    private static readonly textFieldValue_splitter: RegExp = /[\n]+/gi;
    public currentTags: string[];
    public textField: MDCTextField;
    public $this: HTMLLabelElement;
    private readonly chipValueExists: ChipValueExists_t;
    private readonly onInputCallback: () => void;
    private readonly chipTooltipText: string;
    private lastChipId: number;

    public constructor(props: ChipTextAreaProps) {
        super(props);
        this.onInputCallback = props.onInputCallback;
        this.chipValueExists = props.chipValueExists ? props.chipValueExists.bind(this) : null;
        this.chipTooltipText = props.chipTooltipText;
        this.textField = null;
        this.currentTags = [];
        this.lastChipId = 0;
        this.$this = null;

        this.onInput = this.onInput.bind(this);
    }

    public clear(): void {
        this.textField.value = "";
        this.currentTags = [];

        this.forceUpdate();
    }

    public getTextFieldValues(): string[] {
        return this.textField.value.split(ChipTextArea.textFieldValue_splitter).map(s => s.trim());
    }

    public render(): React.ReactNode {
        const style: MDCCSSProperties = {
            marginTop: "20px",
            "--mdc-theme-primary": "#4a6eff"
        };

        const tagChipContainer_style: React.CSSProperties = {
            marginRight: "auto"
        }

        return (
            <label className="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea" style={style}>
                <span className="mdc-notched-outline">
                    <span className="mdc-notched-outline__leading"/>
                    <span className="mdc-notched-outline__notch">
                        <span className="mdc-floating-label text-area-label" id="tag-text-area-label">Select tags</span>
                    </span>
                    <span className="mdc-notched-outline__trailing"/>
                </span>
                <div style={tagChipContainer_style}>
                    {this.generateTagItems()}
                </div>
                <textarea className="mdc-text-field__input" rows={1} cols={40} aria-label="tag-text-area-label"
                          onInput={this.onInput} autoComplete="on"/>
            </label>
        );
    }

    public componentDidMount(): void {
        this.$this = ReactDOM.findDOMNode(this) as HTMLLabelElement;
        this.textField = new MDCTextField(this.$this);

        this.$this.addEventListener('focusout', () => {
            if (this.currentTags.length > 0 && this.textField.value.length === 0) {
                this.textField.value = " ";
            }
        });

        this.$this.addEventListener('focusin', () => {
            if (this.textField.value === " ") {
                this.textField.value = "";
            }
        });
    }

    private onInput(event: any): void {
        const inputEvent = event.nativeEvent as InputEvent;
        if (inputEvent.data === null && (inputEvent.inputType === "insertLineBreak" || inputEvent.inputType === "insertText")) {
            const tags: string[] = this.getTextFieldValues();
            for (let i = 0; i < tags.length; i++) {
                if (tags[i].length > 0 && this.currentTags.indexOf(tags[i]) === -1) {
                    this.currentTags.push(tags[i]);
                }
            }

            this.textField.value = "";
            this.forceUpdate();
            this.componentDidMount();
        }

        this.onInputCallback();
    }

    private generateTagItems(): React.ReactNode {
        const id: string = 'chip-text-area-input-chip-' + this.lastChipId++;

        return (
            this.currentTags.map((tag: string) =>
                <InputChip text={tag} parent={this} key={id} id={id} chipValueExists={this.chipValueExists}
                           tooltipText={this.chipTooltipText}/>
            )
        );
    }
}

export type ChipTextAreaWithAutoCompleteProps = {
    getAutoCompleteOptions: getAutoCompleteOptions_t,
    chipValueExists?: ChipValueExists_t,
    chipTooltipText?: string
};

export class ChipTextAreaWithAutoComplete extends React.Component<ChipTextAreaWithAutoCompleteProps> {
    public textArea: ChipTextArea;
    public autoComplete: TextFieldAutoComplete;
    public $this: HTMLDivElement;
    private readonly getAutoCompleteOptions: getAutoCompleteOptions_t;
    private readonly chipValueExists: ChipValueExists_t;
    private readonly chipTooltipText: string;

    public constructor(props: ChipTextAreaWithAutoCompleteProps) {
        super(props);
        this.getAutoCompleteOptions = props.getAutoCompleteOptions;
        this.chipValueExists = props.chipValueExists ? props.chipValueExists.bind(this) : null;
        this.chipTooltipText = props.chipTooltipText;

        this.textArea = null;
        this.autoComplete = null;
        this.$this = null;

        this.onInput = this.onInput.bind(this);
    }

    public clear(): void {
        this.$this = null;

        this.autoComplete.hide();
        this.textArea.clear();
        this.forceUpdate();
        this.componentDidMount();
    }

    public render() {
        return (
            <div className="mdc-menu-surface--anchor">
                <ChipTextArea ref={e => this.textArea = e} onInputCallback={this.onInput}
                              chipValueExists={this.chipValueExists} chipTooltipText={this.chipTooltipText}/>
                <TextFieldAutoComplete getAutoCompleteOptions={this.getAutoCompleteOptions} parent={this}
                                       ref={e => this.autoComplete = e}/>
            </div>
        );
    }

    public componentDidMount() {
        this.$this = ReactDOM.findDOMNode(this) as HTMLDivElement;

        this.textArea.$this.addEventListener('focusin', () => {
            if (this.textArea.textField.value.trim().length > 0) {
                this.autoComplete.show();
            }
        });

        this.textArea.$this.addEventListener('focusout', () => {
            this.autoComplete.hide();
        });
    }

    private onInput(): void {
        if (this.textArea.textField.value.trim().length > 0) {
            this.autoComplete.forceUpdate();
            this.autoComplete.componentDidMount();
            this.autoComplete.show();
        } else {
            this.autoComplete.hide();
        }
    }
}
