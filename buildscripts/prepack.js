const fs = require('fs');
const path = require('path');

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

function mergeLicenses() {
    const license_dir = path.join(__dirname, '..', 'licenses');
    const out_file = path.join(__dirname, '..', 'licenses.txt');
    deleteIfExists(out_file);

    console.log("Writing the license file");
    fs.readdirSync(license_dir).forEach(v => {
        fs.appendFileSync(out_file,
            `========== ${v.replace('.txt', '')} =============================================`);
        fs.appendFileSync(out_file, '\n\n');
        fs.appendFileSync(out_file, fs.readFileSync(path.join(license_dir, v)));
        fs.appendFileSync(out_file, '\n\n');
    });

    if (process.platform === 'darwin') {
        const dmg_license = path.join(__dirname, '..', 'build', 'license_en.txt');
        console.log("Building on macOs, writing license to:", dmg_license);
        deleteIfExists(dmg_license);
        fs.copyFileSync(out_file, dmg_license);
    }
}

async function run() {
    mergeLicenses();
}

run().then();