import {exec} from "child_process";
import {
    Action,
    CustomPersistence,
    database,
    Logger,
    MariaDBProvider,
    MySQLProvider,
    PersistenceProvider
} from "../databaseWrapper";
import log4js, {getLogger} from "log4js";
import {ipcRenderer} from "electron";
import fs from "fs";
import {AnySettings, DatabaseProvider, DatabaseSetting, SQLiteSettings} from "../../shared/Settings";
import {Recents} from "../settings/recentConnections";
import constants from "./constants";

const logger = getLogger();

/**
 * Get the command line option to open a file
 * Source: https://stackoverflow.com/a/29917107
 *
 * @return the command line
 */
function getCommandLine(): string {
    switch (process.platform) {
        case 'darwin' :
            return 'open';
        case 'win32' :
            return 'start';
        default :
            return 'xdg-open';
    }
}

/**
 * A utility class
 */
export default class util {
    /**
     * Open a file using the default program
     *
     * @param filePath the path to the file to open
     */
    public static openFileUsingDefaultProgram(filePath: string): void {
        if (process.platform === 'win32') {
            exec(`${getCommandLine()} "${filePath}"`, {
                shell: 'powershell.exe'
            });
        } else {
            exec(`${getCommandLine()} "${filePath}"`);
        }
    }

    /**
     * Check if a file exists
     *
     * @param filePath the path to the file to find
     * @return true if the file exists
     */
    public static fileExists(filePath: string): Promise<boolean> {
        return new Promise(resolve => {
            fs.access(filePath, fs.constants.F_OK, err => {
                resolve(!err);
            });
        });
    }

    /**
     * Get a database manager from database settings
     *
     * @param settings the settings to create the database from
     * @param action the database create action
     * @param showSQL whether to print the generated SQL accounts
     * @param create whether the database should be created
     * @return the created database manager
     */
    public static async getDatabaseManagerFromSettings(settings: DatabaseSetting, action: Action, showSQL: boolean,
                                                       create: boolean = false): Promise<database.DatabaseManager> {
        const fromProvider = async (provider: PersistenceProvider): Promise<database.DatabaseManager> => {
            const em = await CustomPersistence.createEntityManager("documents", provider);
            return database.DatabaseManager.create(em);
        };

        logger.info("Creating a database manager from settings:", settings.provider);

        switch (settings.provider) {
            case DatabaseProvider.SQLite: {
                const setting = settings as SQLiteSettings;
                if (!create && !await util.fileExists(setting.file)) {
                    throw new Error("The database file does not exist");
                }

                return database.createSQLiteDatabaseManager(setting.file, action, showSQL);
            }
            case DatabaseProvider.MariaDB: {
                const setting = settings as AnySettings;
                const provider = await MariaDBProvider.createInstance(setting.url, setting.user, setting.password,
                    action, showSQL, []);
                return fromProvider(provider);
            }
            case DatabaseProvider.MySQL: {
                const setting = settings as AnySettings;
                const provider = await MySQLProvider.createInstance(setting.url, setting.user, setting.password,
                    action, showSQL, []);
                return fromProvider(provider);
            }
            default:
                logger.error("Invalid database provider supplied:", settings.provider);
                return null;
        }
    }

    /**
     * Show an os native error dialog
     *
     * @param title the dialog title
     * @param message the error message
     */
    public static showNativeErrorDialog(title: string, message: string): void {
        logger.info("Opening a native error dialog");
        ipcRenderer.invoke('show-error-dialog', title, message).then().catch(e => {
            logger.error("An error occurred while opening the native error dialog:", e);
        });
    }

    /**
     * Sleep for some time
     *
     * @param ms the number of milliseconds to sleep
     */
    public static sleep(ms: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Generate a unique id.
     * Source: https://learnersbucket.com/examples/javascript/unique-id-generator-in-javascript/
     *
     * @returns the uid in the format 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
     */
    public static generateUid(): string {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    /**
     * Check if a HTML Element is visible.
     * Source: https://stackoverflow.com/a/5354536
     *
     * @param elm the element to check
     * @return true if the element is visible on the screen
     */
    public static checkVisible(elm: HTMLElement): boolean {
        let rect = elm.getBoundingClientRect();
        let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }

    /**
     * Update the logging configuration
     */
    public static updateLogging(): void {
        const shouldLog: boolean = Recents.settings.logToFile;

        const appenders: string[] = [];
        if (shouldLog) {
            appenders.push("app");
        }

        if (constants.LOG_TO_CONSOLE) {
            appenders.push("out");
        }

        if (appenders.length > 0) {
            log4js.configure({
                appenders: {
                    out: {
                        type: 'stdout',
                        layout: {
                            type: 'pattern',
                            pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%f{2}:%l] [%p] %m'
                        }
                    },
                    app: {
                        type: 'file',
                        filename: 'preload.log',
                        layout: {
                            type: 'pattern',
                            pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%f{2}:%l] [%p] %m'
                        },
                        maxLogSize: 50000000
                    }
                },
                categories: {
                    default: {
                        appenders: appenders,
                        level: 'info',
                        enableCallStack: true
                    }
                }
            });
        } else {
            log4js.configure({
                appenders: {
                    out: {
                        type: 'stdout'
                    }
                },
                categories: {
                    default: {
                        appenders: ['out'],
                        level: 'off'
                    }
                }
            });
        }

        Logger.configureLogger(constants.LOG_TO_CONSOLE, shouldLog).then(() => {
            logger.info("Java logger configured");
        }).catch(e => {
            logger.error("Could not configure the java logger:", e);
        });
    }
}