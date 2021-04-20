import React from "react";
import ReactDOM from "react-dom";
import {Dialog} from "../elements/MDCWrapper";
import {getLogger} from "log4js";
import {Drawer, DrawerAppContent, DrawerListItem} from "../elements/Drawer";
import path from "path";
import * as fs from "fs";

const logger = getLogger();
const licensePath: string = path.join(__dirname, '..', '..', '..', "licenses");

/**
 * The static instance
 */
let instance: LicenseViewerElement = null;

/**
 * The license viewer
 */
export default class LicenseViewer {
    /**
     * Show the license viewer
     */
    public static open(): void {
        instance.open();
    }
}

/**
 * The license viewer element
 */
class LicenseViewerElement extends React.Component {
    /**
     * The license viewer dialog
     * @private
     */
    private dialog: Dialog = null;

    /**
     * The drawer app content element
     * @private
     */
    private appContent: DrawerAppContent = null;

    /**
     * The drawer in an array
     * @private
     */
    private drawer: Drawer[] = [];

    /**
     * The license element
     * @private
     */
    private licenseElement: HTMLDivElement = null;

    /**
     * Open the license dialog
     */
    public open(): void {
        this.dialog.open();
    }

    public render(): React.ReactNode {
        // The dialog's max width
        const maxWidth: string = "830px";

        // The dialog style
        const dialogStyle: React.CSSProperties = {
            height: '80vh',
            width: '90vw',
            maxWidth: maxWidth
        };

        // The content style
        const contentStyle: React.CSSProperties = {
            padding: 0,
            overflow: 'hidden'
        };

        // The drawer style
        const drawerStyle: React.CSSProperties = {
            width: `min(90vw, ${maxWidth})`,
            borderTopRightRadius: '4px',
            borderTopLeftRadius: '4px'
        };

        // The drawer list container style
        const drawerDrawerStyle: React.CSSProperties = {
            paddingTop: 0,
            overflow: 'hidden'
        }

        // The drawer app content style
        const drawerAppContentStyle: React.CSSProperties = {
            paddingTop: '48px',
            height: 'calc(100% - 32px)'
        };

        // The drawer <main> element style
        const drawerMainStyle: React.CSSProperties = {
            height: '100%'
        };

        // The drawer menu style
        const drawerMenuStyle: React.CSSProperties = {
            paddingBottom: '10px'
        };

        return (
            <Dialog contentId="license-viewer-content" title={null} surfaceStyle={dialogStyle}
                    ref={e => this.dialog = e} hasCancelButton={false} contentStyle={contentStyle}>
                <Drawer title="Licenses" ref={e => this.drawer[0] = e} subtitle="Select a license to view"
                        style={drawerStyle} drawerStyle={drawerDrawerStyle} contentStyle={drawerMenuStyle}>
                    {this.getMainLicenseElement()}
                    <hr className="mdc-list-divider"/>
                    <h6 className="mdc-list-group__subheader">Open-Source licenses</h6>
                    {this.generateListItems()}
                </Drawer>
                <DrawerAppContent ref={e => this.appContent = e} style={drawerAppContentStyle}
                                  mainStyle={drawerMainStyle}>
                    <div className="license-viewer__license-container">
                        <div ref={e => this.licenseElement = e} className="license-viewer__license"/>
                    </div>
                </DrawerAppContent>
            </Dialog>
        );
    }

    public componentDidMount(): void {
        this.drawer[0].topAppBar.setScrollTarget(this.appContent.mainElement);
        this.loadLicense(path.join(licensePath, 'main.txt'), 'DocumentManagement').then(() => {
            logger.info("Main license loaded");
        });
    }

    /**
     * Get the main license element
     *
     * @return the element
     * @private
     */
    private getMainLicenseElement(): React.ReactNode {
        const loadLicense = this.loadLicense.bind(this, path.join(licensePath, 'main.txt'), 'DocumentManagement');
        return (
            <DrawerListItem parent={this.drawer} activated={true} onClick={loadLicense}>
                Main license
            </DrawerListItem>
        );
    }

    /**
     * Generate the drawer list items
     *
     * @return the generated items
     * @private
     */
    private generateListItems(): React.ReactNode[] {
        return fs.readdirSync(licensePath).filter(e => e != "main.txt").map(el => {
            const license = path.join(licensePath, el);
            const loadLicense = this.loadLicense.bind(this, license, el.replace('.txt', ''));

            return (
                <DrawerListItem parent={this.drawer} key={license} onClick={loadLicense}>
                    {el.replace('.txt', '')}
                </DrawerListItem>
            );
        });
    }

    /**
     * Load a license
     *
     * @param loadPath the path of the license file to load
     * @param licenseName the name of the license to load
     * @private
     */
    private async loadLicense(loadPath: string, licenseName: string): Promise<void> {
        this.drawer[0].titleElement.innerText = `View ${licenseName}'s License`;
        this.licenseElement.innerText = await new Promise<string>(resolve => {
            fs.readFile(loadPath, {encoding: 'utf-8'}, (err, data) => {
                if (err) {
                    logger.error("Could not load the license:", err);
                } else {
                    resolve(data);
                }
            });
        });
    }
}

// Render the license viewer
window.addEventListener('DOMContentLoaded', () => {
    logger.info("Rendering the license viewer");
    try {
        ReactDOM.render(
            <LicenseViewerElement ref={e => instance = e}/>,
            document.getElementById('license-dialog-container')
        );
    } catch (e) {
        logger.error("Could not render the license viewer:", e);
    }
})
