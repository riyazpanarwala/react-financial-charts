const fs = require("fs");
const path = require("path");

const packagesDir = path.resolve(__dirname, "packages");

// Read all packages in the workspace
const packages = fs.readdirSync(packagesDir).filter((pkg) => fs.statSync(path.join(packagesDir, pkg)).isDirectory());

// Helper to update dependencies
function updateFileDependencies(packageJsonPath, dependencyType) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const deps = packageJson[dependencyType];

    if (deps) {
        for (const [dep, version] of Object.entries(deps)) {
            if (version.startsWith("file:")) {
                const fileName = dep.split("/")[1];
                let depName = fileName;
                if (fileName === "react-financial-charts") {
                    depName = "charts";
                }
                const packagePath = path.join(packagesDir, depName);
                const packageJsonDepPath = path.join(packagePath, "package.json");
                const { version } = require(packageJsonDepPath);
                // Replace "file:" dependencies with placeholder version
                deps[dep] = "^" + version;
            }
        }
    }

    // Write updated package.json back to file
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
}

// Process each package
packages.forEach((pkg) => {
    const packageJsonPath = path.join(packagesDir, pkg, "package.json");

    if (fs.existsSync(packageJsonPath)) {
        console.log(`Updating dependencies for ${pkg}...`);
        updateFileDependencies(packageJsonPath, "dependencies");
        updateFileDependencies(packageJsonPath, "devDependencies");
        updateFileDependencies(packageJsonPath, "peerDependencies");
    }
});
