import React from "react";
import {MDCTopAppBar} from "@material/top-app-bar";
import {MDCDrawer} from "@material/drawer";
import {MDCList} from "@material/list";

/**
 * The drawer properties
 */
interface DrawerProps {
    // The drawer title
    title: string;
    // The drawer subtitle
    subtitle: string;
    // The drawer header style
    style?: React.CSSProperties;
    // The drawer style
    drawerStyle?: React.CSSProperties;
    // The drawer content element style
    contentStyle?: React.CSSProperties;
}

/**
 * A mdc drawer
 */
export class Drawer extends React.Component<DrawerProps> {
    /**
     * The drawer top app bar
     */
    public topAppBar: MDCTopAppBar = null;

    /**
     * The mdc drawer object
     */
    public drawer: MDCDrawer = null;

    /**
     * The drawer sidebar list object
     */
    public list: MDCList = null;

    /**
     * The drawer title element
     */
    public titleElement: HTMLElement = null;

    /**
     * The drawer element
     * @private
     */
    private element: HTMLElement = null;

    /**
     * Create a drawer
     *
     * @param props the properties
     */
    public constructor(props: DrawerProps) {
        super(props);

        this.openDrawer = this.openDrawer.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <>
                <header className="mdc-top-app-bar mdc-top-app-bar--dense themed-top-app-bar"
                        ref={e => this.element = e} style={this.props.style}>
                    <div className="mdc-top-app-bar__row">
                        <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
                            <button className="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button"
                                    onClick={this.openDrawer}>
                                menu
                            </button>
                            <span className="mdc-top-app-bar__title" ref={e => this.titleElement = e}>
                                {this.props.title}
                            </span>
                        </section>
                    </div>
                </header>
                <aside className="mdc-drawer mdc-drawer--dismissible mdc-top-app-bar--fixed-adjust themed-drawer-menu"
                       ref={e => this.drawer = new MDCDrawer(e)} style={this.props.drawerStyle}>
                    <div className="mdc-drawer__header">
                        <h3 className="mdc-drawer__title">
                            {this.props.title}
                        </h3>
                        <h6 className="mdc-drawer__subtitle">
                            {this.props.subtitle}
                        </h6>
                    </div>
                    <div className="mdc-drawer__content">
                        <nav className="mdc-list" ref={e => this.list = new MDCList(e)} style={this.props.contentStyle}>
                            {this.props.children}
                        </nav>
                    </div>
                </aside>
            </>
        );
    }

    public componentDidMount(): void {
        this.topAppBar = new MDCTopAppBar(this.element);
        this.list.wrapFocus = true;

        this.topAppBar.listen('MDCTopAppBar:nav', () => {
            this.openDrawer();
        });
    }

    /**
     * Open the drawer
     * @private
     */
    private openDrawer(): void {
        this.drawer.open = !this.drawer.open;
    }
}

/**
 * The drawer app content props
 */
interface DrawerAppContentProps {
    // The drawer app content style
    style?: React.CSSProperties;
    // The main element style
    mainStyle?: React.CSSProperties;
}

/**
 * The drawer app content
 */
export class DrawerAppContent extends React.Component<DrawerAppContentProps> {
    /**
     * The main html element
     */
    public mainElement: HTMLElement = null;

    public render(): React.ReactNode {
        return (
            <div className="mdc-drawer-app-content mdc-top-app-bar--fixed-adjust" style={this.props.style}>
                <main ref={e => this.mainElement = e} style={this.props.mainStyle}>
                    {this.props.children}
                </main>
            </div>
        );
    }
}

/**
 * The drawer list item properties
 */
interface DrawerListItemProps {
    // The drawer. Must be an array as we
    // can't actually pass references in js
    parent: Drawer[];
    // Called when the list item is clicked
    onClick: () => void;
    // Whether this item is activated by default
    activated?: boolean;
}

/**
 * A drawer list item
 */
export class DrawerListItem extends React.Component<DrawerListItemProps> {
    /**
     * The drawer list item html element
     * @private
     */
    private element: HTMLElement = null;

    /**
     * Create a drawer list item
     *
     * @param props the properties
     */
    public constructor(props: DrawerListItemProps) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    /**
     * Set whether this item should be activated
     *
     * @param val true if it should be activated
     */
    public set active(val: boolean) {
        if (val) {
            this.element.classList.add("mdc-list-item--activated");
        } else {
            this.element.classList.remove("mdc-list-item--activated");
        }
    }

    public render(): React.ReactNode {
        return (
            <a className="mdc-list-item" onClick={this.onClick} ref={e => this.element = e}>
                <span className="mdc-list-item__ripple"/>
                <span className="mdc-list-item__text">
                    {this.props.children}
                </span>
            </a>
        );
    }

    public componentDidMount(): void {
        this.active = this.props.activated === true;
    }

    /**
     * Called when the item is clicked
     * @private
     */
    private onClick(): void {
        this.props.onClick();
        this.props.parent[0].drawer.open = false;
    }
}