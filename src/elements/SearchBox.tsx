import React from "react";
import {ChipTextAreaWithAutoComplete} from "./ChipTextArea";
import {Button, Checkbox, OutlinedButton, OutlinedTextField} from "./MDCWrapper";
import {database, PropertyMap} from "../databaseWrapper";
import {PropertySetter} from "./PropertyField";
import {DateRangeTextField} from "./DateTextField";
import MDCCSSProperties from "../util/MDCCSSProperties";
import constants from "../util/constants";
import {getLogger} from "log4js";

const logger = getLogger();

/**
 * The search box properties
 */
export interface SearchBoxProps {
    // The database manager
    databaseManager: database.DatabaseManager;
    // The function to be called when the search is started
    searchStart: () => void;
}

/**
 * A search box
 */
export class SearchBox extends React.Component<SearchBoxProps> {
    /**
     * The filename selector text area
     * @private
     */
    private filenameTextArea: OutlinedTextField;

    /**
     * The file name exact match checkbox
     * @private
     */
    private exact_match_checkbox: Checkbox;

    /**
     * The property selector
     * @private
     */
    private propertySetter: PropertySetter;

    /**
     * The tag selector chip text area
     * @private
     */
    private chipTextArea: ChipTextAreaWithAutoComplete;

    /**
     * The element containing the main content
     * @private
     */
    private mainContentElement: HTMLDivElement;

    /**
     * Whether the main content is shown
     * @private
     */
    private mainContentShown: boolean;

    /**
     * The date range selector text field
     * @private
     */
    private dateRangeTextField: DateRangeTextField;

    /**
     * The database manager
     * @private
     */
    private readonly databaseManager: database.DatabaseManager;

    /**
     * The search start button
     * @private
     */
    private startButton: Button;

    /**
     * The search start callback function
     * @private
     */
    private readonly searchStart: () => void;

    /**
     * Create a search box
     *
     * @param props the properties
     */
    public constructor(props: SearchBoxProps) {
        super(props);

        this.databaseManager = props.databaseManager;
        this.searchStart = props.searchStart.bind(this);

        this.filenameTextArea = null;
        this.exact_match_checkbox = null;
        this.propertySetter = null;
        this.chipTextArea = null;
        this.mainContentElement = null;
        this.mainContentShown = false;
        this.dateRangeTextField = null;
        this.startButton = null;

        this.tagExists = this.tagExists.bind(this);
        this.getTagOptions = this.getTagOptions.bind(this);
        this.showHideMainContent = this.showHideMainContent.bind(this);
    }

    /**
     * Set whether the start search button should be enabled
     *
     * @param enabled whether the button should be enabled
     */
    public set startButtonEnabled(enabled: boolean) {
        this.startButton.enabled = enabled;
    }

    /**
     * Get the document filter generated by this search box from the user's inputs
     *
     * @return the generated document filter
     */
    public async getFilter(): Promise<database.DocumentFilter> {
        const filters: database.filters.DocumentFilterBase[] = [];
        if (this.filenameTextArea.value.length > 0) {
            const filename: string = this.filenameTextArea.value;
            const exactMatch: boolean = this.exact_match_checkbox.checked;
            filters.push(await database.filters.FilenameFilter.create(filename, exactMatch));
        }

        if (this.propertySetter.propertyValues.length > 0) {
            const properties: string[] = this.propertySetter.propertyValues
                .flatMap(v => [v.propertyName, v.propertyValue]);

            const map: PropertyMap = PropertyMap.of(...properties);
            filters.push(await database.filters.PropertyFilter.create(map));
        }

        if (this.chipTextArea.chipValues.length > 0) {
            const tags: string[] = this.chipTextArea.chipValues;
            filters.push(await database.filters.TagFilter.create(...tags));
        }

        if (this.dateRangeTextField.value != null) {
            const values: Date[] = this.dateRangeTextField.value;
            filters.push(await database.filters.DateFilter.getByDates(values[0], values[1]));
        }

        return await database.DocumentFilter.create(...filters);
    }

