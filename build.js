// that build system is horrifying
// no deps tree ==> do not use

let { readdirSync, lstatSync } = require('fs');
let { execSync }   = require('child_process');
let { join }   = require('path');

let packagesRoot = join(__dirname, 'packages');

function buildPackage(packageName) {
    let packagePath = join(packagesRoot, packageName);

    if (lstatSync(packagePath).isDirectory()) {
        try {
            execSync('npm run-script build', { cwd: packagePath, env: process.env });
        } catch ({ stderr, status }) {
            console.log(`Error in building package "${packageName}"`);
            console.log(`Returned error code ${status}`);
            console.log(stderr ? stderr.toString() : 'No stderr');
            return false;
        }
    }

    return true;
}

if (process.argv.length > 2) {
    buildPackage(process.argv[2]);
} else { // build all
    let packages = readdirSync(packagesRoot);

    for (let packageName of packages) {
        if (!buildPackage(packageName)) break;
    };
}