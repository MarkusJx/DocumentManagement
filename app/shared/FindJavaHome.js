import findJavaHome from "find-java-home";
import path from "path";
import * as fs from "fs";

/**
 * Find the java home
 *
 * @return {Promise<string>} the path to the java home
 */
function findHome() {
    return new Promise((resolve, reject) => {
        findJavaHome({allowJre: true}, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

export default async function FindJavaHome() {
    const home = await findHome();
    let libPath = 'lib';
    if (process.platform === 'win32') {
        libPath = 'bin';
    }

    let libraryName;
    if (process.platform === 'win32') {
        libraryName = "jvm.dll";
    } else if (process.platform === 'darwin') {
        libraryName = "libjvm.dylib";
    } else {
        libraryName = "libjvm.so";
    }

    const client = path.join(home, libPath, 'client', libraryName);
    const server = path.join(home, libPath, 'server', libraryName);

    if (fs.existsSync(client)) {
        return client;
    } else if (fs.existsSync(server)) {
        return server;
    } else {
        throw new Error(`Neither '${client}' nor '${server}' exists, cannot continue`);
    }
}