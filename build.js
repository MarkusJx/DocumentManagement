const {spawn} = require('child_process');
const path = require('path');
const {promisify} = require('util');
const hashFiles = promisify(require('hash-files'));
const fs = require('fs');

const gradle_command = process.platform === "win32" ? "gradlew.bat" : "gradlew";

class BuildCache {
    /**
     * The cache file
     * @type {string}
     * @private
     */
    static cacheFile = path.join(__dirname, 'build.cache.json');

    /**
     * Create a BuildCache instance
     *
     * @param files {string[]} the directories to check
     */
    constructor(files) {
        this.files = files;
    }

    /**
     * Write the cache
     *
     * @param data the cache to write
     * @private
     */
    static writeCache(data) {
        fs.writeFileSync(BuildCache.cacheFile, JSON.stringify(data));
    }

    /**
     * Read the cache
     *
     * @return {null|any} the parsed cache or null if the cache could not be read
     * @private
     */
    static readCache() {
        if (fs.existsSync(BuildCache.cacheFile)) {
            try {
                let result = fs.readFileSync(BuildCache.cacheFile).toString('utf-8');
                result = JSON.parse(result);

                return result;
            } catch (e) {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * Check if the whole thing should be rebuilt
     *
     * @return {Promise<boolean>} true, if the project should be rebuilt
     */
    async shouldRebuild() {
        const cache = BuildCache.readCache();
        if (cache != null && cache.hasOwnProperty("hashes")) {
            for (let i = 0; i < this.files.length; i++) {
                const cur = this.files[i];
                if (cache.hashes.hasOwnProperty(cur)) {
                    const hash = await hashFiles({files: [cur], algorithm: 'sha512'});
                    if (hash !== cache.hashes[cur]) {
                        await this.generateCache();
                        return true;
                    }
                } else {
                    await this.generateCache();
                    return true;
                }
            }

            return false;
        } else {
            await this.generateCache();
            return true;
        }
    }

    /**
     * Generate the cache
     *
     * @return {Promise<void>}
     * @private
     */
    async generateCache() {
        const cache = {
            hashes: {}
        };

        for (let i = 0; i < this.files.length; i++) {
            const cur = this.files[i];
            cache.hashes[cur] = await hashFiles({files: [cur], algorithm: 'sha512'});
        }

        BuildCache.writeCache(cache);
    }
}

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
    const buildCache = new BuildCache(["src/**", "dbLib/src/**", "main.ts", "package.json", "package-lock.json", "build.js"]);
    if (await buildCache.shouldRebuild()) {
        console.log("The cache is out of date, building...");
        console.log("Running gradlew...");
        await spawnAsync(gradle_command, ["jar"], {cwd: path.join(__dirname, "dbLib")});

        console.log();
        console.log("Running tsc...");
        await spawnAsync("tsc");
    } else {
        console.log("Files are up-to-date, not building anything");
    }

    console.log("Done.");
}

run().then();
