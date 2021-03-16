import React from "react";
import {ChipTextAreaWithAutoComplete, TextArea} from "./ChipTextArea";
import {Button, Checkbox, OutlinedButton} from "./MDCWrapper";
import {database, PropertyMap} from "./databaseWrapper";
import {PropertySetter} from "./PropertyField";
import {DateRangeTextField} from "./DateTextField";
import MDCCSSProperties from "./MDCCSSProperties";

export interface SearchBoxProps {
    databaseManager: database.DatabaseManager;
    searchStart: () => void;
}

export class SearchBox extends React.Component<SearchBoxProps> {
    private filenameTextArea: TextArea;
    private exact_match_checkbox: Checkbox;
    private propertySetter: PropertySetter;
    private chipTextArea: ChipTextAreaWithAutoComplete;
    private mainContentElement: HTMLDivElement;
    private mainContentShown: boolean;
    private dateRangeTextField: DateRangeTextField;
    private readonly databaseManager: database.DatabaseManager;
    private readonly searchStart: () => void;

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

        this.tagExists = this.tagExists.bind(this);
        this.getTagOptions = this.getTagOptions.bind(this);
        this.showHideMainContent = this.showHideMainContent.bind(this);
    }

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
            display: "grid",
            height: "0",
            transition: "all 0.5s ease-in-out 0s"
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
            marginTop: "20px"
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
                    <TextArea title={"File name"} ref={e => this.filenameTextArea = e}/>
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
                    <OutlinedButton text={"Search"} onClick={this.searchStart} style={search_button_style}/>
                </div>
            </div>
        );
    }

    private showHideMainContent(): void {
        this.mainContentShown = !this.mainContentShown;
        if (this.mainContentShown) {
            this.mainContentElement.style.height = "unset";
            this.mainContentElement.style.marginTop = "20px";

        } else {
            this.mainContentElement.style.height = "0";
            this.mainContentElement.style.marginTop = "0";
        }
    }

    private tagExists(value: string): boolean {
        return this.databaseManager.tagExists(value);
    }

    private getTagOptions(value: string): string[] {
        return this.databaseManager.getTagsLike(value).map(t => t.name);
    }
}