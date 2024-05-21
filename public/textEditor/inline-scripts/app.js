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

/* globals getFileHandle, getNewFileHandle, readFile, verifyPermission,
           writeFile */

// eslint-disable-next-line no-redeclare
const app = {
  appName: 'Text Editor',
  file: {
    handle: null,
    name: null,
    isModified: false,
  },
  options: {
    captureTabs: true,
    fontSize: 14,
    monoSpace: false,
    wordWrap: true,
  },
  isLocal : true,
  hasFSAccess: 'chooseFileSystemEntries' in window ||
               'showOpenFilePicker' in window,
  isMac: navigator.userAgent.includes('Mac OS X'),
};

// Verify the APIs we need are supported, show a polite warning if not.
if (app.hasFSAccess) {
  document.getElementById('not-supported').classList.add('hidden');
} else {
  document.getElementById('lblLegacyFS').classList.toggle('hidden', false);
  document.getElementById('butSave').classList.toggle('hidden', true);
}

/**
 * Creates an empty notepad with no details in it.
 */

app.newFile = () => {
  if (!app.confirmDiscard()) {
    return;
  }
  app.setText();
  app.setFile();
  app.setModified(false);
  app.setFocus(true);
};


/**
 * Opens a file for reading.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to read from.
 */
app.openFile = async (fileHandle) => {
  if (!app.confirmDiscard()) {
    return;
  }
  if (app.isLocal) {
    // If the File System Access API is not supported, use the legacy file apis.
    if (!app.hasFSAccess) {
      const file = await app.getFileLegacy();
      if (file) {
        app.readFile(file);
      }
      return;
    }


    // If a fileHandle is provided, verify we have permission to read/write it,
    // otherwise, show the file open prompt and allow the user to select the file.
    if (fileHandle) {
      if (await verifyPermission(fileHandle, true) === false) {
        console.error(`User did not grant permission to '${fileHandle.name}'`);
        return;
      }
    } else {
      try {
        fileHandle = await getFileHandle();
      } catch (ex) {
        if (ex.name === 'AbortError') {
          return;
        }
        const msg = 'An error occured trying to open the file.';
        console.error(msg, ex);
        alert(msg);
      }
    }

    if (!fileHandle) {
      return;
    }
    const file = await fileHandle.getFile();
    app.readFile(file, fileHandle);
  }
  else {
    const response = await fetch(`/textEditor/${encodeURIComponent(fileHandle)}`);
    const text = await response.text();
    app.setText(text);
    app.setFile(fileHandle);
    app.setModified(false);
    app.setFocus(true);
  }
};

/**
 * Read the file from disk.
 *
 *  @param {File} file File to read from.
 *  @param {FileSystemFileHandle} fileHandle File handle to read from.
 */
app.readFile = async (file, fileHandle) => {
  try {
    app.setText(await readFile(file));
    app.setFile(fileHandle || file.name);
    app.setModified(false);
    app.setFocus(true);
  } catch (ex) {
    const msg = `An error occured reading ${app.fileName}`;
    console.error(msg, ex);
    alert(msg);
  }
};

/**
 * Saves a file to disk.
 */
app.saveFile = async () => {
  if (app.isLocal) {
    try {
      if (!app.file.handle) {
        return await app.saveFileAs();
      }
      await writeFile(app.file.handle, app.getText());
      app.setModified(false);
    } catch (ex) {
      const msg = 'Unable to save file';
      console.error(msg, ex);
      alert(msg);
    }
    app.setFocus();
  }
  else
  {
    if (!app.file.name) {
      return await app.saveFileAs();
    }
    const response = await fetch(`/textEditor/${encodeURIComponent(app.file.name)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: app.getText()
    });
    app.setModified(false);
    app.setFocus();
  }
};

/**
 * Saves a new file to disk.
 */
app.saveFileAs = async () => {
  if (!app.isLocal) {
    return app.showSave();
  }
  if (!app.hasFSAccess) {
    app.saveAsLegacy(app.file.name, app.getText());
    app.setFocus();
    return;
  }
  let fileHandle;
  try {
    fileHandle = await getNewFileHandle();
  } catch (ex) {
    if (ex.name === 'AbortError') {
      return;
    }
    const msg = 'An error occured trying to open the file.';
    console.error(msg, ex);
    alert(msg);
    return;
  }
  try {
    await writeFile(fileHandle, app.getText());
    app.setFile(fileHandle);
    app.setModified(false);
  } catch (ex) {
    const msg = 'Unable to save file.';
    console.error(msg, ex);
    alert(msg);
    return;
  }
  app.setFocus();
};

/**
 * Attempts to close the window
 */
app.quitApp = () => {
  if (!app.confirmDiscard()) {
    return;
  }
  window.close();
};
app.getListFiles = async (dir) => {
  if (app.isLocal) {
    const dirHandle = await window.showDirectoryPicker();
    const files = [];
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        files.push(entry);
      }
    }
    return files;
  }
  else {
    const response = await fetch(`/textEditor/workspace/${encodeURIComponent(dir)}`);
    const files = await response.json();
    return files;
  }
}