    public render(): React.ReactNode {
        const style: MDCCSSProperties = {
            "--mdc-theme-primary": "#4a6eff",
            padding: "20px"
        };

        const main_content_style: MDCCSSProperties = {
            marginTop: "0",
            display: "none",
            height: "0"
        };

        const exact_match_container_style: React.CSSProperties = {
            display: "grid",
            gridTemplateColumns: "max-content auto"
        };

        const exact_match_text_style: React.CSSProperties = {
            fontFamily: "sans-serif",
            margin: "auto"
        };

        const search_button_style: React.CSSProperties = {
            margin: "20px auto 0 auto"
        };

        const date_range_container_style: React.CSSProperties = {
            display: "grid",
            gridTemplateColumns: "max-content auto",
            columnGap: "10px",
            width: "fit-content",
            margin: "20px auto 0 auto"
        };

        const date_range_text_style: React.CSSProperties = {
            fontFamily: "sans-serif",
            margin: "auto"
        }

        const date_range_style: React.CSSProperties = {
            margin: "auto 0"
        };

        return (
            <div style={style}>
                <Button text={"Show/Hide search"} onClick={this.showHideMainContent}/>
                <div style={main_content_style} ref={e => this.mainContentElement = e}>
                    <OutlinedTextField title={"File name"} ref={e => this.filenameTextArea = e}
                                       labelId={"search-file-name"}/>
                    <div style={exact_match_container_style}>
                        <div style={exact_match_text_style}>
                            Exact match
                        </div>
                        <Checkbox ref={e => this.exact_match_checkbox = e}/>
                    </div>
                    <PropertySetter databaseManager={this.databaseManager} ref={e => this.propertySetter = e}/>
                    <ChipTextAreaWithAutoComplete getAutoCompleteOptions={this.getTagOptions} title={"Select tags"}
                                                  chipValueExists={this.tagExists}
                                                  chipTooltipText={"This tag does not exist. No documents will be found."}
                                                  ref={e => this.chipTextArea = e}/>
                    <div style={date_range_container_style}>
                        <div style={date_range_text_style}>
                            Created between
                        </div>
                        <DateRangeTextField style={date_range_style} ref={e => this.dateRangeTextField = e}/>
                    </div>
                    <OutlinedButton text={"Search"} onClick={this.searchStart} style={search_button_style}
                                    ref={e => this.startButton = e}/>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        constants.searchBox = this;
    }

    public componentWillUnmount(): void {
        constants.searchBox = null;
    }

    /**
     * Show or hide the main content
     * @private
     */
    private showHideMainContent(): void {
        this.mainContentShown = !this.mainContentShown;
        if (this.mainContentShown) {
            this.mainContentElement.style.height = "unset";
            this.mainContentElement.style.marginTop = "20px";
            this.mainContentElement.style.display = "grid";
        } else {
            this.mainContentElement.style.height = "0";
            this.mainContentElement.style.marginTop = "0";
            this.mainContentElement.style.display = "none";
            this.clear();
        }
    }

    /**
     * Clear all fields
     * @private
     */
    private clear(): void {
        this.filenameTextArea.clear();
        this.exact_match_checkbox.checked = false;
        this.propertySetter.clear();
        this.chipTextArea.clear();
        this.dateRangeTextField.value = null;
    }

    /**
     * Check if a tag exists
     *
     * @param value the tag to check
     * @return true if the tag exists
     * @private
     */
    private tagExists(value: string): boolean {
        try {
            return this.databaseManager.tagExists(value);
        } catch (e) {
            logger.error("An error occurred while checking if a tag exists:", e);
            return false;
        }
    }

    /**
     * Get the tag auto complete options
     *
     * @param value the current value
     * @return the tag auto complete options
     * @private
     */
    private getTagOptions(value: string): string[] {
        try {
            return this.databaseManager.getTagsLike(value).map(t => t.name);
        } catch (e) {
            logger.error("An error occurred while getting all tags like a value:", e);
            return [];
        }
    }
}