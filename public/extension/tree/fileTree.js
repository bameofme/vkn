'use strict';

(function(app) {
    var currentDir = '';
    var listFilehandle = [];
    idbKeyval.get("isLocal").then(function(isLocal)
    {
        if (!isLocal)
        {
            idbKeyval.get('workDir').then(function(dir) {
                currentDir = dir;
                app.getListFiles(currentDir).then(showWorkDir);
            });
        }
        else
        {
            idbKeyval.get('listFilehandle').then(function(list) {
                if (list)
                {
                    showWorkDir(list);
                }
            });
        }
    })
    var tree = myMenus.addMenu('Tree')
    myMenus.setup(tree);
    var openFolder = myMenus.addMenu('File', "Open Folder");

    openFolder.addEventListener('click', function() {
        if (!app.isLocal)
        {
            app.showOpen();
            app.openCallBack = doOpenFolder;
        }
        else
        {
            app.getListFiles().then(showWorkDir);
        }
    });

    function showWorkDir(files) {
        var tree = document.getElementById('menuTree');
        myMenus.clearMenu(tree);
        myMenus.hideAll();
        if (app.isLocal)
        {
            listFilehandle = files;
            idbKeyval.set('listFilehandle', files);
        }
        for (var i = 0; i < files.length; i++) {
            let fileName
            if (app.isLocal) {
                fileName = files[i].name;
            }
            else
            {
                fileName = files[i];
            }
            let relativePath;
            if (app.isLocal)
                relativePath = fileName;
            else
                relativePath = fileName.replace(currentDir , '');

            const butt = myMenus.createButton(relativePath);
            butt.addEventListener('click', function() {
                if (app.isLocal)
                {
                    listFilehandle.forEach(function(fileHandle) {
                        if (fileHandle.name.includes(butt.innerText))
                        {
                            app.openFile(fileHandle);
                        }
                    });
                }
                else
                {
                    app.openFile(currentDir + butt.innerText);
                    console.log('Opening file: ' + butt.innerText);
                }
            });
            myMenus.addElement(tree, butt);
        }
    }
    function doOpenFolder(dir) {
        idbKeyval.set('workDir', dir);
        currentDir = dir;
        app.getListFiles(dir).then(showWorkDir);
        app.openCallBack = null;
    }

})(app);