// Import the css associated with this file
import util from "../util/util";
import React from "react";
import {Button, ProgressBar} from "../elements/MDCWrapper";

util.importCss("styles/dialogs/SwipeDialog.css");

/**
 * The sync dialog title properties
 */
interface SwipeDialogTitleProps {
    // The (actual) swipe dialog title
    title: string;
}

/**
 * The sync dialog title state
 */
interface SwipeDialogTitleState {
    // The (actual) swipe dialog title
    title: string;
}

/**
 * The sync dialog title element
 */
class SwipeDialogTitle extends React.Component<SwipeDialogTitleProps, SwipeDialogTitleState> {
    /**
     * Create the sync dialog title
     *
     * @param props the properties
     */
    public constructor(props: SwipeDialogTitleProps) {
        super(props);

        this.state = {
            title: props.title
        };
    }

    /**
     * Set the title
     *
     * @param title the new title
     */
    public set title(title: string) {
        this.setState({
            title: title
        });
    }

    public render(): React.ReactNode {
        return (
            <h1 className="swipe-dialog__title">
                {this.state.title}
            </h1>
        );
    }
}

interface SwipeDialogSwipeElementProps {
    title?: string;
}

/**
 * A swipe dialog swipe element
 */
export class SwipeDialogSwipeElement extends React.Component<SwipeDialogSwipeElementProps> {
    /**
     * The actual html element
     * @private
     */
    private element: HTMLElement = null;

    public get title(): string | undefined {
        return this.props.title;
    }

    /**
     * Reset the position of the element
     */
    public reset(): void {
        this.element.classList.remove("centered", "left");
    }

    /**
     * Make this element the start page
     */
    public makeStartPage(): void {
        this.element.classList.add("start-page");
    }

    /**
     * Swipe this element to the left
     */
    public swipeLeft(): void {
        this.element.classList.add("left");
        this.element.classList.remove("centered", "start-page");
    }

    /**
     * Make this element the centered one
     */
    public center(): void {
        this.element.classList.add("centered");
    }

    public render(): React.ReactNode {
        return (
            <div className="swipe-dialog__swipe-element" ref={e => this.element = e}>
                {this.props.children}
            </div>
        );
    }
}

/**
 * The swipe dialog properties
 */
interface SwipeDialogProps {
    // The title to begin with
    startTitle: string;
    // The content pages
    contentPages: SwipeDialogSwipeElement[];
    // Called when the continue button was pressed
    onContinue?: () => void;
}

/**
 * A dialog with elements that can be swiped to the left
 */
export class SwipeDialog extends React.Component<SwipeDialogProps> {
    /**
     * The top progress bar
     */
    public progressBar: ProgressBar = null;

    /**
     * Whether the element is visible
     */
    public visible: boolean = false;

    /**
     * The actual html element
     */
    public element: HTMLElement = null;

    /**
     * The current page number
     */
    public currentPage: number = 0;

    /**
     * The continue button
     */
    public continueButton: Button = null;

    /**
     * The cancel button
     */
    public cancelButton: Button = null;

    /**
     * The sync dialog title
     */
    public title: SwipeDialogTitle = null;

    /**
     * Create a swipe dialog
     *
     * @param props the properties
     */
    public constructor(props: SwipeDialogProps) {
        super(props);

        this.onContinue = this.onContinue.bind(this);
        this.onCancel = this.onCancel.bind(this);
    }

    /**
     * Set the continue button text
     *
     * @param text the new continue button text
     */
    public set continueButtonText(text: string) {
        this.continueButton.title = text;
    }

    public render(): React.ReactNode {
        return (
            <div className="swipe-dialog__background" ref={e => this.element = e}>
                <div className="swipe-dialog__dialog">
                    <div className="swipe-dialog__dialog-top-bar">
                        <ProgressBar ref={e => this.progressBar = e} style={{"--mdc-theme-primary": '#00d8b4'}}/>
                        <SwipeDialogTitle title={this.props.startTitle} ref={e => this.title = e}/>
                    </div>

                    <div className="swipe-dialog__content">
                        {this.props.children}
                    </div>

                    <div className="swipe-dialog__actions">
                        <Button text="Cancel" onClick={this.onCancel} ref={e => this.cancelButton = e}/>
                        <Button text="Next" onClick={this.onContinue} ref={e => this.continueButton = e}/>
                    </div>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.progressBar.progressBar.determinate = true;
        this.progressBar.progressBar.progress = 0;
    }

    /**
     * Show the swipe dialog
     */
    public show(): void {
        this.props.contentPages.forEach(e => e.reset());
        this.props.contentPages[0].makeStartPage();
        this.title.title = this.props.startTitle;

        this.currentPage = 0;
        this.progressBar.progressBar.progress = 0;
        this.progressBar.progressBar.determinate = true;
        this.continueButtonText = "Next";

        if (!this.visible) {
            this.visible = true;
            this.element.classList.add("visible");
            this.element.classList.remove("hidden");
        }

        this.continueButton.enabled = true;
        this.cancelButton.enabled = true;
    }

    /**
     * Hide the swipe dialog
     */
    public hide(): void {
        if (this.visible) {
            this.visible = false;
            this.element.classList.remove("visible");
            this.element.classList.add("hidden");
            setTimeout(() => {
                this.element.classList.remove("hidden");
            }, 125);
        }
    }

    /**
     * Called when the continue button is pressed
     */
    public onContinue(): void {
        if ((this.currentPage + 1) < this.props.contentPages.length) {
            this.props.contentPages[this.currentPage].swipeLeft();
            this.currentPage++;
            this.props.contentPages[this.currentPage].center();

            if (this.props.contentPages[this.currentPage].title != undefined) {
                this.title.title = this.props.contentPages[this.currentPage].title;
            }
        }

        this.progressBar.progressBar.progress = this.currentPage / (this.props.contentPages.length - 1);
        if (this.props.onContinue) {
            this.props.onContinue();
        }
    }

    /**
     * Called when the cancel button is pressed
     * @private
     */
    private onCancel(): void {
        this.hide();
    }
}