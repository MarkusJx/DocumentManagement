import Store from "electron-store";
import crypto from "crypto";

/**
 * A database provider
 */
export enum DatabaseProvider {
    SQLite = "SQLite",
    MariaDB = "MariaDB",
    MySQL = "MySQL"
}

/**
 * General database settings
 */
export interface DatabaseSettings {
    // The selected provider
    provider: DatabaseProvider;
}

/**
 * SQLite database settings
 */
export interface SQLiteSettings extends DatabaseSettings {
    // The selected file
    file: string;
}

/**
 * Settings for any database (not SQLite)
 */
export interface AnySettings extends DatabaseSettings {
    // The connection url
    url: string;
    // The username to use
    user: string;
    // The password to use
    password: string;
}

/**
 * A database setting
 */
export type DatabaseSetting = SQLiteSettings | AnySettings;

/**
 * A recent database setting
 */
export interface RecentDatabase {
    // The id of the setting
    id: string;
    // The local path to the files in the database
    localPath: string;
    // The database setting
    setting: DatabaseSetting;
}

/**
 * The settings interface
 */
export interface Settings {
    // Whether to load the most recent database on startup
    loadRecentOnStartup: boolean;
    // Whether to use the dark theme
    darkTheme: boolean;
    // Whether to log to a file
    logToFile: boolean;
}

/**
 * The default settings
 */
const defaultSettings: Settings = {
    // Don't load the recent database on startup
    loadRecentOnStartup: false,
    // Don't use dark theme
    darkTheme: false,
    // Don't log anything by default
    logToFile: false
};

/**
 * The store type
 */
export interface StoreType {
    // The encryption key to use to encrypt passwords
    encryptionKey: string;
    // The initialization vector to use
    iv: string;
    // The recently used databases
    recents: RecentDatabase[];
    // The id of the last used database
    mostRecent: string;
    // The settings element
    settings: Settings;
    // The path to the jvm
    jmvPath: string;
}

export function createStore(): Store<StoreType> {
    return new Store<StoreType>({
        defaults: {
            encryptionKey: crypto.randomBytes(256).toString('hex'),
            iv: crypto.randomBytes(16).toString('hex'),
            recents: [],
            mostRecent: null,
            settings: defaultSettings,
            jmvPath: null
        }
    });
}