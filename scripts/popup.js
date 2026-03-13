var allLinks = [];
var visibleLinks = [];
var courseName = "";
var linksMessageReceived = false;

function showMessage(message) {
  document.getElementById('pText').innerText = message;
  document.getElementById('pText').style.display = 'block';
}

function hideMessage() {
  document.getElementById('pText').style.display = 'none';
}

function hideSelectionUi() {
  document.getElementById('download0').style.display = 'none';
  document.getElementById('download1').style.display = 'none';
  document.getElementById('selectAllRow').style.display = 'none';
}

function showSelectionUi() {
  document.getElementById('download0').style.display = 'block';
  document.getElementById('download1').style.display = 'block';
  document.getElementById('selectAllRow').style.display = 'grid';
}

function sanitizeFilename(name) {
  // Replace invalid characters for filenames/folders
  return name.replace(/[<>:"|?*\x00-\x1f]/g, '_').replace(/\//g, '-');
}

function updateSectionCheckboxState(sectionIndex) {
  var section = visibleLinks[sectionIndex];
  if (!section) return;

  var sectionCheckbox = document.getElementById('section_check' + sectionIndex);
  if (!sectionCheckbox) return;

  var totalFiles = 0;
  var checkedFiles = 0;

  for (var f = 0; f < section.files.length; f++) {
    var fileCheckbox = document.getElementById('check' + sectionIndex + '_' + f);
    if (!fileCheckbox) {
      continue;
    }
    totalFiles += 1;
    if (fileCheckbox.checked) {
      checkedFiles += 1;
    }
  }

  sectionCheckbox.checked = totalFiles > 0 && checkedFiles === totalFiles;
  sectionCheckbox.indeterminate = checkedFiles > 0 && checkedFiles < totalFiles;
}

function updateToggleAllState() {
  var toggleAllCheckbox = document.getElementById('toggle_all');
  if (!toggleAllCheckbox) return;

  var totalFiles = 0;
  var checkedFiles = 0;

  for (var s = 0; s < visibleLinks.length; s++) {
    for (var f = 0; f < visibleLinks[s].files.length; f++) {
      var cb = document.getElementById('check' + s + '_' + f);
      if (!cb) {
        continue;
      }
      totalFiles += 1;
      if (cb.checked) {
        checkedFiles += 1;
      }
    }
  }

  toggleAllCheckbox.checked = totalFiles > 0 && checkedFiles === totalFiles;
  toggleAllCheckbox.indeterminate = checkedFiles > 0 && checkedFiles < totalFiles;
}

//Display all visible links.
function showLinks() {
  var linksContainer = document.getElementById('links');
  linksContainer.innerHTML = '';

  document.getElementById('toggle_all').checked = false;
  document.getElementById('toggle_all').indeterminate = false;

  for (var s = 0; s < visibleLinks.length; s++) {
    var section = visibleLinks[s];
    var sectionCard = document.createElement('div');
    sectionCard.className = 'section-card';

    var headerRow = document.createElement('div');
    headerRow.className = 'section-header-row';

    var headerLeft = document.createElement('div');
    headerLeft.className = 'section-checkbox-cell';

    var headerTitle = document.createElement('div');
    headerTitle.className = 'section-header';

    var sectionCheckbox = document.createElement('input');
    sectionCheckbox.checked = false;
    sectionCheckbox.type = 'checkbox';
    sectionCheckbox.id = 'section_check' + s;
    sectionCheckbox.className = 'section-checkbox';
    sectionCheckbox.onchange = function(sectionIndex) {
      return function() {
        this.indeterminate = false;
        var checked = this.checked;
        var section = visibleLinks[sectionIndex];
        for (var f = 0; f < section.files.length; f++) {
          var cb = document.getElementById('check' + sectionIndex + '_' + f);
          if (cb) cb.checked = checked;
        }
        updateToggleAllState();
      };
    }(s);
    headerLeft.appendChild(sectionCheckbox);
    headerTitle.innerText = section.title;
    headerRow.appendChild(headerLeft);
    headerRow.appendChild(headerTitle);
    headerRow.onclick = function(currentSectionCheckbox) {
      return function(event) {
        if (event.target && event.target.tagName === 'INPUT') {
          return;
        }
        currentSectionCheckbox.checked = !currentSectionCheckbox.checked;
        currentSectionCheckbox.dispatchEvent(new Event('change'));
      };
    }(sectionCheckbox);
    sectionCard.appendChild(headerRow);

    // Files
    for (var f = 0; f < section.files.length; f++) {
      var row = document.createElement('div');
      row.className = 'file-row';

      var col0 = document.createElement('div');
      col0.className = 'file-checkbox-cell';

      var col1 = document.createElement('div');
      col1.className = 'file-name-cell';

      var checkbox = document.createElement('input');
      checkbox.checked = false;
      checkbox.type = 'checkbox';
      checkbox.id = 'check' + s + '_' + f;
      checkbox.onchange = function(sectionIndex) {
        return function() {
          updateSectionCheckboxState(sectionIndex);
          updateToggleAllState();
        };
      }(s);

      col0.appendChild(checkbox);
      col1.innerText = section.files[f].name;
      col1.title = section.files[f].name;

      row.appendChild(col0);
      row.appendChild(col1);

      row.onclick = (function(currentCheckbox, sectionIndex) {
        return function(event) {
          if (event.target && event.target.tagName === 'INPUT') {
            return;
          }
          currentCheckbox.checked = !currentCheckbox.checked;
          updateSectionCheckboxState(sectionIndex);
          updateToggleAllState();
        };
      })(checkbox, s);

      sectionCard.appendChild(row);
    }

    linksContainer.appendChild(sectionCard);
  }

  updateToggleAllState();
}

// Toggle the checked state of all visible links.
function toggleAll() {
  var toggleAllCheckbox = document.getElementById('toggle_all');
  toggleAllCheckbox.indeterminate = false;
  var checked = toggleAllCheckbox.checked;

  for (var s = 0; s < visibleLinks.length; s++) {
    var sectionCb = document.getElementById('section_check' + s);
    if (sectionCb) {
      sectionCb.checked = checked;
      sectionCb.indeterminate = false;
    }
    for (var f = 0; f < visibleLinks[s].files.length; f++) {
      var cb = document.getElementById('check' + s + '_' + f);
      if (cb) cb.checked = checked;
    }
  }
  updateToggleAllState();
}

// Download all visible checked links.
function downloadCheckedLinks() {
  for (var s = 0; s < visibleLinks.length; s++) {
    for (var f = 0; f < visibleLinks[s].files.length; f++) {
      var cb = document.getElementById('check' + s + '_' + f);
      if (cb && cb.checked) {
        chrome.downloads.download({
          url: visibleLinks[s].files[f].url,
          filename: sanitizeFilename(courseName) + '/' + sanitizeFilename(visibleLinks[s].title) + '/' + sanitizeFilename(visibleLinks[s].files[f].name)
        }, function(id) {
        });
      }
    }
  }
  //window.close();
}

// Replace the deprecated API //send_links.js is injected into all frames of the active tab
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== "links") {
    return;
  }

  linksMessageReceived = true;
  var sections = Array.isArray(message.data) ? message.data : [];
  courseName = message.courseName || "";
  allLinks = sections.map(section => ({
    title: section.sectionTitle,
    files: section.links.map((link, i) => ({url: link, name: section.file_names[i]}))
  })).filter(section => section.files.length > 0);

  visibleLinks = allLinks;
  showLinks();
  document.getElementById('courseName').innerText = courseName;
  // hide or show buttons
  if (!visibleLinks.length) {
    hideSelectionUi();
    showMessage("No downloadable resources found on this page.");
  } else {
    hideMessage();
    showSelectionUi();
  }
});

