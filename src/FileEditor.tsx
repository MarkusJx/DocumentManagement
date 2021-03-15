import React from "react";
import * as ReactDOM from "react-dom";
import {MDCDialog} from '@material/dialog';

import {database} from "./databaseWrapper";
import {ChipTextAreaWithAutoComplete} from "./ChipTextArea";
import {PropertySetter} from "./PropertyField";
import MDCCSSProperties from "./MDCCSSProperties";
import constants from "./constants";

export type FileEditorProps = {
    databaseManager: database.DatabaseManager
}

export class FileEditor extends React.Component<FileEditorProps> {
    private readonly databaseManager: database.DatabaseManager;
    private chipTextArea: ChipTextAreaWithAutoComplete;
    private currentDocument: database.Document;
    private propertySetter: PropertySetter;
    private dialog: MDCDialog;

    public constructor(props: FileEditorProps) {
        super(props);
        this.dialog = null;
        this.currentDocument = null;
        this.propertySetter = null;
        this.databaseManager = props.databaseManager;
        this.chipTextArea = null;

        this.getAutoCompleteOptions = this.getAutoCompleteOptions.bind(this);
        this.chipValueExists = this.chipValueExists.bind(this);
    }

    public render(): React.ReactNode {
        const style: MDCCSSProperties = {
            "--mdc-theme-primary": '#0033ff'
        };

        const contentStyle: React.CSSProperties = {
            overflow: 'visible'
        }

        return (
            <div className="mdc-dialog" style={style}>
                <div className="mdc-dialog__container">
                    <div className="mdc-dialog__surface" role="alertdialog" aria-modal="true"
                         aria-labelledby="file-editor-dialog-title" aria-describedby="file-editor-dialog-content">
                        <h2 className="mdc-dialog__title" id="file-editor-dialog-title">Edit file properties</h2>
                        <div className="mdc-dialog__content" id="file-editor-dialog-content" style={contentStyle}>
                            <ChipTextAreaWithAutoComplete getAutoCompleteOptions={this.getAutoCompleteOptions}
                                                          ref={e => this.chipTextArea = e}
                                                          chipValueExists={this.chipValueExists}
                                                          chipTooltipText="This tag does not exist. It will be created on committing."
                                                          title={"Select tags"}/>

                            <PropertySetter databaseManager={this.databaseManager} ref={e => this.propertySetter = e}/>
                        </div>
                        <div className="mdc-dialog__actions">
                            <button type="button" className="mdc-button mdc-dialog__button"
                                    data-mdc-dialog-action="cancel">
                                <div className="mdc-button__ripple"/>
                                <span className="mdc-button__label">Cancel</span>
                            </button>
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
        const $this = ReactDOM.findDOMNode(this) as Element;
        this.dialog = new MDCDialog($this);

        this.dialog.listen('MDCDialog:closing', async (event: CustomEvent<{ action: string }>) => {
            if (event.detail.action === "accept") {
                constants.mainDataTable.setLoading(true);
                await this.currentDocument.setTags(this.chipTextArea.chipValues.map(value => new database.Tag(value)));
                await this.currentDocument.setProperties(this.propertySetter.propertyValues);
                constants.mainDataTable.setLoading(false);
            }

            this.chipTextArea.clear();
            this.propertySetter.clear();
        });
    }

    public open(document: database.Document): void {
        this.currentDocument = document;

        this.chipTextArea.chipValues = this.currentDocument.tags.map(tag => tag.name);
        this.propertySetter.propertyValues = this.currentDocument.properties;

        this.dialog.open();
    }

    private getAutoCompleteOptions(val: string): string[] {
        const tags: database.Tag[] = this.databaseManager.getTagsLike(val);
        return tags.map(t => t.name);
    }

    private chipValueExists(value: string): boolean {
        return this.databaseManager.tagExists(value);
    }
}