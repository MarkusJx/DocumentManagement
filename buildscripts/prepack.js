const {download} = require('./download');
const {unzip, untar} = require('./zip');

const fs = require('fs');
const path = require('path');

const TMP_DIR = path.join(__dirname, 'tmp');

// Source: https://stackoverflow.com/a/32197381
function deleteFolderRecursive(p) {
    if (fs.existsSync(p)) {
        fs.readdirSync(p).forEach((file) => {
            const curPath = path.join(p, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(p);
    }
}

function deleteIfExists(p) {
    if (fs.existsSync(p)) {
        if (fs.lstatSync(p).isDirectory()) {
            console.log(`Directory ${p} exists, deleting it`);
            deleteFolderRecursive(p);
        } else {
            console.log(`${p} exists, deleting it`);
            fs.unlinkSync(p);
        }
    }
}

const functions = {
    "win32": async function () {
        console.log("Creating tmp dir...");
        fs.mkdirSync(TMP_DIR);

        console.log("Downloading jre...");
        await download("https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.10%2B9/OpenJDK11U-jre_x64_windows_hotspot_11.0.10_9.zip",
            path.join(TMP_DIR, 'openjdk.zip'));

        console.log("Unpacking openjdk.zip...");
        await unzip("openjdk.zip", TMP_DIR, TMP_DIR);

        console.log("Renaming 'jdk-11.0.10+9-jre' to 'jre-11'...");
        fs.renameSync(path.join(TMP_DIR, 'jdk-11.0.10+9-jre'), path.join(TMP_DIR, 'jre-11'));
    },
    "linux": async function () {
        console.log("Downloading jre...");
        await download("https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.10%2B9/OpenJDK11U-jre_x64_linux_hotspot_11.0.10_9.tar.gz",
            path.join(TMP_DIR, 'openjdk.tar.gz'));

        console.log("Unpacking openjdk.tar.gz...");
        await untar("openjdk.tar.gz", TMP_DIR, TMP_DIR);

        console.log("Renaming 'jdk-11.0.10+9-jre' to 'jre-11'...");
        fs.renameSync(path.join(TMP_DIR, 'jdk-11.0.10+9-jre'), path.join(TMP_DIR, 'jre-11'));
    }
};

async function run() {
    deleteIfExists(TMP_DIR);

    if (functions.hasOwnProperty(process.platform)) {
        await functions[process.platform]();
    } else {
        throw new Error("Unsupported platform: " + process.platform);
    }
}

run().then();