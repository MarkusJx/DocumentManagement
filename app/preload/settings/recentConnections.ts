import crypto from "crypto";
import Store from "electron-store";
import {AnySettings, DatabaseProvider, SQLiteSettings} from "../pages/DatabaseConfigurator";
import {decryptPassword, encryptPassword} from "./passwordEncryption";
import {getLogger} from "log4js";
import util from "../util/util";

const logger = getLogger();

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
}

const defaultSettings: Settings = {
    loadRecentOnStartup: false
};

/**
 * The store type
 */
interface StoreType {
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
}

export class Recents {
    /**
     * The store used to store all data
     * @private
     */
    private static readonly store = new Store<StoreType>({
        defaults: {
            encryptionKey: crypto.randomBytes(256).toString('hex'),
            iv: crypto.randomBytes(16).toString('hex'),
            recents: [],
            mostRecent: null,
            settings: defaultSettings
        }
    });

    /**
     * Get the encryption key
     *
     * @return the encryption key
     */
    public static get encryptionKey(): Buffer {
        return Buffer.from(Recents.store.get('encryptionKey'), 'hex');
    }

    /**
     * Get the initialization vector
     *
     * @return the stored iv
     */
    public static get iv(): Buffer {
        return Buffer.from(Recents.store.get('iv'), 'hex');
    }

    /**
     * Get the recently used databases
     *
     * @return the recently used databases
     */
    public static get recents(): RecentDatabase[] {
        return Recents.store.get('recents');
    }

    /**
     * Set the recently used databases
     *
     * @param value the recently used databases to set
     */
    public static set recents(value: RecentDatabase[]) {
        Recents.store.set('recents', value);
    }

    /**
     * Get the settings
     *
     * @return the saved settings
     */
    public static get settings(): Settings {
        return Recents.store.get('settings');
    }

    /**
     * Set the settings
     *
     * @param settings the new settings
     */
    public static set settings(settings: Settings) {
        if (!settings) {
            throw new TypeError("The settings object must not be null");
        }

        Recents.store.set('settings', settings);
    }

    /**
     * Get the id of the most recent used database
     *
     * @return the id
     */
    public static get mostRecentId(): string {
        return Recents.store.get('mostRecent');
    }

    /**
     * Set the id of the most recent used database
     *
     * @param id the new id
     */
    public static set mostRecentId(id: string) {
        logger.info("Setting most recent database setting id:", id);
        if (!id) {
            throw new TypeError("The id must not be null");
        }

        Recents.store.set('mostRecent', id);
    }

    /**
     * Get the most recent used database
     *
     * @return the most recent database setting
     */
    public static async getMostRecent(): Promise<RecentDatabase> {
        if (Recents.mostRecentId) {
            logger.info("Retrieved most recent database setting id:", Recents.mostRecentId);
            return await Recents.get(Recents.mostRecentId);
        } else {
            return null;
        }
    }

    /**
     * Check if the stored database settings contain an id
     *
     * @param id the id to search for
     * @return true if the stored database settings contain the id
     */
    public static containsId(id: string): boolean {
        return Recents.recents.some(val => val.id == id);
    }

    /**
     * Decrypt a setting
     *
     * @param setting the setting to decrypt
     * @return the decrypted setting
     */
    public static async decryptSetting(setting: AnySettings): Promise<AnySettings> {
        return {
            provider: setting.provider,
            url: setting.url,
            user: setting.user,
            password: await decryptPassword(setting.password, Recents.encryptionKey, Recents.iv)
        };
    }

    /**
     * Encrypt a setting
     *
     * @param setting the setting to encrypt
     * @return the encrypted setting
     */
    public static async encryptSetting(setting: AnySettings): Promise<AnySettings> {
        return {
            provider: setting.provider,
            url: setting.url,
            user: setting.user,
            password: await encryptPassword(setting.password, Recents.encryptionKey, Recents.iv)
        };
    }

    /**
     * Check if the database settings contain a setting
     *
     * @param setting the setting to search for
     * @return the id of the setting's id if the setting is contained in the settings
     */
    public static async containsSetting(setting: DatabaseSetting): Promise<string | null> {
        if (setting.provider == DatabaseProvider.SQLite) {
            const _setting = setting as SQLiteSettings;
            const recents = Recents.recents;
            for (let i: number = 0; i < recents.length; i++) {
                const value = recents[i];
                if (value.setting.provider == DatabaseProvider.SQLite) {
                    const val = value.setting as SQLiteSettings;
                    if (val.file == _setting.file) {
                        return value.id;
                    }
                }
            }

            return null;
        } else {
            const _setting = setting as AnySettings;
            const recents = Recents.recents;
            for (let i: number = 0; i < recents.length; i++) {
                let value = recents[i].setting as AnySettings;
                if (value.provider != DatabaseProvider.SQLite) {
                    value = await Recents.decryptSetting(value);
                    if (value.url == _setting.url && value.user == _setting.user && value.password == _setting.password) {
                        return recents[i].id;
                    }
                }
            }

            return null;
        }
    }

    /**
     * Add a setting to the settings
     *
     * @param value the setting to add
     * @return the generated id
     */
    public static async add(value: DatabaseSetting): Promise<string> {
        const retrievedSetting: string = await Recents.containsSetting(value);
        if (retrievedSetting) {
            Recents.mostRecentId = retrievedSetting;
            return retrievedSetting;
        }

        const recents: RecentDatabase[] = Recents.recents;
        let id: string = util.generateUid();
        while (Recents.containsId(id)) {
            id = util.generateUid();
        }

        if (value.provider != DatabaseProvider.SQLite) {
            value = await Recents.encryptSetting(value as AnySettings);
        }

        logger.info("Adding new database setting with id:", id);

        recents.push({
            id: id,
            localPath: null,
            setting: value
        });

        Recents.mostRecentId = id;
        Recents.recents = recents;
        return id;
    }

    /**
     * Get a setting by an id
     *
     * @param id the id to search for
     * @return the setting with the id or null if not found
     */
    public static async get(id: string): Promise<RecentDatabase> {
        const recents: RecentDatabase[] = Recents.recents;
        for (let i = 0; i < recents.length; i++) {
            if (recents[i].id == id) {
                const value = recents[i];
                if (value.setting.provider != DatabaseProvider.SQLite) {
                    value.setting = await Recents.decryptSetting(value.setting as AnySettings);
                }

                return value;
            }
        }

        return null;
    }

    /**
     * Set a setting.
     * Either replaces an old setting or adds a new one if it does not exist.
     *
     * @param value the setting to set
     */
    public static async set(value: RecentDatabase): Promise<void> {
        logger.info("Setting database setting with id:", value.id);
        Recents.delete(value.id);

        const recents: RecentDatabase[] = Recents.recents;
        if (value.setting.provider != DatabaseProvider.SQLite) {
            value.setting = await Recents.encryptSetting(value.setting as AnySettings);
        }

        recents.push(value);
        Recents.recents = recents;
    }

    /**
     * Delete a setting by an id
     *
     * @param id the id of the setting to delete
     */
    public static delete(id: string): void {
        logger.info("Deleting recent database setting with id:", id);
        Recents.recents = Recents.recents.filter(v => v.id != id);
    }
}