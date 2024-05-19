const fs = require('fs');
const path = require('path');
var currentDir = "C:\\Users\\sang.nguyen\\Downloads\\temp\\";
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
function getFiles() {
    let results = [];
    const list = fs.readdirSync(currentDir);
    list.forEach(file => {
        file = path.join(currentDir, file);
        const stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            results.push(file);
        }
    });

    return results;
}
function setDir(dir) {
    currentDir = dir;
}
const textEditor = {
    openFile,
    saveFile,
    getFiles,
    setDir
};

module.exports = textEditor;