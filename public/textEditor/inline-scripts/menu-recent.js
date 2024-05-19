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

/* global idbKeyval */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

(function(app) {
  const menuRecent = document.getElementById('menuRecent');
  myMenus.setup(menuRecent);

  let recentFiles = [];

  /**
   * Adds a new item to the list of recent files.
   *
   * @param {FileSystemFileHandle} fileHandle File handle to add.
   */
  app.addRecent = async function(fileHandle) {
    // If isSameEntry isn't available, we can't store the file handle
    let file = {};

    if (app.isLocal) {
      if (!fileHandle.isSameEntry) {
        console.warn('Saving of recents is unavailable.');
        return;
      }

      // Loop through the list of recent files and make sure the file we're
      // adding isn't already there. This is gross.
      const inList = await Promise.all(recentFiles.map((f) => {
        return fileHandle.isSameEntry(f);
      }));
      if (inList.some((val) => val)) {
        return;
      }
    }
    else
    {
      file.name = fileHandle;
      for (let i = 0; i < recentFiles.length; i++)
      {
        if (recentFiles[i].name === file.name)
          return;
      }
    }
      
    // Add the new file handle to the top of the list, and remove any old ones.
    if (app.isLocal)
      recentFiles.unshift(fileHandle);
    else
      recentFiles.unshift(file);
    if (recentFiles.length > 5) {
      recentFiles.pop();
    }

    // Update the list of menu items.
    refreshRecents();

    // Save the list of recent files.
    if (app.isLocal)
      idbKeyval.set('recentFiles', recentFiles);
    else
      idbKeyval.set('recentFilesRemote', recentFiles);
  };

  /**
   * Refresh the list of files in the menu.
   */
  async function refreshRecents() {
    // Clear the existing menu.
    myMenus.clearMenu(menuRecent);

    // If there are no recents, don't draw anything.
    if (recentFiles.length === 0) {
      return;
    }

    // Loop through the list of recent files and add a button for each.
    recentFiles.forEach((recent) => {
      if (!app.isLocal)
      {
        if (!(recent.name === undefined || recent.name === null || recent.name === ''))
        {
          let index = recent.name.lastIndexOf('/');
          if (index === -1)
            index = recent.name.lastIndexOf('\\');
  
          let name = recent.name.slice(index + 1, recent.name.length);
          const butt = myMenus.createButton(name);
          butt.addEventListener('click', (e) => {
            myMenus.hide(menuRecent);
            app.openFile(recent.name);
          });
          myMenus.addElement(menuRecent, butt);
        }
      }
      else
      {        
        const butt = myMenus.createButton(recent.name);
        butt.addEventListener('click', (e) => {
          myMenus.hide(menuRecent);
          app.openFile(recent);
        });
        myMenus.addElement(menuRecent, butt);
      }
    });

    // Add a button to clear the list of recent items.
    addClearButton();
  }

  /**
   * Adds a clear button to the menu that clears the list of most recent items.
   */
  function addClearButton() {
    const clearButt = myMenus.createButton('Clear');
    clearButt.addEventListener('click', () => {
      myMenus.clearMenu(menuRecent);
      recentFiles = [];
      idbKeyval.clear();
      app.setFocus();
    });
    myMenus.addElement(menuRecent, clearButt);
  }

  /**
   * Initializes the recents menu.
   */
  async function init() {
    if (app.isLocal) {
      recentFiles = await idbKeyval.get('recentFiles') || [];
    }
    else
      recentFiles = await idbKeyval.get('recentFilesRemote') || [];
    refreshRecents();
  }
  async function initAppLocal(){
    app.isLocal = await idbKeyval.get('isLocal');
    if (!app.isLocal)
    {
        document.getElementById('butSetLocal').innerText = 'Set Local Editor';
    }
    else
    {
        document.getElementById('butSetLocal').innerText = 'Set Remote Editor';
    }
    init();
  }

  initAppLocal();
})(app);
