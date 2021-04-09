import crypto from "crypto";
import Store from "electron-store";
import {AnySettings, DatabaseProvider, SQLiteSettings} from "../pages/DatabaseConfigurator";
import {decryptPassword, encryptPassword} from "./passwordEncryption";

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
 * The store type
 */
interface StoreType {
    // The encryption key to use to encrypt passwords
    encryptionKey: Buffer;
    // The initialization vector to use
    iv: Buffer;
    // The recently used databases
    recents: RecentDatabase[];
}

/**
 * Generate a unique id.
 * Source: https://learnersbucket.com/examples/javascript/unique-id-generator-in-javascript/
 *
 * @returns the uid in the format 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
 */
function generateUid(): string {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export class Recents {
    /**
     * The store used to store all data
     * @private
     */
    private static readonly store = new Store<StoreType>({
        defaults: {
            encryptionKey: crypto.randomBytes(256),
            iv: crypto.randomBytes(16),
            recents: []
        }
    });

    /**
     * Get the encryption key
     *
     * @return the encryption key
     */
    public static get encryptionKey(): Buffer {
        return Recents.store.get('encryptionKey');
    }

    /**
     * Get the initialization vector
     *
     * @return the stored iv
     */
    public static get iv(): Buffer {
        return Recents.store.get('iv');
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
     * @return true if the setting is contained in the settings
     */
    public static async containsSetting(setting: DatabaseSetting): Promise<boolean> {
        if (setting.provider == DatabaseProvider.SQLite) {
            const _setting = setting as SQLiteSettings;
            return Recents.recents.some((value: RecentDatabase) => {
                if (value.setting.provider == DatabaseProvider.SQLite) {
                    const val = value.setting as SQLiteSettings;
                    return val.file == _setting.file;
                } else {
                    return false;
                }
            });
        } else {
            const _setting = setting as AnySettings;
            const recents = Recents.recents;
            for (let i: number = 0; i < recents.length; i++) {
                let value = recents[i].setting as AnySettings;
                if (value.provider != DatabaseProvider.SQLite) {
                    value = await Recents.decryptSetting(value);
                    if (value.url == _setting.url && value.user == _setting.user && value.password == _setting.password) {
                        return true;
                    }
                }
            }

            return false;
        }
    }

    /**
     * Add a setting to the settings
     *
     * @param value the setting to add
     * @return the generated id
     */
    public static async add(value: DatabaseSetting): Promise<string> {
        const recents: RecentDatabase[] = Recents.recents;
        let id: string = generateUid();
        while (Recents.containsId(id)) {
            id = generateUid();
        }

        if (value.provider != DatabaseProvider.SQLite) {
            value = await Recents.encryptSetting(value as AnySettings);
        }

        recents.push({
            id: id,
            localPath: null,
            setting: value
        });

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
        Recents.recents = Recents.recents.filter(v => v.id == id);
    }
}