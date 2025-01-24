const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const packagesDir = path.resolve(__dirname, "packages");

// Get all packages in the workspace
const packages = fs.readdirSync(packagesDir).filter((pkg) => fs.statSync(path.join(packagesDir, pkg)).isDirectory());

function checkVersionExists(packageName, version) {
    try {
        execSync(`npm view ${packageName}@${version}`, { stdio: "pipe" });
        console.log(`✅ ${packageName}@${version} exists on npm.`);
        return true;
    } catch {
        console.log(`❌ ${packageName}@${version} does not exist on npm.`);
        return false;
    }
}

packages.forEach((pkg) => {
    const packagePath = path.join(packagesDir, pkg);
    const packageJsonPath = path.join(packagePath, "package.json");

    if (fs.existsSync(packageJsonPath)) {
        const { name, version, private: isPrivate } = require(packageJsonPath);

        if (!isPrivate) {
            if (!checkVersionExists(name, version)) {
                console.log(`Publishing ${name}@${version}...`);
                try {
                    // Build the package if a build script exists
                    if (fs.existsSync(path.join(packagePath, "build"))) {
                        execSync("npm run build", { cwd: packagePath, stdio: "inherit" });
                    }

                    // Publish the package
                    execSync("npm publish --access public", {
                        cwd: packagePath,
                        stdio: "inherit",
                    });
                    console.log(`✅ Successfully published ${name}@${version}`);
                } catch (err) {
                    console.error(`❌ Failed to publish ${name}:`, err.message);
                }
            }
        }
    }
});
