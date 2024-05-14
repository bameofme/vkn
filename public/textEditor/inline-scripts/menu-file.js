/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

(function(app) {
  const menuFile = document.getElementById('menuFile');
  myMenus.setup(menuFile);
  document.getElementById('cancel').addEventListener('click', function() {
    document.getElementById('filePathModal').style.display = 'none';
  });
  document.getElementById('butNew').addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.newFile();
  });

  document.getElementById('butOpen').addEventListener('click', () => {
    myMenus.hide(menuFile);
    document.getElementById('filePathModal').style.display = 'block';
    // app.openFile();
  });

  document.getElementById('butSave').addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.saveFile();
  });

  document.getElementById('butSaveAs').addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.saveFileAs();
  });

  document.getElementById('butClose').addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.quitApp();
  });

  document.getElementById('butSetLocal').addEventListener('click', () => {
    myMenus.hide(menuFile);
    if (app.isLocal) {
      document.getElementById('butSetLocal').innerText = 'Set Local Editor';
      app.isLocal = false;
    }
    else {
      document.getElementById('butSetLocal').innerText = 'Set Remote Editor';
      app.isLocal = true;
    }
  });
})(app);
