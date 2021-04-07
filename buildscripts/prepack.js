const {download} = require('./download');
const {unzip} = require('./zip');

const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

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

function runJLink(jlink_executable) {
    return new Promise((resolve, reject) => {
        const child = spawn(jlink_executable, ["--output", "jre-15", "--compress=2", "--no-header-files", "--no-man-pages",
            "--module-path", "../jmods", "--add-modules", "java.base,java.compiler,java.datatransfer,java.desktop," +
            "java.instrument,java.logging,java.management,java.management.rmi,java.naming,java.net.http,java.prefs," +
            "java.rmi,java.scripting,java.se,java.security.jgss,java.security.sasl,java.smartcardio,java.sql," +
            "java.sql.rowset,java.transaction.xa,java.xml,java.xml.crypto"
        ], {
            stdio: [process.stdin, process.stdout, process.stderr],
            cwd: TMP_DIR
        });

        // Reject/Resolve on close
        child.on('close', (code) => {
            if (code === 0) {
                console.log("jlink exited with code 0")
                resolve();
            } else {
                reject(`jlink exited with code ${code}`);
            }
        });

        // Reject on error
        child.on('error', (err) => {
            reject(`jlink failed: ${err}`);
        });
    });
}

const functions = {
    "win32": async function () {
        console.log("Creating tmp dir...");
        fs.mkdirSync(TMP_DIR);

        console.log("Downloading jdk...");
        await download("https://download.java.net/openjdk/jdk15/ri/openjdk-15+36_windows-x64_bin.zip",
            path.join(TMP_DIR, 'openjdk.zip'));

        console.log("Unpacking openjdk.zip...");
        await unzip("openjdk.zip", "openjdk", TMP_DIR);

        console.log("Running jlink...");
        await runJLink("jlink.exe");
    },
    "linux": async function () {

    }
};

async function run() {
    deleteIfExists(TMP_DIR);

    if (functions.hasOwnProperty(process.platform)) {
        await functions[process.platform]();
    } else {
        throw new Error("Unsupported platform: " + process.platform);
    }

    console.log("Replacing jvm_dll_path.json...");
    const JVM_DLL_PATH_JSON = path.join(__dirname, '..', 'node_modules', 'java', 'build', 'jvm_dll_path.json');
    //deleteIfExists(JVM_DLL_PATH_JSON);
    fs.writeFileSync(JVM_DLL_PATH_JSON, JSON.stringify(";resources\\jre-15\\bin\\server"));
    console.log("Done");
}

run().then();