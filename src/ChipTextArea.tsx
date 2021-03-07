import React from "react";
import * as ReactDOM from "react-dom";

import {MDCChip} from "@material/chips";
import {MDCTextField} from "@material/textfield";

class InputChip extends React.Component {
    readonly text: string;
    readonly parent: ChipTextArea;
    chip: MDCChip;

    constructor(props: any) {
        super(props);
        this.text = props.text;
        this.parent = props.parent;

        this.chip = null;

        this.onDelete = this.onDelete.bind(this);
    }

    onDelete(): void {
        this.parent.currentTags.splice(this.parent.currentTags.indexOf(this.text), 1);
        this.chip.destroy();

        this.parent.forceUpdate();
    }

    render(): React.ReactNode {
        const style: React.CSSProperties = {
            marginRight: "5px",
            marginLeft: "5px",
            marginTop: "10px"
        }

        return (
            <div className="mdc-chip" role="row" style={style}>
                <div className="mdc-chip__ripple"/>
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

    componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        this.chip = new MDCChip($this);
    }
}

export class ChipTextArea extends React.Component {
    textField: MDCTextField;
    currentTags: string[];
    lastChipId: number;

    constructor(props: any) {
        super(props);
        this.textField = null;
        this.currentTags = [];
        this.lastChipId = 0;

        this.onInput = this.onInput.bind(this);
    }

    onInput(event: any): void {
        const inputEvent = event.nativeEvent as InputEvent;
        if (inputEvent.data === ' ' || (inputEvent.data === null && (inputEvent.inputType === "insertLineBreak" || inputEvent.inputType === "insertText"))) {
            const tags: string[] = this.textField.value.split(/[\n|\s]+/gi);
            for (let i = 0; i < tags.length; i++) {
                if (tags[i].length > 0 && this.currentTags.indexOf(tags[i]) === -1) {
                    this.currentTags.push(tags[i]);
                }
            }

            this.textField.value = "";
            this.forceUpdate();
            this.componentDidMount();
        }
    }

    generateTagItems(): React.ReactNode {
        return this.currentTags.map(tag => React.createElement(InputChip, {
            text: tag,
            parent: this,
            key: String(this.lastChipId++)
        }, null));
    }

    render(): React.ReactNode {
        const style: React.CSSProperties = {
            marginTop: "20px",
            // @ts-ignore
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
                {
                    // @ts-ignore
                    <textarea className="mdc-text-field__input" rows="1" cols="40" aria-label="tag-text-area-label"
                        // @ts-ignore
                              onInput={this.onInput}/>
                }
            </label>
        );
    }

    componentDidMount(): void {
        const $this = ReactDOM.findDOMNode(this) as Element;
        this.textField = new MDCTextField($this);

        $this.addEventListener('focusout', () => {
            if (this.currentTags.length > 0 && this.textField.value.length === 0) {
                this.textField.value = " ";
            }
        });

        $this.addEventListener('focusin', () => {
            if (this.textField.value === " ") {
                this.textField.value = "";
            }
        });
    }
}