const {spawn} = require('child_process');
const path = require('path');

const gradle_command = process.platform === "win32" ? "gradlew.bat" : "gradlew";

function spawnAsync(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        let child;
        if (process.platform === "win32") {
            const _args = ['/c', command];
            _args.push(...args);
            child = spawn("cmd", _args, options);
        } else {
            child = spawn(command, args, options);
        }

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(code);
            }
        });
    });
}

async function run() {
    console.log("Running gradlew...");
    await spawnAsync(gradle_command, ["jar"], {cwd: path.join(__dirname, "dbLib")});

    console.log();
    console.log("Running tsc...");
    await spawnAsync("tsc");

    console.log("Done.");
}

run().then();
