const {spawn} = require("child_process");

/**
 * Untar a zip file on linux/macOs
 *
 * @param filename the file to extract
 * @param out_dir the output directory
 * @param working_directory the working directory
 */
function untar(filename, out_dir, working_directory) {
    return new Promise((resolve, reject) => {
        // Use tar to unpack boost
        const tar = spawn("tar", ["xzf", filename, "-C", out_dir], {
            stdio: [process.stdin, process.stdout, process.stderr],
            cwd: working_directory
        });

        // Reject/Resolve on close
        tar.on('close', (code) => {
            if (code === 0) {
                console.log("Tar exited with code 0")
                resolve();
            } else {
                reject(`Tar exited with code ${code}`);
            }
        });

        // Reject on error
        tar.on('error', (err) => {
            reject(`Tar failed: ${err}`);
        });
    });
}

/**
 * Unpack a zip file on windows using 7zip
 *
 * @param command the command array to run
 * @param working_directory the working directory to work in
 */
function unzip_7z(command, working_directory) {
    return new Promise((resolve, reject) => {
        // Spawn a 7z process
        const tar = spawn("7z", command, {
            stdio: [process.stdin, process.stdout, process.stderr],
            cwd: working_directory
        });

        // Reject/Resolve on close
        tar.on('close', (code) => {
            if (code === 0) {
                console.log("7z exited with code 0")
                resolve();
            } else {
                reject(`7z exited with code ${code}`);
            }
        });

        // Reject on error
        tar.on('error', (err) => {
            reject(`7z failed: ${err}`);
        });
    });
}

function unzip(src, dest, working_directory) {
    return unzip_7z(['x', src, '-aoa', `-o${dest}`], working_directory);
}

module.exports.unzip = unzip;
module.exports.untar = untar;