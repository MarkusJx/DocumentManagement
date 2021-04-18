import {Recents} from "./recentConnections";
import {getLogger} from "log4js";

const logger = getLogger();

/**
 * A class for theming
 */
export default class Theming {
    /**
     * Update the current theme by loading the theme from the settings
     */
    public static updateTheme(): void {
        logger.info("Updating the theme");
        if (Recents.settings.darkTheme) {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }
    }
}