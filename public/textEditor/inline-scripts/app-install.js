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
  const butInstall = document.getElementById('butInstallApp');
  var menuInstalls = document.getElementById('menuInstall');
  myMenus.setup(menuInstalls);
  var listInstalls = [];
  fetch('/listInstalls').then(function(response) {
    return response.json();
  }).then(function(installs) {
    console.log(installs);
    listInstalls = installs;
    for (var i = 0; i < installs.length; i++) {
      const butt = myMenus.createButton("Uninstall " + installs[i].name);
      butt.addEventListener('click', function() {
        let appName = butt.innerText.replace("Uninstall ", "");
        fetch(`/unInstallApp/${encodeURIComponent(appName)}`);
        window.location.reload();
      });
      myMenus.addElement(menuInstalls, butt);
    }
  });

  // Handle the install button click
// Handle the install button click
butInstall.addEventListener('click', async () => {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [{
      description: 'Zip files',
      accept: {
        'application/zip': ['.zip'],
      },
    }],
  });
  const file = await fileHandle.getFile();
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/installApp', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    console.error('Upload failed');
  }
  else
  {
    window.location.reload();
  }
});

  myMenus.addKeyboardShortcut(butInstall);
})(app);
