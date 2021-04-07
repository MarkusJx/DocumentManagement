const {ProgressBar} = require('./ProgressBar');

const fs = require('fs');
const https = require('https');

/**
 * Download a file
 *
 * @param {string} url the url of the file to download
 * @param {string} filePath the output path of the file
 * @param {fs.WriteStream} file the file stream
 */
async function download(url, filePath, file = null) {
    return new Promise((resolve, reject) => {
        let fileInfo = null, closeFile = true;
        if (file == null) file = fs.createWriteStream(filePath);
        else closeFile = false;

        const request = https.get(url, response => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location != undefined) {
                if (response.headers.location.startsWith("https://")) {
                    url = response.headers.location;
                } else {
                    const addr_regex = /^https:\/\/(www\.)?[a-zA-Z0-9\.]+\.[a-z]{1,5}/;
                    url = url.match(addr_regex)[0] + response.headers.location;
                }

                console.log(`\x1b[90mRedirecting to: ${url}\x1b[0m`);

                return download(url, filePath, file).then(resolve, reject);
            } else if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }

            fileInfo = {
                mime: response.headers['content-type'],
                size: parseInt(response.headers['content-length'], 10),
            };

            const bar = new ProgressBar();
            bar.init(fileInfo.size);

            let current = 0;
            response.on('data', chunk => {
                current += chunk.length;
                bar.update(current);
                file.write(chunk);

                if (current >= fileInfo.size) {
                    console.log();
                    file.end();
                }
            });
        });

        if (closeFile) {
            // The destination stream is ended by the time it's called
            file.on('finish', () => {
                resolve(fileInfo);
            });

            file.on('error', err => {
                fs.unlink(filePath, () => reject(err));
            });
        }

        request.on('error', err => {
            fs.unlink(filePath, () => reject(err));
        });

        request.end();
    });
}

module.exports.download = download;