// Set up event handlers and inject send_links.js into all frames in the active tab
window.onload = function() {
  document.getElementById('download0').onclick = downloadCheckedLinks;
  document.getElementById('download1').onclick = downloadCheckedLinks;
  document.getElementById('toggle_all').onchange = toggleAll;
  hideSelectionUi();
  showMessage("Open a Piazza Resources page to download available files.");

  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id},
                      function(activeTabs) {
      var activeTab = activeTabs && activeTabs[0] ? activeTabs[0] : null;
      var activeUrl = activeTab && activeTab.url ? activeTab.url : "";
      var isPiazza = /^https:\/\/piazza\.com\//i.test(activeUrl);
      var isResources = /\/resource/i.test(activeUrl);

      if (!isPiazza) {
        showMessage("This extension works only on Piazza. Open Piazza and then a Resources page.");
        return;
      }

      if (!isResources) {
        showMessage("You are on Piazza. Navigate to the course Resources page to list downloadable files.");
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: activeTab.id,
          allFrames: true,
        },
        files: ['scripts/send_links.js'],
        injectImmediately: true
      }, function() {
        if (chrome.runtime.lastError) {
          showMessage("Could not read this page. Refresh Piazza and open the Resources page.");
          return;
        }

        setTimeout(function() {
          if (!linksMessageReceived) {
            showMessage("Could not detect resources on this page. Make sure you are on a Piazza Resources page.");
          }
        }, 500);
      });
    });
  });
};