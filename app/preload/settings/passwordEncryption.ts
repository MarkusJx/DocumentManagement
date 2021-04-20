import crypto from "crypto";
import CloseListener from "../util/CloseListener";
import {getLogger} from "log4js";

const logger = getLogger();

/**
 * The passport account id
 */
const PASSPORT_ACCOUNT_ID: string = "io.github.markusjx.documentManagement";

/**
 * The password encryption algorithm
 */
const ENCRYPTION_ALGORITHM = 'aes-256-ctr';

/**
 * The timeout after which to clear the encryption key
 */
const CLEAR_KEY_TIMEOUT: number = 5 * 60 * 1000;

/**
 * The key to encrypt/decrypt data
 */
let encryptKey: Buffer = null;

/**
 * The timeout which clears the encryption key
 */
let clearKeyTimeout: NodeJS.Timeout = null;

// Clear the key buffer on unload
CloseListener.listen(async () => {
    if (encryptKey) {
        encryptKey.fill(0);
        encryptKey = null;
    }
});

/**
 * Reset the encryption key clear timeout
 */
function resetClearKeyTimeout(): void {
    if (clearKeyTimeout != null) {
        clearTimeout(clearKeyTimeout);
    }

    clearKeyTimeout = setTimeout(() => {
        try {
            if (encryptKey) {
                logger.info("Clearing the encryption key buffer");
                encryptKey.fill(0);
                encryptKey = null;
            }
        } catch (e) {
            logger.error("An error occurred while clearing the encryption key buffer:", e);
        }

        clearKeyTimeout = null;
    }, CLEAR_KEY_TIMEOUT);
}

/**
 * Encrypt a string.
 * Requires encryptKey not to be null.
 *
 * @param str the string to encrypt
 * @param iv the initialization vector to use
 * @return the encrypted string
 */
function encryptString(str: string, iv: Buffer): string {
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, encryptKey, iv);
    const encrypted = Buffer.concat([cipher.update(Buffer.from(str, 'utf-8')), cipher.final()]);

    return encrypted.toString('hex');
}

/**
 * Decrypt a string.
 * Requires encryptKey not to be null.
 *
 * @param str the string to decrypt
 * @param iv the initialization vector to use
 * @return the decrypted string
 */
function decryptString(str: string, iv: Buffer): string {
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, encryptKey, iv);
    const decrypted = Buffer.concat([cipher.update(Buffer.from(str, 'hex')), cipher.final()]);

    return decrypted.toString('utf-8');
}

/**
 * Update the encryption key using ms passport
 *
 * @param encryptionKey the encryption key to sign
 */
async function win32_updatePassport(encryptionKey: Buffer): Promise<void> {
    logger.info("Updating the encryption key");
    // @ts-ignore
    const {passport} = await import("node-ms-passport");
    if (!encryptKey) {
        const account = new passport(PASSPORT_ACCOUNT_ID);
        if (!account.accountExists) {
            await account.createPassportKey();
        }

        // Sign the encryption key and hash it to get it to a proper length
        const signed: Buffer = await account.passportSign(encryptionKey);
        encryptKey = crypto.createHash('sha256').update(signed).digest();
    }
}

/**
 * Some encryption strategies
 */
const encryptionStrategies = {
    /**
     * The windows encryption strategy
     *
     * @param password the password to encrypt
     * @param encryptionKey the key to use to encrypt the key
     * @param iv the initialization vector to use
     * @return the encrypted password
     */
    "win32": async function (password: string, encryptionKey: Buffer, iv: Buffer): Promise<string> {
        // @ts-ignore
        let passport: typeof import("node-ms-passport").passport = null;
        try {
            // @ts-ignore
            passport = (await import("node-ms-passport")).passport;
        } catch (e) {
            logger.error("An error occurred while trying to import node-ms-passport:", e);
            return password;
        }

        if (passport.passportAvailable()) {
            await win32_updatePassport(encryptionKey);

            resetClearKeyTimeout();
            return encryptString(password, iv);
        } else {
            return password;
        }
    }
};

/**
 * Some decryption strategies
 */
const decryptionStrategies = {
    /**
     * The windows decryption strategy
     *
     * @param password the password to decrypt
     * @param encryptionKey the key to use to decrypt the key
     * @param iv the initialization vector to use
     * @return the decrypted password
     */
    "win32": async function (password: string, encryptionKey: Buffer, iv: Buffer): Promise<string> {
        // @ts-ignore
        let passport: typeof import("node-ms-passport").passport = null;
        try {
            // @ts-ignore
            passport = (await import("node-ms-passport")).passport;
        } catch (e) {
            logger.error("An error occurred while trying to import node-ms-passport:", e);
            return password;
        }

        if (passport.passportAvailable()) {
            await win32_updatePassport(encryptionKey);

            resetClearKeyTimeout();
            return decryptString(password, iv);
        } else {
            return password;
        }
    }
};

/**
 * Encrypt a password
 *
 * @param password the password to encrypt
 * @param encryptionKey the key to use to encrypt the key
 * @param iv the initialization vector to use
 * @return the encrypted password
 */
export async function encryptPassword(password: string, encryptionKey: Buffer, iv: Buffer): Promise<string> {
    if (encryptionStrategies.hasOwnProperty(process.platform)) {
        return await encryptionStrategies[process.platform](password, encryptionKey, iv);
    } else {
        return password;
    }
}

/**
 * Decrypt a password
 *
 * @param password the password to decrypt
 * @param encryptionKey the key to use to decrypt the password
 * @param iv the initialization vector to use
 * @return the decrypted password
 */
export async function decryptPassword(password: string, encryptionKey: Buffer, iv: Buffer): Promise<string> {
    if (decryptionStrategies.hasOwnProperty(process.platform)) {
        return await decryptionStrategies[process.platform](password, encryptionKey, iv);
    } else {
        return password;
    }
}