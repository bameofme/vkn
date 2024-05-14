const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

router.get('/file', (req, res) => {
    const filePath = req.query.path;

    // Validate filePath
    if (!filePath) {
        return res.status(400).send('Missing file path');
    }

    // Resolve the path in case it's relative
    const absolutePath = path.resolve(filePath);

    fs.readFile(absolutePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading file');
        }

        res.send(data);
    });
});

router.get('/list', (req, res) => {
    const dirPath = req.query.path;

    // Validate dirPath
    if (!dirPath) {
        return res.status(400).send('Missing directory path');
    }

    // Resolve the path in case it's relative
    const absolutePath = path.resolve(dirPath);

    fs.readdir(absolutePath, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading directory');
        }

        res.send(files);
    });
});
module.exports = router;