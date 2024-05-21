const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { json } = require('express');
var listScritps = "";
var listStyles = "";

function openFile(req, res) {
    const fileName = req.params.fileName;
    console.log(fileName);
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading file');
            return;
        }
        res.send(data);
    });
}
function saveFile(req, res) {
    const fileName = req.params.fileName;
    let data = '';

    req.on('data', chunk => {
        data += chunk;
    });

    req.on('end', () => {
        fs.writeFile(fileName, data, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing file');
                return;
            }
            res.send('File saved');
        });
    });
}
function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            results.push(file);
        }
    });

    return results;
}
function installApp(req, res) {
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();
    var zipFileName = req.file.originalname.replace('.zip', '');
    var jsonData = {};

    zip.extractAllTo(/*target path*/"./public/extension/", /*overwrite*/true);

    for(let i = 0; i < zipEntries.length; i++) {
        const entry = zipEntries[i];
        if (entry.entryName.endsWith('.json')) {
            const data = fs.readFileSync("./public/extension/" + entry.entryName, 'utf8');
            jsonData = JSON.parse(data);
            console.log(jsonData);
        }
    }
    if (jsonData.js_script) {
        jsonData.js_script.forEach(script => {
            listScritps += `<script src="./extension/${zipFileName}/${script}"></script>
                            `;
            console.log(listScritps);
        });
    }
    if (jsonData.styles) {
        jsonData.styles.forEach(style => {
            listStyles += `<link rel="stylesheet" href="./extension/${zipFileName}/${style}">
                            `;
        });
    }

    res.send(jsonData.name);
}
function unInstallApp(req, res) {
    const appName = req.params.appName;
    const appPath = `./public/extension/${appName}`;
    fs.rmdirSync(appPath, { recursive: true });
    updateListApp();
    res.send('App uninstalled');
}
function updateListApp() {
    const extensionDir = './public/extension';
    const dirs = fs.readdirSync(extensionDir);
    const moduleData = [];
    listScritps = "";
    listStyles = "";

    dirs.forEach(dir => {
        const dirPath = path.join(extensionDir, dir);
        if (fs.statSync(dirPath).isDirectory()) {
            const moduleJsonPath = path.join(dirPath, 'module.json');
            if (fs.existsSync(moduleJsonPath)) {
                const moduleJson = fs.readFileSync(moduleJsonPath, 'utf8');
                const jsonData = JSON.parse(moduleJson);
                jsonData.js_script.forEach(script => {
                    listScritps += `<script src="./extension/${dir}/${script}"></script>
                                    `;
                });
                jsonData.styles.forEach(style => {
                    listStyles += `<link rel="stylesheet" href="./extension/${dir}/${style}">
                                    `;
                });
            }
        }
    });
}
function getListApp(req, res) {
    const extensionDir = './public/extension';
    const dirs = fs.readdirSync(extensionDir);
    const moduleData = [];
    dirs.forEach(dir => {
        const dirPath = path.join(extensionDir, dir);
        if (fs.statSync(dirPath).isDirectory()) {
            const moduleJsonPath = path.join(dirPath, 'module.json');
            if (fs.existsSync(moduleJsonPath)) {
                const moduleJson = fs.readFileSync(moduleJsonPath, 'utf8');
                const jsonData = JSON.parse(moduleJson);
                moduleData.push(jsonData);
            }
        }
    });
    res.send(moduleData);
}
function getlistScritps() {
    return listScritps;
}
function getlistStyles() {
    return listStyles;
}
const textEditor = {
    openFile,
    saveFile,
    getFiles,
    installApp,
    unInstallApp,
    getListApp,
    getlistScritps,
    getlistStyles
};

module.exports = textEditor;