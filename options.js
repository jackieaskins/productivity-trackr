function millisecondsToHours(duration) {
  return parseFloat(duration) / 3600000;
}

function hoursToMilliseconds(duration) {
  return parseFloat(duration) * 3600000;
}

function getTrackedSites(callback) {
  chrome.storage.sync.get('sites', function(data) {
    var sites = data.sites || {};
    callback(sites);
  });
}

function removeSite(e, site) {
  e.preventDefault();

  getTrackedSites(function(sites) {
    delete sites[site];
    chrome.storage.sync.set({ 'sites': sites }, function() {
      updateTrackedSitesList();
    });
  });
}

function updateTrackedSitesList() {
  var trackedSites = document.getElementById('tracked_sites');
  trackedSites.innerHTML = '';
  getTrackedSites(function(sites) {
    var forms = [];
    Object.keys(sites).forEach(function(site) {
      trackedSites.innerHTML += (
        "<tr><td>" + sites[site]['name'] + "</td><td>" + site + "</td><td>" + millisecondsToHours(sites[site]['timeLimit']) + ' hours</td><td><button value="' + site + '" id="delete_' + site + '">Remove</button></td></tr>'
      )
    });
    Object.keys(sites).forEach(function(site) {
      var button = document.getElementById('delete_' + site);
      button.addEventListener('click', function(event) {
        removeSite(event, button.value);
      });
    });
  });
}

function addSite(e) {
  e.preventDefault();
  var errorMessages = document.getElementById('error_messages');
  errorMessages.innerHtml = '';

  var addSiteButton = document.getElementById('add_site');
  addSiteButton.disabled = true;

  var siteNameInput = document.getElementById('site_name');
  var siteName = siteNameInput.value;
  var siteURLInput = document.getElementById('site_url');
  var siteURL = siteURLInput.value;
  var timeLimitInput = document.getElementById('time_limit');
  var timeLimit = timeLimitInput.value;

  if (parseFloat(timeLimit) > 24) {
    errorMessages.innerHTML += 'Time limit must be less than 24 hours.';
    addSiteButton.disabled = false;
    return;
  }

  if (siteName !== '' && siteURL !== '' && timeLimit !== '') {
    getTrackedSites(function(sites) {
      if (siteURL in sites) {
        errorMessages.innerHTML += 'You already have a time limit set for this URL.';
        return;
      }
      sites[siteURL] = { 'name': siteName, 'timeLimit': hoursToMilliseconds(timeLimit) };
      chrome.storage.sync.set({ 'sites': sites }, function() {
        if (chrome.runtime.lastError) {
          errorMessages.innerHTML += 'There was an error adding your time limit. Please try again.';
          return;
        }
        document.getElementById('success').innerHTML = 'You successfully added a time limit for ' + siteURL;
        siteNameInput.value = '';
        siteURLInput.value = '';
        timeLimitInput.value = '';
        updateTrackedSitesList();
      });
    });
  }

  addSiteButton.disabled = false;
}

document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('add_site_form').addEventListener('submit', function(event) { addSite(event) });
  updateTrackedSitesList();
});
