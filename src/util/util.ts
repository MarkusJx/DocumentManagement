import {exec} from "child_process";
import {DatabaseSetting} from "../settings/recentConnections";
import {
    Action,
    CustomPersistence,
    database,
    MariaDBProvider,
    MySQLProvider,
    PersistenceProvider
} from "../databaseWrapper";
import {AnySettings, DatabaseProvider, SQLiteSettings} from "../pages/DatabaseConfigurator";
import {getLogger} from "log4js";
import {ipcRenderer} from "electron";

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

    public static async getDatabaseManagerFromSettings(settings: DatabaseSetting, action: Action, showSQL: boolean): Promise<database.DatabaseManager> {
        const fromProvider = async (provider: PersistenceProvider): Promise<database.DatabaseManager> => {
            const em = await CustomPersistence.createEntityManager("documents", provider);
            return await database.DatabaseManager.create(em);
        };

        logger.info("Creating a database manager from settings:", settings.provider);

        switch (settings.provider) {
            case DatabaseProvider.SQLite: {
                const setting = settings as SQLiteSettings;
                return await database.createSQLiteDatabaseManager(setting.file, action, showSQL);
            }
            case DatabaseProvider.MariaDB: {
                const setting = settings as AnySettings;
                const provider = await MariaDBProvider.create(setting.url, setting.user, setting.password,
                    action, showSQL);
                return await fromProvider(provider);
            }
            case DatabaseProvider.MySQL: {
                const setting = settings as AnySettings;
                const provider = await MySQLProvider.create(setting.url, setting.user, setting.password,
                    action, showSQL);
                return await fromProvider(provider);
            }
            default:
                logger.error("Invalid database provider supplied:", settings.provider);
                return null;
        }
    }

    public static showNativeErrorDialog(title: string, message: string): void {
        logger.info("Opening a native error dialog");
        ipcRenderer.invoke('show-error-dialog', title, message).then().catch(e => {
            logger.error("An error occurred while opening the native error dialog:", e);
        });
    }
}