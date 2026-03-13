var sectionLinks = [];
var isResourcesPage = window.location.href.indexOf("resource") > -1;

if (isResourcesPage) {
  var sections = [].slice.apply(document.getElementsByClassName('resource-section'));
  sections.forEach(function(element) {
    var links = [];
    var sectionFileNames = [];
    var header = element.querySelector('h2');
    var sectionTitle = header ? header.innerText : "Resources";
    var anchorElements = [].slice.apply(element.getElementsByTagName('a'));

    anchorElements.forEach(function(anchor) {
      var href = anchor.href || "";
      var hashIndex = href.indexOf('#');
      if (hashIndex >= 0) {
        href = href.toLowerCase().substr(0, hashIndex);
      }

      var res = 'get_resource';
      if (res === href.substr(33, res.length)) {
        links.push(href);
        sectionFileNames.push(anchor.text);
      }
    });

    var uniqueLinks = [];
    var uniqueFileNames = [];
    for (var i = 0; i < links.length; i++) {
      if (uniqueLinks.indexOf(links[i]) === -1) {
        uniqueLinks.push(links[i]);
        uniqueFileNames.push(sectionFileNames[i]);
      }
    }

    sectionLinks.push({
      sectionTitle: sectionTitle,
      links: uniqueLinks,
      file_names: uniqueFileNames
    });
  });
}

var courseTitleElement = document.querySelector('h1.mb-1');
var courseName = courseTitleElement ? courseTitleElement.innerText : "";

chrome.runtime.sendMessage({ type: "links", data: sectionLinks, courseName: courseName });