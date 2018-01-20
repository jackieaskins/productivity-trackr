function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

function getCurrentTabTitle(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    var url = tab.title;
    console.assert(typeof url == 'string', 'tab.title should be a string');

    callback(url);
  });
}

function createPopupForm(url) {
  var title = "";
    var form = document.getElementById('form');
    if (url.charAt(url.length - 1) == '/') {
      url = url.slice(0,url.length - 1);
    }
    var splitUrl = url.split('/');
    if (url.includes('http://') || url.includes('https://')) {
      splitUrl = splitUrl.slice(2,splitUrl.length);
    }
    for (var i = 1; i <= splitUrl.length; i++) {
      if ((i < splitUrl.length - 1 && splitUrl[i] != '')|| i >= splitUrl.length - 1) {
        form.innerHTML += '<input type="radio" name="url" value="' +  splitUrl.slice(0,i).join('/') + '/*">' + splitUrl.slice(0,i).join('/') + '/*</input><br>';
      }
      
      if (i == splitUrl.length) {
        form.innerHTML += '<input type="radio" name="url" value="' +  splitUrl.slice(0,i).join('/') + '*">' + splitUrl.slice(0,i).join('/') + '*</input><br>';
      }
    }
    var submit = document.createElement('input');
    submit.setAttribute('type','submit');
    submit.setAttribute('name','submit');
   
    form.appendChild(submit);
}

function getSavedSiteInfo(url, callback) {
  chrome.storage.sync.get(url, (data) => {
    callback(chrome.runtime.lastError ? null : data[url]);
  });
}

function updateSelection(savedData) {

}

function getUrl() {
  var siteURLs = document.getElementsByName('url');
  var siteURL = '';
  for (var i = 0; i < siteURLs.length; i++) {
      if (siteURLs[i].checked) {
        siteURL = siteURLs[i].value;
      }
  }
  return siteURL;
}

function saveData() {
  var data = {};
  var url = getUrl();
  var siteName = document.getElementById('site_name').value;
  data[url] = {'name': siteName, 'timeLimit': hoursToMilliseconds(document.getElementById('timeLimit').value)};
  
  chrome.storage.sync.get('sites',function(oldData){
    if (url in oldData['sites']) {
      document.getElementById("errors").innerHTML = "You already have a time limit set for " + siteName;
    } else {
      oldData['sites'][url]=(data[url]);
      chrome.storage.sync.set(oldData, function(){
        console.log('storing');
        document.getElementById("errors").innerHTML = "Time limit saved for " + siteName;
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabTitle((title) => {
    var siteNameField = document.getElementById('site_name');
    siteNameField.setAttribute('value',title);
  });

  getCurrentTabUrl((url) => {
    createPopupForm(url);
    getSavedSiteInfo(url, (savedData) => {
      if (savedData) {
        updateSelection(savedData);
      }
    });
  });
  form.addEventListener("submit", function(e){
    e.preventDefault();
    saveData();
  });
  
  

});

function hoursToMilliseconds(timeLimit) {
  return parseFloat(timeLimit) * 60 * 60 * 1000;
}