var file_names = [];
var allLinks = [];
var sectionLinks = [];
var sections = [].slice.apply(document.getElementsByClassName('resource-section'));
sections.forEach(function(element) {
  var links = [];
  var sectionFileNames = [];
  var sectionTitle = element.querySelector('h2').innerText;
  var anchorElements = [].slice.apply(element.getElementsByTagName('a'));
  anchorElements.forEach(function(anchor) {
    if (window.location.href.indexOf("resource") > -1) {
      var href = anchor.href;
      var hashIndex = href.indexOf('#');
      if (hashIndex >= 0) {
        href = href.toLowerCase().substr(0, hashIndex);
      }
      var res = 'get_resource';
      if (res === href.substr(33, res.length)) {
        links.push(href);
        sectionFileNames.push(anchor.text);
        file_names.push(anchor.text);
      }
    }
  });

  // Remove duplicates
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

var courseName = document.querySelector('h1.mb-1').innerText;

chrome.runtime.sendMessage({ type: "links", data: sectionLinks, courseName: courseName });