import React from "react";

import {database} from "../databaseWrapper";
import {ChipTextAreaWithAutoComplete} from "../elements/ChipTextArea";
import {PropertySetter} from "../elements/PropertyField";
import constants from "../util/constants";
import {DateTextField} from "../elements/DateTextField";
import {Dialog} from "../elements/MDCWrapper";
import {showErrorDialog} from "./ErrorDialog";
import {getLogger} from "log4js";
import ReactDOM from "react-dom";
import FileInfo from "../elements/FileInfo";
import javaTypes from "../javaTypes";
import BackStack from "../util/BackStack";

const logger = getLogger();

let instance: FileEditorElement = null;

/**
 * The file editor
 */
export default class FileEditor {
    /**
     * Open the file editor
     *
     * @param document the document to edit
     */
    public static open(document: database.Document): void {
        instance.open(document);
    }
}

/**
 * The file editor element
 */
class FileEditorElement extends React.Component {
    /**
     * The chip text area for entering the tags
     * @private
     */
    private chipTextArea: ChipTextAreaWithAutoComplete;

    /**
     * The currently edited document
     * @private
     */
    private currentDocument: database.Document;

    /**
     * The element for setting the properties
     * @private
     */
    private propertySetter: PropertySetter;

    /**
     * The date text field for setting the creation date
     * @private
     */
    private dateTextField: DateTextField;

    /**
     * The dialog everything is displayed in
     * @private
     */
    private dialog: Dialog;

    /**
     * The file info
     * @private
     */
    private fileInfo: FileInfo = null;

    /**
     * Create a file editor instance
     *
     * @param props the props
     */
    public constructor(props: {}) {
        super(props);
        this.dialog = null;
        this.currentDocument = null;
        this.propertySetter = null;
        this.chipTextArea = null;
    }

    /**
     * Get the auto complete options for the tag text field
     *
     * @param val the value of the text field
     * @return the auto complete options
     * @private
     */
    private static getAutoCompleteOptions(val: string): string[] {
        try {
            const tags: database.Tag[] = constants.databaseManager.getTagsLikeSync(val).toArraySync();
            return tags.map(t => t.name);
        } catch (e) {
            logger.error("An error occurred while trying to get the tag auto complete options:", e);
            return [];
        }
    }

    public componentDidMount(): void {
        // Listen for the dialog closing event
        this.dialog.listen('MDCDialog:closing', async (event: CustomEvent<{ action: string }>) => {
            BackStack.enabled = true;
            try {
                if (event.detail.action === "accept") {
                    // Set the main data table to loading
                    constants.mainDataTable.setLoading(true);

                    // Get the values
                    const tags: database.Tag[] = this.chipTextArea.chipValues.map(value => new database.Tag(value));
                    const properties: javaTypes.List<database.PropertyValueSet> = this.propertySetter.propertyValues;
                    const date: Date = this.dateTextField.value;

                    const props: database.PropertyValueSet[] = [];
                    for (let i = 0; i < properties.sizeSync(); i++) {
                        props.push(properties.getSync(i));
                    }

                    // Persist the values
                    await this.currentDocument.setTags(tags, constants.databaseManager, false);
                    await this.currentDocument.setProperties(props, constants.databaseManager, date == null);
                    if (date != null) {
                        await this.currentDocument.setDate(date, constants.databaseManager, true);
                    }

                    // Set the main table to not loading anymore
                    constants.mainDataTable.setLoading(false);
                }

                // Clear all text areas
                this.chipTextArea.clear();
                this.propertySetter.clear();
            } catch (e) {
                showErrorDialog("An error occurred while saving the properties", e.message);
                logger.error("An error occurred while closing the file editor:", e);
            }
        });
    }

    /**
     * Open the file editor
     *
     * @param document the document to edit
     */
    public open(document: database.Document): void {
        BackStack.enabled = false;
        this.currentDocument = document;
        this.fileInfo.document = document;

        const tags: string[] = [];
        for (let i = 0; i < this.currentDocument.tags.sizeSync(); i++) {
            tags.push(this.currentDocument.tags.getSync(i).name);
        }

        this.chipTextArea.chipValues = tags;
        this.propertySetter.propertyValues = this.currentDocument.properties;
        this.dateTextField.value = this.currentDocument.creationDate;

        this.dialog.open();
    }

    /**
     * Check if a tag chip value exists
     *
     * @param value the value to search for
     * @return true if the tag exists
     * @private
     */
    private static chipValueExists(value: string): boolean {
        try {
            return constants.databaseManager.tagExistsSync(value);
        } catch (e) {
            logger.error("An error occurred while checking if a chip value exists:", e);
            return false;
        }
    }

    public render(): React.ReactNode {
        const contentStyle: React.CSSProperties = {
            overflow: 'visible'
        }

        return (
            <Dialog titleId={"file-editor-dialog-title"} contentId={"file-editor-dialog-content"}
                    title={"Edit file properties"} contentStyle={contentStyle} ref={e => this.dialog = e}>
                <FileInfo ref={e => this.fileInfo = e}/>
                <ChipTextAreaWithAutoComplete getAutoCompleteOptions={FileEditorElement.getAutoCompleteOptions}
                                              ref={e => this.chipTextArea = e}
                                              chipValueExists={FileEditorElement.chipValueExists}
                                              chipTooltipText="This tag does not exist. It will be created on committing."
                                              title={"Select tags"}/>

                <PropertySetter ref={e => this.propertySetter = e}/>
                <div className="file-editor-creation-date-container">
                    <div>
                        Creation date:
                    </div>
                    <DateTextField ref={e => this.dateTextField = e}/>
                </div>
            </Dialog>
        );
    }
}

window.addEventListener('DOMContentLoaded', () => {
    logger.info("Initializing file editor");
    try {
        ReactDOM.render(
            <FileEditorElement ref={e => instance = e}/>,
            document.getElementById('file-editor-dialog-container')
        );
    } catch (e) {
        logger.error("Error while initializing the file editor:", e);
    }
});