import {Arrays, database} from "../databaseWrapper";
import React from "react";
import {ChipTextAreaWithAutoComplete} from "../elements/ChipTextArea";
import {PropertySetter} from "../elements/PropertyField";
import {Dialog} from "../elements/MDCWrapper";
import constants from "../util/constants";
import {showErrorDialog} from "./ErrorDialog";
import {getLogger} from "log4js";
import ReactDOM from "react-dom";
import PropertyValueSet = database.PropertyValueSet;

const logger = getLogger();

let instance: MultiFileEditorElement = null;

/**
 * An editor for editing multiple files at once
 */
export default class MultiFileEditor {
    /**
     * Open the editor
     *
     * @param documents the documents to edit
     */
    public static open(documents: database.Document[]): void {
        instance.open(documents);
    }
}

/**
 * The multi file editor element
 */
class MultiFileEditorElement extends React.Component {
    /**
     * The chip text area for entering the tags
     * @private
     */
    private chipTextArea: ChipTextAreaWithAutoComplete = null;

    /**
     * The currently edited document
     * @private
     */
    private currentDocuments: database.Document[] = null;

    /**
     * The element for setting the properties
     * @private
     */
    private propertySetter: PropertySetter = null;

    /**
     * The dialog everything is displayed in
     * @private
     */
    private dialog: Dialog = null;

    /**
     * The previous tags
     * @private
     */
    private prevTags: string[] = [];

    /**
     * The previous properties
     * @private
     */
    private prevProperties: PropertyValueSet[] = [];

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

    public componentDidMount(): void {
        // Listen for the dialog closing event
        this.dialog.listen('MDCDialog:closing', async (event: CustomEvent<{ action: string }>) => {
            try {
                if (event.detail.action === "accept") {
                    // Set the main data table to loading
                    constants.mainDataTable.setLoading(true);

                    // Get the values
                    const tags: database.Tag[] = this.chipTextArea.chipValues.map(value => new database.Tag(value));
                    const properties: database.PropertyValueSet[] = this.propertySetter.propertyValues.toArraySync();

                    function unique<T>(value: T, index: number, self: T[]) {
                        return self.indexOf(value) === index;
                    }

                    // Persist the values
                    await Promise.all(this.currentDocuments.map(d => {
                        const newTags: database.Tag[] = d.tags.toArraySync().filter(f => !this.prevTags.some(t => t == f.name));
                        newTags.push(...tags);
                        return d.setTags(newTags.filter(unique), constants.databaseManager, false);
                    }));

                    await Promise.all(this.currentDocuments.map(d => {
                        let newProps = d.properties.toArraySync().filter(p1 => !this.prevProperties.some(p2 => p1.equalsSync(p2)));
                        newProps.push(...properties);
                        return d.setProperties(newProps.filter(unique), constants.databaseManager, true);
                    }));

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
     * @param documents the documents to edit
     */
    public open(documents: database.Document[]): void {
        this.currentDocuments = documents;

        const tags: string[] = [];
        documents[0].tags.toArraySync().forEach(t1 => {
            if (documents.every(d => d.tags.toArraySync().some(t2 => t2.name == t1.name))) {
                tags.push(t1.name);
            }
        });

        const properties: database.PropertyValueSet[] = [];
        documents[0].properties.toArraySync().forEach(p1 => {
            if (documents.every(d => d.properties.toArraySync().some(p2 => p1.equalsSync(p2)))) {
                properties.push(p1);
            }
        });

        this.prevTags = Array.from(tags);
        this.prevProperties = Array.from(properties);

        this.chipTextArea.chipValues = tags;
        this.propertySetter.propertyValues = Arrays.asListSync(properties);

        this.dialog.open();
    }

    public render(): React.ReactNode {
        const contentStyle: React.CSSProperties = {
            overflow: 'visible'
        }

        return (
            <Dialog titleId={"file-editor-dialog-title"} contentId={"file-editor-dialog-content"}
                    title={"Edit multiple files"} contentStyle={contentStyle} ref={e => this.dialog = e}>
                <ChipTextAreaWithAutoComplete getAutoCompleteOptions={MultiFileEditorElement.getAutoCompleteOptions}
                                              ref={e => this.chipTextArea = e}
                                              chipValueExists={MultiFileEditorElement.chipValueExists}
                                              chipTooltipText="This tag does not exist. It will be created on committing."
                                              title={"Select tags"}/>

                <PropertySetter ref={e => this.propertySetter = e}/>
            </Dialog>
        );
    }
}

window.addEventListener('DOMContentLoaded', () => {
    logger.info("Initializing multi file editor");
    try {
        ReactDOM.render(
            <MultiFileEditorElement ref={e => instance = e}/>,
            document.getElementById('multi-file-editor-dialog-container')
        );
    } catch (e) {
        logger.error("Error while initializing the multi file editor:", e);
    }
});