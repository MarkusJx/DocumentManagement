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
     * @param key {string} the key of this cache
     */
    constructor(files, key) {
        this.files = files;
        this.key = key;
    }

    /**
     * Write the cache
     *
     * @param data the cache to write
     * @private
     */
    static writeCache(data) {
        fs.writeFileSync(BuildCache.cacheFile, JSON.stringify(data, null, 4));
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
        if (cache != null && cache.hasOwnProperty(this.key) && cache[this.key] != null && cache[this.key].hasOwnProperty("hashes")) {
            for (let i = 0; i < this.files.length; i++) {
                const cur = this.files[i];
                if (cache[this.key].hashes.hasOwnProperty(cur)) {
                    const hash = await hashFiles({files: [cur], algorithm: 'sha512'});
                    if (hash !== cache[this.key].hashes[cur]) {
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
     * Call this when the build failed
     */
    buildFailed() {
        const cache = BuildCache.readCache();
        if (cache != null && cache.hasOwnProperty(this.key)) {
            cache[this.key] = null;
        }

        BuildCache.writeCache(cache);
    }

    /**
     * Generate the cache
     *
     * @return {Promise<void>}
     * @private
     */
    async generateCache() {
        const retrieved = await BuildCache.readCache();
        const cache = retrieved != null ? retrieved : {};
        cache[this.key] = {hashes: {}};

        for (let i = 0; i < this.files.length; i++) {
            const cur = this.files[i];
            cache[this.key].hashes[cur] = await hashFiles({files: [cur], algorithm: 'sha512'});
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
    process.chdir(path.join(__dirname, '..'));

    const buildCache = new BuildCache(["package.json", "package-lock.json", "build.js"], "general");
    const gradleCache = new BuildCache(["dbLib/src/**", "dbLib/build.gradle"], "gradle");
    const tscCache = new BuildCache(["app/preload/**", "app/main.ts", "tsconfig.json"], "tsc")
    const scssCache = new BuildCache(["app/styles/**"], "scss");

    const buildCache_build = await buildCache.shouldRebuild();
    const gradleCache_build = await gradleCache.shouldRebuild();
    const tscCache_build = await tscCache.shouldRebuild();
    const scssCache_build = await scssCache.shouldRebuild();

    if (buildCache_build) {
        console.log("The build cache is out of date, building everything");
    } else {
        console.log("The build cache is up-to-date");
    }

    if (buildCache_build || gradleCache_build) {
        console.log("The gradle cache is out of date, running gradlew...");
        try {
            await spawnAsync(gradle_command, ["jar"], {
                cwd: path.join(__dirname, '..', "dbLib")
            });
        } catch (e) {
            gradleCache.buildFailed();
            throw e;
        }
    } else {
        console.log("The gradle cache is up-to-date, not building");
    }

    if (buildCache_build || tscCache_build) {
        console.log("The typescript cache is out of date, running tsc...")
        try {
            await spawnAsync("tsc");
        } catch (e) {
            tscCache.buildFailed();
            throw e;
        }
    } else {
        console.log("The typescript cache is up-to-date, not building");
    }

    if (buildCache_build || scssCache_build) {
        console.log("The scss cache is out of date, running sass");
        try {
            await spawnAsync("sass", [
                "app/styles:out/styles",
                `--load-path=${path.join(__dirname, '..', 'node_modules')}`,
                `--load-path=${path.join(__dirname, '..')}`,
                "--update",
                "--style",
                "compressed"
            ]);
        } catch (e) {
            scssCache.buildFailed();
            throw e;
        }
    } else {
        console.log("The scss cache is up-to-date, not building");
    }

    console.log("Done.");
}

run().then();
