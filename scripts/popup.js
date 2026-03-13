var allLinks = [];
var visibleLinks = [];
var courseName = "";

function sanitizeFilename(name) {
  // Replace invalid characters for filenames/folders
  return name.replace(/[<>:"|?*\x00-\x1f]/g, '_').replace(/\//g, '-');
}

//Display all visible links.
function showLinks() {
  var linksTableBody = document.querySelector('#links tbody');
  linksTableBody.innerHTML = '';

  for (var s = 0; s < visibleLinks.length; s++) {
    var section = visibleLinks[s];
    // Section header with checkbox
    // add spacer between sections
    if (s > 0) {
      var spacerRow = document.createElement('tr');
      spacerRow.className = 'section-spacer';
      var spacerCell = document.createElement('td');
      spacerCell.colSpan = 2;
      spacerRow.appendChild(spacerCell);
      linksTableBody.appendChild(spacerRow);
    }

    var headerRow = document.createElement('tr');
    var headerCol0 = document.createElement('td');
    var headerCol1 = document.createElement('td');
    var sectionCheckbox = document.createElement('input');
    sectionCheckbox.checked = false;
    sectionCheckbox.type = 'checkbox';
    sectionCheckbox.id = 'section_check' + s;
    sectionCheckbox.className = 'section-checkbox';
    sectionCheckbox.onchange = function(sectionIndex) {
      return function() {
        var checked = this.checked;
        var section = visibleLinks[sectionIndex];
        for (var f = 0; f < section.files.length; f++) {
          var cb = document.getElementById('check' + sectionIndex + '_' + f);
          if (cb) cb.checked = checked;
        }
      };
    }(s);
    headerCol0.appendChild(sectionCheckbox);
    headerCol0.className = 'section-checkbox-cell';
    headerCol1.innerHTML = '<strong>' + section.title + '</strong>';
    headerCol1.className = 'section-header';
    headerRow.appendChild(headerCol0);
    headerRow.appendChild(headerCol1);
    linksTableBody.appendChild(headerRow);
    // Files
    for (var f = 0; f < section.files.length; f++) {
      var row = document.createElement('tr');
      row.className = 'file-row';
      var col0 = document.createElement('td');
      var col1 = document.createElement('td');
      var checkbox = document.createElement('input');
      checkbox.checked = false;
      checkbox.type = 'checkbox';
      checkbox.id = 'check' + s + '_' + f;
      col0.appendChild(checkbox);
      col1.innerText = section.files[f].name;
      col1.style.whiteSpace = 'nowrap';
      col1.onclick = function() {
        checkbox.checked = !checkbox.checked;
      };
      row.appendChild(col0);
      row.appendChild(col1);
      linksTableBody.appendChild(row);
    }
  }
}

// Toggle the checked state of all visible links.
function toggleAll() {
 var checked = document.getElementById('toggle_all').checked;
  for (var s = 0; s < visibleLinks.length; s++) {
    var sectionCb = document.getElementById('section_check' + s);
    if (sectionCb) sectionCb.checked = checked;
    for (var f = 0; f < visibleLinks[s].files.length; f++) {
      var cb = document.getElementById('check' + s + '_' + f);
      if (cb) cb.checked = checked;
    }
  }
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
  if (message.type === "links") {
    var sections = message.data;
    courseName = message.courseName || "";
    allLinks = sections.map(section => ({
      title: section.sectionTitle,
      files: section.links.map((link, i) => ({url: link, name: section.file_names[i]}))
    })).filter(section => section.files.length > 0);
  }

  visibleLinks = allLinks;
  showLinks();
  document.getElementById('courseName').innerText = courseName;
  // hide or show buttons
  if(!visibleLinks.length)
  {
	document.getElementById('pText').innerText = "Navigate to Piazza Resources to download available files";
	document.getElementById('pText').style.display = "block";
  }
  else
  {
	document.getElementById('pText').style.display = "none";
	document.getElementById("download0").style.display = "block";
	document.getElementById("download1").style.display = "block";
  document.getElementById("toggle_all").style.display = "inline-block";
  document.getElementById("selectAllRow").style.display = "block";
  }
});

// Set up event handlers and inject send_links.js into all frames in the active tab
window.onload = function() {
  document.getElementById('download0').onclick = downloadCheckedLinks;
  document.getElementById('download1').onclick = downloadCheckedLinks;
  document.getElementById('toggle_all').onchange = toggleAll;
  chrome.windows.getCurrent(function (currentWindow) {
	  chrome.tabs.query({active: true, windowId: currentWindow.id},
                      function(activeTabs) {
      chrome.scripting.executeScript({
       target: { tabId: activeTabs[0].id,
        allFrames: true, 
      },
        files: ['scripts/send_links.js'],
        injectImmediately: true
      });    
    });
  });
};